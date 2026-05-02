<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Application;

class CvAnalysisController extends Controller
{
    // ────────────────────────────────────────────
    // Analyse CV via microservice Python + Ollama
    // ────────────────────────────────────────────

    public function analyze(Request $request, string $id): JsonResponse
    {
        $request->validate(['cv' => 'required|file|mimes:pdf,docx|max:5120']);

        $application = Application::with('job')->findOrFail($id);

        $job = $this->buildJobContext($application);

        // 1. Sauvegarder le fichier
        $path = $request->file('cv')->store('cvs', 'public');

        // 2. Envoyer au microservice Python
        $pythonResponse = Http::attach(
            'file',
            Storage::disk('public')->get($path),
            basename($path)
        )->post('http://localhost:8001/extract');

        if (!$pythonResponse->successful()) {
            Storage::disk('public')->delete($path);
            return response()->json([
                'success' => false,
                'message' => 'Erreur extraction Python : ' . $pythonResponse->status(),
            ], 500);
        }

        $texte       = $pythonResponse->json('text');
        $cvStructure = $pythonResponse->json('cv_structure');

        // 3. Scoring Ollama
        $scoreData = $this->scoreWithOllama($texte, $job);

        // 4. Sauvegarder
        $application->update([
            'ai_score'          => $scoreData['score_global']  ?? 0,
            'ai_niveau'         => $scoreData['niveau']         ?? 'Non analysé',
            'ai_decision'       => $scoreData['decision']       ?? 'À revoir',
            'ai_scores_details' => $scoreData['scores_details'] ?? [],
            'ai_points_forts'   => $scoreData['points_forts']   ?? [],
            'ai_points_faibles' => $scoreData['points_faibles'] ?? [],
            'ai_resume'         => $scoreData['resume']         ?? '',
            'ai_risques'        => $scoreData['risques']        ?? [],
            'cv_data_parsed'    => $cvStructure,
            'cv_text'           => $texte,
            'cv_path'           => $path,
            'analyzed_at'       => now(),
            'analyse_version'   => '2.0',
        ]);

        return response()->json(['success' => true, 'data' => $scoreData]);
    }

    // ────────────────────────────────────────────
    // Mise à jour depuis n8n (webhook entrant)
    // ────────────────────────────────────────────

    public function updateAnalysis(Request $request, string $id): JsonResponse
{
    $application = Application::find($id);

    if (!$application) {
        return response()->json(['message' => 'Candidature introuvable'], 404);
    }

    $validated = $request->validate([
        'score'           => 'required|numeric|min:0|max:100',
        'decision'        => 'required|string',
        'niveau'          => 'required|string',
        'summary'         => 'required|string',
        'scores_details'  => 'nullable',
        'points_forts'    => 'nullable',
        'points_faibles'  => 'nullable',
        'risques'         => 'nullable',
        'extraction'      => 'nullable',
        'analyse_version' => 'nullable|string',
        'agent1_profil'   => 'nullable',
        'agent2_matching' => 'nullable',
        'agent2_best_job' => 'nullable',

        'matched_job_id'   => 'nullable|string',
        'matched_job_titre'=> 'nullable|string',
        'matching_scores'  => 'nullable',
    ]);

    $decode = function ($field) use ($validated) {
        $val = $validated[$field] ?? null;
        if (!$val) return [];
        if (is_array($val)) return $val;
        if (is_string($val)) return json_decode($val, true) ?? [];
        return [];
    };

    $score    = (int) $validated['score'];
    $decision = $validated['decision'];
    $decisionNormalized = mb_strtolower(trim($decision));

    $statutsPositifs = [
        'fortement recommandé',
        'recommandé',
        'fortement recommande',
        'recommande',
    ];

    // ── Statut basé sur décision ET score ──
    $statut = match(true) {
        in_array($decisionNormalized, $statutsPositifs) => 'en_cours',
        $score >= 70                                    => 'en_cours',
        $score >= 50                                    => 'en_attente',
        default                                         => 'refusee',
    };

    $application->update([
        // ── Agent 3 ──
        'ai_score'           => $score,
        'ai_decision'        => $decision,
        'ai_niveau'          => $validated['niveau'],
        'ai_resume'          => $validated['summary'],
        'ai_scores_details'  => $decode('scores_details'),
        'ai_points_forts'    => $decode('points_forts'),
        'ai_points_faibles'  => $decode('points_faibles'),
        'ai_risques'         => $decode('risques'),
        'cv_data_parsed'     => $decode('extraction'),
        'analyse_version'    => $validated['analyse_version'] ?? 'multi-agent-3.0',
        'analyzed_at'        => now(),
        'statut'             => $statut,
        'agent3_completed_at'=> now(),

        // ── Agent 1 ──
        'agent1_profil'      => $decode('agent1_profil'),
        'agent1_completed_at'=> now(),

        // ── Agent 2 ──
        'agent2_matching'    => $decode('agent2_matching'),
        'agent2_best_job'    => $decode('agent2_best_job'),
        'agent2_completed_at'=> now(),

        // ── Matching ──
    'matched_job_id'   => $validated['matched_job_id']   ?? '',
    'matched_job_titre'=> $validated['matched_job_titre'] ?? '',
    'matching_scores'  => $decode('matching_scores'),
    ]);

    Log::info('Analyse CV mise à jour', [
        'id'       => $id,
        'score'    => $score,
        'decision' => $decision,
        'statut'   => $statut,
    ]);

    return response()->json([
        'success'   => true,
        'new_score' => $application->ai_score,
        'decision'  => $application->ai_decision,
        'statut'    => $statut,
    ]);
}




