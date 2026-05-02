<?php
// database/seeders/EmailTemplateSeeder.php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'title'    => '✅ Candidature bien reçue',
                'category' => 'remerciement',
                'subject'  => 'Votre candidature chez Comunik CRM — {{job_title}}',
                'body'     => '
                    <p>Bonjour <strong>{{candidate_name}}</strong>,</p>
                    <p>Nous avons bien reçu votre candidature pour le poste de <strong>{{job_title}}</strong> chez <strong>{{company_name}}</strong>.</p>
                    <p>Notre équipe RH va étudier votre dossier avec attention. Vous recevrez une réponse dans les meilleurs délais.</p>
                    <p>Merci pour l\'intérêt que vous portez à Comunik CRM.</p>
                    <p>Cordialement,<br>L\'équipe RH — {{company_name}}</p>
                ',
            ],
            [
                'title'    => '📅 Invitation entretien téléphonique',
                'category' => 'interview_phone',
                'subject'  => 'Invitation à un entretien téléphonique — {{job_title}}',
                'body'     => '
                    <p>Bonjour <strong>{{candidate_name}}</strong>,</p>
                    <p>Votre candidature pour le poste de <strong>{{job_title}}</strong> chez <strong>{{company_name}}</strong> a retenu notre attention.</p>
                    <p>Nous souhaitons vous proposer un entretien téléphonique.</p>
                    <p>Veuillez choisir le créneau qui vous convient :</p>
                    <p style="margin: 20px 0;">
                        <a href="{{planning_link}}" style="background-color: #00a89c; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                            📅 Choisir mon créneau
                        </a>
                    </p>
                    <p>Cordialement,<br>L\'équipe RH — {{company_name}}</p>
                ',
            ],
            [
                'title'    => '❌ Candidature non retenue',
                'category' => 'refus',
                'subject'  => 'Réponse à votre candidature — {{job_title}}',
                'body'     => '
                    <p>Bonjour <strong>{{candidate_name}}</strong>,</p>
                    <p>Nous avons bien étudié votre candidature pour le poste de <strong>{{job_title}}</strong>.</p>
                    <p>Après examen attentif de votre dossier, nous avons le regret de vous informer que votre candidature n\'a pas été retenue pour ce poste.</p>
                    <p>Nous vous encourageons à postuler à nos futures offres sur notre plateforme.</p>
                    <p>Nous vous souhaitons bonne continuation dans vos recherches.</p>
                    <p>Cordialement,<br>L\'équipe RH — {{company_name}}</p>
                ',
            ],
            [
                'title'    => '🎉 Candidature acceptée — Offre d\'emploi',
                'category' => 'acceptation',
                'subject'  => 'Félicitations ! Votre candidature est retenue — {{job_title}}',
                'body'     => '
                    <p>Bonjour <strong>{{candidate_name}}</strong>,</p>
                    <p>Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>{{job_title}}</strong> chez <strong>{{company_name}}</strong> a été retenue.</p>
                    <p>Notre équipe va vous contacter prochainement pour vous communiquer les prochaines étapes.</p>
                    <p>Bienvenue dans l\'équipe Comunik CRM ! 🎉</p>
                    <p>Cordialement,<br>L\'équipe RH — {{company_name}}</p>
                ',
            ],
            [
                'title'    => '🔔 Relance — Pas de réponse',
                'category' => 'relance',
                'subject'  => 'Rappel — Votre candidature chez {{company_name}}',
                'body'     => '
                    <p>Bonjour <strong>{{candidate_name}}</strong>,</p>
                    <p>Nous revenons vers vous concernant votre candidature pour le poste de <strong>{{job_title}}</strong>.</p>
                    <p>Êtes-vous toujours intéressé(e) par cette opportunité ?</p>
                    <p>Merci de nous répondre dès que possible.</p>
                    <p>Cordialement,<br>L\'équipe RH — {{company_name}}</p>
                ',
            ],
            [
                'title'    => '⏱ Test technique Laravel/PHP',
                'category' => 'questionnaire_tech',
                'subject'  => 'Test technique — {{job_title}} chez {{company_name}}',
                'body'     => '
                    <p>Bonjour <strong>{{candidate_name}}</strong>,</p>
                    <p>Dans le cadre de votre candidature pour le poste de <strong>{{job_title}}</strong>, nous vous invitons à réaliser un test technique.</p>
                    <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #00a89c; background: #f9f9f9;">
                        <p><strong>⏱ Durée :</strong> 30 minutes</p>
                        <p><strong>📋 Type :</strong> Questions PHP/Laravel</p>
                    </div>
                    <p>Cordialement,<br>L\'équipe RH — {{company_name}}</p>
                ',
            ],
            [
                'title'    => '🧠 Questionnaire motivation',
                'category' => 'questionnaire_motivation',
                'subject'  => 'Questionnaire de motivation — {{job_title}}',
                'body'     => '
                    <p>Bonjour <strong>{{candidate_name}}</strong>,</p>
                    <p>Afin de mieux vous connaître, nous vous invitons à répondre à un court questionnaire de motivation.</p>
                    <p>Ce questionnaire nous aidera à mieux comprendre votre profil et vos aspirations professionnelles.</p>
                    <p>Cordialement,<br>L\'équipe RH — {{company_name}}</p>
                ',
            ],
        ];

        foreach ($templates as $tpl) {
            EmailTemplate::create($tpl);
        }

        $this->command->info('✅ ' . count($templates) . ' templates email créés');
    }
}