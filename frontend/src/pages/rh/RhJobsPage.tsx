import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button, Tag, Space, Typography, Input, theme,
  Modal, Spin, Empty, message, Row, Col, Badge, Tooltip, Select, Dropdown
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, TeamOutlined, EnvironmentOutlined,
  EllipsisOutlined, EyeOutlined, PauseOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FilterOutlined,
  BarsOutlined, AppstoreOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { useModal } from '../../hooks/useModal';
import JobForm from '../../components/jobs/JobForm';
import RhLayout from './components/RhLayout';
import type { Job, JobStatus } from '../../types';

const { Text, Title } = Typography;
const { Option } = Select;

const PRIMARY = '#00a89c';

const STATUS_CONFIG: Record<JobStatus, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  publiee:   { color: '#16a34a', bg: '#f0fdf4', label: 'Publiée',   icon: <CheckCircleOutlined /> },
  brouillon: { color: '#6b7280', bg: '#f9fafb', label: 'Brouillon', icon: <EditOutlined /> },
  pausee:    { color: '#d97706', bg: '#fffbeb', label: 'En pause',   icon: <PauseOutlined /> },
  archivee:  { color: '#dc2626', bg: '#fef2f2', label: 'Archivée',  icon: <ClockCircleOutlined /> },
};