    // ────────────────────────────────────────────
    // Envoi vers n8n
    // ────────────────────────────────────────────

    public function sendToN8n(string $id): JsonResponse
{
    $application = Application::with('job')->findOrFail($id);

    if (!$application->cv_path) {
        return response()->json([
            'success' => false,
            'message' => 'Aucun CV associé à cette candidature.',
        ], 422);
    }

    $cvUrl = url('/api/cv/download/' . basename($application->cv_path));

    Log::info('Envoi vers n8n', [
        'application_id' => (string) $application->id,
        'candidate_id'   => (string) $application->id,
        'cv_url'         => $cvUrl,
    ]);

    $response = Http::timeout(30)->post('http://localhost:5678/webhook/analyse-cv', [
        'application_id'       => (string) $application->id,  // ← MANQUAIT
        'candidate_id'         => (string) $application->id,
        'full_name'            => $application->full_name,
        'cv_url'               => $cvUrl,
        'job_title'            => $application->job->titre       ?? '',
        'job_description'      => $application->job->description ?? '',
        'competences_requises' => implode(', ', $application->job->competences_requises ?? []),
        'experience_min'       => $application->job->experience_min ?? 0,
    ]);

    return response()->json([
        'success'      => $response->successful(),
        'message'      => $response->successful() ? 'Envoyé à n8n' : 'Erreur n8n',
        'n8n_response' => $response->status(),
        'cv_url'       => $cvUrl,
    ]);
}

    // ────────────────────────────────────────────
    // Téléchargement / affichage du CV
    // ────────────────────────────────────────────

    public function downloadCv(string $filename): mixed
    {
        // Cherche dans storage/app/public/cvs/ et ses sous-dossiers
        $found = $this->findCvPath($filename);

        if (!$found) {
            Log::error('CV introuvable', ['filename' => $filename]);
            return response()->json(['error' => 'Fichier introuvable'], 404);
        }

        return response()->file($found, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    // ────────────────────────────────────────────
    // Helpers privés
    // ────────────────────────────────────────────

    private function buildJobContext(Application $application): array
    {
        $job = $application->job;

        return [
            'titre'                => $job->titre            ?? 'Non précisé',
            'description'          => $job->description      ?? '',
            'competences_requises' => $job->competences       ?? [],
            'experience_min'       => $job->experience_min    ?? 0,
            'niveau_requis'        => $job->niveau             ?? 'Non précisé',
            'langues_requises'     => $job->langues            ?? ['Français'],
        ];
    }

    private function scoreWithOllama(string $texte, array $job): array
    {
        $competences = is_array($job['competences_requises'])
            ? implode(', ', $job['competences_requises'])
            : $job['competences_requises'];

        $prompt = <<<PROMPT
Tu es un expert RH senior. Tu vas d'abord extraire les informations du CV,
puis évaluer le candidat pour le poste.
Réponds UNIQUEMENT en JSON valide. Zéro texte avant ou après.

=== TEXTE BRUT DU CV ===
{$texte}

=== POSTE À POURVOIR ===
Titre : {$job['titre']}
Description : {$job['description']}
Compétences requises : {$competences}
Expérience minimale : {$job['experience_min']} ans

=== ÉTAPE 1 : EXTRAIS ces informations du CV ===
- Nom du candidat
- Compétences et outils maîtrisés
- Années d'expérience totales
- Postes occupés
- Diplômes et formations
- Langues

=== ÉTAPE 2 : ÉVALUE sur 100 points ===
- Compétences métier (40 pts)
- Expérience (25 pts)
- Formation (15 pts)
- Langues (10 pts)
- Cohérence parcours (10 pts)

=== FORMAT JSON ATTENDU ===
{
  "extraction": {
    "nom": "...", "competences": [], "annees_experience": 0,
    "postes": [], "formation": [], "langues": []
  },
  "score_global": 0,
  "niveau": "Recommandé",
  "scores_details": {
    "competences_metier": {"score": 0, "max": 40, "justification": "..."},
    "experience":         {"score": 0, "max": 25, "justification": "..."},
    "formation":          {"score": 0, "max": 15, "justification": "..."},
    "langues":            {"score": 0, "max": 10, "justification": "..."},
    "coherence_parcours": {"score": 0, "max": 10, "justification": "..."}
  },
  "points_forts": [], "points_faibles": [],
  "resume": "...", "decision": "...", "risques": []
}
PROMPT;

        $response = Http::timeout(120)->post('http://localhost:11434/api/generate', [
            'model'   => 'llama3.2',
            'prompt'  => $prompt,
            'stream'  => false,
            'format'  => 'json',
            'options' => ['temperature' => 0.1],
        ]);

        if (!$response->successful()) {
            return $this->scoreFallback();
        }

        $raw = $response->json('response') ?? '';
        preg_match('/\{[\s\S]*\}/', $raw, $m);

        return $m ? (json_decode($m[0], true) ?? $this->scoreFallback()) : $this->scoreFallback();
    }

    private function scoreFallback(): array
    {
        return [
            'score_global'  => 0,
            'niveau'        => 'Non analysé',
            'decision'      => 'À revoir',
            'scores_details'=> [],
            'points_forts'  => [],
            'points_faibles'=> [],
            'resume'        => 'Analyse indisponible.',
            'risques'        => [],
        ];
    }

    private function findCvPath(string $filename): ?string
    {
        $base = storage_path('app/public/cvs/');

        if (!is_dir($base)) {
            return null;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($base, \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getFilename() === $filename) {
                return $file->getRealPath();
            }
        }

        return null;
    }
}