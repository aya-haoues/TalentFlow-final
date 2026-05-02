<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
        protected $connection = 'mongodb';
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('applications', function (Blueprint $table) {
        $table->longText('notes_internes')->nullable();
        $table->string('note_visibility')->default('rh_only');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            //
        });
    }
};
