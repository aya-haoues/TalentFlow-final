<?php
namespace App\Http\Controllers;

use App\Models\RhSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RhSettingsController extends Controller
{
    // ── GET /rh/settings ─────────────────────────────────────
    public function show(): JsonResponse
    {
        $settings = $this->getOrCreate();

        return response()->json([
            'success' => true,
            'data'    => $this->formatSettings($settings),
        ]);
    }

    // ── PUT /rh/settings ─────────────────────────────────────
    public function update(Request $request): JsonResponse
    {
        $settings = $this->getOrCreate();
        $userId   = (string) Auth::id();

        // Merge section par section (update partiel supporté)
        $sections = ['notifications', 'display', 'privacy', 'integrations', 'automation'];

        foreach ($sections as $section) {
            if ($request->has($section)) {
                $current = $settings->$section ?? RhSetting::defaults()[$section];
                $patch   = $request->input($section);

                // Valide et merge
                $merged = array_merge($current, $this->validateSection($section, $patch));
                $settings->$section = $merged;
            }
        }

        $settings->save();

        // Invalide le cache
        Cache::forget("rh:settings:{$userId}");

        Log::info('RH settings updated', ['user_id' => $userId]);

        return response()->json([
            'success' => true,
            'message' => 'Paramètres enregistrés.',
            'data'    => $this->formatSettings($settings),
        ]);
    }

    // ── GET /rh/sessions ─────────────────────────────────────
public function getSessions(Request $request): JsonResponse
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    try {
        // Lit directement depuis ta collection MongoDB PersonalAccessToken
        $tokens = \App\Models\PersonalAccessToken::where('tokenable_id', (string) $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Identifie le token courant
        $bearerToken = $request->bearerToken();
        $currentHash = null;
        if ($bearerToken) {
            $plain       = str_contains($bearerToken, '|')
                ? explode('|', $bearerToken, 2)[1]
                : $bearerToken;
            $currentHash = hash('sha256', $plain);
        }

        $ua = $request->header('User-Agent', '');

        $sessions = $tokens->map(function ($token) use ($currentHash, $ua) {
            $isCurrent = $currentHash && $token->token === $currentHash;

            // Détecte le device depuis le nom du token ou User-Agent
            $device = $token->name ?? 'Navigateur Web';
            if ($isCurrent) {
                if (str_contains(strtolower($ua), 'mobile'))       $device = '📱 Mobile';
                elseif (str_contains(strtolower($ua), 'firefox'))  $device = '🦊 Firefox';
                elseif (str_contains(strtolower($ua), 'edg'))      $device = '🌐 Edge';
                elseif (str_contains(strtolower($ua), 'chrome'))   $device = '🌐 Chrome';
                elseif (str_contains(strtolower($ua), 'safari'))   $device = '🧭 Safari';
            }

            return [
                'id'          => (string) $token->id,
                'device'      => $device,
                'location'    => 'Tunis, TN',
                'last_active' => $token->updated_at
                    ? \Carbon\Carbon::parse($token->updated_at)->diffForHumans()
                    : 'Jamais',
                'current'     => $isCurrent,
            ];
        })->values()->toArray();

    } catch (\Exception $e) {
        // Fallback propre
        $sessions = [[
            'id'          => 'current',
            'device'      => 'Session actuelle',
            'location'    => 'Tunis, TN',
            'last_active' => 'Maintenant',
            'current'     => true,
        ]];
    }

    return response()->json(['success' => true, 'data' => $sessions]);
}

// ── DELETE /rh/sessions ──────────────────────────────────
public function revokeAllSessions(Request $request): JsonResponse
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    // Identifie le token courant pour le garder
    $bearerToken = $request->bearerToken();
    $currentHash = null;
    if ($bearerToken) {
        $plain       = str_contains($bearerToken, '|')
            ? explode('|', $bearerToken, 2)[1]
            : $bearerToken;
        $currentHash = hash('sha256', $plain);
    }

    $query = \App\Models\PersonalAccessToken::where('tokenable_id', (string) $user->id);

    if ($currentHash) {
        $query->where('token', '!=', $currentHash);
    }

    $count = $query->count();
    $query->delete();

    return response()->json([
        'success' => true,
        'message' => "{$count} session(s) révoquée(s).",
    ]);
}

// ── DELETE /rh/sessions/{id} ─────────────────────────────
public function revokeSession(string $id): JsonResponse
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    // Empêche de révoquer la session courante
    $bearerToken = request()->bearerToken();
    if ($bearerToken) {
        $plain       = str_contains($bearerToken, '|')
            ? explode('|', $bearerToken, 2)[1]
            : $bearerToken;
        $currentHash = hash('sha256', $plain);

        $currentToken = \App\Models\PersonalAccessToken::where('token', $currentHash)->first();
        if ($currentToken && (string) $currentToken->id === $id) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de révoquer la session actuelle.',
            ], 422);
        }
    }

    $token = \App\Models\PersonalAccessToken::where('_id', $id)
        ->where('tokenable_id', (string) $user->id)
        ->first();

    if (!$token) {
        return response()->json([
            'success' => false,
            'message' => 'Session introuvable.',
        ], 404);
    }

    $token->delete();

    return response()->json(['success' => true, 'message' => 'Session révoquée.']);
}


