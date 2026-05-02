<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    // GET /api/rh/applications/{id}/messages
    public function index(string $id): JsonResponse
{
    $messages = Message::where('application_id', $id)
        ->orderBy('sent_at', 'asc')
        ->get()
        ->map(fn($m) => [
            'sender_name'   => $m->sender_name,
            'sender_avatar' => $m->sender_avatar ?? null,
            'sender_role'   => $m->sender_role,
            'direction'     => $m->direction ?? 'outbound',  // ✅
            'subject'       => $m->subject,
            'body'          => $m->body,
            'date'          => $m->sent_at?->toIso8601String(),
        ]);

    return response()->json(['success' => true, 'data' => $messages]);
}


public function send(Request $request, string $id): JsonResponse
{
    $validated = $request->validate([
        'subject' => 'required|string|max:200',
        'body'    => 'required|string',
    ]);

    $application = Application::where('_id', $id)->first();
    if (!$application) {
        return response()->json(['success' => false, 'message' => 'Candidature introuvable.'], 404);
    }

    $sender = Auth::user();

    try {

        Mail::html($validated['body'], function ($mail) use ($application, $validated) {
            $mail->to($application->email)
                ->subject($validated['subject'])
                ->replyTo('talentflow.app@gmail.com'); // réponse va dans Gmail
        });

        Message::create([
            'application_id' => $id,
            'sender_id'      => (string) $sender->id,
            'sender_role'    => $sender->role,
            'sender_name'    => $sender->name,
            'sender_avatar'  => $sender->avatar ?? null,
            'subject'        => $validated['subject'],
            'body'           => $validated['body'],
            'direction'      => 'outbound',   // ✅ nouveau champ
            'sent_at'        => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Email envoyé.']);

    } catch (\Exception $e) {
        Log::error('Erreur envoi email', ['message' => $e->getMessage()]);
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}


}