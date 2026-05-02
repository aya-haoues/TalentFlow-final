<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('interviews', function (Blueprint $table) {
        $table->id();
        // Clé étrangère vers votre table de candidatures
        $table->foreignId('application_id')->constrained('rh_applications')->onDelete('cascade');
        
        $table->dateTime('interview_date');
        $table->string('type'); // ex: 'visio', 'presentiel'
        $table->json('interviewer_ids'); // pour stocker les IDs des recruteurs
        $table->text('notes_candidat')->nullable();
        $table->boolean('send_calendar_invite')->default(true);
        $table->string('status')->default('planned');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
