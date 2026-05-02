// ============================================================
// InterviewModal.tsx — Modale de planification d'entretien
// ============================================================
//
// AJOUT : Étape 0 — Recherche de candidat
//   Déclenchée quand `candidate` prop est null (appel depuis AgendaPage).
//   Une barre de recherche appelle GET /rh/applications?search=...
//   et affiche les résultats pour sélectionner le candidat cible.
//   Une fois sélectionné, on passe à l'étape 1 habituelle.
//
// ÉTAPES :
//   0 (conditionnel) → Recherche + sélection du candidat
//   1                → Type, date, heure, durée, lieu/lien
//   2                → Participants, note, visibilité
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
    Modal, Form, DatePicker, TimePicker, Select, Input,
    Button, Space, Divider, Avatar, message, Spin,
} from 'antd';
import {
    CalendarOutlined, VideoCameraOutlined, PhoneOutlined,
    EnvironmentOutlined, CheckCircleOutlined, TeamOutlined,
    LockOutlined, EyeOutlined, GlobalOutlined, SearchOutlined,
    UserOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import axios from 'axios';
import api         from '../../../services/api';
import { PRIMARY } from '../../../theme/colors';
import type { RhApplication } from '../../../types/index';

dayjs.locale('fr');

// ════════════════════════════════════════════════════════════
// SECTION 1 — TYPES
// ════════════════════════════════════════════════════════════

type InterviewType  = 'telephonique' | 'visio' | 'presentiel' | 'technique';
type NoteVisibility = 'rh_only' | 'manager' | 'candidat';
type Step = 0 | 1 | 2;

interface TeamMember {
    id:    string;
    name:  string;
    role:  string;
    email: string;
    avatar?: string | null;
}

interface Props {
    visible:   boolean;
    onClose:   () => void;
    onCreated: () => void;
    /**
     * null quand ouvert depuis AgendaPage (pas de candidat pré-sélectionné).
     * Défini quand ouvert depuis la fiche candidat.
     */
    candidate: RhApplication | null;
}

// ════════════════════════════════════════════════════════════
// SECTION 2 — CONSTANTES
// ════════════════════════════════════════════════════════════

const INTERVIEW_TYPES: {
    value: InterviewType;
    label: string;
    icon:  React.ReactNode;
    color: string;
    desc:  string;
}[] = [
    { value: 'telephonique', label: 'Téléphonique',    icon: <PhoneOutlined />,       color: '#3B82F6', desc: '15–30 min · Premier contact'       },
    { value: 'visio',        label: 'Visioconférence', icon: <VideoCameraOutlined />,  color: '#8B5CF6', desc: '30–60 min · Google Meet / Teams'    },
    { value: 'presentiel',   label: 'Présentiel',      icon: <EnvironmentOutlined />, color: PRIMARY,   desc: '45–90 min · Locaux entreprise'      },
    { value: 'technique',    label: 'Test technique',  icon: <CheckCircleOutlined />, color: '#F59E0B', desc: '60–120 min · Exercice pratique'      },
];

const NOTE_VIS: {
    value: NoteVisibility;
    label: string;
    icon:  React.ReactNode;
    desc:  string;
    color: string;
}[] = [
    { value: 'rh_only',  label: 'RH uniquement',   icon: <LockOutlined />,   desc: 'Visible seulement par le RH',  color: '#6B7280' },
    { value: 'manager',  label: 'RH + Manager',     icon: <EyeOutlined />,    desc: 'Partagé avec le manager',      color: '#8B5CF6' },
    { value: 'candidat', label: 'Visible candidat', icon: <GlobalOutlined />, desc: 'Le candidat verra cette note', color: PRIMARY   },
];

const DURATIONS = [
    { value: 15,  label: '15 min'   },
    { value: 30,  label: '30 min'   },
    { value: 45,  label: '45 min'   },
    { value: 60,  label: '1 heure'  },
    { value: 90,  label: '1h30'     },
    { value: 120, label: '2 heures' },
];

// ════════════════════════════════════════════════════════════
// SECTION 3 — COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════

export default function InterviewModal({ visible, onClose, onCreated, candidate }: Props) {
    const [form] = Form.useForm();

    // ── Navigation ──────────────────────────────────────────
    /**
     * Étape initiale :
     *  - 0 si candidate est null (AgendaPage) → recherche d'abord
     *  - 1 si candidate est fourni (fiche candidat) → flux habituel
     */
    const [step, setStep] = useState<Step>(candidate ? 1 : 0);

    // ── Candidat sélectionné dynamiquement (étape 0) ────────
    /**
     * Quand candidate prop est fourni, on l'utilise directement.
     * Sinon, il est défini après sélection dans la barre de recherche.
     */
    const [resolvedCandidate, setResolvedCandidate] = useState<RhApplication | null>(candidate);

    // ── Synchro prop → state quand la modale se rouvre ─────
    useEffect(() => {
        if (visible) {
            setResolvedCandidate(candidate);
            setStep(candidate ? 1 : 0);
            setSelectedType('visio');
            setSelectedMembers([]);
            setNoteVisibility('rh_only');
            setCandidateSearch('');
            setCandidateResults([]);
            form.resetFields();
        }
    }, [visible, candidate, form]);

    // ── États hors Form ─────────────────────────────────────
    const [selectedType,    setSelectedType]    = useState<InterviewType>('visio');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [noteVisibility,  setNoteVisibility]  = useState<NoteVisibility>('rh_only');

    // ── Recherche de candidat (étape 0) ─────────────────────
    const [candidateSearch,  setCandidateSearch]  = useState('');
    const [candidateResults, setCandidateResults] = useState<RhApplication[]>([]);
    const [loadingSearch,    setLoadingSearch]    = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Debounce 350 ms sur la saisie pour limiter les appels API.
     * GET /rh/applications?search=<query>&per_page=8
     */
    const handleCandidateSearchChange = (value: string) => {
        setCandidateSearch(value);
        setCandidateResults([]);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (!value.trim()) return;

        searchTimeout.current = setTimeout(async () => {
            setLoadingSearch(true);
            try {
                const res = await api.get('/rh/applications', {
                    params: { search: value.trim(), per_page: 8 },
                });
                // Adapter selon la structure réelle de votre API :
                // res.data.data (pagination Laravel) ou res.data (tableau direct)
                setCandidateResults(res.data?.data ?? res.data ?? []);
            } catch {
                message.error('Erreur lors de la recherche de candidats');
            } finally {
                setLoadingSearch(false);
            }
        }, 350);
    };

    /**
     * Sélection d'un candidat dans les résultats.
     * On stocke le candidat résolu et on passe à l'étape 1.
     */
    const handleSelectCandidate = (c: RhApplication) => {
        setResolvedCandidate(c);
        setCandidateResults([]);
        setCandidateSearch('');
        setStep(1);
    };

    // ── Membres de l'équipe ──────────────────────────────────
    const [team,        setTeam]        = useState<TeamMember[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(false);

    useEffect(() => {
        setLoadingTeam(true);
        api.get('/rh/team-members')
            .then(res => setTeam(res.data?.data ?? []))
            .catch(() => message.error("Impossible de charger les membres de l'équipe"))
            .finally(() => setLoadingTeam(false));
    }, []);

    // ── Chargement final ─────────────────────────────────────
    const [loading, setLoading] = useState(false);

    // ════════════════════════════════════════════════════════
    // HANDLERS
    // ════════════════════════════════════════════════════════

    const handleStep1Next = async () => {
        try {
            await form.validateFields(['type_field', 'date', 'time', 'duration_minutes', 'location', 'meeting_url']);
            setStep(2);
        } catch {
            // Ant Design affiche les erreurs inline
        }
    };

    const handleSubmit = async () => {
        if (!resolvedCandidate?.id) {
            message.error("Impossible d'identifier le candidat.");
            return;
        }

        try {
            await form.validateFields();
            setLoading(true);

            const values = form.getFieldsValue(true);

            const participantsObjects = selectedMembers.map(id => {
                const member = team.find(m => m.id === id);
                return member
                    ? { id: member.id, name: member.name, role: member.role, email: member.email }
                    : { id };
            });

            const payload = {
                type:             selectedType,
                date:             (values.date as Dayjs)?.format('YYYY-MM-DD'),
                time:             (values.time as Dayjs)?.format('HH:mm'),
                duration_minutes: values.duration_minutes,
                location:         values.location    || null,
                meeting_url:      values.meeting_url || null,
                participants:     participantsObjects,
                note:             values.note        || null,
                note_visibility:  noteVisibility,
                candidate_name:   resolvedCandidate.full_name ?? null,
                candidate_email:  resolvedCandidate.email     ?? null,
            };

            await api.post(`/rh/applications/${resolvedCandidate.id}/interviews`, payload);

            message.success('Entretien planifié avec succès !');
            onCreated();
            onClose();

        } catch (err: unknown) {
            const isValidation = err instanceof Object && 'errorFields' in err;
            if (!isValidation) {
                if (axios.isAxiosError(err)) {
                    const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
                    if (errors) {
                        const [field, msgs] = Object.entries(errors)[0];
                        message.error(`${field}: ${msgs.join(', ')}`);
                    } else {
                        message.error(err.response?.data?.message ?? "Erreur lors de la création");
                    }
                } else {
                    message.error("Une erreur inattendue s'est produite.");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const typeConfig = INTERVIEW_TYPES.find(t => t.value === selectedType)!;

    // ════════════════════════════════════════════════════════
    // RENDU — TITRE DYNAMIQUE
    // ════════════════════════════════════════════════════════

    /**
     * Le badge du candidat dans le titre affiche :
     *  - le candidat résolu (sélectionné en étape 0 ou prop directe)
     *  - "Sélectionner un candidat" si encore à l'étape 0
     */
    const titleBadge = resolvedCandidate ? (
        <span style={{
            marginLeft:   4,
            fontSize:     12,
            fontWeight:   600,
            color:        '#8c8c8c',
            background:   '#f5f5f5',
            padding:      '2px 8px',
            borderRadius: 10,
        }}>
            {resolvedCandidate.full_name}
        </span>
    ) : (
        <span style={{
            marginLeft:   4,
            fontSize:     12,
            fontWeight:   500,
            color:        '#bfbfbf',
            background:   '#fafafa',
            padding:      '2px 8px',
            borderRadius: 10,
            border:       '1px dashed #d9d9d9',
        }}>
            Candidat non sélectionné
        </span>
    );

    // ════════════════════════════════════════════════════════
    // RENDU PRINCIPAL
    // ════════════════════════════════════════════════════════

    return (
        <Modal
            title={
                <Space>
                    <CalendarOutlined style={{ color: PRIMARY }} />
                    <span>Planifier un entretien</span>
                    {titleBadge}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={640}
            destroyOnClose
            styles={{ body: { padding: '20px 24px' } }}
        >
            {/* ══════════════════════════════════════════════
                ÉTAPE 0 — Recherche de candidat
                Affichée uniquement quand candidate prop est null
            ══════════════════════════════════════════════ */}
            {step === 0 && (
                <div>
                    {/* En-tête explicatif */}
                    <div style={{
                        padding:      '14px 16px',
                        background:   '#f8faff',
                        border:       `1px solid ${PRIMARY}20`,
                        borderRadius: 10,
                        marginBottom: 22,
                        display:      'flex',
                        alignItems:   'center',
                        gap:          12,
                    }}>
                        <div style={{
                            width:          40,
                            height:         40,
                            borderRadius:   '50%',
                            background:     `${PRIMARY}15`,
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            color:          PRIMARY,
                            fontSize:       18,
                            flexShrink:     0,
                        }}>
                            <UserOutlined />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#262626', marginBottom: 2 }}>
                                Sélectionner un candidat
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                Recherchez par nom, email ou poste pour trouver le candidat concerné.
                            </div>
                        </div>
                    </div>

                    {/* Barre de recherche */}
                    <Input
                        size="large"
                        placeholder="Nom, email ou intitulé du poste..."
                        prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                        value={candidateSearch}
                        onChange={e => handleCandidateSearchChange(e.target.value)}
                        style={{ borderRadius: 10, marginBottom: 14 }}
                        autoFocus
                        allowClear
                    />

                    {/* Zone de résultats */}
                    <div style={{ minHeight: 200 }}>
                        {/* Chargement */}
                        {loadingSearch && (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                                <Spin size="small" />
                                <div style={{ marginTop: 10, fontSize: 13 }}>Recherche en cours...</div>
                            </div>
                        )}

                        {/* Placeholder initial (aucune saisie) */}
                        {!loadingSearch && !candidateSearch && (
                            <div style={{
                                textAlign:    'center',
                                padding:      '40px 0',
                                color:        '#bfbfbf',
                                fontSize:     13,
                            }}>
                                <SearchOutlined style={{ fontSize: 28, marginBottom: 10, display: 'block' }} />
                                Commencez à saisir pour rechercher un candidat
                            </div>
                        )}

                        {/* Aucun résultat */}
                        {!loadingSearch && candidateSearch && candidateResults.length === 0 && (
                            <div style={{
                                textAlign:    'center',
                                padding:      '40px 0',
                                color:        '#bfbfbf',
                                fontSize:     13,
                            }}>
                                Aucun candidat trouvé pour « {candidateSearch} »
                            </div>
                        )}

                        {/* Liste des résultats */}
                        {!loadingSearch && candidateResults.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {candidateResults.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => handleSelectCandidate(c)}
                                        style={{
                                            display:      'flex',
                                            alignItems:   'center',
                                            gap:          14,
                                            padding:      '12px 14px',
                                            border:       '1.5px solid #f0f0f0',
                                            borderRadius: 10,
                                            cursor:       'pointer',
                                            background:   '#fff',
                                            transition:   'all 0.14s',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = PRIMARY;
                                            (e.currentTarget as HTMLDivElement).style.background = `${PRIMARY}06`;
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#f0f0f0';
                                            (e.currentTarget as HTMLDivElement).style.background = '#fff';
                                        }}
                                    >
                                        {/* Avatar */}
                                        <Avatar
                                            size={42}
                                            style={{ background: `${PRIMARY}25`, color: PRIMARY, flexShrink: 0, fontWeight: 700 }}
                                        >
                                            {(c.full_name ?? '?')[0].toUpperCase()}
                                        </Avatar>

                                        {/* Infos candidat */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight:   700,
                                                fontSize:     14,
                                                color:        '#262626',
                                                overflow:     'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace:   'nowrap',
                                            }}>
                                                {c.full_name}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                                                {c.email}
                                            </div>
                                            {/* Poste visé — adaptez selon votre type RhApplication */}
                                            {(c as any).job_title && (
                                                <div style={{
                                                    display:      'inline-block',
                                                    marginTop:    4,
                                                    fontSize:     11,
                                                    fontWeight:   600,
                                                    color:        PRIMARY,
                                                    background:   `${PRIMARY}12`,
                                                    padding:      '1px 8px',
                                                    borderRadius: 6,
                                                }}>
                                                    {(c as any).job_title}
                                                </div>
                                            )}
                                        </div>

                                        {/* Flèche de sélection */}
                                        <div style={{
                                            flexShrink: 0,
                                            color:      '#d9d9d9',
                                            fontSize:   16,
                                            transition: 'color 0.14s',
                                        }}>
                                            →
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════
                ÉTAPES 1 & 2 — Formulaire principal
                (inchangé par rapport à la version originale)
            ══════════════════════════════════════════════ */}
            <Form form={form} layout="vertical" size="large" preserve style={{ display: step === 0 ? 'none' : 'block' }}>

                {/* ══════════════════
                    ÉTAPE 1
                ══════════════════ */}
                <div style={{ display: step === 1 ? 'block' : 'none' }}>

                    {/* Bandeau candidat sélectionné — rappel visuel */}
                    {resolvedCandidate && !candidate && (
                        <div style={{
                            display:      'flex',
                            alignItems:   'center',
                            gap:          10,
                            padding:      '10px 14px',
                            background:   `${PRIMARY}08`,
                            border:       `1px solid ${PRIMARY}25`,
                            borderRadius: 9,
                            marginBottom: 18,
                        }}>
                            <Avatar
                                size={30}
                                style={{ background: `${PRIMARY}25`, color: PRIMARY, fontWeight: 700, flexShrink: 0, fontSize: 12 }}
                            >
                                {(resolvedCandidate.full_name ?? '?')[0].toUpperCase()}
                            </Avatar>
                            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#262626' }}>
                                {resolvedCandidate.full_name}
                                <span style={{ fontWeight: 400, color: '#8c8c8c', marginLeft: 8, fontSize: 12 }}>
                                    {resolvedCandidate.email}
                                </span>
                            </div>
                            <Button
                                type="link"
                                size="small"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => {
                                    setResolvedCandidate(null);
                                    setStep(0);
                                }}
                                style={{ color: '#8c8c8c', fontSize: 12, padding: 0 }}
                            >
                                Changer
                            </Button>
                        </div>
                    )}

                    {/* Type d'entretien */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{
                            fontSize:      11,
                            fontWeight:    700,
                            letterSpacing: 1.2,
                            color:         '#8c8c8c',
                            textTransform: 'uppercase',
                            marginBottom:  12,
                        }}>
                            Type d'entretien
                        </div>
                        <Form.Item name="type_field" initialValue="visio" noStyle>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {INTERVIEW_TYPES.map(t => (
                                    <div
                                        key={t.value}
                                        onClick={() => {
                                            setSelectedType(t.value);
                                            form.setFieldValue('type_field', t.value);
                                        }}
                                        style={{
                                            display:      'flex',
                                            alignItems:   'center',
                                            gap:          12,
                                            padding:      '12px 14px',
                                            border:       `1.5px solid ${selectedType === t.value ? t.color : '#f0f0f0'}`,
                                            borderRadius: 10,
                                            cursor:       'pointer',
                                            background:   selectedType === t.value ? `${t.color}08` : '#fff',
                                            transition:   'all 0.14s',
                                        }}
                                    >
                                        <div style={{
                                            width:          36,
                                            height:         36,
                                            borderRadius:   '50%',
                                            flexShrink:     0,
                                            background:     selectedType === t.value ? `${t.color}20` : '#f5f5f5',
                                            display:        'flex',
                                            alignItems:     'center',
                                            justifyContent: 'center',
                                            color:          selectedType === t.value ? t.color : '#8c8c8c',
                                            fontSize:       16,
                                        }}>
                                            {t.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: selectedType === t.value ? t.color : '#262626' }}>
                                                {t.label}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{t.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Form.Item>
                    </div>

                    {/* Date / Heure / Durée */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <Form.Item
                            name="date"
                            label="Date"
                            rules={[{ required: true, message: 'Requis' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <DatePicker
                                style={{ width: '100%', borderRadius: 8 }}
                                format="DD/MM/YYYY"
                                placeholder="Choisir"
                                disabledDate={d => d.isBefore(dayjs(), 'day')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="time"
                            label="Heure"
                            rules={[{ required: true, message: 'Requis' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <TimePicker
                                style={{ width: '100%', borderRadius: 8 }}
                                format="HH:mm"
                                minuteStep={15}
                                placeholder="HH:mm"
                                showNow={false}
                            />
                        </Form.Item>

                        <Form.Item
                            name="duration_minutes"
                            label="Durée"
                            rules={[{ required: true, message: 'Requis' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <Select placeholder="Durée" options={DURATIONS} />
                        </Form.Item>
                    </div>

                    {selectedType === 'presentiel' && (
                        <Form.Item name="location" label="Lieu" style={{ marginBottom: 16 }}>
                            <Input
                                placeholder="Ex: 12 Rue de la Paix, Tunis — Salle de conférence 2"
                                style={{ borderRadius: 8 }}
                                prefix={<EnvironmentOutlined style={{ color: '#8c8c8c' }} />}
                            />
                        </Form.Item>
                    )}

                    {(selectedType === 'visio' || selectedType === 'technique') && (
                        <Form.Item name="meeting_url" label="Lien de réunion" style={{ marginBottom: 16 }}>
                            <Input
                                placeholder="https://meet.google.com/... ou https://teams.microsoft.com/..."
                                style={{ borderRadius: 8 }}
                                prefix={<VideoCameraOutlined style={{ color: '#8c8c8c' }} />}
                            />
                        </Form.Item>
                    )}

                    <Button
                        type="primary"
                        block
                        size="large"
                        onClick={handleStep1Next}
                        style={{ background: PRIMARY, borderColor: PRIMARY, height: 44, marginTop: 8 }}
                    >
                        Continuer →
                    </Button>
                </div>

                {/* ══════════════════
                    ÉTAPE 2
                ══════════════════ */}
                <div style={{ display: step === 2 ? 'block' : 'none' }}>

                    {/* Résumé étape 1 */}
                    <div style={{
                        padding:      '12px 16px',
                        background:   `${typeConfig.color}08`,
                        border:       `1px solid ${typeConfig.color}30`,
                        borderRadius: 10,
                        marginBottom: 22,
                        display:      'flex',
                        alignItems:   'center',
                        gap:          12,
                    }}>
                        <div style={{
                            width:          36,
                            height:         36,
                            borderRadius:   '50%',
                            background:     `${typeConfig.color}20`,
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            color:          typeConfig.color,
                            fontSize:       16,
                            flexShrink:     0,
                        }}>
                            {typeConfig.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: typeConfig.color }}>
                                {typeConfig.label}
                                {resolvedCandidate && (
                                    <span style={{ fontWeight: 400, color: '#8c8c8c', marginLeft: 8, fontSize: 12 }}>
                                        avec {resolvedCandidate.full_name}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                {(form.getFieldValue('date') as Dayjs | undefined)?.format('dddd D MMMM YYYY')}
                                {' · '}
                                {(form.getFieldValue('time') as Dayjs | undefined)?.format('HH:mm')}
                                {' · '}
                                {DURATIONS.find(d => d.value === form.getFieldValue('duration_minutes'))?.label}
                            </div>
                        </div>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => setStep(1)}
                            style={{ color: '#8c8c8c', fontSize: 12 }}
                        >
                            Modifier
                        </Button>
                    </div>

                    {/* Participants */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{
                            fontSize:      11,
                            fontWeight:    700,
                            letterSpacing: 1.2,
                            color:         '#8c8c8c',
                            textTransform: 'uppercase',
                            marginBottom:  12,
                        }}>
                            <TeamOutlined style={{ marginRight: 6 }} />
                            Autres participants (optionnel)
                        </div>

                        {loadingTeam ? (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: '#8c8c8c' }}>
                                <Spin size="small" />
                                <span style={{ marginLeft: 10, fontSize: 13 }}>Chargement des membres...</span>
                            </div>
                        ) : team.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 16, color: '#8c8c8c', fontSize: 13, background: '#fafafa', borderRadius: 8 }}>
                                Aucun membre disponible
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {team
                                    .filter(member => member.role === 'rh' || member.role === 'manager')
                                    .map(member => {
                                        const isSelected = selectedMembers.includes(member.id);
                                        return (
                                            <div
                                                key={member.id}
                                                onClick={() => setSelectedMembers(prev =>
                                                    isSelected
                                                        ? prev.filter(id => id !== member.id)
                                                        : [...prev, member.id]
                                                )}
                                                style={{
                                                    display:      'flex',
                                                    alignItems:   'center',
                                                    gap:          10,
                                                    padding:      '10px 12px',
                                                    border:       `1.5px solid ${isSelected ? PRIMARY : '#f0f0f0'}`,
                                                    borderRadius: 9,
                                                    cursor:       'pointer',
                                                    background:   isSelected ? '#f0fffe' : '#fff',
                                                    transition:   'all 0.13s',
                                                }}
                                            >
                                                <Avatar
                                                    size={32}
                                                    src={member.avatar ?? undefined}
                                                    style={{ background: isSelected ? PRIMARY : '#d9d9d9', flexShrink: 0 }}
                                                >
                                                    {member.name[0]}
                                                </Avatar>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {member.name}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{member.role}</div>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircleOutlined style={{ color: PRIMARY, flexShrink: 0 }} />
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    <Divider style={{ margin: '0 0 18px' }} />

                    {/* Note */}
                    <Form.Item
                        name="note"
                        label="Note sur l'entretien (optionnel)"
                        style={{ marginBottom: 18 }}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Points à aborder, prérequis, informations importantes..."
                            style={{ borderRadius: 8 }}
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    {/* Visibilité */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            fontSize:      11,
                            fontWeight:    700,
                            letterSpacing: 1.2,
                            color:         '#8c8c8c',
                            textTransform: 'uppercase',
                            marginBottom:  12,
                        }}>
                            Visibilité de la note
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {NOTE_VIS.map(v => (
                                <div
                                    key={v.value}
                                    onClick={() => setNoteVisibility(v.value)}
                                    style={{
                                        flex:         1,
                                        minWidth:     150,
                                        padding:      '10px 14px',
                                        border:       `1.5px solid ${noteVisibility === v.value ? v.color : '#f0f0f0'}`,
                                        borderRadius: 9,
                                        cursor:       'pointer',
                                        background:   noteVisibility === v.value ? `${v.color}08` : '#fff',
                                        transition:   'all 0.13s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ color: noteVisibility === v.value ? v.color : '#8c8c8c', fontSize: 14 }}>
                                            {v.icon}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: 12, color: noteVisibility === v.value ? v.color : '#262626' }}>
                                            {v.label}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{v.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Button onClick={() => setStep(1)}>← Retour</Button>
                        <Button
                            type="primary"
                            style={{ flex: 1, background: PRIMARY, borderColor: PRIMARY, height: 44, fontSize: 15, fontWeight: 600 }}
                            icon={<CalendarOutlined />}
                            loading={loading}
                            onClick={handleSubmit}
                        >
                            Planifier l'entretien
                        </Button>
                    </div>
                </div>

            </Form>
        </Modal>
    );
}
