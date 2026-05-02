<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EmailTemplateController extends Controller
{
    // GET /api/rh/email-templates
    public function index(): JsonResponse
    {
        try {
            // Récupère tous les templates triés par catégorie
            $templates = EmailTemplate::orderBy('category', 'asc')->get();

            return response()->json([
                'success' => true,
                'data'    => $templates,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des modèles: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'    => 'required|string|max:255',
            'subject'  => 'required|string|max:255',
            'body'     => 'required|string',
            'category' => 'required|in:remerciement,relance,refus,acceptation,interview_phone,questionnaire_tech,questionnaire_motivation,questionnaire_reminder,autre',
        ]);

        try {
            $template = EmailTemplate::create([
                'title'      => $validated['title'],
                'subject'    => $validated['subject'],
                'body'       => $validated['body'],
                'category'   => $validated['category'],
                'created_by' => (string) Auth::id(), 
            ]);

            return response()->json([
                'success' => true,
                'data'    => $template,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Erreur lors de la création : " . $e->getMessage()
            ], 500);
        }
    }
}