<?php
// app/Models/Note.php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;   // si MongoDB
// use Illuminate\Database\Eloquent\Model;  // si SQL

class Note extends Model
{
    protected $connection = 'mongodb';  // retirer si SQL
    protected $collection = 'notes';    // retirer si SQL

    protected $fillable = [
        'application_id',
        'author_id',
        'notes_internes',
        'note_visibility',
        'mentions',
    ];

    protected $casts = [
        'mentions' => 'array',
    ];

    // ── Relations ──────────────────────────────────────────

    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}