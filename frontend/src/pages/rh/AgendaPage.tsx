// ============================================================
// AgendaPage.tsx — Agenda des entretiens RH (refonte complète)
// ============================================================
//
// CORRECTIONS & AMÉLIORATIONS :
//   — Liste de la SEMAINE entière avec date affichée sur chaque carte
//   — Clic sur un jour du mini-calendrier → filtre la liste sur ce jour
//   — Clic sur "Toute la semaine" → reaffiche tous les entretiens de la semaine
//   — Clic sur une carte → Drawer de détail (téléphone, lien, lieu, note, participants)
//   — KPI "Ce mois" alimenté par un appel API réel (from/to du mois courant)
//   — Indicateur "Aujourd'hui" sur les cartes
// ============================================================

import React, { useState, useEffect, useCallback , useMemo} from 'react';
import {
    Card, Button, Spin, Empty, Tag, Space,
    Avatar, Tooltip, message, Drawer, Divider, Badge,
} from 'antd';
import {
    CalendarOutlined, VideoCameraOutlined, PhoneOutlined,
    EnvironmentOutlined, CheckCircleOutlined, PlusOutlined,
    LeftOutlined, RightOutlined, ReloadOutlined, UserOutlined,
    LinkOutlined, ClockCircleOutlined, TeamOutlined, FileTextOutlined,
    EyeOutlined, LockOutlined, GlobalOutlined, CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import isoWeek from 'dayjs/plugin/isoWeek';
import RhLayout from './components/RhLayout';
import api from '../../services/api';
import { PRIMARY } from '../../theme/colors';
import InterviewModal from './components/InterviewModal';

dayjs.extend(isoWeek);
dayjs.locale('fr');

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

type InterviewType   = 'telephonique' | 'visio' | 'presentiel' | 'technique';
type InterviewStatut = 'planifie' | 'confirme' | 'annule' | 'termine';

interface Participant {
    id?:   string;
    name:  string;
    role:  string;
    email?: string;
}

interface Interview {
    _id:              string;
    type:             InterviewType;
    date:             string;          // YYYY-MM-DD
    time:             string;          // HH:mm
    duration_minutes: number;
    candidate_name:   string;
    candidate_email:  string;
    job_title?:       string;
    location?:        string;
    meeting_url?:     string;
    note?:            string;
    note_visibility?: 'rh_only' | 'manager' | 'candidat';
    participants?:    Participant[];
    statut:           InterviewStatut;
    created_by_name?: string;
}

// ────────────────────────────────────────────────────────────
// CONSTANTES
// ────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<InterviewType, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
    telephonique: { label: 'Téléphonique',    color: '#3B82F6', bg: '#EFF6FF', icon: <PhoneOutlined /> },
    visio:        { label: 'Visioconférence', color: '#8B5CF6', bg: '#F5F3FF', icon: <VideoCameraOutlined /> },
    presentiel:   { label: 'Présentiel',      color: PRIMARY,   bg: '#ECFDF5', icon: <EnvironmentOutlined /> },
    technique:    { label: 'Test technique',  color: '#F59E0B', bg: '#FFFBEB', icon: <CheckCircleOutlined /> },
};

const STATUT_CONFIG: Record<InterviewStatut, { label: string; color: string }> = {
    planifie: { label: 'Planifié',  color: '#3B82F6' },
    confirme: { label: 'Confirmé',  color: PRIMARY   },
    annule:   { label: 'Annulé',    color: '#EF4444' },
    termine:  { label: 'Terminé',   color: '#6B7280' },
};

const NOTE_VIS_CONFIG = {
    rh_only:  { label: 'RH uniquement',   icon: <LockOutlined />,   color: '#6B7280' },
    manager:  { label: 'RH + Manager',    icon: <EyeOutlined />,    color: '#8B5CF6' },
    candidat: { label: 'Visible candidat',icon: <GlobalOutlined />, color: PRIMARY   },
};

// ────────────────────────────────────────────────────────────
// SOUS-COMPOSANT : Carte d'entretien (dans la liste de semaine)
// ────────────────────────────────────────────────────────────

