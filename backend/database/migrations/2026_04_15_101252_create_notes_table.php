<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    protected $connection = 'mongodb';

    public function up(): void
    {
        // Dans MongoDB, on crée simplement la collection
        Schema::create('notes', function (Blueprint $table) {
            // Pas besoin de primary('id') ou UUID, MongoDB gère l' _id automatiquement
            $table->string('application_id'); // On stocke l'ID en string
            $table->string('author_id');
            $table->longText('notes_internes');
            $table->string('note_visibility'); // enum est supporté mais string est plus flexible
            
            // Au lieu d'une table pivot, on stocke les IDs des membres mentionnés ici
            $table->array('mentions_ids')->nullable(); 
            
            $table->timestamps();
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
