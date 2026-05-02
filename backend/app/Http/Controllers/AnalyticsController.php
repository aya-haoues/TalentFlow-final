<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Application;
use App\Models\Job;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    // ─────────────────────────────────────────────────────────
    // Helper : récupérer les job_ids du RH connecté (toujours en string)
    // ─────────────────────────────────────────────────────────
    private function getRhJobIds(Request $request): array
    {
        $rhId = (string) $request->user()->id;

        return Job::where('created_by', $rhId)
            ->get()
            ->map(fn($j) => (string) $j->id)
            ->toArray();
    }

    // ─────────────────────────────────────────────────────────
    // Helper : query de base des candidatures du RH
    // Si le RH n'a pas de jobs → retourne toutes les candidatures (fallback global)
    // ─────────────────────────────────────────────────────────
    private function getRhApplicationsQuery(array $jobIds)
    {
        $query = Application::query();

        if (!empty($jobIds)) {
            $query->whereIn('job_id', $jobIds);
        }
        // Si vide, on ne filtre pas → affiche tout (admin-like view)

        return $query;
    }

    // ─────────────────────────────────────────────────────────
    // KPIs globaux
    // ─────────────────────────────────────────────────────────
    public function kpis(Request $request): JsonResponse
    {
        $jobIds = $this->getRhJobIds($request);
        $baseQuery = $this->getRhApplicationsQuery($jobIds);

        // Cloner la query pour éviter les effets de bord
        $analysedApps = (clone $baseQuery)->whereNotNull('ai_score')->get();

        $total      = $analysedApps->count();
        $scoreSum   = $analysedApps->sum(fn($a) => (float) ($a->ai_score ?? 0));
        $scoreMoyen = $total > 0 ? round($scoreSum / $total) : 0;

        $recommandes = $analysedApps->filter(fn($a) =>
            str_contains(strtolower($a->ai_decision ?? ''), 'recommand')
        )->count();

        $refuses = $analysedApps->filter(fn($a) =>
            str_contains(strtolower($a->ai_decision ?? ''), 'refus')
        )->count();

        $enAttente = $analysedApps->filter(fn($a) =>
            str_contains(strtolower($a->ai_decision ?? ''), 'v') ||
            str_contains(strtolower($a->ai_decision ?? ''), 'attente') ||
            str_contains(strtolower($a->ai_decision ?? ''), 'revoir')
        )->count();

        $tauxAcceptation = $total > 0 ? round(($recommandes / $total) * 100) : 0;

        return response()->json([
            'total_analyses'   => $total,
            'score_moyen'      => $scoreMoyen,  // clé attendue par le frontend
            'taux_acceptation' => $tauxAcceptation,
            'recommandes'      => $recommandes,
            'refuses'          => $refuses,
            'en_attente'       => $enAttente,
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // Distribution des scores
    // ─────────────────────────────────────────────────────────
    public function scoreDistribution(Request $request): JsonResponse
    {
        $jobIds = $this->getRhJobIds($request);
        $apps   = $this->getRhApplicationsQuery($jobIds)
                       ->whereNotNull('ai_score')
                       ->get();

        $tranches = [
            ['min' => 0,  'max' => 20,  'label' => '0-20'],
            ['min' => 21, 'max' => 40,  'label' => '21-40'],
            ['min' => 41, 'max' => 60,  'label' => '41-60'],
            ['min' => 61, 'max' => 80,  'label' => '61-80'],
            ['min' => 81, 'max' => 100, 'label' => '81-100'],
        ];

        $result = array_map(function ($tranche) use ($apps) {
            $count = $apps->filter(function ($a) use ($tranche) {
                $score = (float) ($a->ai_score ?? 0);
                return $score >= $tranche['min'] && $score <= $tranche['max'];
            })->count();

            return ['tranche' => $tranche['label'], 'count' => $count];
        }, $tranches);

        return response()->json($result);
    }

    // ─────────────────────────────────────────────────────────
    // Décisions IA (pie chart)
    // ─────────────────────────────────────────────────────────
    public function decisions(Request $request): JsonResponse
    {
        $jobIds = $this->getRhJobIds($request);
        $apps   = $this->getRhApplicationsQuery($jobIds)
                       ->whereNotNull('ai_decision')
                       ->get();

        if ($apps->isEmpty()) {
            return response()->json([]);
        }

        $groups = $apps
            ->groupBy(fn($a) => $a->ai_decision ?? 'Non défini')
            ->map(fn($group, $decision) => [
                'name'  => $decision,
                'value' => $group->count(),
            ])
            ->values();

        return response()->json($groups);
    }

    // ─────────────────────────────────────────────────────────
    // Scores moyens par critère (radar)
    // ─────────────────────────────────────────────────────────
    public function criteriaRadar(Request $request): JsonResponse
    {
        $jobIds = $this->getRhJobIds($request);
        $apps   = $this->getRhApplicationsQuery($jobIds)
                       ->whereNotNull('ai_scores_details')
                       ->get();

        if ($apps->isEmpty()) {
            return response()->json([]);
        }

        $criteria = [
            'competences_metier' => ['label' => 'Compétences', 'max' => 40, 'total' => 0, 'count' => 0],
            'experience'         => ['label' => 'Expérience',  'max' => 25, 'total' => 0, 'count' => 0],
            'formation'          => ['label' => 'Formation',   'max' => 15, 'total' => 0, 'count' => 0],
            'langues'            => ['label' => 'Langues',     'max' => 10, 'total' => 0, 'count' => 0],
            'coherence_parcours' => ['label' => 'Cohérence',   'max' => 10, 'total' => 0, 'count' => 0],
        ];

        foreach ($apps as $app) {
            $details = $app->ai_scores_details;

            // Normaliser : Collection → array → cast object → array
            if ($details instanceof \Illuminate\Support\Collection) {
                $details = $details->toArray();
            }
            if (is_object($details)) {
                $details = (array) $details;
            }
            if (!is_array($details)) {
                continue;
            }

            foreach ($criteria as $key => &$crit) {
                if (!isset($details[$key])) continue;

                $item  = $details[$key];
                $score = null;

                if (is_array($item)) {
                    $score = isset($item['score']) ? (float) $item['score'] : null;
                } elseif (is_object($item)) {
                    $score = isset($item->score) ? (float) $item->score : null;
                } elseif (is_numeric($item)) {
                    $score = (float) $item;
                }

                if ($score !== null) {
                    $crit['total'] += $score;
                    $crit['count']++;
                }
            }
            unset($crit);
        }

        $result = collect($criteria)->map(fn($crit) => [
            'critere'     => $crit['label'],
            'score'       => $crit['count'] > 0 ? round($crit['total'] / $crit['count'], 1) : 0,
            'max'         => $crit['max'],
            'pourcentage' => $crit['count'] > 0
                ? round(($crit['total'] / $crit['count']) / $crit['max'] * 100)
                : 0,
        ])->values();

        return response()->json($result);
    }

    // ─────────────────────────────────────────────────────────
    // Performance par offre
    // ─────────────────────────────────────────────────────────
    public function offreStats(Request $request): JsonResponse
    {
        $jobIds = $this->getRhJobIds($request);

        // On retire le filtre analyzed_at pour ne pas exclure des candidatures
        $apps = $this->getRhApplicationsQuery($jobIds)
                     ->with('job')
                     ->get();

        if ($apps->isEmpty()) {
            return response()->json([]);
        }

        $stats = $apps
            ->groupBy('job_id')
            ->map(function ($group) {
                $job = $group->first()->job;

                $recommandes = $group->filter(fn($a) =>
                    str_contains(strtolower($a->ai_decision ?? ''), 'recommand')
                )->count();

                $refuses = $group->filter(fn($a) =>
                    str_contains(strtolower($a->ai_decision ?? ''), 'refus') ||
                    $a->statut === 'refusee'
                )->count();

                $scores = $group->filter(fn($a) => $a->ai_score !== null)
                                ->map(fn($a) => (float) $a->ai_score);

                return [
                    'offre'       => $job?->title ?? $job?->titre ?? 'Offre inconnue',
                    'candidats'   => $group->count(),
                    'score_moyen' => $scores->count() > 0 ? round($scores->avg()) : 0,
                    'recommandes' => $recommandes,
                    'refuses'     => $refuses,
                ];
            })
            ->values();

        return response()->json($stats);
    }

    // ─────────────────────────────────────────────────────────
    // Timeline scores
    // ─────────────────────────────────────────────────────────
    public function timeline(Request $request): JsonResponse
    {
        $jobIds = $this->getRhJobIds($request);
        $days   = max(1, (int) $request->get('days', 30));
        $cutoff = now()->subDays($days)->startOfDay();

        // Récupérer sans filtre MongoDB sur les dates (problème connu avec MongoDB)
        $apps = $this->getRhApplicationsQuery($jobIds)
                     ->whereNotNull('ai_score')
                     ->get();

        // Filtrer les dates côté PHP
        $filtered = $apps->filter(function ($a) use ($cutoff) {
            $rawDate = $a->analyzed_at ?? $a->date_candidature ?? $a->created_at;
            if (!$rawDate) return false;

            try {
                $date = $rawDate instanceof Carbon
                    ? $rawDate
                    : Carbon::parse($rawDate);
                return $date->gte($cutoff);
            } catch (\Exception $e) {
                return false;
            }
        });

        if ($filtered->isEmpty()) {
            return response()->json([]);
        }

        $grouped = $filtered
            ->groupBy(function ($a) {
                $rawDate = $a->analyzed_at ?? $a->date_candidature ?? $a->created_at;
                $date = $rawDate instanceof Carbon
                    ? $rawDate
                    : Carbon::parse($rawDate);
                return $date->format('d/m');
            })
            ->map(function ($group, $date) {
                $scores = $group->filter(fn($a) => $a->ai_score !== null)
                                ->map(fn($a) => (float) $a->ai_score);
                return [
                    'date'        => $date,
                    'score_moyen' => $scores->count() > 0 ? round($scores->avg()) : 0,
                    'nb_analyses' => $group->count(),
                ];
            })
            ->sortKeys()
            ->values();

        return response()->json($grouped);
    }

    // ─────────────────────────────────────────────────────────
    // Top candidats
    // ─────────────────────────────────────────────────────────
    public function topCandidates(Request $request): JsonResponse
    {
        $jobIds = $this->getRhJobIds($request);
        $limit  = min((int) $request->get('limit', 10), 50);

        $apps = $this->getRhApplicationsQuery($jobIds)
                     ->whereNotNull('ai_score')
                     ->with('job')
                     ->get()
                     ->sortByDesc(fn($a) => (float) ($a->ai_score ?? 0))
                     ->take($limit)
                     ->values();

        $data = $apps->map(fn($a) => [
            'id'                => (string) $a->id,
            '_id'               => (string) $a->id,
            'full_name'         => trim(($a->prenom ?? '') . ' ' . ($a->nom ?? '')) ?: ($a->full_name ?? '—'),
            'email'             => $a->email ?? '—',
            'ai_score'          => (int) ($a->ai_score ?? 0),
            'ai_decision'       => $a->ai_decision ?? null,
            'ai_niveau'         => $a->ai_niveau ?? null,
            'ai_scores_details' => $a->ai_scores_details ?? [],
            'ai_points_forts'   => $a->ai_points_forts   ?? [],
            'ai_resume'         => $a->ai_resume          ?? null,
            'matched_job_titre' => $a->matched_job_titre  ?? null,
            'job_titre'         => $a->job?->title ?? $a->job?->titre ?? '—',
            'statut'            => $a->statut ?? null,
            'analyzed_at'       => $a->analyzed_at
                ? Carbon::parse($a->analyzed_at)->format('d/m/Y')
                : null,
        ]);

        return response()->json($data);
    }
}
