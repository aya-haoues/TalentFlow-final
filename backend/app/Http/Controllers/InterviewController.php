<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InterviewController extends Controller
{
    // ── GET /api/rh/applications/{id}/interviews ──────────
    public function index(string $id): JsonResponse
    {
        $interviews = Interview::where('application_id', $id)
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get()
            ->map(fn($i) => $this->formatInterview($i));

        return response()->json(['success' => true, 'data' => $interviews]);
    }

    // ── POST /api/rh/applications/{id}/interviews ─────────
    public function store(Request $request, string $id): JsonResponse
{
    $validated = $request->validate([
        'type'             => 'required|in:telephonique,visio,presentiel,technique',
        'date'             => 'required|string',
        'time'             => 'required|string',
        'duration_minutes' => 'required|integer|min:15|max:240',
        'location'         => 'nullable|string|max:300',
        'meeting_url'      => 'nullable|string',
        'participants'     => 'nullable|array',
        'participants.*.id'   => 'sometimes|string',
        'participants.*.name' => 'sometimes|string',
        'participants.*.role' => 'sometimes|string',
        'note'             => 'nullable|string|max:1000',
        'note_visibility'  => 'required|in:rh_only,manager,candidat',
        'candidate_name'   => 'nullable|string',
        'candidate_email'  => 'nullable|email',
    ]);
 
    // Vérification : la date n'est pas dans le passé
    $interviewDatetime = \Carbon\Carbon::parse(
        $validated['date'] . ' ' . $validated['time']
    );
    if ($interviewDatetime->isPast()) {
        return response()->json([
            'success' => false,
            'message' => 'La date et l\'heure de l\'entretien ne peuvent pas être dans le passé.',
        ], 422);
    }
 
    $application = Application::where('_id', $id)->first();
    if (!$application) {
        return response()->json([
            'success' => false,
            'message' => 'Candidature introuvable.',
        ], 404);
    }
 
    $user = Auth::user();
 
    try {
        // ── Création de l'entretien ───────────────────────────
        $interview = Interview::create([
            'application_id'   => $id,
            'candidate_name'   => $validated['candidate_name']  ?? $application->full_name,
            'candidate_email'  => $validated['candidate_email'] ?? $application->email,
            'type'             => $validated['type'],
            'date'             => $validated['date'],
            'time'             => $validated['time'],
            'duration_minutes' => $validated['duration_minutes'],
            'location'         => $validated['location']    ?? null,
            'meeting_url'      => $validated['meeting_url'] ?? null,
            'participants'     => $validated['participants'] ?? [],
            'note'             => $validated['note']        ?? null,
            'note_visibility'  => $validated['note_visibility'],
            'statut'           => 'planifie',
            'created_by'       => (string) $user->id,
            'created_by_name'  => $user->name,
            'google_event_id'  => null,
        ]);
 
        // ── Mise à jour du statut de la candidature ───────────
        $application->statut                   = 'entretien';
        $application->date_derniere_modification = now();
        $application->save();
 
        // ── Sync Google Calendar ──────────────────────────────
        /** @var \App\Services\GoogleCalendarService $calendarService */
        $calendarService = app(\App\Services\GoogleCalendarService::class);
        $rhUserId        = (string) $user->id;
 
        if ($calendarService->isConnected($rhUserId)) {
            $job      = \App\Models\Job::find($application->job_id);
            $jobTitle = $job?->title ?? $job?->titre ?? 'Poste non précisé';
 
            $eventData = $calendarService->buildInterviewEvent(
                candidateName:   $interview->candidate_name  ?? '',
                candidateEmail:  $interview->candidate_email ?? '',
                jobTitle:        $jobTitle,
                type:            $interview->type,
                date:            $interview->date,
                time:            $interview->time,
                durationMinutes: (int) $interview->duration_minutes,
                location:        $interview->location   ?? null,
                meetingUrl:      $interview->meeting_url ?? null,
                note:            $interview->note        ?? null,
                participants:    $interview->participants ?? [],
            );
 
            // ✅ createEvent gère refresh du token + conferenceDataVersion en interne
            $googleEventId = $calendarService->createEvent($rhUserId, $eventData);
 
            if ($googleEventId) {
                // ✅ attribut direct + save() — update() peut rater sur MongoDB
                // si l'_id n'est pas encore propagé dans le même cycle de requête
                $interview->google_event_id = $googleEventId;
                $interview->save();
 
                Log::info('Google Calendar event lié à l\'entretien', [
                    'interview_id'    => (string) $interview->id,
                    'google_event_id' => $googleEventId,
                ]);
            } else {
                Log::warning('Google Calendar createEvent a retourné null — entretien créé sans sync', [
                    'interview_id' => (string) $interview->id,
                    'user_id'      => $rhUserId,
                ]);
            }
        }
 
        // ── Email de convocation au candidat ──────────────────
        $this->sendCandidateInvitation($interview, $application);
 
        return response()->json([
            'success' => true,
            'message' => 'Entretien planifié avec succès.',
            'data'    => $this->formatInterview($interview),
        ], 201);
 
    } catch (\Exception $e) {
        Log::error('Erreur création entretien', [
            'message' => $e->getMessage(),
            'trace'   => $e->getTraceAsString(),
        ]);
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 500);
    }
}

    // ── DELETE /api/rh/applications/{id}/interviews/{iid} ─
    public function destroy(string $id, string $iid): JsonResponse
    {
        $interview = Interview::where('_id', $iid)
            ->where('application_id', $id)
            ->first();

        if (!$interview) {
            return response()->json(['success' => false, 'message' => 'Entretien introuvable.'], 404);
        }

        // ── Supprimer de Google Calendar ──────────────────────────
if ($interview->google_event_id) {
    $calendarService = app(\App\Services\GoogleCalendarService::class);
    $calendarService->deleteEvent($interview->created_by, $interview->google_event_id);
}

        $interview->delete();

        return response()->json(['success' => true, 'message' => 'Entretien supprimé.']);
    }

    // ── GET /api/rh/interviews — tous les entretiens du RH ─
    public function rhDashboard(Request $request): JsonResponse
    {
        $userId = (string) Auth::id();

        $query = Interview::where('created_by', $userId);

        // Filtre 
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('from')) {
            $query->where('date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('date', '<=', $request->to);
        }

        // Prochains entretiens uniquement
        if ($request->boolean('upcoming')) {
            $query->where('date', '>=', now()->format('Y-m-d'))
                  ->where('statut', '!=', 'annule');
        }

        $interviews = $query->orderBy('date', 'asc')
                            ->orderBy('time', 'asc')
                            ->limit(50)
                            ->get()
                            ->map(fn($i) => $this->formatInterview($i));

        return response()->json(['success' => true, 'data' => $interviews]);
    }

    // ── Helper — formater un entretien pour la réponse JSON ─
    private function formatInterview(Interview $i): array
    {
        return [
            '_id'              => (string) $i->id,
            'application_id'   => $i->application_id,
            'candidate_name'   => $i->candidate_name,
            'candidate_email'  => $i->candidate_email,
            'type'             => $i->type,
            'date'             => $i->date,
            'time'             => $i->time,
            'duration_minutes' => $i->duration_minutes,
            'location'         => $i->location,
            'meeting_url'      => $i->meeting_url,
            'participants'     => $i->participants ?? [],
            'note'             => $i->note,
            'note_visibility'  => $i->note_visibility,
            'statut'           => $i->statut,
            'created_by'       => $i->created_by,
            'created_by_name'  => $i->created_by_name,
            'created_at'       => $i->created_at?->toIso8601String(),
            // Champ calculé — date/heure combinée
            'datetime'         => $i->date && $i->time
                ? \Carbon\Carbon::parse($i->date . ' ' . $i->time)->toIso8601String()
                : null,
        ];
    }


    private function sendCandidateInvitation(Interview $interview, Application $application): void
    {
        $typeLabels = [
            'telephonique' => 'téléphonique',
            'visio'        => 'en visioconférence',
            'presentiel'   => 'en présentiel',
            'technique'    => 'technique',
        ];

        $typeLabel = $typeLabels[$interview->type] ?? $interview->type;
        $dateFormatted = \Carbon\Carbon::parse($interview->date)
            ->locale('fr')
            ->isoFormat('dddd D MMMM YYYY');
        $duration = $interview->duration_minutes . ' min';

        $body = "
        <div style='font-family:sans-serif;max-width:560px;margin:0 auto;color:#262626;'>
            <div style='background:#00a89c;padding:24px;text-align:center;border-radius:8px 8px 0 0;'>
                <h2 style='color:#fff;margin:0;font-size:22px;'> Invitation à un entretien</h2>
            </div>
            <div style='padding:28px;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px;'>
                <p>Bonjour <strong>{$interview->candidate_name}</strong>,</p>
                <p>Nous avons le plaisir de vous convier à un entretien <strong>{$typeLabel}</strong> pour le poste que vous avez postulé.</p>

                <div style='background:#f9fffe;border:1px solid #00a89c30;border-left:4px solid #00a89c;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;'>
                    <p style='margin:0 0 8px;'><strong> Date :</strong> {$dateFormatted}</p>
                    <p style='margin:0 0 8px;'><strong> Heure :</strong> {$interview->time}</p>
                    <p style='margin:0 0 8px;'><strong> Durée estimée :</strong> {$duration}</p>
                    " . ($interview->location
                        ? "<p style='margin:0;'><strong> Lieu :</strong> {$interview->location}</p>"
                        : '') . "
                    " . ($interview->meeting_url
                        ? "<p style='margin:0;'><strong>🔗 Lien :</strong> <a href='{$interview->meeting_url}' style='color:#00a89c;'>{$interview->meeting_url}</a></p>"
                        : '') . "
                </div>

                " . ($interview->note && $interview->note_visibility === 'candidat'
                    ? "<p><strong>Note :</strong> {$interview->note}</p>"
                    : '') . "

                <p>Merci de confirmer votre présence en répondant à cet email.</p>
                <p style='color:#8c8c8c;font-size:13px;margin-top:24px;'>Cordialement,<br>L'équipe TalentFlow</p>
            </div>
        </div>
        ";

        try {
            Mail::html($body, function ($mail) use ($interview) {
                $mail->to($interview->candidate_email)
                     ->subject("Invitation entretien — TalentFlow")
                     ->replyTo('talentflow.app@gmail.com');
            });
        } catch (\Exception $e) {
            Log::warning('Email invitation entretien non envoyé', ['error' => $e->getMessage()]);
        }
    }

}