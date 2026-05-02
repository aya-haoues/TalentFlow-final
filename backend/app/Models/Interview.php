<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Interview extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'interviews';

    protected $fillable = [
    'application_id',
    'candidate_name',
    'candidate_email',
    'type',
    'date',
    'time',
    'duration_minutes',
    'location',
    'meeting_url',
    'participants',
    'note',
    'note_visibility',
    'statut',
    'created_by',
    'created_by_name',
    'calendly_uri',
    'google_event_id',  // ✅ ajouter cette ligne
];


    protected $casts = [
        'participants'     => 'array',
        'duration_minutes' => 'integer',
    ];

    // ── Relations ────────────────────────────────
    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }
}