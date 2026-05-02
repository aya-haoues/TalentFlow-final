import { Steps, Card, Tag, Progress, Avatar, Typography, Row, Col, Badge } from 'antd';
import { UserOutlined, ApartmentOutlined, RobotOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { PRIMARY } from '../../../theme/colors';

const { Text } = Typography;

interface AgentsPipelineProps {
    candidate: any;
}

export default function AgentsPipeline({ candidate }: AgentsPipelineProps) {

    // ── Agent 1 : profil depuis toutes les sources ──
    const profil = (() => {
    // Sources par ordre de richesse de données
    const sources = [
        candidate?.agent1_profil,
        candidate?.extraction,
        candidate?.cv_data_parsed
    ];

    // On cherche la source qui a le plus de compétences ou formations
    const bestSource = sources.find(s => 
        (Array.isArray(s?.competences) && s.competences.length > 0) || 
        (Array.isArray(s?.formation) && s.formation.length > 0)
    ) || sources[0]; // Sinon on prend la première par défaut

    if (!bestSource && !candidate?.full_name) return null;

    return {
        nom:               bestSource?.nom || candidate?.full_name || '—',
        email:             bestSource?.email || candidate?.email || '—',
        telephone:         bestSource?.telephone || candidate?.telephone || '—',
        competences:       bestSource?.competences || candidate?.competences || [],
        annees_experience: bestSource?.annees_experience ?? candidate?.experience_years ?? 0,
        niveau_global:     bestSource?.niveau_global || candidate?.education_level || 'Non précisé',
        langues:           bestSource?.langues || [],
        formation:         bestSource?.formation || candidate?.educations || [],
    };
})();


    // ── Agent 2 : matching depuis toutes les sources ──
    const matching = (() => {
        const m = candidate?.agent2_matching;
        if (m?.matches?.length > 0) return m;
        if (candidate?.matching_scores?.length > 0) {
            return {
                matches:              candidate.matching_scores,
                meilleur_match_id:    candidate.matched_job_id    ?? null,
                meilleur_match_titre: candidate.matched_job_titre ?? null,
            };
        }
        return null;
    })();

    const bestJob = (() => {
        if (candidate?.agent2_best_job?.titre) return candidate.agent2_best_job;
        if (candidate?.matched_job_titre) return {
            titre:       candidate.matched_job_titre,
            id:          candidate.matched_job_id ?? '',
            competences: [],
        };
        return null;
    })();

    // ── Conditions ──
// Modifiez ces lignes dans votre composant :
const agent1Done = !!candidate?.analyzed_at || !!profil;
const agent2Done = !!(matching?.matches?.length > 0 || bestJob?.titre);
const agent3Done = !!(candidate?.ai_score !== undefined && candidate?.ai_score !== null);

// Si l'agent 3 est fini, on force l'étape à 3 même si l'agent 2 a "sauté" une info
const currentStep = agent3Done ? 3 : (agent2Done ? 2 : (agent1Done ? 1 : 0));


    return (
        <div style={{ padding: '8px 0' }}>

            {/* ── STEPS ── */}
            <Steps
                current={currentStep}
                style={{ marginBottom: 32 }}
                items={[
                    {
                        title: 'Agent 1',
                        description: 'Extraction du profil',
                        icon: <UserOutlined />,
                        status: agent1Done ? 'finish' : 'wait',
                    },
                    {
                        title: 'Agent 2',
                        description: 'Matching avec offres',
                        icon: <ApartmentOutlined />,
                        status: agent2Done ? 'finish' : 'wait',
                    },
                    {
                        title: 'Agent 3',
                        description: 'Analyse & scoring',
                        icon: <RobotOutlined />,
                        status: agent3Done ? 'finish' : 'wait',
                    },
                ]}
            />

            {/* ══ AGENT 1 ══ */}
{/* ══ AGENT 1 ══ */}
<Card
    title={
        <span>
            <Avatar icon={<UserOutlined />} style={{ background: PRIMARY, marginRight: 8 }} />
            Agent 1 — Extracteur de Profil
            <Tag color={agent1Done ? 'green' : 'default'} style={{ marginLeft: 8 }}>
                {agent1Done ? '✓ Complété' : 'En attente'}
            </Tag>
        </span>
    }
    style={{ marginBottom: 16, borderLeft: `4px solid ${agent1Done ? '#52c41a' : '#d9d9d9'}` }}
>
    {agent1Done && profil ? (
        <Row gutter={[16, 12]}>
            <Col span={12}>
                <Text type="secondary">Nom détecté</Text>
                <div><Text strong>{profil.nom}</Text></div>
            </Col>
            <Col span={12}>
                <Text type="secondary">Email détecté</Text>
                <div><Text strong>{profil.email}</Text></div>
            </Col>
            <Col span={12}>
                <Text type="secondary">Téléphone</Text>
                <div><Text strong>{profil.telephone}</Text></div>
            </Col>
            <Col span={12}>
                <Text type="secondary">Années d'expérience</Text>
                <div><Text strong>{profil.annees_experience} ans</Text></div>
            </Col>

            {/* COMPÉTENCES */}
            <Col span={24}>
                <Text type="secondary">Compétences extraites</Text>
                <div style={{ marginTop: 6 }}>
                    {profil.competences.length > 0 ? (
                        profil.competences.map((c, i) => (
                            <Tag key={i} color="blue" style={{ marginBottom: 4 }}>{c}</Tag>
                        ))
                    ) : <Text type="secondary" italic>Aucune compétence détectée</Text>}
                </div>
            </Col>

            {/* FORMATIONS */}
            <Col span={24}>
                <Text type="secondary">Formation</Text>
                <div style={{ marginTop: 8 }}>
                    {profil.formation.length > 0 ? (
                        profil.formation.map((f, i) => (
                            <div key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${PRIMARY}33` }}>
                                <Text strong style={{ display: 'block' }}>
                                    {f.nom || f.degree || f.diplome || 'Diplôme non précisé'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    <ApartmentOutlined style={{ marginRight: 4 }} />
                                    {f.institut || f.school || 'Établissement non précisé'} 
                                    {f.date && ` • ${f.date}`}
                                </Text>
                            </div>
                        ))
                    ) : <Text type="secondary" italic>Aucune formation détectée</Text>}
                </div>
            </Col>
        </Row>
    ) : (
        <div style={{ textAlign: 'center', padding: 20 }}>
            <ClockCircleOutlined spin style={{ fontSize: 24, color: PRIMARY }} />
            <p>Extraction en cours...</p>
        </div>
    )}
</Card>


{/* ══ AGENT 2 ══ */}
<Card
    title={
        <span>
            <Avatar icon={<ApartmentOutlined />} style={{ background: '#722ed1', marginRight: 8 }} />
            Agent 2 — Dispatcher & Matching
            <Tag color={agent2Done ? 'green' : 'default'} style={{ marginLeft: 8 }}>
                {agent2Done ? '✓ Complété' : 'En attente'}
            </Tag>
        </span>
    }
    style={{ marginBottom: 16, borderLeft: `4px solid ${agent2Done ? '#52c41a' : '#d9d9d9'}` }}
>
    {agent2Done ? (
        matching && (matching.matches ?? []).length > 0 ? (
            <div>
                {/* Meilleur match */}
                {(() => {
                    const bestMatch = [...(matching.matches ?? [])]
                        .sort((a: any, b: any) => b.score_matching - a.score_matching)[0];
                    const titre = bestJob?.titre
                               || bestMatch?.job_titre
                               || matching?.meilleur_match_titre
                               || candidate?.matched_job_titre
                               || '';
                    return titre ? (
                        <div style={{
                            background: '#f6ffed', border: '1px solid #b7eb8f',
                            borderRadius: 8, padding: 12, marginBottom: 16
                        }}>
                            <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
                                ✓ Meilleur match : {titre}
                            </Text>
                            {bestMatch?.score_matching > 0 && (
                                <div style={{ marginTop: 6 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Score de correspondance : <strong>{bestMatch.score_matching}%</strong>
                                    </Text>
                                </div>
                            )}
                            {(bestJob?.competences ?? []).length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Compétences requises : </Text>
                                    {bestJob.competences.map((c: string, i: number) => (
                                        <Tag key={i} style={{ marginBottom: 2 }}>{c}</Tag>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null;
                })()}

                {/* Top matches */}
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    TOP OFFRES MATCHÉES :
                </Text>
                {[...(matching.matches ?? [])]
                    .sort((a: any, b: any) => b.score_matching - a.score_matching)
                    .map((m: any, i: number) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: i === 0 ? '#f6ffed' : '#fafafa',
                        borderRadius: 6, marginBottom: 8,
                        border: `1px solid ${i === 0 ? '#b7eb8f' : '#f0f0f0'}`
                    }}>
                        <div style={{ flex: 1 }}>
                            <Badge count={i + 1} style={{ background: i === 0 ? '#52c41a' : PRIMARY }} />
                            <Text strong style={{ marginLeft: 8 }}>
                                {m.job_titre || 'Offre inconnue'}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11, marginLeft: 24 }}>
                                {m.justification}
                            </Text>
                        </div>
                        <Progress
                            type="circle"
                            percent={m.score_matching}
                            size={52}
                            strokeColor={
                                m.score_matching >= 70 ? '#52c41a' :
                                m.score_matching >= 50 ? '#faad14' : '#ff4d4f'
                            }
                            format={p => `${p}%`}
                        />
                    </div>
                ))}
            </div>
        ) : (
            // Agent 2 a tourné mais données vides → afficher ce qu'on a
            <div style={{
                padding: 16,
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 8,
            }}>
                <Text strong style={{ color: '#d48806', display: 'block', marginBottom: 8 }}>
                    ⚠ Matching effectué — détails non disponibles
                </Text>
                {candidate?.matched_job_titre ? (
                    <div>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Meilleur match identifié :
                        </Text>
                        <Tag color="green" style={{ marginLeft: 8, fontSize: 13 }}>
                            {candidate.matched_job_titre}
                        </Tag>
                    </div>
                ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Relancez l'analyse IA pour voir les détails complets du matching.
                    </Text>
                )}
            </div>
        )
    ) : (
        <div style={{ textAlign: 'center', color: '#bfbfbf', padding: 20 }}>
            <ClockCircleOutlined style={{ fontSize: 24 }} />
            <p>En attente de l'Agent 1</p>
        </div>
    )}
</Card>


            {/* ══ AGENT 3 ══ */}
            <Card
                title={
                    <span>
                        <Avatar icon={<RobotOutlined />} style={{ background: '#fa8c16', marginRight: 8 }} />
                        Agent 3 — Analyse & Scoring Final
                        <Tag color={agent3Done ? 'green' : 'default'} style={{ marginLeft: 8 }}>
                            {agent3Done ? '✓ Complété' : 'En attente'}
                        </Tag>
                    </span>
                }
                style={{ marginBottom: 16, borderLeft: `4px solid ${agent3Done ? '#52c41a' : '#d9d9d9'}` }}
            >
                {agent3Done ? (
                    <Row gutter={[16, 12]}>
                        <Col span={8} style={{ textAlign: 'center' }}>
                            <Progress
                                type="circle"
                                percent={candidate.ai_score ?? 0}
                                strokeColor={
                                    (candidate.ai_score ?? 0) >= 70 ? '#52c41a' :
                                    (candidate.ai_score ?? 0) >= 50 ? '#faad14' : '#ff4d4f'
                                }
                            />
                            <div style={{ marginTop: 8 }}>
                                <Tag color={
                                    candidate.ai_decision?.toLowerCase().includes('recommandé')
                                        ? 'green' : 'red'
                                }>
                                    {candidate.ai_decision ?? 'Non évalué'}
                                </Tag>
                            </div>
                            {candidate.ai_resume && (
                                <div style={{ marginTop: 12, fontSize: 12, color: '#595959', textAlign: 'left' }}>
                                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                                        SYNTHÈSE :
                                    </Text>
                                    {candidate.ai_resume}
                                </div>
                            )}
                        </Col>
                        <Col span={16}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
                                SCORES PAR CRITÈRE :
                            </Text>
                            {Object.entries(candidate.ai_scores_details ?? {}).map(([key, val]: any) => (
                                <div key={key} style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                        <Text>{key.replace(/_/g, ' ')}</Text>
                                        <Text strong>{val.score}/{val.max}</Text>
                                    </div>
                                    <Progress
                                        percent={Math.round((val.score / val.max) * 100)}
                                        showInfo={false}
                                        size="small"
                                        strokeColor={PRIMARY}
                                    />
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {val.justification}
                                    </Text>
                                </div>
                            ))}
                        </Col>
                    </Row>
                ) : (
                    <div style={{ textAlign: 'center', color: '#bfbfbf', padding: 20 }}>
                        <ClockCircleOutlined style={{ fontSize: 24 }} />
                        <p>En attente de l'Agent 2</p>
                    </div>
                )}
            </Card>
        </div>
    );
}