const InterviewCard: React.FC<{
    interview: Interview;
    onClick:   () => void;
}> = React.memo(({ interview, onClick }) => {
    const cfg      = TYPE_CONFIG[interview.type] ?? TYPE_CONFIG.visio;
    const statCfg  = STATUT_CONFIG[interview.statut] ?? STATUT_CONFIG.planifie;
    const todayStr = dayjs().format('YYYY-MM-DD');
    const isToday  = interview.date === todayStr;
    const isPast   = dayjs(`${interview.date} ${interview.time}`).isBefore(dayjs());
    const dateLabel = dayjs(interview.date).locale('fr').format('ddd D MMM');

    return (
        <div
            onClick={onClick}
            style={{
                padding:      '14px 18px',
                border:       `1px solid ${isToday ? cfg.color + '44' : '#f0f0f0'}`,
                borderLeft:   `4px solid ${cfg.color}`,
                borderRadius: 10,
                background:   isPast ? '#fafafa' : '#fff',
                opacity:      interview.statut === 'annule' ? 0.55 : isPast ? 0.75 : 1,
                cursor:       'pointer',
                transition:   'box-shadow 0.15s, border-color 0.15s',
                display:      'flex',
                alignItems:   'center',
                gap:          16,
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                (e.currentTarget as HTMLDivElement).style.borderColor = cfg.color;
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.borderColor = isToday ? cfg.color + '44' : '#f0f0f0';
            }}
        >
            {/* Colonne date + heure */}
            <div style={{
                flexShrink: 0,
                minWidth:   68,
                textAlign:  'center',
                padding:    '6px 10px',
                background: isToday ? `${cfg.color}10` : '#f9f9f9',
                borderRadius: 8,
            }}>
                {isToday && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: cfg.color, letterSpacing: 1, marginBottom: 2 }}>
                        AUJOURD'HUI
                    </div>
                )}
                <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'capitalize' }}>
                    {dateLabel}
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, color: cfg.color, lineHeight: 1.2, marginTop: 2 }}>
                    {interview.time}
                </div>
                <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>
                    {interview.duration_minutes} min
                </div>
            </div>

            {/* Icône type */}
            <div style={{
                width:          38,
                height:         38,
                borderRadius:   '50%',
                background:     cfg.bg,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                color:          cfg.color,
                fontSize:       16,
                flexShrink:     0,
            }}>
                {cfg.icon}
            </div>

            {/* Infos candidat */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>
                        {interview.candidate_name}
                    </span>
                    <span style={{
                        fontSize:     11,
                        fontWeight:   600,
                        color:        statCfg.color,
                        background:   `${statCfg.color}12`,
                        padding:      '1px 7px',
                        borderRadius: 6,
                        border:       `0.5px solid ${statCfg.color}30`,
                    }}>
                        {statCfg.label}
                    </span>
                </div>

                {interview.candidate_email && (
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 5 }}>
                        {interview.candidate_email}
                    </div>
                )}

                <Space size={6} wrap>
                    <Tag style={{
                        background:   cfg.bg,
                        color:        cfg.color,
                        border:       `0.5px solid ${cfg.color}33`,
                        borderRadius: 6,
                        fontSize:     11,
                        padding:      '1px 8px',
                        margin:       0,
                    }}>
                        {cfg.icon}&nbsp;{cfg.label}
                    </Tag>

                    {/* Lieu raccourci */}
                    {interview.location && (
                        <Tag style={{ fontSize: 11, borderRadius: 6, margin: 0 }}>
                            <EnvironmentOutlined /> {interview.location.length > 28
                                ? interview.location.slice(0, 28) + '…'
                                : interview.location}
                        </Tag>
                    )}

                    {/* Lien réunion — clic arrêté pour ne pas déclencher le drawer */}
                    {interview.meeting_url && (
                        <a
                            href={interview.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 11, color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                            <LinkOutlined /> Rejoindre
                        </a>
                    )}
                </Space>
            </div>

            {/* Participants miniature */}
            {interview.participants && interview.participants.length > 0 && (
                <Avatar.Group maxCount={3} size={28} style={{ flexShrink: 0 }}>
                    {interview.participants.map((p, i) => (
                        <Tooltip key={i} title={`${p.name} · ${p.role}`}>
                            <Avatar size={28} style={{ background: PRIMARY, fontSize: 11 }}>
                                {p.name[0]}
                            </Avatar>
                        </Tooltip>
                    ))}
                </Avatar.Group>
            )}

            {/* Flèche indicateur */}
            <div style={{ color: '#d9d9d9', fontSize: 12, flexShrink: 0 }}>›</div>
        </div>
    );
});
InterviewCard.displayName = 'InterviewCard';

