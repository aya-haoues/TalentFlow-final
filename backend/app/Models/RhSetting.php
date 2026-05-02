<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class RhSetting extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'rh_settings';

    protected $fillable = [
        'user_id',
        'notifications',
        'display',
        'privacy',
        'integrations',
        'automation',
    ];

    protected $casts = [
        'notifications' => 'array',
        'display'       => 'array',
        'privacy'       => 'array',
        'integrations'  => 'array',
        'automation'    => 'array',
    ];

    // ── Valeurs par défaut complètes ──────────────────────────
    public static function defaults(): array
{
    return [
        'notifications' => [
            'email_new_application'    => true,
            'email_status_change'      => true,
            'email_interview_reminder' => true,
            'email_weekly_report'      => false,
            'browser_push'             => false,
            'reminder_before_minutes'  => 15,
        ],
        'display' => [
            'items_per_page' => 15,
            'show_ai_scores' => true,
            'compact_mode'   => false,
        ],
        'privacy' => [
            'show_online_status'     => true,
            'share_notes_by_default' => 'rh_only',
            'activity_log_enabled'   => true,
        ],
        'integrations' => [
            'calendar_sync'  => false,
            'slack_webhook'  => '',
            'slack_enabled'  => false,
        ],
        'automation' => [
            'auto_acknowledge'        => true,
            'auto_reject_below_score' => 0,
            'ai_analysis_enabled'     => true,
        ],
    ];
}
    

    // ── Relation vers User ────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}