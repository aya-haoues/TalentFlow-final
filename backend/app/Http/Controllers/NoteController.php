<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    // GET /rh/applications/{id}/notes
    public function index(string $id): JsonResponse
    {
        $notes = Note::where('application_id', $id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($note) => $this->formatNote($note));

        return response()->json([
            'success' => true,
            'data'    => $notes,
        ]);
    }

    // POST /rh/applications/{id}/notes
    public function store(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'notes_internes'  => 'required|string',
            'note_visibility' => 'required|in:rh_only,shared_manager',
            'mentions'        => 'nullable|array',
            'mentions.*'      => 'string',
        ]);

        $user = Auth::user();

        // Résoudre les IDs de mentions en {id, name}
        $mentionsResolved = collect($validated['mentions'] ?? [])
            ->map(fn($mid) => User::find($mid))
            ->filter()
            ->map(fn($u) => ['id' => (string) $u->id, 'name' => $u->name])
            ->values()
            ->toArray();

        $note = Note::create([
            'application_id'  => $id,
            'author_id'       => (string) $user->id,
            'notes_internes'  => $validated['notes_internes'],
            'note_visibility' => $validated['note_visibility'],
            'mentions'        => $mentionsResolved,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatNote($note->load('author')),
        ], 201);
    }

    // GET /rh/team-members
    public function teamMembers(): JsonResponse
    {
        $members = User::whereIn('role', ['rh', 'manager'])
            ->get(['_id', 'name', 'role'])
            ->map(fn($u) => [
                'id'   => (string) $u->id,
                'name' => $u->name,
                'role' => $u->role,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $members,
        ]);
    }

    // ── Helper : format uniforme retourné au frontend ──────
    private function formatNote(Note $note): array
    {
        // Charge l'auteur si pas déjà chargé
        $author = $note->relationLoaded('author')
            ? $note->author
            : User::find($note->author_id);

        return [
            'id'              => (string) $note->id,
            'notes_internes'  => $note->notes_internes,
            'note_visibility' => $note->note_visibility,
            'mentions'        => $note->mentions ?? [],
            'author'          => [
                'id'   => (string) ($author?->id ?? $note->author_id),
                'name' => $author?->name ?? 'Inconnu',
                'role' => $author?->role ?? 'rh',
            ],
            'created_at'      => $note->created_at?->toISOString(),
        ];
    }

    // DELETE /rh/notes/{id}
// DELETE /rh/notes/{id}
public function destroy(string $id): JsonResponse
{
    // On cherche la note par son ID (MongoDB ou SQL)
    $note = Note::find($id);

    if (!$note) {
        return response()->json([
            'success' => false,
            'message' => 'Note introuvable.',
        ], 404);
    }

    // Sécurité : Seul l'auteur peut supprimer sa propre note
    // Tu peux ajouter une condition '|| Auth::user()->role === "admin"' si besoin
    if ($note->author_id !== (string) Auth::id()) {
        return response()->json([
            'success' => false,
            'message' => 'Vous n\'êtes pas autorisé à supprimer cette note.',
        ], 403);
    }

    $note->delete();

    return response()->json([
        'success' => true,
        'message' => 'Note supprimée avec succès.',
    ]);
}


}