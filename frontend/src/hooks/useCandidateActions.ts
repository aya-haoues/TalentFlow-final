import { useState, useEffect, useCallback } from 'react';
import { message }   from 'antd';
import DOMPurify     from 'dompurify';
import api           from '../services/api';
import type { RhApplication } from '../types/index';

// ════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ════════════════════════════════════════════════════════════

export interface CandidateModalProps {
    visible:          boolean;
    onClose:          () => void;
    candidate:        RhApplication | null;
    onStatusChanged?: (id: string, newStatut: string) => void;
}

export interface NotePayload {
    notes_internes:  string;
    note_visibility: 'rh_only' | 'shared_manager';
    mentions:        string[];
}

export interface AdminPanelProps {
    candidate:      RhApplication;
    currentStatut:  string;
    onStatutChange: (newStatut: string) => Promise<void>;
    savingNote:     boolean;
    onSaveNote:     (text: string, visibility: 'rh_only' | 'shared_manager', mentions: string[]) => Promise<void>;
}

export interface ApercuProps {
    candidate:        RhApplication;
    viewMode:         'cv' | 'experience';
    onViewModeChange: (mode: 'cv' | 'experience') => void;
    onDownloadCv:     () => void;
    onPrintCv:        () => void;
}

export interface RichNoteEditorProps {
    value:              string;
    onChange:           (html: string) => void;
    visibility:         'rh_only' | 'shared_manager';
    onVisibilityChange: (v: 'rh_only' | 'shared_manager') => void;
    onSave:             () => void;
    saving:             boolean;
}

export interface Note {
    id:              string;
    notes_internes:  string;
    note_visibility: 'rh_only' | 'shared_manager';
    author:          { id: string; name: string; role: string };
    mentions:        { id: string; name: string }[];
    created_at:      string;
}

// ✅ Export de TeamMember — était manquant, causait l'erreur dans CandidateAdminPanel
export interface TeamMember {
    id:   string;
    name: string;
    role: 'rh' | 'manager';
}

// ════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════

export const STATUT_CONFIG: Record<string, { color: string; label: string }> = {
    en_cours: { color: '#6B7280', label: 'En cours' },
    entretien:  { color: '#8B5CF6', label: 'Entretien'  },
    acceptee:   { color: '#10B981', label: 'Acceptée'   },
    refusee:    { color: '#EF4444', label: 'Refusée'    },
    retiree:    { color: '#F59E0B', label: 'Retirée'    },
};

// ════════════════════════════════════════════════════════════
// HELPER : formatAdresse
// ════════════════════════════════════════════════════════════

type AdresseShape = {
    rue?:         string;
    address?:     string;
    code_postal?: string;
    postal_code?: string;
    ville?:       string;
    city?:        string;
};

export const formatAdresse = (adresse: unknown): string => {
    if (!adresse) return 'Non renseignée';
    try {
        const parsed =
            typeof adresse === 'string'
                ? (JSON.parse(adresse) as AdresseShape | AdresseShape[])
                : (adresse as AdresseShape | AdresseShape[]);
        const info = Array.isArray(parsed) ? parsed[0] : parsed;
        if (!info) return 'Non renseignée';
        return (
            [
                info.rue         || info.address,
                info.code_postal || info.postal_code,
                info.ville       || info.city,
            ]
                .filter(Boolean)
                .join(', ') || 'Non renseignée'
        );
    } catch {
        return typeof adresse === 'string' ? adresse : 'Format invalide';
    }
};

// ════════════════════════════════════════════════════════════
// TYPE DE RETOUR DU HOOK
// ════════════════════════════════════════════════════════════

export interface UseCandidateActionsReturn {
    currentStatut:      string;
    savingNote:         boolean;
    notes:              Note[];
    loadingNotes:       boolean;
    teamMembers:        TeamMember[];
    analyzing:          boolean;           // ← ajouter
    handleStatutChange: (newStatut: string) => Promise<void>;
    handleSaveNote:     (text: string, visibility: 'rh_only' | 'shared_manager', mentions: string[]) => Promise<void>;
    handleDeleteNote:   (noteId: string) => Promise<void>;
    handleDownloadCv:   () => void;
    handlePrintCv:      () => void;
    handleSendToN8n:    () => Promise<void>; // ← ajouter
}

// ════════════════════════════════════════════════════════════
// HOOK : useCandidateActions
// ════════════════════════════════════════════════════════════

