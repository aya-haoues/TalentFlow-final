<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\PersonalAccessToken;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class MongoTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié. Veuillez vous connecter.',
            ], 401);
        }

        // ── Parser le token ───────────────────────
        if (str_contains($bearerToken, '|')) {
            [, $plainText] = explode('|', $bearerToken, 2);
        } else {
            $plainText = $bearerToken;
        }

        $hashedToken = hash('sha256', $plainText);

        // ── Trouver le token en base ──────────────
        $tokenRecord = PersonalAccessToken::where('token', $hashedToken)->first();

        if (!$tokenRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalide.',
            ], 401);
        }

        
$user = User::where('_id', $tokenRecord->tokenable_id)->first()
    ?? User::where('id', $tokenRecord->tokenable_id)->first();
    
if (!$user) {
    // Si ça échoue encore, on tente via l'ID brut sans conversion
    $user = User::find((string) $tokenRecord->tokenable_id);
}

if (!$user) {
    // DERNIER RECOURS POUR DEBUG : Renvoie l'ID pour que vous puissiez vérifier dans MongoDB Compass
    return response()->json([
        'success' => false,
        'message' => 'Utilisateur introuvable.',
        'debug_info' => [
            'id_cherche' => $tokenRecord->tokenable_id,
            'type_id' => gettype($tokenRecord->tokenable_id)
        ]
    ], 401);
}

        if ($user->is_blocked) {
            return response()->json([
                'success' => false,
                'message' => 'Compte bloqué.',
            ], 403);
        }

        // ── Injecter le user dans la requête ──────
        $request->setUserResolver(fn() => $user);

        // ✅ Correction — injecter dans le guard correctement
        Auth::setUser($user);

        return $next($request);
    }
}
