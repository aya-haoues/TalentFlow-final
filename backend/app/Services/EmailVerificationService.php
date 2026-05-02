<?php

namespace App\Services;

use App\Models\User;
use App\Models\EmailVerificationCode;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailVerificationService
{
    public function sendCode(User $user): void
    {
        // ✅ Refresh pour avoir l'id MongoDB complet
        $user->refresh();

        $userId = (string) $user->getKey();

        // Supprimer les anciens codes
        EmailVerificationCode::where('user_id', $userId)
            ->where('used', false)
            ->delete();

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailVerificationCode::create([
            'user_id'    => $userId,
            'email'      => $user->email,
            'code'       => hash('sha256', $code),
            'expires_at' => now()->addMinutes(10),
            'used'       => false,
        ]);

        Mail::to($user->email)->send(
            new \App\Mail\EmailVerificationMail($user, $code)
        );

        Log::info('📧 Code envoyé', ['user_id' => $userId, 'email' => $user->email]);
    }

    public function verifyCode(User $user, string $code): bool
    {
        $userId = (string) $user->getKey();

        $record = EmailVerificationCode::where('user_id', $userId)
            ->where('used', false)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$record || !$record->isValid()) {
            return false;
        }

        if (!hash_equals($record->code, hash('sha256', $code))) {
            return false;
        }

        $record->update(['used' => true]);
        $user->update(['email_verified_at' => now()]);

        Log::info('✅ Email vérifié', ['user_id' => $userId]);

        return true;
    }
}