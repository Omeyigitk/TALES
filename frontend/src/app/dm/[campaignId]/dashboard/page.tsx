"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useCampaignSocket } from "../../../../../useCampaignSocket";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DMDashboard() {
    const { campaignId } = useParams();
    const { user, token, loading: authLoading } = useAuth();
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
    const { partyStats, diceLogs, socket, dmLevelPermission, whisperData, whisperHistory } = useCampaignSocket(campaignId, 'DM', 'DM', token);

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

    // DM Level İzni İzleme (UI gösterimi için)
    const [levelPermEnabled, setLevelPermEnabled] = useState(false);

    // Edit Character States
    const [isEditCharModalOpen, setIsEditCharModalOpen] = useState(false);
    const [editingCharData, setEditingCharData] = useState<any>(null);

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
        const newPass = prompt(`${username} için yeni şifreyi girin:`, "123456");
        if (!newPass) return;

        try {
            await axios.post(`${API_URL}/api/admin/reset-password`, { targetUserId, newPassword: newPass }, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast("Başarılı", "Şifre güncellendi", "bg-green-900 border-green-500 text-green-100");
        } catch (error) {
            showToast("Hata", "Şifre sıfırlanamadı", "bg-red-900 border-red-500 text-red-100");
        }
    };

    const handleRenameUser = async (targetUserId: string, oldName: string) => {
        const newName = prompt(`"${oldName}" kullanıcısının yeni adını girin:`, oldName);
        if (!newName || newName === oldName) return;

        try {
            await axios.put(`${API_URL}/api/admin/users/${targetUserId}`, { newUsername: newName }, { headers: { 'Authorization': `Bearer ${token}` } });
            setAllUsers(allUsers.map(u => u._id === targetUserId ? { ...u, username: newName } : u));
            showToast("Başarılı", "Kullanıcı adı güncellendi", "bg-green-900 border-green-500 text-green-100");
        } catch (error: any) {
            alert("Hata: " + (error.response?.data?.error || "Kullanıcı adı değiştirilemedi"));
        }
    };

    const handleDeleteUser = async (targetUserId: string, username: string) => {
        if (!confirm(`"${username}" kullanıcısını tamamen silmek istediğine emin misin? Bu işlem geri alınamaz!`)) return;

        try {
            await axios.delete(`${API_URL}/api/admin/users/${targetUserId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setAllUsers(allUsers.filter(u => u._id !== targetUserId));
            showToast("Başarılı", "Kullanıcı silindi", "bg-red-900 border-red-500 text-red-100");
        } catch (error: any) {
            alert("Hata: " + (error.response?.data?.error || "Kullanıcı silinemedi"));
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
        const updated = activeCombatants.map(c => c.id === id ? { ...c, currentHp: newHp } : c);
        setActiveCombatants(updated);
        syncEncounter(updated);
    };

    const syncEncounter = (data: any[]) => {
        if (socket) {
            socket.emit('update_encounter', { campaignId, encounterData: data });
        }
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
            alert("Medya yüklenirken hata oluştu.");
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
        if (!confirm("Bu NPC'yi silmek istediğine emin misin?")) return;
        try {
            await axios.delete(`${API_URL}/api/npcs/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setNpcs(npcs.filter(n => n._id !== id));
        } catch (error) {
            console.error("NPC Silinemedi:", error);
        }
    };

    const deleteCharacter = async (id: string, name: string) => {
        if (!confirm(`"${name}" karakterini silmek istediğine emin misin? Bu işlem geri alınamaz.`)) return;
        try {
            await axios.delete(`${API_URL}/api/characters/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast("Karakter Silindi", `"${name}" karakteri başarıyla silindi. Sayfayı yenileyebilirsiniz.`, "bg-red-900 border-red-500 text-red-100");
        } catch (error) {
            console.error("Karakter Silinemedi:", error);
            alert("Karakter silinirken bir hata oluştu.");
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

    const toggleShopPublish = (publish: boolean) => {
        if (!socket) return;
        setIsShopPublished(publish);
        socket.emit('publish_shop', { campaignId, shopItems: publish ? shopItems : [], isPublished: publish });
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
            alert("Karakter detayı alınamadı!");
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
            alert("Karakter güncellendi! Oyuncunun ekranına yansıdı.");
        } catch (error) {
            console.error("Karakter kaydedilemedi", error);
            alert("Karakter veri tabanına kaydedilemedi!");
        }
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
                            if (!window.confirm("Tüm veritabanını (Eşyalar, Canavarlar, Büyüler vb.) sıfırlayıp yeniden yüklemek istediğinizden emin misiniz? Bu işlem canlıdaki verileri günceller.")) return;
                            try {
                                const res = await axios.post(`${API_URL}/api/admin/seed`, {}, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                showToast("Başarılı", res.data.message || "Veritabanı başarıyla güncellendi!", "bg-green-900 border-green-500 text-green-100");
                                setTimeout(() => window.location.reload(), 2000);
                            } catch (err: any) {
                                console.error(err);
                                alert("Güncelleme sırasında bir hata oluştu: " + (err.response?.data?.error || err.message));
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
                        <h2 className="text-xl font-black text-red-500 mb-6 flex items-center gap-2 tracking-wide">
                            <span className="bg-red-900/40 px-2 py-1 rounded-lg border border-red-500/30">⚔️</span> Aktif Savaş Çizelgesi
                        </h2>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {activeCombatants.length === 0 ? (
                                <div className="text-gray-500 italic text-center py-12">Sahada düşman yok. Sağ üstten Canavar Kitabını açıp yaratık ekleyin.</div>
                            ) : (
                                activeCombatants.map((monster, index) => (
                                    <div
                                        key={monster.id}
                                        className={`bg-gray-800 rounded-lg border-l-4 shadow-md group cursor-pointer transition-all hover:bg-gray-700 ${monster.currentHp <= 0 ? 'opacity-50 grayscale contrast-75 border-gray-600' : (monster._isLeveledNpc
                                            ? monster._relationship === 'Dost' ? 'border-emerald-500' : monster._relationship === 'Düşman' ? 'border-red-500' : 'border-yellow-500'
                                            : 'border-red-500')
                                            }`}
                                        onClick={() => setExpandedCombatantId(expandedCombatantId === monster.id ? null : monster.id)}
                                    >
                                        <div className="p-4 flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-gray-900 px-3 py-1 rounded text-yellow-500 font-black border border-gray-700 w-12 text-center">
                                                    {monster.initiative}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">{monster.name}</div>
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
                                <span className="bg-red-900/40 px-2 py-1 rounded-lg border border-red-500/30">🎲</span> Zar Kayıtları
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
                <div className="fixed bottom-8 left-8 z-40 flex flex-col items-center space-y-4">
                    {/* Zarlar (Açılır Menü) */}
                    {isDiceMenuOpen && (
                        <div className="flex flex-col-reverse space-y-reverse space-y-3 mb-4 animate-fade-in bg-gray-900/60 backdrop-blur-md p-3 rounded-3xl border border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] items-center">
                            <label className="flex items-center space-x-2 text-xs font-bold text-gray-300 cursor-pointer mb-2 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700 hover:bg-gray-700 transition">
                                <input
                                    type="checkbox"
                                    checked={isRollHidden}
                                    onChange={(e) => setIsRollHidden(e.target.checked)}
                                    className="form-checkbox text-purple-600 rounded bg-gray-900 border-gray-500 accent-purple-500"
                                />
                                <span>Gizli At</span>
                            </label>
                            {[100, 20, 12, 10, 8, 6, 4].map(sides => (
                                <button
                                    key={sides}
                                    onClick={() => rollDMDice(sides)}
                                    className={`w-14 h-14 ${isRollHidden ? 'bg-purple-900/60 text-purple-300 border-purple-500/50' : 'bg-gray-800/80 text-red-400 border-red-500/50'} hover:bg-gray-700/80 border-2 rounded-full shadow-lg flex items-center justify-center font-bold text-lg transition-transform hover:scale-110 backdrop-blur-sm`}
                                    title={isRollHidden ? `d${sides} Gizli At` : `d${sides} At`}
                                >
                                    d{sides}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Ana Zar Butonu */}
                    <button
                        onClick={() => setIsDiceMenuOpen(!isDiceMenuOpen)}
                        className={`w-20 h-20 ${isDiceMenuOpen ? 'bg-gray-800/90 border-red-500' : 'bg-gradient-to-br from-red-600 to-red-800 border-red-400'} hover:from-red-500 hover:to-red-700 text-white rounded-full shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-center text-4xl border-4 transition-all hover:scale-110 hover:-rotate-12`}
                        title="Zar Menüsü"
                    >
                        {isDiceMenuOpen ? '✕' : '🎲'}
                    </button>
                </div>

                {/* --- MODALS --- */}

                {/* Zar Logları Modal (Pop-up) */}
                {
                    isDiceLogOpen && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setIsDiceLogOpen(false)}>
                            <div className="bg-gray-900/80 backdrop-blur-xl w-full max-w-md h-[70vh] rounded-3xl border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center p-6 bg-gradient-to-b from-gray-800/80 to-transparent border-b border-gray-700/50">
                                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">🎲 Parti Zarları</h2>
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
                                                                        <button onClick={async () => { if (confirm(`${lnpc.name} silinecek, emin misin?`)) { await axios.delete(`${API_URL}/api/characters/${lnpc._id}`); setLeveledNpcs(leveledNpcs.filter((n: any) => n._id !== lnpc._id)); } }} className="bg-red-900/50 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all" title="Sil">✕</button>
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
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditCharModalOpen(false)}>
                            <div className="bg-gray-900 rounded-2xl border-2 border-gray-600 w-full max-w-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden" onClick={e => e.stopPropagation()}>
                                <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-black text-white px-2 py-0.5 uppercase tracking-wide">
                                            Oyuncu Düzenle: <span className="text-yellow-400">{editingCharData.name}</span>
                                        </h2>
                                        <p className="text-xs text-gray-500 font-bold ml-2">Değişiklikler anında karşı tarafa yansıyacaktır.</p>
                                    </div>
                                    <button onClick={() => setIsEditCharModalOpen(false)} className="text-gray-400 hover:text-white transition text-3xl font-black">&times;</button>
                                </div>

                                <div className="p-6 space-y-6 bg-gray-900/50">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-400 font-bold uppercase mb-1 drop-shadow-md">Seviye (Level)</label>
                                            <input type="number" min="1" max="20"
                                                value={editingCharData.level || 1}
                                                onChange={(e) => setEditingCharData({ ...editingCharData, level: Number(e.target.value) })}
                                                className="w-full bg-gray-950 text-white font-bold p-2 rounded border border-gray-600 text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-red-400 font-bold uppercase mb-1 drop-shadow-md">Maksimum HP</label>
                                            <input type="number" min="1"
                                                value={editingCharData.maxHp || 10}
                                                onChange={(e) => setEditingCharData({ ...editingCharData, maxHp: Number(e.target.value) })}
                                                className="w-full bg-red-950/40 text-red-300 font-black p-2 rounded border border-red-700/50 text-center focus:border-red-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-blue-400 font-bold uppercase mb-1 drop-shadow-md">Armor Class</label>
                                            <input type="number" min="1"
                                                value={editingCharData.ac || 10}
                                                onChange={(e) => setEditingCharData({ ...editingCharData, ac: Number(e.target.value) })}
                                                className="w-full bg-blue-950/40 text-blue-300 font-black p-2 rounded border border-blue-700/50 text-center focus:border-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-green-400 font-bold uppercase mb-1 drop-shadow-md">Speed (Hız)</label>
                                            <input type="number" min="0" step="5"
                                                value={editingCharData.speed || 30}
                                                onChange={(e) => setEditingCharData({ ...editingCharData, speed: Number(e.target.value) })}
                                                className="w-full bg-green-950/40 text-green-300 font-black p-2 rounded border border-green-700/50 text-center focus:border-green-500 outline-none" />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-700 pt-5">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Yetenek Skorları (Stats)</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((stat) => (
                                                <div key={stat} className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                                                    <label className="block text-xs text-gray-500 font-black uppercase text-center mb-1">{stat}</label>
                                                    <input type="number" min="1" max="30"
                                                        value={editingCharData.stats?.[stat] || 10}
                                                        onChange={(e) => {
                                                            const newStats = { ...editingCharData.stats, [stat]: Number(e.target.value) };
                                                            setEditingCharData({ ...editingCharData, stats: newStats });
                                                        }}
                                                        className="w-full bg-transparent text-white font-black text-center text-lg outline-none" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-700 pt-5">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <span>👁️</span> DM Özel Notları (Oyuncu Göremez)
                                        </h3>
                                        <textarea
                                            value={editingCharData.dmNotes || ""}
                                            onChange={(e) => setEditingCharData({ ...editingCharData, dmNotes: e.target.value })}
                                            placeholder="Karakter hakkında sadece senin görebileceğin notlar..."
                                            className="w-full bg-gray-950 text-gray-300 text-sm p-3 rounded-xl border border-gray-700 h-24 outline-none focus:border-yellow-600 transition-colors resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-4 border-t border-gray-700 flex justify-end gap-3">
                                    <button onClick={() => setIsEditCharModalOpen(false)} className="px-5 py-2 rounded-lg text-sm font-bold text-gray-300 hover:text-white hover:bg-gray-700 transition">İptal</button>
                                    <button onClick={saveEditedChar} className="px-5 py-2 rounded-lg text-sm font-black bg-blue-600 text-white hover:bg-blue-500 transition shadow-md shadow-blue-500/20">Kaydet ve Uygula</button>
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
                                <div className="flex items-center justify-between bg-gray-800/80 p-5 rounded-xl border border-gray-700 mb-6 shadow-inner">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Dükkanı Oyunculara Yayınla</h3>
                                        <p className="text-sm text-gray-400 mt-1">Açıldığında listedeki eşyalar oyuncuların ekranında satın alınabilir olarak belirir.</p>
                                    </div>
                                    <button
                                        onClick={() => toggleShopPublish(!isShopPublished)}
                                        className={`px-6 py-3 rounded-xl font-black uppercase text-sm transition-all shadow-lg border-2 ${isShopPublished ? 'bg-green-600 border-green-400 text-white hover:bg-green-500 hover:shadow-green-500/20' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {isShopPublished ? 'YAYINDA ✅' : 'KAPALI ❌'}
                                    </button>
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
                                                    <div className="w-full flex gap-2">
                                                        <select
                                                            id="target-player-item-final"
                                                            className="flex-1 bg-gray-950 border border-gray-700 text-white rounded-xl px-4 py-4 outline-none focus:border-blue-500 font-bold text-sm"
                                                        >
                                                            <option value="">Oyuncuya Ver...</option>
                                                            {Object.values(partyStats || {}).map((ps: any) => (
                                                                <option key={ps.characterId || ps.id} value={ps.characterId || ps.id}>{ps.name}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={async () => {
                                                                const charId = (document.getElementById('target-player-item-final') as HTMLSelectElement).value;
                                                                if (!charId) return alert("Oyuncu seçmelisin!");

                                                                try {
                                                                    const charRes = await axios.get(`${API_URL}/api/characters/${charId}`);
                                                                    const currentInv = charRes.data.inventory || [];
                                                                    const newInv = [...currentInv, {
                                                                        ...selectedItem,
                                                                        id: `item-${Date.now()}`,
                                                                        isEquipped: false,
                                                                        qty: 1
                                                                    }];
                                                                    await axios.put(`${API_URL}/api/characters/${charId}`, { inventory: newInv });

                                                                    if (socket) {
                                                                        socket.emit('update_character_stat', { campaignId, characterId: charId, stat: 'inventory', value: newInv });
                                                                    }

                                                                    showToast("Eşya Verildi", `${selectedItem.name_tr || selectedItem.name}, oyuncunun envanterine uçtu!`, "bg-green-900 border-green-500 text-green-100");
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert("Eşya verilemedi.");
                                                                }
                                                            }}
                                                            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 rounded-xl transition-all shadow-lg"
                                                        >
                                                            GÖNDER
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
                                            return (
                                                <div key={stats.id || charId} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700 shadow-xl space-y-4 hover:border-yellow-500/30 transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-black text-white text-xl">{charId}</div>
                                                            <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
                                                                <span className="text-yellow-500">Sviye {stats.level || 1}</span>
                                                                {stats.subclass && <span className="text-purple-400 ml-2">— {stats.subclass}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => openEditCharModal(stats.id)} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-xl transition-all shadow-lg" title="Düzenle">⚙️</button>
                                                            <button onClick={() => { setTargetPetPlayerId(stats.id); setIsPetModalOpen(true); }} className="bg-yellow-600 hover:bg-yellow-500 text-white p-2 rounded-xl transition-all shadow-lg" title="Pet Ver">🐾</button>
                                                            <button onClick={() => setWhisperPlayerName(charId)} className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl transition-all shadow-lg" title="Fısılda">💬</button>
                                                            <button onClick={() => deleteCharacter(stats.id, charId)} className="bg-red-800 hover:bg-red-700 text-white p-2 rounded-xl transition-all shadow-lg" title="Karakteri Sil">🗑️</button>
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

                                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700/50">
                                                        <select
                                                            onChange={(e) => assignCondition(stats.id, charId, e.target.value, stats.conditions || [])}
                                                            value=""
                                                            className="bg-gray-950 text-gray-400 border border-gray-700 rounded-lg text-xs px-3 py-1.5 outline-none hover:border-yellow-500 transition-all cursor-pointer"
                                                        >
                                                            <option value="" disabled>+ Durum Ekle</option>
                                                            {['Kör', 'Büyülenmiş', 'Sağır', 'Korkmuş', 'Görünmez', 'Yerde', 'Zehirli', 'Baygın', 'Taşlaşmış'].map(c => (
                                                                <option key={c} value={c}>{c}</option>
                                                            ))}
                                                        </select>
                                                        {stats.conditions && stats.conditions.map((c: string) => (
                                                            <span key={c}
                                                                onClick={() => assignCondition(stats.id, charId, c, stats.conditions)}
                                                                className="text-[10px] bg-red-900/40 text-red-300 px-2 py-1 rounded-lg border border-red-700/50 font-black uppercase tracking-widest cursor-pointer hover:bg-red-800 transition shadow-sm"
                                                            >
                                                                ⚠️ {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- TOAST NOTIFICATION --- */}
                {
                    toast.show && (
                        <div className={`fixed bottom-8 right-8 z-[300] p-4 rounded-2xl border-2 shadow-2xl animate-slide-up max-w-sm ${toast.color}`}>
                            <div className="flex flex-col">
                                <h4 className="font-black text-lg mb-1">{toast.title}</h4>
                                <p className="text-sm font-medium opacity-90">{toast.message}</p>
                            </div>
                        </div>
                    )
                }
                {/* Grid Map Modalı */}
                {
                    isMapOpen && (
                        <div className="fixed inset-0 bg-[#020617]/95 z-[70] flex flex-col p-4 backdrop-blur-xl animate-fade-in overflow-hidden">
                            {/* Map Header & Controls */}
                            <div className="flex flex-col gap-4 mb-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-50"></div>

                                <div className="flex justify-between items-center relative z-10">
                                    <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter italic">
                                        <span className="bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 not-italic">🗺️</span>
                                        Stratejik Harita Paneli
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const newMap = { ...mapData, tokens: [] };
                                                setMapData(newMap);
                                                socket?.emit('update_map', { campaignId, mapData: newMap });
                                            }}
                                            className="bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 font-bold py-2.5 px-6 rounded-xl transition-all border border-slate-700 hover:border-red-500/50 text-sm uppercase tracking-widest"
                                        >
                                            🧹 Temizle
                                        </button>
                                        <button
                                            onClick={() => setIsMapOpen(false)}
                                            className="bg-red-600 hover:bg-red-500 text-white w-12 h-12 rounded-xl font-black flex items-center justify-center shadow-lg shadow-red-900/40 transition-all hover:scale-110 active:scale-95"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 relative z-10 border-t border-slate-800/50 pt-4">
                                    {/* URL Input */}
                                    <div className="flex-1 min-w-[300px] relative">
                                        <input
                                            type="text"
                                            placeholder="Harita URL (JPG/PNG)..."
                                            value={mapData.bgUrl}
                                            onChange={(e) => {
                                                const newMap = { ...mapData, bgUrl: e.target.value };
                                                setMapData(newMap);
                                                socket?.emit('update_map', { campaignId, mapData: newMap });
                                            }}
                                            className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-blue-100 outline-none focus:border-blue-500 transition-all focus:ring-4 focus:ring-blue-500/10 placeholder-slate-600 shadow-inner"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="map-upload-input"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append('map', file);
                                                    try {
                                                        const res = await axios.post(`${API_URL}/api/campaigns/${campaignId}/map-upload`, formData, {
                                                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        if (res.data.success) {
                                                            const newMap = { ...mapData, bgUrl: res.data.url };
                                                            setMapData(newMap);
                                                            showToast("Harita Yüklendi", "Yeni harita başarıyla yüklendi.", "bg-green-900 border-green-500 text-green-100");
                                                        }
                                                    } catch (err) {
                                                        showToast("Hata", "Harita yüklenemedi.", "bg-red-900 border-red-500 text-red-100");
                                                    }
                                                }}
                                            />
                                            <label htmlFor="map-upload-input" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer transition-all uppercase tracking-tighter">
                                                Dosya Yükle
                                            </label>
                                        </div>
                                    </div>

                                    {/* Grid Toggle */}
                                    <label className="flex items-center gap-3 text-sm font-black text-slate-300 cursor-pointer hover:text-white transition-colors">
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${mapData.showGrid ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-700'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${mapData.showGrid ? 'translate-x-6' : 'translate-x-0'}`}></div>
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
                                        <span>IZGARA</span>
                                    </label>

                                    {/* Grid Size Slider */}
                                    <div className="flex flex-col gap-1 min-w-[120px]">
                                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>Izgara Boyutu</span>
                                            <span className="text-blue-400">{mapData.gridSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="150"
                                            value={mapData.gridSize}
                                            onChange={(e) => {
                                                const newMap = { ...mapData, gridSize: parseInt(e.target.value) };
                                                setMapData(newMap);
                                                socket?.emit('update_map', { campaignId, mapData: newMap });
                                            }}
                                            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg"
                                        />
                                    </div>

                                    {/* Zoom Slider */}
                                    <div className="flex flex-col gap-1 min-w-[120px]">
                                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>Harita Ölçeği</span>
                                            <span className="text-purple-400">%{mapData.mapZoom || 100}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="300"
                                            value={mapData.mapZoom || 100}
                                            onChange={(e) => {
                                                const newMap = { ...mapData, mapZoom: parseInt(e.target.value) };
                                                setMapData(newMap);
                                                socket?.emit('update_map', { campaignId, mapData: newMap });
                                            }}
                                            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg"
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            (partyStats ? Object.entries(partyStats) : []).forEach(([id, stats]: [any, any]) => {
                                                if (!stats || typeof stats !== 'object') return;
                                                const charName = stats.name || 'Oyuncu';
                                                // Prevent duplicates by checking name
                                                if (!(mapData.tokens || []).find(t => t && t.name === charName && t.type === 'player')) {
                                                    addTokenToMap(charName, 'player', '#3b82f6', stats.characterId || id);
                                                }
                                            });
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-900/40 transition-all text-xs uppercase tracking-widest"
                                    >
                                        👥 Oyuncuları Getir
                                    </button>
                                </div>
                            </div>

                            {/* Map Content Area */}
                            <div
                                id="map-container"
                                className="flex-1 bg-[#020617] rounded-[2.5rem] border-8 border-slate-900 overflow-auto relative custom-scrollbar shadow-[inset_0_20px_50px_rgba(0,0,0,0.8)]"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (!isDraggingToken) return;

                                    const container = document.getElementById('map-container');
                                    if (!container) return;

                                    const rect = container.getBoundingClientRect();
                                    const zoom = (mapData.mapZoom || 100) / 100;

                                    // Adjust coordinate for zoom
                                    const x = (e.clientX - rect.left + container.scrollLeft) / zoom;
                                    const y = (e.clientY - rect.top + container.scrollTop) / zoom;

                                    const newTokens = (mapData.tokens || []).map(t =>
                                        t && t.id === isDraggingToken ? { ...t, x, y } : t
                                    );

                                    const newMap = { ...mapData, tokens: newTokens };
                                    setMapData(newMap);
                                    socket?.emit('move_token', { campaignId, tokenId: isDraggingToken, x, y });
                                    socket?.emit('update_map', { campaignId, mapData: newMap });
                                    setIsDraggingToken(null);
                                }}
                            >
                                <div
                                    className="origin-top-left relative p-20"
                                    style={{
                                        transform: `scale(${(mapData.mapZoom || 100) / 100})`,
                                        width: 'max-content',
                                        height: 'max-content'
                                    }}
                                >
                                    {/* Background Image */}
                                    {mapData.bgUrl && (
                                        <img
                                            src={mapData.bgUrl}
                                            alt="Map"
                                            className="max-w-none shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                                            style={{ pointerEvents: 'none' }}
                                        />
                                    )}

                                    {/* Grid Overlay */}
                                    {mapData.showGrid && (
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.15) 1px, transparent 1px)',
                                                backgroundSize: `${mapData.gridSize}px ${mapData.gridSize}px`,
                                                width: '100%',
                                                height: '100%',
                                                left: 0,
                                                top: 0
                                            }}
                                        />
                                    )}

                                    {/* Tokens */}
                                    {(mapData?.tokens || []).map((token) => (
                                        token && (
                                            <div
                                                key={token.id}
                                                draggable
                                                onDragStart={() => setIsDraggingToken(token.id)}
                                                className="absolute w-12 h-12 rounded-full border-2 border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-[11px] font-black cursor-grab active:cursor-grabbing select-none group transition-shadow"
                                                style={{
                                                    left: (token.x || 0) - 24,
                                                    top: (token.y || 0) - 24,
                                                    backgroundColor: token.color || '#ef4444',
                                                    boxShadow: `0 0 15px ${token.color || '#ef4444'}44, 0 8px 30px rgba(0,0,0,0.6)`,
                                                    zIndex: 10
                                                }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-white text-[10px] opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all shadow-xl backdrop-blur-md">
                                                    {token.name || '??'}
                                                </div>
                                                <div className="text-white text-center leading-tight uppercase tracking-tighter drop-shadow-md">
                                                    {(token.name || '??').substring(0, 2)}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newTokens = mapData.tokens.filter(t => t && t.id !== token.id);
                                                        const newMap = { ...mapData, tokens: newTokens };
                                                        setMapData(newMap);
                                                        socket?.emit('update_map', { campaignId, mapData: newMap });
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-red-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 hover:scale-125 transition-all border border-white/30 text-white shadow-lg"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )
                                    ))}

                                    {!mapData.bgUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-800 flex-col gap-6 p-20 min-h-[600px] min-w-[800px]">
                                            <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center text-6xl shadow-inner border border-slate-800">🗺️</div>
                                            <div className="text-center space-y-2">
                                                <p className="text-2xl font-black text-slate-600 uppercase tracking-widest">Harita Hazır Değil</p>
                                                <p className="text-slate-700 font-bold">Yukarıya bir görsel URL'si yapıştırın veya dosya yükleyin.</p>
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
                                            if (!newPet.name || !targetPetPlayerId) return alert("İsim ve hedef oyuncu gerekli!");
                                            try {
                                                const charRes = await axios.get(`${API_URL}/api/characters/${targetPetPlayerId}`);
                                                const currentCompanions = charRes.data.companions || [];
                                                const newCompanions = [...currentCompanions, { ...newPet, id: `pet-${Date.now()}` }];
                                                await axios.put(`${API_URL}/api/characters/${targetPetPlayerId}`, { companions: newCompanions });
                                                alert(`${newPet.name} başarıyla verildi!`);
                                                setIsPetModalOpen(false);
                                                setNewPet({ name: '', hp: 10, maxHp: 10, ac: 10, type: '', notes: '' });
                                            } catch (err) {
                                                console.error(err);
                                                alert("Pet verilirken hata oluştu.");
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
            </div>
        </div >
    );
}