// ────────────────────────────────────────────────────────────
// SOUS-COMPOSANT : Drawer de détail
// ────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> =
    ({ icon, label, value }) => (
        <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{
                width:          34,
                height:         34,
                borderRadius:   8,
                background:     '#f9f9f9',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                color:          '#8c8c8c',
                fontSize:       15,
                flexShrink:     0,
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{value}</div>
            </div>
        </div>
    );


// APRÈS — sépare l'état "ouvert" de la donnée affichée
const InterviewDetailDrawer: React.FC<{
    interview: Interview | null;
    onClose:   () => void;
}> = ({ interview, onClose }) => {

    const cfg        = TYPE_CONFIG[interview?.type ?? 'visio']    ?? TYPE_CONFIG.visio;
    const statCfg    = STATUT_CONFIG[interview?.statut ?? 'planifie'] ?? STATUT_CONFIG.planifie;
    const dateFormatted = interview
        ? dayjs(interview.date).locale('fr').format('dddd D MMMM YYYY')
        : '';
    const noteVisCfg = interview?.note_visibility
        ? NOTE_VIS_CONFIG[interview.note_visibility]
        : NOTE_VIS_CONFIG.rh_only;

    return (
        <Drawer
            open={!!interview}          // ← ouvert si interview non null
            onClose={onClose}
            width={420}
            closable={false}
            styles={{ body: { padding: 0 } }}
            destroyOnClose={false}      // ← garde le contenu pendant l'animation de fermeture
        >
            {interview && (             // ← rendu conditionnel du contenu seulement
            <>
                {/* En-tête coloré */}
                <div style={{
                    background: `linear-gradient(135deg, ${cfg.color}ee, ${cfg.color}bb)`,
                    padding: '24px 24px 20px',
                    position: 'relative',
                }}>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 14, right: 14,
                            color: 'rgba(255,255,255,0.8)',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: 8,
                        }}
                    />
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff', fontSize: 22, marginBottom: 14,
                    }}>
                        {cfg.icon}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4 }}>
                        {cfg.label}
                    </div>
                    <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
                        {interview.candidate_name}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                            {dateFormatted}
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                            {interview.time} · {interview.duration_minutes} min
                        </span>
                        <span style={{ background: statCfg.color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                            {statCfg.label}
                        </span>
                    </div>
                </div>

                {/* Corps */}
                <div style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: 8 }}>
                        Candidat
                    </div>
                    <InfoRow icon={<UserOutlined />}  label="Nom complet" value={interview.candidate_name} />
                    <InfoRow icon={<span style={{ fontSize: 13 }}>@</span>} label="Email"
                        value={<a href={`mailto:${interview.candidate_email}`} style={{ color: PRIMARY }}>{interview.candidate_email}</a>}
                    />

                    <Divider style={{ margin: '16px 0 12px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: 8 }}>
                        Logistique
                    </div>
                    <InfoRow icon={<ClockCircleOutlined />} label="Date & heure" value={`${dateFormatted} à ${interview.time}`} />
                    <InfoRow icon={<ClockCircleOutlined />} label="Durée"         value={`${interview.duration_minutes} minutes`} />

                    {interview.type === 'telephonique' && (
                        <InfoRow icon={<PhoneOutlined />} label="Entretien téléphonique"
                            value={<span style={{ color: '#3B82F6' }}>Appel sortant vers le candidat</span>}
                        />
                    )}
                    {interview.meeting_url && (
                        <InfoRow icon={<LinkOutlined />} label="Lien de réunion"
                            value={<a href={interview.meeting_url} target="_blank" rel="noreferrer" style={{ color: '#8B5CF6', wordBreak: 'break-all' }}>{interview.meeting_url}</a>}
                        />
                    )}
                    {interview.location && (
                        <InfoRow icon={<EnvironmentOutlined />} label="Lieu" value={interview.location} />
                    )}

                    {interview.participants && interview.participants.length > 0 && (
                        <>
                            <Divider style={{ margin: '16px 0 12px' }} />
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: 12 }}>
                                <TeamOutlined style={{ marginRight: 6 }} />
                                Participants ({interview.participants.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {interview.participants.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f9f9f9', borderRadius: 8 }}>
                                        <Avatar size={30} style={{ background: PRIMARY, fontSize: 11, fontWeight: 700 }}>{p.name[0]}</Avatar>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{p.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {interview.note && (
                        <>
                            <Divider style={{ margin: '16px 0 12px' }} />
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: 8 }}>
                                <FileTextOutlined style={{ marginRight: 6 }} />Note
                            </div>
                            <div style={{ padding: '12px 14px', background: '#f9f9f9', borderRadius: 8, fontSize: 13, color: '#262626', lineHeight: 1.6, marginBottom: 8 }}>
                                {interview.note}
                            </div>
                            {interview.note_visibility && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: noteVisCfg.color }}>
                                    {noteVisCfg.icon} <span>{noteVisCfg.label}</span>
                                </div>
                            )}
                        </>
                    )}

                    {interview.created_by_name && (
                        <>
                            <Divider style={{ margin: '16px 0 12px' }} />
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                Planifié par <strong>{interview.created_by_name}</strong>
                            </div>
                        </>
                    )}
                </div>
            </>
            )}
        </Drawer>
    );
};


