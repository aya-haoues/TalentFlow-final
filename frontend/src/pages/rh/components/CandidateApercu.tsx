// ============================================================
// CandidateApercu.tsx — Onglet "Aperçu" de la modale candidat
// ============================================================

import React from 'react';
import {
    Tag, Button, Space, Descriptions,
    Card, Tooltip, Typography, Timeline,
} from 'antd';
import {
    DownloadOutlined, PrinterOutlined, FilePdfOutlined,
    HistoryOutlined, UserOutlined, EnvironmentOutlined,
    PhoneOutlined, ShopOutlined,
    GithubOutlined, LinkedinOutlined, TrophyOutlined,
    BulbOutlined, MailOutlined, ExportOutlined,
    BookOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ExperienceChart from '../components/ExperienceChart';
import { formatAdresse } from '../../../hooks/useCandidateActions';
import type { ApercuProps } from '../../../hooks/useCandidateActions';
import { PRIMARY } from '../../../theme/colors';

const { Text } = Typography;

// ════════════════════════════════════════════════════════════
// SOUS-COMPOSANT 1 : SectionHeader
// ════════════════════════════════════════════════════════════

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({ icon, title }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 10,
        borderBottom: '2px solid #f0f0f0',
    }}>
        <span style={{ color: PRIMARY, fontSize: 15 }}>{icon}</span>
        <span style={{
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 1.2,
            color: '#8c8c8c',
            textTransform: 'uppercase',
        }}>
            {title}
        </span>
    </div>
));
SectionHeader.displayName = 'SectionHeader';

// ════════════════════════════════════════════════════════════
// SOUS-COMPOSANT 2 : ExperienceTimeline
// ════════════════════════════════════════════════════════════

const ExperienceTimeline: React.FC<{ data: any[] }> = React.memo(({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 60, color: '#bfbfbf' }}>
                <HistoryOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                <div>Aucune expérience enregistrée</div>
            </div>
        );
    }

    const items = data.map((exp, idx) => {
        const start = exp.date_debut || exp.start_date;
        const end = exp.date_fin || exp.end_date;
        const company = exp.entreprise || exp.company;
        const position = exp.poste || exp.position || exp.titre;

        const months = end
            ? dayjs(end).diff(dayjs(start), 'month')
            : dayjs().diff(dayjs(start), 'month');

        return {
            key: exp.id ?? `exp-${idx}`,
            color: PRIMARY,
            label: start ? (
                <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(start).format('MM/YYYY')}
                    {end ? ` → ${dayjs(end).format('MM/YYYY')}` : " → Aujourd'hui"}
                </Text>
            ) : null,
            children: (
                <Card
                    size="small"
                    style={{
                        marginBottom: 12,
                        borderLeft: `3px solid ${PRIMARY}`,
                        borderRadius: '0 8px 8px 0',
                        background: '#fafffe',
                    }}
                    styles={{ body: { padding: '10px 14px' } }}
                >
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                        {position || 'Poste non précisé'}
                    </div>
                    <div style={{ color: PRIMARY, fontSize: 12, marginBottom: 4 }}>
                        <ShopOutlined /> {company || 'Entreprise non précisée'}
                    </div>
                    {exp.description && (
                        <div style={{ fontSize: 12, color: '#595959', marginBottom: 6, lineHeight: 1.5 }}>
                            {exp.description}
                        </div>
                    )}
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        {months > 0 ? `${months} mois` : 'Durée non précisée'}
                    </Text>
                </Card>
            ),
        };
    });

    return <Timeline mode="left" items={items} />;
});
ExperienceTimeline.displayName = 'ExperienceTimeline';

// ════════════════════════════════════════════════════════════
// SOUS-COMPOSANT 3 : FormationTimeline (NOUVEAU)
// ════════════════════════════════════════════════════════════

const FormationTimeline: React.FC<{ data: any[] }> = React.memo(({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 60, color: '#bfbfbf' }}>
                <BookOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                <div>Aucune formation enregistrée</div>
            </div>
        );
    }

    const items = data.map((formation, idx) => {
        const start = formation.date_debut || formation.start_date;
        const end = formation.date_fin || formation.end_date;
        const etablissement = formation.etablissement || formation.school || formation.institution;
        const diplome = formation.diplome || formation.titre || formation.degree || formation.nom;
        const domaine = formation.domaine || formation.field || formation.specialite;

        return {
            key: formation.id ?? `formation-${idx}`,
            color: '#722ed1', // violet pour différencier des expériences
            label: start ? (
                <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(start).format('MM/YYYY')}
                    {end ? ` → ${dayjs(end).format('MM/YYYY')}` : " → En cours"}
                </Text>
            ) : null,
            children: (
                <Card
                    size="small"
                    style={{
                        marginBottom: 12,
                        borderLeft: `3px solid #722ed1`,
                        borderRadius: '0 8px 8px 0',
                        background: '#faf8ff',
                    }}
                    styles={{ body: { padding: '10px 14px' } }}
                >
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                        {diplome || 'Diplôme non précisé'}
                    </div>
                    {domaine && (
                        <div style={{ color: '#722ed1', fontSize: 12, marginBottom: 2 }}>
                            {domaine}
                        </div>
                    )}
                    <div style={{ color: '#722ed1', fontSize: 12, marginBottom: 4 }}>
                        <BookOutlined /> {etablissement || 'Établissement non précisé'}
                    </div>
                    {formation.description && (
                        <div style={{ fontSize: 12, color: '#595959', marginBottom: 6, lineHeight: 1.5 }}>
                            {formation.description}
                        </div>
                    )}
                </Card>
            ),
        };
    });

    return <Timeline mode="left" items={items} />;
});
FormationTimeline.displayName = 'FormationTimeline';

