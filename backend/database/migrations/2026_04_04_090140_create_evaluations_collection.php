<?php

use Illuminate\Database\Migrations\Migration;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->create('evaluations', function (Blueprint $collection) {
            $collection->index('application_id');
            $collection->index('assigned_to');   // pour retrouver les demandes d'un membre
            $collection->index(['application_id', 'statut']); // filtrage rapide
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('evaluations');
    }
};