<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\HasMany;
use App\Models\Job;
use App\Models\User;

class Application extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'applications';
    protected $primaryKey = 'id';
    

    protected $fillable = [
    'job_id',
    'candidate_id',
    'statut',
    'date_candidature',
    'date_derniere_modification',
    'cv_path',
    'lettre_motivation',
    'nom',
    'prenom',
    'email',
    'telephone',
    'date_naissance',
    'genre',
    'nationalite',
    'adresse',
    'linkedin_url',
    'github_url',
    'site_web',
    'motivation',
    'contract_type_preferred',
    'handicap_info',
    'notes_internes',
    'note_visibility',
    'mentions',
    'experiences',
    'formations',
    'skills',
    'challenges',
    'source',

    // ── Analyse IA ──
    'ai_score',
    'ai_niveau',
    'ai_decision',
    'ai_scores_details',
    'ai_points_forts',
    'ai_points_faibles',
    'ai_resume',
    'ai_risques',
    'cv_data_parsed',
    'cv_text',
    'analyzed_at',
    'analyse_version',

    // ── Pipeline Multi-Agent ──
    'agent1_profil',
    'agent1_completed_at',
    'agent2_matching',
    'agent2_best_job',
    'agent2_completed_at',
    'agent3_completed_at',

    // ── Matching ──  ← MANQUAIENT
    'matched_job_id',
    'matched_job_titre',
    'matching_scores',
];

   
    protected $attributes = [
        'statut' => 'en_cours',
    ];

    protected $casts = [
        'adresse'                    => 'array',
        'experiences'                => 'array',
        'formations'                 => 'array',
        'skills'                     => 'array',
        'challenges'                 => 'array',
        'date_candidature'           => 'datetime',
        'date_derniere_modification' => 'datetime',
        'date_naissance'             => 'date',

        'ai_scores_details' => 'array',
        'ai_points_forts'   => 'array',
        'ai_points_faibles' => 'array',
        'ai_risques'        => 'array',
        'cv_data_parsed'    => 'array',
        'ai_score'          => 'integer',
        'analyzed_at'       => 'datetime',


        'agent1_profil'       => 'array',
        'agent2_matching'     => 'array',
        'agent2_best_job'     => 'array',
        'agent1_completed_at' => 'datetime',
        'agent2_completed_at' => 'datetime',
        'agent3_completed_at' => 'datetime',
        'matching_scores'     => 'array',

    ];

    protected $appends = [
        'full_name',
        'is_active',
        'is_finished',
        'has_cv',
    ];

    
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }

   
    
    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id')
                    ->withDefault([
                        'titre'  => 'Offre supprimée',
                        'statut' => 'archivee',
                    ]);
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id')
                    ->withDefault([
                        'name'  => 'Candidat supprimé',
                        'email' => '',
                    ]);
    }

    
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) =>
                trim(($attributes['prenom'] ?? '') . ' ' . ($attributes['nom'] ?? '')),
        );
    }

    
    protected function email(): Attribute
{
    return Attribute::make(
        // On récupère la valeur telle quelle
        get: fn($value) => $value,
        // On transforme en minuscules à l'écriture
        set: fn($value) => strtolower(trim($value ?? '')),
    );
}

    
    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn() => in_array($this->statut, ['en_attente', 'en_cours']),
        );
    }

    
    protected function isFinished(): Attribute
    {
        return Attribute::make(
            get: fn() => in_array($this->statut, ['acceptee', 'refusee', 'retiree']),
        );
    }

    
    protected function hasCv(): Attribute
    {
        return Attribute::make(
            get: fn() => !is_null($this->cv_path),
        );
    }

   
}