// ────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL — AgendaPage
// ────────────────────────────────────────────────────────────

const AgendaPage: React.FC = () => {
    // ── Navigation semaine ───────────────────────────────────
    const [weekOffset,     setWeekOffset]     = useState(0);

    /**
     * selectedDate : null = "toute la semaine" (pas de filtre jour)
     *               dayjs() = filtre sur ce jour précis
     * Au montage, on sélectionne le jour d'aujourd'hui par défaut.
     */
const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

    // ── Données ──────────────────────────────────────────────
    const [weekInterviews, setWeekInterviews] = useState<Interview[]>([]);
    const [monthCount,     setMonthCount]     = useState<number | null>(null);
    const [loading,        setLoading]        = useState(false);

    // ── Détail au clic ───────────────────────────────────────
    const [detailInterview, setDetailInterview] = useState<Interview | null>(null);

    // ── Modale de création ───────────────────────────────────
    const [showModal, setShowModal] = useState(false);

    // ────────────────────────────────────────────────────────
    // Calcul de la semaine affichée
    // ────────────────────────────────────────────────────────
    // APRÈS — mémoriser weekStart avec useMemo
const weekStart = useMemo(
    () => dayjs().add(weekOffset, 'week').startOf('isoWeek'),
    [weekOffset]  // ← ne change QUE si weekOffset change
);

const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day')),
    [weekStart]
);

const fetchWeek = useCallback(async () => {
    setLoading(true);
    try {
        const res = await api.get('/rh/interviews', {
            params: {
                from: weekStart.format('YYYY-MM-DD'),
                to:   weekStart.add(6, 'day').format('YYYY-MM-DD'),
            },
        });
        setWeekInterviews(res.data?.data ?? []);
    } catch {
        message.error('Impossible de charger les entretiens');
    } finally {
        setLoading(false);
    }
}, [weekStart]);  // ← stable tant que weekOffset ne change pas

