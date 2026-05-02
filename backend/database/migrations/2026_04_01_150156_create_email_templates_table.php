<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Indique explicitement la connexion mongodb
    protected $connection = 'mongodb';

    public function up(): void
    {
        // On utilise Schema::connection pour être sûr de pointer sur Mongo
        Schema::connection($this->connection)->create('email_templates', function (Blueprint $collection) {
            // Dans MongoDB, on ne définit pas toutes les colonnes, 
            // mais on définit les INDEX et les CONTRAINTES
            
            // Crée un index unique sur le titre pour éviter les doublons
            $collection->unique('title');
            
            // Crée un index simple sur la catégorie pour accélérer le filtrage dans le menu
            $collection->index('category');

            // Ajoute created_at et updated_at
            $collection->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->drop('email_templates');
    }
};