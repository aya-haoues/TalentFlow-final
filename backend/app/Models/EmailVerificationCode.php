<?php
// app/Models/EmailVerificationCode.php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class EmailVerificationCode extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'email_verification_codes';

    protected $fillable = [
        'candidate_id',
        'email',
        'code',
        'expires_at',
        'used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used'       => 'boolean',
    ];

    // ── Vérifier si le code est encore valide ─────
    public function isValid(): bool
    {
        return !$this->used
            && $this->expires_at->isFuture();
    }
}