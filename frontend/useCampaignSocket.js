import { useEffect, useState } from "react";

// Backend URL
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Singleton — sadece tarayıcıda, bir kez oluşturulur
let _socket = null;

function getSocket(token) {
    if (typeof window === "undefined") return null;
    if (!_socket) {
        const { io } = require("socket.io-client");
        _socket = io(SOCKET_URL, {
            autoConnect: false,
            auth: { token }
        });
    } else if (token) {
        _socket.auth = { token };
    }
    return _socket;
}

export function useCampaignSocket(campaignId, role, userId, token) {
    const [encounterStatus, setEncounterStatus] = useState(null);
    const [partyStats, setPartyStats] = useState({});
    const [diceLogs, setDiceLogs] = useState([]);
    const [whisperData, setWhisperData] = useState(null);
    const [whisperHistory, setWhisperHistory] = useState([]);
    const [dmLevelPermission, setDmLevelPermission] = useState(false);
    const [mapData, setMapData] = useState({ bgUrl: '', gridSize: 50, showGrid: true, tokens: [] });
    /** @type {[import('socket.io-client').Socket | null, Function]} */
    const [socket, setSocket] = useState(/** @type {any} */(null));

    useEffect(() => {
        const s = getSocket(token);
        if (!s) return;

        setSocket(s);
        s.connect();

        // Odaya katıl
        s.emit("join_campaign", { campaignId, role, userId });

        // Dinleyiciler (Listeners)
        s.on("character_stat_updated", ({ characterId, name, stat, value }) => {
            setPartyStats(prev => {
                const updated = { ...prev };
                // İsim üzerinden indexleme (party_sync ile uyumlu)
                if (name && updated[name]) {
                    updated[name] = { ...updated[name], [stat]: value };
                }
                // ID üzerinden indexleme (eskiden kalma veya yedek)
                else if (characterId && updated[characterId]) {
                    updated[characterId] = { ...updated[characterId], [stat]: value };
                }
                return updated;
            });
        });

        s.on("party_sync", (data) => {
            setPartyStats(data || {});
        });

        s.on("encounter_updated", (data) => {
            setEncounterStatus(data);
        });

        s.on("dice_rolled", (data) => {
            if (!data) return;
            setDiceLogs(prev => [data, ...(Array.isArray(prev) ? prev : [])].slice(0, 30));
        });

        s.on("dice_history", (history) => {
            if (Array.isArray(history)) {
                setDiceLogs(history.reverse()); // Backend sends ascending, we want descending
            }
        });

        s.on("dice_revealed", (payload) => {
            if (!payload || !payload.rollId) return;
            setDiceLogs(prev => (Array.isArray(prev) ? prev : []).map(log => log && log.id === payload.rollId ? { ...log, isHidden: false } : log));
        });

        s.on("whisper_received", (data) => {
            if (!data) return;
            const whisperWithTime = { ...data, createdAt: data.createdAt || new Date().toISOString() };
            setWhisperData(whisperWithTime);
            setWhisperHistory(prev => [...(Array.isArray(prev) ? prev : []), whisperWithTime]);
        });

        s.on("whisper_history", (history) => {
            setWhisperHistory(Array.isArray(history) ? history : []);
        });

        // DM seviye değiştirme izni
        s.on("level_permission_updated", (payload) => {
            setDmLevelPermission(!!(payload && payload.granted));
        });

        // Map Sync
        s.on("map_updated", (data) => {
            setMapData(data || { bgUrl: '', gridSize: 50, showGrid: true, tokens: [] });
        });

        s.on("token_moved", (payload) => {
            if (!payload || !payload.tokenId) return;
            const { tokenId, x, y } = payload;
            setMapData(prev => {
                if (!prev || !Array.isArray(prev.tokens)) return prev;
                return {
                    ...prev,
                    tokens: prev.tokens.map(t => t && t.id === tokenId ? { ...t, x, y } : t)
                };
            });
        });

        return () => {
            s.off("character_stat_updated");
            s.off("encounter_updated");
            s.off("dice_rolled");
            s.off("dice_revealed");
            s.off("whisper_received");
            s.off("whisper_history");
            s.off("level_permission_updated");
            s.off("map_updated");
            s.off("token_moved");
            s.off("party_sync");
            s.off("dice_history");
            s.disconnect();
            _socket = null; // sonraki mount için sıfırla
        };
    }, [campaignId, role, userId, token]);

    return { encounterStatus, partyStats, diceLogs, whisperData, whisperHistory, socket, dmLevelPermission, mapData };
}
