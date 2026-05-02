<?php

namespace App\Http\Controllers;

use App\Models\EmailVerificationCode;  
use App\Services\EmailVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function __construct(
        private EmailVerificationService $verificationService
    ) {}

    public function notice(Request $request): JsonResponse
    {
        return response()->json([
            'success'        => true,
            'email_verified' => !is_null($request->user()->email_verified_at),
            'email'          => $request->user()->email,
            'message'        => is_null($request->user()->email_verified_at)
                ? 'Email non vérifié. Consultez votre boîte mail.'
                : 'Email déjà vérifié.',
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!is_null($user->email_verified_at)) {
            return response()->json([
                'success' => true,
                'message' => 'Email déjà vérifié.',
            ]);
        }

        $userId     = (string) $user->getKey();
        $hashedCode = hash('sha256', $request->code);

        // ✅ Chercher par user_id OU email
        $record = EmailVerificationCode::where('used', false)
            ->where(function ($q) use ($userId, $user) {
                $q->where('user_id', $userId)
                  ->orWhere('email', $user->email);
            })
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun code trouvé. Demandez un nouveau code.',
            ], 422);
        }

        if (!$record->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Code expiré. Demandez un nouveau code.',
            ], 422);
        }

        if (!hash_equals($record->code, $hashedCode)) {
            return response()->json([
                'success' => false,
                'message' => 'Code incorrect.',
            ], 422);
        }

        // ✅ Marquer utilisé + vérifier email
        $record->update(['used' => true]);
        $user->update(['email_verified_at' => now()]);

        // ✅ Mettre à jour user_id si vide
        if (empty($record->user_id)) {
            $record->update(['user_id' => $userId]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Email vérifié avec succès ! 🎉',
            'data'    => [
                'email_verified' => true,
                'email'          => $user->email,
            ],
        ]);
    }

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!is_null($user->email_verified_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Email déjà vérifié.',
            ], 422);
        }

        $this->verificationService->sendCode($user);

        return response()->json([
            'success' => true,
            'message' => 'Nouveau code envoyé. Vérifiez votre boîte mail.',
        ]);
    }
}