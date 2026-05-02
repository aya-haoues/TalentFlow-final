import React, { useState, useEffect, useCallback } from 'react';
import { Switch, Select, Slider, Spin, message, Modal, Input } from 'antd';
import { useParams } from 'react-router-dom';
import {
    BellOutlined, EyeOutlined, SafetyOutlined, MailOutlined,
    DesktopOutlined, CheckCircleOutlined, CloseCircleOutlined,
    ExclamationCircleOutlined, ThunderboltOutlined, CalendarOutlined,
    FileTextOutlined, ApiOutlined, KeyOutlined, ReloadOutlined,
    LockOutlined, RobotOutlined, LinkOutlined,
} from '@ant-design/icons';
import RhLayout from './components/RhLayout';
import api from '../../services/api';
import { PRIMARY } from '../../theme/colors';
import { GoogleCalendarCard } from './components/GoogleCalendarCard';

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface RhSettings {
    notifications: {
        email_new_application:    boolean;
        email_status_change:      boolean;
        email_interview_reminder: boolean;
        email_weekly_report:      boolean;
        browser_push:             boolean;
        reminder_before_minutes:  number;
    };
    display: {
        items_per_page: number;
        show_ai_scores: boolean;
        compact_mode:   boolean;
    };
    privacy: {
        show_online_status:     boolean;
        share_notes_by_default: string;
        activity_log_enabled:   boolean;
    };
    integrations: {
        calendar_sync:  boolean;
        slack_webhook:  string;
        slack_enabled:  boolean;
    };
    automation: {
        auto_acknowledge:        boolean;
        auto_reject_below_score: number;
        ai_analysis_enabled:     boolean;
    };
}

// ══════════════════════════════════════════════════════════════
// ONGLETS
// ══════════════════════════════════════════════════════════════



// ══════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ══════════════════════════════════════════════════════════════

const PageHeader: React.FC<{
    title: string; subtitle: string; icon: React.ReactNode; accent: string;
}> = ({ title, subtitle, icon, accent }) => (
    <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 22, color: accent }}>{icon}</span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>{title}</h2>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#8c8c8c', paddingLeft: 34 }}>{subtitle}</p>
    </div>
);

