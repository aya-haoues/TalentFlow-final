import React, { useEffect, useState, useCallback } from 'react';
import {
    Row, Col, Card, Tag, Progress, Table, Select,
    Spin, Empty, Typography, Avatar, Badge
} from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Line, Area, AreaChart
} from 'recharts';
import {
    RobotOutlined, TrophyOutlined,
    CloseCircleOutlined, HourglassOutlined, CheckCircleOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import RhLayout from './components/RhLayout';

const { Title, Text } = Typography;
const { Option } = Select;

// ── Couleurs ──────────────────────────────────────────────────────────────
const PRIMARY     = '#00796b';
const COLORS_PIE  = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f', '#722ed1', '#fa8c16'];
const COLORS_BAR  = { recommandes: '#52c41a', refuses: '#ff4d4f', candidats: '#1890ff' };

// ── Hook de fetch générique ───────────────────────────────────────────────
function useAnalytics<T>(endpoint: string, params?: Record<string, any>) {
    const [data, setData]       = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const { data: res } = await api.get(endpoint, { params });
            console.log(`Données reçues pour ${endpoint}:`, res); // <--- AJOUTEZ CECI
            setData(res);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [endpoint, JSON.stringify(params)]);

    useEffect(() => { fetch(); }, [fetch]);
    return { data, loading, error, refetch: fetch };
}