useEffect(() => { fetchWeek(); }, [fetchWeek]);  // ← ne se relance que si weekOffset change


    const todayStr  = dayjs().format('YYYY-MM-DD');

    // ────────────────────────────────────────────────────────
    // Fetch : entretiens de la semaine
    // ────────────────────────────────────────────────────────
    

    // ────────────────────────────────────────────────────────
    // Fetch : nombre d'entretiens ce mois (KPI)
    // ────────────────────────────────────────────────────────
    const fetchMonthCount = useCallback(async () => {
        try {
            const from = dayjs().startOf('month').format('YYYY-MM-DD');
            const to   = dayjs().endOf('month').format('YYYY-MM-DD');
            const res  = await api.get('/rh/interviews', { params: { from, to } });
            setMonthCount((res.data?.data ?? []).length);
        } catch {
            setMonthCount(null);
        }
    }, []);

    useEffect(() => { fetchWeek(); },      [fetchWeek]);
    useEffect(() => { fetchMonthCount(); }, [fetchMonthCount]);

    // ────────────────────────────────────────────────────────
    // Liste filtrée : semaine complète OU jour sélectionné
    // ────────────────────────────────────────────────────────

    /**
     * Si selectedDate est null → on affiche TOUS les entretiens de la semaine
     * triés par date puis heure.
     * Si selectedDate est défini → on filtre sur ce jour uniquement.
     */
    const filteredInterviews = [...weekInterviews]
        .filter(i => selectedDate ? i.date === selectedDate.format('YYYY-MM-DD') : true)
        .sort((a, b) => {
            const dateCmp = a.date.localeCompare(b.date);
            return dateCmp !== 0 ? dateCmp : a.time.localeCompare(b.time);
        });

    // Badges pour le mini-calendrier
    const countByDate: Record<string, number> = {};
    weekInterviews.forEach(i => {
        countByDate[i.date] = (countByDate[i.date] ?? 0) + 1;
    });

    const todayCount = countByDate[todayStr] ?? 0;
    const weekCount  = weekInterviews.length;

    // ────────────────────────────────────────────────────────
    // HANDLERS
    // ────────────────────────────────────────────────────────

    const handleDayClick = (day: dayjs.Dayjs) => {
        const dayStr = day.format('YYYY-MM-DD');
        // Clic sur le jour déjà sélectionné → désélectionne (affiche toute la semaine)
        if (selectedDate?.format('YYYY-MM-DD') === dayStr) {
            setSelectedDate(null);
        } else {
            setSelectedDate(day);
            // Si le jour cliqué est dans une autre semaine, naviguer vers elle
            const targetWeekOffset = Math.round(
                day.startOf('isoWeek').diff(dayjs().startOf('isoWeek'), 'week', true)
            );
            if (targetWeekOffset !== weekOffset) setWeekOffset(targetWeekOffset);
        }
    };

    const handleRefresh = () => {
        fetchWeek();
        fetchMonthCount();
    };

    // ────────────────────────────────────────────────────────
    // LABEL de section liste
    // ────────────────────────────────────────────────────────
    const listLabel = selectedDate
        ? selectedDate.locale('fr').format('dddd D MMMM')
        : `Semaine du ${weekStart.format('D MMM')} au ${weekStart.add(6, 'day').format('D MMM')}`;

    // ────────────────────────────────────────────────────────
    // RENDU
    // ────────────────────────────────────────────────────────

    return (
        <RhLayout>
        <div style={{ padding: '24px 32px', minHeight: '100vh', background: '#f5f5f5' }}>

            {/* ── En-tête ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#262626' }}>
                        Agenda
                    </div>
                    <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>
                        {dayjs().locale('fr').format('dddd D MMMM YYYY')}
                    </div>
                </div>
                <Space>
                    <Tooltip title="Actualiser">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                        />
                    </Tooltip>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setShowModal(true)}
                        style={{ background: PRIMARY, borderColor: PRIMARY }}
                    >
                        Planifier un entretien
                    </Button>
                </Space>
            </div>

            {/* ── KPIs ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 24 }}>
                {[
                    {
                        label: "Aujourd'hui",
                        value: todayCount,
                        color: PRIMARY,
                        bg:    '#e1f5ee',
                        sub:   todayCount === 1 ? 'entretien' : 'entretiens',
                    },
                    {
                        label: 'Cette semaine',
                        value: weekCount,
                        color: '#8B5CF6',
                        bg:    '#eeedfe',
                        sub:   weekCount === 1 ? 'entretien' : 'entretiens',
                    },
                    {
                        label: 'Ce mois',
                        value: monthCount ?? '…',
                        color: '#3B82F6',
                        bg:    '#e6f1fb',
                        sub:   monthCount === 1 ? 'entretien' : 'entretiens',
                    },
                ].map((kpi, i) => (
                    <div key={i} style={{
                        background:   kpi.bg,
                        borderRadius: 10,
                        padding:      '14px 18px',
                    }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>{kpi.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: kpi.color }}>
                            {kpi.value}
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Mini-calendrier semaine ── */}
            <Card
                style={{ borderRadius: 12, marginBottom: 20, border: '0.5px solid #f0f0f0' }}
                styles={{ body: { padding: '14px 16px' } }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Button
                        type="text"
                        size="small"
                        icon={<LeftOutlined />}
                        onClick={() => { setWeekOffset(w => w - 1); setSelectedDate(null); }}
                    />
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>
                            {weekStart.format('D MMM')} – {weekStart.add(6, 'day').format('D MMM YYYY')}
                        </span>
                        {/* Bouton "Toute la semaine" */}
                        {selectedDate && (
                            <Button
                                type="link"
                                size="small"
                                onClick={() => setSelectedDate(null)}
                                style={{ color: PRIMARY, fontSize: 11, marginLeft: 8 }}
                            >
                                Voir toute la semaine
                            </Button>
                        )}
                    </div>
                    <Button
                        type="text"
                        size="small"
                        icon={<RightOutlined />}
                        onClick={() => { setWeekOffset(w => w + 1); setSelectedDate(null); }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
                    {weekDays.map(day => {
                        const dayStr     = day.format('YYYY-MM-DD');
                        const isToday    = dayStr === todayStr;
                        const isSelected = selectedDate?.format('YYYY-MM-DD') === dayStr;
                        const count      = countByDate[dayStr] ?? 0;

                        return (
                            <Tooltip
                                key={dayStr}
                                title={count > 0 ? `${count} entretien${count > 1 ? 's' : ''}` : undefined}
                            >
                                <div
                                    onClick={() => handleDayClick(day)}
                                    style={{
                                        textAlign:    'center',
                                        padding:      '8px 4px',
                                        borderRadius: 8,
                                        cursor:       'pointer',
                                        background:   isSelected
                                            ? PRIMARY
                                            : isToday
                                            ? `${PRIMARY}18`
                                            : 'transparent',
                                        border:       isSelected
                                            ? `1.5px solid ${PRIMARY}`
                                            : '1.5px solid transparent',
                                        transition:   'all 0.15s',
                                    }}
                                >
                                    <div style={{
                                        fontSize:      10,
                                        color:         isSelected ? '#fff' : '#8c8c8c',
                                        marginBottom:  3,
                                        fontWeight:    isToday ? 700 : 400,
                                        letterSpacing: 0.5,
                                    }}>
                                        {day.format('ddd').toUpperCase()}
                                    </div>
                                    <div style={{
                                        fontSize:  15,
                                        fontWeight: 700,
                                        color:     isSelected ? '#fff' : isToday ? PRIMARY : '#262626',
                                    }}>
                                        {day.format('D')}
                                    </div>
                                    {/* Badge entretiens */}
                                    {count > 0 ? (
                                        <Badge
                                            count={count}
                                            style={{
                                                background:  isSelected ? '#fff' : PRIMARY,
                                                color:       isSelected ? PRIMARY : '#fff',
                                                fontSize:    9,
                                                minWidth:    16,
                                                height:      16,
                                                lineHeight:  '16px',
                                                boxShadow:   'none',
                                                marginTop:   4,
                                            }}
                                        />
                                    ) : (
                                        <div style={{ height: 20, marginTop: 4 }} />
                                    )}
                                </div>
                            </Tooltip>
                        );
                    })}
                </div>
            </Card>

            {/* ── Liste des entretiens ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>
                    {listLabel}
                    {' '}
                    <span style={{ fontWeight: 400, color: '#8c8c8c', fontSize: 13 }}>
                        ({filteredInterviews.length} entretien{filteredInterviews.length > 1 ? 's' : ''})
                    </span>
                </span>
                <Space>
                    {weekOffset !== 0 && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => { setWeekOffset(0); setSelectedDate(dayjs()); }}
                            style={{ color: PRIMARY }}
                        >
                            Revenir à aujourd'hui
                        </Button>
                    )}
                </Space>
            </div>

            <Spin spinning={loading}>
                {filteredInterviews.length === 0 ? (
                    <Card style={{ textAlign: 'center', border: '1px dashed #e8e8e8', borderRadius: 12 }}>
                        <Empty
                            image={<CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
                            imageStyle={{ height: 56 }}
                            description={
                                <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                                    {selectedDate
                                        ? 'Aucun entretien ce jour.'
                                        : 'Aucun entretien cette semaine.'}
                                </span>
                            }
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setShowModal(true)}
                                style={{ background: PRIMARY, borderColor: PRIMARY }}
                            >
                                Planifier un entretien
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredInterviews.map(itw => (
                            <InterviewCard
                                key={itw._id}
                                interview={itw}
                                onClick={() => setDetailInterview(itw)}
                            />
                        ))}
                    </div>
                )}
            </Spin>

            {/* ── Drawer de détail ── */}
            <InterviewDetailDrawer
    interview={detailInterview}
    onClose={() => setDetailInterview(null)}
/>

            {/* ── Modale de création ── */}
            <InterviewModal
                key={showModal ? 'open' : 'closed'}
                visible={showModal}
                onClose={() => setShowModal(false)}
                onCreated={() => {
                    setShowModal(false);
                    fetchWeek();
                    fetchMonthCount();
                }}
                candidate={null}
            />

        </div>
        </RhLayout>
    );
};

export default AgendaPage;
