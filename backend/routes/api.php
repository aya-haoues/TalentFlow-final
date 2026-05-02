<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\CandidatController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\CvAnalysisController;
use App\Http\Controllers\RhController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\RhSettingsController;
use App\Http\Controllers\GoogleCalendarController;



// ✅ PREMIÈRE LIGNE après les use statements — avant TOUT
Route::get('/jobs/active', [JobController::class, 'activeForN8n']);
Route::get('/auth/google/calendar/callback', [GoogleCalendarController::class, 'handleCallback']);

Route::get('/rh/google/calendar/debug', [GoogleCalendarController::class, 'debug']);

/* ═══════════════════════════════════════════════════════
   🌐 ROUTES PUBLIQUES
   ═══════════════════════════════════════════════════════ */

// OAuth — stateless, pas de throttle
Route::prefix('auth')->name('auth.')->group(function () {
    Route::get('/google/redirect',   [AuthController::class, 'redirectToGoogle'])  ->name('google.redirect');
    Route::get('/google/callback',   [AuthController::class, 'handleGoogleCallback'])->name('google.callback');
    Route::get('/linkedin/redirect', [AuthController::class, 'redirectToLinkedIn']) ->name('linkedin.redirect');
    Route::get('/linkedin/callback', [AuthController::class, 'handleLinkedInCallback'])->name('linkedin.callback');
});

// Inscription & Connexion
Route::middleware('throttle:public')->name('auth.')->group(function () {
    Route::post('/register/candidat', [AuthController::class, 'registerCandidat'])->name('register.candidat');
    Route::post('/register/rh',       [AuthController::class, 'registerRh'])      ->name('register.rh');
    Route::post('/register/manager',  [AuthController::class, 'registerManager']) ->name('register.manager');
    Route::post('/login',             [AuthController::class, 'login'])            ->name('login');
    Route::post('/login/admin',       [AuthController::class, 'loginAdmin'])       ->name('login.admin');

    // ✅ Ajouter ces deux routes
    Route::post('/login/rh',          [AuthController::class, 'login'])            ->name('login.rh');
    Route::post('/login/manager',     [AuthController::class, 'login'])            ->name('login.manager');
});


// Offres publiées
Route::get('/jobs',      [JobController::class, 'publicIndex'])->name('jobs.index');
Route::get('/jobs/{job}', [JobController::class, 'publicShow'])->name('jobs.show');
//           ↑
//  Route Model Binding — Laravel trouve le Job automatiquement

// Départements
Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');

/* ═══════════════════════════════════════════════════════
   🔐 ROUTES AUTHENTIFIÉES
   ═══════════════════════════════════════════════════════ */

