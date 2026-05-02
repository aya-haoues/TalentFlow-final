// src/pages/rh/RhProfile.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Avatar, message, Spin, Tabs } from 'antd';
import {
    UserOutlined, PhoneOutlined, LinkedinOutlined,
    LockOutlined, CameraOutlined, MailOutlined,
    BankOutlined, IdcardOutlined, EditOutlined,
    CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import RhLayout from './components/RhLayout';
import api from '../../services/api';
import { PRIMARY } from '../../theme/colors';

interface RhProfileData {
    id: string;
    name: string;
    email: string;
    telephone?: string;
    poste?: string;
    departement?: string;
    avatar?: string;
    linkedin_url?: string;
    role: string;
    created_at: string;
    social_provider?: string;
}

export default function RhProfile() {
    const [profile, setProfile]               = useState<RhProfileData | null>(null);
    const [loading, setLoading]               = useState(true);
    const [saving, setSaving]                 = useState(false);
    const [savingPwd, setSavingPwd]           = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [editMode, setEditMode]             = useState(false);

    const [form]    = Form.useForm();
    const [pwdForm] = Form.useForm();
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/rh/profile');
                setProfile(res.data.data);
                form.setFieldsValue(res.data.data);
            } catch {
                message.error('Impossible de charger le profil');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [form]);

    const handleSave = async (values: Partial<RhProfileData>) => {
        setSaving(true);
        try {
            const res = await api.put('/rh/profile', values);
            const updated = res.data.data;
            setProfile(prev => prev ? { ...prev, ...updated } : prev);

            // Sync localStorage → Header
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updated }));
            window.dispatchEvent(new Event('storage'));

            message.success('Profil mis à jour !');
            setEditMode(false);
        } catch (e: any) {
            message.error(e?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // --- OPTIONNEL : Prévisualisation immédiate ---
    const localUrl = URL.createObjectURL(file);
    setProfile(prev => prev ? { ...prev, avatar: localUrl } : prev);
    // ----------------------------------------------

    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);

    try {
        const res = await api.post('/rh/profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const finalUrl = res.data.avatar_url;
        // Mise à jour finale avec l'URL du serveur
        setProfile(prev => prev ? { ...prev, avatar: finalUrl } : prev);
        
        // Sync localStorage...
        message.success('Photo mise à jour !');
    } catch {
        message.error("Erreur lors de l'upload");
        // Recharger le profil original en cas d'échec
    } finally {
        setUploadingAvatar(false);
    }
};

const getAvatarUrl = (avatar: string | null | undefined): string | undefined => {
    if (!avatar) return undefined;
    
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (avatar.startsWith('http')) return avatar;
    
    // Sinon, construire l'URL relative
    return `${import.meta.env.VITE_API_URL || ''}/storage/${avatar}`;
};

    const handlePasswordChange = async (values: any) => {
        setSavingPwd(true);
        try {
            await api.put('/rh/profile/password', values);
            message.success('Mot de passe modifié avec succès !');
            pwdForm.resetFields();
        } catch (e: any) {
            const errors = e?.response?.data?.errors;
            if (errors?.current_password) {
                pwdForm.setFields([{ name: 'current_password', errors: errors.current_password }]);
            } else {
                message.error(e?.response?.data?.message ?? 'Erreur lors du changement');
            }
        } finally {
            setSavingPwd(false);
        }
    };

    
    if (loading) return (
        <RhLayout>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" />
            </div>
        </RhLayout>
    );

    if (!profile) return null;

    const initials = profile.name
        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'RH';

    // ── Onglet Informations ─────────────────────────────────────────────────
    const InfoTab = (
        <div>
            <div style={{
                background: `linear-gradient(135deg, ${PRIMARY}22, ${PRIMARY}08)`,
                borderRadius: 16,
                padding: '32px 36px',
                marginBottom: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                border: `1px solid ${PRIMARY}20`,
            }}>
                {/* ── Avatar avec bouton caméra ── */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Spin spinning={uploadingAvatar}>
                       <Avatar
    size={96}
    src={getAvatarUrl(profile?.avatar)}
    style={{
        background: profile?.avatar 
            ? 'transparent' 
            : `linear-gradient(135deg, ${PRIMARY}, #005f57)`,
        fontSize: 36,
        fontWeight: 700,
        cursor: 'pointer',
        border: `3px solid ${PRIMARY}40`,
    }}
    onClick={() => fileInput.current?.click()}
>
    {!profile?.avatar && initials}
</Avatar>

                    </Spin>
                    <div
                        onClick={() => fileInput.current?.click()}
                        style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: 28, height: 28,
                            background: PRIMARY, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', border: '2px solid #fff',
                            color: '#fff', fontSize: 12,
                        }}
                    >
                        <CameraOutlined />
                    </div>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                    />
                </div>

                {/* ── Infos résumé ── */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#262626', marginBottom: 4 }}>
                        {profile.name}
                    </div>
                    <div style={{ fontSize: 14, color: PRIMARY, fontWeight: 600, marginBottom: 4 }}>
                        {profile.poste || 'Responsable RH'}
                        {profile.departement && (
                            <span style={{ color: '#8c8c8c', fontWeight: 400 }}>
                                {' · '}{profile.departement}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                        <MailOutlined style={{ marginRight: 6 }} />
                        {profile.email}
                        {profile.social_provider && (
                            <span style={{
                                marginLeft: 10, fontSize: 11,
                                background: '#f0f0f0', padding: '2px 8px',
                                borderRadius: 12, color: '#595959',
                            }}>
                                via {profile.social_provider}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>
                        Membre depuis le {profile.created_at}
                    </div>
                </div>

                {!editMode ? (
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => setEditMode(true)}
                        style={{ borderColor: PRIMARY, color: PRIMARY }}
                    >
                        Modifier
                    </Button>
                ) : (
                    <Button
                        icon={<CloseOutlined />}
                        onClick={() => { setEditMode(false); form.setFieldsValue(profile); }}
                        danger
                    >
                        Annuler
                    </Button>
                )}
            </div>

            {/* ── Formulaire ── */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                disabled={!editMode}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                    <Form.Item
                        label="Nom complet"
                        name="name"
                        rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                        style={{ gridColumn: 'span 2' }}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Votre nom et prénom" />
                    </Form.Item>

                    <Form.Item label="Email" name="email">
                        <Input prefix={<MailOutlined />} disabled />
                    </Form.Item>
                    <Form.Item label="Téléphone" name="telephone">
                        <Input prefix={<PhoneOutlined />} placeholder="+216 XX XXX XXX" />
                    </Form.Item>
                    <Form.Item label="Poste" name="poste">
                        <Input prefix={<IdcardOutlined />} placeholder="Ex : Responsable RH" />
                    </Form.Item>
                    <Form.Item label="Département" name="departement">
                        <Input prefix={<BankOutlined />} placeholder="Ex : Ressources Humaines" />
                    </Form.Item>
                    <Form.Item label="LinkedIn" name="linkedin_url" style={{ gridColumn: 'span 2' }}>
                        <Input prefix={<LinkedinOutlined />} placeholder="https://linkedin.com/in/..." />
                    </Form.Item>
                </div>

                {editMode && (
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                            icon={<CheckOutlined />}
                            style={{ background: PRIMARY, borderColor: PRIMARY }}
                        >
                            Enregistrer les modifications
                        </Button>
                    </Form.Item>
                )}
            </Form>
        </div>
    );

    // ── Onglet Sécurité ─────────────────────────────────────────────────────
    const SecurityTab = (
        <div style={{ maxWidth: 480 }}>
            <div style={{
                background: '#fffbe6', border: '1px solid #ffe58f',
                borderRadius: 10, padding: '12px 16px',
                marginBottom: 24, fontSize: 13, color: '#614700',
            }}>
                <LockOutlined style={{ marginRight: 8 }} />
                Le mot de passe doit être complexe (8 car. min, majuscule, chiffre).
            </div>

            <Form form={pwdForm} layout="vertical" onFinish={handlePasswordChange}>
                <Form.Item
                    label="Mot de passe actuel"
                    name="current_password"
                    rules={[{ required: true, message: 'Requis' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe actuel" />
                </Form.Item>
                <Form.Item
                    label="Nouveau mot de passe"
                    name="password"
                    rules={[
                        { required: true, message: 'Requis' },
                        { min: 8, message: 'Minimum 8 caractères' },
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nouveau mot de passe" />
                </Form.Item>
                <Form.Item
                    label="Confirmer le mot de passe"
                    name="password_confirmation"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Requis' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) return Promise.resolve();
                                return Promise.reject('Les mots de passe ne correspondent pas');
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Confirmer" />
                </Form.Item>

                {profile.social_provider && (
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 16 }}>
                        Note : Compte <strong>{profile.social_provider}</strong>.
                        Modifier le mot de passe permet une connexion email directe.
                    </div>
                )}

                <Button
                    type="primary"
                    htmlType="submit"
                    loading={savingPwd}
                    icon={<LockOutlined />}
                    style={{ background: PRIMARY, borderColor: PRIMARY }}
                >
                    Changer le mot de passe
                </Button>
            </Form>
        </div>
    );

    return (
        <RhLayout>
            <div style={{ padding: '32px 40px', maxWidth: 860, margin: '0 auto' }}>
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#262626' }}>Mon profil</div>
                    <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>
                        Gérez vos informations personnelles et la sécurité de votre compte
                    </div>
                </div>

                <Tabs
                    defaultActiveKey="1"
                    items={[
                        { key: '1', label: 'Informations', children: InfoTab },
                        { key: '2', label: 'Sécurité',     children: SecurityTab },
                    ]}
                />
            </div>
        </RhLayout>
    );
}
