// src/pages/About.tsx
import { Link } from 'react-router-dom';
import {
    Typography, Row, Col, Card, Statistic,
    Timeline, Divider, Button
} from 'antd';
import {
    RocketOutlined, TeamOutlined, SafetyOutlined,
    BulbOutlined, HeartOutlined, TrophyOutlined,
    CheckCircleOutlined, ArrowRightOutlined,
    UserOutlined, SearchOutlined, FileTextOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const PRIMARY = '#00a89c';

// URL d'images significatives (fictives pour l'instant, à remplacer par tes visuels finaux)
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&auto=format&fit=crop';
const MISSION_IMAGE_URL = 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop'; // Image d'équipe/stratégie

/* ── Données ─────────────────────────────────────────── */
const STATS = [
    { value: 500,  suffix: '+', label: 'Candidats inscrits',    icon: <UserOutlined />    },
    { value: 120,  suffix: '+', label: 'Offres publiées',        icon: <FileTextOutlined /> },
    { value: 85,   suffix: '%', label: 'Taux de satisfaction',   icon: <HeartOutlined />   },
    { value: 40,   suffix: '+', label: 'Entreprises partenaires',icon: <TeamOutlined />    },
];

const STEPS = [
    {
        icon: <UserOutlined style={{ fontSize: 32, color: PRIMARY }} />,
        title: 'Créez votre profil',
        desc: 'Inscrivez-vous en quelques minutes, complétez votre profil et uploadez votre CV. Notre système analyse automatiquement vos compétences.',
    },
    {
        icon: <SearchOutlined style={{ fontSize: 32, color: PRIMARY }} />,
        title: 'Explorez les offres',
        desc: 'Parcourez des centaines d\'offres filtrées selon votre profil, votre niveau d\'expérience et vos préférences de localisation.',
    },
    {
        icon: <FileTextOutlined style={{ fontSize: 32, color: PRIMARY }} />,
        title: 'Postulez en un clic',
        desc: 'Envoyez votre candidature directement depuis la plateforme. Suivez son évolution en temps réel depuis votre tableau de bord.',
    },
];

const VALUES = [
    { icon: <RocketOutlined />,  title: 'Innovation',    desc: 'Nous utilisons les dernières technologies pour simplifier le recrutement.' },
    { icon: <SafetyOutlined />,  title: 'Transparence',  desc: 'Chaque étape du processus est visible et traçable pour candidats et recruteurs.' },
    { icon: <HeartOutlined />,   title: 'Bienveillance', desc: 'Nous mettons l\'humain au centre de chaque interaction sur la plateforme.' },
    { icon: <BulbOutlined />,    title: 'Excellence',    desc: 'Nous visons la meilleure expérience possible pour tous nos utilisateurs.' },
    { icon: <TeamOutlined />,    title: 'Collaboration', desc: 'Nous croyons en la force du travail d\'équipe entre candidats et entreprises.' },
    { icon: <TrophyOutlined />,  title: 'Réussite',      desc: 'Chaque recrutement réussi est une victoire partagée que nous célébrons.' },
];

const TEAM = [
    { name: 'Aya Haoues',        role: 'CEO & Co-fondatrice',     avatar: '👩‍💼', bio: 'Experte en recrutement avec 10 ans d\'expérience dans les RH.' },
    { name: 'Mohamed Ben Salem',  role: 'CTO',                     avatar: '👨‍💻', bio: 'Ingénieur full-stack passionné par l\'IA et l\'automatisation RH.' },
    { name: 'Salma Trabelsi',     role: 'Directrice des Opérations',avatar: '👩‍🔬', bio: 'Spécialiste en optimisation des processus de recrutement.' },
];

const TIMELINE_ITEMS = [
    { label: '2022', children: 'Création de TalentFlow avec une vision claire : simplifier le recrutement en Tunisie.' },
    { label: '2023', children: 'Lancement de la plateforme beta avec 50 entreprises partenaires et 1000 candidats.' },
    { label: '2024', children: 'Intégration de l\'IA pour le matching automatique candidat/offre. 5000 recrutements réussis.' },
    { label: '2025', children: 'Expansion régionale avec des partenaires au Maroc et en Algérie. Levée de fonds réussie.' },
    { label: '2026', children: 'TalentFlow aujourd\'hui : la référence du recrutement digital en Afrique du Nord.' },
];

/* ── Composant ───────────────────────────────────────── */
export default function About() {
    return (
        <div style={{ background: '#fff' }}>

{/* Bloc Style injecté directement */}
            <style>{`
                .team-card {
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    border-radius: 16px !important;
                    transition: all 0.3s ease;
                }

                .team-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 168, 156, 0.9);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    opacity: 0;
                    transition: opacity 0.4s ease, transform 0.4s ease;
                    transform: translateY(20px);
                    z-index: 2;
                }

                .team-card:hover .team-overlay {
                    opacity: 1;
                    transform: translateY(0);
                }

                .team-image-container {
                    padding: 40px 0;
                    transition: filter 0.3s ease;
                }

                .team-card:hover .team-image-container {
                    filter: blur(2px);
                }
            `}</style>


            {/* ── HERO AVEC IMAGE DE FOND ET TEXTE BLANC ─────────────────── */}
            <section style={{
                position: 'relative',
                backgroundImage: `url(${HERO_IMAGE_URL})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                padding: '120px 24px', // padding augmenté
                textAlign: 'center',
            }}>
                {/* Overlay sombre pour garantir le contraste du texte blanc */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.6)', // Ajuster l'opacité selon l'image
                    zIndex: 1
                }} />

                <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    {/* CORRECTION : Titre principal supprimé, sous-titre agrandi et en gras */}
                    <Title level={1} style={{ 
                        color: '#fff', 
                        fontSize: 52, // Taille augmentée
                        fontWeight: 700, 
                        margin: '0 0 24px',
                        lineHeight: 1.2
                    }}>
                        La plateforme qui connecte les talents aux opportunités
                    </Title>
                    
                    <Paragraph style={{ 
                        fontSize: 22, // Taille augmentée
                        color: 'rgba(255,255,255,0.9)', 
                        lineHeight: 1.6, 
                        maxWidth: 700, 
                        margin: '0 auto' 
                    }}>
                        TalentFlow est née d'une conviction simple : le recrutement doit être
                        humain, transparent et efficace. Nous mettons la technologie au service
                        des personnes pour créer des connexions qui durent.
                    </Paragraph>
                </div>
            </section>

            {/* ── STATS ──────────────────────────────── */}
            <section style={{ padding: '60px 24px', background: PRIMARY }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <Row gutter={[32, 32]} justify="center">
                        {STATS.map((s, i) => (
                            <Col xs={12} sm={6} key={i}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 36, color: '#fff', marginBottom: 8 }}>
                                        {s.icon}
                                    </div>
                                    <Statistic
                                        value={s.value}
                                        suffix={s.suffix}
                                        valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
                                    />
                                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>
                                        {s.label}
                                    </Text>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* ── MISSION AVEC NOUVELLE IMAGE SIGNIFICATIVE ─────────── */}
            <section style={{ padding: '100px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <Row gutter={[64, 48]} align="middle">
                        <Col xs={24} md={12}>
                            <Title level={2} style={{ color: PRIMARY }}>
                                Notre Mission
                            </Title>
                            <Paragraph style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.9 }}>
                                Chez TalentFlow, nous croyons que chaque personne mérite une
                                opportunité à la hauteur de son potentiel. Notre mission est de
                                <Text strong> démocratiser l'accès à l'emploi </Text>
                                en créant une plateforme intuitive, équitable et performante.
                            </Paragraph>
                            <Paragraph style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.9, marginBottom: 24 }}>
                                Nous connectons des candidats motivés avec des entreprises qui
                                cherchent non seulement des compétences, mais aussi des
                                <Text strong> personnalités qui correspondent à leur culture.</Text>
                            </Paragraph>
                            {[  'Processus 100% digital et transparent',
                                'Matching intelligent par compétences',
                                'Suivi en temps réel des candidatures',
                                'Support dédié pour candidats et recruteurs',
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <CheckCircleOutlined style={{ color: PRIMARY, fontSize: 18 }} />
                                    <Text style={{ fontSize: 15 }}>{item}</Text>
                                </div>
                            ))}
                        </Col>
                        {/* CORRECTION : Remplacement de l'émoji par une image significative */}
                        <Col xs={24} md={12}>
                            <div style={{
                                position: 'relative',
                                background:   `linear-gradient(135deg, ${PRIMARY}15, ${PRIMARY}05)`,
                                borderRadius: 24,
                                padding:      12, // Cadre léger
                                boxShadow:    '0 12px 30px rgba(0,0,0,0.08)',
                            }}>
                                <img 
                                    src={MISSION_IMAGE_URL} 
                                    alt="Collaboration d'équipe TalentFlow" 
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: 20,
                                        display: 'block'
                                    }}
                                />
                                
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

            <Divider style={{ margin: 0 }} />

            {/* ── COMMENT ÇA MARCHE ──────────────────── */}
            <section style={{ padding: '80px 24px', background: '#F9FAFB' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
                    <Title level={2} style={{ color: PRIMARY, marginBottom: 8 }}>
                        Comment ça marche ?
                    </Title>
                    <Paragraph style={{ fontSize: 16, color: '#6B7280', marginBottom: 48 }}>
                        Trouver votre prochain emploi n'a jamais été aussi simple
                    </Paragraph>
                    <Row gutter={[32, 32]}>
                        {STEPS.map((step, i) => (
                            <Col xs={24} md={8} key={i}>
                                <Card
                                    style={{
                                        borderRadius:  16,
                                        border:        `1px solid ${PRIMARY}20`,
                                        height:        '100%',
                                        textAlign:     'center',
                                        boxShadow:     '0 4px 20px rgba(0,0,0,0.06)',
                                    }}
                                    bodyStyle={{ padding: 32 }}
                                >
                                    <div style={{
                                        width:           64,
                                        height:          64,
                                        borderRadius:    '50%',
                                        background:      `${PRIMARY}15`,
                                        display:         'flex',
                                        alignItems:      'center',
                                        justifyContent:  'center',
                                        margin:          '0 auto 16px',
                                    }}>
                                        {step.icon}
                                    </div>
                                    <div style={{
                                        width:           28,
                                        height:          28,
                                        borderRadius:    '50%',
                                        background:      PRIMARY,
                                        color:           '#fff',
                                        fontWeight:      700,
                                        fontSize:        14,
                                        display:         'flex',
                                        alignItems:      'center',
                                        justifyContent:  'center',
                                        margin:          '0 auto 12px',
                                    }}>
                                        {i + 1}
                                    </div>
                                    <Title level={4} style={{ color: PRIMARY }}>{step.title}</Title>
                                    <Paragraph style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7 }}>
                                        {step.desc}
                                    </Paragraph>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* ── TIMELINE ───────────────────────────── */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <Title level={2} style={{ color: PRIMARY, textAlign: 'center', marginBottom: 48 }}>
                         Notre histoire
                    </Title>
                    <Timeline
                        mode="alternate"
                        items={TIMELINE_ITEMS.map(item => ({
                            label:    <Text strong style={{ color: PRIMARY }}>{item.label}</Text>,
                            children: item.children,
                            color:    PRIMARY,
                        }))}
                    />
                </div>
            </section>

            {/* ── VALEURS ────────────────────────────── */}
            <section style={{ padding: '80px 24px', background: '#F9FAFB' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
                    <Title level={2} style={{ color: PRIMARY, marginBottom: 8 }}>
                        Nos Valeurs
                    </Title>
                    <Paragraph style={{ fontSize: 16, color: '#6B7280', marginBottom: 48 }}>
                        Les principes qui guident chacune de nos décisions
                    </Paragraph>
                    <Row gutter={[24, 24]}>
                        {VALUES.map((v, i) => (
                            <Col xs={24} sm={12} md={8} key={i}>
                                <Card
                                    style={{
                                        borderRadius:  12,
                                        border:        'none',
                                        boxShadow:     '0 2px 12px rgba(0,0,0,0.06)',
                                        textAlign:     'left',
                                    }}
                                    bodyStyle={{ padding: 24 }}
                                >
                                    <div style={{
                                        fontSize:  28,
                                        color:     PRIMARY,
                                        marginBottom: 12,
                                    }}>
                                        {v.icon}
                                    </div>
                                    <Title level={5} style={{ margin: '0 0 8px', color: '#1F2937' }}>
                                        {v.title}
                                    </Title>
                                    <Text style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
                                        {v.desc}
                                    </Text>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* ── ÉQUIPE ANIMÉE ─────────────────────────────── */}
<section style={{ padding: '80px 24px' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <Title level={2} style={{ color: PRIMARY, marginBottom: 8 }}>
            Notre Équipe
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#6B7280', marginBottom: 48 }}>
            Des passionnés au service de votre carrière
        </Paragraph>
        
        <Row gutter={[32, 32]} justify="center">
            {TEAM.map((member, i) => (
                <Col xs={24} sm={8} key={i}>
                    <Card
                        className="team-card" // Utilisation de la classe CSS
                        bodyStyle={{ padding: 0, height: 350, position: 'relative' }}
                        bordered={false}
                    >
                        {/* Façade de la carte (Image + Nom) */}
                        <div className="team-image-container" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 80, marginBottom: 16 }}>
                                {member.avatar}
                            </div>
                            <Title level={4} style={{ margin: '0 0 4px' }}>
                                {member.name}
                            </Title>
                            <Text style={{ color: PRIMARY, fontWeight: 600 }}>
                                {member.role}
                            </Text>
                        </div>

                        {/* Overlay au survol (Bio) */}
                        <div className="team-overlay">
                            <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                                {member.name}
                            </Title>
                            <Text style={{ color: '#e6fffb', fontWeight: 600, marginBottom: 16 }}>
                                {member.role}
                            </Text>
                            <Paragraph style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>
                                {member.bio}
                            </Paragraph>
                            <div style={{ marginTop: 10 }}>
                                <TeamOutlined style={{ color: '#fff', fontSize: 24 }} />
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    </div>
</section>

            {/* ── CTA FINAL ──────────────────────────── */}
            <section style={{
                padding:    '80px 24px',
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #007a70 100%)`,
                textAlign:  'center',
            }}>
                <Title level={2} style={{ color: '#fff', margin: '0 0 16px' }}>
                    Prêt à démarrer votre aventure ?
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 32 }}>
                    Rejoignez des milliers de candidats qui ont trouvé leur emploi via TalentFlow
                </Paragraph>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/register">
                        <Button size="large" style={{
                            background:    '#fff',
                            color:         PRIMARY,
                            border:        'none',
                            borderRadius:  8,
                            fontWeight:    600,
                            height:        48,
                            paddingInline: 32,
                        }}>
                            Créer un compte <ArrowRightOutlined />
                        </Button>
                    </Link>
                    <Link to="/jobs">
                        <Button size="large" ghost style={{
                            borderColor:   '#fff',
                            color:         '#fff',
                            borderRadius:  8,
                            fontWeight:    600,
                            height:        48,
                            paddingInline: 32,
                        }}>
                            Voir les offres
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
}