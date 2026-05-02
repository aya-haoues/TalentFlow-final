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
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->string('application_id');   // référence MongoDB _id
            $table->string('author_id');         // User qui a écrit la note
            $table->text('notes_internes');
            $table->enum('note_visibility', ['rh_only', 'shared_manager'])
                  ->default('rh_only');
            $table->json('mentions')->nullable(); // [{"id":"...","name":"..."}]
            $table->timestamps();

            $table->index('application_id');
            $table->index('author_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
