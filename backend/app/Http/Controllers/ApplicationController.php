<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\CvAnalysisController; // Vérifie le namespace exact

class ApplicationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Application::class);

        $cvPath = null;

        try {
            $validated = $request->validate([
                'job_id'                  => 'required|string',
                'nom'                     => 'required|string|max:100',
                'prenom'                  => 'required|string|max:100',
                'email'                   => 'required|email',
                'telephone'               => 'required|string',
                'date_naissance'          => 'required|date',
                'genre'                   => 'required|in:homme,femme,autre',
                'nationalite'             => 'required|string',
                'motivation'              => 'required|string|min:50',
                'contract_type_preferred' => 'required|in:CDI,CDD,Stage,Alternance,Freelance',
                'cv'                      => 'required|file|mimes:pdf|max:5120',
                'linkedin_url'            => 'nullable|url',
                'github_url'              => 'nullable|url',
                'site_web'                => 'nullable|url',
                'adresse'                 => 'nullable|array',
                'experiences'             => 'nullable|string',
                'formations'              => 'nullable|string',
                'skills'                  => 'nullable|string',
                'challenges'              => 'nullable|string',
                'handicap_info'           => 'nullable|string',
            ]);


            $user = Auth::user();

            $source = 'site_web'; // par défaut

            if ($user->social_provider === 'google') {
                $source = 'google';
            } elseif ($user->social_provider === 'linkedin-openid') {
                $source = 'linkedin';
            }

            $job = Job::where('id', $validated['job_id'])->first();
            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Offre introuvable.',
                ], 404);
            }

            if (!$job->is_accepting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette offre n\'accepte plus de candidatures.',
                ], 422);
            }

            $alreadyApplied = Application::where('candidate_id', Auth::id())
                ->where('job_id', $validated['job_id'])
                ->exists();

            if ($alreadyApplied) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà postulé à cette offre.',
                ], 422);
            }

            $cvPath = $request->file('cv')->store('cvs/' . date('Y/m'), 'public');

            // Dans la méthode store, remplace le bloc Application::create par ceci :

$application = Application::create([
    'candidate_id'            => Auth::id(),
    'source'                  => $source,
    'job_id'                  => $validated['job_id'],
    'nom'                     => $validated['nom'],
    'prenom'                  => $validated['prenom'],
    'email'                   => $validated['email'],
    'telephone'               => $validated['telephone'],
    'date_naissance'          => $validated['date_naissance'],
    'genre'                   => $validated['genre'],
    'nationalite'             => $validated['nationalite'],
    'motivation'              => $validated['motivation'],
    'lettre_motivation'       => $validated['motivation'],
    'contract_type_preferred' => $validated['contract_type_preferred'],
    'cv_path'                 => $cvPath,
    'linkedin_url'            => $validated['linkedin_url'] ?? null,
    'github_url'              => $validated['github_url'] ?? null,
    'site_web'                => $validated['site_web'] ?? null,
    'adresse' => (function() use ($request, $validated) {
                $raw = $request->input('adresse');
                if (is_string($raw)) {
                    $decoded = json_decode($raw, true);
                    return is_array($decoded) ? $decoded : null;
                }
                return $validated['adresse'] ?? null;
            })(),    
    
    'skills'      => json_decode($request->input('skills'), true) ?? [],
    'formations'  => json_decode($request->input('formations'), true) ?? [],
    'experiences' => json_decode($request->input('experiences'), true) ?? [],
    'challenges'  => json_decode($request->input('challenges'), true) ?? [],
        
    'handicap_info'           => $validated['handicap_info'] ?? null,
    'statut'                  => 'en_cours',
    'date_candidature'        => now(),
]);

