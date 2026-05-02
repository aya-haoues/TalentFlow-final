<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('mongodb')->table('interviews', function (Blueprint $collection) {
            // Ces champs seront ajoutés aux documents MongoDB
            // Note: MongoDB accepte n'importe quel type, mais on le précise pour la clarté
            $collection->string('type')->comment('telephonique, visio, presentiel, technique');
            $collection->dateTime('interview_date');
            $collection->integer('duration_minutes')->nullable();
            $collection->string('location')->nullable();
            $collection->string('meeting_url')->nullable();
            $collection->text('notes_candidat')->nullable();
            $collection->string('note_visibility')->default('rh_only');
            $collection->boolean('send_calendar_invite')->default(false);
            $collection->string('statut')->default('planifie');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->table('interviews', function (Blueprint $collection) {
            // Pour MongoDB, dropColumn supprime simplement les clés des documents
            $collection->dropColumn([
                'type', 'interview_date', 'duration_minutes', 'location', 
                'meeting_url', 'notes_candidat', 'note_visibility', 
                'send_calendar_invite', 'statut'
            ]);
        });
    }
};