// ════════════════════════════════════════════════════════════
// SOUS-COMPOSANT 4 : ChallengesList (NOUVEAU)
// ════════════════════════════════════════════════════════════

const ChallengesList: React.FC<{ data: any[] | string }> = React.memo(({ data }) => {
    // Gère les deux cas : tableau d'objets ou chaîne JSON
    let challenges: any[] = [];

    if (typeof data === 'string') {
        try {
            challenges = JSON.parse(data);
        } catch {
            // Si c'est une chaîne brute (texte libre), on l'affiche directement
            return (
                <div style={{
                    background: '#fffbe6',
                    borderLeft: `4px solid #faad14`,
                    padding: '14px 18px',
                    fontSize: 13,
                    whiteSpace: 'pre-wrap',
                    borderRadius: '0 8px 8px 0',
                }}>
                    {data}
                </div>
            );
        }
    } else {
        challenges = data ?? [];
    }

    if (!challenges || challenges.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 40, color: '#bfbfbf' }}>
                <ThunderboltOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                <div>Aucun défi renseigné</div>
            </div>
        );
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
            {challenges.map((challenge: any, idx: number) => {
                const titre = challenge.titre || challenge.title || challenge.nom || challenge.name;
                const description = challenge.description || challenge.detail || challenge.contenu;
                const resultat = challenge.resultat || challenge.result || challenge.outcome;

                return (
                    <Card
                        key={challenge.id ?? `challenge-${idx}`}
                        size="small"
                        style={{
                            borderLeft: `3px solid #faad14`,
                            borderRadius: '0 8px 8px 0',
                            background: '#fffcf0',
                        }}
                        styles={{ body: { padding: '10px 14px' } }}
                    >
                        {titre && (
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                                <ThunderboltOutlined style={{ color: '#faad14', marginRight: 6 }} />
                                {titre}
                            </div>
                        )}
                        {description && (
                            <div style={{ fontSize: 12, color: '#595959', marginBottom: resultat ? 6 : 0, lineHeight: 1.5 }}>
                                {description}
                            </div>
                        )}
                        {resultat && (
                            <div style={{ fontSize: 12, color: '#389e0d', fontStyle: 'italic' }}>
                                ✓ {resultat}
                            </div>
                        )}
                        {/* Cas où le challenge est une simple chaîne dans le tableau */}
                        {typeof challenge === 'string' && (
                            <div style={{ fontSize: 12, color: '#595959', lineHeight: 1.5 }}>
                                {challenge}
                            </div>
                        )}
                    </Card>
                );
            })}
        </Space>
    );
});
ChallengesList.displayName = 'ChallengesList';

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : CandidateApercu
// ════════════════════════════════════════════════════════════

