<?php

/* ══════════════════════════════════════════════════════════
   app/Models/Evaluation.php — collection unique
══════════════════════════════════════════════════════════ */

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Evaluation extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'evaluations';

    protected $fillable = [
        'application_id',
        // ── Formulaire ────────────────────────────
        'template_id',
        'template_name',
        'template_icon',
        'answers',          // array — null si en attente (delegate pending)
        'score',            // int 0-100 — null si en attente
        'recommendation',   // 'Fortement recommandé' | 'Recommandé' | 'À revoir' | 'Non retenu'
        // ── Mode ──────────────────────────────────
        'mode',             // 'self' | 'delegate'
        'statut',           // 'completed' | 'pending' | 'declined'
        // ── Qui a créé la demande ─────────────────
        'created_by',
        'created_by_name',
        // ── Qui évalue (delegate uniquement) ──────
        'assigned_to',      // null si mode=self
        'assigned_name',    // null si mode=self
        'delegation_note',  // note du RH pour le membre
        // ── Dates ─────────────────────────────────
        'completed_at',     // null si pending
    ];

    protected $casts = [
        'answers'      => 'array',
        'score'        => 'integer',
        'completed_at' => 'datetime',
    ];
}