app(CvAnalysisController::class)->sendToN8n($application->id);

            $application->load(['job.department']);

            return (new ApplicationResource($application))
                ->additional(['success' => true, 'message' => 'Candidature envoyée avec succès !'])
                ->response()
                ->setStatusCode(201);

        } catch (ValidationException $e) {
            if ($cvPath && Storage::disk('public')->exists($cvPath)) {
                Storage::disk('public')->delete($cvPath);
            }
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            if ($cvPath && Storage::disk('public')->exists($cvPath)) {
                Storage::disk('public')->delete($cvPath);
            }
            Log::error('Erreur création candidature', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur : ' . $e->getMessage(),
            ], 500);
        }
    }

    public function myApplications(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('limit', 10), 50);

        $applications = Application::with(['job.department'])
            ->where('candidate_id', Auth::id())
            ->orderBy('date_candidature', 'desc')
            ->paginate($perPage);

        return ApplicationResource::collection($applications)
            ->additional(['success' => true])
            ->response();
    }

    public function show(Application $application): JsonResponse
    {
        $this->authorize('view', $application);
        $application->load(['candidate', 'job.department']);

        return (new ApplicationResource($application))
            ->additional(['success' => true])
            ->response();
    }

    public function candidatStats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $stats = Cache::remember("candidat:stats:{$userId}", 300, function () use ($userId) {
            $applications = Application::where('candidate_id', $userId)->get(['statut']);
            return [
                'total'      => $applications->count(),
                'en_cours' => $applications->where('statut', 'en_cours')->count(),
                'acceptee'   => $applications->where('statut', 'acceptee')->count(),
                'entretien'   => $applications->where('statut', 'entretien')->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => array_merge($stats, [
                'profile_completion' => $this->calculateProfileCompletion($request->user()),
            ]),
        ]);
    }

    public function getStats()
{
    $stats = [
    'total_applications' => \App\Models\Application::count(), 
    'en_cours'         => \App\Models\Application::where('statut', 'en_cours')->count(),
    'acceptee'           => \App\Models\Application::where('statut', 'acceptee')->count(),
    'refusee'            => \App\Models\Application::where('statut', 'refusee')->count(),
    'entretien'          => \App\Models\Application::where('statut', 'entretien')->count(),
    'new_this_week'      => \App\Models\Application::where('created_at', '>=', now()->subDays(7))->count(),
    'total_jobs_active'  => \App\Models\Job::where('is_accepting', true)->count(),
];

    return response()->json([
        'success' => true,
        'data' => $stats
    ]);
}

public function indexRh(Request $request)
{
    $query = \App\Models\Application::with(['job', 'candidate']);

    // Filtre de recherche (Nom/Prénom ou Titre du Job)
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->whereHas('candidate', function($c) use ($search) {
                $c->where('nom', 'like', "%$search%")->orWhere('prenom', 'like', "%$search%");
            })->orWhereHas('job', function($j) use ($search) {
                $j->where('title', 'like', "%$search%");
            });
        });
    }

    // Filtre de statut
    if ($request->filled('statut') && $request->statut !== 'all') {
        $query->where('statut', $request->statut); // Changé 'status' en 'statut'
    }

    $applications = $query->orderBy('created_at', 'desc')->paginate(15);

    // Retourne les données via une Resource pour un format JSON propre
    return ApplicationResource::collection($applications);
}


            public function showRh(Application $application): JsonResponse
    {
        $this->authorize('viewAsRh', $application);
        $application->load(['candidate', 'job.department']);

        
        return (new ApplicationResource($application))
            ->additional(['success' => true])
            ->response();
    }

    public function updateStatus(Request $request, $id): JsonResponse
{
    // 1. Validation (Accepte les deux pour la compatibilité React/Flutter)
    $validated = $request->validate([
        'statut'         => 'required|in:en_cours,entretien,acceptee,refusee,retiree',
        'notes_internes' => 'nullable|string',
    ]);

    try {
        // 2. Récupération du document MongoDB
        $application = Application::where('_id', $id)->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Candidature introuvable.'
            ], 404);
        }

        // 3. Normalisation du statut
        // Si on reçoit 'en_cours' du Frontend, on enregistre 'entretien' en base
        $statusToSave = ($validated['statut'] === 'entretien') ? 'entretien' : $validated['statut'];

        // 4. Mise à jour des champs
        $application->statut = $statusToSave;
        if (isset($validated['notes_internes'])) {
            $application->notes_internes = $validated['notes_internes'];
        }
        $application->date_derniere_modification = now();

        // 5. Sauvegarde réelle
        if ($application->save()) {
            // Recharger les relations pour le retour JSON
            $application->load(['candidate', 'job.department']);

            // Nettoyage du cache pour les statistiques RH
            $job = Job::find($application->job_id);
            if ($job && $job->created_by) {
                Cache::forget("rh:applications:stats:{$job->created_by}");
            }

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès.',
                'data'    => new ApplicationResource($application)
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Impossible d’enregistrer les modifications.'
        ], 500);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur serveur : ' . $e->getMessage()
        ], 500);
    }
}


