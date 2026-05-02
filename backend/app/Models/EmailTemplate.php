<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model; 

class EmailTemplate extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'email_templates';

    protected $fillable = [
        'title',       
        'subject',      
        'body',         
        'category',    
        'placeholders', 
        'created_by'   
    ];

    
    protected $casts = [
        'placeholders' => 'array',
        'created_at' => 'datetime',
    ];
}