const CandidateApercu: React.FC<ApercuProps> = React.memo(({
    candidate,
    viewMode,
    onViewModeChange,
    onDownloadCv,
    onPrintCv,
}) => {

    console.log("Données reçues par le composant :", candidate);
    return (
        <div style={{ padding: '20px 0' }}>

            {/* SECTION 1 — INFORMATIONS PERSONNELLES */}
            <SectionHeader icon={<UserOutlined />} title="Informations personnelles" />
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 28 }}>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                    <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Téléphone</>}>
                    {candidate.telephone || <Text type="secondary">Non renseigné</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Adresse</>}>
                    {formatAdresse(candidate.adresse)}
                </Descriptions.Item>
                <Descriptions.Item label="Date de naissance">
                    {candidate.date_naissance ? dayjs(candidate.date_naissance).format('DD/MM/YYYY') : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Genre">{candidate.genre || '—'}</Descriptions.Item>
                <Descriptions.Item label="Nationalité">{candidate.nationalite || '—'}</Descriptions.Item>
                <Descriptions.Item label="Contrat souhaité" span={2}>
                    <Tag color="blue">{candidate.contract_type_preferred || '—'}</Tag>
                </Descriptions.Item>
                {candidate.linkedin_url && (
                    <Descriptions.Item label={<><LinkedinOutlined /> LinkedIn</>}>
                        <a href={candidate.linkedin_url} target="_blank" rel="noreferrer">Voir le profil</a>
                    </Descriptions.Item>
                )}
                {candidate.github_url && (
                    <Descriptions.Item label={<><GithubOutlined /> GitHub</>}>
                        <a href={candidate.github_url} target="_blank" rel="noreferrer">Voir le profil</a>
                    </Descriptions.Item>
                )}
            </Descriptions>

            {/* SECTION 2 — MOTIVATION */}
            {candidate.motivation && (
                <>
                    <SectionHeader icon={<BulbOutlined />} title="Pourquoi nous ?" />
                    <div style={{
                        background: '#f9fffe',
                        borderLeft: `4px solid ${PRIMARY}`,
                        padding: '14px 18px',
                        fontSize: 13,
                        marginBottom: 28,
                        whiteSpace: 'pre-wrap',
                    }}>
                        {candidate.motivation}
                    </div>
                </>
            )}

            {/* SECTION 3 — COMPÉTENCES */}
            <SectionHeader icon={<TrophyOutlined />} title="Compétences" />
            <div style={{ marginBottom: 28 }}>
                {candidate.skills && candidate.skills.length > 0 ? (
                    <Space wrap size={[8, 8]}>
                        {candidate.skills.map((s: any, i: number) => (
                            <Tag key={i} style={{ borderRadius: 20, background: '#e6f7f5', color: '#004d47' }}>
                                {typeof s === 'string' ? s : (s.nom || s.name || s.label)}
                            </Tag>
                        ))}
                    </Space>
                ) : <Text type="secondary">Aucune compétence renseignée</Text>}
            </div>

            {/* SECTION 4 — EXPÉRIENCES */}
            <SectionHeader icon={<ShopOutlined />} title="Expériences professionnelles" />
            <div style={{ marginBottom: 28 }}>
                <ExperienceTimeline data={candidate.experiences ?? []} />
            </div>

            {/* SECTION 5 — FORMATIONS (NOUVEAU) */}
            <SectionHeader icon={<BookOutlined />} title="Formations" />
            <div style={{ marginBottom: 28 }}>
                <FormationTimeline data={candidate.formations ?? []} />
            </div>

            {/* SECTION 6 — DÉFIS / CHALLENGES (NOUVEAU) */}
            {(candidate.challenges && (
                Array.isArray(candidate.challenges)
                    ? candidate.challenges.length > 0
                    : candidate.challenges !== ''
            )) && (
                <>
                    <SectionHeader icon={<ThunderboltOutlined />} title="Défis & réalisations" />
                    <div style={{ marginBottom: 28 }}>
                        <ChallengesList data={candidate.challenges} />
                    </div>
                </>
            )}

            {/* SECTION 7 — VISUALISEUR CV / DIAGRAMME */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Space style={{ background: '#f5f5f5', padding: 4, borderRadius: 8 }}>
                    <Button
                        type={viewMode === 'cv' ? 'primary' : 'text'}
                        onClick={() => onViewModeChange('cv')}
                        icon={<FilePdfOutlined />}
                        style={viewMode === 'cv' ? { background: PRIMARY, borderColor: PRIMARY } : {}}
                    >
                        Curriculum Vitae
                    </Button>
                    <Button
                        type={viewMode === 'experience' ? 'primary' : 'text'}
                        onClick={() => onViewModeChange('experience')}
                        icon={<HistoryOutlined />}
                        style={viewMode === 'experience' ? { background: PRIMARY, borderColor: PRIMARY } : {}}
                    >
                        Chronologie
                    </Button>
                </Space>

                {viewMode === 'cv' && (
                    <Space>
                        <Tooltip title="Télécharger">
                            <Button icon={<DownloadOutlined />} onClick={onDownloadCv} />
                        </Tooltip>
                        <Tooltip title="Imprimer">
                            <Button icon={<PrinterOutlined />} onClick={onPrintCv} />
                        </Tooltip>
                    </Space>
                )}
            </div>

            {/* ZONE D'AFFICHAGE DU CV */}
            <div style={{
                minHeight: 600,
                border: '1px solid #f0f0f0',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#fff',
            }}>
                {viewMode === 'cv' ? (
                    candidate.cv_url ? (
                        <div style={{ position: 'relative' }}>
                            <object
                                data={candidate.cv_url}
                                type="application/pdf"
                                width="100%"
                                height="750px"
                                style={{ display: 'block', border: 'none' }}
                            >
                                <embed
                                    src={candidate.cv_url}
                                    type="application/pdf"
                                    width="100%"
                                    height="750px"
                                />
                            </object>
                            <div style={{ padding: '10px', textAlign: 'center', background: '#f5f5f5' }}>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    href={candidate.cv_url}
                                    target="_blank"
                                    download
                                >
                                    Télécharger le CV
                                </Button>
                                <Button
                                    type="link"
                                    icon={<ExportOutlined />}
                                    href={candidate.cv_url}
                                    target="_blank"
                                    style={{ marginLeft: 8 }}
                                >
                                    Ouvrir dans un nouvel onglet
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 100 }}>
                            <FilePdfOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
                            <p>Aucun CV disponible pour ce candidat</p>
                        </div>
                    )
                ) : (
                    <div style={{ padding: '28px 32px' }}>
                        <ExperienceChart data={candidate.experiences ?? []} />
                    </div>
                )}
            </div>
        </div>
    );
});

CandidateApercu.displayName = 'CandidateApercu';
export default CandidateApercu;
