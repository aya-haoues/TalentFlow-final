<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint; // Assure-toi d'utiliser le Blueprint MongoDB

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Utilise la connexion mongodb si elle n'est pas celle par défaut
        Schema::connection('mongodb')->create('interviews', function (Blueprint $collection) {
            // Index pour la performance des recherches
            $collection->index('application_id');
            $collection->index('interviewer_ids');
            
            // On peut définir des champs, mais MongoDB les créera dynamiquement
            // Les timestamps sont essentiels pour le suivi
            $collection->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('interviews');
    }
};