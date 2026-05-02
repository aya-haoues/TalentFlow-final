<?php
// app/Http/Controllers/RhController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class RhController extends Controller
{
    // ✅ Plus de __construct avec middleware
    // La protection est gérée par la route

    public function getStats()
{
    // On compte uniquement les utilisateurs inscrits en tant que candidats
    $totalCandidats = User::where('role', 'candidat')->count();
    
    // Vous pouvez aussi compter les offres et postulations ici
    $totalOffres = Job::count();
    $totalPostulations = Application::count();

    return response()->json([
        'success' => true,
        'data' => [
            'candidats_count' => $totalCandidats,
            'offres_count' => $totalOffres,
            'postulations_count' => $totalPostulations,
        ]
    ]);
}

    public function getOffres()
    {
        return response()->json([
            'success' => true,
            'data'    => []
        ]);
    }

    public function getTeamMembers()
{
    // On filtre uniquement les utilisateurs ayant le rôle 'rh' ou 'manager'
    $team = User::whereIn('role', ['rh', 'manager'])
        ->select('id', 'name', 'role', 'email', 'avatar')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $team
    ]);
}



/**
     * Affiche le profil de l'utilisateur RH/Manager connecté
     */
    

    /**
     * Met à jour les informations du profil
     */
    public function update(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Validation basée sur les attributs réels de votre modèle User
        $validated = $request->validate([
            'name'         => ['required', 'string', 'min:2', 'max:100'],
            'telephone'    => ['nullable', 'string', 'regex:/^(\+216|00216|0)?[23456789]\d{7}$/'],
            'departement'  => ['nullable', 'string'],
            'linkedin_url' => ['nullable', 'url'],
        ], [
            'name.required'    => 'Le nom est obligatoire',
            'telephone.regex'  => 'Format de téléphone tunisien invalide',
            'linkedin_url.url' => 'Lien LinkedIn invalide',
        ]);

        // La méthode update fonctionnera car $user est typé via @var
        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès.',
            'data'    => [
                'name'         => $user->name,
                'telephone'    => $user->telephone,
                'departement'  => $user->departement,
                'linkedin_url' => $user->linkedin_url,
            ],
        ]);
    }

   

    /**
     * Met à jour le mot de passe
     */
    public function updatePassword(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Sécurité : Interdire le changement de MDP pour les comptes sociaux
        if ($user->isSocialAccount()) {
            return response()->json([
                'success' => false,
                'message' => 'Les comptes connectés via Google/LinkedIn ne peuvent pas modifier leur mot de passe ici.'
            ], 422);
        }

        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'string', 'min:8', 'confirmed', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès.',
        ]);
    }


    // app/Http/Controllers/RhController.php

// ➕ Ajoute cette méthode privée pour formater les données de profil
private function formatProfileData(\App\Models\User $user): array
{
    return [
        'id'              => $user->getKey(),
        'name'            => $user->name,
        'email'           => $user->email,
        'telephone'       => $user->telephone,
        'departement'     => $user->departement,
        // ✅ Normalise toujours la clé 'avatar'
        'avatar'          => $user->avatar 
            ? (filter_var($user->avatar, FILTER_VALIDATE_URL) 
                ? $user->avatar 
                : asset('storage/' . $user->avatar)) 
            : null,
        'linkedin_url'    => $user->linkedin_url,
        'role'            => $user->role,
        'is_approved'     => $user->is_approved,
        'created_at'      => $user->created_at?->format('d/m/Y'),
        'social_provider' => $user->social_provider,
    ];
}

// ➕ Utilise-la dans show()
public function show(): JsonResponse
{
    $user = Auth::user();
    return response()->json([
        'success' => true,
        'data'    => $this->formatProfileData($user),
    ]);
}

// ➕ Et dans updateAvatar()
public function updateAvatar(Request $request): JsonResponse
{
    $request->validate([
        'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
    ]);

    $user = Auth::user();

    // Suppression de l'ancien avatar
    if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
        Storage::disk('public')->delete($user->avatar);
    }

    $path = $request->file('avatar')->store('avatars', 'public');
    $user->update(['avatar' => $path]);

    return response()->json([
        'success' => true,
        'message' => 'Avatar mis à jour.',
        // ✅ Retourne 'avatar' pour cohérence frontend
        'avatar'  => asset('storage/' . $path),
    ]);
}


}