public function updateNote(Request $request, Application $application): JsonResponse
{
    // Vérification que le RH a accès à cette candidature (si multitenancy)
    // $this->authorize('update', $application);

    $validated = $request->validate([
        'notes_internes'  => 'required|string|max:10000',
        'note_visibility' => 'nullable|in:rh_only,shared_manager',
    ]);

    $application->update([
        'notes_internes'             => $validated['notes_internes'],
        'date_derniere_modification' => now(),
    ]);

    return response()->json([
        'message'     => 'Note enregistrée avec succès',
        'application' => new ApplicationResource($application),
    ]);
}


public function getNotes(Request $request, $id) // $id doit correspondre à {id} dans la route
{
    // Ajoute un log pour déboguer dans storage/logs/laravel.log
    \Log::info("Récupération des notes pour l'ID: " . $id);

    $application = Application::find($id);

    if (!$application) {
        return response()->json(['message' => 'Application non trouvée'], 404);
    }

    return response()->json([
        'notes' => $application->notes_internes ?? []
    ]);
}


   public function statsRh(Request $request): JsonResponse
{
    $userId = (string) Auth::id();
    $days = (int) $request->get('period', 30);

    // --- NOUVEAU : Nombre GLOBAL de candidats sur la plateforme ---
    // On compte tous les utilisateurs ayant le rôle 'candidat'
    $globalCandidatsCount = \App\Models\User::where('role', 'candidat')->count();

    // --- Logique existante pour les jobs du RH ---
    $jobs   = \App\Models\Job::where('created_by', $userId)->get();
    $jobIds = $jobs->map(fn($j) => (string) $j->id)->toArray();

    // Si le RH n'a pas de jobs, on renvoie quand même le total global
    if (empty($jobIds)) {
        return response()->json([
            'success' => true,
            'data'    => [
                'total_candidats'    => $globalCandidatsCount, // Chiffre global
                'total_jobs'         => 0,
                'total_applications' => 0,
                'growth'             => $this->buildGrowth(collect(), $days),
                'by_source'          => $this->emptySources(),
                // ... reste des champs à 0
            ]
        ]);
    }

    $allApps = \App\Models\Application::whereIn('job_id', $jobIds)->get();
    $startDate = \Carbon\Carbon::now('UTC')->subDays($days)->startOfDay();
    $appsInPeriod = $allApps->filter(function ($app) use ($startDate) {
        $date = $app->created_at ?? $app->date_candidature;
        return $date && \Carbon\Carbon::parse($date)->greaterThanOrEqualTo($startDate);
    });

    return response()->json([
        'success' => true,
        'data'    => [
            // On remplace le count filtré par le count global
            'total_candidats'    => $globalCandidatsCount, 
            
            'total_jobs'         => count($jobIds),
            'total_applications' => $allApps->count(),
            'growth'             => $this->buildGrowth($appsInPeriod, $days),
            'by_source'          => $this->buildSources($allApps),
            'total_interviews'   => $allApps->where('statut', 'entretien')->count(),
            'hires'              => $allApps->where('statut', 'acceptee')->count(),
            'en_cours'         => $allApps->where('statut', 'en_cours')->count(),
            'refusee'            => $allApps->where('statut', 'refusee')->count(),
        ]
    ]);
}


