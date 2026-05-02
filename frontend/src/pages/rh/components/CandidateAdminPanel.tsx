import React, { useState, useCallback, useMemo, useRef  } from 'react';
import {
    Col, Select, Divider, Tag, Avatar, Badge,
    Space, Typography, Switch, Button, Tooltip, Spin,
} from 'antd';
import {
    UserOutlined, TeamOutlined, LockOutlined, EyeOutlined,
    BoldOutlined, ItalicOutlined, UnderlineOutlined,
    OrderedListOutlined, UnorderedListOutlined, SendOutlined,
    ClockCircleOutlined, DeleteOutlined
} from '@ant-design/icons';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

import type { AdminPanelProps, RichNoteEditorProps, Note, TeamMember } from '../../../hooks/useCandidateActions';
import { STATUT_CONFIG } from '../../../hooks/useCandidateActions';
import { PRIMARY } from '../../../theme/colors';

dayjs.extend(relativeTime);
dayjs.locale('fr');

const { Text } = Typography;

// ════════════════════════════════════════════════════════════
// SOUS-COMPOSANT : MentionDropdown
// ════════════════════════════════════════════════════════════

const MentionDropdown: React.FC<{
    members:  TeamMember[];
    filter:   string;
    onSelect: (member: TeamMember) => void;
    visible:  boolean;
    position: { top: number; left: number };
}> = ({ members, filter, onSelect, visible, position }) => {
    if (!visible) return null;

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) return null;

    return (
        <div style={{
            position:   'absolute',
            top:        position.top,
            left:       position.left,
            zIndex:     1000,
            background: '#fff',
            border:     '1px solid #e8e8e8',
            borderRadius: 8,
            boxShadow:  '0 4px 16px rgba(0,0,0,0.12)',
            minWidth:   200,
            maxHeight:  180,
            overflowY:  'auto',
        }}>
            {filtered.map(member => (
                <div
                    key={member.id}
                    onMouseDown={e => {
                        // onMouseDown + preventDefault : empêche le blur de l'éditeur
                        // avant que le clic ne soit traité
                        e.preventDefault();
                        onSelect(member);
                    }}
                    style={{
                        display:    'flex',
                        alignItems: 'center',
                        gap:        8,
                        padding:    '8px 12px',
                        cursor:     'pointer',
                        fontSize:   13,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <Avatar
                        size={24}
                        style={{
                            background: member.role === 'rh' ? PRIMARY : '#8B5CF6',
                            fontSize:   10,
                            flexShrink: 0,
                        }}
                    >
                        {member.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600, color: '#262626', lineHeight: 1.3 }}>
                            {member.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'capitalize' }}>
                            {member.role}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// SOUS-COMPOSANT : NoteCard
// ════════════════════════════════════════════════════════════

const NoteCard: React.FC<{ note: Note, onDelete?: (id: string) => void }> = React.memo(({ note, onDelete }) => (
    <div style={{
        padding:      '10px 12px',
        background:   '#fff',
        border:       '1px solid #f0f0f0',
        borderLeft:   `3px solid ${PRIMARY}`,
        borderRadius: 8,
        marginBottom: 8,
        position:     'relative', // Pour positionner le bouton si besoin
        fontSize:     12,
    }}>
        {/* Header */}
        <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginBottom:   6,
        }}>
            <Space size={6}>
                <Avatar
                    size={20}
                    style={{
                        background: note.author?.role === 'rh' ? PRIMARY : '#8B5CF6',
                        fontSize:   9,
                    }}
                >
                    {note.author?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </Avatar>
                <Text strong style={{ fontSize: 12, color: '#262626' }}>
                    {note.author?.name ?? 'Inconnu'}
                </Text>
                <Tag
                    color={note.author?.role === 'rh' ? 'blue' : 'purple'}
                    style={{ fontSize: 10, padding: '0 4px', borderRadius: 4 }}
                >
                    {(note.author?.role ?? 'rh').toUpperCase()}
                </Tag>
            </Space>
            <Space size={10}>
                <Tooltip title={note.note_visibility === 'shared_manager' ? 'Visible par le manager' : 'RH uniquement'}>
                    {note.note_visibility === 'shared_manager' 
                        ? <EyeOutlined style={{ color: PRIMARY, fontSize: 11 }} /> 
                        : <LockOutlined style={{ color: '#bfbfbf', fontSize: 11 }} />
                    }
                </Tooltip>

                {/* BOUTON SUPPRIMER */}
                <Tooltip title="Supprimer la note">
                    <Button 
                        type="text" 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined style={{ fontSize: 11 }} />} 
                        onClick={() => onDelete?.(note.id)}
                        style={{ height: 20, width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                </Tooltip>

                <Text type="secondary" style={{ fontSize: 11 }}>
                    {note.created_at ? dayjs(note.created_at).fromNow() : '—'}
                </Text>
            </Space>
        </div>

        {/* Contenu HTML sanitisé */}
        <div
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.notes_internes) }}
            style={{ color: '#595959', lineHeight: 1.6, fontSize: 12 }}
        />

        {/* Mentions */}
        {note.mentions && note.mentions.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {note.mentions.map(m => (
                    <Tag key={m.id} color="geekblue" style={{ fontSize: 10, borderRadius: 4 }}>
                        @{m.name}
                    </Tag>
                ))}
            </div>
        )}
    </div>
));
NoteCard.displayName = 'NoteCard';