export default function RhJobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobModal = useModal<Job>();

  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(true);
  const [searchQuery, setQuery]   = useState('');
  const [statusFilter, setStatus] = useState<string>('all');
  const [viewMode, setViewMode]   = useState<'list' | 'grid'>('list');
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rh/jobs');
      if (res.data?.success) {
        const raw = res.data.data;
        setJobs(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []);
      }
    } catch {
      message.error('Erreur de chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (searchParams.get('action') === 'create') jobModal.open();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/rh/jobs/${id}`);
      message.success('Offre supprimée');
      fetchJobs();
    } catch {
      message.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/rh/jobs/${id}`, { statut: newStatus });
      message.success('Statut mis à jour');
      fetchJobs();
    } catch {
      message.error('Erreur mise à jour statut');
    }
  };

  const filtered = jobs.filter(job => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || job.titre?.toLowerCase().includes(q) || job.department?.nom?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || job.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:     jobs.length,
    publiees:  jobs.filter(j => j.statut === 'publiee').length,
    brouillon: jobs.filter(j => j.statut === 'brouillon').length,
    pausees:   jobs.filter(j => j.statut === 'pausee').length,
  };

  const getMenuItems = (job: Job) => ({
    items: [
      { key: 'view',    label: 'Voir les candidatures', icon: <EyeOutlined /> },
      { key: 'edit',    label: 'Modifier',               icon: <EditOutlined /> },
      { type: 'divider' as const },
      job.statut === 'publiee'
        ? { key: 'pause',   label: 'Mettre en pause',  icon: <PauseOutlined /> }
        : { key: 'publish', label: 'Publier',           icon: <CheckCircleOutlined /> },
      { key: 'delete', label: 'Supprimer', icon: <DeleteOutlined />, danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'edit')    jobModal.open(job);
      if (key === 'delete')  setDeleteId(job.id);
      if (key === 'view')    navigate(`/rh/candidatures?job=${job.id}`);
      if (key === 'pause')   handleStatusChange(job.id, 'pausee');
      if (key === 'publish') handleStatusChange(job.id, 'publiee');
    },
  });

  return (
    <RhLayout>
      <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }}>

        {/* ── STATS CARDS ── */}
        <Row gutter={16} style={{ marginBottom: 28 }}>
          {[
            { label: 'Total offres',  value: stats.total,     color: PRIMARY,    bg: '#e6fffc' },
            { label: 'Publiées',      value: stats.publiees,  color: '#16a34a',  bg: '#f0fdf4' },
            { label: 'Brouillons',    value: stats.brouillon, color: '#6b7280',  bg: '#f9fafb' },
            { label: 'En pause',      value: stats.pausees,   color: '#d97706',  bg: '#fffbeb' },
          ].map(s => (
            <Col span={6} key={s.label}>
              <div style={{
                background: s.bg,
                border: `1px solid ${s.color}20`,
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${s.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Offres d'emploi</Title>

          <Space size={10}>
            <Input
              placeholder="Rechercher..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              style={{ width: 260, borderRadius: 8 }}
              onChange={e => setQuery(e.target.value)}
              allowClear
            />

            <Select
              value={statusFilter}
              onChange={setStatus}
              style={{ width: 150 }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tous les statuts</Option>
              <Option value="publiee">Publiées</Option>
              <Option value="brouillon">Brouillons</Option>
              <Option value="pausee">En pause</Option>
              <Option value="archivee">Archivées</Option>
            </Select>

            <Space.Compact>
              <Tooltip title="Vue liste">
                <Button
                  icon={<BarsOutlined />}
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                  style={{ background: viewMode === 'list' ? PRIMARY : undefined, borderColor: viewMode === 'list' ? PRIMARY : undefined }}
                />
              </Tooltip>
              <Tooltip title="Vue grille">
                <Button
                  icon={<AppstoreOutlined />}
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                  style={{ background: viewMode === 'grid' ? PRIMARY : undefined, borderColor: viewMode === 'grid' ? PRIMARY : undefined }}
                />
              </Tooltip>
            </Space.Compact>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => jobModal.open()}
              style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600, height: 36 }}
            >
              Nouvelle offre
            </Button>
          </Space>
        </div>

        {/* ── RÉSULTATS ── */}
        <Text type="secondary" style={{ fontSize: 13, marginBottom: 16, display: 'block' }}>
          {filtered.length} offre{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
        </Text>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>
        ) : filtered.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary">Aucune offre trouvée</Text>}
            style={{ marginTop: 80 }}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => jobModal.open()}
              style={{ background: PRIMARY, borderColor: PRIMARY }}>
              Créer une offre
            </Button>
          </Empty>
        ) : viewMode === 'list' ? (
          /* ── VUE LISTE ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(job => {
              const s = STATUS_CONFIG[job.statut] || STATUS_CONFIG.brouillon;
              return (
                <div key={job.id} style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = PRIMARY; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 12px ${PRIMARY}15`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                >
                  {/* Icône statut */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: s.color, fontSize: 16, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>

                  {/* Infos principale */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 15, color: '#111827' }}>{job.titre}</Text>
                      <Tag style={{
                        background: s.bg, color: s.color,
                        border: `1px solid ${s.color}30`,
                        borderRadius: 6, fontSize: 11, padding: '0 6px',
                      }}>
                        {s.label}
                      </Tag>
                    </div>
                    <Space size={16} style={{ color: '#6b7280', fontSize: 12 }}>
                      <span><TeamOutlined style={{ marginRight: 4 }} />{job.department?.nom || 'Général'}</span>
                      <span><EnvironmentOutlined style={{ marginRight: 4 }} />{job.type_contrat}</span>
                      <span>{{ remote: '🌐 Télétravail', hybrid: '🔄 Hybride', onsite: '🏢 Présentiel' }[job.type_lieu] || job.type_lieu}</span>
                      {job.date_limite && (
                        <span style={{ color: '#d97706' }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          Limite : {new Date(job.date_limite).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </Space>
                  </div>

                  {/* Candidatures */}
                  <div style={{ textAlign: 'center', minWidth: 70 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: PRIMARY, lineHeight: 1 }}>
                      {job.applications_count || 0}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>candidats</div>
                  </div>

                  {/* Actions */}
                  <Space>
                    <Tooltip title="Modifier">
                      <Button shape="circle" icon={<EditOutlined />}
                        onClick={e => { e.stopPropagation(); jobModal.open(job); }}
                        style={{ border: '1px solid #e5e7eb' }} />
                    </Tooltip>
                    <Dropdown menu={getMenuItems(job)} trigger={['click']} placement="bottomRight">
                      <Button shape="circle" icon={<EllipsisOutlined />}
                        onClick={e => e.stopPropagation()}
                        style={{ border: '1px solid #e5e7eb' }} />
                    </Dropdown>
                  </Space>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── VUE GRILLE ── */
          <Row gutter={[16, 16]}>
            {filtered.map(job => {
              const s = STATUS_CONFIG[job.statut] || STATUS_CONFIG.brouillon;
              return (
                <Col span={8} key={job.id}>
                  <div style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    padding: '20px',
                    height: '100%',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = PRIMARY; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px ${PRIMARY}15`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Tag style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 6 }}>
                        {s.icon} <span style={{ marginLeft: 4 }}>{s.label}</span>
                      </Tag>
                      <Dropdown menu={getMenuItems(job)} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined />} size="small" />
                      </Dropdown>
                    </div>

                    <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8, color: '#111827' }}>
                      {job.titre}
                    </Text>

                    <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 16 }}>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        <TeamOutlined style={{ marginRight: 6 }} />{job.department?.nom || 'Général'}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        <EnvironmentOutlined style={{ marginRight: 6 }} />{job.type_contrat}
                      </Text>
                    </Space>

                    <div style={{
                      borderTop: '1px solid #f3f4f6',
                      paddingTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: PRIMARY }}>{job.applications_count || 0}</span>
                        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>candidats</span>
                      </div>
                      <Button size="small" icon={<EditOutlined />}
                        onClick={() => jobModal.open(job)}
                        style={{ borderColor: PRIMARY, color: PRIMARY }}>
                        Modifier
                      </Button>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* ── MODALE FORMULAIRE ── */}
      <Modal
        open={jobModal.isOpen}
        onCancel={() => jobModal.close()}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${PRIMARY}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {jobModal.data ? <EditOutlined style={{ color: PRIMARY }} /> : <PlusOutlined style={{ color: PRIMARY }} />}
            </div>
            <span>{jobModal.data ? "Modifier l'offre" : "Créer une offre"}</span>
          </div>
        }
        footer={null}
        width={860}
        destroyOnClose
        styles={{ header: { borderBottom: '1px solid #f3f4f6', paddingBottom: 16 } }}
      >
        <JobForm
          job={jobModal.data ?? undefined}
          onSuccess={() => { jobModal.close(); fetchJobs(); }}
          onCancel={() => jobModal.close()}
        />
      </Modal>

      {/* ── MODALE SUPPRESSION ── */}
      <Modal
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onOk={() => deleteId && handleDelete(deleteId)}
        okText="Supprimer"
        cancelText="Annuler"
        okButtonProps={{ danger: true }}
        title="Confirmer la suppression"
        width={420}
      >
        <Text>Cette action est irréversible. Toutes les candidatures associées seront également supprimées.</Text>
      </Modal>
    </RhLayout>
  );
}
