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
        s.on("character_stat_updated", ({ characterId, stat, value }) => {
            setPartyStats(prev => ({
                ...prev,
                [characterId]: {
                    ...prev[characterId],
                    [stat]: value
                }
            }));
        });

        s.on("encounter_updated", (data) => {
            setEncounterStatus(data);
        });

        s.on("dice_rolled", (data) => {
            setDiceLogs(prev => [data, ...prev].slice(0, 15));
        });

        s.on("dice_revealed", ({ rollId }) => {
            setDiceLogs(prev => prev.map(log => log.id === rollId ? { ...log, isHidden: false } : log));
        });

        s.on("whisper_received", (data) => {
            setWhisperData(data);
        });

        // DM seviye değiştirme izni
        s.on("level_permission_updated", ({ granted }) => {
            setDmLevelPermission(granted);
        });

        // Map Sync
        s.on("map_updated", (data) => {
            setMapData(data);
        });

        s.on("token_moved", ({ tokenId, x, y }) => {
            setMapData(prev => ({
                ...prev,
                tokens: prev.tokens.map(t => t.id === tokenId ? { ...t, x, y } : t)
            }));
        });

        return () => {
            s.off("character_stat_updated");
            s.off("encounter_updated");
            s.off("dice_rolled");
            s.off("dice_revealed");
            s.off("whisper_received");
            s.off("level_permission_updated");
            s.off("map_updated");
            s.off("token_moved");
            s.disconnect();
            _socket = null; // sonraki mount için sıfırla
        };
    }, [campaignId, role, userId, token]);

    return { encounterStatus, partyStats, diceLogs, whisperData, socket, dmLevelPermission, mapData };
}