// ════════════════════════════════════════════════════════════
// SOUS-COMPOSANT : RichNoteEditor
// ════════════════════════════════════════════════════════════

interface RichNoteEditorExtendedProps extends RichNoteEditorProps {
    teamMembers:      TeamMember[];
    onMentionsChange: (mentions: string[]) => void;
    resetKey:         number;   // ← incrémenté par le parent pour forcer le reset du DOM
}

const RichNoteEditor: React.FC<RichNoteEditorExtendedProps> = React.memo(({
    onChange, visibility, onVisibilityChange, onSave, saving,
    teamMembers, onMentionsChange, 
}) => {
    const editorRef    = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [mentionVisible,  setMentionVisible]  = useState(false);
    const [mentionFilter,   setMentionFilter]   = useState('');
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [mentionStart,    setMentionStart]    = useState(-1);
    const [mentionedIds,    setMentionedIds]    = useState<string[]>([]);

    

    const execCommand = useCallback((cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
        editorRef.current?.focus();
    }, [onChange]);

    const handleInput = useCallback(() => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, [onChange]);

    // ── Détection du "@" pour ouvrir le dropdown ──
    const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
        // Ferme le dropdown sur Escape
        if (e.key === 'Escape') { setMentionVisible(false); return; }

        const sel = window.getSelection();
        if (!sel || !editorRef.current) return;

        const node = sel.anchorNode;
        if (!node || node.nodeType !== Node.TEXT_NODE) {
            setMentionVisible(false);
            return;
        }

        const text = node.textContent ?? '';
        const pos  = sel.anchorOffset;
        const lastAt = text.lastIndexOf('@', pos - 1);

        if (lastAt !== -1) {
            const query = text.slice(lastAt + 1, pos);
            // Pas d'espace dans la query → mention en cours
            if (!query.includes(' ') && !query.includes('\n')) {
                setMentionFilter(query);
                setMentionStart(lastAt);

                // Position du dropdown sous le curseur
                try {
                    const range = sel.getRangeAt(0).cloneRange();
                    range.collapse(true);
                    const rect      = range.getBoundingClientRect();
                    const container = containerRef.current?.getBoundingClientRect();
                    if (container && rect.top > 0) {
                        setMentionPosition({
                            top:  rect.bottom - container.top + 6,
                            left: Math.max(0, rect.left - container.left),
                        });
                    }
                } catch { /* ignore */ }

                setMentionVisible(true);
                return;
            }
        }
        setMentionVisible(false);
    }, []);

    
    // ── Insertion du chip @mention dans l'éditeur ──
    const handleSelectMention = useCallback((member: TeamMember) => {
        if (!editorRef.current) return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        const node  = range.startContainer;

        if (node.nodeType !== Node.TEXT_NODE) return;

        const text      = node.textContent ?? '';
        const cursorPos = range.startOffset;

        // Sélectionner depuis le "@" jusqu'au curseur
        const deleteFrom = mentionStart;
        const deleteTo   = cursorPos;

        range.setStart(node, deleteFrom);
        range.setEnd(node, deleteTo);
        range.deleteContents();

        // Créer le chip mention (span non-éditable)
        const chip = document.createElement('span');
        chip.contentEditable  = 'false';
        chip.dataset.memberId = member.id;
        chip.style.cssText = [
            `color: #1d4ed8`,
            `font-weight: 700`,
            `background: #dbeafe`,
            `border-radius: 4px`,
            `padding: 1px 4px`,
            `cursor: default`,
            `user-select: none`,
            `display: inline`,
        ].join(';');
        chip.textContent = `@${member.name}`;

        // Espace après le chip pour continuer à taper
        const space = document.createTextNode('\u00A0');

        range.insertNode(space);
        range.insertNode(chip);

        // Placer le curseur après l'espace
        const newRange = document.createRange();
        newRange.setStartAfter(space);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        // Mettre à jour les mentions et le contenu
        const newIds = [...mentionedIds, member.id];
        setMentionedIds(newIds);
        onMentionsChange(newIds);
        onChange(editorRef.current.innerHTML);

        setMentionVisible(false);
        editorRef.current.focus();
    }, [mentionStart, mentionedIds, onChange, onMentionsChange]);

    const toolbarBtns = useMemo(() => [
        { icon: <BoldOutlined />,          cmd: 'bold',                title: 'Gras'            },
        { icon: <ItalicOutlined />,         cmd: 'italic',              title: 'Italique'        },
        { icon: <UnderlineOutlined />,      cmd: 'underline',           title: 'Souligné'        },
        { icon: <UnorderedListOutlined />,  cmd: 'insertUnorderedList', title: 'Liste'           },
        { icon: <OrderedListOutlined />,    cmd: 'insertOrderedList',   title: 'Liste numérotée' },
    ], []);

    const highlightColors = ['#fff3cd', '#d4edda', '#f8d7da', '#cce5ff'];

    // ── Bouton "@" dans la toolbar ──
    const insertMentionTrigger = useCallback(() => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand('insertText', false, '@');
        onChange(editorRef.current.innerHTML);

        // Déclenche manuellement la logique de mention
        setTimeout(() => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const node = sel.anchorNode;
            if (!node || node.nodeType !== Node.TEXT_NODE) return;

            const text    = node.textContent ?? '';
            const pos     = sel.anchorOffset;
            const lastAt  = text.lastIndexOf('@', pos - 1);
            if (lastAt === -1) return;

            setMentionFilter('');
            setMentionStart(lastAt);

            try {
                const range = sel.getRangeAt(0).cloneRange();
                range.collapse(true);
                const rect      = range.getBoundingClientRect();
                const container = containerRef.current?.getBoundingClientRect();
                if (container && rect.top > 0) {
                    setMentionPosition({
                        top:  rect.bottom - container.top + 6,
                        left: Math.max(0, rect.left - container.left),
                    });
                }
            } catch { /* ignore */ }

            setMentionVisible(true);
        }, 0);
    }, [onChange]);

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <div style={{
                border:     '1px solid #e8e8e8',
                borderRadius: 10,
                overflow:   'hidden',
                background: '#fff',
                boxShadow:  '0 1px 6px rgba(0,0,0,0.06)',
            }}>
                {/* Toolbar */}
                <div style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          4,
                    padding:      '8px 10px',
                    background:   '#fafafa',
                    borderBottom: '1px solid #f0f0f0',
                    flexWrap:     'wrap',
                }}>
                    {toolbarBtns.map(btn => (
                        <Tooltip key={btn.cmd} title={btn.title}>
                            <Button
                                type="text" size="small" icon={btn.icon}
                                onMouseDown={e => { e.preventDefault(); execCommand(btn.cmd); }}
                                style={{ color: '#595959', borderRadius: 4 }}
                            />
                        </Tooltip>
                    ))}
                    <Divider type="vertical" style={{ height: 18, margin: '0 4px' }} />
                    {highlightColors.map(color => (
                        <Tooltip key={color} title="Surligner">
                            <button
                                onMouseDown={e => { e.preventDefault(); execCommand('hiliteColor', color); }}
                                style={{
                                    width: 18, height: 18, borderRadius: 4,
                                    background: color, border: '1px solid #d9d9d9',
                                    cursor: 'pointer', padding: 0, flexShrink: 0,
                                }}
                            />
                        </Tooltip>
                    ))}
                    <Divider type="vertical" style={{ height: 18, margin: '0 4px' }} />
                    <Tooltip title="Mentionner un membre (@)">
                        <Button
                            type="text" size="small"
                            icon={<TeamOutlined />}
                            onMouseDown={e => { e.preventDefault(); insertMentionTrigger(); }}
                            style={{ color: PRIMARY, fontWeight: 700, fontSize: 13 }}
                        >
                            @
                        </Button>
                    </Tooltip>
                </div>

                {/* Zone de saisie */}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onKeyUp={handleKeyUp}
                    style={{
                        minHeight:  120,
                        maxHeight:  200,
                        overflowY:  'auto',
                        padding:    '12px 14px',
                        fontSize:   13,
                        lineHeight: 1.7,
                        color:      '#262626',
                        outline:    'none',
                    }}
                    data-placeholder="Ajouter une observation... (tapez @ pour mentionner)"
                />

                {/* Footer */}
                <div style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    alignItems:     'center',
                    padding:        '8px 12px',
                    background:     '#fafafa',
                    borderTop:      '1px solid #f0f0f0',
                    gap:            8,
                    flexWrap:       'wrap',
                }}>
                    <Space size={6}>
                        <Switch
                            size="small"
                            checked={visibility === 'shared_manager'}
                            onChange={v => onVisibilityChange(v ? 'shared_manager' : 'rh_only')}
                            style={{ background: visibility === 'shared_manager' ? PRIMARY : '#d9d9d9' }}
                        />
                        <span style={{ fontSize: 12, color: '#595959' }}>
                            {visibility === 'shared_manager' ? (
                                <Space size={4}>
                                    <EyeOutlined style={{ color: PRIMARY }} />
                                    Visible par le manager
                                </Space>
                            ) : (
                                <Space size={4}>
                                    <LockOutlined style={{ color: '#8c8c8c' }} />
                                    RH uniquement
                                </Space>
                            )}
                        </span>
                    </Space>
                    <Button
                        type="primary" size="small" loading={saving}
                        icon={<SendOutlined />} onClick={onSave}
                        style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 6 }}
                    >
                        Enregistrer
                    </Button>
                </div>

                <style>{`
                    [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #bfbfbf;
                        pointer-events: none;
                        display: block;
                    }
                `}</style>
            </div>

            {/* Dropdown @mention */}
            <MentionDropdown
                members={teamMembers}
                filter={mentionFilter}
                onSelect={handleSelectMention}
                visible={mentionVisible}
                position={mentionPosition}
            />
        </div>
    );
});
RichNoteEditor.displayName = 'RichNoteEditor';

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : CandidateAdminPanel
// ════════════════════════════════════════════════════════════

