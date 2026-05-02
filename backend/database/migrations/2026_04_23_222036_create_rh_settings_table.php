<?php

use Illuminate\Database\Migrations\Migration;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MongoDB crée la collection automatiquement au premier insert
        // On crée juste les indexes pour les performances
        Schema::connection('mongodb')->create('rh_settings', function (Blueprint $collection) {
            $collection->unique('user_id');
            $collection->index('updated_at');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('rh_settings');
    }
};

