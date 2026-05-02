<?php

use Illuminate\Database\Migrations\Migration;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->create('interviews', function (Blueprint $collection) {

            // ── Identité ──────────────────────────────────
            $collection->index('application_id');   // recherche par candidature
            $collection->index('candidate_email');  // recherche par email candidat
            $collection->index('created_by');       // recherche par RH

            // ── Index composé pour filtrage courant ───────
            // ex: tous les entretiens d'un RH dans une période
            $collection->index(['created_by', 'date']);

            // ── Index pour le dashboard ───────────────────
            $collection->index('statut');
            $collection->index('type');
            $collection->index('date');

            // ── TTL optionnel (archives après 2 ans) ──────
            // $collection->expireAfterSeconds(63072000, 'created_at');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('interviews');
    }
};