<?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

use Laravel\Sanctum\NewAccessToken;
use Laravel\Sanctum\HasApiTokens;

use App\Models\Application;
use App\Models\Job;

class User extends Authenticatable implements CanResetPassword
{
    use HasApiTokens; 
    use HasFactory, Notifiable;

    protected $connection   = 'mongodb';
    protected $collection   = 'users';
    protected $primaryKey   = '_id';
    protected $keyType      = 'string';
    public    $incrementing = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'telephone',
        'linkedin_url',
        'departement',
        'social_provider',
        'social_id',
        'avatar',
        'is_approved',
        'is_blocked',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'social_id',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    //mutators
    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value,
            set: fn($value) => strtolower(trim($value ?? '')),
        );
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn($value) => ucwords(strtolower($value ?? '')),
            set: fn($value) => trim($value),
        );
    }

    protected function avatar(): Attribute
{
    return Attribute::make(
        get: function ($value) {
            if (!$value) {
                return null;
            }

            // Si l'avatar est une URL complète (ex: via Google OAuth), on la retourne telle quelle
            if (filter_var($value, FILTER_VALIDATE_URL)) {
                return $value;
            }

            // Sinon, on génère l'URL pointant vers le stockage local de Laravel
            // 'storage/' correspond au lien symbolique créé par php artisan storage:link
            return asset('storage/' . $value);
        }
    );
}

// App/Models/User.php

    public function createToken(
        string $name,
        array $abilities = ['*'],
        ?\DateTimeInterface $expiresAt = null
    ) {
        $plainTextToken = Str::random(64);
        $hashedToken    = hash('sha256', $plainTextToken);

        // Insertion directe via DB 
        DB::connection('mongodb')
            ->table('personal_access_tokens')
            ->insert([
                'name'           => $name,
                'token'          => $hashedToken,
                'abilities'      => json_encode($abilities),
                'expires_at'     => $expiresAt,
                'tokenable_id'   => (string) $this->getKey(),
                'tokenable_type' => static::class,
                'created_at'     => now()->toDateTimeString(),
                'updated_at'     => now()->toDateTimeString(),
            ]);

        // Récupérer le token inséré 
        $token   = \App\Models\PersonalAccessToken::where('token', $hashedToken)->first();
        $tokenId = (string) $token->id;

        return new NewAccessToken($token, "{$tokenId}|{$plainTextToken}");  //token réel envoyé au frontend
    }

    public function tokens()
    {
        return $this->morphMany(
            \App\Models\PersonalAccessToken::class,
            'tokenable',
            'tokenable_type',
            'tokenable_id',
            'id'
        );
    }

    //helper
    public function isSocialAccount(): bool
    {
        return !empty($this->social_provider) && !empty($this->social_id);
    }

    public function isManager(): bool
{
    return $this->role === 'manager';
}
    
    public function applications()
    {
        return $this->hasMany(Application::class, 'candidate_id');
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'created_by');
    }

    public function latestApplication()
    {
        return $this->hasOne(Application::class, 'candidate_id')
                    ->latestOfMany();
    }

    public function bestApplication()
    {
        return $this->hasOne(Application::class, 'candidate_id')
                    ->ofMany('ai_score', 'max');
    }

        public function getKey()
    {
        return (string) $this->_id;
    }


}