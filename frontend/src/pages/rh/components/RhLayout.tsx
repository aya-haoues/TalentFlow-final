import React, { useMemo } from 'react';
import Sidebar from './Sidebar';
import { Layout, Avatar, Dropdown, Space, message, Badge } from 'antd';
import {
    UserOutlined, LogoutOutlined,
    SettingOutlined, BellOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PRIMARY } from '../../../theme/colors'; // ✅ couleur centralisée

const { Content, Header } = Layout;

interface RhLayoutProps {
    children: React.ReactNode;
}

const RhLayout: React.FC<RhLayoutProps> = ({ children }) => {
    const navigate = useNavigate();

    // ✅ Récupération des infos utilisateur depuis le stockage local
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {}; // protection si le JSON est corrompu
        }
    }, []);

    const userName = user?.name || 'RH';
    const userRole = user?.role || 'Recrutement';

    // ✅ Récupération de l'URL de l'avatar
    // Si l'URL stockée est relative (ex: "avatars/abc.jpg"), on s'assure qu'elle pointe vers le stockage
    const userAvatar = user?.avatar || null;


    // ✅ Déconnexion sécurisée
    const handleLogout = () => {
        localStorage.clear();
        message.success('Déconnexion réussie');
        navigate('/login', { replace: true }); // empêche le retour arrière
    };

    // ✅ Menu mémorisé pour éviter les re-renders inutiles
    const menuItems = useMemo(() => [
        {
            key: 'profile',
            label: 'Mon Profil',
            icon: <UserOutlined />,
            onClick: () => navigate('/rh/profile'), 
        },
        {
            key: 'settings',
            label: 'Paramètres',
            icon: <SettingOutlined />,
            onClick: () => navigate('/rh/settings'),
        },
        { type: 'divider' as const },
        {
            key: 'logout',
            label: 'Déconnexion',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ], []); // [] : créé une seule fois

    return (
        <Layout style={{ minHeight: '100vh' }}>

            {/* Sidebar fixe à gauche */}
            <Sidebar />

            <Layout style={{ background: '#F8FAFC' }}>

                {/* ── HEADER ── */}
                <Header style={{
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    height: 64,
                    position: 'sticky',
                    top: 0,
                    zIndex: 99,
                }}>
                    <Space size="large">

                        {/* Cloche de notifications */}
                        <Badge dot color={PRIMARY}>
                            <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#64748B' }} />
                        </Badge>

                        {/* Séparateur */}
                        <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

                        {/* Menu profil dynamique */}
                        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
                            <div style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '4px 8px',
                                borderRadius: 8,
                                transition: 'background 0.2s',
                            }} className="header-user-dropdown">
                                <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
                                    {/* ✅ Nom dynamique */}
                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1E293B' }}>
                                        {userName}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748B' }}>
                                        {userRole}
                                    </div>
                                </div>
                                {/* ✅ size corrigé : "default" au lieu de "medium" */}
                                <Avatar
                                    size={36}
                                    src={userAvatar} // Si userAvatar est "http://localhost:8000/storage/avatars/xxx.jpg"
                                    style={{ 
                                        backgroundColor: PRIMARY, 
                                        border: `1px solid ${PRIMARY}40` 
                                    }}
                                    icon={!userAvatar && <UserOutlined />}
                                />
                            </div>
                        </Dropdown>
                    </Space>
                </Header>

                {/* ── ZONE DE CONTENU ── */}
                <Content style={{
                    height: 'calc(100vh - 64px)',
                    overflowY: 'auto',
                    padding: 0,
                }}>
                    {children}
                </Content>
            </Layout>

            <style>{`
                .header-user-dropdown:hover { background: #f1f5f9; }
            `}</style>
        </Layout>
    );
};

export default RhLayout;