import React, { useState, useEffect, useCallback } from 'react';
import {
    Spin, Tag, Modal, message, Select, Input,
    Avatar, Tooltip, Drawer, Progress, Empty,
} from 'antd';
import {
    FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined,
    CalendarOutlined, StarOutlined, ClockCircleOutlined,
    PhoneOutlined, VideoCameraOutlined, TeamOutlined,
    TrophyOutlined, EnvironmentOutlined, MailOutlined,
    ReloadOutlined, SearchOutlined,
} from '@ant-design/icons';
import ManagerLayout from '../../components/layout/ManagerLayout';
import api from '../../services/api';

// ── Types ─────────────────────────────────────────────────────
interface Application {
    _id:             string;
    full_name:       string;
    email:           string;
    job_title:       string;
    department:      string;
    statut:          string;
    ai_score:        number | null;
    created_at:      string;
    cv_url?:         string;
    phone?:          string;
    location?:       string;
    experience?:     string;
    skills?:         string[];
    cover_letter?:   string;
    next_interview?: { date: string; time: string; type: string } | null;
}

interface EvalForm { rating: number; decision: string; comment: string; }

// ── Constantes ────────────────────────────────────────────────
const PRIMARY = '#00a89c';

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    soumis:     { label: 'Nouvelle',    color: '#6366f1', bg: '#eef2ff' },
    en_cours:   { label: 'En cours',    color: '#f59e0b', bg: '#fffbeb' },
    entretien:  { label: 'Entretien',   color: '#3b82f6', bg: '#eff6ff' },
    retenu:     { label: 'Retenu',      color: '#10b981', bg: '#f0fdf4' },
    non_retenu: { label: 'Non retenu',  color: '#ef4444', bg: '#fef2f2' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
    telephonique: <PhoneOutlined />,
    visio:        <VideoCameraOutlined />,
    presentiel:   <EnvironmentOutlined />,
    technique:    <TeamOutlined />,
};

// ── StatCard ──────────────────────────────────────────────────
const StatCard: React.FC<{
    label: string; value: number; icon: React.ReactNode;
    color: string; sub?: string;
}> = ({ label, value, icon, color, sub }) => (
    <div
        style={{
            background: '#fff', borderRadius: 16, padding: '22px 24px',
            border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            flex: 1, minWidth: 0, transition: 'box-shadow 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
    >
        <div style={{ marginBottom: 14 }}>
            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color,
            }}>{icon}</div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 6 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
);

