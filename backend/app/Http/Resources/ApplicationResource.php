<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isRh    = $request->user()?->role === 'rh';
        $isAdmin = $request->user()?->role === 'admin';
        $notes   = $this->notes_internes ?? [];

        return [
            // ── Identifiant ──
            'id'           => $this->id,
            'candidate_id' => (string) $this->candidate_id,
            'statut'       => $this->statut,

            // ── Informations personnelles ──
            'nom'            => $this->nom,
            'prenom'         => $this->prenom,
            'full_name'      => $this->full_name,
            'email'          => $this->email,
            'telephone'      => $this->telephone,
            'date_naissance' => $this->date_naissance?->format('Y-m-d'),
            'genre'          => $this->genre,
            'nationalite'    => $this->nationalite,
            'adresse'        => is_string($this->adresse)
                                ? json_decode($this->adresse, true)
                                : ($this->adresse ?? null),

            // ── Liens ──
            'linkedin_url' => $this->linkedin_url,
            'github_url'   => $this->github_url,
            'site_web'     => $this->site_web,

            // ── Candidature ──
            'motivation'              => $this->motivation,
            'contract_type_preferred' => $this->contract_type_preferred,
            'cv_path'                 => $this->cv_path,
            'has_cv'                  => $this->has_cv,
            'cv_url'                  => $this->cv_path
                                        ? rtrim(config('app.url'), '/') . '/storage/' . ltrim($this->cv_path, '/')
                                        : null,

            // ── Données structurées ──
            'experiences' => is_array($this->experiences) ? $this->experiences : (json_decode($this->experiences, true) ?? []),
            'formations'  => is_array($this->formations)  ? $this->formations  : (json_decode($this->formations,  true) ?? []),
            'skills'      => is_array($this->skills)      ? $this->skills      : (json_decode($this->skills,      true) ?? []),
            'challenges'  => is_array($this->challenges)  ? $this->challenges  : (json_decode($this->challenges,  true) ?? []),

            // ── Notes (RH/Admin uniquement) ──
            'notes' => $this->when(
                $isRh || $isAdmin,
                collect($notes)->map(fn($note) => [
                    'id'              => $note['id']          ?? uniqid(),
                    'notes_internes'  => $note['text']        ?? '',
                    'created_at'      => $note['created_at']  ?? now()->toIso8601String(),
                    'note_visibility' => $note['visibility']  ?? 'rh_only',
                    'author'          => [
                        'name' => $note['author_name'] ?? 'Recruteur',
                        'role' => $note['author_role'] ?? 'rh',
                    ],
                    'mentions' => $note['mentions'] ?? [],
                ])->sortByDesc('created_at')->values()
            ),

            'handicap_info' => $this->when($isRh || $isAdmin, $this->handicap_info),

            // ── Helpers ──
            'is_active'   => $this->is_active,
            'is_finished' => $this->is_finished,

            // ── Relations ──
            'job'       => $this->whenLoaded('job',       fn() => new JobResource($this->job)),
            'candidate' => $this->whenLoaded('candidate', fn() => new UserResource($this->candidate)),

            // ── Timeline expériences ──
            'experiences_chart' => collect($this->experiences ?? [])->map(fn($exp) => [
                'entreprise' => $exp['entreprise'] ?? $exp['company']  ?? 'Non précisé',
                'poste'      => $exp['poste']      ?? $exp['position'] ?? 'Non précisé',
                'start'      => isset($exp['date_debut']) && $exp['date_debut']
                                ? \Carbon\Carbon::parse($exp['date_debut'])->valueOf()
                                : null,
                'end'        => isset($exp['date_fin']) && $exp['date_fin']
                                ? \Carbon\Carbon::parse($exp['date_fin'])->valueOf()
                                : null,
            ]),

            // ── Dates ──
            'date_candidature'           => $this->date_candidature?->format('Y-m-d H:i:s'),
            'date_derniere_modification' => $this->date_derniere_modification?->format('Y-m-d H:i:s'),
            'created_at'                 => $this->created_at?->format('Y-m-d H:i:s'),

            // ════════════════════════════════════════
            // ── Analyse IA — Agent 3 ──
            // ════════════════════════════════════════
            'ai_score'          => $this->ai_score          ?? null,
            'ai_decision'       => $this->ai_decision       ?? null,
            'ai_resume'         => $this->ai_resume         ?? null,
            'ai_niveau'         => $this->ai_niveau         ?? 'Non défini',
            'ai_scores_details' => $this->ai_scores_details ?? [],
            'ai_points_forts'   => $this->ai_points_forts   ?? [],
            'ai_points_faibles' => $this->ai_points_faibles ?? [],
            'ai_risques'        => $this->ai_risques         ?? [],
            'analyzed_at'       => $this->analyzed_at
                                    ? \Carbon\Carbon::parse($this->analyzed_at)->format('d/m/Y H:i')
                                    : null,
            'analyse_version'   => $this->analyse_version   ?? null,
            'agent3_completed_at' => $this->agent3_completed_at ?? null,

            // ── Pipeline Multi-Agent ──
            'agent1_profil'       => $this->agent1_profil       ?? null,
            'agent1_completed_at' => $this->agent1_completed_at ?? null,
            'agent2_matching'     => $this->agent2_matching      ?? null,
            'agent2_best_job'     => $this->agent2_best_job      ?? null,
            'agent2_completed_at' => $this->agent2_completed_at  ?? null,
            'matched_job_id'      => $this->matched_job_id       ?? null,
            'matched_job_titre'   => $this->matched_job_titre    ?? null,
            'matching_scores'     => $this->matching_scores       ?? [],
            'extraction'          => $this->cv_data_parsed        ?? null,
        ];
    }
}