Route::middleware(['auth.mongo', 'throttle:api'])->group(function () {

    Route::get('/user', function (Request $request) {
        return new \App\Http\Resources\UserResource($request->user());
    })->name('user.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

    /* ── Candidat ── */
    Route::prefix('candidat')->name('candidat.')->group(function () {
        Route::get('/profile',  [CandidatController::class, 'showProfile'])  ->name('profile.show');
        Route::post('/profile', [CandidatController::class, 'updateProfile'])->name('profile.update');
        Route::get('/dashboard/stats', [CandidatController::class, 'dashboardStats'])->name('dashboard.stats');
        Route::get('/applications',              [ApplicationController::class, 'myApplications'])->name('applications.index');
        Route::get('/applications/{application}',[ApplicationController::class, 'show'])          ->name('applications.show');
        Route::get('/applications', [CandidatController::class, 'search']);
    });

    Route::post('/applications', [ApplicationController::class, 'store'])->name('applications.store');




    /* ── RH ── */
    Route::middleware('role:rh')->prefix('rh')->name('rh.')->group(function () {
        // ✅ stats avant {application} — évite conflit
        Route::get('/applications/stats', [ApplicationController::class, 'statsRh'])->name('applications.stats');

        Route::get('/jobs',           [JobController::class, 'index']) ->name('jobs.index');
        Route::post('/jobs',          [JobController::class, 'store']) ->name('jobs.store');
        Route::get('/jobs/{job}',     [JobController::class, 'show'])  ->name('jobs.show');
        Route::put('/jobs/{job}',     [JobController::class, 'update'])->name('jobs.update');
        Route::delete('/jobs/{job}',  [JobController::class, 'destroy'])->name('jobs.destroy');
        //              ↑ Route Model Binding

    
        Route::get('/applications',              [ApplicationController::class, 'indexRh']) ->name('applications.index');
        Route::get('/applications/{application}',[ApplicationController::class, 'showRh'])  ->name('applications.show');

        Route::patch('applications/{application}/status', [ApplicationController::class, 'updateStatus']);
        Route::patch('applications/{application}/notes',  [ApplicationController::class, 'updateNote']); // ← ajouter
        Route::get('applications/{id}/notes', [ApplicationController::class, 'getNotes']);

        Route::get('/applications/{id}/messages',            [MessageController::class, 'index']) ;
        Route::post('/applications/{id}/send-email',         [MessageController::class, 'send'])  ;

        Route::get('/team-members', [RhController::class, 'getTeamMembers']);

        Route::get('/applications/{id}/notes',  [NoteController::class, 'index']);
        Route::post('/applications/{id}/notes', [NoteController::class, 'store']);
        Route::get('/team-members',             [NoteController::class, 'teamMembers']);
        //Route::delete('/applications/{applicationId}/notes/{noteId}', [NoteController::class, 'destroy']);
        Route::delete('/notes/{id}', [NoteController::class, 'destroy']);


Route::prefix('analytics')->name('analytics.')->group(function () {
    Route::get('/kpis',                [AnalyticsController::class, 'kpis']);
    Route::get('/score-distribution',  [AnalyticsController::class, 'scoreDistribution']);
    Route::get('/decisions',           [AnalyticsController::class, 'decisions']);
    Route::get('/criteria-radar',      [AnalyticsController::class, 'criteriaRadar']);
    Route::get('/offre-stats',         [AnalyticsController::class, 'offreStats']);
    Route::get('/timeline',            [AnalyticsController::class, 'timeline']);
    Route::get('/top-candidates',      [AnalyticsController::class, 'topCandidates']);
});

Route::get('/settings',             [RhSettingsController::class, 'show']);
Route::put('/settings',             [RhSettingsController::class, 'update']);
Route::get('/settings/api-key',     [RhSettingsController::class, 'getApiKey']);
Route::get('/settings/export',      [RhSettingsController::class, 'exportData']);
Route::post('/settings/test-slack', [RhSettingsController::class, 'testSlack']);
Route::get('/sessions',             [RhSettingsController::class, 'getSessions']);
Route::delete('/sessions',          [RhSettingsController::class, 'revokeAllSessions']);
Route::delete('/sessions/{id}',     [RhSettingsController::class, 'revokeSession']);


    Route::prefix('google/calendar')->group(function () {
        Route::get('/status',      [GoogleCalendarController::class, 'status']);
        Route::get('/auth-url',    [GoogleCalendarController::class, 'getAuthUrl']);
        Route::delete('/disconnect', [GoogleCalendarController::class, 'disconnect']);

    });

  Route::get('/applications/{id}/interviews',          [InterviewController::class, 'index']);
    Route::post('/applications/{id}/interviews',         [InterviewController::class, 'store']);
    Route::patch('/applications/{id}/interviews/{iid}',  [InterviewController::class, 'update']);
    Route::delete('/applications/{id}/interviews/{iid}', [InterviewController::class, 'destroy']);

    // ── Dashboard global des entretiens du RH ─────────────
    Route::get('/interviews',                            [InterviewController::class, 'rhDashboard']);

    Route::get('/applications', [CandidatController::class, 'index']);

// Assurez-vous que la méthode est PATCH pour correspondre au hook
Route::patch('/rh/applications/{id}/notes', [ApplicationController::class, 'updateStatus']);    });

Route::get('/rh/profile',    [RhController::class, 'show']);
    Route::put('/rh/profile',    [RhController::class, 'update']);
    Route::post('/rh/profile/avatar', [RhController::class, 'updateAvatar']);
    Route::put('/rh/profile/password', [RhController::class, 'updatePassword']);


   

    /* ── Admin ── */
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats'])->name('stats');

        // ✅ pending avant {user} — évite conflit
        Route::get('/users/pending',         [AdminController::class, 'pending'])    ->name('users.pending');
        Route::get('/users',                 [AdminController::class, 'index'])      ->name('users.index');
        Route::post('/users/{user}/approve', [AdminController::class, 'approve'])   ->name('users.approve');
        Route::post('/users/{user}/reject',  [AdminController::class, 'reject'])    ->name('users.reject');
        Route::post('/users/{user}/toggle',  [AdminController::class, 'toggleBlock'])->name('users.toggle');
        Route::delete('/users/{user}',       [AdminController::class, 'destroy'])   ->name('users.destroy');
        //                    ↑ Route Model Binding

        Route::get('/departments',              [AdminController::class, 'departments'])     ->name('departments.index');
        Route::post('/departments',             [AdminController::class, 'storeDepartment']) ->name('departments.store');
        Route::put('/departments/{department}', [AdminController::class, 'updateDepartment'])->name('departments.update');
        Route::delete('/departments/{department}',[AdminController::class,'destroyDepartment'])->name('departments.destroy');
        //                         ↑ Route Model Binding
    });
});

