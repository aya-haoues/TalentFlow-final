import { useState, useEffect } from 'react';
import {
  Form, Input, Select, DatePicker, InputNumber, Button, Space, Row, Col,
  Divider, Typography, message, Tag, Modal, Spin, Alert
} from 'antd';
import {
  PlusOutlined, MinusCircleOutlined, RobotOutlined,
  ThunderboltOutlined, SendOutlined, ReloadOutlined,
  CheckOutlined, InfoCircleOutlined
} from '@ant-design/icons';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { jobsService, JOB_CONSTANTS } from '../../services/jobs.service';
import { departmentsService } from '../../services/departments.service';
import type { JobFormProps, JobInput } from '../../types';
import dayjs from 'dayjs';
import { AxiosError } from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PRIMARY = '#00a89c';

// ── Section header helper ────────────────────────────────────
const SectionHeader = ({ icon, title, color = PRIMARY }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color, fontSize: 15,
    }}>
      {icon}
    </div>
    <Title level={5} style={{ margin: 0, color: '#111827' }}>{title}</Title>
  </div>
);

// ── Modale IA ────────────────────────────────────────────────
interface AiModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (desc: string) => void;
  jobTitle: string;
}

function AiDescriptionModal({ open, onClose, onApply, jobTitle }: AiModalProps) {
  const [keywords, setKeywords]     = useState('');
  const [keywordList, setKwList]    = useState<string[]>([]);
  const [kwInput, setKwInput]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [generated, setGenerated]   = useState('');
  const [step, setStep]             = useState<'input' | 'result'>('input');

  // Reset à l'ouverture
  useEffect(() => {
    if (open) {
      setKeywords(''); setKwList([]); setKwInput('');
      setGenerated(''); setStep('input'); setLoading(false);
    }
  }, [open]);

  const addKeyword = () => {
    const kw = kwInput.trim();
    if (kw && !keywordList.includes(kw)) {
      setKwList(prev => [...prev, kw]);
    }
    setKwInput('');
  };

  const removeKeyword = (kw: string) => setKwList(prev => prev.filter(k => k !== kw));

  const handleGenerate = async () => {
    if (keywordList.length === 0 && !keywords.trim()) {
      message.warning('Ajoutez au moins un mot-clé ou une description courte');
      return;
    }

    setLoading(true);
    try {
      // Appel à l'API Anthropic via votre backend Laravel
      const res = await fetch('http://localhost:8000/api/ai/generate-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          titre:    jobTitle,
          keywords: keywordList,
          context:  keywords,
        }),
      });

      const data = await res.json();
      if (data.success && data.description) {
        setGenerated(data.description);
        setStep('result');
      } else {
        throw new Error(data.message || 'Génération échouée');
      }
    } catch (err: any) {
      // Fallback : génération côté frontend avec template enrichi
      const kwStr = keywordList.join(', ') || keywords;
      const desc = generateLocalDescription(jobTitle, kwStr, keywords);
      setGenerated(desc);
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  // Génération locale si backend indisponible
  const generateLocalDescription = (titre: string, kws: string, context: string): string => {
    return `<h3>À propos du poste</h3>
<p>Nous recherchons un(e) <strong>${titre}</strong> talentueux(se) pour rejoindre notre équipe dynamique. ${context ? context + '.' : 'Ce rôle stratégique vous permettra de contribuer directement à notre croissance.'}</p>

<h3>Vos missions principales</h3>
<ul>
<li>Concevoir et développer des solutions innovantes en lien avec : <strong>${kws}</strong></li>
<li>Collaborer étroitement avec les équipes produit, design et business</li>
<li>Participer activement aux revues de code et aux décisions techniques</li>
<li>Contribuer à l'amélioration continue des processus et des outils</li>
<li>Assurer la qualité et la performance des livrables</li>
</ul>

<h3>Profil recherché</h3>
<ul>
<li>Expérience confirmée avec : ${kws}</li>
<li>Esprit d'équipe, autonomie et sens des responsabilités</li>
<li>Capacité à travailler dans un environnement agile et en constante évolution</li>
<li>Passion pour l'innovation et la résolution de problèmes complexes</li>
</ul>

<h3>Ce que nous offrons</h3>
<ul>
<li>Un environnement de travail stimulant et bienveillant</li>
<li>Des projets variés et à fort impact</li>
<li>Des opportunités d'évolution et de formation continue</li>
<li>Une culture d'entreprise axée sur la collaboration et l'excellence</li>
</ul>`;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#7c3aed15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RobotOutlined style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Générer avec l'IA</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
              {jobTitle || 'Titre du poste non défini'}
            </div>
          </div>
        </div>
      }
      destroyOnClose
    >
      {step === 'input' ? (
        <div style={{ padding: '8px 0' }}>
          <Alert
            message="Comment ça marche ?"
            description="Ajoutez des mots-clés décrivant le poste (technologies, compétences, valeurs...) et l'IA génère une description professionnelle et captivante pour attirer les meilleurs candidats."
            type="info"
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />

          {/* Mots-clés */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Mots-clés / Compétences <Text type="secondary" style={{ fontWeight: 400 }}>(recommandé)</Text>
            </Text>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Input
                placeholder="Ex: React, MongoDB, agile, leadership..."
                value={kwInput}
                onChange={e => setKwInput(e.target.value)}
                onPressEnter={addKeyword}
                style={{ flex: 1 }}
              />
              <Button onClick={addKeyword} icon={<PlusOutlined />} style={{ borderColor: PRIMARY, color: PRIMARY }}>
                Ajouter
              </Button>
            </div>
            {keywordList.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {keywordList.map(kw => (
                  <Tag
                    key={kw}
                    closable
                    onClose={() => removeKeyword(kw)}
                    style={{ background: `${PRIMARY}10`, color: PRIMARY, border: `1px solid ${PRIMARY}30`, borderRadius: 6 }}
                  >
                    {kw}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {/* Contexte libre */}
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Contexte supplémentaire <Text type="secondary" style={{ fontWeight: 400 }}>(optionnel)</Text>
            </Text>
            <TextArea
              rows={3}
              placeholder="Ex: Startup fintech en croissance, équipe de 20 personnes, culture bienveillante et remote-friendly..."
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={onClose}>Annuler</Button>
            <Button
              type="primary"
              icon={loading ? <Spin size="small" /> : <SendOutlined />}
              onClick={handleGenerate}
              loading={loading}
              disabled={keywordList.length === 0 && !keywords.trim()}
              style={{ background: '#7c3aed', borderColor: '#7c3aed', minWidth: 160 }}
            >
              {loading ? 'Génération en cours...' : 'Générer la description'}
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '8px 0' }}>
          <Alert
            message="Description générée avec succès !"
            description="Vérifiez et personnalisez si besoin avant d'appliquer."
            type="success"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />

          {/* Aperçu */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '16px 20px',
            maxHeight: 320,
            overflowY: 'auto',
            background: '#fafafa',
            marginBottom: 20,
            fontSize: 13,
            lineHeight: 1.7,
          }}
            dangerouslySetInnerHTML={{ __html: generated }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button icon={<ReloadOutlined />} onClick={() => setStep('input')}>
              Regénérer
            </Button>
            <Space>
              <Button onClick={onClose}>Annuler</Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => { onApply(generated); onClose(); }}
                style={{ background: PRIMARY, borderColor: PRIMARY }}
              >
                Appliquer cette description
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function JobForm({ job = null, onSuccess, onCancel }: JobFormProps) {
  const isEditing = !!job;
  const [form]          = Form.useForm();
  const [loading, setLoading]       = useState(false);
  const [departments, setDepts]     = useState<any[]>([]);
  const [aiModalOpen, setAiModal]   = useState(false);
  const [description, setDesc]      = useState('');

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  useEffect(() => {
    departmentsService.getAll()
      .then(data => setDepts(data))
      .catch(() => message.error('Erreur chargement départements'));
  }, []);

  useEffect(() => {
    if (job) {
      const rawDeptId = job.department_id || (job.department ? (job.department._id || job.department.id) : null);
      const deptId    = rawDeptId ? String(rawDeptId) : undefined;
      const desc      = job.description || '';
      setDesc(desc);
      form.setFieldsValue({
        ...job,
        department_id: deptId,
        date_limite:   job.date_limite ? dayjs(job.date_limite) : null,
        description:   desc,
        competences_requises: job.competences_requises?.length ? job.competences_requises : [''],
      });
    }
  }, [job, form, departments]);

  const handleApplyAI = (generatedDesc: string) => {
    setDesc(generatedDesc);
    form.setFieldValue('description', generatedDesc);
    message.success('Description appliquée !');
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: JobInput = {
        ...values,
        description:            description,
        competences_requises:   values.competences_requises?.filter((c: string) => c?.trim()) ?? [],
        date_limite:            values.date_limite ? values.date_limite.format('YYYY-MM-DD') : null,
      } as JobInput;

      if (isEditing && job) {
        await jobsService.update(job.id, payload);
        message.success('Offre mise à jour avec succès');
      } else {
        await jobsService.create(payload);
        message.success('Offre créée avec succès');
      }
      onSuccess();
    } catch (err) {
      const error = err as AxiosError<{ errors?: Record<string, string[]> }>;
      if (error.response?.status === 422) {
        const fields = Object.keys(error.response.data?.errors || {}).map(field => ({
          name:   field,
          errors: error.response?.data?.errors?.[field],
        }));
        form.setFields(fields);
      } else {
        message.error("Erreur lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  const jobTitle = Form.useWatch('titre', form) || '';

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type_contrat:       'CDI',
          niveau_experience:  'junior',
          type_lieu:          'onsite',
          statut:             'brouillon',
          nombre_postes:       1,
          competences_requises: [''],
        }}
        requiredMark={false}
        style={{ paddingTop: 8 }}
      >
        {/* ── SECTION 1 : INFOS GÉNÉRALES ── */}
        <SectionHeader icon={<InfoCircleOutlined />} title="Informations générales" />

        <Form.Item name="titre" label={<Text strong>Titre du poste</Text>}
          rules={[{ required: true, message: 'Le titre est requis' }]}>
          <Input placeholder="Ex: Développeur Full Stack Laravel" size="large"
            style={{ borderRadius: 8 }} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="department_id" label={<Text strong>Département</Text>}
              rules={[{ required: true, message: 'Le département est requis' }]}>
              <Select placeholder="Sélectionner" size="large" showSearch optionFilterProp="children">
                {departments.map(d => (
                  <Option key={String(d._id || d.id)} value={String(d._id || d.id)}>
                    {d.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="type_contrat" label={<Text strong>Type de contrat</Text>}
              rules={[{ required: true }]}>
              <Select size="large">
                {JOB_CONSTANTS.CONTRATS.map(t => <Option key={t} value={t}>{t}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="type_lieu" label={<Text strong>Mode de travail</Text>}>
              <Select size="large">
                <Option value="onsite">🏢 Présentiel</Option>
                <Option value="hybrid">🔄 Hybride</Option>
                <Option value="remote">🌐 Télétravail</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="niveau_experience" label={<Text strong>Niveau requis</Text>}>
              <Select size="large">
                <Option value="junior">Junior (0-2 ans)</Option>
                <Option value="intermediaire">Intermédiaire (2-5 ans)</Option>
                <Option value="senior">Senior (5+ ans)</Option>
                <Option value="expert">Expert / Lead</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '8px 0 20px' }} />

        {/* ── SECTION 2 : DESCRIPTION IA ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SectionHeader icon={<RobotOutlined />} title="Description du poste" color="#7c3aed" />
          <Button
            icon={<RobotOutlined />}
            onClick={() => setAiModal(true)}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              borderColor: '#7c3aed',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              height: 36,
              marginTop: -4,
            }}
          >
            ✨ Générer avec l'IA
          </Button>
        </div>

        {description && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 8,
            fontSize: 12,
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <CheckOutlined />
            Description générée par l'IA — vous pouvez la modifier ci-dessous
          </div>
        )}

        <Form.Item name="description"
          rules={[{ required: true, message: 'La description est requise' }]}>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
            <ReactQuill
              theme="snow"
              value={description}
              onChange={val => { setDesc(val); form.setFieldValue('description', val); }}
              modules={quillModules}
              style={{ height: 240 }}
              placeholder="Rédigez la description du poste ou utilisez l'IA pour la générer automatiquement..."
            />
          </div>
        </Form.Item>

        <div style={{ height: 48 }} />

        <Divider style={{ margin: '0 0 20px' }} />

        {/* ── SECTION 3 : COMPÉTENCES ── */}
        <SectionHeader icon={<ThunderboltOutlined />} title="Compétences requises" color="#d97706" />

        <Form.List name="competences_requises">
          {(fields, { add, remove }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {fields.map(({ key, name, ...rest }) => (
                <div key={key} style={{ display: 'flex', gap: 8 }}>
                  <Form.Item {...rest} name={[name]} style={{ margin: 0, flex: 1 }}
                    rules={[{ required: true, message: 'Compétence requise' }]}>
                    <Input
                      placeholder="Ex: Laravel, MongoDB, React, gestion de projet..."
                      prefix={<ThunderboltOutlined style={{ color: '#d97706' }} />}
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                  {fields.length > 1 && (
                    <Button type="text" danger icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)} />
                  )}
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}
                style={{ borderRadius: 8, borderColor: '#d97706', color: '#d97706' }}>
                Ajouter une compétence
              </Button>
            </div>
          )}
        </Form.List>

        <Divider style={{ margin: '12px 0 20px' }} />

        {/* ── SECTION 4 : PARAMÈTRES ── */}
        <SectionHeader icon={<InfoCircleOutlined />} title="Paramètres de l'offre" color="#6b7280" />

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="statut" label={<Text strong>Statut</Text>}>
              <Select size="large">
                <Option value="brouillon">📝 Brouillon</Option>
                <Option value="publiee">🟢 Publiée</Option>
                <Option value="pausee">⏸ En pause</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="nombre_postes" label={<Text strong>Nombre de postes</Text>}>
              <InputNumber min={1} style={{ width: '100%' }} size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="date_limite" label={<Text strong>Date limite</Text>}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} size="large"
                disabledDate={d => d && d.isBefore(dayjs(), 'day')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="salaire_min" label={<Text strong>Salaire minimum (TND)</Text>}>
              <InputNumber min={0} style={{ width: '100%' }} size="large"
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                placeholder="Ex: 1500" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="salaire_max" label={<Text strong>Salaire maximum (TND)</Text>}>
              <InputNumber min={0} style={{ width: '100%' }} size="large"
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                placeholder="Ex: 2500" />
            </Form.Item>
          </Col>
        </Row>

        {/* ── ACTIONS ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6',
        }}>
          {onCancel && <Button onClick={onCancel} style={{ borderRadius: 8 }}>Annuler</Button>}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8, fontWeight: 600, minWidth: 140 }}
          >
            {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : "Publier l'offre"}
          </Button>
        </div>
      </Form>

      {/* ── MODALE IA ── */}
      <AiDescriptionModal
        open={aiModalOpen}
        onClose={() => setAiModal(false)}
        onApply={handleApplyAI}
        jobTitle={jobTitle}
      />
    </>
  );
}
