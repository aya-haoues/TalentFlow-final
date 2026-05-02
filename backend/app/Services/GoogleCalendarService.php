<?php
namespace App\Services;

use App\Models\GoogleToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleCalendarService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;
    private string $baseUrl = 'https://www.googleapis.com/calendar/v3';

    public function __construct()
    {
        $this->clientId     = config('services.google.client_id');
        $this->clientSecret = config('services.google.client_secret');
        $this->redirectUri  = config('services.google.calendar_redirect');
    }

    // ── 1. Générer l'URL d'autorisation OAuth ─────────────────
    public function getAuthUrl(string $userId): string
    {
        // ✅ FIX : base64 standard génère +, /, = qui cassent les URLs
        // base64url (RFC 4648) : +→-  /→_  padding= supprimé
        $payload = json_encode(['user_id' => $userId]);
        $state   = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');

        Log::info('getAuthUrl: state généré', [
            'user_id' => $userId,
            'state'   => $state,
        ]);

        $params = http_build_query([
            'client_id'     => $this->clientId,
            'redirect_uri'  => $this->redirectUri,
            'response_type' => 'code',
            'scope'         => 'https://www.googleapis.com/auth/calendar.events',
            'access_type'   => 'offline',
            'prompt'        => 'consent',
            'state'         => $state,
        ]);

        return "https://accounts.google.com/o/oauth2/v2/auth?{$params}";
    }

    // ── 2. Échanger le code contre les tokens ─────────────────
    public function exchangeCode(string $code, string $userId): bool
    {
        $response = Http::post('https://oauth2.googleapis.com/token', [
            'code'          => $code,
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri'  => $this->redirectUri,
            'grant_type'    => 'authorization_code',
        ]);

        if (!$response->successful()) {
            Log::error('Google OAuth exchange failed', [
                'status'   => $response->status(),
                'response' => $response->json(),
                'user_id'  => $userId,
            ]);
            return false;
        }

        $data = $response->json();

        Log::info('Google OAuth exchange success', [
            'user_id'           => $userId,
            'has_access_token'  => !empty($data['access_token']),
            'has_refresh_token' => !empty($data['refresh_token']),
            'expires_in'        => $data['expires_in'] ?? null,
        ]);

        // ✅ FIX : conserver l'ancien refresh_token si Google n'en renvoie pas
        // Google ne renvoie refresh_token QUE lors du premier consentement
        $existing     = GoogleToken::where('user_id', $userId)->first();
        $refreshToken = $data['refresh_token']
            ?? $existing?->refresh_token
            ?? null;

        if (!$refreshToken) {
            Log::warning('Google OAuth: refresh_token absent — token expirera sans renouvellement', [
                'user_id' => $userId,
            ]);
        }

        GoogleToken::updateOrCreate(
            ['user_id' => $userId],
            [
                'access_token'  => $data['access_token'],
                'refresh_token' => $refreshToken,
                'expires_at'    => now()->addSeconds(($data['expires_in'] ?? 3600) - 60),
                'scope'         => $data['scope'] ?? '',
                'calendar_id'   => 'primary',
            ]
        );

        $saved = GoogleToken::where('user_id', $userId)->exists();
        Log::info('Google OAuth: token en base', ['user_id' => $userId, 'saved' => $saved]);

        return $saved;
    }

    // ── 3. Rafraîchir le token si expiré ──────────────────────
    public function refreshTokenIfNeeded(GoogleToken $token): bool
    {
        if (!$token->isExpired()) return true;

        if (!$token->refresh_token) {
            Log::error('Google refresh_token manquant — reconnexion requise', [
                'user_id' => $token->user_id,
            ]);
            return false;
        }

        $response = Http::post('https://oauth2.googleapis.com/token', [
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $token->refresh_token,
            'grant_type'    => 'refresh_token',
        ]);

        if (!$response->successful()) {
            Log::error('Google token refresh failed', [
                'status'   => $response->status(),
                'response' => $response->json(),
                'user_id'  => $token->user_id,
            ]);
            return false;
        }

        $data = $response->json();

        $token->access_token = $data['access_token'];
        $token->expires_at   = now()->addSeconds(($data['expires_in'] ?? 3600) - 60);
        $token->save();

        Log::info('Google token rafraîchi', ['user_id' => $token->user_id]);

        return true;
    }

    // ── 4. Créer un événement Google Calendar ─────────────────
    public function createEvent(string $userId, array $eventData): ?string
    {
        $token = GoogleToken::where('user_id', $userId)->first();

        if (!$token) {
            Log::warning('createEvent: GoogleToken introuvable', ['user_id' => $userId]);
            return null;
        }

        if (!$this->refreshTokenIfNeeded($token)) {
            Log::error('createEvent: impossible de rafraîchir le token', ['user_id' => $userId]);
            return null;
        }

        // ✅ FIX : conferenceDataVersion=1 obligatoire si conferenceData présent
        $request = Http::withToken($token->access_token);
        if (isset($eventData['conferenceData'])) {
            $request = $request->withQueryParameters(['conferenceDataVersion' => '1']);
        }

        $response = $request->post(
            "{$this->baseUrl}/calendars/{$token->calendar_id}/events",
            $eventData
        );

        if (!$response->successful()) {
            Log::error('Google Calendar createEvent failed', [
                'status'   => $response->status(),
                'response' => $response->json(),
                'user_id'  => $userId,
            ]);
            return null;
        }

        $event = $response->json();
        Log::info('Google Calendar event créé', [
            'event_id' => $event['id'] ?? null,
            'user_id'  => $userId,
        ]);

        return $event['id'] ?? null;
    }

    // ── 5. Supprimer un événement ─────────────────────────────
    public function deleteEvent(string $userId, string $googleEventId): bool
    {
        $token = GoogleToken::where('user_id', $userId)->first();
        if (!$token || !$this->refreshTokenIfNeeded($token)) return false;

        $response = Http::withToken($token->access_token)
            ->delete("{$this->baseUrl}/calendars/{$token->calendar_id}/events/{$googleEventId}");

        return $response->successful() || $response->status() === 404;
    }

    // ── 6. Mettre à jour un événement ─────────────────────────
    public function updateEvent(string $userId, string $googleEventId, array $eventData): bool
    {
        $token = GoogleToken::where('user_id', $userId)->first();
        if (!$token || !$this->refreshTokenIfNeeded($token)) return false;

        $request = Http::withToken($token->access_token);
        if (isset($eventData['conferenceData'])) {
            $request = $request->withQueryParameters(['conferenceDataVersion' => '1']);
        }

        $response = $request->patch(
            "{$this->baseUrl}/calendars/{$token->calendar_id}/events/{$googleEventId}",
            $eventData
        );

        if (!$response->successful()) {
            Log::error('Google Calendar updateEvent failed', [
                'status'          => $response->status(),
                'response'        => $response->json(),
                'google_event_id' => $googleEventId,
            ]);
            return false;
        }

        return true;
    }

    // ── 7. Vérifier si connecté ───────────────────────────────
    public function isConnected(string $userId): bool
    {
        return GoogleToken::where('user_id', $userId)->exists();
    }

    // ── 8. Construire l'event data pour un entretien ──────────
    public function buildInterviewEvent(
        string  $candidateName,
        string  $candidateEmail,
        string  $jobTitle,
        string  $type,
        string  $date,
        string  $time,
        int     $durationMinutes,
        ?string $location,
        ?string $meetingUrl,
        ?string $note,
        array   $participants = [],
    ): array {
        $typeLabels = [
            'telephonique' => '📞 Téléphonique',
            'visio'        => '💻 Visioconférence',
            'presentiel'   => '🏢 Présentiel',
            'technique'    => '⚙️ Test Technique',
        ];

        $typeLabel = $typeLabels[$type] ?? $type;
        $start     = \Carbon\Carbon::parse("{$date} {$time}")->toRfc3339String();
        $end       = \Carbon\Carbon::parse("{$date} {$time}")->addMinutes($durationMinutes)->toRfc3339String();

        $description  = "👤 Candidat : {$candidateName}\n";
        $description .= "📋 Poste : {$jobTitle}\n";
        $description .= "⏱ Durée : {$durationMinutes} min\n";
        if ($meetingUrl) $description .= "🔗 Lien : {$meetingUrl}\n";
        if ($note)       $description .= "\n📝 Note : {$note}";

        $attendees = [
            ['email' => $candidateEmail, 'displayName' => $candidateName],
        ];
        foreach ($participants as $p) {
            if (!empty($p['email'])) {
                $attendees[] = ['email' => $p['email'], 'displayName' => $p['name'] ?? ''];
            }
        }

        $event = [
            'summary'     => "{$typeLabel} — {$candidateName} ({$jobTitle})",
            'description' => $description,
            'start'       => ['dateTime' => $start, 'timeZone' => 'Africa/Tunis'],
            'end'         => ['dateTime' => $end,   'timeZone' => 'Africa/Tunis'],
            'attendees'   => $attendees,
            'reminders'   => [
                'useDefault' => false,
                'overrides'  => [
                    ['method' => 'email', 'minutes' => 60],
                    ['method' => 'popup', 'minutes' => 15],
                ],
            ],
            'colorId' => match($type) {
                'telephonique' => '9',
                'visio'        => '3',
                'presentiel'   => '2',
                'technique'    => '5',
                default        => '1',
            },
        ];

        if ($location) {
            $event['location'] = $location;
        }

        // conferenceData uniquement pour les liens Google Meet
        if ($meetingUrl && str_contains($meetingUrl, 'meet.google')) {
            $event['conferenceData'] = [
                'entryPoints' => [[
                    'entryPointType' => 'video',
                    'uri'            => $meetingUrl,
                    'label'          => 'Rejoindre la réunion',
                ]],
            ];
        }

        return $event;
    }
}
