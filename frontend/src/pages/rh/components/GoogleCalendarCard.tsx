
import React from 'react';
import { Switch, Spin, Tag } from 'antd';
import {
    CalendarOutlined, CheckCircleOutlined, DisconnectOutlined,
    SyncOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useGoogleCalendar } from '../../../hooks/useGoogleCalendar';
import { PRIMARY } from '../../../theme/colors';

interface GoogleCalendarCardProps {
    // Props optionnelles pour contrôler le sync depuis les settings
    calendarSyncEnabled: boolean;
    onConnected?:        () => void;  // ← ajouter
    onToggleSync:        (enabled: boolean) => void;
}

export const GoogleCalendarCard: React.FC<GoogleCalendarCardProps> = ({
    calendarSyncEnabled,
    onConnected,
    onToggleSync,
}) => {
    const {
        status,
        loadingStatus,
        connecting,
        disconnecting,
        connect,
        disconnect,
    } = useGoogleCalendar();

    if (loadingStatus) {
        return (
            <div style={{
                background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
                padding: '24px', textAlign: 'center',
            }}>
                <Spin size="small" />
            </div>
        );
    }

    const isConnected = status?.connected && !status?.expired;

    return (
        <div style={{
            background:   '#fff',
            borderRadius: 14,
            border:       '1px solid #f0f0f0',
            overflow:     'hidden',
            marginBottom: 16,
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 22px', borderBottom: '1px solid #f8f8f8',
                background: 'linear-gradient(135deg, #3b82f606 0%, transparent 100%)',
            }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: '#3b82f612',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#3b82f6', fontSize: 16,
                }}>
                    <CalendarOutlined />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
                        Google Calendar
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>
                        Synchronisez les entretiens avec votre agenda Google
                    </div>
                </div>
                {/* Badge statut */}
                {isConnected ? (
                    <Tag
                        icon={<CheckCircleOutlined />}
                        color="success"
                        style={{ borderRadius: 20, fontSize: 11, padding: '2px 10px' }}
                    >
                        Connecté
                    </Tag>
                ) : status?.expired ? (
                    <Tag
                        icon={<ExclamationCircleOutlined />}
                        color="warning"
                        style={{ borderRadius: 20, fontSize: 11, padding: '2px 10px' }}
                    >
                        Token expiré
                    </Tag>
                ) : (
                    <Tag
                        color="default"
                        style={{ borderRadius: 20, fontSize: 11, padding: '2px 10px' }}
                    >
                        Non connecté
                    </Tag>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: '18px 22px' }}>

                {/* Row : sync activé/désactivé */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #f5f5f5',
                }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                            Synchronisation automatique
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                            Chaque entretien planifié est ajouté à votre calendrier
                        </div>
                    </div>
                    <Switch
    checked={calendarSyncEnabled}
    disabled={!isConnected}
    onChange={v => {
        onToggleSync(v);
    }}
    style={{ 
        background: calendarSyncEnabled ? PRIMARY : '#e5e7eb',
        opacity: !isConnected ? 0.5 : 1,
    }}
/>
                </div>

                {/* Bouton connexion / déconnexion */}
                {!isConnected ? (
                    <div>
                        {/* Explication */}
                        <div style={{
                            fontSize: 12, color: '#6b7280',
                            marginBottom: 14, lineHeight: 1.6,
                        }}>
                            Connectez votre compte Google pour que les entretiens planifiés
                            apparaissent automatiquement dans votre agenda, avec rappels email et popup.
                        </div>

                        {/* Fonctionnalités */}
                        <div style={{
                            display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16,
                        }}>
                            {[
                                '📅 Ajout automatique',
                                '🔔 Rappel 1h avant',
                                '👤 Invitation candidat',
                                '🗑️ Suppression synchronisée',
                            ].map(f => (
                                <span key={f} style={{
                                    fontSize: 11, color: '#6b7280',
                                    background: '#f3f4f6', padding: '3px 10px',
                                    borderRadius: 20,
                                }}>
                                    {f}
                                </span>
                            ))}
                        </div>

                        <button
                            onClick={connect}
                            disabled={connecting}
                            style={{
                                display:        'flex',
                                alignItems:     'center',
                                justifyContent: 'center',
                                gap:            10,
                                width:          '100%',
                                padding:        '11px 20px',
                                borderRadius:   10,
                                border:         '1.5px solid #e5e7eb',
                                background:     '#fff',
                                cursor:         connecting ? 'not-allowed' : 'pointer',
                                fontSize:       14,
                                fontWeight:     600,
                                color:          '#374151',
                                transition:     'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                if (!connecting) {
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#4285f4';
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(66,133,244,0.15)';
                                }
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                            }}
                        >
                            {connecting ? (
                                <SyncOutlined spin style={{ color: '#4285f4' }} />
                            ) : (
                                /* SVG Google officiel */
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            {connecting ? 'Connexion en cours...' : 'Se connecter avec Google'}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                            <CheckCircleOutlined style={{ color: '#10b981', marginRight: 6 }} />
                            Les entretiens sont synchronisés avec votre agenda Google
                        </div>
                        <button
                            onClick={disconnect}
                            disabled={disconnecting}
                            style={{
                                padding: '6px 14px', borderRadius: 8,
                                border: '1px solid #fecaca', background: '#fff',
                                color: '#ef4444', cursor: 'pointer', fontSize: 12,
                                fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            <DisconnectOutlined />
                            {disconnecting ? 'Déconnexion...' : 'Déconnecter'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};