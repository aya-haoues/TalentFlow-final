<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EvaluationController extends Controller
{
    // ── GET /api/rh/applications/{id}/evaluations ─────────
    public function index(string $id): JsonResponse
    {
        $evaluations = Evaluation::where('application_id', $id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($e) => $this->format($e));

        return response()->json(['success' => true, 'data' => $evaluations]);
    }

    // ── POST /api/rh/applications/{id}/evaluations ────────
    // Gère les deux cas : self ET delegate
    public function store(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'template_id'     => 'required|string',
            'template_name'   => 'required|string',
            'template_icon'   => 'nullable|string',
            'mode'            => 'required|in:self,delegate',
            // Champs requis seulement si mode = self
            'answers'         => 'required_if:mode,self|nullable|array',
            'score'           => 'nullable|numeric|min:0|max:100',
            'recommendation'  => 'nullable|string',
            // Champs requis seulement si mode = delegate
            'assigned_to'     => 'required_if:mode,delegate|nullable|string',
            'assigned_name'   => 'required_if:mode,delegate|nullable|string',
            'delegation_note' => 'nullable|string|max:500',
        ]);

        try {
            $user    = Auth::user();
            $isSelf  = $validated['mode'] === 'self';

            Evaluation::create([
                'application_id'  => $id,
                'template_id'     => $validated['template_id'],
                'template_name'   => $validated['template_name'],
                'template_icon'   => $validated['template_icon'] ?? null,
                'answers'         => $isSelf ? ($validated['answers'] ?? []) : null,
                'score'           => $isSelf ? ($validated['score']   ?? 0)  : null,
                'recommendation'  => $isSelf ? ($validated['recommendation'] ?? null) : null,
                'mode'            => $validated['mode'],
                'statut'          => $isSelf ? 'completed' : 'pending',
                'created_by'      => (string) $user->id,
                'created_by_name' => $user->name,
                'assigned_to'     => $isSelf ? null : ($validated['assigned_to']   ?? null),
                'assigned_name'   => $isSelf ? null : ($validated['assigned_name'] ?? null),
                'delegation_note' => $isSelf ? null : ($validated['delegation_note'] ?? null),
                'completed_at'    => $isSelf ? now() : null,
            ]);

            $msg = $isSelf
                ? 'Évaluation enregistrée.'
                : "Demande envoyée à {$validated['assigned_name']}.";

            return response()->json(['success' => true, 'message' => $msg], 201);

        } catch (\Exception $e) {
            Log::error('Erreur évaluation', ['message' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ── Helper format ──────────────────────────────────────
    private function format(Evaluation $e): array
    {
        return [
            '_id'             => (string) $e->id,
            'template_id'     => $e->template_id,
            'template_name'   => $e->template_name,
            'template_icon'   => $e->template_icon,
            'answers'         => $e->answers ?? [],
            'score'           => $e->score,
            'recommendation'  => $e->recommendation,
            'mode'            => $e->mode,
            'statut'          => $e->statut,
            'created_by_name' => $e->created_by_name,
            'assigned_name'   => $e->assigned_name,
            'delegation_note' => $e->delegation_note,
            'completed_at'    => $e->completed_at?->toIso8601String(),
            'created_at'      => $e->created_at?->toIso8601String(),
        ];
    }
}

