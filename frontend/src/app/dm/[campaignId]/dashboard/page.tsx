"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useCampaignSocket } from "../../../../../useCampaignSocket";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useDialog } from "@/context/DialogContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MAP_TEMPLATES = [
    { name: 'Seç...', url: '' },
    { name: 'Taverna', url: 'https://images.squarespace-cdn.com/content/v1/593e9232c534a5697e06a378/1566495638202-VUPY5M056T298C7SCSG5/Tavern_Grid.jpg' },
    { name: 'Zindan Koridoru', url: 'https://i.pinimg.com/originals/91/92/72/919272338abd8e4ba7dbd5a08316279f.jpg' },
    { name: 'Orman Yolu', url: 'https://i.pinimg.com/736x/8f/30/1c/8f301cc9388f8d6614144463690d5656.jpg' },
    { name: 'Şehir Meydanı', url: 'https://2minutetabletop.com/wp-content/uploads/2021/05/Town-Square-Night-No-Props-44x32-Grid.jpg' },
];

export default function DMDashboard() {
    const { campaignId } = useParams();
    const { user, token, loading: authLoading } = useAuth();
    const { confirm, alert, prompt } = useDialog();
    const router = useRouter();
    const role = 'DM';
    const [hasMounted, setHasMounted] = useState(false);

    // Redirect if not DM or not logged in
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'DM')) {
            router.push('/');
        }
    }, [user, authLoading]);

    // Odaya DM rolüyle katıl
    const { 
        partyStats, diceLogs, socket, dmLevelPermission, whisperData, whisperHistory,
        partyGold, partyInventory, fogOfWar, quests, factions, sessionNotes, mapData: socketMapData,
        encounterStatus
    } = useCampaignSocket(campaignId, 'DM', 'DM', token);
    
    // Sync local mapData with socket mapData on mount/updates
    useEffect(() => {
        if (socketMapData && socketMapData.tokens) {
            setMapData(prev => ({ ...prev, ...socketMapData }));
        }
    }, [socketMapData]);

    // Toast Notification System
    const [toast, setToast] = useState<{ show: boolean, title: string, message: string, color: string }>({ show: false, title: '', message: '', color: '' });
    const showToast = (title: string, message: string, color: string) => {
        setToast({ show: true, title, message, color });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
    };

    // Watch for whispers
    useEffect(() => {
        const wd = whisperData as any;
        if (wd && wd.targetName === 'DM') {
            showToast(`🤫 Fısıltı: ${wd.senderName || 'Bir Oyuncu'}`, wd.message, 'bg-purple-900 border-purple-500 text-purple-100');
        }
    }, [whisperData]);

    // State yönetimi
    const [monsters, setMonsters] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCombatants, setActiveCombatants] = useState<any[]>([]);
    const [isMonsterBookOpen, setIsMonsterBookOpen] = useState(false);
    const [isDiceMenuOpen, setIsDiceMenuOpen] = useState(false);
    const [isDiceLogOpen, setIsDiceLogOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [expandedMonsterId, setExpandedMonsterId] = useState<string | null>(null);
    const [expandedCombatantId, setExpandedCombatantId] = useState<string | null>(null);
    const [isRollHidden, setIsRollHidden] = useState(false);
    const [dicePool, setDicePool] = useState<number[]>([]);
    const [isQuickDiceOpen, setIsQuickDiceOpen] = useState(false);

    // Sync active combatants with encounter data from server
    useEffect(() => {
        const es = encounterStatus as any;
        if (es && es.participants) {
            setActiveCombatants(es.participants);
        }
    }, [encounterStatus]);

    // Lore States (NPC & Notes)
    const [isNpcMenuOpen, setIsNpcMenuOpen] = useState(false);
    const [isNoteMenuOpen, setIsNoteMenuOpen] = useState(false);
    const [npcs, setNpcs] = useState<any[]>([]);
    const [leveledNpcs, setLeveledNpcs] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);

    // Item States
    const [items, setItems] = useState<any[]>([]);
    const [isItemBookOpen, setIsItemBookOpen] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState("");
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [priceToSet, setPriceToSet] = useState<number>(10);

    useEffect(() => {
        if (selectedItem) {
            const baseCost = selectedItem.cost?.quantity || parseInt(selectedItem.cost?.toString().replace(/\D/g, '') || '10');
            setPriceToSet(baseCost);
        }
    }, [selectedItem]);

    // Whisper State
    const [whisperPlayerName, setWhisperPlayerName] = useState<string | null>(null);
    const [whisperMessage, setWhisperMessage] = useState("");

    // Backstory State
    const [selectedPlayerLore, setSelectedPlayerLore] = useState<any | null>(null);

    // Medya Paylaşım State
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [gallery, setGallery] = useState<any[]>([]);

    // Shop (Dükkan) States
    const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
    const [shopItems, setShopItems] = useState<{ id: string, name: string, price: number, note: string }[]>([]);
    const [isShopPublished, setIsShopPublished] = useState(false);
    const [newShopItem, setNewShopItem] = useState({ name: '', price: 10, note: '' });

    // Party Vault / Shared Inventory States
    const [newPartyItemName, setNewPartyItemName] = useState("");
    const [newPartyItemQty, setNewPartyItemQty] = useState(1);
    const [newPartyItemNote, setNewPartyItemNote] = useState("");
    const [partyGoldInput, setPartyGoldInput] = useState("");

    // DM Level İzni İzleme (UI gösterimi için)
    const [levelPermEnabled, setLevelPermEnabled] = useState(false);

    // Edit Character States
    const [isEditCharModalOpen, setIsEditCharModalOpen] = useState(false);
    const [editingCharData, setEditingCharData] = useState<any>(null);
    const [selectedPlayerToGift, setSelectedPlayerToGift] = useState<string | null>(null);
    const [openConditionPickerId, setOpenConditionPickerId] = useState<string | null>(null);

    // NPC Sheet View State
    const [viewingNpcSheetData, setViewingNpcSheetData] = useState<any>(null);

    // New Features Modals
    const [isQuestMenuOpen, setIsQuestMenuOpen] = useState(false);
    const [isFactionMenuOpen, setIsFactionMenuOpen] = useState(false);
    const [isSessionNoteMenuOpen, setIsSessionNoteMenuOpen] = useState(false);

    // Grid Map States
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [mapData, setMapData] = useState<{
        bgUrl: string,
        gridSize: number,
        mapZoom: number,
        showGrid: boolean,
        tokens: any[]
    }>({
        bgUrl: '',
        gridSize: 50,
        mapZoom: 100,
        showGrid: true,
        tokens: []
    });
    const [isDraggingToken, setIsDraggingToken] = useState<string | null>(null);
    const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const addTokenToMap = (name: string, type: 'player' | 'monster', color: string = '#3b82f6', entityId?: string) => {
        const newToken = {
            id: `${type}-${entityId || 'custom'}-${Date.now()}`,
            name,
            type,
            color,
            x: 100,
            y: 100,
            entityId
        };
        const newMap = { ...mapData, tokens: [...(mapData.tokens || []), newToken] };
        setMapData(newMap);
        socket?.emit('update_map', { campaignId, mapData: newMap });
        showToast("Token Eklendi", `${name} haritaya eklendi.`, "bg-blue-900 border-blue-500 text-blue-100");
    };

    // Pet / Companion States
    const [isPetModalOpen, setIsPetModalOpen] = useState(false);
    const [targetPetPlayerId, setTargetPetPlayerId] = useState("");
    const [newPet, setNewPet] = useState({ name: '', hp: 10, maxHp: 10, ac: 10, type: '', notes: '' });

    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isPartyStatusOpen, setIsPartyStatusOpen] = useState(false);

    const toggleLevelPermission = (grant: boolean) => {
        if (!socket) return;
        socket.emit('grant_level_permission', { campaignId, granted: grant });
        setLevelPermEnabled(grant);
    };

    const fetchAllUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            setAllUsers(res.data);
            setIsUserManagementOpen(true);
        } catch (error) {
            showToast("Hata", "Kullanıcılar çekilemedi", "bg-red-900 border-red-500 text-red-100");
        }
    };

    const handleResetPassword = async (targetUserId: string, username: string) => {
        const newPass = await prompt({
            title: "Şifre Sıfırla",
            message: `${username} için yeni şifreyi girin:`,
            defaultValue: "123456",
            confirmText: "Şifreyi Güncelle",
            cancelText: "İptal"
        });
        if (!newPass) return;

        try {
            await axios.post(`${API_URL}/api/admin/reset-password`, { targetUserId, newPassword: newPass }, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast("Başarılı", "Şifre güncellendi", "bg-green-900 border-green-500 text-green-100");
        } catch (error) {
            showToast("Hata", "Şifre sıfırlanamadı", "bg-red-900 border-red-500 text-red-100");
        }
    };

    const handleRenameUser = async (targetUserId: string, oldName: string) => {
        const newName = await prompt({
            title: "Kullanıcı Adı Değiştir",
            message: `"${oldName}" kullanıcısının yeni adını girin:`,
            defaultValue: oldName,
            confirmText: "İsmi Güncelle",
            cancelText: "İptal"
        });
        if (!newName || newName === oldName) return;

        try {
            await axios.put(`${API_URL}/api/admin/users/${targetUserId}`, { newUsername: newName }, { headers: { 'Authorization': `Bearer ${token}` } });
            setAllUsers(allUsers.map(u => u._id === targetUserId ? { ...u, username: newName } : u));
            showToast("Başarılı", "Kullanıcı adı güncellendi", "bg-green-900 border-green-500 text-green-100");
        } catch (error: any) {
            await alert({
                title: "Hata",
                message: error.response?.data?.error || "Kullanıcı adı değiştirilemedi",
                severity: "danger"
            });
        }
    };

    const handleDeleteUser = async (targetUserId: string, username: string) => {
        const ok = await confirm({
            title: "Kullanıcıyı Sil",
            message: `"${username}" kullanıcısını tamamen silmek istediğine emin misin? Bu işlem geri alınamaz!`,
            confirmText: "Kullanıcıyı Sil",
            cancelText: "Vazgeç",
            severity: "danger"
        });
        if (!ok) return;

        try {
            await axios.delete(`${API_URL}/api/admin/users/${targetUserId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setAllUsers(allUsers.filter(u => u._id !== targetUserId));
            showToast("Başarılı", "Kullanıcı silindi", "bg-red-900 border-red-500 text-red-100");
        } catch (error: any) {
            await alert({
                title: "Hata",
                message: error.response?.data?.error || "Kullanıcı silinemedi",
                severity: "danger"
            });
        }
    };

    // Veritabanından canavarları ve galeriyi çek
    useEffect(() => {
        setHasMounted(true);
        if (!campaignId) return; // campaignId henüz hazır değilse işlem yapma

        // Context token'ı bazen geç yüklenebiliyor, localStorage'dan yedek alalım
        const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        if (!activeToken) return;

        const fetchMonsters = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/monsters`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
                setMonsters(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Canavarlar çekilemedi:", error instanceof Error ? error.message : String(error));
            }
        };
        const fetchItems = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/items`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
                console.log(`Fetched ${res.data?.length || 0} items`);
                setItems(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Eşyalar çekilemedi:", error instanceof Error ? error.message : String(error));
            }
        };
        const fetchGallery = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/campaigns/${campaignId}/media`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
                setGallery(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Galeri çekilemedi:", error instanceof Error ? error.message : String(error));
            }
        };
        const fetchLore = async () => {
            try {
                const npcRes = await axios.get(`${API_URL}/api/campaigns/${campaignId}/npcs`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
                setNpcs(npcRes.data);
                const leveledNpcRes = await axios.get(`${API_URL}/api/characters/npcs/${campaignId}`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
                setLeveledNpcs(leveledNpcRes.data);
                const noteRes = await axios.get(`${API_URL}/api/campaigns/${campaignId}/notes`, { headers: { 'Authorization': `Bearer ${activeToken}` } });
                setNotes(noteRes.data);
            } catch (error) {
                console.error("Lore API hatası:", error instanceof Error ? error.message : String(error));
            }
        };

        fetchMonsters();
        fetchItems();
        fetchGallery();
        fetchLore();
    }, [campaignId, token]);

    // OYUNU KAYDET VE YÜKLE (BACKUP & RESTORE)
    // Whisper History Ref for auto-scroll
    const chatEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (whisperPlayerName) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [whisperPlayerName, whisperHistory]);

    const handleExportCampaign = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/campaigns/${campaignId}/export`, { headers: { 'Authorization': `Bearer ${token}` } });
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `DND_Save_${campaignId}_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            showToast("Oyun Kaydedildi", "Campaign yedeği bilgisayarına indirildi.", "bg-green-900 border-green-500 text-green-100");
        } catch (error) {
            console.error("Export failed:", error);
            showToast("Hata", "Oyun kaydedilemedi.", "bg-red-900 border-red-500 text-red-100");
        }
    };

    const handleImportCampaign = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target?.result as string);
                await axios.post(`${API_URL}/api/campaigns/${campaignId}/import`, jsonData, { headers: { 'Authorization': `Bearer ${token}` } });
                showToast("Oyun Yüklendi!", "Campaign yedeği başarıyla geri yüklendi. Sayfa yenileniyor...", "bg-blue-900 border-blue-500 text-blue-100");
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error("Import failed:", error);
                showToast("Hata", "Yedek dosyası bozuk veya yüklenemedi.", "bg-red-900 border-red-500 text-red-100");
            }
        };
        reader.readAsText(file);
    };

    // Savaş alanına yaratık ekle
    const addMonsterToEncounter = (e: React.MouseEvent, monster: any) => {
        if (!monster) return;
        e.stopPropagation(); // Satırın açılıp kapanmasını engelle
        const hpValue = monster.hp ? parseInt((monster.hp || '10').toString().split(' ')[0]) || 10 : 10;
        const acValue = monster.ac ? (monster.ac || '10').toString().split(' ')[0] : '10';
        const dexValue = monster.stats ? (parseInt(monster.stats.toString().split?.(',')?.[1]?.trim() || "10") || 10) : 10;

        const newCombatant = {
            ...monster,
            id: `${monster._id}-${Date.now()}`,
            name: monster.name || 'Bilinmeyen Canavar',
            maxHp: hpValue,
            currentHp: hpValue,
            ac: acValue,
            initiative: Math.floor(Math.random() * 20) + 1 + Math.floor((dexValue - 10) / 2) || 10
        };

        const updatedCombatants = [...activeCombatants, newCombatant].sort((a, b) => b.initiative - a.initiative);
        setActiveCombatants(updatedCombatants);
        syncEncounter(updatedCombatants);

        // Modal'ı kapat
        setIsMonsterBookOpen(false);
    };

    // HP Güncellemesi ve Senkronizasyon
    const updateMonsterHp = (id: string, newHp: number) => {
        const updated = activeCombatants.map(c => c.id === id ? { ...c, currentHp: Math.max(0, newHp) } : c);
        setActiveCombatants(updated);
        syncEncounter(updated);
    };

    const syncEncounter = (data: any[]) => {
        if (socket) {
            socket.emit('update_encounter', { campaignId, encounterData: data });
        }
    };

    const updateCombatantInitiative = (id: string, value: number) => {
        const updated = activeCombatants.map(c => c.id === id ? { ...c, initiative: value } : c)
            .sort((a, b) => b.initiative - a.initiative);
        setActiveCombatants(updated);
        syncEncounter(updated);
    };

    const addPlayerToEncounter = (playerName: string) => {
        const stats = partyStats as any;
        const pStats = stats[playerName];
        if (!pStats) return;

        // Check if already in encounter
        if (activeCombatants.find(c => c.name === playerName)) return;

        const newCombatant = {
            id: `player-${playerName}-${Date.now()}`,
            name: playerName,
            maxHp: pStats.maxHp || 10,
            currentHp: pStats.hp || 10,
            ac: pStats.ac || 10,
            initiative: 10, // Default base
            _isPlayer: true
        };

        const updated = [...activeCombatants, newCombatant].sort((a, b) => b.initiative - a.initiative);
        setActiveCombatants(updated);
        syncEncounter(updated);
    };

    // DM Zarı At
    const rollDMDice = (sides: number) => {
        const roll = Math.floor(Math.random() * sides) + 1;
        if (socket) {
            socket.emit('roll_dice', {
                campaignId,
                id: Math.random().toString(36).substring(7),
                playerName: 'Dungeon Master',
                rollResult: roll,
                type: `d${sides}`,
                isHidden: isRollHidden
            });
        }
        setIsDiceMenuOpen(false); // Zarı attıktan sonra menüyü kapat
    };

    const handlePoolRoll = () => {
        if (dicePool.length === 0) return;
        
        const results = dicePool.map(sides => ({
            sides,
            result: Math.floor(Math.random() * sides) + 1
        }));
        const total = results.reduce((sum, r) => sum + r.result, 0);
        const typeStr = dicePool.length > 5 
            ? `${dicePool.length} Zarlar` 
            : dicePool.map(s => `d${s}`).join(' + ');

        if (socket) {
            socket.emit('roll_dice', {
                campaignId,
                id: Math.random().toString(36).substring(7),
                playerName: 'Dungeon Master',
                rollResult: total,
                type: typeStr,
                isHidden: isRollHidden,
                poolResults: results
            });
        }
        setDicePool([]);
        setIsQuickDiceOpen(false);
        showToast("Zarlar Atıldı", `${typeStr} = ${total}`, isRollHidden ? "bg-purple-900 border-purple-500 text-purple-100" : "bg-red-900 border-red-500 text-red-100");
    };

    const getDiceIcon = (sides: number) => {
        const baseClass = "w-6 h-6 stroke-current fill-none";
        switch (sides) {
            case 4: return (
                <svg viewBox="0 0 24 24" className={baseClass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l9 16H3L12 3z" />
                    <path d="M12 3v16M3 19l9-8 9 8" className="opacity-40" />
                </svg>
            );
            case 6: return (
                <svg viewBox="0 0 24 24" className={baseClass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M3 3l18 18M3 21L21 3" className="opacity-40" />
                </svg>
            );
            case 8: return (
                <svg viewBox="0 0 24 24" className={baseClass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L4 12l8 10 8-10-8-10z" />
                    <path d="M4 12h16M12 2v20" className="opacity-40" />
                </svg>
            );
            case 10: return (
                <svg viewBox="0 0 24 24" className={baseClass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L3 12l9 10 9-10-9-10z" />
                    <path d="M12 2l-3 10 3 10 3-10-3-10zM3 12h18" className="opacity-40" />
                </svg>
            );
            case 12: return (
                <svg viewBox="0 0 24 24" className={baseClass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l9 6v8l-9 6-9-6V8l9-6z" />
                    <path d="M12 2l3 6 6 0-3 6 3 6-6 0-3 6-3-6-6 0 3-6-3-6 6 0 3-6z" className="opacity-40 scale-[0.6] origin-center" />
                </svg>
            );
            case 20: return (
                <svg viewBox="0 0 24 24" className={baseClass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l10 5.5v11L12 22l-10-5.5v-11L12 2z" />
                    <path d="M12 2v20M2 7.5l10 4.5 10-4.5M2 18.5l10-4.5 10 4.5" className="opacity-40" />
                </svg>
            );
            case 100: return (
                <svg viewBox="0 0 24 24" className={baseClass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" className="opacity-40" />
                </svg>
            );
            default: return <span>d{sides}</span>;
        }
    };

    // Fısıltı (Whisper) Gönder
    const sendWhisper = () => {
        if (!whisperPlayerName || !whisperMessage.trim() || !socket) return;
        socket.emit('whisper_player', {
            campaignId,
            targetPlayerName: whisperPlayerName,
            message: whisperMessage,
            senderName: 'DM'
        });
        setWhisperMessage("");
        setWhisperPlayerName(null);
        showToast('Mesaj İletildi', `${whisperPlayerName} için fısıltı gönderildi.`, 'bg-purple-900 border-purple-500 text-purple-100');
    };

    // Medya Yükle
    const uploadMedia = async (type: "image" | "link") => {
        if (type === 'image' && !mediaFile && !mediaUrl) return;
        if (type === 'link' && !mediaUrl) return;

        const formData = new FormData();
        formData.append('type', type);

        if (type === 'image' && mediaFile) {
            formData.append('file', mediaFile);
        } else {
            formData.append('url', mediaUrl);
        }

        try {
            const res = await axios.post(`${API_URL}/api/campaigns/${campaignId}/media`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setGallery([res.data, ...gallery]);

            if (socket) {
                // Sadece yeni bir medya eklendiğini haber ver
                socket.emit('share_media', { campaignId, url: '', type: 'refresh' });
            }

            setMediaFile(null);
            setMediaUrl("");
        } catch (error) {
            console.error(error);
            await alert({
                title: "Medya Hatası",
                message: "Medya yüklenirken hata oluştu.",
                severity: "danger"
            });
        }
    };

    // Medya Sil
    const deleteMedia = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/media/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setGallery(gallery.filter(m => m._id !== id));
            if (socket) {
                socket.emit('share_media', { campaignId, url: '', type: 'refresh' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- LORE ACTIONS (NPC) ---
    const [newNpc, setNewNpc] = useState({ name: "", type: "Tüccar", relationship: "Nötr", details: "" });
    const addNpc = async () => {
        if (!newNpc.name.trim()) return;
        try {
            const res = await axios.post(`${API_URL}/api/campaigns/${campaignId}/npcs`, newNpc, { headers: { 'Authorization': `Bearer ${token}` } });
            setNpcs([res.data, ...npcs]);
            setNewNpc({ name: "", type: "Tüccar", relationship: "Nötr", details: "" });
        } catch (error) {
            console.error("NPC Eklenemedi:", error);
        }
    };
    const deleteNpc = async (id: string) => {
        const ok = await confirm({
            title: "NPC Sil",
            message: "Bu NPC'yi silmek istediğine emin misin?",
            confirmText: "NPC'yi Sil",
            severity: "warning"
        });
        if (!ok) return;
        try {
            await axios.delete(`${API_URL}/api/npcs/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setNpcs(npcs.filter(n => n._id !== id));
        } catch (error) {
            console.error("NPC Silinemedi:", error);
        }
    };

    const deleteCharacter = async (id: string, name: string) => {
        const ok = await confirm({
            title: "Karakter Sil",
            message: `"${name}" karakterini silmek istediğine emin misin? Bu işlem geri alınamaz.`,
            confirmText: "Karakteri Sil",
            severity: "danger"
        });
        if (!ok) return;
        try {
            await axios.delete(`${API_URL}/api/characters/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast("Karakter Silindi", `"${name}" karakteri başarıyla silindi. Sayfayı yenileyebilirsiniz.`, "bg-red-900 border-red-500 text-red-100");
        } catch (error) {
            console.error("Karakter Silinemedi:", error);
            await alert({
                title: "Karakter Hatası",
                message: "Karakter silinirken bir hata oluştu.",
                severity: "danger"
            });
        }
    };

    // --- LORE ACTIONS (NOTES) ---
    const [newNote, setNewNote] = useState({ title: "", content: "", color: "yellow" });
    const addNote = async () => {
        if (!newNote.title.trim()) return;
        try {
            const res = await axios.post(`${API_URL}/api/campaigns/${campaignId}/notes`, newNote, { headers: { 'Authorization': `Bearer ${token}` } });
            setNotes([res.data, ...notes]);
            setNewNote({ title: "", content: "", color: "yellow" });
        } catch (error) {
            console.error("Not Eklenemedi:", error);
        }
    };
    const deleteNote = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/notes/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setNotes(notes.filter(n => n._id !== id));
        } catch (error) {
            console.error("Not Silinemedi:", error);
        }
    };

    // Durum Ekleme Fonksiyonu
    const assignCondition = async (charIdDb: string, charName: string, condition: string, currentConds: string[]) => {
        if (!condition) return;
        const toggle = currentConds.includes(condition)
            ? currentConds.filter(c => c !== condition)
            : [...currentConds, condition];

        try {
            await axios.put(`${API_URL}/api/characters/${charIdDb}`, { conditions: toggle }, { headers: { 'Authorization': `Bearer ${token}` } });
            if (socket) {
                socket.emit('update_character_stat', { campaignId, characterId: charName, stat: 'conditions', value: toggle });
                socket.emit('update_character_stat', { campaignId, characterId: charIdDb, stat: 'conditions', value: toggle });
            }
        } catch (e) { console.error("Durum eklenemedi:", e); }
    };

    // Dükkan Fonksiyonları
    const addShopItem = () => {
        if (!newShopItem.name.trim()) return;
        setShopItems([...shopItems, { ...newShopItem, id: Date.now().toString() }]);
        setNewShopItem({ name: '', price: 10, note: '' });
        // Eğer dükkan yayındaysa anında güncelleme yollayabiliriz, ancak DM'nin explicitly "Kapat/Aç" yapması daha kontrollü olabilir.
        if (isShopPublished && socket) {
            socket.emit('publish_shop', { campaignId, shopItems: [...shopItems, { ...newShopItem, id: Date.now().toString() }], isPublished: true });
        }
    };

    const removeShopItem = (id: string) => {
        const updatedItems = shopItems.filter(i => i.id !== id);
        setShopItems(updatedItems);
        if (isShopPublished && socket) {
            socket.emit('publish_shop', { campaignId, shopItems: updatedItems, isPublished: true });
        }
    };

    const toggleShopPublish = (publish: boolean, targetPlayerId: string = 'all') => {
        if (!socket) return;
        setIsShopPublished(publish);
        socket.emit('publish_shop', { campaignId, targetPlayerId, shopItems: publish ? shopItems : [], isPublished: publish });
        if (publish) {
            showToast("Dükkan Gönderildi", targetPlayerId === 'all' ? "Tüm oyunculara dükkan gönderildi." : "Dükkan seçili oyuncuya gönderildi.", "bg-orange-900 border-orange-500 text-orange-100");
        } else {
            showToast("Dükkan Kapandı", "Tüm oyuncularda dükkan kapatıldı.", "bg-gray-800 text-gray-300");
        }
    };

    // Karakter Düzenleme (Edit) Fonksiyonları
    const openEditCharModal = async (charIdDb: string) => {
        try {
            const res = await axios.get(`${API_URL}/api/characters/${charIdDb}`, { headers: { 'Authorization': `Bearer ${token}` } });
            // Fallback stats values in case it is absent
            const cData = res.data;
            if (!cData.stats) cData.stats = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
            setEditingCharData(cData);
            setIsEditCharModalOpen(true);
        } catch (error) {
            console.error("Karakter verisi alınamadı", error);
            await alert({
                title: "Hata",
                message: "Karakter detayı alınamadı!",
                severity: "danger"
            });
        }
    };

    const saveEditedChar = async () => {
        if (!editingCharData) return;
        try {
            await axios.put(`${API_URL}/api/characters/${editingCharData._id}`, {
                stats: editingCharData.stats,
                ac: editingCharData.ac,
                maxHp: editingCharData.maxHp,
                speed: editingCharData.speed,
                level: editingCharData.level,
                dmNotes: editingCharData.dmNotes
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            if (socket) {
                // Broadcast to update the player immediately
                socket.emit('update_character_stat', { campaignId, characterId: editingCharData.name, stat: 'stats', value: editingCharData.stats });
                socket.emit('update_character_stat', { campaignId, characterId: editingCharData.name, stat: 'ac', value: editingCharData.ac });
                socket.emit('update_character_stat', { campaignId, characterId: editingCharData.name, stat: 'maxHp', value: editingCharData.maxHp });
                socket.emit('update_character_stat', { campaignId, characterId: editingCharData.name, stat: 'speed', value: editingCharData.speed });
                socket.emit('update_character_stat', { campaignId, characterId: editingCharData.name, stat: 'level', value: editingCharData.level });

                // Fallback direct id emits
                socket.emit('update_character_stat', { campaignId, characterId: editingCharData._id, stat: 'stats', value: editingCharData.stats });
            }
            setIsEditCharModalOpen(false);
            setEditingCharData(null);
            await alert({
                title: "Başarılı",
                message: "Karakter güncellendi! Oyuncunun ekranına yansıdı.",
                severity: "success"
            });
        } catch (error) {
            console.error("Karakter kaydedilemedi", error);
            await alert({
                title: "Hata",
                message: "Karakter veri tabanına kaydedilemedi!",
                severity: "danger"
            });
        }
    };

    const addPartyItem = () => {
        if (!newPartyItemName.trim()) return;
        const inv: any[] = [...((partyInventory as any[]) || [])];
        const searchName = newPartyItemName.trim().toLowerCase();
        const existingIdx = inv.findIndex((i: any) => i.name.toLowerCase() === searchName);
        
        if (existingIdx >= 0) {
            inv[existingIdx] = { ...inv[existingIdx], qty: (inv[existingIdx].qty || 1) + (newPartyItemQty || 1) };
        } else {
            inv.push({ name: newPartyItemName.trim(), qty: newPartyItemQty || 1, note: newPartyItemNote });
        }
        if (socket) (socket as any).emit('update_party_inventory', { campaignId, inventory: inv });
        setNewPartyItemName("");
        setNewPartyItemQty(1);
        setNewPartyItemNote("");
        showToast('Ortak Kasaya Eklendi', `${newPartyItemName} parti kasasına kondu.`, 'bg-yellow-900 border-yellow-500 text-yellow-100');
    };

    const updatePartyItemQty = (index: number, delta: number) => {
        if (!socket) return;
        const inv: any[] = [...((partyInventory as any[]) || [])];
        const item = inv[index];
        const newQty = Math.max(0, (item.qty || 1) + delta);
        if (newQty <= 0) inv.splice(index, 1);
        else inv[index] = { ...item, qty: newQty };
        (socket as any).emit('update_party_inventory', { campaignId, inventory: inv });
    };

    const removePartyItem = (index: number) => {
        if (!socket) return;
        const inv: any[] = [...((partyInventory as any[]) || [])];
        inv.splice(index, 1);
        (socket as any).emit('update_party_inventory', { campaignId, inventory: inv });
        showToast('Ortak Kasadan Çıkarıldı', `Eşya kasadan silindi.`, 'bg-gray-800 border-gray-500 text-gray-300');
    };

    const handleUpdatePartyGold = (delta: 'add' | 'sub' | 'set') => {
        if (!socket) return;
        let amount = parseInt(partyGoldInput);
        if (isNaN(amount)) return;
        let newGold = partyGold || 0;
        if (delta === 'add') newGold += amount;
        else if (delta === 'sub') newGold = Math.max(0, newGold - amount);
        else if (delta === 'set') newGold = Math.max(0, amount);
        (socket as any).emit('update_party_gold', { campaignId, gold: newGold });
        setPartyGoldInput("");
        showToast('Altın Güncellendi', `Parti altını şu an: ${newGold} GP`, 'bg-yellow-900 border-yellow-500 text-yellow-100');
    };


    // Arama filtreleme
    const filteredMonsters = (monsters || []).filter(m =>
        m && (
            (m.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
            (m.challenge && m.challenge.toString().toLowerCase() === (searchTerm || "").toLowerCase())
        )
    ).slice(0, 100);

    const filteredItems = (items || []).filter(item =>
        item && (
            (item.name || "").toLowerCase().includes((itemSearchTerm || "").toLowerCase()) ||
            (item.name_tr || "").toLowerCase().includes((itemSearchTerm || "").toLowerCase()) ||
            (item.category || "").toLowerCase().includes((itemSearchTerm || "").toLowerCase()) ||
            (item.type || "").toLowerCase().includes((itemSearchTerm || "").toLowerCase())
        )
    ).slice(0, 100);

    if (!hasMounted) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-950 p-8 text-gray-100 font-sans relative">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                <header className="flex flex-col md:flex-row justify-between items-center bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 p-4 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(239,68,68,0.5)] mr-4 border border-red-500/50">
                            🐉
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Dungeon Yöneticisi</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">Aktif Oda: {campaignId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {/* DM Seviye İzni */}
                        <div className="flex items-center gap-2 bg-gray-950/60 border border-gray-700/50 rounded-xl px-3 py-1.5 shadow-inner">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Level İzni</span>
                            <button
                                onClick={() => toggleLevelPermission(true)}
                                className={`px-2 py-1 rounded-md text-[10px] uppercase font-black transition-all ${levelPermEnabled ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'hover:bg-green-900/30 text-gray-500'}`}
                            >✅ Aç</button>
                            <button
                                onClick={() => toggleLevelPermission(false)}
                                className={`px-2 py-1 rounded-md text-[10px] uppercase font-black transition-all ${!levelPermEnabled ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'hover:bg-red-900/30 text-gray-500'}`}
                            >🔒 Kapat</button>
                        </div>

                        <div className="h-8 w-px bg-gray-700/50 mx-1 hidden md:block"></div>

                        <button onClick={() => setIsPartyStatusOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-yellow-900/80 to-yellow-800/80 hover:from-yellow-800 hover:to-yellow-700 text-yellow-100 text-sm font-bold py-2 px-5 rounded-xl border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all">
                            🛡️ <span className="hidden xl:inline">Parti Durumu</span>
                        </button>
                        <button onClick={() => setIsGalleryOpen(true)} className="flex items-center gap-2 bg-gray-800/60 hover:bg-blue-900/40 text-gray-200 hover:text-blue-400 text-sm font-bold py-2 px-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all shadow-sm">
                            🖼️ <span className="hidden xl:inline">Medya Galerisi</span> {gallery.length > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{gallery.length}</span>}
                        </button>
                        <button onClick={() => setIsNpcMenuOpen(true)} className="flex items-center gap-2 bg-gray-800/60 hover:bg-emerald-900/40 text-gray-200 hover:text-emerald-400 text-sm font-bold py-2 px-4 rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-all shadow-sm">
                            🤝 <span className="hidden xl:inline">NPC Ağı</span>
                        </button>
                        <button onClick={() => setIsNoteMenuOpen(true)} className="flex items-center gap-2 bg-gray-800/60 hover:bg-yellow-900/40 text-gray-200 hover:text-yellow-400 text-sm font-bold py-2 px-4 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-all shadow-sm">
                            📝 <span className="hidden xl:inline">Notlar</span>
                        </button>
                        <button onClick={() => setIsShopMenuOpen(true)} className="flex items-center gap-2 bg-gray-800/60 hover:bg-orange-900/40 text-gray-200 hover:text-orange-400 text-sm font-bold py-2 px-4 rounded-xl border border-gray-700/50 hover:border-orange-500/50 transition-all shadow-sm">
                            🏬 <span className="hidden xl:inline">Dükkan / Tüccar</span>
                        </button>
                        <button onClick={() => setIsMapOpen(true)} className="flex items-center gap-2 bg-gray-800/60 hover:bg-red-900/40 text-gray-200 hover:text-red-400 text-sm font-bold py-2 px-4 rounded-xl border border-gray-700/50 hover:border-red-500/50 transition-all shadow-sm">
                            🗺️ <span className="hidden xl:inline">Stratejik Harita</span>
                        </button>
                        <button onClick={() => setIsQuestMenuOpen(true)} className="flex items-center gap-2 bg-gray-800/60 hover:bg-emerald-900/40 text-gray-200 hover:text-emerald-400 text-sm font-bold py-2 px-4 rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-all shadow-sm">
                            📜 <span className="hidden xl:inline">Görev Takibi</span> {quests?.length > 0 && <span className="bg-emerald-600/50 border border-emerald-500/30 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded-full">{quests.length}</span>}
                        </button>
                        <button onClick={() => setIsFactionMenuOpen(true)} className="flex items-center gap-2 bg-gray-800/60 hover:bg-indigo-900/40 text-gray-200 hover:text-indigo-400 text-sm font-bold py-2 px-4 rounded-xl border border-gray-700/50 hover:border-indigo-500/50 transition-all shadow-sm">
                            🚩 <span className="hidden xl:inline">Fraksiyonlar</span>
                        </button>
                        <button onClick={() => setIsSessionNoteMenuOpen(true)} className="flex items-center gap-2 bg-gray-800/60 hover:bg-amber-900/40 text-gray-200 hover:text-amber-400 text-sm font-bold py-2 px-4 rounded-xl border border-gray-700/50 hover:border-amber-500/50 transition-all shadow-sm">
                            ✍️ <span className="hidden xl:inline">Oturum Notları</span>
                        </button>
                        <button onClick={() => setIsMonsterBookOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-900/80 to-purple-800/80 hover:from-purple-800 hover:to-purple-700 text-purple-100 text-sm font-bold py-2 px-5 rounded-xl border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                            📖 <span className="hidden lg:inline">Canavar Kitabı</span>
                        </button>
                        <button onClick={() => setIsItemBookOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-900/80 to-blue-800/80 hover:from-blue-800 hover:to-blue-700 text-blue-100 text-sm font-bold py-2 px-5 rounded-xl border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                            ⚔️ <span className="hidden lg:inline">Eşya Kitabı</span>
                        </button>
                    </div>
                </header>

                {/* DM Controls Row */}
                <div className="flex justify-end gap-3 animate-fade-in-up mt-2 pr-2">
                    <button
                        onClick={async () => {
                            const ok = await confirm({
                                title: "Veritabanını Güncelle",
                                message: "Ana veritabanı (itemlar, canavarlar, spelller vb.) yerel dosyalardan güncellenecek. Bu işlem yaklaşık 3-5 dakika sürebilir ve mevcut özel verileri etkilemez. Devam edilsin mi?",
                                confirmText: "Güncellemeyi Başlat",
                                cancelText: "Vazgeç"
                            });
                            if (!ok) return;

                            showToast("Veritabanı", "Güncelleme başlatıldı, lütfen bekleyin...", "bg-blue-900 border-blue-500 text-blue-100");
                            try {
                                const res = await axios.post(`${API_URL}/api/admin/seed`, {}, { headers: { 'Authorization': `Bearer ${token}` }, timeout: 360000 });
                                showToast("Başarılı", res.data.message || "Veritabanı başarıyla güncellendi!", "bg-green-900 border-green-500 text-green-100");
                                setTimeout(() => window.location.reload(), 2000);
                            } catch (err: any) {
                                console.error(err);
                                await alert({
                                    title: "Güncelleme Hatası",
                                    message: "Güncelleme sırasında bir hata oluştu: " + (err.response?.data?.error || err.message),
                                    severity: "danger"
                                });
                            }
                        }}
                        className="bg-purple-900/60 hover:bg-purple-700/80 text-purple-100 text-xs font-bold py-1.5 px-3 rounded-lg border border-purple-500/50 shadow-sm transition-all flex items-center gap-1"
                        title="Tüm referans verilerini (Eşya/Canavar vb.) yeniden yükle"
                    >
                        ⚡ Veritabanını Güncelle (Seed)
                    </button>

                    <button
                        onClick={handleExportCampaign}
                        className="bg-green-900/60 hover:bg-green-700/80 text-green-100 text-xs font-bold py-1.5 px-3 rounded-lg border border-green-500/50 shadow-sm transition-all flex items-center gap-1"
                        title="Tüm Karakterleri, NPCleri ve Notları İndir"
                    >
                        💾 Oyunu Kaydet (İndir)
                    </button>

                    <label className="bg-blue-900/60 hover:bg-blue-700/80 text-blue-100 text-xs font-bold py-1.5 px-3 rounded-lg border border-blue-500/50 shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        title="Önceden indirdiğin bir kaydı geri yükle"
                    >
                        <span>📂 Oyunu Yükle (Import)</span>
                        <input type="file" accept=".json" onChange={handleImportCampaign} className="hidden" />
                    </label>

                    {user?.username === 'SystemAdmin' && (
                        <button
                            onClick={fetchAllUsers}
                            className="bg-red-950/60 hover:bg-red-800/80 text-red-200 text-xs font-black py-1.5 px-3 rounded-lg border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all flex items-center gap-1"
                            title="Tüm kullanıcıları yönet (Rename/Delete/Reset)"
                        >
                            👥 Kullanıcı Yönetimi
                        </button>
                    )}
                </div>


                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Savaş/Encounter Paneli */}
                    <section className="xl:col-span-2 bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col h-[75vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-red-500 flex items-center gap-2 tracking-wide">
                                <span className="bg-red-900/40 px-2 py-1 rounded-lg border border-red-500/30">⚔️</span> Aktif Savaş Çizelgesi
                            </h2>
                            <div className="flex gap-2">
                                <select 
                                    className="bg-gray-800 border border-gray-700 text-xs rounded px-2 py-1 outline-none focus:border-red-500"
                                    onChange={(e) => {
                                        if (e.target.value) addPlayerToEncounter(e.target.value);
                                        e.target.value = "";
                                    }}
                                >
                                    <option value="">+ Karakter Ekle</option>
                                    {Object.keys(partyStats || {}).map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={() => {
                                        const updated = [...activeCombatants].sort((a, b) => b.initiative - a.initiative);
                                        setActiveCombatants(updated);
                                        syncEncounter(updated);
                                    }}
                                    className="bg-gray-800 border border-gray-700 text-[10px] font-bold px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                                >
                                    🔄 Sırala
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {activeCombatants.length === 0 ? (
                                <div className="text-gray-500 italic text-center py-12">Sahada düşman yok. Sağ üstten Canavar Kitabını açıp yaratık ekleyin.</div>
                            ) : (
                                activeCombatants.map((monster, index) => (
                                    <div
                                        key={monster.id}
                                        className={`bg-gray-800 rounded-lg border-l-4 shadow-md group cursor-pointer transition-all hover:bg-gray-700 ${monster.currentHp <= 0 ? 'opacity-50 grayscale contrast-75 border-gray-600' : (monster._isPlayer ? 'border-blue-500' : monster._isLeveledNpc
                                            ? monster._relationship === 'Dost' ? 'border-emerald-500' : monster._relationship === 'Düşman' ? 'border-red-500' : 'border-yellow-500'
                                            : 'border-red-500')
                                            }`}
                                        onClick={() => {
                                            if (monster._isLeveledNpc) {
                                                axios.get(`${API_URL}/api/characters/${monster._npcId}`, { headers: { 'Authorization': `Bearer ${token}` } })
                                                    .then(res => setViewingNpcSheetData(res.data))
                                                    .catch(err => console.error("Sheet Error:", err));
                                            } else {
                                                setExpandedCombatantId(expandedCombatantId === monster.id ? null : monster.id);
                                            }
                                        }}
                                    >
                                        <div className="p-4 flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-gray-900 px-1 py-1 rounded text-yellow-500 font-black border border-gray-700 w-14 text-center" onClick={e => e.stopPropagation()}>
                                                    <input 
                                                        type="number" 
                                                        value={monster.initiative} 
                                                        onChange={(e) => updateCombatantInitiative(monster.id, parseInt(e.target.value) || 0)}
                                                        className="w-full bg-transparent text-center outline-none focus:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">
                                                            {monster._isPlayer && <span className="mr-2">👤</span>}
                                                            {monster.name}
                                                        </div>
                                                        {monster._isLeveledNpc && (
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${monster._relationship === 'Dost' ? 'bg-emerald-700 text-emerald-100' :
                                                                monster._relationship === 'Düşman' ? 'bg-red-700 text-red-100' :
                                                                    'bg-yellow-700 text-yellow-100'
                                                                }`}>{monster._relationship === 'Dost' ? '🟩' : monster._relationship === 'Düşman' ? '🟥' : '🟨'} {monster._relationship || 'Nötr'}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Armor Class: <span className="text-blue-400 font-bold">{monster.ac}</span></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="text-right mr-4">
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Hit Points</div>
                                                    <div className="font-mono text-xl">
                                                        {monster.currentHp <= 0 ? (
                                                            <span className="text-gray-400 font-black animate-pulse">💀 ÖLDÜ</span>
                                                        ) : (
                                                            <>
                                                                <span className={monster.currentHp <= monster.maxHp / 3 ? "text-red-500 font-bold" : "text-green-400 font-bold"}>{monster.currentHp}</span>
                                                                <span className="text-gray-500"> / {monster.maxHp}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => addTokenToMap(monster.name, 'monster', '#ef4444', monster.id)}
                                                        className="w-8 h-8 bg-gray-700 hover:bg-blue-600 rounded text-blue-200 hover:text-white font-bold transition-all flex items-center justify-center border border-gray-600"
                                                        title="Haritaya Ekle"
                                                    >
                                                        🗺️
                                                    </button>
                                                    <button onClick={() => updateMonsterHp(monster.id, monster.currentHp - 1)} className="w-8 h-8 bg-red-900/50 hover:bg-red-700 rounded text-red-200 font-bold transition-colors">-1</button>
                                                    <button onClick={() => updateMonsterHp(monster.id, monster.currentHp - 5)} className="w-8 h-8 bg-red-900/80 hover:bg-red-700 rounded text-red-200 font-bold transition-colors">-5</button>
                                                    <button onClick={() => updateMonsterHp(monster.id, Math.min(monster.maxHp, monster.currentHp + 1))} className="w-8 h-8 bg-green-900/50 hover:bg-green-700 rounded text-green-200 font-bold transition-colors">+1</button>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const updated = activeCombatants.filter(c => c.id !== monster.id);
                                                        setActiveCombatants(updated);
                                                        syncEncounter(updated);
                                                    }}
                                                    className="ml-4 text-gray-600 hover:text-red-500 transition-colors"
                                                    title="Savaştan Sil"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>

                                        {expandedCombatantId === monster.id && (
                                            <div className="p-4 bg-gray-900 border-t border-gray-700 text-sm space-y-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="text-gray-300">
                                                    <strong>Armor Class:</strong> {monster.ac} <br />
                                                    <strong>Hit Points:</strong> {monster.maxHp} (Max) <br />
                                                    <strong>Speed:</strong> {monster.speed || "-"} <br />
                                                    <strong>Stats:</strong> <span className="text-yellow-400">{monster.stats || "-"}</span>
                                                </div>

                                                {monster.traits && monster.traits.length > 0 && (
                                                    <div>
                                                        <strong className="text-purple-400 text-base border-b border-gray-700 block mb-2">Traits</strong>
                                                        <ul className="space-y-2">
                                                            {monster.traits.map((trait: any, i: number) => (
                                                                <li key={i}><strong className="text-gray-200">{trait.name}.</strong> <span className="text-gray-400">{trait.desc}</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {monster.actions && monster.actions.length > 0 && (
                                                    <div>
                                                        <strong className="text-red-400 text-base border-b border-gray-700 block mb-2">Actions</strong>
                                                        <ul className="space-y-2">
                                                            {monster.actions.map((action: any, i: number) => (
                                                                <li key={i}><strong className="text-gray-200">{action.name}.</strong> <span className="text-gray-400">{action.desc}</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {monster.legendary && monster.legendary.length > 0 && (
                                                    <div>
                                                        <strong className="text-yellow-500 text-base border-b border-gray-700 block mb-2">Legendary Actions</strong>
                                                        <ul className="space-y-2">
                                                            {monster.legendary.map((action: any, i: number) => (
                                                                <li key={i}><strong className="text-gray-200">{action.name}.</strong> <span className="text-gray-400">{action.desc}</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Sağ Panel: Zar Kayıtları */}
                    <div className="space-y-6 flex flex-col h-[75vh]">
                        {/* Zar Kayıtları (Dice Logs - Persistent) */}
                        <section className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex-1 flex flex-col min-h-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4 flex items-center gap-2 tracking-wide relative z-10">
                                <span className="bg-red-900/40 px-2 py-1 rounded-lg border border-red-500/30 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L22 7.5V16.5L12 22L2 16.5V7.5L12 2Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
                                        <path d="M12 2L2 7.5L12 12L22 7.5L12 2Z" stroke="#fca5a5" strokeWidth="1" strokeLinejoin="round" />
                                        <path d="M2 16.5L12 12L22 16.5" stroke="#fca5a5" strokeWidth="0.5" opacity="0.6" />
                                        <path d="M12 2V12M12 22V12M2 7.5L12 12M22 7.5L12 12" stroke="#ef4444" strokeWidth="0.5" opacity="0.4" />
                                    </svg>
                                </span> Zar Kayıtları
                            </h2>
                            <div className="p-2 flex-1 flex flex-col overflow-y-auto space-y-3 font-mono text-xs leading-relaxed custom-scrollbar relative z-10">
                                {diceLogs && diceLogs.length === 0 ? (
                                    <div className="text-gray-500 italic text-center mt-10">Gizemli bir sessizlik... Henüz zar atılmadı.</div>
                                ) : (
                                    diceLogs?.map?.((log: any, i: number) => (
                                        <div key={log.id || i} className={`p-2.5 flex justify-between items-center rounded-xl border ${log.playerName === "Dungeon Master" ? "bg-purple-900/20 text-purple-300 font-bold border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]" : "bg-gray-800/40 text-gray-300 border-gray-700/50"}`}>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="truncate opacity-80">{log.playerName}:</div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-black ${log.playerName === "Dungeon Master" ? "text-purple-400" : "text-yellow-400"}`}>{log.rollResult}</span>
                                                    <span className="text-[10px] opacity-50">({log.type})</span>
                                                    {log.isHidden && <span className="text-[9px] bg-gray-900/80 border border-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full tracking-widest uppercase">👁️</span>}
                                                </div>
                                            </div>
                                            {log.isHidden && socket && (
                                                <button
                                                    onClick={() => socket.emit('reveal_dice', { campaignId, rollId: log.id })}
                                                    className="bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black py-1 px-2 rounded-lg shadow transition-colors shrink-0"
                                                >
                                                    AÇIKLA
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Floating DM Dice Roll Menu */}
                <div className="fixed bottom-8 left-8 z-[60] flex flex-col items-center">
                    {/* Premium Selection Menu */}
                    <div className={`flex flex-col-reverse items-center gap-5 mb-6 transition-all duration-500 origin-bottom ${isQuickDiceOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}`}>
                        {/* Pool Roll Button - Minimalist & Elegant */}
                        {dicePool.length > 0 && (
                            <button
                                onClick={handlePoolRoll}
                                className="group relative px-10 py-3 bg-gray-950/80 backdrop-blur-xl border border-red-500/40 text-red-50 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(239,68,68,0.1)] flex flex-col items-center justify-center transition-all hover:border-red-500 hover:bg-red-950/40 active:scale-95 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <span className="relative z-10 text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 group-hover:text-red-300 transition-colors mb-1">Zarları At</span>
                                <div className="relative z-10 flex items-baseline gap-2">
                                    <span className="text-xl font-black tracking-[0.15em] uppercase text-white group-hover:text-red-50 transition-colors">ROLL</span>
                                    <span className="text-sm font-bold text-red-500/80 group-hover:text-red-400 font-mono">({dicePool.length})</span>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500/0 group-hover:bg-red-500/40 transition-all overflow-hidden">
                                    <div className="h-full bg-white/40 animate-shimmer" style={{ width: '40%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}></div>
                                </div>
                            </button>
                        )}

                        {/* Dice Selection Grid */}
                        {/* Refined Dice Selection Menu - Obsidian & Ruby Theme */}
                        <div className="group/menu relative bg-gray-950/40 backdrop-blur-2xl border border-white/10 p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                            {/* Decorative Background Glow */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-600/10 rounded-full blur-3xl pointer-events-none group-hover/menu:bg-red-600/20 transition-all duration-700"></div>
                            
                            <div className="flex items-center justify-between px-1 mb-1">
                                <span className="text-[10px] font-black text-gray-500 tracking-[0.3em] uppercase">Zar Seti</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent mx-4"></div>
                                <button 
                                    onClick={() => setDicePool([])}
                                    disabled={dicePool.length === 0}
                                    className="text-[9px] font-black text-red-500/60 hover:text-red-400 disabled:opacity-0 transition-all uppercase tracking-widest flex items-center gap-1.5"
                                >
                                    <span>TEMİZLE</span>
                                    <span className="text-xs">×</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[20, 100, 12, 10, 8, 6, 4].map((sides, idx) => {
                                    const count = dicePool.filter(s => s === sides).length;
                                    const isD20 = sides === 20;
                                    return (
                                        <button
                                            key={sides}
                                            onClick={() => setDicePool([...dicePool, sides])}
                                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group border relative overflow-visible shadow-lg ${
                                                isD20 
                                                ? 'bg-red-950/20 border-red-500/20 hover:border-red-500/50 hover:bg-red-900/40' 
                                                : 'bg-gray-900/40 border-white/5 hover:border-white/20 hover:bg-gray-800/60'
                                            }`}
                                            style={{ transitionDelay: `${idx * 40}ms` }}
                                        >
                                            <div className={`transition-all duration-500 transform group-hover:scale-110 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                                                isD20 ? 'text-red-500 group-hover:text-red-400' : 'text-gray-400 group-hover:text-gray-200'
                                            }`}>
                                                {getDiceIcon(sides)}
                                            </div>
                                            <span className="absolute bottom-2 right-2.5 text-[7px] font-black opacity-30 group-hover:opacity-60 tracking-tighter uppercase font-mono">D{sides}</span>
                                            
                                            {/* Count Indicator - Ruby Style */}
                                            {count > 0 && (
                                                <div className="absolute -top-1.5 -right-1.5 min-w-[22px] h-5.5 bg-gradient-to-br from-red-500 to-red-800 text-white text-[10px] font-black rounded-lg flex items-center justify-center px-1.5 shadow-[0_4px_12px_rgba(220,38,38,0.5)] border border-white/20 animate-in zoom-in duration-300 z-20">
                                                    {count}
                                                </div>
                                            )}
                                            
                                            {/* Hover Glow Effect */}
                                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Options within menu */}
                            <div className="border-t border-white/5 mt-1 pt-3">
                                <button
                                    onClick={() => setIsRollHidden(!isRollHidden)}
                                    className={`w-full flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl border transition-all group/btn ${
                                        isRollHidden 
                                        ? 'bg-purple-900/30 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                                        : 'bg-gray-900/40 border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60">Görünüm</span>
                                        <span className="text-[11px] font-black uppercase tracking-tight">{isRollHidden ? 'GİZLİ' : 'AÇIK'}</span>
                                    </div>
                                    <div className={`text-lg transition-transform duration-500 ${isRollHidden ? 'rotate-[360deg] scale-110' : 'rotate-0 scale-100 group-hover/btn:scale-110'}`}>
                                        {isRollHidden ? '👁️‍🗨️' : '👁️'}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main FAB */}
                    <button
                        onClick={() => setIsQuickDiceOpen(!isQuickDiceOpen)}
                        className={`group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl border ${isQuickDiceOpen ? 'bg-red-600 border-red-400 rotate-90' : 'bg-gray-900 border-white/10 hover:border-red-500/50 rotate-0'}`}
                    >
                        {dicePool.length > 0 && (
                            <div className="absolute -top-2 -right-2 min-w-[24px] h-[24px] bg-yellow-500 text-black text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-lg animate-in zoom-in duration-300 ring-4 ring-gray-950">
                                {dicePool.length}
                            </div>
                        )}
                        <div className={`transition-all duration-500 ${isQuickDiceOpen ? 'scale-75 opacity-50' : 'group-hover:scale-110'}`}>
                            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L22 7.5V16.5L12 22L2 16.5V7.5L12 2Z" fill="white" className={`${isQuickDiceOpen ? 'fill-white' : 'fill-red-600'} transition-colors duration-500`} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M12 2L2 7.5L12 12L22 7.5L12 2Z" stroke={isQuickDiceOpen ? "#ef4444" : "white"} strokeWidth="1" strokeLinejoin="round" />
                                <path d="M2 16.5L12 12L22 16.5" stroke="white" strokeWidth="0.5" opacity="0.6" />
                                <path d="M12 2V12M12 22V12M2 7.5L12 12M22 7.5L12 12" stroke="white" strokeWidth="0.5" opacity="0.4" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* --- MODALS --- */}

                {/* Zar Logları Modal (Pop-up) */}
                {
                    isDiceLogOpen && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setIsDiceLogOpen(false)}>
                            <div className="bg-gray-900/80 backdrop-blur-xl w-full max-w-md h-[70vh] rounded-3xl border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center p-6 bg-gradient-to-b from-gray-800/80 to-transparent border-b border-gray-700/50">
                                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 flex items-center gap-2">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2L22 7.5V16.5L12 22L2 16.5V7.5L12 2Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
                                            <path d="M12 2L2 7.5L12 12L22 7.5L12 2Z" stroke="#fca5a5" strokeWidth="1" strokeLinejoin="round" />
                                            <path d="M2 16.5L12 12L22 16.5" stroke="#fca5a5" strokeWidth="0.5" opacity="0.6" />
                                            <path d="M12 2V12M12 22V12M2 7.5L12 12M22 7.5L12 12" stroke="#ef4444" strokeWidth="0.5" opacity="0.4" />
                                        </svg>
                                        Parti Zarları
                                    </h2>
                                    <button onClick={() => setIsDiceLogOpen(false)} className="text-gray-400 hover:text-red-400 text-3xl transition-colors">&times;</button>
                                </div>

                                <div className="p-6 flex-1 flex flex-col overflow-y-auto space-y-3 font-mono text-sm leading-relaxed custom-scrollbar">
                                    {diceLogs && diceLogs.length === 0 ? (
                                        <div className="text-gray-500 italic text-center mt-10">Gizemli bir sessizlik... Henüz zar atılmadı.</div>
                                    ) : (
                                        diceLogs?.map?.((log: any, i: number) => (
                                            <div key={log.id || i} className={`p-3 flex justify-between items-center rounded-xl border ${log.playerName === "Dungeon Master" ? "bg-purple-900/20 text-purple-300 font-bold border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]" : "bg-gray-800/40 text-gray-300 border-gray-700/50"}`}>
                                                <div>
                                                    <span className="opacity-80">{log.playerName} zarı attı ({log.type}): </span>
                                                    <span className={`text-xl ml-1 font-black ${log.playerName === "Dungeon Master" ? "text-purple-400" : "text-yellow-400"}`}>{log.rollResult}</span>
                                                    {log.isHidden && <span className="ml-3 text-[10px] bg-gray-900/80 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full shadow-inner tracking-widest uppercase">👁️ Gizli</span>}
                                                </div>
                                                {log.isHidden && socket && (
                                                    <button
                                                        onClick={() => socket.emit('reveal_dice', { campaignId, rollId: log.id })}
                                                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow transition-colors"
                                                    >
                                                        Açıkla
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Canavar Kitabı Modal (Pop-up) */}
                {
                    isMonsterBookOpen && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setIsMonsterBookOpen(false)}>
                            <div className="bg-gray-900/90 backdrop-blur-2xl w-full max-w-2xl h-[80vh] rounded-3xl border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center p-6 bg-gradient-to-b from-gray-800/80 to-transparent border-b border-gray-700/50">
                                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">🐉 Canavar Kitabı</h2>
                                    <button onClick={() => setIsMonsterBookOpen(false)} className="text-gray-400 hover:text-purple-400 text-3xl transition-colors">&times;</button>
                                </div>

                                <div className="p-6 flex-1 flex flex-col min-h-0">
                                    <div className="relative mb-6">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                                        <input
                                            type="text"
                                            placeholder="Yaratık ara (Örn: Goblin, Dragon)..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-gray-950/60 border border-gray-700/50 text-lg text-white py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-500 shadow-inner backdrop-blur-sm transition-all"
                                        />
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                        {monsters?.length === 0 ? (
                                            <div className="text-center text-gray-500 mt-10">Veritabanı yükleniyor...</div>
                                        ) : filteredMonsters?.length === 0 ? (
                                            <div className="text-center text-gray-500 mt-10">Aradığın yaratık Bestiary'de bulunamadı.</div>
                                        ) : (
                                            filteredMonsters?.map?.(monster => (
                                                <div key={monster._id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-md">
                                                    <div
                                                        className="p-4 hover:bg-gray-700 transition-all flex justify-between items-center cursor-pointer group"
                                                        onClick={() => setExpandedMonsterId(expandedMonsterId === monster._id ? null : monster._id)}
                                                    >
                                                        <div>
                                                            <div className="font-bold text-gray-200 text-lg group-hover:text-purple-400 transition-colors">{monster.name || "Bilinmeyen Yaratık"}</div>
                                                            <div className="text-sm text-gray-400">{monster.type || "Bilinmeyen Tür"} • Challenge Rating: <span className="text-yellow-500 font-bold">{monster.challenge || "?"}</span></div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="text-right">
                                                                <div className="text-sm font-bold text-green-400">
                                                                    {typeof monster.hp === 'object' ? (monster.hp.average || '10') : (monster.hp || '10').toString().split(' ')[0]} HP
                                                                </div>
                                                                <div className="text-sm font-bold text-blue-400">
                                                                    {typeof monster.ac === 'object' ? (monster.ac.base || '10') : (monster.ac || '10').toString().split(' ')[0]} AC
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addTokenToMap(monster.name, 'monster', '#ef4444', monster._id);
                                                                }}
                                                                className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border border-red-500/30"
                                                                title="Haritaya Token Ekle"
                                                            >
                                                                🗺️
                                                            </button>
                                                            <button
                                                                onClick={(e) => addMonsterToEncounter(e, monster)}
                                                                className="bg-purple-600 hover:bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                                title="Savaşa Ekle"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Detay Paneli */}
                                                    {expandedMonsterId === monster._id && (
                                                        <div className="p-4 bg-gray-900 border-t border-gray-700 text-sm space-y-4">
                                                            <div className="text-gray-300">
                                                                <strong>Armor Class:</strong> {monster.ac} <br />
                                                                <strong>Hit Points:</strong> {monster.hp} <br />
                                                                <strong>Speed:</strong> {monster.speed} <br />
                                                                <strong>Stats:</strong> <span className="text-yellow-400">{monster.stats}</span>
                                                            </div>

                                                            {monster.traits && monster.traits.length > 0 && (
                                                                <div>
                                                                    <strong className="text-purple-400 text-base border-b border-gray-700 block mb-2">Traits</strong>
                                                                    <ul className="space-y-2">
                                                                        {monster.traits.map((trait: any, i: number) => (
                                                                            <li key={i}><strong className="text-gray-200">{trait.name}.</strong> <span className="text-gray-400">{trait.desc}</span></li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {monster.actions && monster.actions.length > 0 && (
                                                                <div>
                                                                    <strong className="text-red-400 text-base border-b border-gray-700 block mb-2">Actions</strong>
                                                                    <ul className="space-y-2">
                                                                        {monster.actions.map((action: any, i: number) => (
                                                                            <li key={i}><strong className="text-gray-200">{action.name}.</strong> <span className="text-gray-400">{action.desc}</span></li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {monster.legendary && monster.legendary.length > 0 && (
                                                                <div>
                                                                    <strong className="text-yellow-500 text-base border-b border-gray-700 block mb-2">Legendary Actions</strong>
                                                                    <ul className="space-y-2">
                                                                        {monster.legendary.map((action: any, i: number) => (
                                                                            <li key={i}><strong className="text-gray-200">{action.name}.</strong> <span className="text-gray-400">{action.desc}</span></li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Fısıltı (Whisper) Gönderme Modalı */}
                {
                    whisperPlayerName && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                            <div className="bg-gray-900 w-full max-w-md p-6 rounded-2xl border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col relative text-white max-h-[80vh]">
                                <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center">
                                    <span className="text-3xl mr-2">💬</span> {whisperPlayerName}'e Fısılda
                                </h2>

                                {/* Whisper History Log */}
                                <div className="flex-1 overflow-y-auto mb-4 bg-gray-950/50 rounded-xl p-3 border border-gray-800 space-y-2 max-h-64 custom-scrollbar">
                                    {whisperHistory && whisperHistory.length > 0 ? (
                                        whisperHistory.filter((w: any) =>
                                            w && ((w.senderName === 'DM' && w.targetName === whisperPlayerName) ||
                                                (w.senderName === whisperPlayerName && w.targetName === 'DM'))
                                        ).map((w: any, idx: number) => (
                                            <div key={idx} className={`text-sm p-2 rounded-lg ${w.senderName === 'DM' ? 'bg-purple-900/40 ml-6 border border-purple-500/20' : 'bg-gray-800/40 mr-6 border border-gray-700/20'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-black text-[9px] uppercase tracking-wider text-purple-400">
                                                        {w.senderName === 'DM' ? 'SEN (DM)' : w.senderName}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 opacity-50">{w.createdAt ? new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                                </div>
                                                <p className="text-gray-200 text-xs leading-relaxed">{w.message}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 opacity-20 flex flex-col items-center">
                                            <div className="text-4xl mb-2">🤫</div>
                                            <p className="text-xs font-bold uppercase tracking-widest">Henüz fısıltı yok</p>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <textarea
                                    value={whisperMessage}
                                    onChange={(e) => setWhisperMessage(e.target.value)}
                                    placeholder="Gizli mesajınızı yazın..."
                                    className="w-full bg-gray-950 border border-gray-700 text-sm text-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 mb-6 min-h-[100px] outline-none resize-none"
                                />
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => { setWhisperPlayerName(null); setWhisperMessage(""); }}
                                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg transition-colors border-2 border-gray-700"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={sendWhisper}
                                        disabled={!whisperMessage.trim()}
                                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg border-2 border-purple-700 transition-colors disabled:opacity-50"
                                    >
                                        Mesajı İlet
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* DM Medya Galerisi Modal (Pop-up) */}
                {
                    isGalleryOpen && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
                            <div className="bg-white p-6 rounded border-4 border-gray-900 shadow-[10px_10px_0px_#000] max-w-6xl w-full h-[85vh] flex flex-col relative text-gray-900">
                                <button
                                    onClick={() => setIsGalleryOpen(false)}
                                    className="absolute -top-4 -right-4 w-10 h-10 bg-red-600 border-2 border-gray-900 shadow-[2px_2px_0px_#000] text-white font-black hover:bg-red-500 active:translate-y-1 active:translate-x-1 active:shadow-none z-10"
                                    title="Kapat"
                                >
                                    ✕
                                </button>

                                <div className="text-3xl font-black uppercase border-b-4 border-gray-800 pb-4 mb-6 text-center tracking-tighter">
                                    Dungeon Master Galerisi
                                </div>

                                <div className="mb-8 bg-gray-100 p-4 border-4 border-gray-800 shadow-[4px_4px_0px_#1f2937]">
                                    <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                                        🚀 Yeni Medya Yükle
                                    </h3>
                                    <div className="flex flex-col md:flex-row items-end gap-4">
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-bold uppercase mb-1">Cihazdan Dosya Seç</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-2 file:border-gray-800 file:text-xs file:font-black file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-bold uppercase mb-1">Veya URL Yapıştır</label>
                                            <input
                                                type="text"
                                                value={mediaUrl}
                                                onChange={(e) => setMediaUrl(e.target.value)}
                                                placeholder="https://example.com/image.png"
                                                className="w-full bg-white border-2 border-gray-800 text-sm p-2 rounded outline-none focus:bg-yellow-50"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => uploadMedia('image')}
                                                disabled={!mediaFile && !mediaUrl}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-6 border-2 border-gray-900 shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 text-xs"
                                            >
                                                GÖRSEL YÜKLE
                                            </button>
                                            <button
                                                onClick={() => uploadMedia('link')}
                                                disabled={!mediaUrl}
                                                className="bg-gray-800 hover:bg-gray-700 text-white font-black py-2.5 px-6 border-2 border-gray-900 shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 text-xs"
                                            >
                                                LİNK EKLE
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {(gallery || []).length === 0 ? (
                                        <div className="text-center text-gray-500 font-bold italic mt-20 text-xl w-full">Henüz hiçbir medya paylaşmadın.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(gallery || []).map(media => (
                                                media && (
                                                    <div key={media._id} className="border-4 border-gray-800 p-2 shadow-[6px_6px_0px_#1f2937] bg-gray-50 flex flex-col relative group">
                                                        <div className="text-lg font-bold truncate mb-2 text-center" title={media.name}>{media.name}</div>
                                                        <div className="flex-1 flex items-center justify-center overflow-hidden bg-gray-200 border-2 border-dashed border-gray-400 p-2 min-h-[200px]">
                                                            {media.type === 'image' ? (
                                                                <div onClick={() => {
                                                                    setSelectedImage(media.url);
                                                                    if (socket) (socket as any).emit('show_image', { campaignId, url: media.url });
                                                                }} className="cursor-pointer">
                                                                    <img src={media.url} alt={media.name} className="max-h-[200px] object-contain hover:scale-105 transition-transform" />
                                                                </div>
                                                            ) : (
                                                                <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline break-all text-center">
                                                                    🔗 Linke Git
                                                                </a>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => deleteMedia(media._id)}
                                                            className="absolute -top-3 -right-3 bg-red-600 text-white border-2 border-gray-800 p-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:scale-110 shadow-[2px_2px_0px_#1f2937] z-10"
                                                            title="Galeriden ve Oyunculardan Sil"
                                                        >
                                                            SİL
                                                        </button>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Resim Görüntüleyici Modal (Pop-up) */}
                {
                    selectedImage && (
                        <div
                            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md cursor-pointer animate-fade-in"
                            onClick={() => setSelectedImage(null)}
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-6 right-6 w-12 h-12 bg-red-600 border-2 border-gray-900 shadow-[2px_2px_0px_#000] text-white font-black hover:bg-red-500 active:translate-y-1 active:translate-x-1 active:shadow-none z-10 text-xl"
                                title="Kapat"
                            >
                                ✕
                            </button>
                            <img
                                src={selectedImage}
                                alt="Büyük Görüntü"
                                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border-4 border-gray-800"
                                onClick={(e) => e.stopPropagation()} // Resme tıklayınca kapanmasın, sadece siyah alana tıklayınca kapansın
                            />
                        </div>
                    )
                }

                {/* --- LORE MODALS --- */}

                {/* NPC Ağı Modalı */}
                {
                    isNpcMenuOpen && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
                            <div className="bg-gray-900 border-4 border-emerald-900 rounded-lg p-6 w-full max-w-5xl h-[85vh] flex flex-col relative shadow-[10px_10px_0px_#064e3b]">
                                <button onClick={() => setIsNpcMenuOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-2xl">✕</button>
                                <div className="flex justify-between items-center mb-6 border-b-2 border-emerald-900 pb-2">
                                    <h2 className="text-3xl font-black text-emerald-500 uppercase tracking-tighter">🤝 NPC & İlişki Ağı</h2>
                                    <button
                                        onClick={() => window.location.href = `/player/${campaignId}/character-creator?npc=true`}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all flex items-center gap-2"
                                    >
                                        <span>➕</span> Seviyeli NPC Oluştur
                                    </button>
                                </div>

                                <div className="flex gap-6 h-full overflow-hidden">
                                    {/* NPC Ekleme Formu */}
                                    <div className="w-1/3 bg-gray-800 p-4 rounded-lg flex flex-col gap-4 border border-gray-700">
                                        <h3 className="text-xl font-bold text-emerald-400 border-b border-gray-700 pb-2">Yeni NPC Yarat</h3>

                                        <input type="text" placeholder="NPC Adı" value={newNpc.name} onChange={e => setNewNpc({ ...newNpc, name: e.target.value })} className="bg-gray-950 border border-gray-700 p-3 rounded text-white outline-none focus:border-emerald-500" />
                                        <input type="text" placeholder="Mesleği/Rolü (Örn: Hancı)" value={newNpc.type} onChange={e => setNewNpc({ ...newNpc, type: e.target.value })} className="bg-gray-950 border border-gray-700 p-3 rounded text-white outline-none focus:border-emerald-500" />

                                        <select value={newNpc.relationship} onChange={e => setNewNpc({ ...newNpc, relationship: e.target.value })} className="bg-gray-950 border border-gray-700 p-3 rounded text-white outline-none focus:border-emerald-500">
                                            <option value="Dost">🟩 Dost (Müttefik)</option>
                                            <option value="Nötr">🟨 Nötr (İlgisiz)</option>
                                            <option value="Düşman">🟥 Düşman (Tehdit)</option>
                                        </select>

                                        <textarea placeholder="Gizli sırlar, bilgiler, veya hedefler..." value={newNpc.details} onChange={e => setNewNpc({ ...newNpc, details: e.target.value })} className="bg-gray-950 border border-gray-700 p-3 rounded text-white outline-none focus:border-emerald-500 flex-1 resize-none" />

                                        <button onClick={addNpc} className="bg-emerald-700 hover:bg-emerald-600 font-bold p-3 rounded transition-colors uppercase mt-auto">Ağa Ekle</button>
                                    </div>

                                    {/* NPC Listesi */}
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                        {leveledNpcs.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Sistem NPC'leri (Seviyeli)
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {leveledNpcs?.map?.(lnpc => {
                                                        const rel = lnpc.relationship || 'Nötr';
                                                        const relColor = rel === 'Dost' ? 'bg-emerald-900/30 border-emerald-700' : rel === 'Düşman' ? 'bg-red-900/30 border-red-700' : 'bg-yellow-900/20 border-yellow-800/50';
                                                        const relBadge = rel === 'Dost' ? 'bg-emerald-700 text-emerald-100' : rel === 'Düşman' ? 'bg-red-700 text-red-100' : 'bg-yellow-700 text-yellow-100';
                                                        const relIcon = rel === 'Dost' ? '🟩' : rel === 'Düşman' ? '🟥' : '🟨';
                                                        const tokenColor = rel === 'Dost' ? '#10b981' : rel === 'Düşman' ? '#ef4444' : '#f59e0b';

                                                        const toggleRelationship = async (newRel: string) => {
                                                            try {
                                                                await axios.put(`${API_URL}/api/characters/${lnpc._id}`, { relationship: newRel });
                                                                setLeveledNpcs(prev => prev.map((n: any) => n._id === lnpc._id ? { ...n, relationship: newRel } : n));
                                                            } catch (e) { console.error('İlişki güncellenemedi', e); }
                                                        };

                                                        const addNpcToEncounter = () => {
                                                            const hp = lnpc.maxHp || 10;
                                                            const newCombatant = {
                                                                id: `npc-${lnpc._id}-${Date.now()}`,
                                                                name: lnpc.name,
                                                                maxHp: hp,
                                                                currentHp: hp,
                                                                ac: lnpc.ac || 10,
                                                                initiative: Math.floor(Math.random() * 20) + 1,
                                                                _isLeveledNpc: true,
                                                                _npcId: lnpc._id,
                                                                _relationship: rel,
                                                                _tokenColor: tokenColor,
                                                            };
                                                            const updated = [...activeCombatants, newCombatant].sort((a: any, b: any) => b.initiative - a.initiative);
                                                            setActiveCombatants(updated);
                                                            syncEncounter(updated);
                                                            setIsNpcMenuOpen(false);
                                                        };

                                                        return (
                                                            <div key={lnpc._id} className={`border p-4 rounded-xl transition-all ${relColor}`}>
                                                                {/* Top row: name + level + relationship badge */}
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <h4 className="font-bold text-white text-lg">{lnpc.name}</h4>
                                                                            <span className="text-[10px] bg-gray-700 text-white px-1.5 py-0.5 rounded font-black uppercase">LV {lnpc.level}</span>
                                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${relBadge}`}>{relIcon} {rel}</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">
                                                                            {lnpc.raceRef?.name} {lnpc.classRef?.name} {lnpc.subclass && `— ${lnpc.subclass}`}
                                                                        </div>
                                                                        {lnpc.alignment && (
                                                                            <div className="text-[10px] text-purple-400 font-bold mt-0.5">{lnpc.alignment}</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <button onClick={() => openEditCharModal(lnpc._id)} className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-lg transition-all" title="Düzenle">⚙️</button>
                                                                        <button onClick={async () => {
                                                                            const ok = await confirm({
                                                                                title: "Silmeyi Onayla",
                                                                                message: `${lnpc.name} silinecek, emin misin?`,
                                                                                confirmText: "Hepsini Sil",
                                                                                severity: "danger"
                                                                            });
                                                                            if (ok) {
                                                                                await axios.delete(`${API_URL}/api/characters/${lnpc._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                                                                                setLeveledNpcs(leveledNpcs.filter((n: any) => n._id !== lnpc._id));
                                                                            }
                                                                        }} className="bg-red-900/50 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all" title="Sil">✕</button>
                                                                    </div>
                                                                </div>

                                                                {/* Relationship toggle */}
                                                                <div className="flex gap-1.5 mb-3">
                                                                    {['Dost', 'Nötr', 'Düşman'].map((r: string) => (
                                                                        <button key={r} onClick={() => toggleRelationship(r)}
                                                                            className={`flex-1 py-1 rounded text-[10px] font-black uppercase transition-all border ${rel === r
                                                                                ? r === 'Dost' ? 'bg-emerald-600 border-emerald-500 text-white' : r === 'Düşman' ? 'bg-red-600 border-red-500 text-white' : 'bg-yellow-600 border-yellow-500 text-white'
                                                                                : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'
                                                                                }`}>
                                                                            {r === 'Dost' ? '🟩' : r === 'Düşman' ? '🟥' : '🟨'} {r}
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                {/* Stats Summary */}
                                                                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                                                                    {lnpc.maxHp > 0 && <span className="bg-gray-900/60 border border-gray-700 px-2 py-0.5 rounded font-bold text-red-400">❤️ {lnpc.maxHp} HP</span>}
                                                                    {lnpc.ac > 0 && <span className="bg-gray-900/60 border border-gray-700 px-2 py-0.5 rounded font-bold text-cyan-400">🛡 {lnpc.ac} AC</span>}
                                                                    {lnpc.stats && Object.entries(lnpc.stats).map(([stat, val]: any) => (
                                                                        <span key={stat} className="bg-gray-900/60 border border-gray-700 px-1.5 py-0.5 rounded font-bold text-gray-300 text-[10px]">
                                                                            {stat} {val} ({val >= 10 ? '+' : ''}{Math.floor((val - 10) / 2)})
                                                                        </span>
                                                                    ))}
                                                                </div>

                                                                {/* Known Spells */}
                                                                {lnpc.knownSpells && lnpc.knownSpells.length > 0 && (
                                                                    <div className="mb-3">
                                                                        <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1.5">✨ Bilinen Büyüler</div>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {lnpc.knownSpells.map((spellName: string) => (
                                                                                <span key={spellName} className="text-[10px] bg-violet-900/30 border border-violet-700/50 text-violet-300 px-1.5 py-0.5 rounded font-bold">
                                                                                    {spellName}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {lnpc.preparedSpells && lnpc.preparedSpells.length > 0 && (
                                                                    <div className="mb-3">
                                                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">📖 Hazırlanmış Büyüler</div>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {lnpc.preparedSpells.map((spellName: string) => (
                                                                                <span key={spellName} className="text-[10px] bg-blue-900/30 border border-blue-700/50 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                                                                                    {spellName}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Add to combat button */}
                                                                <button onClick={addNpcToEncounter}
                                                                    className={`w-full py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${rel === 'Dost'
                                                                        ? 'bg-emerald-700/40 border-emerald-600 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                                                                        : rel === 'Düşman'
                                                                            ? 'bg-red-700/40 border-red-600 text-red-300 hover:bg-red-600 hover:text-white'
                                                                            : 'bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                                                                        }`}>
                                                                    ⚔️ Savaşa Ekle
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}


                                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Lore NPC'leri</h3>
                                        {npcs.length === 0 && leveledNpcs.length === 0 ? (
                                            <div className="text-center text-gray-500 italic mt-10">Henüz hiçbir NPC kaydedilmedi. Dünyan çok boş!</div>
                                        ) : (
                                            npcs?.map?.(npc => (
                                                <div key={npc._id} className="bg-gray-800 border-l-4 p-4 rounded-lg shadow flex flex-col transition-all relative mb-4"
                                                    style={{ borderLeftColor: npc.relationship === 'Dost' ? '#10b981' : npc.relationship === 'Düşman' ? '#ef4444' : '#f59e0b' }}
                                                >
                                                    <button onClick={() => deleteNpc(npc._id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">✕</button>
                                                    <div className="flex justify-between items-end mb-2 border-b border-gray-700 pb-2">
                                                        <div>
                                                            <h4 className="text-2xl font-black text-white">{npc.name}</h4>
                                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{npc.type}</span>
                                                        </div>
                                                        <div className={`px-3 py-1 font-bold rounded-full text-xs uppercase
                                                        ${npc.relationship === 'Dost' ? 'bg-emerald-900/50 text-emerald-400' :
                                                                npc.relationship === 'Düşman' ? 'bg-red-900/50 text-red-400' :
                                                                    'bg-yellow-900/50 text-yellow-400'}`}>
                                                            {npc.relationship}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-300 italic text-sm">{npc.details || "Detay girilmedi."}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Gizli Notlar Modalı */}
                {
                    isNoteMenuOpen && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
                            <div className="bg-gray-900 border-4 border-yellow-900 rounded-lg p-6 w-full max-w-5xl h-[85vh] flex flex-col relative shadow-[10px_10px_0px_#78350f]">
                                <button onClick={() => setIsNoteMenuOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-2xl">✕</button>
                                <h2 className="text-3xl font-black text-yellow-500 mb-6 border-b-2 border-yellow-900 pb-2 uppercase tracking-tighter">📝 DM Gizli Not Defteri</h2>

                                <div className="flex gap-6 h-full overflow-hidden">
                                    {/* Not Ekleme Formu */}
                                    <div className="w-1/3 bg-gray-800 p-4 rounded-lg flex flex-col gap-4 border border-gray-700">
                                        <h3 className="text-xl font-bold text-yellow-400 border-b border-gray-700 pb-2">Yeni Plan / Tuzak</h3>

                                        <input type="text" placeholder="Başlık" value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} className="bg-gray-950 border border-gray-700 p-3 rounded text-white outline-none focus:border-yellow-500" />

                                        <textarea placeholder="Oley! Yeni bir tuzak veya gizli oda fikri buraya..." value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} className="bg-gray-950 border border-gray-700 p-3 rounded text-white outline-none focus:border-yellow-500 flex-1 resize-none font-serif leading-relaxed" />

                                        <div className="flex items-center space-x-4 pb-2">
                                            <label className="text-gray-400 font-bold text-sm">Etiket Rengi:</label>
                                            <select value={newNote.color} onChange={e => setNewNote({ ...newNote, color: e.target.value })} className="bg-gray-950 border border-gray-700 p-2 rounded text-white outline-none focus:border-yellow-500">
                                                <option value="yellow">Sarı (Standart)</option>
                                                <option value="red">Kırmızı (Tehlike/Tuzak)</option>
                                                <option value="blue">Mavi (Hikaye/Lore)</option>
                                                <option value="purple">Mor (Büyülü Obje)</option>
                                            </select>
                                        </div>

                                        <button onClick={addNote} className="bg-yellow-700 hover:bg-yellow-600 font-bold p-3 rounded transition-colors uppercase mt-auto">Gizli Notu Kaydet</button>
                                    </div>

                                    {/* Not Listesi (Mantolama Tarzında) */}
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 grid grid-cols-2 gap-4 h-full content-start">
                                        {notes.length === 0 ? (
                                            <div className="col-span-2 text-center text-gray-500 italic mt-10">Gizli bir planın yok. Çok dürüst bir DM'sin.</div>
                                        ) : (
                                            notes.map(note => {
                                                const bgColors: any = { yellow: 'bg-yellow-900/30 border-yellow-700 text-yellow-100', red: 'bg-red-900/30 border-red-700 text-red-100', blue: 'bg-blue-900/30 border-blue-700 text-blue-100', purple: 'bg-purple-900/30 border-purple-700 text-purple-100' };
                                                const activeBg = bgColors[note.color] || bgColors['yellow'];

                                                return (
                                                    <div key={note._id} className={`${activeBg} border p-4 rounded-lg shadow flex flex-col transition-all relative h-64 overflow-hidden`}>
                                                        <button onClick={() => deleteNote(note._id)} className="absolute top-2 right-2 text-gray-400 hover:text-white bg-black/50 rounded-full w-6 h-6 flex items-center justify-center">✕</button>

                                                        <h4 className="text-xl font-black mb-2 border-b border-white/20 pb-2 pr-6 truncate">{note.title}</h4>

                                                        <div className="flex-1 overflow-y-auto pr-2 mt-2 font-serif text-sm leading-relaxed whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                                            {note.content || "-"}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Karakter Hikayesi (Lore) Okuma Modalı */}
                {
                    selectedPlayerLore && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPlayerLore(null)}>
                            <div className="bg-gray-100 border-8 border-gray-800 rounded-lg p-8 w-full max-w-2xl max-h-[85vh] flex flex-col relative shadow-[15px_15px_0px_#1f2937] text-gray-900 font-serif bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setSelectedPlayerLore(null)} className="absolute top-4 right-4 text-red-600 hover:text-red-800 font-black text-3xl">✕</button>

                                <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter border-b-4 border-gray-800 pb-2 flex items-baseline">
                                    {selectedPlayerLore.name}
                                    <span className="text-xl ml-4 font-bold text-gray-600 lowercase tracking-normal">({selectedPlayerLore.raceRef?.name} {selectedPlayerLore.classRef?.name})</span>
                                </h2>

                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 mt-4">Karakter Geçmişi ve Hedefler</h3>

                                <div className="flex-1 overflow-y-auto whitespace-pre-wrap leading-loose text-lg text-gray-800 pr-4">
                                    {selectedPlayerLore.backstory ? selectedPlayerLore.backstory : "Bu karakterin geçmişi henüz sırlarla dolu (Oyuncu hiçbir şey yazmamış)."}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* ── KARAKTER DÜZENLEME (EDIT STATS) MODALI ── */}
                {
                    isEditCharModalOpen && editingCharData && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setIsEditCharModalOpen(false)}>
                            <div className="bg-gray-900/90 backdrop-blur-2xl rounded-3xl border border-blue-500/30 w-full max-w-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mx-20 -my-20"></div>
                                <div className="bg-gradient-to-r from-gray-800 to-gray-900/80 p-5 border-b border-gray-700/50 flex justify-between items-center relative z-10">
                                    <div className="flex flex-col">
                                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 uppercase tracking-widest flex items-center gap-2">
                                            <span>🪄</span> {editingCharData.name} <span className="text-gray-500 text-sm font-bold tracking-normal">(Oyuncu Düzenle)</span>
                                        </h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Değişimler anında karşı tarafa yansır.</p>
                                    </div>
                                    <button onClick={() => setIsEditCharModalOpen(false)} className="text-gray-500 hover:text-white transition-colors text-4xl font-light hover:rotate-90 transform duration-300">&times;</button>
                                </div>

                                <div className="p-6 space-y-8 relative z-10 custom-scrollbar max-h-[75vh] overflow-y-auto">
                                    {/* CORE STATS GRID */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-gray-800/60 p-3 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-colors shadow-inner flex flex-col justify-center items-center group">
                                            <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 group-hover:text-blue-400 transition-colors">Seviye (Level)</label>
                                            <input type="number" min="1" max="20"
                                                value={editingCharData.level || 1}
                                                onChange={(e) => setEditingCharData({ ...editingCharData, level: Number(e.target.value) })}
                                                className="w-full bg-gray-950/50 text-white font-black text-2xl p-2 rounded-xl text-center outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                                        </div>
                                        <div className="bg-red-950/20 p-3 rounded-2xl border border-red-900/30 hover:border-red-500/50 transition-colors shadow-inner flex flex-col justify-center items-center group">
                                            <label className="block text-[10px] text-red-500 font-black uppercase tracking-widest mb-2 group-hover:text-red-400 transition-colors">🔥 Maks HP</label>
                                            <input type="number" min="1"
                                                value={editingCharData.maxHp || 10}
                                                onChange={(e) => setEditingCharData({ ...editingCharData, maxHp: Number(e.target.value) })}
                                                className="w-full bg-red-950/40 text-red-300 font-black text-2xl p-2 rounded-xl text-center outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder-red-800/50" />
                                        </div>
                                        <div className="bg-blue-950/20 p-3 rounded-2xl border border-blue-900/30 hover:border-blue-500/50 transition-colors shadow-inner flex flex-col justify-center items-center group">
                                            <label className="block text-[10px] text-blue-500 font-black uppercase tracking-widest mb-2 group-hover:text-blue-400 transition-colors">🛡️ Armor Class</label>
                                            <input type="number" min="1"
                                                value={editingCharData.ac || 10}
                                                onChange={(e) => setEditingCharData({ ...editingCharData, ac: Number(e.target.value) })}
                                                className="w-full bg-blue-950/40 text-blue-300 font-black text-2xl p-2 rounded-xl text-center outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                                        </div>
                                        <div className="bg-green-950/20 p-3 rounded-2xl border border-green-900/30 hover:border-green-500/50 transition-colors shadow-inner flex flex-col justify-center items-center group">
                                            <label className="block text-[10px] text-green-500 font-black uppercase tracking-widest mb-2 group-hover:text-green-400 transition-colors">👟 Speed</label>
                                            <input type="number" min="0" step="5"
                                                value={editingCharData.speed || 30}
                                                onChange={(e) => setEditingCharData({ ...editingCharData, speed: Number(e.target.value) })}
                                                className="w-full bg-green-950/40 text-green-300 font-black text-2xl p-2 rounded-xl text-center outline-none focus:ring-2 focus:ring-green-500/50 transition-all" />
                                        </div>
                                    </div>

                                    {/* ABILITY SCORES GRID */}
                                    <div className="border-t border-gray-700/50 pt-6">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                                            <span className="w-10 h-px bg-gradient-to-r from-transparent to-gray-600 block"></span>
                                            Yetenek Skorları (Stats)
                                            <span className="w-10 h-px bg-gradient-to-l from-transparent to-gray-600 block"></span>
                                        </h3>
                                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                                            {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((stat) => (
                                                <div key={stat} className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 hover:border-yellow-600/50 hover:bg-gray-800 transition-all shadow-sm flex flex-col items-center group">
                                                    <label className="block text-[10px] text-gray-500 font-black uppercase text-center mb-1 group-hover:text-yellow-500 transition-colors">{stat}</label>
                                                    <input type="number" min="1" max="30"
                                                        value={editingCharData.stats?.[stat] || 10}
                                                        onChange={(e) => {
                                                            const newStats = { ...editingCharData.stats, [stat]: Number(e.target.value) };
                                                            setEditingCharData({ ...editingCharData, stats: newStats });
                                                        }}
                                                        className="w-full bg-transparent text-white font-black text-center text-xl outline-none" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* DM NOTES */}
                                    <div className="border-t border-gray-700/50 pt-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span>📝</span> Özel Notlar (Oyuncu Göremez)
                                        </h3>
                                        <textarea
                                            value={editingCharData.dmNotes || ""}
                                            onChange={(e) => setEditingCharData({ ...editingCharData, dmNotes: e.target.value })}
                                            placeholder="Bu karakterin laneti var, aslında hırsız ama saklıyor vb..."
                                            className="w-full bg-gray-950/60 text-gray-300 text-sm p-4 rounded-2xl border border-gray-700/80 h-28 outline-none focus:border-blue-500/50 transition-colors resize-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 border-t border-gray-700/50 flex flex-col-reverse md:flex-row justify-end gap-3 relative z-10">
                                    <button onClick={() => setIsEditCharModalOpen(false)} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-gray-800/80 border border-transparent hover:border-gray-600 transition-all">İptal</button>
                                    <button onClick={saveEditedChar} className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transition-all shadow-lg shadow-blue-900/40 border border-blue-400/30 hover:scale-105 transform">
                                        🪄 KAYDET VE UYGULA
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* ── DM SHOP MODAL ── */}
                {
                    isShopMenuOpen && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsShopMenuOpen(false)}>
                            <div className="bg-gray-900 border-4 border-orange-900/50 rounded-2xl p-6 max-w-2xl w-full flex flex-col shadow-[15px_15px_0px_#ea580c] relative" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-6 border-b-2 border-orange-900/30 pb-4">
                                    <h2 className="text-3xl font-black text-orange-400 flex items-center gap-3">
                                        <span className="text-4xl">🏬</span> Dinamik Dükkan
                                    </h2>
                                    <button onClick={() => setIsShopMenuOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors">✕</button>
                                </div>

                                {/* Yayınlama Durumu */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-800/80 p-5 rounded-xl border border-gray-700 mb-6 shadow-inner gap-4">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Dükkanı Oyunculara Gönder</h3>
                                        <p className="text-sm text-gray-400 mt-1">Belirli bir oyuncuya veya herkese eşyaları anında ilet.</p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => toggleShopPublish(true, 'all')}
                                                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border border-orange-500 text-white font-black rounded-lg text-xs shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all active:scale-95 whitespace-nowrap"
                                            >
                                                Tüm Partiye Gönder 🌍
                                            </button>
                                            <button
                                                onClick={() => toggleShopPublish(false, 'all')}
                                                className="px-4 py-2 bg-gray-700 border border-gray-600 hover:bg-gray-600 text-gray-300 font-bold rounded-lg text-xs transition-all active:scale-95 whitespace-nowrap"
                                            >
                                                Kapat (Geri Çek) ❌
                                            </button>
                                        </div>
                                        {Object.keys(partyStats).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-700/50">
                                                <span className="text-[9px] text-gray-500 uppercase font-black w-full tracking-widest">Sadece Bu Oyuncuya Yolla:</span>
                                                {Object.entries(partyStats).map(([charName, stat]: [string, any]) => (
                                                    <button
                                                        key={charName}
                                                        onClick={() => toggleShopPublish(true, stat.id || charName)}
                                                        className="px-3 py-1 bg-gray-900 border border-gray-600 hover:border-orange-500 hover:bg-gray-800 text-orange-300 font-bold rounded-md text-[10px] transition-all shadow-sm"
                                                    >
                                                        {charName}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Yeni Eşya Ekleme Formu */}
                                <div className="flex flex-col md:flex-row gap-3 mb-6 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                                    <input type="text" placeholder="Eşya Adı (Örn: İyileşme İksiri)" value={newShopItem.name} onChange={e => setNewShopItem({ ...newShopItem, name: e.target.value })} className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors" />
                                    <div className="flex items-center bg-gray-900 border border-gray-600 rounded-lg px-3 focus-within:border-orange-500 transition-colors shrink-0">
                                        <input type="number" min="0" placeholder="Fiyat" value={newShopItem.price} onChange={e => setNewShopItem({ ...newShopItem, price: Number(e.target.value) })} className="w-16 bg-transparent text-white text-right outline-none py-3" />
                                        <span className="text-yellow-500 font-bold ml-2">GP</span>
                                    </div>
                                    <input type="text" placeholder="Özellik/Not" value={newShopItem.note} onChange={e => setNewShopItem({ ...newShopItem, note: e.target.value })} className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors" />
                                    <button onClick={addShopItem} className="bg-orange-600 hover:bg-orange-500 hover:scale-105 active:scale-95 text-white font-black rounded-lg px-6 py-3 transition-all shadow-md shrink-0 whitespace-nowrap">EKLE</button>
                                </div>

                                {/* Eşya Listesi */}
                                <div className="bg-gray-800/80 border border-gray-700 rounded-xl overflow-hidden flex-1 min-h-[300px] max-h-[400px] overflow-y-auto shadow-inner">
                                    {shopItems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12 px-6 text-center">
                                            <div className="text-6xl mb-4 opacity-30">🕸️</div>
                                            <p className="text-lg font-bold">Dükkan tamamen boş.</p>
                                            <p className="text-sm mt-2">Maceracılara satacak bir şeyler eklemek için yukarıdaki formu kullan.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-700/50">
                                            {shopItems.map(item => (
                                                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-700/50 transition-colors group">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="font-bold text-lg text-gray-100">{item.name}</span>
                                                            <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-700/50 rounded-lg px-2.5 py-1 text-sm font-black shadow-sm">{item.price} GP</span>
                                                        </div>
                                                        {item.note && <p className="text-gray-400 text-sm italic border-l-2 border-gray-600 pl-2 ml-1">{item.note}</p>}
                                                    </div>
                                                    <button onClick={() => removeShopItem(item.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-900/20 px-4 py-2 border border-transparent hover:border-red-500/30 rounded-lg transition-all text-sm font-bold shrink-0 self-start md:self-auto">Listeden Çıkar</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* ── DM EŞYA KİTABI (ITEM BOOK) MODALI ── */}
                {
                    isItemBookOpen && (
                        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 md:p-8 backdrop-blur-md animate-fade-in" onClick={() => setIsItemBookOpen(false)}>
                            <div className="bg-gray-900 border-4 border-blue-900 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col relative shadow-[0_0_50px_rgba(30,58,138,0.5)] overflow-hidden" onClick={e => e.stopPropagation()}>
                                {/* Header */}
                                <div className="p-6 border-b border-blue-900/50 bg-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center text-2xl border border-blue-500/50 shadow-lg">⚔️</div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Eşya Kitabı</h2>
                                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">{items.length} Toplam Eşya</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 max-w-md w-full relative group">
                                        <input
                                            type="text"
                                            placeholder="Eşya Ara (TR/EN, Tip, Nadirlik...)"
                                            value={itemSearchTerm}
                                            onChange={(e) => setItemSearchTerm(e.target.value)}
                                            className="w-full bg-gray-950 border-2 border-gray-700/50 rounded-xl px-12 py-3 text-white outline-none focus:border-blue-500 transition-all shadow-inner group-hover:border-gray-600"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:opacity-100 transition-opacity">🔍</span>
                                    </div>

                                    <button onClick={() => setIsItemBookOpen(false)} className="text-gray-400 hover:text-white text-3xl font-black w-10 h-10 flex items-center justify-center bg-gray-800 rounded-xl hover:bg-red-600 transition-all hover:rotate-90">✕</button>
                                </div>

                                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-950/20">
                                    {/* List */}
                                    <div className="w-full md:w-2/5 overflow-y-auto p-4 space-y-2 border-r border-blue-900/20 custom-scrollbar">
                                        {filteredItems.length === 0 ? (
                                            <div className="text-center py-20 text-gray-600 italic">Eşya bulunamadı.</div>
                                        ) : (
                                            filteredItems.map(item => (
                                                <div
                                                    key={item._id}
                                                    onClick={() => setSelectedItem(item)}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 flex justify-between items-center group
                                                        ${selectedItem?._id === item._id
                                                            ? 'bg-blue-900/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-800/80'}`}
                                                >
                                                    <div>
                                                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.name || item.name_tr}</h4>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className="text-[10px] font-black uppercase text-gray-500">{item.type || item.category || 'Eşya'}</span>
                                                            <span className={`text-[10px] font-black uppercase ${(item.rarity || '').toLowerCase().includes('legendary') ? 'text-orange-500' :
                                                                (item.rarity || '').toLowerCase().includes('very rare') ? 'text-purple-500' :
                                                                    (item.rarity || '').toLowerCase().includes('rare') ? 'text-blue-500' :
                                                                        (item.rarity || '').toLowerCase().includes('uncommon') ? 'text-green-500' : 'text-gray-500'
                                                                }`}>{item.rarity || 'Common'}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
                                                </div>
                                            ))
                                        )}
                                        {filteredItems.length >= 100 && (
                                            <div className="text-center p-4 text-[10px] text-gray-600 font-bold uppercase">Sadece ilk 100 sonuç gösteriliyor.</div>
                                        )}
                                    </div>

                                    {/* Detail */}
                                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                                        {selectedItem ? (
                                            <div className="animate-fade-in-up">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">{selectedItem.name || selectedItem.name_tr}</h3>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border-2 shadow-sm ${(selectedItem.rarity || '').toLowerCase().includes('legendary') ? 'bg-orange-600/20 border-orange-500 text-orange-400' :
                                                            (selectedItem.rarity || '').toLowerCase().includes('very rare') ? 'bg-purple-600/20 border-purple-500 text-purple-400' :
                                                                (selectedItem.rarity || '').toLowerCase().includes('rare') ? 'bg-blue-600/20 border-blue-500 text-blue-400' :
                                                                    (selectedItem.rarity || '').toLowerCase().includes('uncommon') ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-gray-800 border-gray-600 text-gray-400'
                                                            }`}>
                                                            {selectedItem.rarity || 'Common'}
                                                        </span>
                                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{selectedItem.type || selectedItem.category}</span>
                                                    </div>
                                                </div>

                                                {(selectedItem.weight || selectedItem.cost || selectedItem.damage) && (
                                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                                        {selectedItem.weight ? (
                                                            <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center">
                                                                <span className="text-xs text-gray-500 font-bold uppercase mb-1">Ağırlık</span>
                                                                <span className="text-xl font-black text-white">
                                                                    {typeof selectedItem.weight === 'object' ? selectedItem.weight.quantity : selectedItem.weight}
                                                                    <span className="text-xs opacity-50 ml-1">lb</span>
                                                                </span>
                                                            </div>
                                                        ) : <div className="hidden"></div>}
                                                        {selectedItem.cost ? (
                                                            <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center">
                                                                <span className="text-xs text-gray-500 font-bold uppercase mb-1">Maliyet</span>
                                                                <span className="text-xl font-black text-yellow-500">
                                                                    {typeof selectedItem.cost === 'object' ? `${selectedItem.cost.quantity} ${selectedItem.cost.unit}` : selectedItem.cost}
                                                                </span>
                                                            </div>
                                                        ) : <div className="hidden"></div>}
                                                        {selectedItem.damage ? (
                                                            <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center">
                                                                <span className="text-xs text-gray-500 font-bold uppercase mb-1">Hasar/Etki</span>
                                                                <span className="text-xl font-black text-red-500">
                                                                    {selectedItem.damage?.damage_dice || selectedItem.damage?.dice || selectedItem.damage}
                                                                </span>
                                                            </div>
                                                        ) : <div className="hidden"></div>}
                                                    </div>
                                                )}

                                                <div className="bg-gray-900/80 border-l-4 border-blue-600 p-6 rounded-r-xl mb-8 font-serif leading-relaxed text-gray-200">
                                                    <h5 className="font-sans text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Açıklama & Özellikler</h5>
                                                    <div className="whitespace-pre-wrap text-lg">
                                                        {selectedItem.description_tr || selectedItem.description || "Açıklama bulunamadı."}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-4 pt-4 border-t border-gray-800">
                                                    <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
                                                        <div className="flex-1">
                                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Dükkan Satış Fiyatı (GP)</label>
                                                            <input
                                                                type="number"
                                                                value={priceToSet}
                                                                onChange={(e) => setPriceToSet(Number(e.target.value))}
                                                                className="w-full bg-transparent text-yellow-500 font-black text-xl outline-none"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setShopItems([...shopItems, {
                                                                    id: Date.now().toString(),
                                                                    name: selectedItem.name_tr || selectedItem.name,
                                                                    price: priceToSet,
                                                                    note: selectedItem.type || selectedItem.category || ''
                                                                }]);
                                                                showToast("Dükkana Eklendi", `${selectedItem.name_tr || selectedItem.name} dükkan listesine ${priceToSet} GP fiyatla eklendi.`, "bg-orange-900 border-orange-500 text-orange-100");
                                                            }}
                                                            className="bg-orange-600 hover:bg-orange-500 text-white font-black px-6 py-3 rounded-lg transition-all shadow-lg shadow-orange-900/20 uppercase tracking-widest text-xs"
                                                        >
                                                            🏬 Dükkana Koy
                                                        </button>
                                                    </div>
                                                    <div className="w-full mt-2 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse"></span> Oyuncuya Doğrudan Gönder
                                                        </label>
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {Object.entries(partyStats || {}).map(([charName, ps]: [string, any]) => {
                                                                const isSelected = selectedPlayerToGift === (ps.characterId || ps.id);
                                                                return (
                                                                    <button
                                                                        key={ps.characterId || ps.id || charName}
                                                                        onClick={() => setSelectedPlayerToGift(ps.characterId || ps.id)}
                                                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all shadow-sm border ${isSelected ? 'bg-blue-600 border-blue-400 text-white shadow-blue-900/50 transform scale-105' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200 hover:border-gray-500'}`}
                                                                    >
                                                                        {ps.name || charName}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                if (!selectedPlayerToGift) return showToast("Hata", "Lütfen bir oyuncu seçin!", "bg-red-900 border-red-500 text-red-100");

                                                                try {
                                                                    const charRes = await axios.get(`${API_URL}/api/characters/${selectedPlayerToGift}`);
                                                                    const currentInv = charRes.data.inventory || [];
                                                                    const newItem = { ...selectedItem, id: `item-${Date.now()}`, isEquipped: false, qty: 1 };
                                                                    
                                                                    let updatedInv = [...currentInv];
                                                                    const existIdx = updatedInv.findIndex((i: any) => i.name?.toLowerCase() === newItem.name?.toLowerCase());
                                                                    if (existIdx >= 0) {
                                                                        updatedInv[existIdx] = { ...updatedInv[existIdx], qty: (updatedInv[existIdx].qty || 1) + 1 };
                                                                    } else {
                                                                        updatedInv.push(newItem);
                                                                    }

                                                                    await axios.put(`${API_URL}/api/characters/${selectedPlayerToGift}`, { inventory: updatedInv });

                                                                    if (socket) {
                                                                        socket.emit('update_character_stat', { campaignId, characterId: selectedPlayerToGift, stat: 'inventory', value: updatedInv });
                                                                    }

                                                                    showToast("Eşya Işınlandı!", `${selectedItem.name_tr || selectedItem.name}, oyuncunun envanterine uçtu!`, "bg-green-900 border-green-500 text-green-100");
                                                                    setSelectedPlayerToGift(null);
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    showToast("Hata", "Eşya verilemedi.", "bg-red-900 border-red-500 text-red-100");
                                                                }
                                                            }}
                                                            disabled={!selectedPlayerToGift}
                                                            className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 disabled:from-gray-800 disabled:to-gray-800 text-white disabled:text-gray-600 font-black px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-900/40 uppercase tracking-widest text-xs disabled:cursor-not-allowed"
                                                        >
                                                            🔥 GÖNDER
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-50 grayscale select-none">
                                                <div className="text-9xl mb-6">📜</div>
                                                <p className="text-xl font-bold uppercase tracking-widest">Detayları görmek için bir eşya seçin</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Parti Durumu Modal (NEW) */}
                {
                    isPartyStatusOpen && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setIsPartyStatusOpen(false)}>
                            <div className="bg-gray-900/90 backdrop-blur-2xl w-full max-w-4xl h-[80vh] rounded-3xl border border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center p-6 bg-gradient-to-b from-gray-800/80 to-transparent border-b border-gray-700/50">
                                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-3">
                                        🛡️ Parti Durum ve Yönetimi
                                    </h2>
                                    <button onClick={() => setIsPartyStatusOpen(false)} className="text-gray-400 hover:text-yellow-400 text-3xl transition-colors">&times;</button>
                                </div>

                                <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(partyStats || {}).map(([charId, stats]: any) => {
                                            if (!stats || typeof stats !== 'object') return null;
                                            const characterId = stats.characterId || stats.id || charId;
                                            const charName = stats.name || charId;
                                            return (
                                                <div key={characterId} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700 shadow-xl space-y-4 hover:border-yellow-500/30 transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-black text-white text-xl">{charName}</div>
                                                            <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
                                                                <span className="text-yellow-500">Sviye {stats.level || 1}</span>
                                                                {stats.subclass && <span className="text-purple-400 ml-2">— {stats.subclass}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button 
                                                                onClick={() => {
                                                                    if (socket) socket.emit('toggle_inspiration', { campaignId, characterId: stats.characterId || stats.id, value: !stats.inspiration });
                                                                }} 
                                                                className={`p-2 rounded-xl transition-all shadow-lg font-black ${stats.inspiration ? 'bg-yellow-500 text-yellow-950 shadow-yellow-500/50' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                                                title="Inspiration Ver/Al"
                                                            >
                                                                ⚡
                                                            </button>
                                                            <button onClick={() => openEditCharModal(stats.characterId || stats.id)} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-xl transition-all shadow-lg" title="Düzenle">⚙️</button>
                                                            <button onClick={() => { setTargetPetPlayerId(stats.characterId || stats.id); setIsPetModalOpen(true); }} className="bg-yellow-600 hover:bg-yellow-500 text-white p-2 rounded-xl transition-all shadow-lg" title="Pet Ver">🐾</button>
                                                            <button onClick={() => setWhisperPlayerName(charId)} className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl transition-all shadow-lg" title="Fısılda">💬</button>
                                                            <button onClick={() => deleteCharacter(stats.characterId || stats.id, charId)} className="bg-red-800 hover:bg-red-700 text-white p-2 rounded-xl transition-all shadow-lg" title="Karakteri Sil">🗑️</button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-end mb-1">
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Hit Points</span>
                                                            <span className={`font-mono font-black ${(stats.currentHp || 0) <= (stats.maxHp || 10) / 4 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                                                                {stats.currentHp || 0} / {stats.maxHp || "?"}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-950 rounded-full h-3 overflow-hidden border border-gray-800 shadow-inner">
                                                        <div
                                                                className={`h-full rounded-full transition-all duration-500 ${((stats.currentHp || 0) / (stats.maxHp || 1)) > 0.5 ? 'bg-gradient-to-r from-green-600 to-green-400' : ((stats.currentHp || 0) / (stats.maxHp || 1)) > 0.25 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-red-700 to-red-500 animate-pulse'}`}
                                                                style={{ width: `${Math.max(0, Math.min(100, ((stats.currentHp || 0) / (stats.maxHp || 1)) * 100))}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Spell Slots Usage */}
                                                    {stats.spellSlotsUsed && Object.keys(stats.spellSlotsUsed).length > 0 && (
                                                        <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/30">
                                                            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-2">Harcanan Büyü Slotları</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {Object.entries(stats.spellSlotsUsed).map(([level, used]: any) => (
                                                                    <div key={level} className="flex items-center gap-1.5 bg-indigo-900/40 px-2 py-1 rounded-lg border border-indigo-700/50">
                                                                        <span className="text-[10px] text-indigo-300 font-bold">{level}. Seviye:</span>
                                                                        <span className="text-sm font-black text-white">{used}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700/50 relative">
                                                        <button
                                                            onClick={() => setOpenConditionPickerId(openConditionPickerId === (stats.id || charId) ? null : (stats.id || charId))}
                                                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 hover:border-yellow-500 rounded-lg text-xs px-3 py-1 font-bold transition-all shadow-sm"
                                                        >
                                                            + Durum
                                                        </button>
                                                        
                                                        {openConditionPickerId === (stats.id || charId) && (
                                                            <div className="absolute top-10 left-0 bg-gray-900/95 backdrop-blur-xl border border-gray-600 rounded-xl p-3 shadow-2xl z-50 w-64 md:w-80 custom-scrollbar max-h-48 overflow-y-auto">
                                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1 border-b border-gray-700 pb-1">Uygulanacak Durumu Seç</div>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {['Kör', 'Büyülenmiş', 'Sağır', 'Korkmuş', 'Görünmez', 'Yerde', 'Zehirli', 'Baygın', 'Taşlaşmış', 'Kısıtlı', 'Paralize', 'Engellenmiş', 'Şaşırmış', 'Bitkinlik 1', 'Bitkinlik 2', 'Bitkinlik 3', 'Bitkinlik 4', 'Bitkinlik 5'].map(c => (
                                                                        <button
                                                                            key={c}
                                                                            onClick={() => {
                                                                                assignCondition(stats.id, charId, c, stats.conditions || []);
                                                                                setOpenConditionPickerId(null);
                                                                            }}
                                                                            className="bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all"
                                                                        >
                                                                            {c}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {stats.conditions && stats.conditions.map((c: string) => (
                                                            <span key={c}
                                                                onClick={() => assignCondition(stats.id, charId, c, stats.conditions)}
                                                                className="text-[10px] bg-red-900/40 text-red-300 px-2.5 py-1 rounded-lg border border-red-700/50 font-black uppercase tracking-widest cursor-pointer hover:bg-red-800 hover:text-white transition shadow-sm animate-pulse flex items-center gap-1"
                                                                title="Silmek için tıkla"
                                                            >
                                                                <span className="opacity-70 text-sm">⚠️</span> {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* DM PARTY VAULT DELEGATION PANEL */}
                                    <div className="mt-8 border-t border-gray-700/50 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                                        
                                        {/* Ortak Kasa Yönetimi (Sol 2 sütun) */}
                                        <div className="lg:col-span-2 bg-gray-900/50 rounded-2xl border border-yellow-700/30 overflow-hidden shadow-inner flex flex-col">
                                            <div className="bg-gradient-to-r from-yellow-900/40 to-transparent p-4 border-b border-yellow-700/30 flex justify-between items-center relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none"></div>
                                                <h3 className="text-yellow-500 font-black uppercase tracking-widest flex items-center gap-2 relative z-10">
                                                    🎒 Ortak Kasa (Party Vault)
                                                </h3>
                                            </div>
                                            <div className="p-4 flex-1 overflow-y-auto max-h-64 custom-scrollbar">
                                                {partyInventory?.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {partyInventory.map((item: any, idx: number) => (
                                                            <div key={idx} className="bg-gray-800/80 border border-gray-700 hover:border-yellow-700/50 rounded-xl p-3 flex flex-col transition-all group shadow-sm">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex items-center bg-gray-900 rounded border border-gray-700 overflow-hidden shrink-0 shadow-inner">
                                                                            <button onClick={() => updatePartyItemQty(idx, -1)} className="text-red-400 hover:bg-gray-700 px-2.5 py-1 text-sm font-black transition">-</button>
                                                                            <span className="font-black text-xs text-yellow-300 w-6 text-center">{item.qty || 1}</span>
                                                                            <button onClick={() => updatePartyItemQty(idx, 1)} className="text-green-400 hover:bg-gray-700 px-2.5 py-1 text-sm font-black transition">+</button>
                                                                        </div>
                                                                        <span className="font-bold text-sm text-yellow-100">{item.name}</span>
                                                                    </div>
                                                                    <button onClick={() => removePartyItem(idx)} className="text-gray-500 hover:text-red-400 text-xs px-2 py-1 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-all shadow-sm">Sil</button>
                                                                </div>
                                                                {item.note && <p className="text-gray-400 text-[11px] italic border-l-2 border-yellow-900/50 pl-2 ml-1">{item.note}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-yellow-700/40 text-center py-8 italic font-bold text-sm">Kasada hiç eşya yok.</p>
                                                )}
                                            </div>
                                            {/* Yeni Eşya Ekle Formu */}
                                            <div className="bg-gray-800/80 p-3 border-t border-yellow-700/30 flex flex-nowrap items-center gap-2">
                                                <input type="text" value={newPartyItemName} onChange={e => setNewPartyItemName(e.target.value)} placeholder="Kasaya Eşya Ekle..." className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-yellow-100 placeholder-gray-600 focus:border-yellow-600/50 outline-none transition-colors" />
                                                <input type="number" min="1" value={newPartyItemQty} onChange={e => setNewPartyItemQty(Number(e.target.value) || 1)} className="w-16 bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-yellow-300 focus:border-yellow-600/50 outline-none text-center font-bold transition-colors" />
                                                <button onClick={addPartyItem} disabled={!newPartyItemName.trim()} className="bg-yellow-700/80 hover:bg-yellow-600 disabled:opacity-30 border border-yellow-500/50 rounded-lg px-4 py-1.5 text-xs font-black text-yellow-100 transition-colors shadow-lg">GÖNDER</button>
                                            </div>
                                        </div>

                                        {/* Ortak Altın Yönetimi (Sağ sütun) */}
                                        <div className="bg-gradient-to-br from-yellow-950/40 via-gray-900 to-gray-900 rounded-2xl border border-yellow-600/30 p-5 shadow-inner flex flex-col justify-center items-center text-center space-y-4 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-colors duration-700"></div>
                                            <div className="relative z-10 w-full">
                                                <div className="text-yellow-500/80 font-black text-[10px] uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                                                    <span>💰</span> Parti Cüzdanı
                                                </div>
                                                <div className="text-4xl font-black text-white drop-shadow-md tracking-tighter">
                                                    {partyGold ? partyGold.toLocaleString() : '0'} <span className="text-yellow-500 text-base opacity-80 tracking-normal inline-block transform -translate-y-1">GP</span>
                                                </div>
                                            </div>
                                            <div className="w-full relative z-10 pt-4 border-t border-yellow-700/20">
                                                <input type="number" value={partyGoldInput} onChange={e => setPartyGoldInput(e.target.value)} placeholder="Tutar..." className="w-full bg-black/40 border border-yellow-900/50 rounded-lg px-3 py-2 text-center text-sm text-yellow-200 font-bold mb-3 focus:outline-none focus:border-yellow-500/50 transition-colors shadow-inner" />
                                                <div className="flex gap-2 justify-center w-full">
                                                    <button onClick={() => handleUpdatePartyGold('sub')} disabled={!partyGoldInput} className="flex-1 bg-gradient-to-t from-red-900/80 to-red-800/60 hover:from-red-800 hover:to-red-700 disabled:opacity-30 border border-red-700/50 rounded-lg py-2 text-[10px] font-black text-red-100 uppercase tracking-widest transition-all shadow-md">Eksilt</button>
                                                    <button onClick={() => handleUpdatePartyGold('add')} disabled={!partyGoldInput} className="flex-1 bg-gradient-to-t from-green-900/80 to-green-800/60 hover:from-green-800 hover:to-green-700 disabled:opacity-30 border border-green-700/50 rounded-lg py-2 text-[10px] font-black text-green-100 uppercase tracking-widest transition-all shadow-md">Ekle</button>
                                                </div>
                                                <button onClick={() => handleUpdatePartyGold('set')} disabled={!partyGoldInput} className="w-full mt-2 bg-yellow-900/20 hover:bg-yellow-900/40 disabled:opacity-30 border border-yellow-700/30 hover:border-yellow-600/50 rounded-lg py-1.5 text-[10px] font-bold text-yellow-400 uppercase tracking-widest transition-all">Net Eşitle</button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Grid Map Modalı */}
                {
                    isMapOpen && (
                        <div className="fixed inset-0 bg-[#020617]/98 z-[150] flex flex-col p-6 backdrop-blur-2xl animate-fade-in overflow-hidden">
                            {/* Map Header & Controls */}
                            <div className="flex flex-col gap-6 mb-8 bg-slate-900/40 p-8 rounded-[2rem] border border-slate-700/40 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 opacity-30"></div>
                                
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-900/40 transform group-hover:rotate-6 transition-transform">
                                            <span className="text-2xl">🗺️</span>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Stratejik Harita Paneli</h2>
                                            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-0.5">Savaş Alanı ve Görüş Yönetimi</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/50 mr-4">
                                            <button
                                                onClick={async () => {
                                                    const ok = await confirm({
                                                        title: "Haritayı Gizle",
                                                        message: "Tüm haritayı GİZLEMEK istediğine emin misin?",
                                                        confirmText: "Sisle Kapla",
                                                        severity: "warning"
                                                    });
                                                    if (!ok) return;
                                                    
                                                    // Generate a large grid (e.g., 50x50) to hide everything
                                                    const fullFog = [];
                                                    for (let x = 0; x < 50; x++) {
                                                        for (let y = 0; y < 50; y++) {
                                                            fullFog.push(`${x},${y}`);
                                                        }
                                                    }
                                                    socket?.emit('update_fog', { campaignId, fogOfWar: fullFog });
                                                    showToast("Sis Yayılıyor", "Tüm alanlar gizlendi.", "bg-slate-900 border-slate-500 text-white");
                                                }}
                                                className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                                title="Tüm haritayı sisle kapla"
                                            >
                                                🌑 Hepsini Gizle
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const ok = await confirm({
                                                        title: "Haritayı Aç",
                                                        message: "Tüm haritayı AÇMAK istediğine emin misin?",
                                                        confirmText: "Sisi Kaldır",
                                                        severity: "info"
                                                    });
                                                    if (ok) {
                                                        socket?.emit('update_fog', { campaignId, fogOfWar: [] });
                                                        showToast("Sis Dağıldı", "Tüm harita oyunculara açıldı.", "bg-blue-900 border-blue-500 text-white");
                                                    }
                                                }}
                                                className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                                title="Sisi tamamen kaldır"
                                            >
                                                ☀️ Hepsini Aç
                                            </button>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: "Tokenları Temizle",
                                                    message: "Tüm tokenları haritadan silmek istediğine emin misin?",
                                                    confirmText: "Hepsini Sil",
                                                    severity: "danger"
                                                });
                                                if (ok) {
                                                    const newMap = { ...mapData, tokens: [] };
                                                    setMapData(newMap);
                                                    socket?.emit('update_map', { campaignId, mapData: newMap });
                                                }
                                            }}
                                            className="bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 font-black py-3 px-6 rounded-2xl transition-all border border-slate-700 hover:border-red-900/50 text-xs uppercase tracking-widest"
                                        >
                                            🧹 Temizle
                                        </button>
                                        <button
                                            onClick={() => setIsMapOpen(false)}
                                            className="bg-red-600 hover:bg-red-500 text-white w-14 h-14 rounded-2xl font-black flex items-center justify-center shadow-xl shadow-red-900/40 transition-all hover:scale-105 active:scale-95 group/close"
                                        >
                                            <span className="text-xl group-hover:rotate-180 transition-transform duration-500">✕</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-8 relative z-10 border-t border-slate-800/40 pt-6">
                                    {/* URL & File Input Group */}
                                    <div className="flex-1 min-w-[400px] flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🖼️</div>
                                                <input
                                                    type="text"
                                                    placeholder="Harita URL (JPG/PNG)..."
                                                    value={mapData.bgUrl || ''}
                                                    onChange={(e) => {
                                                        const newMap = { ...mapData, bgUrl: e.target.value };
                                                        setMapData(newMap);
                                                        socket?.emit('update_map', { campaignId, mapData: newMap });
                                                    }}
                                                    className="w-full bg-slate-950/60 border border-slate-700/50 rounded-2xl pl-12 pr-5 py-3 text-sm text-blue-100 outline-none focus:border-blue-500/50 transition-all focus:ring-4 focus:ring-blue-500/10 placeholder-slate-600 shadow-inner"
                                                />
                                            </div>
                                            <label className="bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer rounded-2xl px-6 flex items-center justify-center transition-all shadow-md group">
                                                <span className="text-xl group-hover:-translate-y-1 transition-transform">📂</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const newMap = { ...mapData, bgUrl: reader.result as string };
                                                            setMapData(newMap);
                                                            socket?.emit('update_map', { campaignId, mapData: newMap });
                                                            showToast('Harita Yüklendi', 'Cihazdan seçilen harita oyuna aktarıldı.', 'bg-blue-900 border-blue-500 text-white');
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        
                                        <div className="flex gap-2 flex-wrap">
                                            {MAP_TEMPLATES.filter(t => t.url).map(t => (
                                                <button 
                                                    key={t.name}
                                                    onClick={() => {
                                                        const newMap = { ...mapData, bgUrl: t.url };
                                                        setMapData(newMap);
                                                        socket?.emit('update_map', { campaignId, mapData: newMap });
                                                        showToast('Harita Değişti', `${t.name} haritası başarıyla yüklendi.`, 'bg-green-900 border-green-500 text-white');
                                                    }}
                                                    className="bg-slate-900/40 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 text-[10px] text-slate-300 px-3 py-1.5 rounded-lg active:scale-95 transition-all uppercase tracking-widest font-black"
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visual Toggles & Sliders */}
                                    <div className="flex items-center gap-10">
                                        <label className="flex items-center gap-4 text-xs font-black text-slate-400 cursor-pointer group/toggle">
                                            <span className="group-hover/toggle:text-white transition-colors uppercase tracking-widest">Izgara</span>
                                            <div className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${mapData.showGrid ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-slate-800 border border-slate-700'}`}>
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${mapData.showGrid ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={mapData.showGrid}
                                                onChange={(e) => {
                                                    const newMap = { ...mapData, showGrid: e.target.checked };
                                                    setMapData(newMap);
                                                    socket?.emit('update_map', { campaignId, mapData: newMap });
                                                }}
                                            />
                                        </label>

                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                                <span>Grid</span>
                                                <span className="text-blue-400">%{mapData.gridSize}</span>
                                            </div>
                                            <input
                                                type="range" min="10" max="150" value={mapData.gridSize}
                                                onChange={(e) => {
                                                    const newMap = { ...mapData, gridSize: parseInt(e.target.value) };
                                                    setMapData(newMap);
                                                    socket?.emit('update_map', { campaignId, mapData: newMap });
                                                }}
                                                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                                <span>Zoom</span>
                                                <span className="text-purple-400">%{mapData.mapZoom || 100}</span>
                                            </div>
                                            <input
                                                type="range" min="10" max="300" value={mapData.mapZoom || 100}
                                                onChange={(e) => {
                                                    const newMap = { ...mapData, mapZoom: parseInt(e.target.value) };
                                                    setMapData(newMap);
                                                    socket?.emit('update_map', { campaignId, mapData: newMap });
                                                }}
                                                className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            (partyStats ? Object.entries(partyStats) : []).forEach(([id, stats]: [any, any]) => {
                                                if (!stats || typeof stats !== 'object') return;
                                                const charName = stats.name || 'Oyuncu';
                                                if (!(mapData.tokens || []).find(t => t && t.name === charName && t.type === 'player')) {
                                                    addTokenToMap(charName, 'player', '#3b82f6', stats.characterId || id);
                                                }
                                            });
                                        }}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black py-4 px-8 rounded-[1.25rem] shadow-xl shadow-blue-900/30 transition-all text-xs uppercase tracking-widest active:scale-95"
                                    >
                                        👥 Oyuncuları Getir
                                    </button>
                                </div>
                            </div>

                            {/* Map Content Area */}
                            <div
                                id="map-container"
                                className="flex-1 bg-[#020617] rounded-[3rem] border-[12px] border-slate-900/80 relative overflow-hidden shadow-[inset_0_40px_100px_rgba(0,0,0,0.9)] cursor-grab active:cursor-grabbing group/map"
                                onMouseDown={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (target.id === 'map-container' || target.id === 'grid-overlay' || target.id === 'map-img') {
                                        setIsPanning(true);
                                        setPanStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
                                    }
                                }}
                                onMouseMove={(e) => {
                                    if (isPanning) {
                                        setMapOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
                                    }
                                }}
                                onMouseUp={() => setIsPanning(false)}
                                onMouseLeave={() => setIsPanning(false)}
                                onWheel={(e) => {
                                    const delta = e.deltaY > 0 ? -10 : 10;
                                    const newZoom = Math.min(Math.max(10, (mapData.mapZoom || 100) + delta), 300);
                                    const newMap = { ...mapData, mapZoom: newZoom };
                                    setMapData(newMap);
                                    socket?.emit('update_map', { campaignId, mapData: newMap });
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (!isDraggingToken) return;
                                    const container = document.getElementById('map-container');
                                    if (!container) return;
                                    const rect = container.getBoundingClientRect();
                                    const zoom = (mapData.mapZoom || 100) / 100;
                                    const x = (e.clientX - rect.left - mapOffset.x) / zoom;
                                    const y = (e.clientY - rect.top - mapOffset.y) / zoom;
                                    const newTokens = (mapData.tokens || []).map(t => t && t.id === isDraggingToken ? { ...t, x, y } : t);
                                    const newMap = { ...mapData, tokens: newTokens };
                                    setMapData(newMap);
                                    socket?.emit('move_token', { campaignId, tokenId: isDraggingToken, x, y });
                                    socket?.emit('update_map', { campaignId, mapData: newMap });
                                    setIsDraggingToken(null);
                                }}
                            >
                                {/* DM Help Hint */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[200] bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover/map:opacity-100 transition-opacity pointer-events-none">
                                    🐭 Sağ tık: Sisi Kaldır/Ekle | 🖱️ Orta tuş/Sürükle: Kaydır | 🎡 Tekerlek: Zoom
                                </div>

                                <div
                                    className="origin-top-left absolute transition-transform duration-100 ease-out"
                                    style={{
                                        transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${(mapData.mapZoom || 100) / 100})`,
                                    }}
                                >
                                    {/* Background Image */}
                                    {mapData.bgUrl && (
                                        <img
                                            id="map-img"
                                            src={mapData.bgUrl}
                                            alt="Map"
                                            draggable={false}
                                            className="max-w-none shadow-[0_0_150px_rgba(0,0,0,0.8)] select-none pointer-events-auto rounded-lg"
                                        />
                                    )}

                                    {/* Grid Overlay */}
                                    {mapData.showGrid && (
                                        <div
                                            id="grid-overlay"
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                const target = e.currentTarget;
                                                const rect = target.getBoundingClientRect();
                                                const scale = (mapData.mapZoom || 100) / 100;
                                                const x = (e.clientX - rect.left) / scale;
                                                const y = (e.clientY - rect.top) / scale;
                                                const gridX = Math.floor(x / mapData.gridSize);
                                                const gridY = Math.floor(y / mapData.gridSize);
                                                const coord = `${gridX},${gridY}`;
                                                const newFog = (fogOfWar as string[]).includes(coord) 
                                                    ? (fogOfWar as string[]).filter(c => c !== coord) 
                                                    : [...(fogOfWar as string[]), coord];
                                                socket?.emit('update_fog', { campaignId, fogOfWar: newFog });
                                            }}
                                            className="absolute inset-0 pointer-events-auto"
                                            style={{
                                                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                                backgroundSize: `${mapData.gridSize}px ${mapData.gridSize}px`,
                                                width: '100%',
                                                height: '100%',
                                                left: 0,
                                                top: 0
                                            }}
                                        >
                                            {/* DM View of Fog (Semi-transparent) */}
                                            {(fogOfWar as string[]).map(coord => {
                                                const [gx, gy] = coord.split(',').map(Number);
                                                return (
                                                    <div 
                                                        key={coord}
                                                        className="absolute bg-red-950/20 backdrop-blur-[1px] border border-red-500/10 pointer-events-none flex items-center justify-center overflow-hidden"
                                                        style={{
                                                            left: gx * mapData.gridSize,
                                                            top: gy * mapData.gridSize,
                                                            width: mapData.gridSize,
                                                            height: mapData.gridSize
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(239,68,68,0.1)_0%,transparent_70%)]"></div>
                                                        <span className="text-[8px] font-black text-red-500/40 rotate-45 pointer-events-none select-none uppercase">Gizli</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Tokens */}
                                    {(mapData?.tokens || []).map((token) => {
                                        if (!token) return null;
                                        const tSizeRaw = token.size || 1;
                                        const pxSize = tSizeRaw * 56;
                                        const pxOffset = pxSize / 2;
                                        
                                        return (
                                            <div
                                                key={token.id}
                                                draggable
                                                onDragStart={() => setIsDraggingToken(token.id)}
                                                onWheel={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    const deltaSize = e.deltaY > 0 ? -0.25 : 0.25;
                                                    const newTSize = Math.max(0.5, Math.min(6, tSizeRaw + deltaSize));
                                                    const newTokens = mapData.tokens.map(t => t && t.id === token.id ? { ...t, size: newTSize } : t);
                                                    const newMap = { ...mapData, tokens: newTokens };
                                                    setMapData(newMap);
                                                    socket?.emit('update_map', { campaignId, mapData: newMap });
                                                }}
                                                className="absolute rounded-full border-[3px] border-white/90 shadow-[0_15px_35px_rgba(0,0,0,0.7)] flex items-center justify-center font-black cursor-grab active:cursor-grabbing select-none group transition-all"
                                                style={{
                                                    width: pxSize,
                                                    height: pxSize,
                                                    left: (token.x || 0) - pxOffset,
                                                    top: (token.y || 0) - pxOffset,
                                                    backgroundColor: token.color || '#ef4444',
                                                    boxShadow: `0 0 25px ${token.color || '#ef4444'}66, 0 10px 40px rgba(0,0,0,0.8), inset 0 0 10px rgba(0,0,0,0.3)`,
                                                    zIndex: 50
                                                }}
                                            >
                                                {/* Token Glow Effect */}
                                                <div className="absolute inset-0 rounded-full animate-pulse opacity-40 blur-md pointer-events-none" style={{ backgroundColor: token.color }}></div>
                                                
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700 px-4 py-1.5 rounded-xl text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all shadow-2xl backdrop-blur-xl scale-90 group-hover:scale-100 group-hover:-translate-y-1">
                                                    {token.name || '??'}
                                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-slate-700 rotate-45"></div>
                                                </div>
                                                <div className="text-white text-center leading-none uppercase tracking-tighter drop-shadow-2xl z-10" style={{ fontSize: `${pxSize * 0.3}px`}}>
                                                    {(token.name || '??').substring(0, 2)}
                                                </div>
                                                
                                                {/* Edit Size Buttons */}
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newTSize = Math.max(0.5, tSizeRaw - 0.25);
                                                        const newMap = { ...mapData, tokens: mapData.tokens.map(t => t && t.id === token.id ? { ...t, size: newTSize } : t) };
                                                        setMapData(newMap);
                                                        socket?.emit('update_map', { campaignId, mapData: newMap });
                                                    }} className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg border border-slate-600 cursor-pointer transition">-</button>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newTSize = Math.min(6, tSizeRaw + 0.25);
                                                        const newMap = { ...mapData, tokens: mapData.tokens.map(t => t && t.id === token.id ? { ...t, size: newTSize } : t) };
                                                        setMapData(newMap);
                                                        socket?.emit('update_map', { campaignId, mapData: newMap });
                                                    }} className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg border border-slate-600 cursor-pointer transition">+</button>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newTokens = mapData.tokens.filter(t => t && t.id !== token.id);
                                                        const newMap = { ...mapData, tokens: newTokens };
                                                        setMapData(newMap);
                                                        socket?.emit('update_map', { campaignId, mapData: newMap });
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 w-7 h-7 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 hover:rotate-90 transition-all border-2 border-white/50 text-white shadow-[0_4px_15px_rgba(239,68,68,0.5)] z-20"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {!mapData.bgUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-800 flex-col gap-10 p-20 min-h-[800px] min-w-[1200px]">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full"></div>
                                                <div className="w-40 h-40 bg-slate-900/80 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-2xl border border-slate-800 relative z-10 animate-bounce">🗺️</div>
                                            </div>
                                            <div className="text-center space-y-4 max-w-md relative z-10">
                                                <p className="text-4xl font-black text-white/50 uppercase tracking-[0.3em] italic">Harita Bekleniyor</p>
                                                <p className="text-slate-500 font-bold leading-relaxed text-sm">Üst panelden bir şablon seçin, URL yapıştırın veya kendi savaş haritanızı yükleyerek macerayı başlatın.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- PET / COMPANION MODAL --- */}
                {
                    isPetModalOpen && (
                        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-white">
                            <div className="bg-gray-900 border-4 border-yellow-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                                <button onClick={() => setIsPetModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold text-2xl">✕</button>
                                <h2 className="text-3xl font-black text-yellow-500 mb-6 flex items-center gap-3 uppercase tracking-tighter">🐾 Yeni Yoldaş / Pet Ver</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Adı</label>
                                            <input type="text" value={newPet.name} onChange={e => setNewPet({ ...newPet, name: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 outline-none focus:border-yellow-500" placeholder="Örn: Zeytin" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Türü</label>
                                            <input type="text" value={newPet.type} onChange={e => setNewPet({ ...newPet, type: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 outline-none focus:border-yellow-500" placeholder="Örn: Bozkurt" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Max HP</label>
                                            <input type="number" value={newPet.maxHp} onChange={e => setNewPet({ ...newPet, maxHp: Number(e.target.value), hp: Number(e.target.value) })} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 outline-none focus:border-yellow-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">AC</label>
                                            <input type="number" value={newPet.ac} onChange={e => setNewPet({ ...newPet, ac: Number(e.target.value) })} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 outline-none focus:border-yellow-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Target</label>
                                            <div className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 truncate text-xs font-bold">
                                                {targetPetPlayerId ? (Object.values(partyStats || {}).find((s: any) => s && (s.characterId === targetPetPlayerId || s.id === targetPetPlayerId)) as any)?.name || targetPetPlayerId : 'Seçilmedi'}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Notlar / Özellikler</label>
                                        <textarea value={newPet.notes} onChange={e => setNewPet({ ...newPet, notes: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 h-24 outline-none focus:border-yellow-500 resize-none" placeholder="Özel yetenekler veya hikaye..." />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!newPet.name || !targetPetPlayerId) {
                                                await alert({
                                                    title: "Eksik Bilgi",
                                                    message: "İsim ve hedef oyuncu gerekli!",
                                                    severity: "warning"
                                                });
                                                return;
                                            }
                                            try {
                                                const charRes = await axios.get(`${API_URL}/api/characters/${targetPetPlayerId}`);
                                                const currentCompanions = charRes.data.companions || [];
                                                const newCompanions = [...currentCompanions, { ...newPet, id: `pet-${Date.now()}` }];
                                                await axios.put(`${API_URL}/api/characters/${targetPetPlayerId}`, { companions: newCompanions });
                                                
                                                await alert({
                                                    title: "Başarılı",
                                                    message: `${newPet.name} başarıyla verildi!`,
                                                    severity: "success"
                                                });
                                                
                                                setIsPetModalOpen(false);
                                                setNewPet({ name: '', hp: 10, maxHp: 10, ac: 10, type: '', notes: '' });
                                            } catch (err) {
                                                console.error(err);
                                                await alert({
                                                    title: "Hata",
                                                    message: "Pet verilirken hata oluştu.",
                                                    severity: "danger"
                                                });
                                            }
                                        }}
                                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-black py-4 rounded-xl shadow-lg shadow-yellow-900/40 transition-all uppercase tracking-widest mt-4"
                                    >
                                        Yoldaşı Ver
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- USER MANAGEMENT MODAL --- */}
                {
                    isUserManagementOpen && user?.username === 'SystemAdmin' && (
                        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-8 backdrop-blur-md animate-fade-in text-white">
                            <div className="bg-gray-900 border-2 border-blue-600 rounded-3xl w-full max-w-3xl h-[80vh] flex flex-col relative shadow-[0_0_50px_rgba(30,58,138,0.5)] overflow-hidden">
                                {/* Header */}
                                <div className="bg-blue-950/40 p-6 border-b border-blue-800/50 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">👥</div>
                                        <div>
                                            <h2 className="text-2xl font-black text-blue-400 uppercase tracking-tighter">Sistem Kullanıcı Yönetimi</h2>
                                            <p className="text-blue-200/60 text-xs font-bold uppercase tracking-widest">Tüm kullanıcılar ve yetkiler</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsUserManagementOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all text-2xl">✕</button>
                                </div>

                                {/* Summary */}
                                <div className="p-4 bg-gray-950/40 border-b border-gray-800">
                                    <div className="flex items-center justify-between px-4">
                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Kayıtlı Kullanıcı Sayısı: {allUsers.length}</span>
                                        <span className="text-[10px] text-blue-500/60 font-bold italic">Sadece SystemAdmin Yetkisidir</span>
                                    </div>
                                </div>

                                {/* User List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {(allUsers || []).map(u => (
                                        u && (
                                            <div key={u._id} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-500/50 hover:bg-gray-800/60 transition-all shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${u.role === 'DM' ? 'bg-red-950/40 border-red-900/50 text-red-400' : 'bg-green-950/40 border-green-900/50 text-green-400'}`}>
                                                        {u.role?.[0] || 'P'}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black text-lg flex items-center gap-2">
                                                            {u.username}
                                                            {u.username === 'SystemAdmin' && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">ANA HESAP</span>}
                                                        </div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{u.role} · ID: {u._id.slice(-6)}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {u.username !== 'SystemAdmin' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleRenameUser(u._id, u.username)}
                                                                className="bg-gray-700 hover:bg-blue-900/40 text-gray-300 hover:text-blue-400 text-[11px] font-black py-2 px-3 rounded-xl border border-gray-600 hover:border-blue-500/50 transition-all uppercase tracking-wider"
                                                            >
                                                                İsim
                                                            </button>
                                                            <button
                                                                onClick={() => handleResetPassword(u._id, u.username)}
                                                                className="bg-gray-700 hover:bg-yellow-900/40 text-gray-300 hover:text-yellow-400 text-[11px] font-black py-2 px-3 rounded-xl border border-gray-600 hover:border-yellow-500/50 transition-all uppercase tracking-wider"
                                                            >
                                                                Şifre
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u._id, u.username)}
                                                                className="bg-gray-700 hover:bg-red-900/40 text-gray-300 hover:text-red-400 text-[11px] font-black py-2 px-3 rounded-xl border border-gray-600 hover:border-red-500/50 transition-all uppercase tracking-wider"
                                                            >
                                                                Sil
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>

                                <div className="p-4 bg-gray-950 border-t border-gray-800 text-center">
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">Kritik sistem değişiklikleri gerçek zamanlı kaydedilir.</p>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* --- NPC SHEET MODAL (Combat Tracker Viewer) --- */}
                {
                    viewingNpcSheetData && (
                        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-white" onClick={() => setViewingNpcSheetData(null)}>
                            <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700 flex justify-between items-center relative">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-wide z-10 relative">
                                            {viewingNpcSheetData.name}
                                        </h2>
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            Seviye {viewingNpcSheetData.level} {viewingNpcSheetData.raceRef?.name || viewingNpcSheetData.race} {viewingNpcSheetData.classRef?.name || viewingNpcSheetData.class}
                                        </div>
                                    </div>
                                    <button onClick={() => setViewingNpcSheetData(null)} className="text-gray-500 hover:text-red-500 font-bold text-3xl transition-colors z-10">&times;</button>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-8">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-6 gap-2 bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
                                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(stat => (
                                            <div key={stat} className="text-center bg-gray-900 border border-gray-700 rounded-xl p-2 shadow-inner">
                                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat}</div>
                                                <div className="text-xl font-bold text-yellow-500">{viewingNpcSheetData.stats?.[stat] || 10}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                    {(viewingNpcSheetData.stats?.[stat] ? Math.floor((viewingNpcSheetData.stats[stat] - 10) / 2) : 0) >= 0 ? '+' : ''}
                                                    {viewingNpcSheetData.stats?.[stat] ? Math.floor((viewingNpcSheetData.stats[stat] - 10) / 2) : 0}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Combat Block */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-center">
                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">HP</div>
                                            <div className="text-2xl font-black text-green-500 mt-1">{viewingNpcSheetData.maxHp}</div>
                                        </div>
                                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-center">
                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">AC</div>
                                            <div className="text-2xl font-black text-blue-500 mt-1">{viewingNpcSheetData.ac}</div>
                                        </div>
                                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-center">
                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Speed</div>
                                            <div className="text-2xl font-black text-gray-300 mt-1">{viewingNpcSheetData.speed}</div>
                                        </div>
                                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-center">
                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Proficiency</div>
                                            <div className="text-2xl font-black text-purple-500 mt-1">+{Math.ceil(viewingNpcSheetData.level / 4) + 1}</div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Left Col: Features */}
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-black text-red-400 uppercase tracking-widest border-b border-red-900/50 pb-2 mb-3">Sınıf Özellikleri</h3>
                                                {viewingNpcSheetData.classFeatures?.length > 0 ? (
                                                    <ul className="space-y-3">
                                                        {viewingNpcSheetData.classFeatures.map((f: any, i: number) => (
                                                            <li key={i} className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50">
                                                                <div className="font-bold text-gray-200">{f.name}</div>
                                                                <div className="text-xs text-gray-400 mt-1">{f.desc}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : <div className="text-gray-500 italic text-sm">Özellik bulunmuyor.</div>}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-black text-yellow-400 uppercase tracking-widest border-b border-yellow-900/50 pb-2 mb-3">Irk Özellikleri</h3>
                                                {viewingNpcSheetData.raceFeatures?.length > 0 ? (
                                                    <ul className="space-y-3">
                                                        {viewingNpcSheetData.raceFeatures.map((f: any, i: number) => (
                                                            <li key={i} className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50">
                                                                <div className="font-bold text-gray-200">{f.name}</div>
                                                                <div className="text-xs text-gray-400 mt-1">{f.desc}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : <div className="text-gray-500 italic text-sm">Katman özelliği bulunmuyor.</div>}
                                            </div>
                                        </div>

                                        {/* Right Col: Spells & Items */}
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-black text-purple-400 uppercase tracking-widest border-b border-purple-900/50 pb-2 mb-3">Büyüler</h3>
                                                {viewingNpcSheetData.spells?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {viewingNpcSheetData.spells.map((s: any, i: number) => (
                                                            <div key={i} className="bg-purple-900/30 text-purple-300 px-3 py-1.5 rounded-lg border border-purple-500/30 text-xs font-bold shadow-sm">
                                                                {s.name} <span className="opacity-50 ml-1">Lvl {s.level || 0}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <div className="text-gray-500 italic text-sm">Büyü bilmiyor.</div>}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-black text-blue-400 uppercase tracking-widest border-b border-blue-900/50 pb-2 mb-3">Envanter</h3>
                                                {viewingNpcSheetData.inventory?.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {viewingNpcSheetData.inventory.map((item: any, i: number) => (
                                                            <li key={i} className="bg-gray-800/40 p-2 rounded-xl flex items-center justify-between border border-gray-700/50">
                                                                <span className="font-bold text-sm text-gray-300">{item.name}</span>
                                                                <span className="text-xs bg-gray-900 px-2 py-0.5 rounded text-gray-400 border border-gray-700">x{item.quantity || 1}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : <div className="text-gray-500 italic text-sm">Envanteri boş.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- QUEST TRACKER MODAL --- */}
                {isQuestMenuOpen && (
                    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsQuestMenuOpen(false)}>
                        <div className="bg-gray-900 border border-emerald-900/50 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-emerald-950/20 p-6 border-b border-emerald-900/30 flex justify-between items-center">
                                <h2 className="text-3xl font-black text-emerald-400 flex items-center gap-3">📜 Görev Takibi</h2>
                                <button onClick={() => setIsQuestMenuOpen(false)} className="text-gray-500 hover:text-white text-3xl font-black">&times;</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                                {/* New Quest Form */}
                                <div className="bg-gray-950/50 border border-emerald-900/20 p-6 rounded-2xl space-y-4">
                                    <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Yeni Görev Ekle</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input id="q-title" type="text" placeholder="Görev Başlığı" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                        <input id="q-rewards" type="text" placeholder="Ödüller (XP, GP, Eşya...)" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                    </div>
                                    <textarea id="q-desc" placeholder="Görev Açıklaması" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 h-24"></textarea>
                                    <button onClick={async () => {
                                        const title = (document.getElementById('q-title') as HTMLInputElement).value;
                                        const desc = (document.getElementById('q-desc') as HTMLTextAreaElement).value;
                                        const rewards = (document.getElementById('q-rewards') as HTMLInputElement).value;
                                        if (!title) {
                                            await alert({
                                                title: "Eksik Bilgi",
                                                message: "Başlık gerekli!",
                                                severity: "warning"
                                            });
                                            return;
                                        }
                                        
                                        try {
                                            const res = await axios.post(`${API_URL}/api/quests`, { campaignId, title, description: desc, rewards }, { headers: { 'Authorization': `Bearer ${token}` } });
                                            if (socket) socket.emit('join_campaign', { campaignId, role, userId: user?.id }); // Trigger a sync
                                            showToast("Başarılı", "Görev eklendi", "bg-emerald-900 border-emerald-500 text-emerald-100");
                                            (document.getElementById('q-title') as HTMLInputElement).value = "";
                                            (document.getElementById('q-desc') as HTMLTextAreaElement).value = "";
                                            (document.getElementById('q-rewards') as HTMLInputElement).value = "";
                                        } catch (err) { console.error(err); }
                                    }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition shadow-lg">GÖREVİ YAYINLA</button>
                                </div>

                                {/* Active Quests */}
                                <div className="grid gap-4">
                                    {quests.map((q: any) => (
                                        <div key={q._id} className={`p-5 rounded-2xl border ${q.status === 'active' ? 'bg-gray-800/40 border-emerald-900/30' : 'bg-gray-950/80 border-gray-800 opacity-60'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-xl font-black text-white">{q.title}</h4>
                                                <div className="flex gap-2">
                                                    {q.status === 'active' && (
                                                        <>
                                                            <button onClick={async () => {
                                                                await axios.put(`${API_URL}/api/quests/${q._id}`, { status: 'completed' }, { headers: { 'Authorization': `Bearer ${token}` } });
                                                                socket?.emit('join_campaign', { campaignId, role, userId: user?.id });
                                                            }} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">Tamamlandı</button>
                                                            <button onClick={async () => {
                                                                await axios.put(`${API_URL}/api/quests/${q._id}`, { status: 'failed' }, { headers: { 'Authorization': `Bearer ${token}` } });
                                                                socket?.emit('join_campaign', { campaignId, role, userId: user?.id });
                                                            }} className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">Başarısız</button>
                                                        </>
                                                    )}
                                                    <button onClick={async () => {
                                                        const ok = await confirm({
                                                            title: "Görevi Sil",
                                                            message: "Silmek istediğine emin misin?",
                                                            confirmText: "Sil",
                                                            severity: "warning"
                                                        });
                                                        if (!ok) return;
                                                        await axios.delete(`${API_URL}/api/quests/${q._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                                                        socket?.emit('join_campaign', { campaignId, role, userId: user?.id });
                                                    }} className="text-gray-500 hover:text-red-500">🗑️</button>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-3">{q.description}</p>
                                            {q.rewards && <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">🎁 Ödül: {q.rewards}</div>}
                                            <div className={`text-[10px] mt-2 font-black uppercase tracking-tighter ${q.status === 'active' ? 'text-emerald-500' : q.status === 'completed' ? 'text-blue-500' : 'text-red-500'}`}>{q.status}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SESSION NOTES MODAL --- */}
                {isSessionNoteMenuOpen && (
                    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsSessionNoteMenuOpen(false)}>
                        <div className="bg-gray-900 border border-amber-900/50 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-amber-950/20 p-6 border-b border-amber-900/30 flex justify-between items-center">
                                <h2 className="text-3xl font-black text-amber-400 flex items-center gap-3">✍️ Oturum Notları</h2>
                                <button onClick={() => setIsSessionNoteMenuOpen(false)} className="text-gray-500 hover:text-white text-3xl font-black">&times;</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                                <div className="bg-gray-950/50 border border-amber-900/20 p-6 rounded-2xl space-y-4">
                                    <textarea id="sn-content" placeholder="Oturumda ne oldu? Önemli olayları not et..." className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-amber-500 h-32"></textarea>
                                    <button onClick={async () => {
                                        const content = (document.getElementById('sn-content') as HTMLTextAreaElement).value;
                                        if (!content) {
                                            await alert({
                                                title: "Eksik Bilgi",
                                                message: "İçerik gerekli!",
                                                severity: "warning"
                                            });
                                            return;
                                        }
                                        
                                        try {
                                            await axios.post(`${API_URL}/api/session-notes`, { campaignId, authorName: 'DM', content }, { headers: { 'Authorization': `Bearer ${token}` } });
                                            socket?.emit('join_campaign', { campaignId, role, userId: user?.id });
                                            (document.getElementById('sn-content') as HTMLTextAreaElement).value = "";
                                            showToast("Başarılı", "Not kaydedildi", "bg-amber-900 border-amber-500 text-amber-100");
                                        } catch (err) { console.error(err); }
                                    }} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-xl transition shadow-lg">NOTU KAYDET</button>
                                </div>

                                <div className="space-y-4">
                                    {sessionNotes.map((sn: any) => (
                                        <div key={sn._id} className="bg-gray-800/30 border border-gray-700/50 p-5 rounded-2xl">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{new Date(sn.createdAt).toLocaleDateString('tr-TR')} · {sn.authorName}</div>
                                            </div>
                                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{sn.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FACTION TRACKER MODAL --- */}
                {isFactionMenuOpen && (
                    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsFactionMenuOpen(false)}>
                        <div className="bg-gray-900 border border-indigo-900/50 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-indigo-950/20 p-6 border-b border-indigo-900/30 flex justify-between items-center">
                                <h2 className="text-3xl font-black text-indigo-400 flex items-center gap-3">🚩 Fraksiyonlar & İtibar</h2>
                                <button onClick={() => setIsFactionMenuOpen(false)} className="text-gray-400 hover:text-white text-3xl font-black">&times;</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                                {/* Add Faction */}
                                <div className="bg-gray-950/50 border border-indigo-900/20 p-6 rounded-2xl space-y-4">
                                    <h3 className="text-indigo-500 font-bold uppercase tracking-widest text-xs">Yeni Fraksiyon Ekle</h3>
                                    <input id="f-name" type="text" placeholder="Fraksiyon Adı (örn. Harpers, Zhentarim)" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
                                    <textarea id="f-desc" placeholder="Fraksiyon hakkında kısa bilgi..." className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 h-20"></textarea>
                                    <button onClick={async () => {
                                        const name = (document.getElementById('f-name') as HTMLInputElement).value;
                                        const desc = (document.getElementById('f-desc') as HTMLTextAreaElement).value;
                                        if (!name) {
                                            await alert({
                                                title: "Eksik Bilgi",
                                                message: "İsim gerekli!",
                                                severity: "warning"
                                            });
                                            return;
                                        }
                                        
                                        try {
                                            await axios.post(`${API_URL}/api/factions`, { campaignId, name, description: desc }, { headers: { 'Authorization': `Bearer ${token}` } });
                                            socket?.emit('join_campaign', { campaignId, role, userId: user?.id });
                                            (document.getElementById('f-name') as HTMLInputElement).value = "";
                                            (document.getElementById('f-desc') as HTMLTextAreaElement).value = "";
                                            showToast("Başarılı", "Fraksiyon eklendi", "bg-indigo-900 border-indigo-500 text-indigo-100");
                                        } catch (err) { console.error(err); }
                                    }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition shadow-lg">FRAKSİYON OLUŞTUR</button>
                                </div>

                                {/* Faction List */}
                                <div className="grid gap-4">
                                    {factions.map((f: any) => (
                                        <div key={f._id} className="bg-gray-800/40 border border-indigo-900/20 p-5 rounded-2xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="text-xl font-black text-white">{f.name}</h4>
                                                    <p className="text-gray-400 text-sm">{f.description}</p>
                                                </div>
                                                <button onClick={async () => {
                                                    const ok = await confirm({
                                                        title: "Fraksiyonu Sil",
                                                        message: "Fraksiyonu silmek istediğine emin misin?",
                                                        confirmText: "Sil",
                                                        severity: "warning"
                                                    });
                                                    if (!ok) return;
                                                    await axios.delete(`${API_URL}/api/factions/${f._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                                                    socket?.emit('join_campaign', { campaignId, role, userId: user?.id });
                                                }} className="text-gray-500 hover:text-red-500">🗑️</button>
                                            </div>
                                            
                                            {/* Reputation List */}
                                            <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3">
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Karakter İtibarları</div>
                                                {Object.entries(partyStats || {}).map(([name, ps]: any) => {
                                                    if (!ps) return null;
                                                    const rep = (f.reputations || []).find((r: any) => r.characterId === ps.characterId);
                                                    const currentScore = rep ? rep.score : 0;
                                                    
                                                    return (
                                                        <div key={ps.characterId} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg">
                                                            <span className="text-sm font-bold text-gray-300">{name}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`font-black ${currentScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>{currentScore}</span>
                                                                <div className="flex gap-1">
                                                                    <button onClick={async () => {
                                                                        const newReps = [...(f.reputations || [])];
                                                                        const idx = newReps.findIndex(r => r.characterId === ps.characterId);
                                                                        if (idx >= 0) newReps[idx].score += 1;
                                                                        else newReps.push({ characterId: ps.characterId, characterName: name, score: 1 });
                                                                        await axios.put(`${API_URL}/api/factions/${f._id}`, { reputations: newReps }, { headers: { 'Authorization': `Bearer ${token}` } });
                                                                        socket?.emit('join_campaign', { campaignId, role, userId: user?.id });
                                                                    }} className="w-6 h-6 bg-green-900/40 text-green-300 rounded flex items-center justify-center text-xs border border-green-700/50">+</button>
                                                                    <button onClick={async () => {
                                                                        const newReps = [...(f.reputations || [])];
                                                                        const idx = newReps.findIndex(r => r.characterId === ps.characterId);
                                                                        if (idx >= 0) newReps[idx].score -= 1;
                                                                        else newReps.push({ characterId: ps.characterId, characterName: name, score: -1 });
                                                                        await axios.put(`${API_URL}/api/factions/${f._id}`, { reputations: newReps }, { headers: { 'Authorization': `Bearer ${token}` } });
                                                                        socket?.emit('join_campaign', { campaignId, role, userId: user?.id });
                                                                    }} className="w-6 h-6 bg-red-900/40 text-red-300 rounded flex items-center justify-center text-xs border border-red-700/50">-</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div >
    );
}
