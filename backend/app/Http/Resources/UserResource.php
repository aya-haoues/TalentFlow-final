<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
public function toArray(Request $request): array
{
    return [
        'id'                => (string) $this->getKey(),
        'name'              => $this->name,
        'email'             => $this->email,
        'role'              => $this->role,
        'telephone'         => $this->telephone,
        'avatar'            => $this->avatar,
        'linkedin_url'      => $this->linkedin_url,
        'social_provider'   => $this->social_provider, // ← ajouter
        'is_social'         => $this->isSocialAccount(),
        'email_verified'    => !is_null($this->email_verified_at), // ✅ toujours présent
        'email_verified_at' => $this->email_verified_at?->toISOString(), // ← ajouter

        'is_approved' => $this->when(
            $request->user()?->role === 'admin',
            $this->is_approved
        ),
        'is_blocked' => $this->when(
            $request->user()?->role === 'admin',
            $this->is_blocked
        ),

        'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
    ];
}

}