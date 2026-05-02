<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Models\Application;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CandidatController extends Controller
{
    
    public function showProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data'    => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'telephone'    => $user->telephone,
                'linkedin_url' => $user->linkedin_url,
                'avatar'       => $user->avatar,
                'role'         => $user->role,
            ],
        ]);
    }

   
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'telephone'    => 'sometimes|nullable|string|max:20',
            'linkedin_url' => 'sometimes|nullable|url|max:255',
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'data'    => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'telephone'    => $user->telephone,
                'linkedin_url' => $user->linkedin_url,
                'avatar'       => $user->avatar,
            ],
        ]);
    }

    
   public function dashboardStats(Request $request): JsonResponse
{
    $user = $request->user();
    // On définit la base de la requête
    $baseQuery = $user->applications();

    $stats = [
        'total'      => (clone $baseQuery)->count(),
        'en_cours' => (clone $baseQuery)->where('statut', 'en_cours')->count(),
        'entretien'  => (clone $baseQuery)->where('statut', 'entretien')->count(),
        'acceptee'   => (clone $baseQuery)->where('statut', 'acceptee')->count(),
        'refusee'    => (clone $baseQuery)->where('statut', 'refusee')->count(),
        'profile_completion' => $this->calcProfileCompletion($user),
    ];

    return response()->json([
        'success' => true,
        'data'    => $stats,
    ]);
}

    public function myApplications(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $statut  = $request->input('statut');
        $search  = $request->input('search');

        $query = $request->user()
            ->applications()
            ->with(['job.department'])
            ->latest();

        if ($statut && $statut !== 'all') {
            $query->where('statut', $statut);
        }

        if ($search) {
            $query->whereHas('job', function ($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                  ->orWhereHas('department', fn($d) => $d->where('nom', 'like', "%{$search}%"));
            });
        }

        $paginated = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
                'per_page'     => $paginated->perPage(),
            ],
        ]);
    }

    //helper
    private function calcProfileCompletion($user): int
    {
        $checks = [
            !empty($user->name),
            !empty($user->email),
            !empty($user->telephone),
            !empty($user->linkedin_url),
            !empty($user->avatar),
        ];

        return (int) round(
            (count(array_filter($checks)) / count($checks)) * 100
        );
    }


  public function send(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // ── Trouver le candidat via son application ────
        $application = Application::where('id', $id)
            ->orWhere('candidate_id', $id)
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Candidat introuvable.',
            ], 404);
        }

        $email = $application->email;
        $name  = $application->full_name ?? $application->prenom . ' ' . $application->nom;

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'Email du candidat introuvable.',
            ], 422);
        }

        try {
            // ── Envoyer l'email ────────────────────────
            Mail::send([], [], function ($message) use ($email, $name, $validated) {
                $message
                    ->to($email, $name)
                    ->subject($validated['subject'])
                    ->html($validated['content']);
            });

            Log::info('📧 Email envoyé au candidat', [
                'email'   => $email,
                'subject' => $validated['subject'],
                'sent_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email envoyé avec succès.',
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur envoi email candidat', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur envoi email : ' . $e->getMessage(),
            ], 500);
        }
    }


    // À ajouter dans CandidatController.php

public function index(Request $request): JsonResponse
{
    $search = $request->query('search');
    $perPage = $request->integer('per_page', 10);

    // On récupère les candidatures (ou les users selon ta logique métier)
    // Ici, on cherche dans la table Application qui contient les infos des candidats
    $query = Application::query()
        ->with(['job']) // Charger la relation job pour afficher le titre du poste
        ->when($search, function ($q) use ($search) {
            $q->where(function ($inner) use ($search) {
                $inner->where('full_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhereHas('job', function ($jobQuery) use ($search) {
                          $jobQuery->where('titre', 'like', "%{$search}%");
                      });
            });
        });

    $paginated = $query->latest()->paginate($perPage);

    return response()->json([
        'success' => true,
        'data'    => $paginated->items(),
        'pagination' => [
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'total'        => $paginated->total(),
            'per_page'     => $paginated->perPage(),
        ],
    ]);
}


public function search(Request $request)
{
    $user = $request->user();
    
    // Initialisation de la requête
    $query = $user->applications()->with('job.department');

    // FILTRE PAR STATUT : Si le paramètre 'statut' est présent et différent de 'all'
    if ($request->has('statut') && $request->statut !== 'all') {
        $query->where('statut', $request->statut);
    }

    // FILTRE PAR RECHERCHE (Optionnel mais recommandé)
    if ($request->has('search')) {
        $search = $request->search;
        $query->whereHas('job', function($q) use ($search) {
            $q->where('titre', 'like', "%{$search}%");
        });
    }

    $applications = $query->latest()->paginate(10);

    return response()->json([
        'success' => true,
        'data'    => $applications->items(),
        'pagination' => [
            'total'        => $applications->total(),
            'current_page' => $applications->currentPage(),
            'last_page'    => $applications->lastPage(),
            'per_page'     => $applications->perPage(),
        ]
    ]);
}


}