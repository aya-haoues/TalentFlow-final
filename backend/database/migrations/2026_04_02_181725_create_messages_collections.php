<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint; // Assurez-vous d'utiliser le Blueprint MongoDB

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Pour MongoDB, on utilise souvent 'connection' si ce n'est pas celle par défaut
        Schema::connection('mongodb')->create('interviews', function (Blueprint $table) {
            $table->id(); // Dans MongoDB, cela créera un _id automatique
            
            // On stocke l'ID de l'application (en tant que string ou ObjectId)
            $table->string('application_id'); 
            
            $table->dateTime('interview_date');
            $table->string('type'); 
            $table->json('interviewer_ids'); // MongoDB gère nativement les tableaux/objets
            $table->text('notes_candidat')->nullable();
            $table->boolean('send_calendar_invite')->default(true);
            $table->string('status')->default('planned');
            
            $table->timestamps();
            
            // Indexation pour les performances (Optionnel mais recommandé)
            $table->index('application_id');
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