/* ═══════════════════════════════════════════════════════
   🚫 FALLBACK — Toujours en dernier
   ═══════════════════════════════════════════════════════ */
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Route introuvable',
    ], 404);
});


// ── Vérification Email ────────────────────────────
Route::middleware('auth.mongo')->group(function () {
    Route::get('/email/verify',
        [EmailVerificationController::class, 'notice'])
        ->name('verification.notice');

    Route::post('/email/verify',
        [EmailVerificationController::class, 'verify'])
        ->name('verification.verify');

    Route::post('/email/resend-verification',
        [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});



// Demander le lien
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);

// Réinitialiser le mot de passe (via le lien reçu)
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);



Route::post('/candidates/{id}/send-email', [CandidatController::class, 'send'])   ->name('candidates.send');

Route::get('/email-templates', [EmailTemplateController::class,  'index'])  ->name('email-templates.index');
Route::post('/email-templates', [EmailTemplateController::class,  'store'])  ->name('email-templates.store');





/*Route::middleware(['auth.mongo', 'role:rh'])->prefix('rh')->name('rh.')->group(function () {

    // ... routes existantes ...

    // ── Évaluations ──────────────────────────────────────
    Route::get('/applications/{id}/evaluations',        [EvaluationController::class, 'index']);
    Route::post('/applications/{id}/evaluations',       [EvaluationController::class, 'store']);
    Route::post('/applications/{id}/evaluation-requests', [EvaluationController::class, 'storeRequest']);

    // ── Entretiens ───────────────────────────────────────
    Route::get('/applications/{id}/interviews',         [EvaluationController::class, 'indexInterviews']);
    Route::post('/applications/{id}/interviews',        [EvaluationController::class, 'storeInterview']);
});*/

Route::middleware(['auth.mongo', 'role:rh'])->prefix('rh')->name('rh.')->group(function () {

    // Une seule route POST gère self ET delegate
    Route::get('/applications/{id}/evaluations',  [EvaluationController::class, 'index']);
    Route::post('/applications/{id}/evaluations', [EvaluationController::class, 'store']);
});



// routes/api.php
// Utilise une structure plus standard "REST" pour ton PFE

Route::post('/analyze-cv/{id}', [CvAnalysisController::class, 'analyze']);
Route::post('/cv-analysis/send/{id}', [CvAnalysisController::class, 'sendToN8n']);
Route::post('/cv-analysis/update/{id}', [CvAnalysisController::class, 'updateAnalysis']);
// Ajouter cette ligne dans routes/api.php
Route::get('/cv/download/{filename}', [CvAnalysisController::class, 'downloadCv']);






