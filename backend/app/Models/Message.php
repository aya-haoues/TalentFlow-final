<?php

namespace App\Models; 

use MongoDB\Laravel\Eloquent\Model;

class Message extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'messages';

    protected $fillable = [
    'application_id', // L'index que tu as créé
    'sender_id',
    'sender_role',
    'sender_name',
    'sender_avatar',
    'subject',
    'body',          
    'sent_at',
];

    protected $casts = [
        'sent_at' => 'datetime',
    ];
}