export function useCandidateActions(
    candidate:        RhApplication | null,
    onStatusChanged?: (id: string, newStatut: string) => void,
): UseCandidateActionsReturn {

    const [currentStatut, setCurrentStatut] = useState('');
    const [savingNote,    setSavingNote]    = useState(false);
    const [notes,         setNotes]         = useState<Note[]>([]);
    const [loadingNotes,  setLoadingNotes]  = useState(false);
    const [teamMembers,   setTeamMembers]   = useState<TeamMember[]>([]);

    // ── Charger les notes du candidat ─────────────────────
    const fetchNotes = useCallback(async () => {
        if (!candidate) return;
        setLoadingNotes(true);
        try {
            const { data } = await api.get(`/rh/applications/${candidate.id}/notes`);
            // Support des deux formats de réponse : data.notes ou data.data
            setNotes(data.notes ?? data.data ?? []);
        } catch {
            setNotes([]);
        } finally {
            setLoadingNotes(false);
        }
    }, [candidate]);

    // ── Charger les membres de l'équipe pour @mention ─────
    const fetchTeamMembers = useCallback(async () => {
        try {
            const { data } = await api.get('/rh/team-members');
            setTeamMembers(data.data ?? []);
        } catch {
            setTeamMembers([]);
        }
    }, []);

    // ── Synchronisation quand candidate change ────────────
    useEffect(() => {
        if (!candidate) return;
        setCurrentStatut(candidate.statut ?? 'en_cours');
        setNotes([]);          // reset les notes de l'ancien candidat
        fetchNotes();
        fetchTeamMembers();
    }, [candidate]);            // ← volontairement sans fetchNotes/fetchTeamMembers
                                //   pour éviter les doubles appels au montage

    // ── ACTION 1 : Changement de statut (optimiste) ───────
    const handleStatutChange = useCallback(async (newStatut: string) => {
        if (!candidate) return;
        const previousStatut = currentStatut;
        setCurrentStatut(newStatut);                    // mise à jour optimiste
        try {
            await api.patch(`/rh/applications/${candidate.id}/status`, { statut: newStatut });
            message.success('Statut mis à jour');
            onStatusChanged?.(candidate.id, newStatut);
        } catch {
            setCurrentStatut(previousStatut);           // rollback
            message.error('Erreur lors de la mise à jour du statut');
        }
    }, [candidate, currentStatut, onStatusChanged]);

    // ── ACTION 2 : Sauvegarde d'une note ─────────────────
    const handleSaveNote = useCallback(async (
        noteText:   string,
        visibility: 'rh_only' | 'shared_manager',
        mentions:   string[],
    ) => {
        if (!candidate) return;

        const textOnly = noteText.replace(/<[^>]*>/g, '').trim();
        if (!textOnly) {
            message.warning('La note est vide');
            return;
        }

        setSavingNote(true);
        try {
            const { data } = await api.post(
                `/rh/applications/${candidate.id}/notes`,
                {
                    notes_internes:  DOMPurify.sanitize(noteText),
                    note_visibility: visibility,
                    mentions,
                }
            );
            // Ajoute la note en tête de liste (la plus récente en premier)
            const newNote: Note = data.data ?? data.note;
            if (newNote) {
                setNotes(prev => [newNote, ...prev]);
            }
            message.success('Note enregistrée');
        } catch {
            message.error("Erreur lors de l'enregistrement de la note");
        } finally {
            setSavingNote(false);
        }
    }, [candidate]);

    
const handleDeleteNote = useCallback(async (noteId: string) => {
        // Sauvegarde de l'état précédent pour un éventuel rollback
        const previousNotes = [...notes];
        
        // Mise à jour optimiste : on filtre la note immédiatement
        setNotes(prev => prev.filter(n => n.id !== noteId));

        try {
            // Appel à l'API (on utilise l'URL définie dans ton backend)
            await api.delete(`/rh/notes/${noteId}`);
            message.success('Note supprimée');
        } catch (error) {
            // Rollback en cas d'échec
            setNotes(previousNotes);
            message.error('Erreur lors de la suppression de la note');
            console.error("Erreur suppression:", error);
        }
    }, [notes]);
    
    // ── ACTION 3 : CV ─────────────────────────────────────
    const handleDownloadCv = useCallback(() => {
        if (!candidate?.cv_url) { message.warning('Aucun CV disponible'); return; }
        window.open(candidate.cv_url, '_blank');
    }, [candidate]);

    const handlePrintCv = useCallback(() => {
        if (!candidate?.cv_url) { message.warning('Aucun CV disponible'); return; }
        const win = window.open(candidate.cv_url, '_blank');
        if (win) win.print();
    }, [candidate]);



    const [analyzing, setAnalyzing] = useState(false);

const handleSendToN8n = useCallback(async () => {
    if (!candidate?.id) return;
    setAnalyzing(true);
    try {
        await api.post(`/cv-analysis/send/${candidate.id}`); // ← api au lieu de axios
        message.success('Analyse lancée ! Les résultats apparaîtront dans quelques secondes.');
        setTimeout(() => {
            onStatusChanged?.(candidate.id, candidate.statut ?? 'en_cours'); // ← 2 arguments
        }, 10000);
    } catch (err) {
        message.error("Erreur lors du lancement de l'analyse.");
    } finally {
        setAnalyzing(false);
    }
}, [candidate, onStatusChanged]);




    return {
    currentStatut,
    savingNote,
    notes,
    loadingNotes,
    teamMembers,
    analyzing,           // ← présent
    handleStatutChange,
    handleSaveNote,
    handleDeleteNote,
    handleDownloadCv,
    handlePrintCv,
    handleSendToN8n,     // ← présent
};

}