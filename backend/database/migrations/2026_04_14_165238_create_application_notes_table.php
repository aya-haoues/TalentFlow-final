<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint; // Important pour MongoDB
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    protected $connection = 'mongodb';

    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('notes', function (Blueprint $table) {
        $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
        $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
        $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
        $table->longText('notes_internes');
        $table->enum('note_visibility', ['rh_only', 'shared_manager'])->default('rh_only');
        $table->timestamps();
    });

    // Table pivot pour les mentions
    Schema::create('note_mentions', function (Blueprint $table) {
        $table->foreignId('note_id')->constrained('notes')->cascadeOnDelete();
        $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
        $table->primary(['note_id', 'user_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('application_notes');
    }
};