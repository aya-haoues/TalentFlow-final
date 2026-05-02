<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User; // 👈 AJOUT IMPORTANT
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class ResetPasswordController extends Controller
{
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // On exécute la réinitialisation via le "Broker" de Laravel
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) { // 👈 On précise le type User
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        // Si le statut est un succès, on renvoie 200, sinon on renvoie l'erreur détaillée (422)
        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Votre mot de passe a été mis à jour avec succès.'
            ], 200);
        }

        // Si ça échoue (token invalide, email incorrect, etc.)
        return response()->json([
            'message' => __($status) // Laravel traduira "passwords.token" en "Ce jeton est invalide"
        ], 422);
    }
}