interface CandidateAdminPanelProps extends AdminPanelProps {
    notes:        Note[];
    loadingNotes: boolean;
    teamMembers:  TeamMember[];
    onSaveNote:   (text: string, visibility: 'rh_only' | 'shared_manager', mentions: string[]) => Promise<void>;
    onDeleteNote: (noteId: string) => Promise<void>; // ← Ajoute ceci
}

const CandidateAdminPanel: React.FC<CandidateAdminPanelProps> = React.memo(({
    candidate, currentStatut, onStatutChange,
    savingNote, onSaveNote, notes, loadingNotes, teamMembers, onDeleteNote
}) => {
    const [noteText,       setNoteText]       = useState('');
    const [noteVisibility, setNoteVisibility] = useState<'rh_only' | 'shared_manager'>('rh_only');
    const [noteMentions,   setNoteMentions]   = useState<string[]>([]);

    // ← clé incrémentée après chaque sauvegarde pour reset le DOM du RichNoteEditor
    const [editorResetKey, setEditorResetKey] = useState(0);

    const statutOptions = useMemo(() =>
        Object.entries(STATUT_CONFIG).map(([val, cfg]) => ({
            value: val,
            label: <Space><Badge color={cfg.color} />{cfg.label}</Space>,
        })), []);

    const handleSave = useCallback(async () => {
        const textOnly = noteText.replace(/<[^>]*>/g, '').trim();
        if (!textOnly) return;

        try {
            await onSaveNote(noteText, noteVisibility, noteMentions);
            // Reset des états locaux
            setNoteText('');
            setNoteMentions([]);
            // Reset du DOM de l'éditeur via la key
            setEditorResetKey(k => k + 1);
        } catch {
            // L'erreur est gérée dans le hook
        }
    }, [noteText, noteVisibility, noteMentions, onSaveNote]);

    

    return (
        <Col span={7} style={{
            padding:    '28px 20px',
            background: '#f9fafb',
            height:     '92vh',
            overflowY:  'auto',
            borderLeft: '1px solid #f0f0f0',
        }}>

            {/* ── 1. Statut ── */}
            <div style={{ marginBottom: 24 }}>
                <SectionLabel>Statut de la candidature</SectionLabel>
                <Select
                    value={currentStatut}
                    onChange={onStatutChange}
                    style={{ width: '100%' }}
                    options={statutOptions}
                />
            </div>

            <Divider style={{ margin: '0 0 20px' }} />

            {/* ── 2. Résumé rapide ── */}
            <div style={{ marginBottom: 24 }}>
                <SectionLabel>Résumé</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#595959' }}>
                    {candidate.contract_type_preferred && (
                        <div>
                            <Text type="secondary">Contrat : </Text>
                            <Tag color="blue" style={{ borderRadius: 6 }}>{candidate.contract_type_preferred}</Tag>
                        </div>
                    )}
                    {candidate.nationalite && (
                        <div><Text type="secondary">Nationalité : </Text>{candidate.nationalite}</div>
                    )}
                    {(candidate.skills?.length ?? 0) > 0 && (
                        <div><Text type="secondary">Compétences : </Text>{candidate.skills.length} renseignées</div>
                    )}
                    {(candidate.experiences?.length ?? 0) > 0 && (
                        <div><Text type="secondary">Expériences : </Text>{candidate.experiences.length} poste(s)</div>
                    )}
                    {(candidate.formations?.length ?? 0) > 0 && (
                        <div><Text type="secondary">Formations : </Text>{candidate.formations.length} diplôme(s)</div>
                    )}
                    {candidate.has_cv && (
                        <div>
                            <Text type="secondary">CV : </Text>
                            <Tag color="green" style={{ borderRadius: 6 }}>Disponible</Tag>
                        </div>
                    )}
                </div>
            </div>

            <Divider style={{ margin: '0 0 20px' }} />

            {/* ── 3. Notes internes ── */}
            <div>
                <SectionLabel>Notes internes</SectionLabel>

                {/* Éditeur */}
                <RichNoteEditor
                    key={editorResetKey}        // ← force le remontage après sauvegarde
                    value={noteText}
                    onChange={setNoteText}
                    visibility={noteVisibility}
                    onVisibilityChange={setNoteVisibility}
                    onSave={handleSave}
                    saving={savingNote}
                    teamMembers={teamMembers}
                    onMentionsChange={setNoteMentions}
                    resetKey={editorResetKey}
                />

                {/* ── Liste des notes sauvegardées ── */}
                <div style={{ marginTop: 16 }}>
                    {loadingNotes ? (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <Spin size="small" />
                        </div>
                    ) : notes.length === 0 ? (
                        <div style={{
                            textAlign:    'center',
                            padding:      '16px',
                            color:        '#bfbfbf',
                            fontSize:     12,
                            border:       '1px dashed #e8e8e8',
                            borderRadius: 8,
                        }}>
                            Aucune note pour ce candidat
                        </div>
                    ) : (
                        <>
                            <div style={{
                                fontSize:     11,
                                color:        '#8c8c8c',
                                marginBottom: 8,
                                fontWeight:   600,
                            }}>
                                {notes.length} note{notes.length > 1 ? 's' : ''}
                            </div>
                            {notes.map(note => (
                                <NoteCard key={note.id} note={note} onDelete={onDeleteNote} />
                            ))}
                        </>
                    )}
                </div>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            {/* ── 4. Activité récente ── */}
            <div>
                <SectionLabel>Activité récente</SectionLabel>
                <div style={{ fontSize: 12, color: '#595959' }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                        <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            style={{ background: PRIMARY, flexShrink: 0 }}
                        />
                        <div>
                            <strong>Système</strong> a reçu la candidature
                            <div style={{ color: '#bfbfbf', fontSize: 11 }}>
                                {candidate.created_at ? dayjs(candidate.created_at).fromNow() : '—'}
                            </div>
                        </div>
                    </div>
                    {candidate.date_derniere_modification && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Avatar
                                size="small"
                                icon={<UserOutlined />}
                                style={{ background: '#8B5CF6', flexShrink: 0 }}
                            />
                            <div>
                                <strong>RH</strong> a modifié la candidature
                                <div style={{ color: '#bfbfbf', fontSize: 11 }}>
                                    {dayjs(candidate.date_derniere_modification).fromNow()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Col>
    );
});

CandidateAdminPanel.displayName = 'CandidateAdminPanel';
export default CandidateAdminPanel;

// ── Helper ────────────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        fontSize:      11,
        fontWeight:    700,
        letterSpacing: 1.2,
        color:         '#8c8c8c',
        marginBottom:  10,
        textTransform: 'uppercase',
    }}>
        {children}
    </div>
);
