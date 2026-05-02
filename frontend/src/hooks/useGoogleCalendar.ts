
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import api from '../services/api';

interface CalendarStatus {
    connected: boolean;
    expired:   boolean;
    calendar:  string | null;
}

export function useGoogleCalendar() {
    const [status,         setStatus]         = useState<CalendarStatus | null>(null);
    const [loadingStatus,  setLoadingStatus]  = useState(true);
    const [connecting,     setConnecting]     = useState(false);
    const [disconnecting,  setDisconnecting]  = useState(false);

    // Vérifie le statut de connexion
    const fetchStatus = useCallback(async () => {
        try {
            const res = await api.get('/rh/google/calendar/status');
            setStatus(res.data);
        } catch {
            setStatus({ connected: false, expired: false, calendar: null });
        } finally {
            setLoadingStatus(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Vérifie le query param ?calendar=success|error après le callback OAuth
   useEffect(() => {
    // Lit les query params APRÈS que React Router a rendu la page
    const params  = new URLSearchParams(window.location.search);
    const calParam = params.get('calendar');

    if (calParam === 'success') {
        message.success('✅ Google Calendar connecté avec succès !');
        // Refresh le statut
        fetchStatus();
        // Nettoie l'URL sans recharger la page
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.hash
            // ↑ garde le #integrations mais retire ?calendar=success
        );
    } else if (calParam === 'error') {
        message.error('❌ Erreur lors de la connexion à Google Calendar');
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.hash
        );
    }
}, []);


    // Lance le flux OAuth Google
    const connect = useCallback(async () => {
        setConnecting(true);
        try {
            const res = await api.get('/rh/google/calendar/auth-url');
            // Redirige vers Google OAuth dans le même onglet
            window.location.href = res.data.auth_url;
        } catch {
            message.error('Impossible de lancer la connexion Google Calendar');
            setConnecting(false);
        }
    }, []);

    // Déconnecte le calendrier
    const disconnect = useCallback(async () => {
        setDisconnecting(true);
        try {
            await api.delete('/rh/google/calendar/disconnect');
            setStatus({ connected: false, expired: false, calendar: null });
            message.success('Calendrier Google déconnecté');
        } catch {
            message.error('Erreur lors de la déconnexion');
        } finally {
            setDisconnecting(false);
        }
    }, []);

    return {
        status,
        loadingStatus,
        connecting,
        disconnecting,
        connect,
        disconnect,
        refresh: fetchStatus,
    };
}