// ── Helper — construire le growth selon la période ────
private function buildGrowth(\Illuminate\Support\Collection $apps, int $days): array
{
    $growth = [];

    for ($i = $days - 1; $i >= 0; $i--) {
        $targetDate = \Carbon\Carbon::now('UTC')->subDays($i)->format('Y-m-d');

        // Label adapté selon la période
        $label = match(true) {
            $days <= 7  => \Carbon\Carbon::now('UTC')->subDays($i)->format('D d'),  // "Lun 24"
            $days <= 30 => \Carbon\Carbon::now('UTC')->subDays($i)->format('d M'),  // "24 Mar"
            default     => \Carbon\Carbon::now('UTC')->subDays($i)->format('d M'),  // "24 Mar"
        };

        $count = $apps->filter(function ($app) use ($targetDate) {
            $date = $app->created_at ?? $app->date_candidature;
            if (!$date) return false;
            return \Carbon\Carbon::parse($date)->format('Y-m-d') === $targetDate;
        })->count();

        $growth[] = [
            'month'     => $label,
            'candidats' => (int) $count,
        ];
    }

    return $growth;
}

// ── Helper — sources réelles depuis la BDD ────────────
private function buildSources(\Illuminate\Support\Collection $apps): array
{
    $total = $apps->count();
    if ($total === 0) return $this->emptySources();

    $sources = [
        'site_web' => $apps->filter(fn($a) =>
            empty($a->source) || $a->source === 'site_web'
        )->count(),

        'google'   => $apps->filter(fn($a) =>
            $a->source === 'google'
        )->count(),

        'linkedin' => $apps->filter(fn($a) =>
            $a->source === 'linkedin'
        )->count(),

        'manuel'   => $apps->filter(fn($a) =>
            $a->source === 'manuel'
        )->count(),
    ];

    return [
        ['source' => 'Site TalentFlow', 'count' => $sources['site_web'], 'percent' => $total > 0 ? round($sources['site_web'] / $total * 100) : 0],
        ['source' => 'Google OAuth',    'count' => $sources['google'],   'percent' => $total > 0 ? round($sources['google']   / $total * 100) : 0],
        ['source' => 'LinkedIn',        'count' => $sources['linkedin'], 'percent' => $total > 0 ? round($sources['linkedin'] / $total * 100) : 0],
        ['source' => 'Manuel (RH)',     'count' => $sources['manuel'],   'percent' => $total > 0 ? round($sources['manuel']   / $total * 100) : 0],
    ];
}

private function emptySources(): array
{
    return [
        ['source' => 'Site TalentFlow', 'count' => 0, 'percent' => 0],
        ['source' => 'Google OAuth',    'count' => 0, 'percent' => 0],
        ['source' => 'LinkedIn',        'count' => 0, 'percent' => 0],
        ['source' => 'Manuel (RH)',     'count' => 0, 'percent' => 0],
    ];
}


private function emptyGrowth(): array
{
    $growth = [];
    for ($i = 29; $i >= 0; $i--) {
        $growth[] = [
            'month'     => \Carbon\Carbon::now()->subDays($i)->format('d M'),
            'candidats' => 0,
        ];
    }
    return $growth;
}


    private function calculateProfileCompletion(User $user): int
    {
        $score = 0;
        if ($user->name)         $score += 20;
        if ($user->email)        $score += 20;
        if ($user->telephone)    $score += 15;
        if ($user->linkedin_url) $score += 15;
        if ($user->avatar)       $score += 15;
        if (Application::where('candidate_id', $user->id)
                        ->whereNotNull('cv_path')->exists()) {
            $score += 15;
        }
        return min($score, 100);
    }
}