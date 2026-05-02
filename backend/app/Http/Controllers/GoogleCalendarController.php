<?php
namespace App\Http\Controllers;

use App\Models\GoogleToken;
use App\Services\GoogleCalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GoogleCalendarController extends Controller
{
    public function __construct(
        private GoogleCalendarService $calendar
    ) {}

    // ── GET /rh/google/calendar/auth-url ──────────────────────
    public function getAuthUrl(): JsonResponse
    {
        // ✅ Cast explicite en string — User::getKey() retourne un ObjectId
        // qui peut se comporter différemment selon le contexte de sérialisation
        $userId  = (string) Auth::id();
        $authUrl = $this->calendar->getAuthUrl($userId);

        return response()->json([
            'success'   => true,
            'auth_url'  => $authUrl,
            'connected' => $this->calendar->isConnected($userId),
        ]);
    }

    // ── GET /api/auth/google/calendar/callback ─────────────────
    public function handleCallback(Request $request)
    {
        $code  = $request->query('code');
        $state = $request->query('state');
        $error = $request->query('error');

        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        Log::info('Google Calendar callback reçu', [
            'has_code'  => !empty($code),
            'has_state' => !empty($state),
            'error'     => $error,
        ]);

        // Refus utilisateur (cliqué "Annuler" sur la page Google)
        if ($error) {
            Log::warning('Google OAuth refusé', ['error' => $error]);
            return redirect("{$frontendUrl}/rh/settings/integrations?calendar=error&reason={$error}");
        }

        if (!$code) {
            Log::error('Google callback: code absent');
            return redirect("{$frontendUrl}/rh/settings/integrations?calendar=error&reason=no_code");
        }

        // ✅ FIX PRINCIPAL : décodage base64url symétrique à getAuthUrl()
        // base64 standard utilise +, /, = qui sont encodés/altérés dans les URLs
        // On reconvertit -_ en +/ avant de décoder (inverse de getAuthUrl)
        $decoded   = base64_decode(strtr($state ?? '', '-_', '+/'), true);
        $stateData = $decoded ? json_decode($decoded, true) : null;
        $userId    = $stateData['user_id'] ?? null;

        Log::info('Google callback: state décodé', [
            'raw_state' => $state,
            'user_id'   => $userId,
            'decode_ok' => !empty($userId),
        ]);

        if (!$userId) {
            Log::error('Google callback: userId manquant dans le state', [
                'raw_state' => $state,
                'decoded'   => $decoded,
            ]);
            return redirect("{$frontendUrl}/rh/settings/integrations?calendar=error&reason=invalid_state");
        }

        // Vérification que l'user existe en base
        $userExists = \App\Models\User::where('_id', $userId)->exists();

        Log::info('Google callback: user lookup', [
            'user_id'     => $userId,
            'user_exists' => $userExists,
        ]);

        if (!$userExists) {
            Log::error('Google callback: user introuvable', ['user_id' => $userId]);
            return redirect("{$frontendUrl}/rh/settings/integrations?calendar=error&reason=user_not_found");
        }

        $success = $this->calendar->exchangeCode($code, $userId);

        Log::info('Google callback: résultat final', [
            'success' => $success,
            'user_id' => $userId,
        ]);

        return redirect($success
            ? "{$frontendUrl}/rh/settings/integrations?calendar=success"
            : "{$frontendUrl}/rh/settings/integrations?calendar=error&reason=exchange_failed"
        );
    }

    // ── GET /rh/google/calendar/status ───────────────────────
    public function status(): JsonResponse
    {
        $userId = (string) Auth::id();
        $token  = GoogleToken::where('user_id', $userId)->first();

        return response()->json([
            'success'   => true,
            'connected' => !!$token,
            'expired'   => $token?->isExpired() ?? false,
            'calendar'  => $token?->calendar_id ?? null,
        ]);
    }

    // ── DELETE /rh/google/calendar/disconnect ─────────────────
    public function disconnect(): JsonResponse
    {
        $userId = (string) Auth::id();
        GoogleToken::where('user_id', $userId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Calendrier Google déconnecté.',
        ]);
    }

   
}