const SettingCard: React.FC<{
    icon: React.ReactNode; title: string; subtitle: string;
    accent: string; children: React.ReactNode;
}> = ({ icon, title, subtitle, accent, children }) => (
    <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
        overflow: 'hidden', marginBottom: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 22px', borderBottom: '1px solid #f5f5f5',
            background: `linear-gradient(135deg, ${accent}08, transparent)`,
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: 10, background: `${accent}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accent, fontSize: 16,
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{title}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{subtitle}</div>
            </div>
        </div>
        <div style={{ padding: '18px 22px' }}>{children}</div>
    </div>
);

const SettingRow: React.FC<{
    label: string; description?: string; control: React.ReactNode; last?: boolean;
}> = ({ label, description, control, last = false }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: last ? 0 : 14, marginBottom: last ? 0 : 14,
        borderBottom: last ? 'none' : '1px solid #f5f5f5', gap: 16,
    }}>
        <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</div>
            {description && (
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{description}</div>
            )}
        </div>
        <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
);

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════

export default function RhSettings() {
    const [settings,    setSettings]    = useState<RhSettings | null>(null);
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState<string | null>(null);
    const [showApiKey,  setShowApiKey]  = useState(false);
    const [apiKey,      setApiKey]      = useState('');
    const [slackTest,   setSlackTest]   = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
    const [deleteModal, setDeleteModal] = useState(false);

    const { tab } = useParams<{ tab?: string }>();
    const activeTab = tab ?? 'notifications';

    // ── Chargement ────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/rh/settings');
                setSettings(res.data.data);
            } catch {
                message.error('Erreur lors du chargement des paramètres');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── Sauvegarde ────────────────────────────────────────────
    const save = useCallback(async (section: string, patch: Partial<RhSettings>) => {
        setSaving(section);
        try {
            const res = await api.put('/rh/settings', patch);
            setSettings(res.data.data);
            message.success('Enregistré');
        } catch {
            message.error('Erreur lors de la sauvegarde');
        } finally {
            setSaving(null);
        }
    }, []);

    // ── Update local ──────────────────────────────────────────
    const update = useCallback(<S extends keyof RhSettings>(
        section: S, key: keyof RhSettings[S], value: unknown,
    ) => {
        setSettings(prev => {
            if (!prev) return prev;
            return { ...prev, [section]: { ...prev[section], [key]: value } };
        });
    }, []);

    // ── Update + save ─────────────────────────────────────────
    const updateAndSave = useCallback(<S extends keyof RhSettings>(
        section: S, key: keyof RhSettings[S], value: unknown,
    ) => {
        setSettings(prev => {
            if (!prev) return prev;
            const updated = { ...prev, [section]: { ...prev[section], [key]: value } };
            save(section as string, { [section]: updated[section as keyof RhSettings] });
            return updated;
        });
    }, [save]);

    // ── Switch helper ─────────────────────────────────────────
    const sw = (section: keyof RhSettings, key: string) => (
        <Switch
            checked={!!((settings?.[section] as Record<string, unknown>)?.[key])}
            onChange={v => {
                update(section, key as keyof RhSettings[typeof section], v);
                save(section as string, {
                    [section]: { ...(settings?.[section] as Record<string, unknown>), [key]: v },
                });
            }}
            loading={saving === section}
            style={{
                background: ((settings?.[section] as Record<string, unknown>)?.[key])
                    ? PRIMARY : '#d9d9d9',
            }}
        />
    );

    // ── Test Slack ────────────────────────────────────────────
    const testSlack = async () => {
        setSlackTest('loading');
        try {
            await api.post('/rh/settings/test-slack', {
                webhook: settings?.integrations.slack_webhook,
            });
            setSlackTest('ok');
        } catch {
            setSlackTest('error');
        } finally {
            setTimeout(() => setSlackTest('idle'), 3000);
        }
    };

    // ── Guards ────────────────────────────────────────────────
    if (loading) return (
        <RhLayout>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" />
            </div>
        </RhLayout>
    );

    if (!settings) return null;

    // ══════════════════════════════════════════════════════════
    // RENDU
    // ══════════════════════════════════════════════════════════

    return (
        <RhLayout>
            <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>


                {/* ── Contenu ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: '#f8f9fa' }}>

                    {/* ══ NOTIFICATIONS ══ */}
                    {activeTab === 'notifications' && (
                        <div>
                            <PageHeader
                                title="Notifications"
                                subtitle="Choisissez quand et comment être alerté"
                                icon={<BellOutlined />} accent="#f59e0b"
                            />

                            <SettingCard
                                icon={<MailOutlined />} title="Emails"
                                subtitle="Alertes envoyées à votre adresse professionnelle"
                                accent="#3b82f6"
                            >
                                <SettingRow label="Nouvelle candidature"    description="Email dès qu'un candidat postule"           control={sw('notifications', 'email_new_application')} />
                                <SettingRow label="Changement de statut"    description="Quand un statut de candidature est modifié" control={sw('notifications', 'email_status_change')} />
                                <SettingRow label="Rappel avant entretien"  description="Email avant chaque entretien planifié"      control={sw('notifications', 'email_interview_reminder')} />
                                <SettingRow label="Rapport hebdomadaire"    description="Synthèse chaque lundi matin"                control={sw('notifications', 'email_weekly_report')} last />
                            </SettingCard>

                            <SettingCard
                                icon={<DesktopOutlined />} title="Navigateur"
                                subtitle="Notifications push en temps réel"
                                accent="#8b5cf6"
                            >
                                <SettingRow
                                    label="Notifications push"
                                    description="Requiert l'autorisation du navigateur"
                                    control={sw('notifications', 'browser_push')}
                                />
                                <SettingRow
                                    label={`Rappel ${settings.notifications.reminder_before_minutes} min avant l'entretien`}
                                    description="Ajustez le délai de rappel"
                                    last
                                    control={
                                        <div style={{ width: 160 }}>
                                            <Slider
                                                min={5} max={60} step={5}
                                                value={settings.notifications.reminder_before_minutes}
                                                onChange={v => update('notifications', 'reminder_before_minutes', v)}
                                                onChangeComplete={v => save('notifications', {
                                                    notifications: { ...settings.notifications, reminder_before_minutes: v },
                                                })}
                                                marks={{ 5: '5m', 30: '30m', 60: '1h' }}
                                                trackStyle={{ background: PRIMARY }}
                                                handleStyle={{ borderColor: PRIMARY }}
                                            />
                                        </div>
                                    }
                                />
                            </SettingCard>
                        </div>
                    )}

                    {/* ══ AFFICHAGE ══ */}
                    {activeTab === 'display' && (
                        <div>
                            <PageHeader
                                title="Affichage"
                                subtitle="Personnalisez l'interface selon vos préférences"
                                icon={<EyeOutlined />} accent={PRIMARY}
                            />

                            <SettingCard
                                icon={<DesktopOutlined />} title="Préférences"
                                subtitle="Densité et comportement de l'interface"
                                accent={PRIMARY}
                            >
                                <SettingRow
                                    label="Afficher les scores IA"
                                    description="Score d'analyse IA visible sur chaque candidature"
                                    control={sw('display', 'show_ai_scores')}
                                />
                                <SettingRow
                                    label="Mode compact"
                                    description="Réduit l'espacement pour afficher plus de contenu"
                                    control={sw('display', 'compact_mode')}
                                />
                                <SettingRow
                                    label="Candidatures par page"
                                    description="Nombre d'éléments affichés par page"
                                    last
                                    control={
                                        <Select
                                            value={settings.display.items_per_page}
                                            onChange={v => {
                                                update('display', 'items_per_page', v);
                                                save('display', { display: { ...settings.display, items_per_page: v } });
                                            }}
                                            options={[10, 15, 25, 50].map(n => ({ value: n, label: `${n} / page` }))}
                                            style={{ width: 120 }}
                                        />
                                    }
                                />
                            </SettingCard>
                        </div>
                    )}

                    {/* ══ AUTOMATISATION ══ */}
                    {activeTab === 'automation' && (
                        <div>
                            <PageHeader
                                title="Automatisation"
                                subtitle="Règles automatiques pour le flux de recrutement"
                                icon={<ThunderboltOutlined />} accent="#8b5cf6"
                            />

                            <SettingCard
                                icon={<RobotOutlined />} title="Intelligence Artificielle"
                                subtitle="Analyse automatique des CV par l'IA"
                                accent="#8b5cf6"
                            >
                                <SettingRow
                                    label="Analyse IA activée"
                                    description="Chaque CV reçu est analysé automatiquement"
                                    control={sw('automation', 'ai_analysis_enabled')}
                                />
                                <SettingRow
                                    label={`Rejet automatique sous ${settings.automation.auto_reject_below_score} pts`}
                                    description='Candidatures sous ce seuil → "Non retenu" automatiquement'
                                    last
                                    control={
                                        <div style={{ width: 180 }}>
                                            <Slider
                                                min={0} max={60} step={5}
                                                value={settings.automation.auto_reject_below_score}
                                                onChange={v => update('automation', 'auto_reject_below_score', v)}
                                                onChangeComplete={v => save('automation', {
                                                    automation: { ...settings.automation, auto_reject_below_score: v },
                                                })}
                                                marks={{ 0: '0', 30: '30', 60: '60' }}
                                                trackStyle={{ background: '#ef4444' }}
                                                handleStyle={{ borderColor: '#ef4444' }}
                                            />
                                        </div>
                                    }
                                />
                            </SettingCard>

                            <SettingCard
                                icon={<CalendarOutlined />} title="Candidatures"
                                subtitle="Automatisations sur le flux de recrutement"
                                accent="#10b981"
                            >
                                <SettingRow
                                    label="Accusé de réception automatique"
                                    description="Email automatique envoyé au candidat à la réception de sa candidature"
                                    control={sw('automation', 'auto_acknowledge')}
                                    last
                                />
                            </SettingCard>
                        </div>
                    )}

                    {/* ══ INTÉGRATIONS ══ */}
                    {activeTab === 'integrations' && (
                        <div>
                            <PageHeader
                                title="Intégrations"
                                subtitle="Connectez TalentFlow à vos outils de travail"
                                icon={<ApiOutlined />} accent="#6366f1"
                            />

                            {/* Google Calendar */}
                            <GoogleCalendarCard
                                calendarSyncEnabled={settings.integrations.calendar_sync}
                                onToggleSync={v => updateAndSave('integrations', 'calendar_sync', v)}
                                onConnected={() => updateAndSave('integrations', 'calendar_sync', true)}
                            />

                            {/* Slack */}
                            <SettingCard
                                icon={<LinkOutlined />} title="Slack"
                                subtitle="Recevez les alertes recrutement dans votre workspace Slack"
                                accent="#4a154b"
                            >
                                <SettingRow
                                    label="Notifications Slack"
                                    control={sw('integrations', 'slack_enabled')}
                                />
                                {settings.integrations.slack_enabled && (
                                    <SettingRow
                                        label="Webhook URL"
                                        description="URL du webhook entrant Slack"
                                        last
                                        control={
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <Input
                                                    value={settings.integrations.slack_webhook}
                                                    onChange={e => update('integrations', 'slack_webhook', e.target.value)}
                                                    onBlur={() => save('integrations', { integrations: settings.integrations })}
                                                    placeholder="https://hooks.slack.com/..."
                                                    style={{ width: 240 }}
                                                />
                                                <button
                                                    onClick={testSlack}
                                                    disabled={slackTest === 'loading'}
                                                    style={{
                                                        padding: '0 14px', borderRadius: 8,
                                                        border: '1px solid #e8e8e8',
                                                        background:
                                                            slackTest === 'ok'    ? '#dcfce7' :
                                                            slackTest === 'error' ? '#fee2e2' : '#fff',
                                                        color:
                                                            slackTest === 'ok'    ? '#16a34a' :
                                                            slackTest === 'error' ? '#dc2626' : '#595959',
                                                        cursor: 'pointer', fontSize: 13, fontWeight: 500,
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                    }}
                                                >
                                                    {slackTest === 'loading' && <ReloadOutlined spin />}
                                                    {slackTest === 'ok'      && <CheckCircleOutlined />}
                                                    {slackTest === 'error'   && <CloseCircleOutlined />}
                                                    {slackTest === 'idle'    ? 'Tester' :
                                                     slackTest === 'loading' ? '...'    :
                                                     slackTest === 'ok'      ? 'OK !'   : 'Échec'}
                                                </button>
                                            </div>
                                        }
                                    />
                                )}
                            </SettingCard>

                            {/* Clé API */}
                            <SettingCard
                                icon={<KeyOutlined />} title="Clé API TalentFlow"
                                subtitle="Pour vos intégrations internes"
                                accent="#f59e0b"
                            >
                                <SettingRow
                                    label="Votre clé API"
                                    description="Ne partagez jamais cette clé publiquement"
                                    last
                                    control={
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Input
                                                value={showApiKey ? apiKey : '••••••••••••••••••••'}
                                                readOnly
                                                style={{ width: 200, fontFamily: 'monospace', fontSize: 12 }}
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (!showApiKey) {
                                                        const res = await api.get('/rh/settings/api-key');
                                                        setApiKey(res.data.key);
                                                    }
                                                    setShowApiKey(v => !v);
                                                }}
                                                style={{
                                                    padding: '0 12px', borderRadius: 8,
                                                    border: '1px solid #e8e8e8', background: '#fff',
                                                    cursor: 'pointer', fontSize: 12, color: '#595959',
                                                }}
                                            >
                                                {showApiKey ? 'Masquer' : 'Afficher'}
                                            </button>
                                            {showApiKey && apiKey && (
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(apiKey); message.success('Copié !'); }}
                                                    style={{
                                                        padding: '0 12px', borderRadius: 8,
                                                        border: '1px solid #e8e8e8', background: '#fff',
                                                        cursor: 'pointer', fontSize: 12, color: '#595959',
                                                    }}
                                                >
                                                    Copier
                                                </button>
                                            )}
                                        </div>
                                    }
                                />
                            </SettingCard>
                        </div>
                    )}

                    {/* ══ CONFIDENTIALITÉ ══ */}
                    {activeTab === 'privacy' && (
                        <div>
                            <PageHeader
                                title="Confidentialité"
                                subtitle="Contrôlez vos données et votre visibilité"
                                icon={<SafetyOutlined />} accent="#10b981"
                            />

                            <SettingCard
                                icon={<LockOutlined />} title="Visibilité"
                                subtitle="Ce que voient vos collègues"
                                accent="#3b82f6"
                            >
                                <SettingRow
                                    label="Statut en ligne visible"
                                    description="Les autres RH voient si vous êtes connecté"
                                    control={sw('privacy', 'show_online_status')}
                                />
                                <SettingRow
                                    label="Partage des notes par défaut"
                                    description="Visibilité appliquée aux nouvelles notes internes"
                                    last
                                    control={
                                        <Select
                                            value={settings.privacy.share_notes_by_default}
                                            onChange={v => {
                                                update('privacy', 'share_notes_by_default', v);
                                                save('privacy', {
                                                    privacy: { ...settings.privacy, share_notes_by_default: v },
                                                });
                                            }}
                                            options={[
                                                { value: 'rh_only',        label: '🔒 RH uniquement' },
                                                { value: 'shared_manager', label: '👁 RH + Manager'  },
                                            ]}
                                            style={{ width: 170 }}
                                        />
                                    }
                                />
                            </SettingCard>

                            <SettingCard
                                icon={<FileTextOutlined />} title="Données"
                                subtitle="Journal d'activité et rétention"
                                accent="#f59e0b"
                            >
                                <SettingRow
                                    label="Journal d'activité"
                                    description="Enregistre vos actions pour audit interne"
                                    control={sw('privacy', 'activity_log_enabled')}
                                />
                                <SettingRow
                                    label="Exporter mes données"
                                    description="Télécharger toutes vos données TalentFlow en JSON"
                                    last
                                    control={
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await api.get('/rh/settings/export', { responseType: 'blob' });
                                                    const url = URL.createObjectURL(res.data);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `talentflow-${new Date().toISOString().slice(0, 10)}.json`;
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                } catch {
                                                    message.error("Erreur lors de l'export");
                                                }
                                            }}
                                            style={{
                                                padding: '6px 16px', borderRadius: 8,
                                                border: '1px solid #e5e7eb', background: '#fff',
                                                cursor: 'pointer', fontSize: 13, color: '#374151',
                                            }}
                                        >
                                            Exporter
                                        </button>
                                    }
                                />
                            </SettingCard>

                            {/* Zone danger */}
                            <div style={{
                                background: '#fff5f5', border: '1px solid #fecaca',
                                borderRadius: 14, padding: '18px 22px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <ExclamationCircleOutlined style={{ color: '#ef4444', fontSize: 16 }} />
                                    <span style={{ fontWeight: 700, fontSize: 14, color: '#ef4444' }}>Zone dangereuse</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 13, color: '#374151' }}>
                                            Supprimer mon compte
                                        </div>
                                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                                            Cette action est irréversible
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDeleteModal(true)}
                                        style={{
                                            padding: '7px 16px', borderRadius: 8,
                                            border: '1px solid #ef4444', background: '#fff',
                                            color: '#ef4444', cursor: 'pointer',
                                            fontSize: 13, fontWeight: 600,
                                        }}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal suppression compte */}
            <Modal
                open={deleteModal}
                onCancel={() => setDeleteModal(false)}
                onOk={() => { message.info('Fonctionnalité à implémenter'); setDeleteModal(false); }}
                okText="Confirmer la suppression"
                cancelText="Annuler"
                okButtonProps={{ danger: true }}
                title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                        <ExclamationCircleOutlined /> Supprimer mon compte
                    </span>
                }
            >
                <p>Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront perdues définitivement.</p>
            </Modal>
        </RhLayout>
    );
}