// ── Ligne tableau ─────────────────────────────────────────────
const ApplicationRow: React.FC<{
    app: Application;
    onAction: (action: string, app: Application) => void;
}> = ({ app, onAction }) => {
    const cfg   = STATUT_CONFIG[app.statut] ?? { label: app.statut, color: '#8c8c8c', bg: '#f5f5f5' };
    const score = app.ai_score;
    const sc    = score === null ? '#8c8c8c' : score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';

    return (
        <div
            style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px', borderBottom: '1px solid #f5f5f5',
                transition: 'background 0.15s', cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => onAction('view_detail', app)}
        >
            <Avatar size={38} style={{ background: `${cfg.color}20`, color: cfg.color, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {app.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </Avatar>

            <div style={{ flex: '0 0 200px', minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.full_name}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.email}
                </div>
            </div>

            <div style={{ flex: '0 0 160px', fontSize: 13, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {app.job_title}
            </div>

            <div style={{ flex: '0 0 110px' }}>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                </span>
            </div>

            <div style={{ flex: '0 0 90px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {score !== null ? (
                    <>
                        <span style={{ fontSize: 13, fontWeight: 700, color: sc }}>{score}%</span>
                        <div style={{ flex: 1, height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${score}%`, height: '100%', background: sc, borderRadius: 2 }} />
                        </div>
                    </>
                ) : <span style={{ fontSize: 12, color: '#bfbfbf' }}>—</span>}
            </div>

            <div style={{ flex: '0 0 130px', fontSize: 12, color: '#8c8c8c' }}>
                {app.next_interview ? (
                    <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {TYPE_ICONS[app.next_interview.type]}
                        {new Date(app.next_interview.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {app.next_interview.time}
                    </span>
                ) : '—'}
            </div>

            <div style={{ flex: '0 0 100px', fontSize: 12, color: '#bfbfbf' }}>
                {new Date(app.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
                <Tooltip title="Voir le CV">
                    <button onClick={() => onAction('view_cv', app)} style={iconBtn('#6366f1')}><FileTextOutlined /></button>
                </Tooltip>
                <Tooltip title="Évaluer">
                    <button onClick={() => onAction('evaluate', app)} style={iconBtn('#f59e0b')}><StarOutlined /></button>
                </Tooltip>
                <Tooltip title="Planifier entretien">
                    <button onClick={() => onAction('interview', app)} style={iconBtn('#3b82f6')}><CalendarOutlined /></button>
                </Tooltip>
                {app.statut === 'entretien' && <>
                    <Tooltip title="Valider">
                        <button onClick={() => onAction('validate', app)} style={iconBtn('#10b981')}><CheckCircleOutlined /></button>
                    </Tooltip>
                    <Tooltip title="Rejeter">
                        <button onClick={() => onAction('reject', app)} style={iconBtn('#ef4444')}><CloseCircleOutlined /></button>
                    </Tooltip>
                </>}
            </div>
        </div>
    );
};

const iconBtn = (color: string): React.CSSProperties => ({
    width: 32, height: 32, borderRadius: 8, border: `1px solid ${color}25`,
    background: `${color}10`, color, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 13,
    transition: 'all 0.15s', padding: 0,
});

const drawerBtn = (color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
    border: `1px solid ${color}30`, background: `${color}10`,
    color, fontSize: 13, fontWeight: 500,
});

// ── Bloc info drawer ──────────────────────────────────────────
const InfoBlock: React.FC<{ title: string; rows: { icon: React.ReactNode; label: string; value: string }[] }> = ({ title, rows }) => (
    <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>{title}</div>
        {rows.map(r => (
            <div key={r.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: '#8c8c8c', width: 16, marginTop: 1 }}>{r.icon}</span>
                <span style={{ color: '#8c8c8c', width: 90, flexShrink: 0 }}>{r.label}</span>
                <span style={{ color: '#262626', fontWeight: 500 }}>{r.value}</span>
            </div>
        ))}
    </div>
);

// ── Dashboard principal ───────────────────────────────────────
export default function ManagerDashboard() {
    const [applications,   setApplications]  = useState<Application[]>([]);
    const [loading,        setLoading]        = useState(true);
    const [search,         setSearch]         = useState('');
    const [filterStatut,   setFilterStatut]   = useState('all');
    const [selectedApp,    setSelectedApp]    = useState<Application | null>(null);
    const [detailDrawer,   setDetailDrawer]   = useState(false);
    const [evalModal,      setEvalModal]      = useState(false);
    const [interviewModal, setInterviewModal] = useState(false);
    const [confirmModal,   setConfirmModal]   = useState<{ type: 'validate' | 'reject'; app: Application } | null>(null);
    const [evalForm,       setEvalForm]       = useState<EvalForm>({ rating: 0, comment: '', decision: 'neutre' });
    const [savingAction,   setSavingAction]   = useState(false);
    const [interviewForm,  setInterviewForm]  = useState({ type: 'telephonique', date: '', time: '', duration_minutes: 30, note: '' });

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/manager/applications');
            setApplications(res.data.data ?? []);
        } catch {
            message.error('Erreur lors du chargement des candidatures');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    const filtered = applications.filter(app => {
        const ms = !search ||
            app.full_name.toLowerCase().includes(search.toLowerCase()) ||
            app.job_title.toLowerCase().includes(search.toLowerCase()) ||
            app.email.toLowerCase().includes(search.toLowerCase());
        return ms && (filterStatut === 'all' || app.statut === filterStatut);
    });

    const stats = {
        total:      applications.length,
        nouvelles:  applications.filter(a => a.statut === 'soumis').length,
        entretiens: applications.filter(a => a.statut === 'entretien').length,
        retenus:    applications.filter(a => a.statut === 'retenu').length,
        non_retenus:applications.filter(a => a.statut === 'non_retenu').length,
    };

    const handleAction = (action: string, app: Application) => {
        setSelectedApp(app);
        if (action === 'view_detail')   { setDetailDrawer(true); return; }
        if (action === 'view_cv')       { app.cv_url ? window.open(app.cv_url, '_blank') : message.warning('CV non disponible'); return; }
        if (action === 'evaluate')      { setEvalForm({ rating: 0, comment: '', decision: 'neutre' }); setEvalModal(true); return; }
        if (action === 'interview')     { setInterviewForm({ type: 'telephonique', date: '', time: '', duration_minutes: 30, note: '' }); setInterviewModal(true); return; }
        if (action === 'validate')      { setConfirmModal({ type: 'validate', app }); return; }
        if (action === 'reject')        { setConfirmModal({ type: 'reject',   app }); return; }
    };

    const submitEvaluation = async () => {
        if (!selectedApp) return;
        setSavingAction(true);
        try {
            await api.post(`/rh/applications/${selectedApp._id}/evaluations`, evalForm);
            message.success('Évaluation enregistrée');
            setEvalModal(false);
        } catch { message.error("Erreur lors de l'évaluation"); }
        finally  { setSavingAction(false); }
    };

    const submitInterview = async () => {
        if (!selectedApp || !interviewForm.date || !interviewForm.time) {
            message.warning('Date et heure requises'); return;
        }
        setSavingAction(true);
        try {
            await api.post(`/rh/applications/${selectedApp._id}/interviews`, {
                ...interviewForm,
                candidate_name:  selectedApp.full_name,
                candidate_email: selectedApp.email,
                note_visibility: 'rh_only',
            });
            message.success('Entretien planifié');
            setInterviewModal(false);
            fetchApplications();
        } catch { message.error('Erreur lors de la planification'); }
        finally  { setSavingAction(false); }
    };

    const submitStatusChange = async () => {
        if (!confirmModal) return;
        setSavingAction(true);
        const newStatut = confirmModal.type === 'validate' ? 'retenu' : 'non_retenu';
        try {
            await api.patch(`/rh/applications/${confirmModal.app._id}/status`, { statut: newStatut });
            setApplications(prev => prev.map(a => a._id === confirmModal.app._id ? { ...a, statut: newStatut } : a));
            message.success(confirmModal.type === 'validate' ? 'Candidature validée ✓' : 'Candidature rejetée');
            setConfirmModal(null);
        } catch { message.error('Erreur lors de la mise à jour'); }
        finally  { setSavingAction(false); }
    };

    return (
        <ManagerLayout>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* En-tête */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>Tableau de bord</h1>
                        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#8c8c8c' }}>
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={fetchApplications} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                        borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff',
                        cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#595959',
                    }}>
                        <ReloadOutlined /> Actualiser
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                    <StatCard label="Total candidatures" value={stats.total}      icon={<TeamOutlined />}            color={PRIMARY}   sub={`${stats.nouvelles} nouvelle${stats.nouvelles > 1 ? 's' : ''}`} />
                    <StatCard label="En entretien"        value={stats.entretiens} icon={<CalendarOutlined />}        color="#3b82f6"   sub="À évaluer" />
                    <StatCard label="Retenus"             value={stats.retenus}    icon={<CheckCircleOutlined />}     color="#10b981"   sub={stats.total > 0 ? `${Math.round(stats.retenus / stats.total * 100)}% taux` : undefined} />
                    <StatCard label="Non retenus"         value={stats.non_retenus}icon={<CloseCircleOutlined />}     color="#ef4444" />
                </div>

                {/* Tableau */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f5f5f5', gap: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
                            Candidatures
                            <span style={{ marginLeft: 8, background: `${PRIMARY}15`, color: PRIMARY, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                                {filtered.length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Input
                                placeholder="Rechercher..."
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ width: 220, borderRadius: 8 }} allowClear
                            />
                            <Select
                                value={filterStatut} onChange={setFilterStatut}
                                style={{ width: 160 }}
                                options={[
                                    { value: 'all',        label: 'Tous les statuts' },
                                    { value: 'soumis',     label: 'Nouvelles' },
                                    { value: 'en_cours',   label: 'En cours' },
                                    { value: 'entretien',  label: 'Entretien' },
                                    { value: 'retenu',     label: 'Retenu' },
                                    { value: 'non_retenu', label: 'Non retenu' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Header colonnes */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 20px', background: '#fafafa', borderBottom: '1px solid #f0f0f0', fontSize: 11, fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <div style={{ width: 38 }} />
                        <div style={{ flex: '0 0 200px' }}>Candidat</div>
                        <div style={{ flex: '0 0 160px' }}>Poste</div>
                        <div style={{ flex: '0 0 110px' }}>Statut</div>
                        <div style={{ flex: '0 0 90px'  }}>Score IA</div>
                        <div style={{ flex: '0 0 130px' }}>Prochain entretien</div>
                        <div style={{ flex: '0 0 100px' }}>Date</div>
                        <div style={{ marginLeft: 'auto' }}>Actions</div>
                    </div>

                    {/* Lignes */}
                    {loading ? (
                        <div style={{ padding: 60, textAlign: 'center' }}><Spin size="large" /></div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '60px 0' }}><Empty description="Aucune candidature" image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
                    ) : (
                        filtered.map(app => <ApplicationRow key={app._id} app={app} onAction={handleAction} />)
                    )}
                </div>
            </div>

            {/* Drawer détail */}
            <Drawer
                open={detailDrawer} onClose={() => setDetailDrawer(false)} width={460}
                title={selectedApp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar size={40} style={{ background: `${PRIMARY}20`, color: PRIMARY, fontWeight: 700 }}>
                            {selectedApp.full_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </Avatar>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedApp.full_name}</div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{selectedApp.job_title}</div>
                        </div>
                    </div>
                )}
                footer={
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {selectedApp?.cv_url && (
                            <button onClick={() => window.open(selectedApp.cv_url, '_blank')} style={drawerBtn('#6366f1')}>
                                <FileTextOutlined /> CV
                            </button>
                        )}
                        <button onClick={() => { setDetailDrawer(false); setEvalModal(true); }} style={drawerBtn('#f59e0b')}>
                            <StarOutlined /> Évaluer
                        </button>
                        <button onClick={() => { setDetailDrawer(false); setInterviewModal(true); }} style={drawerBtn('#3b82f6')}>
                            <CalendarOutlined /> Entretien
                        </button>
                    </div>
                }
            >
                {selectedApp && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {(() => {
                                const cfg = STATUT_CONFIG[selectedApp.statut] ?? { label: selectedApp.statut, color: '#8c8c8c', bg: '#f5f5f5' };
                                return (
                                    <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                                        {cfg.label}
                                    </span>
                                );
                            })()}
                            {selectedApp.ai_score !== null && (
                                <span style={{ fontSize: 13, fontWeight: 700, color: selectedApp.ai_score >= 70 ? '#10b981' : selectedApp.ai_score >= 45 ? '#f59e0b' : '#ef4444' }}>
                                    <TrophyOutlined style={{ marginRight: 4 }} />Score IA : {selectedApp.ai_score}%
                                </span>
                            )}
                        </div>

                        <InfoBlock title="Informations" rows={[
                            { icon: <MailOutlined />,        label: 'Email',       value: selectedApp.email },
                            { icon: <PhoneOutlined />,       label: 'Téléphone',   value: selectedApp.phone || '—' },
                            { icon: <EnvironmentOutlined />, label: 'Lieu',        value: selectedApp.location || '—' },
                            { icon: <ClockCircleOutlined />, label: 'Expérience',  value: selectedApp.experience || '—' },
                            { icon: <TeamOutlined />,        label: 'Département', value: selectedApp.department || '—' },
                        ]} />

                        {selectedApp.ai_score !== null && (
                            <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 16 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Score IA</div>
                                <Progress
                                    percent={selectedApp.ai_score}
                                    strokeColor={selectedApp.ai_score >= 70 ? '#10b981' : selectedApp.ai_score >= 45 ? '#f59e0b' : '#ef4444'}
                                    trailColor="#e5e7eb"
                                    format={p => <span style={{ fontSize: 13, fontWeight: 700 }}>{p}%</span>}
                                />
                            </div>
                        )}

                        {selectedApp.skills && selectedApp.skills.length > 0 && (
                            <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 16 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Compétences</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {selectedApp.skills.map(s => (
                                        <Tag key={s} style={{ borderRadius: 6, background: `${PRIMARY}10`, borderColor: `${PRIMARY}30`, color: PRIMARY, fontSize: 12 }}>{s}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedApp.next_interview && (
                            <div style={{ background: '#eff6ff', borderRadius: 12, padding: 16, border: '1px solid #bfdbfe' }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#3b82f6', marginBottom: 6 }}>
                                    <CalendarOutlined style={{ marginRight: 6 }} />Prochain entretien
                                </div>
                                <div style={{ fontSize: 13, color: '#1e40af' }}>
                                    {new Date(selectedApp.next_interview.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {selectedApp.next_interview.time}
                                </div>
                            </div>
                        )}

                        {selectedApp.cover_letter && (
                            <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 16 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Lettre de motivation</div>
                                <p style={{ fontSize: 13, color: '#595959', lineHeight: 1.7, margin: 0, maxHeight: 180, overflowY: 'auto' }}>
                                    {selectedApp.cover_letter}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>

            {/* Modal Évaluation */}
            <Modal open={evalModal} onCancel={() => setEvalModal(false)} onOk={submitEvaluation}
                okText="Enregistrer" cancelText="Annuler" confirmLoading={savingAction}
                title={<span><StarOutlined style={{ color: '#f59e0b', marginRight: 8 }} />Évaluer — {selectedApp?.full_name}</span>}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Note globale</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {[1,2,3,4,5].map(n => (
                                <button key={n} onClick={() => setEvalForm(f => ({ ...f, rating: n }))} style={{
                                    width: 40, height: 40, borderRadius: 8, fontSize: 20, cursor: 'pointer', transition: 'all 0.15s',
                                    border: `2px solid ${evalForm.rating >= n ? '#f59e0b' : '#e5e7eb'}`,
                                    background: evalForm.rating >= n ? '#fef3c7' : '#fff',
                                    color: evalForm.rating >= n ? '#f59e0b' : '#d1d5db',
                                }}>★</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Recommandation</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {[
                                { value: 'recommande',     label: '✓ Recommandé',    color: '#10b981' },
                                { value: 'neutre',         label: '○ Neutre',         color: '#6b7280' },
                                { value: 'non_recommande', label: '✗ Non recommandé', color: '#ef4444' },
                            ].map(d => (
                                <button key={d.value} onClick={() => setEvalForm(f => ({ ...f, decision: d.value }))} style={{
                                    flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12,
                                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                    border: `2px solid ${evalForm.decision === d.value ? d.color : '#e5e7eb'}`,
                                    background: evalForm.decision === d.value ? `${d.color}10` : '#fff',
                                    color: evalForm.decision === d.value ? d.color : '#9ca3af',
                                }}>{d.label}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Commentaire</div>
                        <Input.TextArea value={evalForm.comment} onChange={e => setEvalForm(f => ({ ...f, comment: e.target.value }))}
                            placeholder="Points forts, observations..." rows={4} style={{ borderRadius: 8 }} />
                    </div>
                </div>
            </Modal>

            {/* Modal Entretien */}
            <Modal open={interviewModal} onCancel={() => setInterviewModal(false)} onOk={submitInterview}
                okText="Planifier" cancelText="Annuler" confirmLoading={savingAction}
                title={<span><CalendarOutlined style={{ color: '#3b82f6', marginRight: 8 }} />Planifier — {selectedApp?.full_name}</span>}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Type</div>
                        <Select value={interviewForm.type} onChange={v => setInterviewForm(f => ({ ...f, type: v }))} style={{ width: '100%' }}
                            options={[
                                { value: 'telephonique', label: '📞 Téléphonique' },
                                { value: 'visio',        label: '💻 Visioconférence' },
                                { value: 'presentiel',   label: '🏢 Présentiel' },
                                { value: 'technique',    label: '⚙️ Test Technique' },
                            ]}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Date</div>
                            <Input type="date" value={interviewForm.date}
                                onChange={e => setInterviewForm(f => ({ ...f, date: e.target.value }))}
                                min={new Date().toISOString().split('T')[0]} style={{ borderRadius: 8 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Heure</div>
                            <Input type="time" value={interviewForm.time}
                                onChange={e => setInterviewForm(f => ({ ...f, time: e.target.value }))}
                                style={{ borderRadius: 8 }} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Durée</div>
                        <Select value={interviewForm.duration_minutes} onChange={v => setInterviewForm(f => ({ ...f, duration_minutes: v }))}
                            style={{ width: '100%' }} options={[15,30,45,60,90,120].map(d => ({ value: d, label: `${d} minutes` }))} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Note <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optionnel)</span></div>
                        <Input.TextArea value={interviewForm.note} onChange={e => setInterviewForm(f => ({ ...f, note: e.target.value }))}
                            placeholder="Points à aborder..." rows={3} style={{ borderRadius: 8 }} />
                    </div>
                </div>
            </Modal>

            {/* Modal Confirmation */}
            <Modal open={!!confirmModal} onCancel={() => setConfirmModal(null)} onOk={submitStatusChange}
                confirmLoading={savingAction}
                okText={confirmModal?.type === 'validate' ? 'Valider' : 'Rejeter'}
                cancelText="Annuler"
                okButtonProps={{
                    danger: confirmModal?.type === 'reject',
                    style: confirmModal?.type === 'validate' ? { background: '#10b981', borderColor: '#10b981' } : {},
                }}
                title={
                    <span style={{ color: confirmModal?.type === 'validate' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {confirmModal?.type === 'validate'
                            ? <><CheckCircleOutlined /> Valider la candidature</>
                            : <><CloseCircleOutlined /> Rejeter la candidature</>}
                    </span>
                }
            >
                <p style={{ fontSize: 14, color: '#374151' }}>
                    {confirmModal?.type === 'validate'
                        ? `Confirmer la validation de la candidature de ${confirmModal?.app.full_name} ?`
                        : `Rejeter la candidature de ${confirmModal?.app.full_name} ? Son statut passera à "Non retenu".`}
                </p>
            </Modal>
        </ManagerLayout>
    );
}