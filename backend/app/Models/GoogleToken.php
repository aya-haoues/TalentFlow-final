<?php
// ============================================================
// app/Models/GoogleToken.php
// ============================================================

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class GoogleToken extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'google_tokens';

    protected $fillable = [
        'user_id',
        'access_token',
        'refresh_token',
        'expires_at',
        'scope',
        'calendar_id',  // ID du calendrier Google (primary par défaut)
    ];

    // app/Models/GoogleToken.php
    protected $casts = [
        'expires_at' => 'datetime', // ✅ doit être 'datetime', pas 'string'
    ];

    public function isExpired(): bool
{
    // ✅ Guard : si expires_at est null on considère expiré
    if (!$this->expires_at) return true;
    return $this->expires_at->isPast();
}


    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}