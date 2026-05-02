<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use MongoDB\Laravel\Eloquent\Model;

use App\Models\Application;
use App\Models\Department;
use App\Models\User;

class Job extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'jobs';
    protected $primaryKey = '_id';
    protected $keyType = 'string';
    public $incrementing = false;
   
    protected $fillable = [
        'titre',
        'department_id',
        'type_contrat',
        'niveau_experience',
        'type_lieu',
        'description',
        'competences_requises',
        'statut',
        'nombre_postes',
        'date_limite',
        'salaire_min',
        'salaire_max',
        'created_by',
    ];

    /* ══════════════════════════════════════════════
       VALEURS PAR DÉFAUT
    ══════════════════════════════════════════════ */

    protected $attributes = [
        'statut'        => 'brouillon',
        'nombre_postes' => 1,
    ];

  
    protected $casts = [
        '_id' => 'string', // Force Laravel à traiter l'ID comme une string vers le haut
        'competences_requises' => 'array',
        'date_limite'          => 'datetime',
        'salaire_min'          => 'integer',
        'salaire_max'          => 'integer',
        'nombre_postes'        => 'integer',
        'description'          => 'string',
    ];

   
    protected $appends = [
        'salary_range',
        'is_accepting',
        'is_published',
        'has_salary',
        'applications_count',
    ];

    
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }

   protected function applicationsCount(): Attribute
{
    return Attribute::make(
        get: fn() => $this->applications()->count(),
    );
}


    public function department()
{
    return $this->belongsTo(Department::class, 'department_id', '_id')
                ->withDefault(['nom' => 'Département supprimé']);
}

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by')
                    ->withDefault(['name' => 'Utilisateur supprimé']);
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'job_id')
                    ->chaperone();
    }

    public function acceptedApplications()
    {
        return $this->hasMany(Application::class, 'job_id')
                    ->where('statut', 'acceptee');
    }

    public function latestApplication()
    {
        return $this->hasOne(Application::class, 'job_id')
                    ->latestOfMany();
    }

    
    protected function titre(): Attribute
    {
        return Attribute::make(
            get: fn($value) => ucfirst($value ?? ''),
            set: fn($value) => trim($value),
        );
    }

    
    protected function salaryRange(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) =>
                isset($attributes['salaire_min'], $attributes['salaire_max'])
                    ? "{$attributes['salaire_min']} - {$attributes['salaire_max']} TND"
                    : null,
        );
    }

    
    protected function isPublished(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->statut === 'publiee',
        );
    }

   
    protected function isAccepting(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->statut !== 'publiee') return false;
                if ($this->date_limite && $this->date_limite->isPast()) return false;
                return true;
            }
        );
    }

    
    protected function hasSalary(): Attribute
    {
        return Attribute::make(
            get: fn() => !is_null($this->salaire_min) && !is_null($this->salaire_max),
        );
    }

    /* ══════════════════════════════════════════════
       LOCAL SCOPES
    ══════════════════════════════════════════════ */

    public function scopePubliee(Builder $query): Builder
    {
        return $query->where('statut', 'publiee');
    }

    public function scopeBrouillon(Builder $query): Builder
    {
        return $query->where('statut', 'brouillon');
    }

    public function scopeParType(Builder $query, string $type): Builder
    {
        return $query->where('type_contrat', $type);
    }

    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeActif(Builder $query): Builder
{
    return $query->where('statut', 'publiee')
                 ->where(function ($q) {
                     // On accepte si la date est dans le futur OU si elle n'est pas définie
                     $q->where('date_limite', '>=', now())
                       ->orWhereNull('date_limite');
                 });
}

    /* ══════════════════════════════════════════════
       EVENTS
    ══════════════════════════════════════════════ */

    protected static function booted(): void
    {
        static::deleting(function (Job $job) {
            $job->applications()->delete();
        });
    }
}