// ── Composant KPI Card ────────────────────────────────────────────────────
function KpiCard({ titre, valeur, icon, couleur, suffix = '' }: any) {
    return (
        <Card
            style={{
                borderRadius: 12,
                borderTop: `3px solid ${couleur}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                height: '100%',          // ← toutes les cards à la même hauteur
            }}
            bodyStyle={{ padding: '16px 20px', height: '100%', boxSizing: 'border-box' }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',    // ← centré verticalement
                height: '100%',
            }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <Text
                        type="secondary"
                        style={{
                            fontSize: 11,
                            display: 'block',
                            marginBottom: 6,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {titre}
                    </Text>
                    <Text
                        style={{
                            fontSize: 24,           // ← taille fixe pour tous
                            fontWeight: 700,
                            color: couleur,
                            display: 'block',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {valeur}{suffix}
                    </Text>
                </div>
                <Avatar
                    size={40}
                    icon={icon}
                    style={{
                        background: `${couleur}18`,
                        color: couleur,
                        flexShrink: 0,
                        marginLeft: 12,
                    }}
                />
            </div>
        </Card>
    );
}

// ── Tooltip personnalisé pour les graphiques ──────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#fff', border: '1px solid #f0f0f0',
            borderRadius: 8, padding: '8px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>{label}</Text>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color, fontSize: 13 }}>
                    {p.name} : <strong>{p.value}</strong>
                </div>
            ))}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════
export default function StatistiquesPage() {
    const [timelineDays, setTimelineDays] = useState(30);
    const [topLimit,     setTopLimit]     = useState(10);

    const kpis        = useAnalytics<any>('/rh/analytics/kpis');
    const distribution= useAnalytics<any[]>('/rh/analytics/score-distribution');
    const decisions   = useAnalytics<any[]>('/rh/analytics/decisions');
    const radar       = useAnalytics<any[]>('/rh/analytics/criteria-radar');
    const offreStats  = useAnalytics<any[]>('/rh/analytics/offre-stats');
    const timeline    = useAnalytics<any[]>('/rh/analytics/timeline', { days: timelineDays });
    const topCandidats= useAnalytics<any[]>('/rh/analytics/top-candidates', { limit: topLimit });

    // ── Colonnes tableau comparaison ────────────────────────────────────
    const columns = [
        {
            title: '#',
            key: 'rank',
            width: 40,
            render: (_: any, __: any, i: number) => (
                <Badge
                    count={i + 1}
                    style={{
                        background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : PRIMARY,
                        boxShadow: 'none'
                    }}
                />
            ),
        },
        {
            title: 'Candidat',
            dataIndex: 'full_name',
            render: (name: string, r: any) => (
                <div>
                    <Text strong style={{ display: 'block' }}>{name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{r.email}</Text>
                </div>
            ),
        },
        {
            title: 'Offre',
            dataIndex: 'job_titre',
            render: (t: string) => <Tag>{t}</Tag>,
        },
        {
            title: 'Score IA',
            dataIndex: 'ai_score',
            sorter: (a: any, b: any) => a.ai_score - b.ai_score,
            render: (score: number) => (
                <div style={{ minWidth: 120 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ fontSize: 13, fontWeight: 600, color: score >= 70 ? '#52c41a' : score >= 50 ? '#faad14' : '#ff4d4f' }}>
                            {score}%
                        </Text>
                    </div>
                    <Progress
                        percent={score}
                        showInfo={false}
                        size="small"
                        strokeColor={score >= 70 ? '#52c41a' : score >= 50 ? '#faad14' : '#ff4d4f'}
                        trailColor="#f0f0f0"
                    />
                </div>
            ),
        },
        {
            title: 'Compétences',
            render: (_: any, r: any) => {
                const s = r.ai_scores_details?.competences_metier;
                return s ? <Text>{s.score}/{s.max}</Text> : '—';
            },
        },
        {
            title: 'Expérience',
            render: (_: any, r: any) => {
                const s = r.ai_scores_details?.experience;
                return s ? <Text>{s.score}/{s.max}</Text> : '—';
            },
        },
        {
            title: 'Formation',
            render: (_: any, r: any) => {
                const s = r.ai_scores_details?.formation;
                return s ? <Text>{s.score}/{s.max}</Text> : '—';
            },
        },
        {
            title: 'Décision',
            dataIndex: 'ai_decision',
            render: (d: string) => (
                <Tag color={d?.toLowerCase().includes('recommandé') ? 'green' : d?.toLowerCase().includes('revoir') ? 'orange' : 'red'}>
                    {d ?? '—'}
                </Tag>
            ),
        },
        {
            title: 'Meilleur match',
            dataIndex: 'matched_job_titre',
            render: (t: string) => t ? <Tag color="blue">{t}</Tag> : '—',
        },
        {
            title: 'Analysé le',
            dataIndex: 'analyzed_at',
            render: (d: string) => <Text type="secondary" style={{ fontSize: 11 }}>{d ?? '—'}</Text>,
        },
    ];

    return (
        <RhLayout>
        <div style={{ padding: '24px', background: '#f8f9fb', minHeight: '100vh' }}>

            {/* ── En-tête ───────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <Title level={3} style={{ margin: 0, color: '#1a1a2e' }}>
                        <RobotOutlined style={{ color: PRIMARY, marginRight: 10 }} />
                        Statistiques & Analyse IA
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Vue d'ensemble des analyses IA — {dayjs().format('DD MMMM YYYY')}
                    </Text>
                </div>
            </div>

            {/* ── KPIs ──────────────────────────────────────────────── */}
            {kpis.loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : (
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="middle">
                    {[
                        { titre: 'Total analyses IA',   valeur: kpis.data?.total_analyses   ?? 0, icon: <RobotOutlined />,       couleur: PRIMARY,    suffix: ''     },
                        { titre: 'Score IA moyen',      valeur: kpis.data?.score_moyen      ?? 0, icon: <TrophyOutlined />,      couleur: '#722ed1',  suffix: '/100' },
                        { titre: "Taux d'acceptation",  valeur: kpis.data?.taux_acceptation ?? 0, icon: <RiseOutlined />,        couleur: '#52c41a',  suffix: '%'    },
                        { titre: 'Recommandés',         valeur: kpis.data?.recommandes      ?? 0, icon: <CheckCircleOutlined />, couleur: '#1890ff',  suffix: ''     },
                        { titre: 'Refusés par IA',      valeur: kpis.data?.refuses          ?? 0, icon: <CloseCircleOutlined />, couleur: '#ff4d4f',  suffix: ''     },
                        { titre: 'En attente',          valeur: kpis.data?.en_attente       ?? 0, icon: <HourglassOutlined />,   couleur: '#faad14',  suffix: ''     },
                    ].map((kpi, i) => (
                        <Col span={4} key={i} style={{ display: 'flex' }}>
                            <KpiCard {...kpi} />
                        </Col>
                    ))}
                </Row>
            )}

            {/* ── Ligne 1 : Distribution + Décisions ───────────────── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>

                {/* Distribution des scores */}
                <Col span={14}>
                    <Card
                        title={<Text strong>📊 Distribution des scores IA</Text>}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                        {distribution.loading ? <Spin /> : distribution.data?.length === 0 ? <Empty /> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={distribution.data ?? []} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="tranche" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                    <RTooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Candidats" radius={[6, 6, 0, 0]}>
                                        {(distribution.data ?? []).map((_: any, i: number) => (
                                            <Cell key={i} fill={
                                                i === 0 ? '#ff4d4f' :
                                                i === 1 ? '#fa8c16' :
                                                i === 2 ? '#faad14' :
                                                i === 3 ? '#52c41a' :
                                                          '#1890ff'
                                            } />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>

                {/* Décisions IA */}
                <Col span={10}>
                    <Card
                        title={<Text strong>🎯 Décisions IA</Text>}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                        {decisions.loading ? <Spin /> : decisions.data?.length === 0 ? <Empty /> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={decisions.data ?? []}
                                        cx="50%" cy="45%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        dataKey="value"
                                        paddingAngle={3}
                                    >
                                        {(decisions.data ?? []).map((_: any, i: number) => (
                                            <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                                        ))}
                                    </Pie>
                                    <Legend iconType="circle" iconSize={10} />
                                    <RTooltip formatter={(v: any, n: any) => [v, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* ── Ligne 2 : Radar + Performance offres ─────────────── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>

                {/* Radar critères */}
                <Col span={10}>
                    <Card
                        title={<Text strong>🕸️ Scores moyens par critère</Text>}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                        {radar.loading ? <Spin /> : radar.data?.length === 0 ? <Empty /> : (
                            <ResponsiveContainer width="100%" height={280}>
                                <RadarChart data={radar.data ?? []}>
                                    <PolarGrid stroke="#e8e8e8" />
                                    <PolarAngleAxis dataKey="critere" tick={{ fontSize: 11 }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                    <Radar
                                        name="Score moyen %"
                                        dataKey="pourcentage"
                                        stroke={PRIMARY}
                                        fill={PRIMARY}
                                        fillOpacity={0.25}
                                        strokeWidth={2}
                                    />
                                    <Legend iconType="circle" />
                                    <RTooltip formatter={(v: any) => [`${v}%`, 'Score moyen']} />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>

                {/* Performance par offre */}
                <Col span={14}>
                    <Card
                        title={<Text strong>📋 Performance par offre</Text>}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                        {offreStats.loading ? <Spin /> : offreStats.data?.length === 0 ? <Empty /> : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={offreStats.data ?? []}
                                    layout="vertical"
                                    barSize={14}
                                    margin={{ left: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="offre" tick={{ fontSize: 11 }} width={130} />
                                    <RTooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" iconSize={10} />
                                    <Bar dataKey="candidats"   name="Candidats"    fill={COLORS_BAR.candidats}   radius={[0,4,4,0]} />
                                    <Bar dataKey="recommandes" name="Recommandés"  fill={COLORS_BAR.recommandes} radius={[0,4,4,0]} />
                                    <Bar dataKey="refuses"     name="Refusés"      fill={COLORS_BAR.refuses}     radius={[0,4,4,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* ── Timeline ──────────────────────────────────────────── */}
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>📈 Évolution des scores IA</Text>
                        <Select
                            value={timelineDays}
                            onChange={setTimelineDays}
                            size="small"
                            style={{ width: 140 }}
                        >
                            <Option value={7}>7 derniers jours</Option>
                            <Option value={30}>30 derniers jours</Option>
                            <Option value={90}>3 derniers mois</Option>
                        </Select>
                    </div>
                }
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
            >
                {timeline.loading ? <Spin /> : (timeline.data ?? []).length === 0 ? <Empty description="Aucune donnée sur cette période" /> : (
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={timeline.data ?? []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor={PRIMARY} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                            <RTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                            <Area
                                type="monotone"
                                dataKey="score_moyen"
                                name="Score moyen"
                                stroke={PRIMARY}
                                strokeWidth={2.5}
                                fill="url(#colorScore)"
                                dot={{ r: 4, fill: PRIMARY, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="nb_analyses"
                                name="Nb analyses"
                                stroke="#722ed1"
                                strokeWidth={1.5}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* ── Tableau comparaison top candidats ─────────────────── */}
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>🏆 Comparaison des meilleurs candidats</Text>
                        <Select
                            value={topLimit}
                            onChange={setTopLimit}
                            size="small"
                            style={{ width: 120 }}
                        >
                            <Option value={5}>Top 5</Option>
                            <Option value={10}>Top 10</Option>
                            <Option value={20}>Top 20</Option>
                        </Select>
                    </div>
                }
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
                {topCandidats.loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                ) : (
                    <Table
                        dataSource={topCandidats.data ?? []}
                        columns={columns}
                        rowKey="_id"
                        size="small"
                        pagination={false}
                        scroll={{ x: 1200 }}
                        rowClassName={(_, i) =>
                            i === 0 ? 'row-gold' : i === 1 ? 'row-silver' : ''
                        }
                        style={{ fontSize: 13 }}
                    />
                )}
            </Card>

        </div>
        </RhLayout>
    );
}