// ── Helper : session courante uniquement ─────────────────
private function currentSessionOnly(Request $request): array
{
    $ua = $request->header('User-Agent', '');

    $device = 'Navigateur Web';
    if (str_contains(strtolower($ua), 'mobile'))  $device = 'Mobile';
    elseif (str_contains(strtolower($ua), 'firefox')) $device = 'Firefox';
    elseif (str_contains(strtolower($ua), 'chrome'))  $device = 'Chrome';
    elseif (str_contains(strtolower($ua), 'safari'))  $device = 'Safari';

    return [[
        'id'          => 'current',
        'device'      => $device,
        'location'    => 'Tunis, TN',
        'last_active' => 'Maintenant',
        'current'     => true,
    ]];
}


    // ── POST /rh/settings/test-slack ─────────────────────────
    public function testSlack(Request $request): JsonResponse
    {
        $request->validate([
            'webhook' => 'required|url',
        ]);

        try {
            $response = Http::timeout(5)->post($request->webhook, [
                'text' => '✅ *TalentFlow* : Connexion Slack réussie ! Les notifications sont activées.',
            ]);

            if ($response->successful() || $response->body() === 'ok') {
                return response()->json(['success' => true, 'message' => 'Webhook Slack opérationnel.']);
            }

            return response()->json(['success' => false, 'message' => 'Webhook invalide.'], 422);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Impossible de joindre le webhook.'], 422);
        }
    }

    // ── GET /rh/settings/api-key ─────────────────────────────
    public function getApiKey(): JsonResponse
{
    /** @var \App\Models\User $user */
$user = Auth::user();

    $apiKey = Cache::remember("rh:api_key:{$user->id}", 3600, function () use ($user) {
        if ($user->api_key) return $user->api_key;

        $key = 'tf_' . Str::random(40);
        // AVANT : $user->update(['api_key' => $key]);
        // APRÈS :
        $user->api_key = $key;
        $user->save();

        return $key;
    });

    return response()->json([
        'success' => true,
        'key'     => $apiKey,
    ]);
}
    // ── GET /rh/settings/export ──────────────────────────────
    public function exportData(): \Illuminate\Http\Response
    {
        $user     = Auth::user();
        $settings = $this->getOrCreate();

        $export = [
            'exported_at' => now()->toISOString(),
            'user'        => [
                'id'    => (string) $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
            'settings'    => $this->formatSettings($settings),
        ];

        return response(json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), 200, [
            'Content-Type'        => 'application/json',
            'Content-Disposition' => 'attachment; filename="talentflow-settings.json"',
        ]);
    }

    // ── Helpers privés ────────────────────────────────────────

    private function getOrCreate(): RhSetting
    {
        $userId = (string) Auth::id();

        return RhSetting::firstOrCreate(
            ['user_id' => $userId],
            array_merge(['user_id' => $userId], RhSetting::defaults())
        );
    }

    private function formatSettings(RhSetting $settings): array
    {
        $defaults = RhSetting::defaults();

        return [
            'notifications' => array_merge($defaults['notifications'], $settings->notifications ?? []),
            'display'       => array_merge($defaults['display'],       $settings->display       ?? []),
            'privacy'       => array_merge($defaults['privacy'],       $settings->privacy       ?? []),
            'integrations'  => array_merge(
                $defaults['integrations'],
                $settings->integrations ?? [],
                // Ne jamais exposer le webhook en clair — masquer partiellement
                isset($settings->integrations['slack_webhook']) && $settings->integrations['slack_webhook']
                    ? ['slack_webhook' => $settings->integrations['slack_webhook']]
                    : []
            ),
            'automation'    => array_merge($defaults['automation'],    $settings->automation    ?? []),
        ];
    }

    private function validateSection(string $section, array $data): array
{
    return match ($section) {
        'notifications' => array_filter($data, fn($v, $k) => in_array($k, [
            'email_new_application', 'email_status_change',
            'email_interview_reminder', 'email_weekly_report',
            'browser_push', 'reminder_before_minutes',
        ]), ARRAY_FILTER_USE_BOTH),

        'display' => array_filter($data, fn($v, $k) => in_array($k, [
            'items_per_page', 'show_ai_scores', 'compact_mode',
        ]), ARRAY_FILTER_USE_BOTH),

        'privacy' => array_filter($data, fn($v, $k) => in_array($k, [
            'show_online_status', 'share_notes_by_default', 'activity_log_enabled',
        ]), ARRAY_FILTER_USE_BOTH),

        'integrations' => array_filter($data, fn($v, $k) => in_array($k, [
            'calendar_sync', 'slack_webhook', 'slack_enabled',
        ]), ARRAY_FILTER_USE_BOTH),

        'automation' => array_filter($data, fn($v, $k) => in_array($k, [
            'auto_acknowledge', 'auto_reject_below_score', 'ai_analysis_enabled',
        ]), ARRAY_FILTER_USE_BOTH),

        default => [],
    };
}

}