"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useCampaignSocket } from "../../../../../useCampaignSocket";
import { ASI_LEVELS, CLASS_FEATURES, type Feat } from "../levelup_data";
import { ALL_FEATS } from "../feats_data";
import { ALL_BACKGROUNDS } from "../background_data";
import { getFeatRequirements } from "../../feat_utils";
import { FeatSpellSelectionArea, FeatStatSelectionArea, FeatChoiceSelectionArea } from "../../FeatComponents";
// SINIFLARA GÖRE BAŞLANGIÇ EKİPMANLARI (CLASS_EQUIPMENT)
import { getSpellSlotTotals, isSpellcaster, CLASS_ATTACKS, CLASS_RESOURCES, CONCENTRATION_SPELLS } from "../combat_data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── D&D 5e Skill → Ability mapping + Descriptions ───────────────────────────
const SKILLS: { name: string; tr: string; ability: string; desc_tr: string }[] = [
    { name: "Acrobatics", tr: "Akrobasi", ability: "DEX", desc_tr: "Salto, takla ve denge gerektiren hareketleri kapsar. Dar bir zeminde dengede durmak, düşerken kendini tutmak veya kısıtlayıcı bağlardan kurtulmak için kullanılır." },
    { name: "Animal Handling", tr: "Animal Handling", ability: "WIS", desc_tr: "Vahşi veya evcil hayvanları yatıştırmayı, sinyallerini anlamayı ve onları isteğine göre yönlendirmeyi kapsar." },
    { name: "Arcana", tr: "Arcana", ability: "INT", desc_tr: "Büyü, büyülü eşyalar, semboller ve büyücülük planları hakkındaki bilgiyi ölçer. Cadılar, animasyonlar ve büyülü ritüeller hakkında bilgi içerir." },
    { name: "Athletics", tr: "Athletics", ability: "STR", desc_tr: "Tırmanma, atlama ve yüzme gibi güç gerektiren fiziksel aktiviteleri kapsar. Düşmana tutunmak veya düşmek üzereyken kendini kurtarmak için de kullanılır." },
    { name: "Deception", tr: "Deception", ability: "CHA", desc_tr: "Yalan söyleme, kılık değiştirme ve kasıtlı yanlış bilgi verme yeteneğini ölçer." },
    { name: "History", tr: "History", ability: "INT", desc_tr: "Tarihi olaylar, ünlü insanlar, kayıp krallıklar, eski tarihler ve medeniyetler hakkındaki bilgiyi ölçer." },
    { name: "Insight", tr: "Insight", ability: "WIS", desc_tr: "Birisinin gerçek niyetlerini ve duygularını belirleme yeteneğini ölçer; yalan söylüyor mu, bir şeyleri gizliyor mu gibi." },
    { name: "Intimidation", tr: "Intimidation", ability: "CHA", desc_tr: "Tehdit, düşmanca tavır veya fiziksel baskıyla başkalarını etkileme yeteneğini ölçer." },
    { name: "Investigation", tr: "Investigation", ability: "INT", desc_tr: "İpuçlarını arama ve onlardan çıkarım yapma yeteneğini ölçer. Gizli kapıları, zehirlenmenin izlerini veya saklı eşyaları bulmak için kullanılır." },
    { name: "Medicine", tr: "Medicine", ability: "WIS", desc_tr: "Ölmekte olan birini stabilize etme, hastalıkları teşhis etme ve yaraları tedavi etme yeteneğini ölçer." },
    { name: "Nature", tr: "Nature", ability: "INT", desc_tr: "Arazi, bitkiler ve hayvanlar hakkındaki bilgiyi ölçer. Hava durumunu tahmin etmek ve doğal felaketleri öngörmek için de kullanılır." },
    { name: "Perception", tr: "Perception", ability: "WIS", desc_tr: "Çevrenin farkında olma yeteneğini ölçer. Bir kapının ardındaki konuşmayı duymak veya gizlenen düşmanı fark etmek için kullanılır." },
    { name: "Performance", tr: "Performance", ability: "CHA", desc_tr: "Müzik, dans, aktörlük, hikaye anlatımı gibi sahne sanatları yoluyla diğerlerini etkileme yeteneğini ölçer." },
    { name: "Persuasion", tr: "Persuasion", ability: "CHA", desc_tr: "Mantık, iyi niyet veya diplomatik usuller aracılığıyla başkalarını etkileme yeteneğini ölçer." },
    { name: "Religion", tr: "Religion", ability: "INT", desc_tr: "Tanrılar, ritüeller ve dini ayinler hakkındaki bilgiyi ölçer. Semboller, kutsal metinler ve cemaatler hakkında bilgi içerir." },
    { name: "Sleight of Hand", tr: "Sleight of Hand", ability: "DEX", desc_tr: "El çabukluğu ve gizlice nesne yerleştirme veya alma yeteneğini ölçer. Cep kesmek veya bir nesneyi gizlice bırakmak için kullanılır." },
    { name: "Stealth", tr: "Stealth", ability: "DEX", desc_tr: "Başkalarının dikkatini çekmeden gizlenme veya sessizce hareket etme yeteneğini ölçer." },
    { name: "Survival", tr: "Survival", ability: "WIS", desc_tr: "Doğada iz takibi, av avlama, yiyecek bulma, coğrafyayı okuma ve doğal tehlikelerden kaçınma yeteneğini ölçer." },
];

const SAVING_THROWS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

// Proficiency bonusu hesapla
const profBonus = (level: number) => Math.ceil(1 + level / 4);

// Class → saving throw proficiencies (SRD)
const CLASS_SAVES: Record<string, string[]> = {
    Fighter: ["STR", "CON"], Barbarian: ["STR", "CON"], Paladin: ["WIS", "CHA"],
    Ranger: ["STR", "DEX"], Monk: ["STR", "DEX"], Rogue: ["DEX", "INT"],
    Bard: ["DEX", "CHA"], Cleric: ["WIS", "CHA"], Druid: ["INT", "WIS"],
    Sorcerer: ["CON", "CHA"], Warlock: ["WIS", "CHA"], Wizard: ["INT", "WIS"],
    Artificer: ["CON", "INT"],
};

// Class → skill proficiencies (simplified, treat as empty — actual skills come from background/choices)
// For now we show all skills, proficiency is implied by class.
// A simpler approach: mark skills where the ability mod is positive with a dot.

export default function PlayerSheet() {
    const { campaignId } = useParams();
    const router = useRouter();
    const role = 'Player';

    const { user, token, loading: authLoading } = useAuth();
    const [character, setCharacter] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading]);
    const [currentHp, setCurrentHp] = useState(0);
    const [activeTab, setActiveTab] = useState<"main" | "attacks" | "inventory" | "story" | "spells" | "party">("main");
    const [selectedSkill, setSelectedSkill] = useState<typeof SKILLS[0] | null>(null);

    // ── Socket & DM Permission ──────────────────────────────────────────────
    const { dmLevelPermission, socket, whisperData, whisperHistory, partyStats, diceLogs, mapData } = useCampaignSocket(campaignId, 'Player', user?.username || 'Player', token);
    const [showDmPopup, setShowDmPopup] = useState(false);
    const [levelPermEnabled, setLevelPermEnabled] = useState(false);

    // ── Combat State ────────────────────────────────────────────────────────
    const [deathSaves, setDeathSaves] = useState<{ successes: number, failures: number }>({ successes: 0, failures: 0 });
    const [conditions, setConditions] = useState<string[]>([]);
    const [hitDiceUsed, setHitDiceUsed] = useState(0);

    // Yeni Modal ve Durum stateleri
    const [expandedFeat, setExpandedFeat] = useState<string | null>(null);

    // Short Rest & Hit Dice
    const [showHitDiceModal, setShowHitDiceModal] = useState(false);
    const [hitDiceToSpend, setHitDiceToSpend] = useState(0);
    // spellSlotsUsed: { "1": 2, "2": 1, ... } (used counts per slot level)
    const [spellSlotsUsed, setSpellSlotsUsed] = useState<Record<string, number>>({});
    // resourcesUsed: { rage: 1, ki: 3, ... }
    const [resourcesUsed, setResourcesUsed] = useState<Record<string, number>>({});
    // concentrationSpell: name of currently concentrated spell, or ""
    const [concentrationSpell, setConcentrationSpell] = useState("");

    // Long Rest Class Feature Modal
    const [showLongRestModal, setShowLongRestModal] = useState(false);
    const [wizardCantripOptions, setWizardCantripOptions] = useState<any[]>([]);
    const [cantripToReplace, setCantripToReplace] = useState<string>("");
    const [newWizardCantrip, setNewWizardCantrip] = useState<string>("");
    // cast slot picker
    const [castingSpell, setCastingSpell] = useState<string | null>(null);
    const [showLevelChart, setShowLevelChart] = useState(false);
    const [expandedAtkIdx, setExpandedAtkIdx] = useState<number | null>(null);

    const [spellDetails, setSpellDetails] = useState<Record<string, any>>({});
    const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
    const [libFeats, setLibFeats] = useState<any[]>([]);

    useEffect(() => {
        const fetchFeats = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/feats`, { headers: { 'Authorization': `Bearer ${token}` } });
                setLibFeats(res.data);
            } catch (err) { console.error("Feat fetch error:", err); }
        };
        fetchFeats();
    }, [token]);

    useEffect(() => {
        if (character?.spells?.length > 0) {
            axios.get(`${API_URL}/api/spells?names=${encodeURIComponent(character.spells.join(','))}`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => {
                    const details: Record<string, any> = {};
                    res.data.forEach((s: any) => details[s.name] = s);
                    setSpellDetails(details);
                })
                .catch(err => console.error("Spell details fetch error:", err instanceof Error ? err.message : String(err)));
        }
    }, [character?.spells]);

    // Watch for whispers
    useEffect(() => {
        const wData = whisperData as any;
        if (wData && wData.targetName === character?.name) {
            showToast(`🤫 Fısıltı: ${wData.senderName || 'Birisi'}`, wData.message, 'bg-purple-900 border-purple-500 text-purple-100');
        }
    }, [whisperData, character?.name]);

    // Ref for always-fresh character (fixes stale closure in level-up)
    const characterRef = useRef<any>(null);

    // Level Up — multi-step modal state
    type LevelUpStep = "preview" | "subclass" | "asi";
    const [lvModal, setLvModal] = useState<{ open: boolean; step: LevelUpStep; newLv: number; hpGained: number; classFeats: any[]; subFeats: any[]; needSubclass: boolean; needASI: boolean; } | null>(null);
    const [lvSubclassChoice, setLvSubclassChoice] = useState<any>(null);
    // ASI/Feat
    const [lvChoice, setLvChoice] = useState<"asi" | "feat">("asi");
    const [asiPicks, setAsiPicks] = useState<{ stat: string; amount: number }[]>([]);
    const [featPick, setFeatPick] = useState<Feat | null>(null);
    const [featSearch, setFeatSearch] = useState("");
    const [featStatSelections, setFeatStatSelections] = useState<Record<string, string>>({});
    const [featSpellSelections, setFeatSpellSelections] = useState<Record<string, string[]>>({});
    const [featChoiceSelections, setFeatChoiceSelections] = useState<Record<string, Record<string, string[]>>>({}); // { "Metamagic Adept": { "Metamagic": ["Twinned", "Subtle"] } }
    const [isLevelingUp, setIsLevelingUp] = useState(false);

    // Backstory
    const [backstory, setBackstory] = useState("");
    const [isSavingStory, setIsSavingStory] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ title: string; msg: string; color: string } | null>(null);
    const showToast = (title: string, msg: string, color: string) => {
        setToast({ title, msg, color });
        setTimeout(() => setToast(null), 5000);
    };

    // Gallery
    const [gallery, setGallery] = useState<any[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [gallerySearch, setGallerySearch] = useState("");
    const [galleryFilter, setGalleryFilter] = useState<'all' | 'image' | 'link'>('all');
    const [imgZoom, setImgZoom] = useState(1);
    const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
    const [isImgPanning, setIsImgPanning] = useState(false);
    const [imgPanStart, setImgPanStart] = useState({ x: 0, y: 0 });

    // Dynamic Shop
    const [shopData, setShopData] = useState<{ isOpen: boolean, items: any[] }>({ isOpen: false, items: [] });
    const [privateNotes, setPrivateNotes] = useState("");
    const [isSavingPrivateNotes, setIsSavingPrivateNotes] = useState(false);

    // Grid Map State
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isDraggingToken, setIsDraggingToken] = useState<string | null>(null);
    const [mapZoom, setMapZoom] = useState(1);
    const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Whisper UI
    const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);
    const [whisperMessage, setWhisperMessage] = useState("");
    const [whisperTarget, setWhisperTarget] = useState("DM");
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isWhisperModalOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [isWhisperModalOpen, whisperHistory]);

    const buyShopItem = async (item: any) => {
        if (!character) return;
        const cost = item.price;
        const currentGold = character.money?.gp || 0;
        if (currentGold < cost) {
            showToast('Yetersiz Bakiye', `Bu eşyayı (${cost} GP) almak için yeterli altının yok!`, 'bg-red-800 border-red-500 text-red-100');
            return;
        }

        const newMoney = { ...character.money, gp: currentGold - cost };
        const newInventory = [...(character.inventory || []), {
            ...item, // Spread all item data (armor_class, effects, etc.)
            id: `item-${Date.now()}`,
            isEquipped: false,
            notes: item.note || 'Dükkandan satın alındı.'
        }];

        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { money: newMoney, inventory: newInventory }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter({ ...character, money: newMoney, inventory: newInventory });
            showToast('Satın Alındı', `${item.name} envanterine eklendi. (-${cost} GP)`, 'bg-green-800 border-green-500 text-green-100');

            if (socket) {
                (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'money', value: newMoney });
                (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'inventory', value: newInventory });
            }
        } catch (e) {
            console.error("Satın alma hatası", e);
            showToast('Hata', 'Satın alma işlemi başarısız oldu.', 'bg-red-800 border-red-500 text-red-100');
        }
    };

    // HP input
    const [hpInput, setHpInput] = useState("");

    // Inventory
    const [newItemName, setNewItemName] = useState("");
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemNote, setNewItemNote] = useState("");

    useEffect(() => {
        const fetchChar = async () => {
            setLoading(true);
            try {
                let char = null;
                const charId = localStorage.getItem(`dnd_character_${campaignId}`);
                if (charId) {
                    try {
                        const res = await axios.get(`${API_URL}/api/characters/${charId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                        char = res.data;
                    } catch {
                        // local storage ID gave 404 or error
                        char = null;
                    }
                }

                if (!char) {
                    try {
                        // Fallback to campaign lookup
                        const res = await axios.get(`${API_URL}/api/characters/byCampaign/${campaignId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                        char = res.data;
                        if (char?._id) localStorage.setItem(`dnd_character_${campaignId}`, char._id);
                    } catch {
                        router.push(`/player/${campaignId}/character-creator`);
                        return;
                    }
                }
                setCharacter(char);
                characterRef.current = char;
                setCurrentHp(char.currentHp ?? char.maxHp ?? 0);
                setBackstory(char.backstory || '');
                if (char.spellSlotsUsed) setSpellSlotsUsed(char.spellSlotsUsed);
                if (char.resourcesUsed) setResourcesUsed(char.resourcesUsed);
                if (char.concentrationSpell) setConcentrationSpell(char.concentrationSpell);
                if (char.deathSaves) setDeathSaves(char.deathSaves);
                if (char.conditions) setConditions(char.conditions);
                if (char.hitDiceUsed !== undefined) setHitDiceUsed(char.hitDiceUsed);
                if (char.privateNotes) setPrivateNotes(char.privateNotes);
                if (char.featSelections) {
                    setFeatStatSelections(char.featSelections.stats || {});
                    setFeatSpellSelections(char.featSelections.spells || {});
                    setFeatChoiceSelections(char.featSelections.choices || {});
                }
            } catch (err) {
                console.error('Character fetch error:', err);
                router.push(`/player/${campaignId}/character-creator`);
            } finally {
                setLoading(false);
            }
        };
        fetchChar();
    }, [campaignId, router]);


    // Keep ref in sync with state
    useEffect(() => { characterRef.current = character; }, [character]);

    // ── Persist combat fields to DB ──────────────────────────────────────────
    const saveCombatState = async (updates: Record<string, any>) => {
        if (!characterRef.current?._id || !token) return;
        try {
            const res = await axios.put(`${API_URL}/api/characters/${characterRef.current._id}`, updates, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
        } catch (err) { console.error('Guncelleme hatasi:', err); }
    };

    // ── Inventory & Money Functions ──────────────────────────────────────────
    const updateMoney = async (type: string, amount: number) => {
        if (!characterRef.current) return;
        const currentMoney = characterRef.current.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
        const newMoney = { ...currentMoney, [type]: Math.max(0, (currentMoney[type] || 0) + amount) };
        const newChar = { ...characterRef.current, money: newMoney };
        setCharacter(newChar);
        await axios.put(`${API_URL}/api/characters/${characterRef.current._id}`, { money: newMoney }, { headers: { 'Authorization': `Bearer ${token}` } });
    };

    const addItem = async () => {
        if (!newItemName.trim() || !characterRef.current) return;

        let itemData: any = { name: newItemName, qty: newItemQty, note: newItemNote, type: "gear" };

        // Try to fetch full item data from DB if it exists
        try {
            const res = await axios.get(`${API_URL}/api/items/${encodeURIComponent(newItemName)}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.data) {
                itemData = { ...res.data, ...itemData }; // Merge DB data with manual input
            }
        } catch (e) {
            console.log("Item not found in DB, adding as custom item.");
        }

        const newInv = [...(characterRef.current.inventory || []), itemData];
        const newChar = { ...characterRef.current, inventory: newInv };
        setCharacter(newChar);
        setNewItemName(""); setNewItemQty(1); setNewItemNote("");
        await axios.put(`${API_URL}/api/characters/${characterRef.current._id}`, { inventory: newInv }, { headers: { 'Authorization': `Bearer ${token}` } });
    };

    const removeItem = async (index: number) => {
        if (!characterRef.current || !characterRef.current.inventory) return;
        const newInv = characterRef.current.inventory.filter((_: any, i: number) => i !== index);
        const newChar = { ...characterRef.current, inventory: newInv };
        setCharacter(newChar);
        characterRef.current = newChar;
        await axios.put(`${API_URL}/api/characters/${characterRef.current._id}`, { inventory: newInv }, { headers: { 'Authorization': `Bearer ${token}` } });
    };

    const toggleEquip = async (index: number) => {
        if (!characterRef.current) return;
        const newInv = [...(characterRef.current.inventory || [])];
        const item = newInv[index];
        if (!item) return;

        // Toggle equipped state
        item.isEquipped = !item.isEquipped;

        // If it's armor, unequip other armor (except shields)
        if (item.isEquipped && item.type === 'armor' && !item.name.toLowerCase().includes('shield')) {
            newInv.forEach((it, i) => {
                if (i !== index && it.type === 'armor' && !it.name.toLowerCase().includes('shield')) {
                    it.isEquipped = false;
                }
            });
        }

        const newChar = { ...characterRef.current, inventory: newInv };
        setCharacter(newChar);
        characterRef.current = newChar;

        try {
            await axios.put(`${API_URL}/api/characters/${characterRef.current._id}`, { inventory: newInv }, { headers: { 'Authorization': `Bearer ${token}` } });
        } catch (e) {
            console.error('Toggle equip failed:', e);
        }
    };

    // Empty line to clear the syntax error

    // ── Long / Short Rest ─────────────────────────────────────────────────────
    const applyLongRest = async () => {
        const char = characterRef.current;
        if (!char) return;

        let finalSpells = [...(char.spells || [])];
        if (cantripToReplace && newWizardCantrip) {
            finalSpells = finalSpells.filter(s => s !== cantripToReplace);
            if (!finalSpells.includes(newWizardCantrip)) finalSpells.push(newWizardCantrip);
        }

        const clsName = char.classRef?.name || '';
        const resources = CLASS_RESOURCES[clsName] || [];
        const newSlotsUsed: Record<string, number> = {};
        const newResourcesUsed: Record<string, number> = {};
        resources.forEach(r => { newResourcesUsed[r.key] = 0; });

        setSpellSlotsUsed(newSlotsUsed);
        setResourcesUsed(newResourcesUsed);
        setConcentrationSpell('');
        setDeathSaves({ successes: 0, failures: 0 });
        setHitDiceUsed(Math.max(0, hitDiceUsed - Math.max(1, Math.floor(char.level / 2))));

        await saveCombatState({
            spellSlotsUsed: newSlotsUsed,
            resourcesUsed: newResourcesUsed,
            concentrationSpell: '',
            currentHp: char.maxHp,
            deathSaves: { successes: 0, failures: 0 },
            hitDiceUsed: Math.max(0, hitDiceUsed - Math.max(1, Math.floor(char.level / 2))),
            spells: finalSpells
        });

        if (cantripToReplace && newWizardCantrip) {
            setCharacter({ ...char, spells: finalSpells });
        }

        setCurrentHp(char.maxHp);
        setShowLongRestModal(false);
        showToast('🌙 Long Rest', 'HP tam! Tüm slotlar ve kaynaklar yenilendi.', 'bg-indigo-900 border-indigo-500 text-indigo-100');
    };

    const handleLongRest = async () => {
        const char = characterRef.current;
        if (!char) return;
        const clsName = char.classRef?.name || '';

        // Tasha's Wizard Cantrip Formulas Check
        const hasCantripFormulas = clsName === 'Wizard' && char.level >= 3;

        if (hasCantripFormulas) {
            setShowLongRestModal(true);
            setCantripToReplace("");
            setNewWizardCantrip("");
            try {
                const res = await axios.get(`${API_URL}/api/spells?class=Wizard&max_level=0`, { headers: { 'Authorization': `Bearer ${token}` } });
                setWizardCantripOptions(res.data);
            } catch (err) { console.error(err); }
        } else {
            await applyLongRest();
        }
    };

    const handleShortRest = () => {
        if (!characterRef.current) return;
        setHitDiceToSpend(0);
        setShowHitDiceModal(true);
    };

    const confirmShortRest = async () => {
        const char = characterRef.current;
        if (!char) return;
        const clsName = char.classRef?.name || '';
        const resources = CLASS_RESOURCES[clsName] || [];
        const newResourcesUsed = { ...resourcesUsed };
        // Short rest: reset short-recharge resources, Warlock slots
        resources.forEach(r => { if (r.recharge === 'short') newResourcesUsed[r.key] = 0; });
        // Also reset Warlock pact magic
        const newSlotsUsed = { ...spellSlotsUsed };
        if (clsName === 'Warlock') { Object.keys(newSlotsUsed).forEach(k => { newSlotsUsed[k] = 0; }); }

        // Calculate Hit Dice Healing if spending dice
        const hitDieStr = (char.classRef?.hit_die || 'd8') as string;
        const hitDieMax = parseInt(hitDieStr.replace('d', '')) || 8;
        const conMod = mod(char.stats?.CON ?? 10);
        let totalHeal = 0;
        for (let i = 0; i < hitDiceToSpend; i++) {
            totalHeal += Math.max(1, Math.floor(Math.random() * hitDieMax) + 1 + conMod);
        }

        const newHp = Math.min(char.maxHp, char.currentHp + totalHeal);
        const newHitDiceUsed = hitDiceUsed + hitDiceToSpend;

        setResourcesUsed(newResourcesUsed);
        setSpellSlotsUsed(newSlotsUsed);
        setHitDiceUsed(newHitDiceUsed);
        setCurrentHp(newHp);

        await saveCombatState({
            resourcesUsed: newResourcesUsed,
            spellSlotsUsed: newSlotsUsed,
            hitDiceUsed: newHitDiceUsed,
            currentHp: newHp
        });

        setShowHitDiceModal(false);
        showToast('⏳ Short Rest', `${hitDiceToSpend} adet ${hitDieStr} harcandı. +${totalHeal} HP Canlandın!`, 'bg-green-800 border-green-500 text-green-100');
    };

    const updateDeathSaves = async (type: 'successes' | 'failures', val: number) => {
        const newDS = { ...deathSaves, [type]: val };
        setDeathSaves(newDS);
        await saveCombatState({ deathSaves: newDS });
        if (socket && character) {
            (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'deathSaves', value: newDS });
        }
    };

    const updatePetHp = async (petId: string, newHp: number) => {
        if (!characterRef.current) return;
        const companions = characterRef.current.companions || [];
        const pet = companions.find((p: any) => p.id === petId);
        if (!pet) return;

        const clamped = Math.max(0, Math.min(pet.maxHp || 10, newHp));
        const newCompanions = companions.map((p: any) =>
            p.id === petId ? { ...p, hp: clamped } : p
        );

        const newChar = { ...characterRef.current, companions: newCompanions };
        setCharacter(newChar);
        characterRef.current = newChar;

        try {
            await axios.put(`${API_URL}/api/characters/${newChar._id}`, { companions: newCompanions }, { headers: { 'Authorization': `Bearer ${token}` } });
            if (socket) {
                (socket as any).emit('update_character_stat', { campaignId, characterId: newChar._id, stat: 'companions', value: newCompanions });
            }
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        if (!socket) return;
        const onShowImage = ({ url }: { url: string }) => setSelectedImage(url);
        const onShopPublished = ({ shopItems, isPublished }: any) => {
            setShopData({ isOpen: isPublished, items: shopItems });
        };
        (socket as any).on("show_image", onShowImage);
        (socket as any).on("shop_published", onShopPublished);
        return () => {
            (socket as any).off("show_image", onShowImage);
            (socket as any).off("shop_published", onShopPublished);
        };
    }, [socket]);

    useEffect(() => {
        if (!whisperData || !character) return;
        const wd = whisperData as any;
        // Check if I am the target
        if (wd.targetPlayerName === 'DM') {
            if (dmLevelPermission) {
                showToast(`${wd.senderName} Fısıldıyor 🤫`, wd.message, 'bg-purple-900 border-purple-500 text-purple-100');
            }
        } else if (wd.targetPlayerName === character.name) {
            showToast(`${wd.senderName} Fısıldıyor 🤫`, wd.message, 'bg-purple-900 border-purple-500 text-purple-100');
        }
    }, [whisperData, character, dmLevelPermission]);

    useEffect(() => {
        const fetchGallery = async () => {
            try { const r = await axios.get(`${API_URL}/api/campaigns/${campaignId}/media`, { headers: { 'Authorization': `Bearer ${token}` } }); setGallery(r.data); } catch { }
        };
        fetchGallery();
        if (!socket) return;
        const onMedia = () => fetchGallery();
        (socket as any).on('media_shared', onMedia);
        return () => (socket as any).off('media_shared', onMedia);
    }, [socket, campaignId]);

    const updateHp = (newHp: number) => {
        const clamped = Math.max(0, Math.min(character.maxHp, newHp));
        setCurrentHp(clamped);
        if (socket && character) (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'currentHp', value: clamped });
    };

    const saveBackstory = async () => {
        if (!character) return;
        setIsSavingStory(true);
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { backstory }, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast('Kayıt Başarılı', 'Karakter hikayen tomarlara işlendi.', 'bg-green-900 border-green-500 text-green-100');
        } catch { alert("Hikaye kaydedilemedi."); }
        finally { setIsSavingStory(false); }
    };

    const savePrivateNotes = async () => {
        if (!character) return;
        setIsSavingPrivateNotes(true);
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { privateNotes }, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast('Notlar Kaydedildi', 'Kişisel notların güncellendi.', 'bg-blue-900 border-blue-500 text-blue-100');
        } catch { alert("Notlar kaydedilemedi."); }
        finally { setIsSavingPrivateNotes(false); }
    };

    const sendWhisper = () => {
        if (!whisperMessage.trim() || !socket) return;
        (socket as any).emit('whisper_player', {
            campaignId,
            targetPlayerName: whisperTarget,
            message: whisperMessage,
            senderName: character?.name || 'Bir Oyuncu'
        });
        setWhisperMessage("");
        setIsWhisperModalOpen(false);
        showToast('Fısıltı Gönderildi 🤫', `${whisperTarget === 'DM' ? 'DM' : whisperTarget}'e gizli mesajın iletildi.`, 'bg-purple-900 border-purple-500 text-purple-100');
    };

    const getItemBonus = (type: string, subType?: string) => {
        let bonus = 0;
        if (character?.inventory && Array.isArray(character.inventory)) {
            character.inventory.forEach((item: any) => {
                if (item && item.isEquipped && item.effects && Array.isArray(item.effects)) {
                    item.effects.forEach((eff: any) => {
                        if (eff && eff.type === type) {
                            if (subType) {
                                if (eff.value && typeof eff.value === 'object' && eff.value[subType]) bonus += eff.value[subType];
                            } else {
                                if (typeof eff.value === 'number') bonus += eff.value;
                            }
                        }
                    });
                }
            });
        }
        return bonus;
    };

    const mod = (v: number, statName?: string) => {
        let bonus = 0;
        let setVal: number | null = null;

        // Feat bonuses
        if (statName && character?.feats && Array.isArray(character.feats)) {
            character.feats.forEach((fName: string) => {
                const fData = (libFeats || []).find(x => x && x.name === fName);
                if (fData && fData.effects && Array.isArray(fData.effects)) {
                    fData.effects.forEach((eff: any) => {
                        if (eff && eff.type === 'stat_bonus' && eff.value && typeof eff.value === 'object' && eff.value[statName]) bonus += eff.value[statName];
                        if (eff && eff.type === 'stat_choice' && character.featSelections?.stats?.[fName] === statName) bonus += eff.value;
                    });
                }
            });
        }
        // Item Score bonuses
        if (statName && character?.inventory && Array.isArray(character.inventory)) {
            character.inventory.forEach((item: any) => {
                if (item && item.isEquipped && item.effects && Array.isArray(item.effects)) {
                    item.effects.forEach((eff: any) => {
                        if (eff && eff.type === 'stat_bonus' && eff.value && typeof eff.value === 'object' && eff.value[statName]) bonus += eff.value[statName];
                        if (eff && eff.type === 'stat_set' && eff.value && typeof eff.value === 'object' && eff.value[statName]) {
                            setVal = Math.max(setVal || 0, eff.value[statName]);
                        }
                    });
                }
            });
        }

        const score = setVal !== null ? Math.max(v + bonus, setVal) : v + bonus;
        return Math.floor((score - 10) / 2);
    };
    const fmt = (n: number) => (n >= 0 ? `+${n}` : String(n));

    const handleLevelUpClick = () => {
        if (!dmLevelPermission) {
            setShowDmPopup(true);
            return;
        }

        // Use characterRef for always-fresh data (fixes consecutive level-up bug)
        const char = characterRef.current;
        if (!char) return;
        const cls = char.classRef;
        if (!cls || typeof cls !== 'object') { alert('Sınıf bilgisi yüklenemedi, sayfayı yenileyin.'); return; }
        const newLv = char.level + 1;
        if (newLv > 20) return; // Max level 20
        const clsName = cls.name as string;
        // Use fallback hit_die if missing
        const hitDie = (cls.hit_die || 'd8') as string;
        const hitDieMax = parseInt(hitDie.replace('d', '')) || 8;
        const conMod = mod(char.stats?.CON ?? 10, 'CON');
        let hpGained = Math.floor(hitDieMax / 2) + 1 + conMod;

        // Feat HP Bonus (e.g. Tough: +2 per level)
        if (char.feats) {
            char.feats.forEach((fName: string) => {
                const fData = libFeats.find(x => x.name === fName);
                if (fData && fData.effects) {
                    fData.effects.forEach((eff: any) => {
                        if (eff.type === 'hp_per_level') hpGained += eff.value;
                    });
                }
            });
        }

        // Class features at new level
        const classFeats: any[] = CLASS_FEATURES[clsName]?.[newLv] ?? [];

        // Subclass features at new level
        let subFeats: any[] = [];
        if (char.subclass && cls.subclasses) {
            const sub = cls.subclasses.find((s: any) => s.name === char.subclass);
            if (sub) subFeats = sub.features.filter((f: any) => f.level === newLv);
        }

        const needSubclass = newLv === cls.subclass_unlock_level && !char.subclass;
        const asiLevels = ASI_LEVELS[clsName] ?? [4, 8, 12, 16, 19];
        const needASI = asiLevels.includes(newLv);

        setLvSubclassChoice(null);
        setLvChoice("asi");
        setAsiPicks([]);
        setFeatPick(null);
        setFeatSearch("");
        setLvModal({ open: true, step: "preview", newLv, hpGained, classFeats, subFeats, needSubclass, needASI });
    };

    const handleLevelDownClick = async () => {
        if (!dmLevelPermission) {
            setShowDmPopup(true);
            return;
        }

        const char = characterRef.current;
        if (!char) return;
        if (char.level <= 1) return; // Min level 1
        const cls = char.classRef;
        if (!cls || typeof cls !== 'object') { alert('Sınıf bilgisi yüklenemedi.'); return; }

        const hitDie = (cls.hit_die || 'd8') as string;
        const hitDieMax = parseInt(hitDie.replace('d', '')) || 8;
        const conMod = mod(char.stats?.CON ?? 10);
        const hpLost = Math.floor(hitDieMax / 2) + 1 + conMod;

        setIsLevelingUp(true);
        try {
            const newMaxHp = Math.max(1, (char.maxHp || 10) - hpLost);
            const res = await axios.put(`${API_URL}/api/characters/${char._id}`, {
                level: char.level - 1,
                maxHp: newMaxHp,
                currentHp: Math.min(char.currentHp, newMaxHp)
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
            setCurrentHp(res.data.currentHp);
            characterRef.current = res.data;
            showToast("Büyü Bozuldu", "Seviye düştü.", "bg-red-900 border-red-500 text-red-100");
            if (res.data.featSelections) {
                setFeatStatSelections(res.data.featSelections.stats || {});
                setFeatSpellSelections(res.data.featSelections.spells || {});
                setFeatChoiceSelections(res.data.featSelections.choices || {});
            }
        } catch (error) {
            console.error(error);
            alert("Seviye düşürülürken hata oluştu.");
        } finally {
            setIsLevelingUp(false);
        }
    };

    const advanceLvModal = () => {
        if (!lvModal) return;
        if (lvModal.needSubclass && lvModal.step === "preview") {
            setLvModal({ ...lvModal, step: "subclass" });
        } else if (lvModal.needASI && (lvModal.step === "preview" || lvModal.step === "subclass")) {
            setLvModal({ ...lvModal, step: "asi" });
        } else {
            commitLevelUp();
        }
    };

    const canAdvance = () => {
        if (!lvModal) return false;
        if (lvModal.step === "subclass") return !!lvSubclassChoice;
        if (lvModal.step === "asi") {
            if (lvChoice === "feat") {
                if (!featPick) return false;
                const reqs = getFeatRequirements(featPick.name, libFeats);
                if (!reqs) return true;
                if (reqs.statChoices && !featStatSelections[featPick.name]) return false;
                if (reqs.slots) {
                    const selections = featSpellSelections[featPick.name] || [];
                    if (selections.length < reqs.slots.length || selections.some(s => !s)) return false;
                }
                if (reqs.choices) {
                    for (const choice of reqs.choices) {
                        const sels = featChoiceSelections[featPick.name]?.[choice.label] || [];
                        if (sels.length < choice.count) return false;
                    }
                }
                return true;
            }
            const total = asiPicks.reduce((s, p) => s + p.amount, 0);
            return total === 2;
        }
        return true;
    };

    const commitLevelUp = async () => {
        if (!lvModal || !character) return;
        setIsLevelingUp(true);
        const newMaxHp = (character.maxHp ?? 0) + lvModal.hpGained;
        const subclassStr = lvSubclassChoice ? lvSubclassChoice.name : (character.subclass || '');

        // Build stats update from ASI picks
        let statsUpdate: any = undefined;
        if (lvModal.needASI && lvChoice === "asi" && asiPicks.length > 0) {
            statsUpdate = { ...character.stats };
            asiPicks.forEach(p => { if (statsUpdate[p.stat] !== undefined) statsUpdate[p.stat] = Math.min(20, statsUpdate[p.stat] + p.amount); });
        }

        // Build feats array
        const currentFeats: string[] = character.feats ?? [];
        let featsUpdate: string[] | undefined = undefined;
        if (lvModal.needASI && lvChoice === "feat" && featPick) {
            featsUpdate = [...currentFeats, featPick.name];
        }

        try {
            const payload: any = {
                level: lvModal.newLv,
                maxHp: newMaxHp,
                currentHp: character.currentHp + lvModal.hpGained,
                subclass: subclassStr,
            };
            if (statsUpdate) payload.stats = statsUpdate;
            if (featsUpdate) payload.feats = featsUpdate;
            payload.featSelections = {
                stats: featStatSelections,
                spells: featSpellSelections,
                choices: featChoiceSelections
            };

            const res = await axios.put(`${API_URL}/api/characters/${character._id}`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
            setCurrentHp(res.data.currentHp);
            if (socket) {
                (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'level', value: lvModal.newLv });
                (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'maxHp', value: newMaxHp });
            }
            setLvModal(null);
            showToast(`Seviye ${lvModal.newLv}! 🎉`,
                `+${lvModal.hpGained} maks HP kazandın!${(lvModal.classFeats.length + lvModal.subFeats.length) > 0 ? ` ${lvModal.classFeats.length + lvModal.subFeats.length} yeni özellik açıldı.` : ''}`,
                'bg-yellow-900 border-yellow-500 text-yellow-100');
        } catch (e) { console.error(e); }
        finally { setIsLevelingUp(false); }
    };

    if (loading || !character) return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-2xl">
            ⚔️ Karakter Yükleniyor...
        </div>
    );

    const stats = character.stats || {};
    const level = character.level || 1;
    const prof = profBonus(level);
    const cls = character.classRef?.name || "";
    const saves = CLASS_SAVES[cls] || [];
    const spells: string[] = character.spells || [];
    const featSelsSpells = Object.values(featSpellSelections).flat().filter(Boolean) as string[];
    const baseSpells = Array.from(new Set([...spells.filter(s => !s.startsWith("Feat: ")), ...featSelsSpells]));
    const featsFromSpells = spells.filter(s => s.startsWith("Feat: ")).map(f => f.replace("Feat: ", ""));
    const actualFeats = Array.from(new Set([...(character.feats || []), ...featsFromSpells, ...(character.raceBonusFeats || []), ...Object.keys(featSpellSelections), ...Object.keys(featStatSelections), ...Object.keys(featChoiceSelections)]));

    const itemSpells: string[] = [];
    if (character?.inventory) {
        character.inventory.forEach((item: any) => {
            if (item.isEquipped && item.effects) {
                item.effects.forEach((eff: any) => {
                    if (eff.type === 'spell_auto' && eff.spellName) {
                        itemSpells.push(eff.spellName);
                    }
                });
            }
        });
    }

    const actualSpells = Array.from(new Set([...baseSpells, ...itemSpells]));
    const hpPct = Math.round((currentHp / character.maxHp) * 100);

    // ─── Skill bonus hesapla ─────────────────────────────────────────────────
    const getSkillMod = (skill: typeof SKILLS[0]) => {
        if (!skill || !stats) return 0;
        let base = mod(stats[skill.ability] || 10, skill.ability);
        const hasExpertise = (character?.expertise || []).includes(skill.name) || (character?.expertise || []).includes(skill.tr);
        if (hasExpertise) return base + (prof || 0) * 2;
        return base;
    };

    // ─── Class-aware AC terebilimi ────────────────────────────────────────────
    const calcAC = () => {
        if (!stats) return 10;
        const dexMod = mod(stats.DEX || 10, 'DEX');
        const wisMod = mod(stats.WIS || 10, 'WIS');
        const conMod = mod(stats.CON || 10, 'CON');

        let baseAC = 10 + dexMod;
        // Class Unarmored Defense
        if (cls === 'Monk') baseAC = 10 + dexMod + wisMod;
        if (cls === 'Barbarian') baseAC = 10 + dexMod + conMod;

        let shieldAC = 0;
        let acBonus = 0;
        let hasArmor = false;

        if (character?.inventory && Array.isArray(character.inventory)) {
            character.inventory.forEach((item: any) => {
                if (!item || !item.isEquipped) return;

                if (item.armor_class) {
                    if (item.name && item.name.toLowerCase().includes('shield')) {
                        shieldAC += (item.armor_class.base || 2);
                    } else {
                        hasArmor = true;
                        const armorBase = item.armor_class.base || 10;
                        const useDex = item.armor_class.dex_bonus !== false;
                        const maxDex = item.armor_class.max_bonus;
                        baseAC = useDex ? armorBase + (maxDex !== null && maxDex !== undefined ? Math.min(maxDex, dexMod) : dexMod) : armorBase;
                    }
                }

                if (item.effects && Array.isArray(item.effects)) {
                    item.effects.forEach((eff: any) => {
                        if (eff && eff.type === 'ac_bonus' && typeof eff.value === 'number') acBonus += eff.value;
                    });
                }
            });
        }

        // Feat AC Bonuses
        const allFeats = [...(character?.feats || []), ...(character?.raceBonusFeats || [])];
        allFeats.forEach((fName: string) => {
            if (!fName) return;
            const fData = (libFeats || []).find(x => x && x.name === fName);
            if (fData && fData.effects && Array.isArray(fData.effects)) {
                fData.effects.forEach((eff: any) => {
                    if (eff && eff.type === 'ac_bonus' && typeof eff.value === 'number') acBonus += eff.value;
                });
            }
        });

        return baseAC + shieldAC + acBonus;
    };

    // ─── Class-aware Initiative ────────────────────────────────────────────────
    // Samurai (Fighter subclass) adds Wis to Initiative
    // War Magic Wizard adds Int to Initiative (Tactical Wit)
    // Chronurgy Wizard adds Int to Initiative (Temporal Awareness)
    const calcInitiative = () => {
        if (!stats) return 0;
        let bonus = mod(stats.DEX || 10, 'DEX') + getItemBonus('initiative_bonus');

        // Feat Initiative Bonuses
        const allFeatsForInit = [...(character?.feats || []), ...(character?.raceBonusFeats || [])];
        allFeatsForInit.forEach((fName: string) => {
            if (!fName) return;
            const fData = (libFeats || []).find(x => x && x.name === fName);
            if (fData && fData.effects && Array.isArray(fData.effects)) {
                fData.effects.forEach((eff: any) => {
                    if (eff && eff.type === 'initiative_bonus' && typeof eff.value === 'number') bonus += eff.value;
                });
            }
        });

        const wisMod = mod(stats.WIS || 10, 'WIS');
        const intMod = mod(stats.INT || 10, 'INT');
        if (cls === 'Fighter' && character.subclass === 'Samurai') return bonus + wisMod;
        if (cls === 'Wizard' && (character.subclass === 'War Magic' || character.subclass === 'Chronurgy')) return bonus + intMod;
        return bonus;
    };

    // ─── Monk Unarmored Movement bonus speed ──────────────────────────────────
    const monkSpeedBonus = () => {
        if (cls !== 'Monk') return 0;
        if (level >= 18) return 30;
        if (level >= 14) return 25;
        if (level >= 10) return 20;
        if (level >= 6) return 15;
        if (level >= 2) return 10;
        return 0;
    };

    const getAutoDefenses = () => {
        const res = [...(character.resistances || [])];
        const imm = [...(character.immunities || [])];
        const vuln = [...(character.vulnerabilities || [])];

        const checkText = (text: string, source: string) => {
            if (!text) return;
            const lower = text.toLowerCase();
            if (lower.includes('direncin') || lower.includes('dirençli') || lower.includes('direnç') || lower.includes('resistance')) {
                if (lower.includes('poison') || lower.includes('zehir')) res.push(`Zehir (${source})`);
                if (lower.includes('fire') || lower.includes('ateş')) res.push(`Ateş (${source})`);
                if (lower.includes('cold') || lower.includes('soğuk')) res.push(`Soğuk (${source})`);
                if (lower.includes('lightning') || lower.includes('şimşek') || lower.includes('yıldırım')) res.push(`Şimşek (${source})`);
                if (lower.includes('acid') || lower.includes('asit')) res.push(`Asit (${source})`);
                if (lower.includes('necrotic') || lower.includes('nekrotik')) res.push(`Nekrotik (${source})`);
                if (lower.includes('radiant') || lower.includes('parıltı')) res.push(`Parıltı (${source})`);
                if (lower.includes('bludgeoning') || lower.includes('künt') || lower.includes('fiziksel')) res.push(`Fiziksel (${source})`);
                if (lower.includes('piercing') || lower.includes('delici')) res.push(`Delici (${source})`);
                if (lower.includes('slashing') || lower.includes('kesici')) res.push(`Kesici (${source})`);
            }
            if (lower.includes('bağışıklı') || lower.includes('immunity')) {
                if (lower.includes('poison') || lower.includes('zehir')) imm.push(`Zehir (${source})`);
                if (lower.includes('disease') || lower.includes('hastalık')) imm.push(`Hastalık (${source})`);
                if (lower.includes('charm') || lower.includes('cazibe')) imm.push(`Cazibe (${source})`);
                if (lower.includes('frightened') || lower.includes('frighten') || lower.includes('korkutulma')) imm.push(`Korku (${source})`);
            }
        };

        character.raceRef?.traits?.forEach((t: any) => checkText((t.desc_tr || "") + " " + (t.desc || ""), t.name));
        if (character.subclass && character.classRef?.subclasses) {
            const sub = character.classRef.subclasses.find((s: any) => s.name === character.subclass);
            sub?.features?.filter((f: any) => level >= f.level).forEach((f: any) => checkText((f.desc_tr || "") + " " + (f.desc || ""), f.name));
        }

        return {
            res: Array.from(new Set(res)),
            imm: Array.from(new Set(imm)),
            vuln: Array.from(new Set(vuln)),
        };
    };
    const autoDefenses = getAutoDefenses();

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans">

            {/* ══ LEVEL CHART MODAL ══ */}
            {showLevelChart && (() => {
                const clsName = character.classRef?.name || '';
                const aLevels = ASI_LEVELS[clsName] ?? [4, 8, 12, 16, 19];
                const slotcaster = isSpellcaster(clsName);
                // max slot levels for this class
                const slotCols = slotcaster ? (clsName === 'Warlock' ? [5] : (clsName === 'Paladin' || clsName === 'Ranger' || clsName === 'Artificer') ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9]) : [];
                return (
                    <div className="fixed inset-0 bg-black/80 z-[100] overflow-auto flex items-start justify-center py-10 px-4" onClick={() => setShowLevelChart(false)}>
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{clsName} — Level Progression</h2>
                                    <p className="text-gray-400 text-sm">Seviye atlayınca kazanacakların</p>
                                </div>
                                <button onClick={() => setShowLevelChart(false)} className="text-gray-500 hover:text-white text-2xl font-black">✕</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left px-3 py-2 text-gray-400 font-bold">Level</th>
                                            <th className="text-center px-3 py-2 text-gray-400 font-bold">Prof</th>
                                            {slotCols.map(sl => <th key={sl} className="text-center px-2 py-2 text-blue-400 font-bold text-xs">{sl}.</th>)}
                                            <th className="text-left px-3 py-2 text-yellow-400 font-bold">Features</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: 20 }, (_, i) => {
                                            const lv = i + 1;
                                            const isCurrent = lv === level;
                                            const profBonus = Math.ceil(lv / 4) + 1;
                                            let feats = [...(CLASS_FEATURES[clsName]?.[lv] ?? [])];
                                            if (character.subclass && character.classRef?.subclasses) {
                                                const sub = character.classRef.subclasses.find((s: any) => s.name === character.subclass);
                                                if (sub) {
                                                    const subFeats = sub.features.filter((f: any) => f.level === lv);
                                                    feats = [...feats, ...subFeats];
                                                }
                                            }
                                            const isASI = aLevels.includes(lv);
                                            const slots = slotcaster ? getSpellSlotTotals(clsName, lv) : [];
                                            return (
                                                <tr key={lv} className={`border-b border-gray-800 transition ${isCurrent ? 'bg-red-900/30 border-red-700' : 'hover:bg-gray-800/40'}`}>
                                                    <td className="px-3 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-black text-lg w-8 text-center ${isCurrent ? 'text-red-400' : 'text-white'}`}>{lv}</span>
                                                            {isCurrent && <span className="text-[10px] bg-red-700 text-red-100 px-1.5 py-0.5 rounded font-bold">ŞUAN</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className="text-purple-400 font-black">+{profBonus}</span>
                                                    </td>
                                                    {slotCols.map(sl => {
                                                        const val = slots[sl - 1] ?? 0;
                                                        return <td key={sl} className="px-2 py-2 text-center">
                                                            <span className={val > 0 ? 'text-blue-300 font-bold' : 'text-gray-700'}>{val > 0 ? val : '—'}</span>
                                                        </td>;
                                                    })}
                                                    <td className="px-3 py-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {isASI && <span className="text-[10px] bg-yellow-700/60 border border-yellow-600 text-yellow-300 px-1.5 py-0.5 rounded font-bold">ASI/Feat</span>}
                                                            {feats.map((f: any, fi: number) => (
                                                                <span key={fi} className="text-[10px] bg-gray-800 border border-gray-600 text-gray-200 px-1.5 py-0.5 rounded">{f.name}</span>
                                                            ))}
                                                            {feats.length === 0 && !isASI && <span className="text-gray-700 text-xs">—</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── TOP BAR ── */}
            <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{character.name}</h1>
                            {/* NEW LEVEL BUTTON UI COMPACT */}
                            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg shadow-inner overflow-hidden h-7">
                                <button onClick={handleLevelDownClick} disabled={isLevelingUp} title="Seviye Düşür" className="px-2.5 bg-gray-800 hover:bg-red-900/50 text-gray-500 hover:text-red-400 font-black text-[10px] transition h-full flex items-center justify-center border-r border-gray-700 disabled:opacity-30">▼</button>
                                <div className="px-3 font-black text-gray-300 text-xs flex items-center bg-gray-800">Sv.{level}</div>
                                <button onClick={handleLevelUpClick} disabled={isLevelingUp} title="Seviye Atla" className="px-2.5 bg-gradient-to-r from-yellow-700 to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-yellow-950 font-black text-[10px] transition h-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] disabled:opacity-30">▲</button>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">
                            {character.raceRef?.name}{character.subrace ? ` (${character.subrace})` : ""} · {cls}
                            {character.subclass && <span className="text-purple-400"> [{character.subclass}]</span>}
                            {character.background && <span className="text-yellow-500 ml-1">· {character.background}</span>}
                        </p>
                        {conditions.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                {conditions.map(c => (
                                    <span key={c} className="px-2 py-0.5 bg-red-900/40 border border-red-700/50 text-red-300 text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1 shadow-sm">
                                        ⚠️ {c}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowLevelChart(true)}
                        title="Class Level Chart"
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-bold rounded-lg text-xs transition border border-gray-600 shadow-sm hidden md:block">
                        📊 Tablo
                    </button>
                    <button onClick={() => setIsGalleryOpen(true)}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg text-sm transition shadow-sm border border-blue-500 ml-1">
                        🖼 Galeri {gallery.length > 0 && `(${gallery.length})`}
                    </button>
                    <button onClick={() => setIsMapOpen(true)}
                        className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg text-sm transition shadow-sm border border-red-500 ml-1">
                        🗺 Harita
                    </button>
                    <div className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs text-gray-400 hidden xl:block">
                        Oda: <span className="text-red-400 font-mono">{campaignId}</span>
                    </div>
                    {/* REST BUTTONS MOVED TO FAR RIGHT */}
                    <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-700">
                        <button onClick={() => setIsWhisperModalOpen(true)} className="px-3 py-2 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 font-bold rounded-lg text-xs transition border border-purple-700/50 shadow-sm">
                            🤫 DM'e Fısılda
                        </button>
                        <button onClick={handleShortRest} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition border border-slate-600 shadow-sm hidden lg:block">
                            ⏳ Short Rest
                        </button>
                        <button onClick={handleLongRest} className="px-4 py-2 bg-indigo-900/80 hover:bg-indigo-700 text-indigo-100 font-black rounded-lg text-sm transition border border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:scale-105 transform">
                            ⛺ Long Rest
                        </button>
                    </div>
                </div>
            </div>

            {/* ── HP BAR ── */}
            <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
                <div className="max-w-7xl mx-auto flex items-center gap-6 flex-wrap">
                    {/* HP */}
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-wide">❤️ HP</span>
                        <button onClick={() => updateHp(currentHp - 1)} className="w-8 h-8 bg-red-800 hover:bg-red-700 rounded font-black text-lg transition">-</button>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black ${hpPct <= 25 ? 'text-red-500' : hpPct <= 50 ? 'text-orange-400' : 'text-green-400'}`}>{currentHp}</span>
                            <span className="text-gray-500 text-lg">/{character.maxHp}</span>
                        </div>
                        <button onClick={() => updateHp(currentHp + 1)} className="w-8 h-8 bg-green-800 hover:bg-green-700 rounded font-black text-lg transition">+</button>
                        <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${hpPct <= 25 ? 'bg-red-500' : hpPct <= 50 ? 'bg-orange-400' : 'bg-green-500'}`} style={{ width: `${hpPct}%` }} />
                        </div>
                        {/* Direkt değer girişi */}
                        <input type="number" value={hpInput} onChange={e => setHpInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { updateHp(Number(hpInput)); setHpInput(""); } }}
                            placeholder="HP set…" className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white text-center" />
                    </div>
                    {/* AC */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm font-bold">🛡 AC</span>
                        <span className="text-2xl font-black text-cyan-400" title={cls === 'Monk' ? '10 + DEX + WIS' : cls === 'Barbarian' ? '10 + DEX + CON' : '10 + DEX'}>{calcAC()}</span>
                    </div>
                    {/* Initiative */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm font-bold">⚡ Initiative</span>
                        <span className="text-2xl font-black text-yellow-400" title="Initiative">{fmt(calcInitiative())}</span>
                    </div>
                    {/* Prof bonus */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm font-bold">✦ Proficiency</span>
                        <span className="text-2xl font-black text-orange-400">+{prof}</span>
                    </div>
                    {/* Speed */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm font-bold">🏃 Speed</span>
                        <span className="text-2xl font-black text-white">
                            {(() => {
                                let totalSpeed = (character.raceRef?.speed || 30) + monkSpeedBonus() + getItemBonus('speed_bonus');
                                const allFeatsForSpeed = [...(character.feats || []), ...(character.raceBonusFeats || [])];
                                allFeatsForSpeed.forEach((fName: string) => {
                                    const fData = libFeats.find(x => x.name === fName);
                                    if (fData && fData.effects) {
                                        fData.effects.forEach((eff: any) => {
                                            if (eff.type === 'speed_bonus') totalSpeed += eff.value;
                                        });
                                    }
                                });
                                return totalSpeed;
                            })()} ft
                        </span>
                    </div>
                    {/* Spell Save DC + Spell Attack — spellcaster ve Monk için */}
                    {(() => {
                        const CAST_ABILITY: Record<string, string> = {
                            Cleric: 'WIS', Druid: 'WIS', Ranger: 'WIS', Monk: 'WIS',
                            Wizard: 'INT', Artificer: 'INT',
                            Sorcerer: 'CHA', Warlock: 'CHA', Bard: 'CHA', Paladin: 'CHA',
                            Fighter: 'INT', // Eldritch Knight
                        };
                        const ability = CAST_ABILITY[cls];
                        if (!ability) return null;
                        // Only show for actual spellcasters or Monk (ki save DC)
                        const showForClass = isSpellcaster(cls) || cls === 'Monk';
                        if (!showForClass) return null;
                        const abilityMod = mod(stats[ability] || 10);
                        const spellDC = 8 + prof + abilityMod + getItemBonus('stat_bonus', 'SPELL_DC');
                        const spellAtk = prof + abilityMod + getItemBonus('stat_bonus', 'SPELL_ATTACK');
                        return (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm font-bold">🔮 Spell DC</span>
                                    <span className="text-2xl font-black text-violet-400" title={`8 + Prof + ${ability}`}>{spellDC}</span>
                                </div>
                                {cls !== 'Monk' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-sm font-bold">✨ Spell Atk</span>
                                        <span className="text-2xl font-black text-fuchsia-400" title={`Prof + ${ability}`}>{fmt(spellAtk)}</span>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                    {/* Fighting Style */}
                    {character.fightingStyle && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm font-bold">⚔️ Fighting Style</span>
                            <span className="text-sm font-bold text-orange-400 bg-orange-900/30 border border-orange-800 px-2 py-0.5 rounded">{character.fightingStyle}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── DEATH SAVES ── */}
            {currentHp <= 0 && (
                <div className="bg-red-950/40 border-b border-red-900/50 px-6 py-4 animate-pulse-slow">
                    <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">☠️</span>
                            <div>
                                <h3 className="font-black text-red-500 text-base lg:text-lg uppercase tracking-widest">Ölümün Kıyısında!</h3>
                                <p className="text-red-400 text-xs lg:text-sm font-bold">Ölüm Kurtarışları Zarları At (10+ Başarılı)</p>
                            </div>
                        </div>
                        <div className="flex gap-8 bg-gray-900/50 p-3 rounded-xl border border-red-900/30 shadow-inner">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-green-400 font-black text-[10px] uppercase tracking-wider">Başarılar (Successes)</span>
                                <div className="flex gap-3">
                                    {[1, 2, 3].map(i => (
                                        <button key={`s${i}`} onClick={() => updateDeathSaves('successes', deathSaves.successes === i ? i - 1 : i)}
                                            className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center transition-all ${deathSaves.successes >= i ? 'bg-green-500 border-green-400 text-white font-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gray-800 border-gray-600 hover:border-green-500 cursor-pointer'}`}>
                                            {deathSaves.successes >= i ? '✓' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-px bg-red-900/30"></div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-red-500 font-black text-[10px] uppercase tracking-wider">Başarısızlıklar (Failures)</span>
                                <div className="flex gap-3">
                                    {[1, 2, 3].map(i => (
                                        <button key={`f${i}`} onClick={() => updateDeathSaves('failures', deathSaves.failures === i ? i - 1 : i)}
                                            className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center transition-all ${deathSaves.failures >= i ? 'bg-red-600 border-red-500 text-white font-black shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gray-800 border-gray-600 hover:border-red-500 cursor-pointer'}`}>
                                            {deathSaves.failures >= i ? '✗' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TABS ── */}
            <div className="max-w-7xl mx-auto px-4 pt-4">
                <div className="flex gap-1 border-b border-gray-700 mb-5 overflow-x-auto pb-1 custom-scrollbar">
                    {([
                        ["main", "⚔️ Karakter"],
                        ["attacks", "🗡️ Saldırılar / Aksiyonlar"],
                        ["spells", "✨ Büyüler"],
                        ["inventory", "🎒 Envanter"],
                        ["story", "📜 Hikaye"],
                        ["party", "🛡️ Parti / Oda"]
                    ] as const).map(([tab, label]) => {
                        if (tab === "spells" && actualSpells.length === 0 && !isSpellcaster(character.classRef?.name || '')) return null;
                        return (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 text-sm font-bold rounded-t-lg border-b-2 transition whitespace-nowrap ${activeTab === tab ? 'border-red-500 text-red-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                {label}
                            </button>
                        )
                    })}
                </div>

                {/* ══════════ TAB: MAIN ══════════ */}
                {activeTab === "main" && (
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-5 pb-8">

                        {/* ── SOL: Stats + Saving Throws + Skills ── */}
                        <div className="space-y-4">
                            {/* Stat Blokları */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <div className="px-4 py-2 bg-gray-750 border-b border-gray-700">
                                    <h3 className="font-black text-gray-300 uppercase text-xs tracking-widest">Ability Scores</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-px bg-gray-700">
                                    {Object.entries(stats).map(([s, v]: any) => (
                                        <div key={s} className="bg-gray-800 p-3 text-center">
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{s}</div>
                                            <div className="text-2xl font-black text-white">{v}</div>
                                            <div className={`text-sm font-black ${mod(v) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(mod(v))}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Saving Throws */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-700">
                                    <h3 className="font-black text-gray-300 uppercase text-xs tracking-widest">Saving Throws</h3>
                                </div>
                                <div className="p-2 space-y-0.5">
                                    {SAVING_THROWS.map(s => {
                                        const hasSave = saves.includes(s);
                                        const globalSaveBonus = getItemBonus('stat_bonus', 'SAVE');
                                        const bonus = mod(stats[s] || 10, s) + (hasSave ? prof : 0) + globalSaveBonus;
                                        return (
                                            <div key={s} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700/50">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${hasSave ? 'bg-green-500 border-green-400' : 'border-gray-600'}`}>
                                                    {hasSave && <span className="text-[8px] text-white font-black">✓</span>}
                                                </div>
                                                <span className={`flex-1 text-sm ${hasSave ? 'text-white font-semibold' : 'text-gray-400'}`}>{s}</span>
                                                <span className={`text-sm font-black tabular-nums ${bonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(bonus)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Passive Senses */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-4">
                                <div className="px-4 py-2 border-b border-gray-700">
                                    <h3 className="font-black text-gray-300 uppercase text-xs tracking-widest">Passive Senses</h3>
                                </div>
                                <div className="p-2 space-y-0.5">
                                    {(['Perception', 'Investigation', 'Insight'] as const).map(skillName => {
                                        const skill = SKILLS.find(s => s.name === skillName)!;
                                        const base = mod(stats[skill.ability] || 10);
                                        const skillProfs: string[] = (character.skillProfs || []).map((s: string) => s.toLowerCase().trim());
                                        const isProficient = skillProfs.some((s: string) => s === skill.name.toLowerCase() || s === skill.tr?.toLowerCase());
                                        const isExpert = (character.expertise || []).some((e: string) => e.toLowerCase() === skill.name.toLowerCase() || e.toLowerCase() === skill.tr?.toLowerCase());
                                        const bonus = isExpert ? base + prof * 2 : isProficient ? base + prof : base;
                                        const passiveScore = 10 + bonus;
                                        return (
                                            <div key={skillName} className="flex items-center justify-between px-3 py-2 rounded bg-gray-900/40 border border-gray-700/50 mb-1">
                                                <span className="text-sm text-gray-400 font-bold">{skillName}</span>
                                                <span className="text-lg font-black text-white">{passiveScore}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-700">
                                    <h3 className="font-black text-gray-300 uppercase text-xs tracking-widest">Skills <span className="text-gray-600 normal-case font-normal ml-1">(tıkla: açıklama)</span></h3>
                                </div>
                                <div className="p-2 space-y-0.5 max-h-[500px] overflow-y-auto">
                                    {SKILLS.map(skill => {
                                        const base = mod(stats[skill.ability] || 10, skill.ability);
                                        const skillProfs: string[] = (character.skillProfs || []).map((s: string) => s.toLowerCase().trim());
                                        const isProficient = skillProfs.some(s => s === skill.name.toLowerCase() || s === skill.tr?.toLowerCase());
                                        const isExpert = (character.expertise || []).some((e: string) => e.toLowerCase() === skill.name.toLowerCase() || e.toLowerCase() === skill.tr?.toLowerCase());
                                        const globalSkillBonus = getItemBonus('stat_bonus', 'SKILL');
                                        const bonus = (isExpert ? base + prof * 2 : isProficient ? base + prof : base) + globalSkillBonus;
                                        const isOpen = selectedSkill?.name === skill.name;
                                        return (
                                            <div key={skill.name}>
                                                <div
                                                    onClick={() => setSelectedSkill(isOpen ? null : skill)}
                                                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700/50 transition-colors ${isExpert ? 'bg-green-900/20' : isProficient ? 'bg-purple-900/20' : ''} ${isOpen ? 'bg-gray-700/70' : ''}`}>
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isExpert ? 'bg-green-500 border-green-400' : isProficient ? 'bg-purple-500 border-purple-400' : 'border-gray-600'}`}>
                                                        {isExpert && <span className="text-[8px] text-white font-black">★</span>}
                                                        {isProficient && !isExpert && <span className="text-[8px] text-white font-black">●</span>}
                                                    </div>
                                                    <span className={`flex-1 text-sm ${isExpert ? 'text-green-300 font-semibold' : isProficient ? 'text-purple-300 font-semibold' : 'text-gray-300'}`}>
                                                        {skill.name}
                                                        <span className="text-gray-600 text-[10px] ml-1">({skill.ability})</span>
                                                    </span>
                                                    <span className={`text-sm font-black tabular-nums ${bonus >= 0 ? (isExpert ? 'text-green-400' : isProficient ? 'text-purple-400' : 'text-green-400') : 'text-red-400'}`}>{fmt(bonus)}</span>
                                                    <span className="text-gray-600 text-xs">{isOpen ? '▲' : '▼'}</span>
                                                </div>
                                                {isOpen && (
                                                    <div className="mx-2 mb-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-400 leading-relaxed">
                                                        {skill.desc_tr}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ── ORTA: Subclass Özellikleri + Zar Kaydı ── */}
                        <div className="space-y-4">
                            {/* Subclass features */}
                            {character.subclass && character.classRef?.subclasses && (() => {
                                const sub = character.classRef.subclasses.find((s: any) => s.name === character.subclass);
                                if (!sub) return null;
                                return (
                                    <div className="bg-gray-800 rounded-xl border border-purple-800/50 overflow-hidden">
                                        <div className="px-4 py-3 bg-purple-900/30 border-b border-purple-800/50 flex items-center gap-2">
                                            <span className="text-purple-400 text-lg">✨</span>
                                            <h3 className="font-black text-purple-300">{character.subclass}</h3>
                                            <span className="text-purple-500 text-xs ml-auto">{character.classRef.name} Subclass</span>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {sub.features.map((f: any, i: number) => {
                                                const open = level >= f.level;
                                                return (
                                                    <div key={i} className={`p-3 rounded-lg border ${open ? 'border-purple-700/50 bg-purple-900/20' : 'border-gray-700 bg-gray-900/50 opacity-60'}`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${open ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                                                {open ? '✓' : '🔒'} Sv.{f.level}
                                                            </span>
                                                            <span className={`text-sm font-black ${open ? 'text-purple-300' : 'text-gray-500'}`}>{f.name}</span>
                                                        </div>
                                                        <p className={`text-xs leading-relaxed ${open ? 'text-gray-300' : 'text-gray-500'}`}>{f.desc_tr || f.desc}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Sınıf Otomatik Özellikleri (Fighting Style vs.) */}
                            {character.fightingStyle && (
                                <div className="bg-gray-800 rounded-xl border border-orange-800/50 p-4">
                                    <h3 className="font-black text-orange-400 mb-2 text-sm uppercase tracking-wide">⚔️ Fighting Style</h3>
                                    <div className="bg-orange-900/20 border border-orange-800/40 rounded-lg p-3">
                                        <p className="font-black text-orange-300 text-sm">{character.fightingStyle}</p>
                                    </div>
                                </div>
                            )}

                            {/* Expertise */}
                            {character.expertise?.length > 0 && (
                                <div className="bg-gray-800 rounded-xl border border-green-800/50 p-4">
                                    <h3 className="font-black text-green-400 mb-2 text-sm uppercase tracking-wide">🎯 Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {character.expertise.map((e: string) => (
                                            <span key={e} className="px-3 py-1 bg-green-900/30 border border-green-700 text-green-300 text-sm font-bold rounded-full">{e}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Feats */}
                            {actualFeats.length > 0 && (
                                <div className="bg-gray-800 rounded-xl border border-yellow-800/40 overflow-hidden mb-4">
                                    <div className="px-4 py-2 bg-yellow-900/20 border-b border-yellow-800/40">
                                        <h3 className="font-black text-yellow-500 uppercase text-xs tracking-widest">🌟 Featlar <span className="text-gray-500 normal-case font-normal ml-1">(tıkla: açıklama)</span></h3>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {actualFeats.map((featName: string, idx: number) => {
                                            const featDetails = libFeats.find(f => f.name === featName);
                                            const isExpanded = expandedFeat === featName;
                                            return (
                                                <div key={idx}
                                                    onClick={() => setExpandedFeat(isExpanded ? null : featName)}
                                                    className="px-3 py-2 bg-yellow-900/10 hover:bg-yellow-900/30 border border-yellow-700/50 text-yellow-100 text-sm font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span>{featName}</span>
                                                        <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                                                    </div>
                                                    {isExpanded && featDetails && (
                                                        <div className="mt-2 text-xs text-gray-300 font-normal leading-relaxed border-t border-yellow-800/30 pt-2">
                                                            <div className="mb-2 whitespace-pre-wrap">{featDetails.desc_tr || featDetails.desc}</div>
                                                            {featDetails.effects && featDetails.effects.length > 0 && (
                                                                <div className="bg-black/20 p-2 rounded border border-yellow-900/30">
                                                                    <p className="font-black text-[10px] text-yellow-600 uppercase mb-1">Etkiler:</p>
                                                                    <ul className="list-disc list-inside space-y-0.5">
                                                                        {featDetails.effects.map((eff: any, ei: number) => (
                                                                            <li key={ei} className="capitalize">
                                                                                {eff.type.replace('_', ' ')}: {typeof eff.value === 'object' ? JSON.stringify(eff.value) : eff.value}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {/* SELECTIONS DISPLAY */}
                                                            {(() => {
                                                                const sSel = featStatSelections[featName];
                                                                const spSel = featSpellSelections[featName];
                                                                const cSel = featChoiceSelections[featName];
                                                                if (!sSel && (!spSel || spSel.length === 0) && (!cSel || Object.keys(cSel).length === 0)) return null;
                                                                return (
                                                                    <div className="mt-2 bg-yellow-900/20 p-2 rounded border border-yellow-700/30 space-y-1">
                                                                        <p className="font-black text-[10px] text-yellow-500 uppercase">Seçimler:</p>
                                                                        {sSel && <p className="text-[10px] text-yellow-300">Stat: <span className="text-white">{sSel} +1</span></p>}
                                                                        {spSel && spSel.length > 0 && <p className="text-[10px] text-yellow-300">Büyüler: <span className="text-white">{spSel.join(", ")}</span></p>}
                                                                        {cSel && Object.entries(cSel).map(([label, opts]: any) => (
                                                                            <p key={label} className="text-[10px] text-yellow-300">{label}: <span className="text-white">{opts.join(", ")}</span></p>
                                                                        ))}
                                                                    </div>
                                                                )
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Dice Log */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-700">
                                    <h3 className="font-black text-gray-300 uppercase text-xs tracking-widest">📜 Dice Log</h3>
                                </div>
                                <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
                                    {diceLogs.filter((l: any) => !l.isHidden).length === 0 ? (
                                        <p className="text-gray-500 text-sm italic text-center py-4">No rolls yet.</p>
                                    ) : (
                                        diceLogs.filter((l: any) => !l.isHidden).map((log: any, i: number) => (
                                            <div key={log.id || i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${log.playerName === 'Dungeon Master' ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-900/50 border-gray-700'}`}>
                                                <span className="font-bold text-gray-300">{log.playerName}</span>
                                                <span className="text-gray-500">{log.type}</span>
                                                <span className={`ml-auto text-xl font-black ${log.rollResult === 20 ? 'text-yellow-400' : log.rollResult === 1 ? 'text-red-500' : 'text-white'}`}>{log.rollResult}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── SAĞ: Race Traits + Background ── */}
                        <div className="space-y-4">
                            {/* Resistances & Immunities */}
                            <div className="bg-gray-800 rounded-xl border border-blue-800/50 overflow-hidden">
                                <div className="px-4 py-2 bg-blue-900/20 border-b border-blue-800/50">
                                    <h3 className="font-black text-blue-400 uppercase text-xs tracking-widest flex items-center gap-2">🛡️ Savunmalar & Dirençler</h3>
                                </div>
                                <div className="p-3 space-y-3">
                                    {/* Dirençler */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><span>🗡️</span><span>Dirençler (Yarım Hasar)</span></h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {autoDefenses.res.length > 0 ? autoDefenses.res.map((r: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-blue-900/30 border border-blue-700/50 text-blue-300 text-xs font-bold rounded shadow-sm">{r}</span>
                                            )) : <span className="text-gray-600 text-[10px] font-bold italic uppercase tracking-wider">Bilinmiyor / Yok</span>}
                                        </div>
                                    </div>
                                    {/* Bağışıklıklar */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><span>🔰</span><span>Bağışıklıklar (Sıfır Hasar)</span></h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {autoDefenses.imm.length > 0 ? autoDefenses.imm.map((r: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-green-900/30 border border-green-700/50 text-green-300 text-xs font-bold rounded shadow-sm">{r}</span>
                                            )) : <span className="text-gray-600 text-[10px] font-bold italic uppercase tracking-wider">Bilinmiyor / Yok</span>}
                                        </div>
                                    </div>
                                    {/* Zayıflıklar */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><span>⚠️</span><span>Zayıflıklar (Çift Hasar)</span></h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {autoDefenses.vuln.length > 0 ? autoDefenses.vuln.map((r: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-red-900/30 border border-red-700/50 text-red-300 text-xs font-bold rounded shadow-sm">{r}</span>
                                            )) : <span className="text-gray-600 text-[10px] font-bold italic uppercase tracking-wider">Bilinmiyor / Yok</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Irk yetenekleri */}
                            {character.raceRef?.traits?.length > 0 && (
                                <div className="bg-gray-800 rounded-xl border border-yellow-800/50 overflow-hidden">
                                    <div className="px-4 py-3 bg-yellow-900/20 border-b border-yellow-800/50">
                                        <h3 className="font-black text-yellow-400 text-sm">🌟 Racial Traits — {character.raceRef.name}{character.subrace ? ` (${character.subrace})` : ''}</h3>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {character.raceRef.traits.map((t: any, i: number) => (
                                            <div key={i} className="p-2 bg-yellow-900/10 border border-yellow-800/30 rounded-lg">
                                                <p className="font-black text-yellow-300 text-xs mb-0.5">{t.name}</p>
                                                <p className="text-gray-400 text-xs leading-relaxed">{t.desc_tr}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Background (Geçmiş) Özellikleri */}
                            {character.background && (() => {
                                const bgData = ALL_BACKGROUNDS.find(b => b.name === character.background);
                                if (!bgData) return null;
                                return (
                                    <div className="bg-gray-800 rounded-xl border border-emerald-800/50 overflow-hidden">
                                        <div className="px-4 py-3 bg-emerald-900/20 border-b border-emerald-800/50">
                                            <h3 className="font-black text-emerald-400 text-sm">📜 Geçmiş (Background) — {bgData.tr || bgData.name}</h3>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="p-2 bg-emerald-900/10 border border-emerald-800/30 rounded-lg">
                                                <p className="font-black text-emerald-300 text-xs mb-0.5">Açıklama</p>
                                                <p className="text-gray-400 text-xs leading-relaxed">{bgData.desc}</p>
                                            </div>
                                            <div className="p-2 bg-emerald-900/10 border border-emerald-800/30 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="font-black text-emerald-300 text-xs mb-0.5">Yetenekler</p>
                                                    <p className="text-gray-400 text-xs">{bgData.skills}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-yellow-500 text-xs mb-0.5">Başlangıç Altını</p>
                                                    <p className="text-yellow-400 font-bold text-xs">{bgData.gold} gp</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Yoldaşlar / Petler */}
                            {character.companions?.length > 0 && (
                                <div className="bg-gray-900 rounded-xl border-2 border-yellow-900 shadow-lg overflow-hidden animate-fade-in">
                                    <div className="px-4 py-3 bg-yellow-950/40 border-b border-yellow-900 flex items-center justify-between">
                                        <h3 className="font-black text-yellow-500 uppercase text-xs tracking-widest flex items-center gap-2">
                                            🐾 Yoldaşlar & Petler
                                        </h3>
                                        <span className="text-[10px] bg-yellow-900 text-yellow-200 px-1.5 py-0.5 rounded-full font-bold">
                                            {character.companions.length}
                                        </span>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        {character.companions.map((pet: any) => (
                                            <div key={pet.id} className="bg-gray-800/80 border border-yellow-800/30 rounded-lg p-3 space-y-2 relative group hover:border-yellow-600/50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-yellow-100 text-sm flex items-center gap-2">
                                                            {pet.name}
                                                            {pet.type && <span className="text-[10px] text-yellow-500/70 border border-yellow-900/50 px-1.5 py-0.5 rounded italic">({pet.type})</span>}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 font-bold uppercase">
                                                            <span>🛡️ AC: <span className="text-blue-400">{pet.ac || 10}</span></span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm(`${pet.name} yoldaşlıktan ayrılsın mı?`)) {
                                                                const newComps = character.companions.filter((p: any) => p.id !== pet.id);
                                                                await axios.put(`${API_URL}/api/characters/${character._id}`, { companions: newComps });
                                                                setCharacter({ ...character, companions: newComps });
                                                                if (socket) (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'companions', value: newComps });
                                                            }
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-900/80 w-6 h-6 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all border border-black shadow-lg"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-md">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-[10px] font-bold mb-1">
                                                            <span className="text-red-400">CAN</span>
                                                            <span className="text-white">{pet.hp} / {pet.maxHp}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${pet.hp / pet.maxHp <= 0.3 ? 'bg-red-500' : 'bg-green-500'}`}
                                                                style={{ width: `${(pet.hp / pet.maxHp) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => updatePetHp(pet.id, pet.hp - 1)} className="w-6 h-6 bg-red-900/50 hover:bg-red-600 text-[10px] font-bold rounded">-</button>
                                                        <button onClick={() => updatePetHp(pet.id, pet.hp + 1)} className="w-6 h-6 bg-green-900/50 hover:bg-green-600 text-[10px] font-bold rounded">+</button>
                                                    </div>
                                                </div>

                                                {pet.notes && (
                                                    <p className="text-[10px] text-gray-400 italic leading-relaxed border-t border-gray-700/50 pt-2 bg-gray-900/30 p-1.5 rounded">
                                                        {pet.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}



                            {/* Hızlı zar butonları */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                                <h3 className="font-black text-gray-300 text-xs uppercase tracking-widest mb-3">🎲 Quick Dice</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map(d => (
                                        <button key={d} onClick={() => {
                                            const sides = parseInt(d.replace('d', ''));
                                            const roll = Math.floor(Math.random() * sides) + 1;
                                            if (socket) (socket as any).emit('roll_dice', { campaignId, playerName: character.name, rollResult: roll, type: d });
                                            showToast(`${d} Attın`, `Sonuç: ${roll}`, roll === sides ? 'bg-yellow-900 border-yellow-500 text-yellow-100' : 'bg-gray-800 border-gray-500 text-gray-100');
                                        }} className="py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm font-black text-gray-300 transition">
                                            {d}
                                        </button>
                                    ))}
                                </div>
                                {/* Stat bazlı zar atışları */}
                                <div className="mt-3 space-y-1">
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-2">Ability Checks</p>
                                    {Object.entries(stats).map(([s, v]: any) => {
                                        const m = mod(v); const bonus = m + (false ? prof : 0);
                                        return (
                                            <button key={s} onClick={() => {
                                                const roll = Math.floor(Math.random() * 20) + 1 + Math.max(0, m);
                                                if (socket) (socket as any).emit('roll_dice', { campaignId, playerName: character.name, rollResult: roll, type: `d20+${s}` });
                                                showToast(`${s} Kontrolü`, `Sonuç: ${roll} (zar+mod)`, roll >= 20 ? 'bg-green-900 border-green-500 text-green-100' : 'bg-gray-800 border-gray-500 text-gray-100');
                                            }} className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-700 rounded text-xs transition">
                                                <span className="font-bold text-gray-400">{s}</span>
                                                <span className={`font-black ${m >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(m)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}
                {(activeTab === "attacks" || activeTab === "spells") && (() => {
                    const clsName = character.classRef?.name || '';
                    const lv = level;
                    const slotTotals = getSpellSlotTotals(clsName, lv);
                    const canCast = isSpellcaster(clsName);
                    const mods = { CHA: mod(stats.CHA || 10), WIS: mod(stats.WIS || 10), INT: mod(stats.INT || 10), STR: mod(stats.STR || 10), DEX: mod(stats.DEX || 10), CON: mod(stats.CON || 10) };
                    const baseAttacks = CLASS_ATTACKS[clsName] || CLASS_ATTACKS['Fighter'];
                    const resources = [...(CLASS_RESOURCES[clsName] || [])];

                    // Find equipped weapons from inventory
                    const equippedWeapons = (character.inventory || []).filter((it: any) => it.isEquipped && (it.type === 'weapon' || it.name.toLowerCase().match(/sword|axe|dagger|bow|staff|mace|hammer|spear|javelin/)));

                    // Map equipped weapons to attack objects
                    const mappedWeaponAttacks = equippedWeapons.map((w: any) => {
                        const name = w.name.toLowerCase();
                        const isFinesse = name.includes('dagger') || name.includes('rapier') || name.includes('shortsword') || name.includes('scimitar') || name.includes('whip') || name.includes('bow') || name.includes('crossbow');
                        const isRanged = name.includes('bow') || name.includes('crossbow') || name.includes('sling') || name.includes('dart');

                        const atkAbility = isRanged ? 'DEX' : (isFinesse ? (mods.DEX > mods.STR ? 'DEX' : 'STR') : 'STR');
                        const damageMod = mods[atkAbility as keyof typeof mods];
                        const toHit = prof + damageMod;

                        // Default damage values if not in note
                        let damage = "1d6";
                        if (name.includes('dagger')) damage = "1d4";
                        else if (name.includes('greataxe') || name.includes('greatsword')) damage = "1d12"; // greatsword is 2d6 actually but simplifying for now
                        else if (name.includes('shortsword') || name.includes('mace') || name.includes('handaxe')) damage = "1d6";
                        else if (name.includes('longsword') || name.includes('battleaxe') || name.includes('warhammer')) damage = "1d8";
                        else if (name.includes('rapier')) damage = "1d8";
                        else if (name.includes('shortbow')) damage = "1d6";
                        else if (name.includes('longbow')) damage = "1d8";
                        else if (name.includes('light crossbow')) damage = "1d8";
                        else if (name.includes('heavy crossbow')) damage = "1d10";

                        // Check note for damage (e.g. "1d10 + 2")
                        const dmgMatch = (w.note || "").match(/(\d+d\d+)/i);
                        if (dmgMatch) damage = dmgMatch[1];

                        return {
                            name: w.name,
                            type: isRanged ? 'ranged' : 'melee',
                            toHit: fmt(toHit),
                            damage: `${damage}${fmt(damageMod)}`,
                            desc_tr: w.note || `${w.name} ile saldırı.`,
                            range: isRanged ? 'Ranged' : 'Melee'
                        };
                    });

                    const attacks = [...baseAttacks, ...mappedWeaponAttacks];

                    // Dinamik Kaynaklar (Özellik Büyüleri & Sınıf Özellikleri)
                    const addFeatRes = (fSearch: string, key: string, name: string, desc: string, icon: string, recharge: 'short' | 'long', max: number | ((lv: number) => number)) => {
                        if (actualFeats.some(f => f.includes(fSearch))) {
                            resources.push({ key, name, desc_tr: desc, icon, recharge, getMax: typeof max === 'number' ? () => max : max });
                        }
                    };
                    const pb = (lv: number) => Math.ceil(lv / 4) + 1;

                    addFeatRes('Fey Touched', 'feat_fey_touched', 'Misty Step & 1lvl Spell (Fey Touched)', 'Uzun Dinlenmede 1\'er kez bedava kullanım.', '✨', 'long', 1);
                    addFeatRes('Shadow Touched', 'feat_shadow_touched', 'Invisibility & 1lvl Spell (Shadow Touched)', 'Uzun Dinlenmede 1\'er kez bedava.', '🌑', 'long', 1);
                    addFeatRes('Lucky', 'feat_lucky', 'Lucky Points', 'Zar atışlarında d20 atıp seçmek için.', '🍀', 'long', 3);
                    addFeatRes('Metamagic Adept', 'feat_metamagic_adept', 'Sorcery Points (Metamagic Adept)', 'Metamagic yetenekleri için kullanılır.', '🔮', 'long', 2);
                    addFeatRes('Boon of Fate', 'boon_of_fate', 'Boon of Fate', 'Zarlara d10 ekle/çıkar (PB defa).', '⚖️', 'long', pb);
                    addFeatRes('Magic Initiate', 'feat_magic_initiate', '1. Seviye Büyü (Magic Initiate)', 'Slot harcamadan 1 kez.', '✨', 'long', 1);
                    addFeatRes('Telepathic', 'feat_telepathic', 'Detect Thoughts (Telepathic)', 'Slot harcamadan 1 kez.', '🧠', 'long', 1);
                    addFeatRes('Arcanist', 'feat_arcanist', 'Detect Magic & Identify (Arcanist)', 'Slot harcamadan birer kez.', '🔮', 'long', 1);
                    addFeatRes('Fade Away', 'feat_fade_away', 'Fade Away (Invisibility)', 'Reaksiyonla görünmezlik.', '🌫️', 'short', 1);
                    addFeatRes('Fey Teleportation', 'feat_fey_teleport', 'Misty Step (Fey Teleportation)', 'Slot harcamadan 1 kez.', '✨', 'short', 1);
                    addFeatRes('Flash Recall', 'feat_flash_recall', 'Flash Recall', 'Hazırladığın büyüyü değiştir.', '🔄', 'short', 1);
                    addFeatRes('Gift of the Chromatic Dragon', 'feat_chromatic_infusion', 'Chromatic Infusion', 'Silaha +1d4 element hasarı.', '🐉', 'long', 1);
                    addFeatRes('Gift of the Chromatic Dragon', 'feat_chromatic_resist', 'Reactive Resistance', 'Hasar direnci sağla (PB kez).', '🛡️', 'long', pb);
                    addFeatRes('Gift of the Gem Dragon', 'feat_gem_dragon', 'Telekinetic Reprisal', 'Hasar vereni psionik olarak it (PB kez).', '🔮', 'long', pb);
                    addFeatRes('Gift of the Metallic Dragon', 'feat_metallic_wings', 'Protective Wings', 'Müttefik AC\'sine ekle (PB kez).', '🛡️', 'long', pb);
                    addFeatRes('Gift of the Metallic Dragon', 'feat_metallic_cure', 'Cure Wounds (Metallic Dragon)', '1 kez ücretsiz Cure Wounds.', '❤️', 'long', 1);
                    addFeatRes('Wood Elf Magic', 'feat_wood_elf_magic', 'Wood Elf Magic (Büyüler)', 'Longstrider/Pass Without Trace 1\'er kez.', '🍃', 'long', 1);
                    addFeatRes('Boon of Recovery', 'boon_recovery', 'Boon of Recovery', '1 HP ile hayatta kal.', '❤️‍🔥', 'long', 1);
                    addFeatRes('Boon of Spell Recall', 'boon_spell_recall', 'Spell Recall', 'Harcanmış bir slotu geri kazan.', '✨', 'long', 1);
                    addFeatRes('Divinely Favored', 'feat_divinely_favored', '1. Seviye Büyü (Divinely Favored)', 'Slot harcamadan 1 kez.', '✝️', 'long', 1);
                    addFeatRes('Crafter', 'feat_crafter', 'Create Small Item (Crafter)', 'Ücretsiz küçük eşya üret.', '🛠️', 'long', 1);
                    addFeatRes('Inspiring Leader', 'feat_inspiring_leader', 'Inspiring Leader', '10dk konuşma ile geçici HP ver.', '🗣️', 'short', 1);
                    addFeatRes('Chef', 'feat_chef', 'Treats (Chef)', 'Özel atıştırmalıklar üret (PB kez).', '🍲', 'long', pb);
                    addFeatRes('Healer', 'feat_healer', 'Healer Stabilize', 'Healer Kit ile ekstra iyileştirme.', '⚕️', 'short', 1);

                    if (actualFeats.some(f => f.includes('Martial Adept') || f.includes('Superior Technique'))) {
                        if (clsName !== 'Fighter' || (clsName === 'Fighter' && character.subclass !== 'Battle Master')) {
                            resources.push({ key: 'feat_martial_adept', name: 'Superiority Dice (1d6)', desc_tr: 'Manevralar için kullanılır.', icon: '⚔️', recharge: 'short', getMax: () => 1 });
                        }
                    }

                    if (character.raceRef?.name === 'Tiefling' && level >= 3) {
                        resources.push({ key: 'tiefling_hellish_rebuke', name: 'Hellish Rebuke', desc_tr: 'Uzun Dinlenmede 1 kez 2. seviye Hellish Rebuke atabilirsin.', icon: '🔥', recharge: 'long', getMax: () => 1 });
                    }
                    if (character.raceRef?.name === 'Tiefling' && level >= 5) {
                        resources.push({ key: 'tiefling_darkness', name: 'Darkness', desc_tr: 'Uzun Dinlenmede 1 kez Darkness atabilirsin.', icon: '🌑', recharge: 'long', getMax: () => 1 });
                    }
                    if (character.raceRef?.name?.includes('Elf') && character.subrace === 'Drow (Dark Elf)' && level >= 3) {
                        resources.push({ key: 'drow_faerie_fire', name: 'Faerie Fire', desc_tr: 'Uzun Dinlenmede 1 kez Faerie Fire atabilirsin.', icon: '✨', recharge: 'long', getMax: () => 1 });
                    }
                    if (character.raceRef?.name?.includes('Elf') && character.subrace === 'Drow (Dark Elf)' && level >= 5) {
                        resources.push({ key: 'drow_darkness', name: 'Darkness', desc_tr: 'Uzun Dinlenmede 1 kez Darkness atabilirsin.', icon: '🌑', recharge: 'long', getMax: () => 1 });
                    }
                    if (character.subclass === 'The Hexblade') {
                        resources.push({ key: 'hexblades_curse', name: 'Hexblade\'s Curse', desc_tr: 'Kısa/uzun dinlenme başına 1 hedefe lanet (Extra hasar/Kritik artışı).', icon: '💀', recharge: 'short', getMax: () => 1 });
                    }

                    const useSlot = async (slotLv: number, spellName: string, isConc: boolean) => {
                        const key = String(slotLv);
                        const used = spellSlotsUsed[key] ?? 0;
                        const total = slotTotals[slotLv - 1] ?? 0;
                        if (total <= 0 || used >= total) return;
                        const newUsed = { ...spellSlotsUsed, [key]: used + 1 };
                        const newConc = isConc ? spellName : concentrationSpell;
                        setSpellSlotsUsed(newUsed);
                        if (isConc) setConcentrationSpell(spellName);
                        setCastingSpell(null);
                        await saveCombatState({ spellSlotsUsed: newUsed, concentrationSpell: newConc });
                        showToast(`\u2728 ${spellName}`, `${slotLv}. seviye slot harcand\u0131${isConc ? ' \ud83d\udd35 Konsantre' : ''}.`, 'bg-blue-900 border-blue-500 text-blue-100');
                    };

                    const useResource = async (key: string, amount: number = 1) => {
                        const res = resources.find(r => r.key === key);
                        if (!res) return false;
                        const maxVal = res.getMax(lv, mods);
                        const used = resourcesUsed[key] ?? 0;
                        if (used + amount > maxVal) {
                            showToast("Yetersiz Kaynak", `${res.name} için kullanım hakkınız yok.`, "bg-red-900 border-red-500 text-red-100");
                            return false;
                        }
                        const newUsed = { ...resourcesUsed, [key]: used + amount };
                        setResourcesUsed(newUsed);
                        await saveCombatState({ resourcesUsed: newUsed });
                        return true;
                    };

                    const dropConcentration = async () => {
                        setConcentrationSpell('');
                        await saveCombatState({ concentrationSpell: '' });
                    };

                    const extractDice = (text: string) => {
                        if (!text) return null;
                        const match = text.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/i);
                        if (match) {
                            return { count: parseInt(match[1]), sides: parseInt(match[2]), bonus: match[3] ? parseInt(match[3]) : 0 };
                        }
                        return null;
                    };

                    const handleRoll = async (name: string, dice: any, typeLabel: string, cost?: { key: string, amount: number, name: string }) => {
                        if (cost) {
                            const success = await useResource(cost.key, cost.amount);
                            if (!success) return; // Kaynak yoksa zarı da atma!
                        }
                        let total = 0;
                        for (let i = 0; i < dice.count; i++) {
                            total += Math.floor(Math.random() * dice.sides) + 1;
                        }
                        total += dice.bonus;
                        const formula = `${dice.count}d${dice.sides}${dice.bonus ? `+${dice.bonus}` : ''}`;
                        if (socket && character) {
                            (socket as any).emit('roll_dice', {
                                campaignId,
                                playerName: character.name,
                                rollResult: total,
                                type: `${name} ${typeLabel} (${formula})`
                            });
                        }
                        showToast(`🎲 ${name} - ${formula}`, cost ? `${cost.amount} ${cost.name} harcandı! Sonuç: ${total}` : `${typeLabel} Sonucu: ${total}`, 'bg-purple-900 border-purple-500 text-purple-100');
                    };

                    return (
                        <div className="pb-8 space-y-5">
                            {/* ── REST ACTIONS (Moved to topbar) ── */}
                            {concentrationSpell && (
                                <div className="flex gap-3 flex-wrap">
                                    <button onClick={dropConcentration} className="px-4 py-2.5 bg-red-800/60 hover:bg-red-700 text-red-200 font-bold rounded-xl text-sm transition border border-red-600 shadow-sm">
                                        🔵 Drop Concentration: <span className="font-black">{concentrationSpell}</span>
                                    </button>
                                </div>
                            )}

                            {/* ── CONCENTRATION STATUS ── */}
                            {concentrationSpell && (
                                <div className="bg-blue-900/30 border-2 border-blue-500/60 rounded-xl px-5 py-3 flex items-center gap-3">
                                    <span className="text-blue-400 text-2xl">🔵</span>
                                    <div>
                                        <p className="text-blue-300 font-black text-xs uppercase tracking-wide">Aktif Konsantrasyon</p>
                                        <p className="text-white font-black text-lg">{concentrationSpell}</p>
                                    </div>
                                    <button onClick={dropConcentration} className="ml-auto text-gray-400 hover:text-white text-xl">✕</button>
                                </div>
                            )}

                            {activeTab === "attacks" && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {/* ── BASIC ATTACKS ── */}
                                    <div className="bg-gray-800 rounded-xl border border-red-800/40 overflow-hidden">
                                        <div className="px-4 py-3 bg-red-900/20 border-b border-red-800/40">
                                            <h3 className="font-black text-red-400 text-sm uppercase tracking-wide">⚔️ Attacks — {clsName}</h3>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            {attacks.map((atk, i) => {
                                                const expanded = expandedAtkIdx === i;
                                                return (
                                                    <div key={i}
                                                        className={`p-3 rounded-xl border cursor-pointer transition ${expanded ? 'border-white/30' : ''} ${atk.type === 'heal' ? 'border-green-800/50 bg-green-900/10' : atk.type === 'special' ? 'border-orange-800/40 bg-orange-900/10' : atk.type === 'save' ? 'border-yellow-800/40 bg-yellow-900/10' : 'border-gray-700 bg-gray-900/60'}`}
                                                        onClick={() => setExpandedAtkIdx(expanded ? null : i)}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs px-2 py-0.5 rounded font-bold bg-gray-700 text-gray-400 uppercase">
                                                                {atk.type === 'melee' ? '⚔️' : atk.type === 'ranged' ? '🏹' : atk.type === 'save' ? '⚡' : atk.type === 'heal' ? '❤️' : '✨'} {atk.type}
                                                            </span>
                                                            <span className="font-black text-white text-sm">{atk.name}</span>
                                                            {atk.range && <span className="text-gray-500 text-xs ml-auto">{atk.range}</span>}
                                                            <span className="text-gray-600 text-xs ml-auto">{expanded ? '▲' : '▼'}</span>
                                                        </div>
                                                        <div className="flex gap-4 text-xs mt-1 flex-wrap">
                                                            {atk.toHit && <span className="text-green-400">To Hit: <span className="font-black">{atk.toHit}</span></span>}
                                                            <span className="text-yellow-300">Hasar: <span className="font-black">{atk.damage}</span></span>
                                                        </div>
                                                        {expanded && (
                                                            <div className="mt-2 text-gray-300 text-xs leading-relaxed border-t border-gray-700 pt-2">
                                                                <p className="mb-2">{atk.desc_tr}</p>
                                                                <div className="flex gap-2">
                                                                    {atk.toHit && (
                                                                        <button onClick={(e) => { e.stopPropagation(); handleRoll(atk.name, { count: 1, sides: 20, bonus: parseInt(atk.toHit) }, 'Saldırı', atk.resourceCost); }} className="px-3 py-1.5 bg-green-900/40 hover:bg-green-800 text-green-300 border border-green-700 rounded text-xs transition flex items-center gap-1 font-bold">
                                                                            ⚔️ Saldır
                                                                        </button>
                                                                    )}
                                                                    {atk.damage && atk.damage !== '—' && (() => {
                                                                        const dice = extractDice(atk.damage);
                                                                        if (!dice) return null;
                                                                        return (
                                                                            <button onClick={(e) => { e.stopPropagation(); handleRoll(atk.name, dice, 'Hasar', atk.resourceCost); }} className="px-3 py-1.5 bg-yellow-900/40 hover:bg-yellow-800 text-yellow-300 border border-yellow-700 rounded text-xs transition flex items-center gap-1 font-bold">
                                                                                🩸 Hasar
                                                                            </button>
                                                                        );
                                                                    })()}
                                                                    {atk.resourceCost && (!atk.toHit && (!atk.damage || atk.damage === '—')) && (
                                                                        <button onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            const success = await useResource(atk.resourceCost!.key, atk.resourceCost!.amount);
                                                                            if (success) showToast(`✨ ${atk.name}`, `${atk.resourceCost!.amount} ${atk.resourceCost!.name} harcandı ve özellik kullanıldı.`, 'bg-orange-900 border-orange-500 text-orange-100');
                                                                        }} className="px-3 py-1.5 bg-orange-900/40 hover:bg-orange-800 text-orange-300 border border-orange-700 rounded text-xs transition flex items-center gap-1 font-bold">
                                                                            ✨ Harca ve Kullan ({atk.resourceCost!.amount})
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── CLASS RESOURCES ── */}
                                    {resources.length > 0 && (
                                        <div className="bg-gray-800 rounded-xl border border-orange-800/40 overflow-hidden">
                                            <div className="px-4 py-3 bg-orange-900/20 border-b border-orange-800/40">
                                                <h3 className="font-black text-orange-400 text-sm uppercase tracking-wide">⚡ Class Resources</h3>
                                            </div>
                                            <div className="p-3 space-y-3">
                                                {resources.map(res => {
                                                    const maxVal = res.getMax(lv, mods);
                                                    if (maxVal <= 0) return null;
                                                    const used = resourcesUsed[res.key] ?? 0;
                                                    const remaining = Math.max(0, maxVal - used);
                                                    return (
                                                        <div key={res.key} className="bg-gray-900/60 rounded-xl p-3 border border-gray-700">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xl">{res.icon}</span>
                                                                <div className="flex-1">
                                                                    <p className="font-black text-white text-sm">{res.name}</p>
                                                                    <p className="text-gray-500 text-[10px]">{res.recharge === 'short' ? '⏳ Short Rest' : '🌙 Long Rest'}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`text-2xl font-black ${remaining > 0 ? 'text-orange-400' : 'text-red-500'}`}>{remaining}</span>
                                                                    <span className="text-gray-600 text-sm">/{maxVal}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1 flex-wrap mb-2">
                                                                {Array.from({ length: Math.min(maxVal, 20) }).map((_, i) => (
                                                                    <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < remaining ? 'bg-orange-500 border-orange-400' : 'bg-gray-700 border-gray-600'}`} />
                                                                ))}
                                                            </div>
                                                            <p className="text-gray-500 text-[10px] mb-2 leading-tight">{res.desc_tr}</p>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => useResource(res.key)} disabled={remaining <= 0}
                                                                    className="flex-1 py-1.5 bg-orange-700 hover:bg-orange-600 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition">
                                                                    Use
                                                                </button>
                                                                <button onClick={() => setResourcesUsed(p => ({ ...p, [res.key]: Math.max(0, (p[res.key] ?? 0) - 1) }))}
                                                                    disabled={used <= 0}
                                                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-300 font-bold rounded-lg text-xs transition">
                                                                    ↩
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "spells" && (
                                <div className="space-y-5">
                                    {/* ── SPELL SLOTS ── */}
                                    {canCast && slotTotals.some(t => t > 0) && (
                                        <div className="bg-gray-800 rounded-xl border border-blue-800/40 overflow-hidden">
                                            <div className="px-4 py-3 bg-blue-900/20 border-b border-blue-800/40">
                                                <h3 className="font-black text-blue-400 text-sm uppercase tracking-wide">
                                                    🔮 Spell Slots {clsName === 'Warlock' ? '— Pact Magic (Short Rest)' : '— Long Rest'}
                                                </h3>
                                            </div>
                                            <div className="p-4 flex flex-wrap gap-6">
                                                {slotTotals.map((total, idx) => {
                                                    if (total === 0) return null;
                                                    const slotLv = idx + 1;
                                                    const used = spellSlotsUsed[String(slotLv)] ?? 0;
                                                    const remaining = Math.max(0, total - used);
                                                    return (
                                                        <div key={slotLv} className="flex flex-col items-center gap-1">
                                                            <span className="text-gray-400 text-xs font-black">Level {slotLv}</span>
                                                            <div className="flex gap-1">
                                                                {Array.from({ length: total }).map((_, i) => (
                                                                    <div key={i} className={`w-5 h-5 rounded-full border-2 ${i < remaining ? 'bg-blue-500 border-blue-400' : 'bg-gray-700 border-gray-600'}`} />
                                                                ))}
                                                            </div>
                                                            <span className={`text-sm font-black ${remaining > 0 ? 'text-blue-300' : 'text-red-400'}`}>{remaining}/{total}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── SPELLS LIST ── */}
                                    {actualSpells.length > 0 && (() => {
                                        const groupedSpells: Record<string, string[]> = {};
                                        // Kategorileri sıralamak için önceden tanımlanmış sıra
                                        const catOrder = ["Cantrips (0)", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Diğer Özellikler"];

                                        actualSpells.forEach(sp => {
                                            const details = spellDetails[sp];
                                            let cat = 'Diğer Özellikler';
                                            if (details && typeof details.level_int === 'number') {
                                                if (details.level_int === 0) cat = "Cantrips (0)";
                                                else cat = `Level ${details.level_int}`;
                                            }
                                            if (!groupedSpells[cat]) groupedSpells[cat] = [];
                                            groupedSpells[cat].push(sp);
                                        });

                                        const activeCategories = catOrder.filter(cat => groupedSpells[cat] && groupedSpells[cat].length > 0);

                                        return (
                                            <div className="bg-gray-800 rounded-xl border border-purple-800/40 overflow-hidden">
                                                <div className="px-4 py-3 bg-purple-900/20 border-b border-purple-800/40 flex items-center gap-3">
                                                    <h3 className="font-black text-purple-400 text-sm uppercase tracking-wide">✨ Known Spells & Abilities</h3>
                                                    <span className="px-2 py-0.5 bg-purple-900/50 border border-purple-700 text-purple-300 text-xs rounded-full font-bold">{actualSpells.length}</span>
                                                </div>
                                                <div className="p-4 space-y-6">
                                                    {activeCategories.map(cat => (
                                                        <div key={cat} className="space-y-1 mb-8">
                                                            <div className="flex items-center gap-3 mb-2 border-b border-gray-800 pb-2">
                                                                <h4 className="font-extrabold text-orange-500 tracking-wider text-base">{cat}</h4>
                                                                <div className="flex-1 flex justify-end">
                                                                    {(() => {
                                                                        const levelMatch = cat.match(/Level (\d+)/);
                                                                        if (levelMatch) {
                                                                            const slotLv = parseInt(levelMatch[1]);
                                                                            const total = slotTotals[slotLv - 1] ?? 0;
                                                                            const used = spellSlotsUsed[String(slotLv)] ?? 0;
                                                                            if (total > 0) {
                                                                                return (
                                                                                    <div className="flex gap-2 items-center">
                                                                                        {Array.from({ length: total }).map((_, i) => (
                                                                                            <div key={i} className={`w-5 h-5 border-2 rounded-sm transition ${i < (total - used) ? 'bg-gray-200 border-gray-200 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-transparent border-gray-600'}`}></div>
                                                                                        ))}
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                {groupedSpells[cat].map((sp: string, i: number) => {
                                                                    const isConc = CONCENTRATION_SPELLS.has(sp);
                                                                    const isActiveCastTarget = castingSpell === sp;
                                                                    const isActiveConc = concentrationSpell === sp;

                                                                    const details = spellDetails[sp];
                                                                    const hasValidSlotsForSpell = details?.level_int > 0 ? slotTotals.some((total, idx) => {
                                                                        const slotLv = idx + 1;
                                                                        return slotLv >= details.level_int && (total - (spellSlotsUsed[String(slotLv)] ?? 0) > 0);
                                                                    }) : true;

                                                                    const isExpanded = expandedSpell === sp;

                                                                    return (
                                                                        <div key={i} className={`transition border-b border-gray-800/40 hover:bg-gray-800/50 flex flex-col justify-center ${isActiveConc ? 'bg-blue-900/20' : ''}`}>
                                                                            <div className="flex items-center justify-between p-2 cursor-pointer group" onClick={() => setExpandedSpell(isExpanded ? null : sp)}>
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="font-semibold text-gray-200 text-sm group-hover:text-white transition">{sp}</span>
                                                                                    {details && (details.desc?.toLowerCase().includes('damage') || details.desc?.toLowerCase().includes('hasar') || details.desc?.includes('d4') || details.desc?.includes('d6') || details.desc?.includes('d8') || details.desc?.includes('d10') || details.desc?.includes('d12')) && <span className="text-[10px] bg-gray-800 px-1 py-0.5 rounded text-gray-400 border border-gray-700 shadow-sm leading-none flex items-center justify-center">🎲</span>}
                                                                                    {isConc && <span className="text-[9px] px-1 bg-blue-900/60 border border-blue-700 text-blue-300 rounded font-bold whitespace-nowrap leading-none tracking-wider flex items-center justify-center">C</span>}
                                                                                    {(() => {
                                                                                        const featEntry = Object.entries(featSpellSelections).find(([fName, sNames]: any) => Array.isArray(sNames) && sNames.includes(sp));
                                                                                        if (featEntry) return <span className="text-[9px] px-1 bg-amber-900/60 border border-amber-700 text-amber-300 rounded font-bold whitespace-nowrap leading-none tracking-wider flex items-center justify-center ml-1">FEAT: {featEntry[0]}</span>;
                                                                                        return null;
                                                                                    })()}
                                                                                    {isActiveConc && <span className="text-[10px] text-blue-400 font-bold ml-1 animate-pulse">AKTİF</span>}
                                                                                </div>

                                                                                {!isExpanded && (
                                                                                    <div className="opacity-0 group-hover:opacity-100 transition duration-200">
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); setCastingSpell(sp); }}
                                                                                            className="py-1 px-3 bg-purple-700 hover:bg-purple-600 text-white text-[10px] font-bold rounded"
                                                                                        >
                                                                                            Kullan
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {/* EXPANDED DETAILS */}
                                                                            {isExpanded && (
                                                                                <div className="px-3 pb-3 pt-1">
                                                                                    {details && (
                                                                                        <div className="mb-3 p-3 bg-gray-950/50 rounded border border-gray-800/80 text-xs text-gray-300">
                                                                                            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2 pb-2 border-b border-gray-800 text-[10px] text-gray-400 font-bold">
                                                                                                {details.level_int === 0 ? <span className="text-purple-400">Cantrip</span> : <span className="text-blue-400">Level {details.level_int}</span>}
                                                                                                <span>⏱️ {details.casting_time}</span>
                                                                                                <span>📏 {details.range}</span>
                                                                                                <span>✨ {details.components}</span>
                                                                                                <span>⏳ {details.duration}</span>
                                                                                            </div>
                                                                                            <p className="whitespace-pre-wrap leading-relaxed opacity-90">{details.desc_tr || details.desc}</p>
                                                                                        </div>
                                                                                    )}
                                                                                    {!isActiveCastTarget ? (
                                                                                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                                                                            <button onClick={() => setCastingSpell(sp)} disabled={canCast && details?.level_int > 0 && !hasValidSlotsForSpell && !isConc}
                                                                                                className="flex-1 py-2 bg-gray-800 hover:bg-purple-700 disabled:opacity-40 text-purple-300 hover:text-white text-xs font-bold rounded transition border border-gray-600 hover:border-purple-500">
                                                                                                Büyüyü Kullan / Tetikle
                                                                                            </button>
                                                                                            {(() => {
                                                                                                const dice = extractDice(details?.desc_tr || details?.desc);
                                                                                                if (!dice) return null;
                                                                                                return (
                                                                                                    <button onClick={() => handleRoll(sp, dice, 'Büyü')} className="px-4 py-2 bg-blue-900/50 hover:bg-blue-800 text-blue-300 hover:text-white border border-blue-700/50 rounded font-bold text-xs flex items-center justify-center transition">
                                                                                                        🎲 Zar At
                                                                                                    </button>
                                                                                                );
                                                                                            })()}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="bg-gray-900 border border-gray-700 p-2 rounded mt-2">
                                                                                            {isConc && concentrationSpell && concentrationSpell !== sp && (
                                                                                                <p className="text-yellow-400 text-[10px] mb-1.5 bg-yellow-900/30 px-2 py-1 rounded">⚠️ <strong>{concentrationSpell}</strong> bozulacak!</p>
                                                                                            )}
                                                                                            {canCast && details?.level_int > 0 ? (
                                                                                                <>
                                                                                                    <p className="text-gray-500 text-[10px] mb-1">Slot seç:</p>
                                                                                                    <div className="flex gap-1 flex-wrap">
                                                                                                        {slotTotals.map((total, idx) => {
                                                                                                            if (total === 0) return null;
                                                                                                            const slotLv = idx + 1;
                                                                                                            if (slotLv < details.level_int) return null;
                                                                                                            const avail = total - (spellSlotsUsed[String(slotLv)] ?? 0);
                                                                                                            return (
                                                                                                                <button key={slotLv} onClick={() => useSlot(slotLv, sp, isConc)}
                                                                                                                    disabled={avail <= 0}
                                                                                                                    className={`px-3 py-1.5 rounded text-xs font-black transition border ${avail > 0 ? 'bg-purple-700 border-purple-500 text-white hover:bg-purple-600' : 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'}`}>
                                                                                                                    L{slotLv} ({avail})
                                                                                                                </button>
                                                                                                            );
                                                                                                        })}
                                                                                                        <button onClick={() => setCastingSpell(null)} className="px-3 py-1.5 text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700">İptal</button>
                                                                                                    </div>
                                                                                                </>
                                                                                            ) : (
                                                                                                <div className="flex gap-1">
                                                                                                    <button onClick={() => { setCastingSpell(null); showToast(`✨ ${sp}`, 'Kullanıldı!', 'bg-purple-900 border-purple-500 text-purple-100'); }}
                                                                                                        className="flex-1 py-1.5 bg-purple-700 text-white text-xs font-bold rounded hover:bg-purple-600 border border-purple-600">
                                                                                                        ✓ Onayla
                                                                                                    </button>
                                                                                                    <button onClick={() => setCastingSpell(null)} className="px-3 py-1.5 text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700">İptal</button>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ══════════ TAB: INVENTORY ══════════ */}
                {activeTab === "inventory" && (
                    <div className="max-w-4xl pb-8 space-y-6">

                        {/* ── MONEY CARD ── */}
                        <div className="bg-gray-800 rounded-xl border border-yellow-800/40 overflow-hidden">
                            <div className="px-4 py-3 bg-yellow-900/20 border-b border-yellow-800/40">
                                <h3 className="font-black text-yellow-400 text-sm uppercase tracking-wide">💰 Cüzdan (Para)</h3>
                            </div>
                            <div className="p-4 grid grid-cols-5 gap-3">
                                {[
                                    { key: 'cp', label: 'CP', name: 'Bakır', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800' },
                                    { key: 'sp', label: 'SP', name: 'Gümüş', color: 'text-gray-300', bg: 'bg-gray-800', border: 'border-gray-600' },
                                    { key: 'ep', label: 'EP', name: 'Elektrum', color: 'text-indigo-300', bg: 'bg-indigo-950/40', border: 'border-indigo-800' },
                                    { key: 'gp', label: 'GP', name: 'Altın', color: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-700' },
                                    { key: 'pp', label: 'PP', name: 'Platin', color: 'text-slate-100', bg: 'bg-slate-800', border: 'border-slate-500' }
                                ].map(coin => {
                                    const amount = character.money?.[coin.key] || 0;
                                    return (
                                        <div key={coin.key} className={`rounded-xl border flex flex-col items-center justify-between p-2 overflow-hidden ${coin.bg} ${coin.border}`}>
                                            <span className={`font-black text-xs uppercase ${coin.color} mb-1`} title={coin.name}>{coin.label}</span>
                                            <span className="text-2xl font-black text-white mb-2">{amount}</span>
                                            <div className="flex gap-1 w-full relative z-10">
                                                <button onClick={() => updateMoney(coin.key, -1)} disabled={amount <= 0} className="flex-1 bg-red-900/60 hover:bg-red-800 disabled:opacity-30 rounded font-black text-white text-xs py-1 transition">-</button>
                                                <button onClick={() => updateMoney(coin.key, 1)} className="flex-1 bg-green-900/60 hover:bg-green-800 rounded font-black text-white text-xs py-1 transition">+</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* ── INVENTORY LIST ── */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-750 border-b border-gray-700 flex justify-between items-center">
                                <h3 className="font-black text-gray-300 text-sm uppercase tracking-wide">🎒 Eşyalar {character.inventory?.length ? `(${character.inventory.length})` : ''}</h3>
                            </div>

                            <div className="p-4 space-y-3">
                                {/* ITEM LIST */}
                                {character.inventory?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                        {character.inventory.map((item: any, idx: number) => (
                                            <div key={idx} className={`bg-gray-900/60 border rounded-xl p-3 flex flex-col transition-all ${item.isEquipped ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-gray-700'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-gray-800 px-2 py-0.5 rounded font-black text-xs text-gray-400 border border-gray-700">{item.qty}x</span>
                                                        <span className={`font-black text-sm ${item.isEquipped ? 'text-blue-400' : 'text-white'}`}>{item.name} {item.isEquipped && '🛡️'}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {(item.type === 'armor' || item.type === 'weapon' || item.type === 'shield' || item.name.toLowerCase().includes('shield')) && (
                                                            <button
                                                                onClick={() => toggleEquip(idx)}
                                                                className={`text-[10px] px-2 py-1 rounded font-bold transition ${item.isEquipped
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                                                    }`}
                                                            >
                                                                {item.isEquipped ? 'Giyili' : 'Giy'}
                                                            </button>
                                                        )}
                                                        <button onClick={() => removeItem(idx)} className="text-gray-500 hover:text-red-400 text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition">Sil</button>
                                                    </div>
                                                </div>
                                                {item.note && <p className="text-gray-400 text-xs italic border-l-2 border-gray-600 pl-2 ml-1 flex-1">{item.note}</p>}
                                                <div className="mt-2 flex gap-2">
                                                    {item.type && <span className="text-[9px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700 uppercase tracking-tighter">{item.type}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-6 italic">Envanterin şu an boş.</p>
                                )}

                                {/* ADD NEW ITEM */}
                                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                    <h4 className="font-black text-gray-400 text-xs mb-3 uppercase tracking-wider">➕ Yeni Eşya Ekle</h4>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="flex-1">
                                            <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Eşya Adı (Örn: Potion of Healing)" className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                                        </div>
                                        <div className="w-24">
                                            <input type="number" min="1" value={newItemQty} onChange={e => setNewItemQty(Number(e.target.value) || 1)} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition text-center" />
                                        </div>
                                        <div className="flex-[2]">
                                            <input type="text" value={newItemNote} onChange={e => setNewItemNote(e.target.value)} placeholder="Not (Opsiyonel)" className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
                                        </div>
                                        <button onClick={addItem} disabled={!newItemName.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg px-6 py-2 text-sm transition shrink-0">Ekle</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ TAB: STORY ══════════ */}
                {activeTab === "story" && (
                    <div className="max-w-3xl pb-8 space-y-6">

                        {/* Background */}
                        {character.background && (() => {
                            const BG_DESCRIPTIONS: Record<string, { desc_tr: string; features_tr: string[]; skills: string[] }> = {
                                'Acolyte': { desc_tr: 'Bir tapınak ya da dini örgütte büyümüş, tanrılara hizmet etmiş biri. İnancını ve ritüelleri derinden bilir.', features_tr: ['Shelter of the Faithful: Verdiğin inanç yolundaki tapınaklarda barınak ve temel yiyecek bulabilirsin.'], skills: ['Insight', 'Religion'] },
                                'Charlatan': { desc_tr: 'İnsanları kandırarak ve kimlikler uydurarak hayatta kalan bir kişi. Şaklabanite, sahte belgeler ve ikna kabiliyetiyle hayatta kalmayı öğrendi.', features_tr: ['False Identity: Sahte bir kimliğe sahipsin; belgelerin ve geçmişin gerçekmiş gibi görünür.'], skills: ['Deception', 'Sleight of Hand'] },
                                'Criminal': { desc_tr: 'Kanun dışı işler yaparak hayatını kazanmış biri. Organize suç örgütleriyle ya da sokak çeteleriyle bağlantılı.', features_tr: ['Criminal Contact: Haber ağına erişim sağlayan suç dünyasından bir kişisel bağlantın var.'], skills: ['Deception', 'Stealth'] },
                                'Entertainer': { desc_tr: 'Sahnede, arenada ya da sokaklarda performans göstererek yaşamını sürdüren biri.', features_tr: ['By Popular Demand: Performans gösterip gösterdiğin yerlerde ücretsiz konaklama ve yemek bulabilirsin.'], skills: ['Acrobatics', 'Performance'] },
                                'Folk Hero': { desc_tr: 'Küçük bir köyden çıkıp halkın koruyucusu olan biri. Efsaneleri ve cesareti ile tanınır.', features_tr: ['Rustic Hospitality: Sıradan insanlar sana kapılarını açar; barınak ve yiyecek bulmak sana kolaydır.'], skills: ['Animal Handling', 'Survival'] },
                                'Guild Artisan': { desc_tr: 'Bir lonca üyesi ve zanaatkâr. Üretim, ticaret ve zanaat becerilerine sahip.', features_tr: ['Guild Membership: Bir loncaya üyesin; tıbbi, hukuki ve finansal yardım talep edebilirsin.'], skills: ['Insight', 'Persuasion'] },
                                'Hermit': { desc_tr: 'Uzun süre yalnız yaşayarak meditasyon ve keşifler yapan biri.', features_tr: ['Discovery: Olağanüstü bir gerçeği ya da sırrı keşfettin — DM bunu belirler.'], skills: ['Medicine', 'Religion'] },
                                'Noble': { desc_tr: 'Soylular sınıfından gelen, siyaset ve saray yaşantısına aşina biri.', features_tr: ['Position of Privilege: Yüksek toplumda kabul görürsün; soylular ve yöneticiler seni ciddiye alır.'], skills: ['History', 'Persuasion'] },
                                'Outlander': { desc_tr: 'Uygarlığın uzağında doğada büyümüş, araziyi ve vahşi yaşamı iyi bilen biri.', features_tr: ['Wanderer: İyi bir coğrafi hafızan var; günde 6 kişiyi doyuracak yiyecek ve su bulabilirsin.'], skills: ['Athletics', 'Survival'] },
                                'Sage': { desc_tr: 'Uzun yıllar kitaplık ve akademide geçirmiş, bilgiye aç bir araştırmacı.', features_tr: ['Researcher: Bir bilgiyi hatırlamazsan genellikle nereden bulacağını bilirsin.'], skills: ['Arcana', 'History'] },
                                'Sailor': { desc_tr: 'Denizlerde yıllar geçirmiş, gemicilik ve deniz hayatına aşina biri.', features_tr: ['Ship Passage: Ücretsiz gemi yolculuğu ve liman yardımı talep edebilirsin.'], skills: ['Athletics', 'Perception'] },
                                'Soldier': { desc_tr: 'Bir ordu ya da paralı asker grubunda hizmet etmiş, savaş deneyimli biri.', features_tr: ['Military Rank: Eski meslektaşların ve eski komutanların sana saygıyla davranır.'], skills: ['Athletics', 'Intimidation'] },
                                'Urchin': { desc_tr: 'Sokak çocuğu olarak büyümüş, şehirlerde ayakta kalmayı öğrenmiş biri.', features_tr: ['City Secrets: Şehirlerde gizli yolları bilirsin; normal hızında gezinirken iki kez hızlı hareket edebilirsin.'], skills: ['Sleight of Hand', 'Stealth'] },
                                'Haunted One': { desc_tr: 'Kötü bir deneyim ya da lanetten etkilenmiş, karanlıkla yüzleşmek zorunda kalan biri.', features_tr: ['Heart of Darkness: Sıradan insanlar sende bir tuhaflık hisseder ama yardım etmek ister; korkuttuğun bilgeler bile sakındıkları şeyleri aktarır.'], skills: ['Arcana', 'Investigation'] },
                                'Far Traveler': { desc_tr: 'Uzak diyarlardan gelen, farklı kültür ve geleneklerle donanmış biri.', features_tr: ['All Eyes on You: Görünüşün ve kültürün sana ilgi çeker; soylu ve güçlülerle görüşme fırsatı yaratır.'], skills: ['Insight', 'Perception'] },
                                'City Watch': { desc_tr: 'Bir şehrin düzenini ve güvenliğini sağlayan birim üyesi.', features_tr: ['Watcher\'s Eye: Köy ve şehirlerde suç faaliyetleri ve yasadışı örgütler hakkında bilgi toplayabilirsin.'], skills: ['Athletics', 'Insight'] },
                                'Investigator': { desc_tr: 'Gizemli olayları ve suçları çözmek için eğitim almış bir araştırmacı.', features_tr: ['Official Inquiry: Resmi soruşturma yetkisiyle insanlar ve kurumlardan bilgi talep edebilirsin.'], skills: ['Insight', 'Investigation'] },
                            };
                            const bgData = BG_DESCRIPTIONS[character.background];
                            return (
                                <div className="bg-gray-800 rounded-xl border border-amber-800/50 overflow-hidden">
                                    <div className="px-4 py-3 bg-amber-900/20 border-b border-amber-800/50 flex items-center gap-2">
                                        <span className="text-amber-400 text-lg">📖</span>
                                        <h3 className="font-black text-amber-300">Background: {character.background}</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {bgData ? (
                                            <>
                                                <p className="text-gray-300 text-sm leading-relaxed">{bgData.desc_tr}</p>
                                                <div>
                                                    <p className="text-amber-400 text-xs font-black uppercase mb-1">Skill Proficiencies</p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {bgData.skills.map(s => <span key={s} className="px-2 py-0.5 bg-amber-900/30 border border-amber-700 text-amber-300 text-xs font-bold rounded">{s}</span>)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-amber-400 text-xs font-black uppercase mb-1">Feature</p>
                                                    {bgData.features_tr.map((f, i) => <p key={i} className="text-gray-400 text-xs leading-relaxed">{f}</p>)}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">Bu arkaplan için açıklama henüz eklenmedi.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Languages */}
                        {character?.languages?.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-black text-white mb-3 flex items-center gap-2">
                                    <span>🗣️</span> Bildiğim Diller
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {character.languages.map((lang: string) => (
                                        <span key={lang} className="px-3 py-1 bg-blue-900/30 text-blue-300 border border-blue-800 rounded-full text-xs font-bold font-mono">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Backstory */}
                        <div>
                            <h2 className="text-xl font-black text-white mb-2">📜 Backstory</h2>
                            <p className="text-gray-500 text-sm mb-4 italic">Bu notları yalnızca sen ve DM görebilir.</p>
                            <textarea value={backstory} onChange={e => setBackstory(e.target.value)}
                                placeholder="Karakterinin nereden geldiğini, korkularını, hedeflerini ve sırlarını buraya yaz..."
                                className="w-full h-64 p-4 bg-gray-800 border border-gray-600 rounded-xl text-gray-200 resize-y focus:outline-none focus:border-red-500 text-sm leading-relaxed" />
                            <div className="flex justify-end mt-3">
                                <button onClick={saveBackstory} disabled={isSavingStory || backstory === character?.backstory}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-sm">
                                    {isSavingStory ? 'Kaydediliyor…' : '✍️ Hikayeyi Kaydet'}
                                </button>
                            </div>
                        </div>

                        {/* Personal Notes */}
                        <div className="border-t border-gray-700 pt-6">
                            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                                <span>📓</span> Kişisel Not Defterim
                            </h2>
                            <p className="text-gray-500 text-sm mb-4 italic">Buraya aldığın notları SADECE SEN görebilirsin. DM bile göremez!</p>
                            <textarea value={privateNotes} onChange={e => setPrivateNotes(e.target.value)}
                                placeholder="Seans notları, önemli NPC isimleri veya gizli planların..."
                                className="w-full h-80 p-4 bg-gray-900 border border-gray-700 rounded-xl text-blue-100 resize-y focus:outline-none focus:border-blue-500 text-sm leading-relaxed shadow-inner" />
                            <div className="flex justify-end mt-3">
                                <button onClick={savePrivateNotes} disabled={isSavingPrivateNotes || privateNotes === character?.privateNotes}
                                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg transition text-sm shadow-lg shadow-blue-900/20">
                                    {isSavingPrivateNotes ? 'Mühürleniyor…' : '🔐 Notları Kaydet'}
                                </button>
                            </div>
                        </div>

                        {/* DM Notes (Only visible to DM if viewing this sheet) */}
                        {dmLevelPermission && character.dmNotes && (
                            <div className="border-t border-red-900/30 pt-6 bg-red-900/10 p-4 rounded-xl border border-red-900/20">
                                <h2 className="text-xl font-black text-red-400 mb-2 flex items-center gap-2">
                                    <span>👁️</span> DM Gizli Notları
                                </h2>
                                <p className="text-red-300 text-sm opacity-80 leading-relaxed whitespace-pre-wrap italic">
                                    {character.dmNotes}
                                </p>
                                <p className="text-[10px] text-red-900 font-black mt-4 uppercase tracking-tighter">Sadece DM Yetkisiyle Görüntüleniyor</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════ TAB: PARTY ══════════ */}
                {activeTab === "party" && (
                    <div className="pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl col-span-full mb-2">
                            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                                <span className="text-yellow-500">🛡️</span> Kampanya Katılımcıları
                            </h2>
                            <p className="text-gray-400 text-sm">Odadaki diğer oyuncularla gizli mesajlaşabilir veya durumlarını görebilirsin.</p>
                        </div>

                        {/* DM Card */}
                        <div className="bg-gray-900/60 rounded-2xl border-2 border-purple-900/50 p-5 flex flex-col gap-4 hover:border-purple-500/50 transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-purple-400 text-xl">Dungeon Master</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Oyun Kurucusu</p>
                                </div>
                                <span className="bg-purple-900 text-purple-100 text-[10px] font-black px-2 py-1 rounded uppercase">DM</span>
                            </div>
                            <button onClick={() => { setWhisperTarget("DM"); setIsWhisperModalOpen(true); }} className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-purple-900/20">
                                🤫 DM'e Fısılda
                            </button>
                        </div>

                        {/* Other Players */}
                        {partyStats && Object.entries(partyStats).map(([name, stats]: any) => {
                            if (!stats || name === character?.name) return null;
                            return (
                                <div key={name} className="bg-gray-800 rounded-2xl border border-gray-700 p-5 flex flex-col gap-4 hover:border-gray-500 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="overflow-hidden mr-2">
                                            <h3 className="font-black text-white text-xl truncate" title={name}>{name}</h3>
                                            {stats.subclass ? (
                                                <p className="text-xs text-yellow-500 font-bold truncate">{stats.subclass}</p>
                                            ) : (
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Maceracı</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black text-gray-400">SVY {stats.level || 1}</span>
                                            <div className="flex gap-1 mt-1">
                                                {stats.conditions && stats.conditions.map((c: string) => (
                                                    <span key={c} className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" title={c}></span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            <span>Can (HP)</span>
                                            <span>{stats.currentHp || 0} / {stats.maxHp || 10}</span>
                                        </div>
                                        <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-700/50">
                                            <div className={`h-full transition-all duration-500 ${((stats.currentHp || 0) / (stats.maxHp || 1)) > 0.5 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.max(0, Math.min(100, ((stats.currentHp || 0) / (stats.maxHp || 1)) * 100))}%` }}></div>
                                        </div>
                                    </div>

                                    <button onClick={() => { setWhisperTarget(name); setIsWhisperModalOpen(true); }} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold rounded-xl transition text-sm">
                                        🤫 Fısılda
                                    </button>
                                </div>
                            );
                        })}

                        {(!partyStats || Object.keys(partyStats).filter(name => name !== character?.name).length === 0) && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                                <p className="text-gray-500 font-bold italic">Odadaki diğer oyuncular bekleniyor...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── GALLERY MODAL ── */}
            {/* ── GALLERY MODAL ── */}
            {
                isGalleryOpen && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-md" onClick={() => setIsGalleryOpen(false)}>
                        <div className="bg-gray-900/90 border border-gray-700/50 rounded-3xl p-6 md:p-8 max-w-6xl w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-scale-in" onClick={e => e.stopPropagation()}>
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                                        <span className="text-4xl">🖼️</span> DM Galerisi
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Paylaşılan görseller ve kaynaklar</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={gallerySearch}
                                            onChange={e => setGallerySearch(e.target.value)}
                                            placeholder="Ara..."
                                            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white w-48 md:w-64 focus:outline-none focus:border-purple-500 transition-all pl-10"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                                    </div>
                                    <button onClick={() => setIsGalleryOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all text-xl">✕</button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex gap-2 mb-6 bg-gray-800/50 p-1.5 rounded-2xl w-fit border border-gray-700/30">
                                {[
                                    { id: 'all', label: 'Hepsi', icon: '🌈' },
                                    { id: 'image', label: 'Görseller', icon: '🖼️' },
                                    { id: 'link', label: 'Bağlantılar', icon: '🔗' }
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setGalleryFilter(cat.id as any)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${galleryFilter === cat.id ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        <span>{cat.icon}</span> {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {(() => {
                                    const filtered = (gallery || []).filter(m => {
                                        if (!m) return false;
                                        const matchesSearch = (m.name || "").toLowerCase().includes((gallerySearch || "").toLowerCase());
                                        const matchesFilter = galleryFilter === 'all' || m.type === galleryFilter;
                                        return matchesSearch && matchesFilter;
                                    });

                                    if (filtered.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                                <span className="text-6xl mb-4">🕵️‍♂️</span>
                                                <p className="text-gray-400 font-bold">Herhangi bir şey bulunamadı.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {filtered.map((m: any) => (
                                                <div key={m._id} className="group bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:bg-gray-800/60 transition-all duration-300 flex flex-col hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                                                    <div className="aspect-video bg-gray-950 flex items-center justify-center relative overflow-hidden">
                                                        {m.type === 'image' ? (
                                                            <>
                                                                <img
                                                                    src={m.url.startsWith('/uploads/') ? `${API_URL}${m.url}` : m.url}
                                                                    alt={m.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                                                                    onClick={() => setSelectedImage(m.url.startsWith('/uploads/') ? `${API_URL}${m.url}` : m.url)}
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black text-white border border-white/20">BÜYÜT</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-3">
                                                                <span className="text-4xl opacity-50">🔗</span>
                                                                <a href={m.url} target="_blank" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all">Bağlantıyı Aç</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 bg-gray-900/40 backdrop-blur-sm border-t border-gray-700/30 flex-1">
                                                        <h4 className="text-gray-200 font-bold text-sm truncate mb-1">{m.name}</h4>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.type === 'image' ? 'Görsel' : 'Kaynak'}</span>
                                                            <span className="text-[10px] text-gray-600">{new Date(m.createdAt || Date.now()).toLocaleDateString('tr-TR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── IMAGE VIEWER ── */}
            {
                selectedImage && (
                    <div
                        className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 cursor-default animate-fade-in"
                        onWheel={(e) => {
                            const delta = e.deltaY > 0 ? -0.1 : 0.1;
                            setImgZoom(prev => Math.min(Math.max(0.5, prev + delta), 5));
                        }}
                        onMouseDown={(e) => {
                            if (imgZoom > 1) {
                                setIsImgPanning(true);
                                setImgPanStart({ x: e.clientX - imgOffset.x, y: e.clientY - imgOffset.y });
                            }
                        }}
                        onMouseMove={(e) => {
                            if (isImgPanning) {
                                setImgOffset({ x: e.clientX - imgPanStart.x, y: e.clientY - imgPanStart.y });
                            }
                        }}
                        onMouseUp={() => setIsImgPanning(false)}
                        onMouseLeave={() => setIsImgPanning(false)}
                    >
                        <div className="absolute top-6 right-6 flex gap-3 z-10">
                            <div className="bg-gray-800/80 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-4 border border-white/10 text-white font-black text-xs">
                                <button onClick={() => setImgZoom(prev => Math.max(0.5, prev - 0.2))} className="hover:text-purple-400">➖</button>
                                <span className="w-12 text-center">% {Math.round(imgZoom * 100)}</span>
                                <button onClick={() => setImgZoom(prev => Math.min(5, prev + 0.2))} className="hover:text-purple-400">➕</button>
                                <div className="w-px h-4 bg-gray-600 mx-1"></div>
                                <button onClick={() => { setImgZoom(1); setImgOffset({ x: 0, y: 0 }); }} className="hover:text-purple-400">SIFIRLA</button>
                            </div>
                            <button onClick={() => { setSelectedImage(null); setImgZoom(1); setImgOffset({ x: 0, y: 0 }); }} className="bg-red-600 hover:bg-red-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all text-2xl font-black">✕</button>
                        </div>

                        <div
                            className={`transition-transform duration-75 ease-out ${imgZoom > 1 ? 'cursor-grab' : ''} ${isImgPanning ? 'cursor-grabbing' : ''}`}
                            style={{
                                transform: `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${imgZoom})`,
                            }}
                        >
                            <img
                                src={selectedImage}
                                alt=""
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl pointer-events-none select-none"
                            />
                        </div>

                        {imgZoom <= 1 && (
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full text-white/60 text-xs font-bold pointer-events-none border border-white/10">
                                🖱️ Yakınlaştırmak için tekerleği kullanın
                            </div>
                        )}
                    </div>
                )
            }

            {/* ── TOAST ── */}
            {
                toast && (
                    <div className="fixed bottom-8 right-8 z-[70] max-w-sm animate-fade-in">
                        <div className={`border-2 rounded-xl p-4 shadow-2xl ${toast.color}`}>
                            <div className="flex justify-between items-start gap-3 mb-1">
                                <h3 className="font-black text-sm">{toast.title}</h3>
                                <button onClick={() => setToast(null)} className="text-lg opacity-70 hover:opacity-100 leading-none">✕</button>
                            </div>
                            <p className="text-sm opacity-90">{toast.msg}</p>
                        </div>
                    </div>
                )
            }

            {/* ── HIT DICE / SHORT REST MODAL ── */}
            {
                showHitDiceModal && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowHitDiceModal(false)}>
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-black text-white">⏳ Short Rest</h2>
                                <button onClick={() => setShowHitDiceModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Kısa bir mola verdiniz. Yetenekleriniz yenilendi. Ayrıca iyileşmek için Can Zarı (Hit Dice) harcayabilirsiniz.
                            </p>

                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-5 flex flex-col items-center">
                                <span className="text-gray-400 text-xs font-bold uppercase mb-2">Harcanacak Zar Sayısı</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setHitDiceToSpend(Math.max(0, hitDiceToSpend - 1))} className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 font-black text-xl text-white flex items-center justify-center">-</button>
                                    <div className="text-3xl font-black text-green-400">{hitDiceToSpend} <span className="text-sm text-gray-400 font-normal">/ {level - hitDiceUsed} Kaldı</span></div>
                                    <button onClick={() => setHitDiceToSpend(Math.min(level - hitDiceUsed, hitDiceToSpend + 1))} className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 font-black text-xl text-white flex items-center justify-center">+</button>
                                </div>
                                <p className="text-gray-500 text-xs mt-3">Her zar başına <span className="font-bold text-gray-300">1{character.classRef?.hit_die || 'd8'} + {mod(character.stats?.CON ?? 10)}</span> HP kazanırsınız.</p>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={confirmShortRest} className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg border border-green-500 shadow-sm transition">
                                    Dinlenmeyi Tamamla
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── LEVEL UP MODAL ── */}
            {
                lvModal?.open && (
                    <div className="fixed inset-0 bg-black/85 z-[80] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm" onClick={() => setLvModal(null)}>
                        <div className="bg-gray-900 border border-yellow-700/60 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black text-yellow-400">
                                        🎉 Seviye {lvModal.newLv}!
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        {lvModal.step === "preview" && "Kazanımlarını incele"}
                                        {lvModal.step === "subclass" && "Alt sınıfını seç"}
                                        {lvModal.step === "asi" && "Yetenek Puanı Artışı veya Feat"}
                                    </p>
                                </div>
                                {/* Step indicator */}
                                <div className="flex gap-2">
                                    {(["preview", ...(lvModal.needSubclass ? ["subclass"] : []), ...(lvModal.needASI ? ["asi"] : [])] as string[]).map((s, i) => (
                                        <div key={s} className={`w-2.5 h-2.5 rounded-full ${lvModal.step === s ? 'bg-yellow-400' : 'bg-gray-600'}`} />
                                    ))}
                                </div>
                            </div>

                            {/* ─── STEP 1: PREVIEW ─── */}
                            {lvModal.step === "preview" && (
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {/* HP */}
                                    <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 flex items-center gap-4">
                                        <span className="text-4xl">❤️</span>
                                        <div>
                                            <p className="font-black text-green-400 text-lg">+{lvModal.hpGained} Maksimum HP</p>
                                            <p className="text-gray-400 text-sm">{character.maxHp} → {character.maxHp + lvModal.hpGained}</p>
                                        </div>
                                    </div>

                                    {/* Proficiency Bonus */}
                                    <div className="bg-orange-900/20 border border-orange-700/40 rounded-xl p-4 flex items-center gap-4">
                                        <span className="text-4xl">✦</span>
                                        <div>
                                            <p className="font-black text-orange-400 text-lg">Yeterlilik Bonusu: +{profBonus(lvModal.newLv)}</p>
                                            <p className="text-gray-400 text-sm">Seviye {lvModal.newLv} yeterlilik bonusu</p>
                                        </div>
                                    </div>

                                    {/* ASI Notice */}
                                    {lvModal.needASI && (
                                        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 flex items-center gap-4">
                                            <span className="text-4xl">⬆️</span>
                                            <div>
                                                <p className="font-black text-blue-400 text-lg">Yetenek Puanı Artışı</p>
                                                <p className="text-gray-400 text-sm">Bu seviyede bir yeteneği artırabilir ya da Feat seçebilirsin.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Subclass Notice */}
                                    {lvModal.needSubclass && (
                                        <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 flex items-center gap-4">
                                            <span className="text-4xl">✨</span>
                                            <div>
                                                <p className="font-black text-purple-400 text-lg">Alt Sınıf Seçimi</p>
                                                <p className="text-gray-400 text-sm">{character.classRef?.name} sınıfın için bir uzmanlaşma yolu seçmelisin.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Class Features */}
                                    {lvModal.classFeats.length > 0 && (
                                        <div>
                                            <h3 className="font-black text-white text-sm uppercase tracking-wide mb-2">⚔️ Sınıf Özellikleri</h3>
                                            <div className="space-y-2">
                                                {lvModal.classFeats.map((f, i) => (
                                                    <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                                        <p className="font-black text-red-400 mb-1">{f.name}</p>
                                                        <p className="text-gray-300 text-sm leading-relaxed">{f.desc_tr}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Subclass Features */}
                                    {lvModal.subFeats.length > 0 && (
                                        <div>
                                            <h3 className="font-black text-white text-sm uppercase tracking-wide mb-2">✨ Alt Sınıf Özellikleri — {character.subclass}</h3>
                                            <div className="space-y-2">
                                                {lvModal.subFeats.map((f, i) => (
                                                    <div key={i} className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-4">
                                                        <p className="font-black text-purple-400 mb-1">{f.name}</p>
                                                        <p className="text-gray-300 text-sm leading-relaxed">{f.desc_tr}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {lvModal.classFeats.length === 0 && lvModal.subFeats.length === 0 && !lvModal.needASI && !lvModal.needSubclass && (
                                        <p className="text-gray-500 italic text-center py-6">Bu seviyede özel bir özellik yok — ama daha güçlüsün!</p>
                                    )}
                                </div>
                            )}

                            {/* ─── STEP 2: SUBCLASS ─── */}
                            {lvModal.step === "subclass" && character?.classRef?.subclasses && (
                                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                    {character.classRef.subclasses.map((sub: any, idx: number) => (
                                        <div key={idx} onClick={() => setLvSubclassChoice(sub)}
                                            className={`cursor-pointer p-5 rounded-xl border-2 transition hover:-translate-y-0.5 ${lvSubclassChoice?.name === sub.name ? 'border-purple-500 bg-purple-900/30' : 'border-gray-700 hover:border-purple-500/50 bg-gray-800'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-black text-purple-300">{sub.name}</h3>
                                                {lvSubclassChoice?.name === sub.name && <span className="text-purple-400 font-black">✓ Seçildi</span>}
                                            </div>
                                            <p className="text-gray-400 text-xs mb-3">{sub.description_tr}</p>
                                            <div className="space-y-1.5">
                                                {sub.features.slice(0, 3).map((f: any, fi: number) => (
                                                    <div key={fi} className="text-xs p-2 bg-gray-900 rounded border border-gray-700 flex gap-2">
                                                        <span className="text-yellow-400 font-bold shrink-0">{f.name} (Sv.{f.level}):</span>
                                                        <span className="text-gray-400">{f.desc_tr}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ─── STEP 3: ASI / FEAT ─── */}
                            {lvModal.step === "asi" && (
                                <div className="flex-1 overflow-y-auto p-6">
                                    {/* Toggle */}
                                    <div className="flex gap-2 mb-6">
                                        <button onClick={() => { setLvChoice("asi"); setFeatPick(null); }}
                                            className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition ${lvChoice === "asi" ? 'bg-blue-700 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                                            ⬆️ Yetenek Puanı Artışı
                                        </button>
                                        <button onClick={() => { setLvChoice("feat"); setAsiPicks([]); }}
                                            className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition ${lvChoice === "feat" ? 'bg-purple-700 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                                            🎯 Feat Seç
                                        </button>
                                    </div>

                                    {/* ASI Panel */}
                                    {lvChoice === "asi" && (() => {
                                        const used = asiPicks.reduce((s, p) => s + p.amount, 0);
                                        const addASI = (stat: string) => {
                                            if (used >= 2) return;
                                            const existing = asiPicks.find(p => p.stat === stat);
                                            if (existing) {
                                                if (existing.amount >= 2 || used >= 2) return;
                                                setAsiPicks(prev => prev.map(p => p.stat === stat ? { ...p, amount: p.amount + 1 } : p));
                                            } else {
                                                setAsiPicks(prev => [...prev, { stat, amount: 1 }]);
                                            }
                                        };
                                        const removeASI = (stat: string) => {
                                            setAsiPicks(prev => prev.map(p => p.stat === stat ? { ...p, amount: p.amount - 1 } : p).filter(p => p.amount > 0));
                                        };
                                        return (
                                            <div>
                                                <p className="text-gray-400 text-sm mb-4">Toplam 2 puan dağıt — bir istatistiğe +2 veya iki istatistiğe +1+1. Max 20.</p>
                                                <div className="mb-3 flex items-center gap-2">
                                                    <span className="text-blue-400 font-black">Kalan puan:</span>
                                                    <span className="text-white font-black text-xl">{2 - used}</span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {Object.entries(character.stats || {}).map(([s, v]: any) => {
                                                        const pick = asiPicks.find(p => p.stat === s);
                                                        const newVal = v + (pick?.amount ?? 0);
                                                        return (
                                                            <div key={s} className={`p-4 rounded-xl border-2 text-center ${pick ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'}`}>
                                                                <div className="font-black text-gray-400 text-xs mb-1">{s}</div>
                                                                <div className="text-3xl font-black text-white">{v}{pick && <span className="text-blue-400 text-xl"> → {newVal}</span>}</div>
                                                                <div className="text-xs text-gray-500 mb-2">{mod(v) >= 0 ? '+' : ''}{mod(v)}</div>
                                                                <div className="flex gap-1.5 justify-center">
                                                                    <button onClick={() => removeASI(s)} disabled={!pick || newVal <= v}
                                                                        className="w-7 h-7 bg-red-800 hover:bg-red-700 disabled:opacity-30 rounded font-black text-sm transition">-</button>
                                                                    <button onClick={() => addASI(s)} disabled={used >= 2 || newVal >= 20}
                                                                        className="w-7 h-7 bg-blue-700 hover:bg-blue-600 disabled:opacity-30 rounded font-black text-sm transition">+</button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Feat Panel */}
                                    {lvChoice === "feat" && (
                                        <div>
                                            <input
                                                type="text" value={featSearch} onChange={e => setFeatSearch(e.target.value)}
                                                placeholder="Feat ara… (Türkçe veya İngilizce)"
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white text-sm mb-4 focus:outline-none focus:border-purple-500"
                                            />
                                            {featPick && (
                                                <div className="mb-4 p-4 bg-purple-900/30 border-2 border-purple-500 rounded-xl">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="font-black text-purple-300">{featPick.name_tr} ({featPick.name})</p>
                                                        <span className="text-purple-400 font-black">✓ Seçildi</span>
                                                    </div>
                                                    <p className="text-gray-300 text-xs">{featPick.desc_tr}</p>
                                                </div>
                                            )}
                                            {featPick && (() => {
                                                const reqs = getFeatRequirements(featPick.name, libFeats);
                                                if (!reqs) return null;
                                                return (
                                                    <div className="mt-4 border-t border-purple-800/30 pt-4 space-y-4 bg-gray-900/50 p-4 rounded-xl">
                                                        {reqs.statChoices && (
                                                            <FeatStatSelectionArea
                                                                featName={featPick.name}
                                                                requirements={reqs}
                                                                selection={featStatSelections[featPick.name]}
                                                                onUpdate={(val: string) => setFeatStatSelections(prev => ({ ...prev, [featPick!.name]: val }))}
                                                            />
                                                        )}
                                                        {reqs.slots && (
                                                            <FeatSpellSelectionArea
                                                                featName={featPick.name}
                                                                requirements={reqs}
                                                                selections={featSpellSelections[featPick.name] || []}
                                                                token={token}
                                                                onUpdate={(newSels: any[]) => setFeatSpellSelections(prev => ({ ...prev, [featPick!.name]: newSels }))}
                                                            />
                                                        )}
                                                        {reqs.choices && reqs.choices.map((choice: any, ci: number) => (
                                                            <FeatChoiceSelectionArea
                                                                key={ci}
                                                                featName={featPick!.name}
                                                                choice={choice}
                                                                selections={featChoiceSelections[featPick!.name]?.[choice.label] || []}
                                                                onUpdate={(val: string[]) => setFeatChoiceSelections(prev => ({
                                                                    ...prev,
                                                                    [featPick!.name]: {
                                                                        ...(prev[featPick!.name] || {}),
                                                                        [choice.label]: val
                                                                    }
                                                                }))}
                                                            />
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 mt-4">
                                                {(ALL_FEATS as any[]).filter((f, i, arr) => arr.findIndex(x => x.name === f.name) === i)
                                                    .filter(f => !featSearch || f.name.toLowerCase().includes(featSearch.toLowerCase()) || f.name_tr?.toLowerCase().includes(featSearch.toLowerCase()))
                                                    .map((f) => (
                                                        <div key={f.name} onClick={() => { setFeatPick(f); setFeatStatSelections({}); setFeatSpellSelections({}); }}
                                                            className={`cursor-pointer p-3 rounded-xl border transition hover:border-purple-500/60 ${featPick?.name === f.name ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800'}`}>
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <span className="font-black text-sm text-white">{f.name_tr}</span>
                                                                <span className="text-gray-500 text-xs">{f.name}</span>
                                                            </div>
                                                            {f.prerequisite ? <p className="text-orange-400 text-xs mb-0.5">⚠️ Önkoşul: {f.prerequisite}</p> : f.prereq ? <p className="text-orange-400 text-xs mb-0.5">⚠️ Önkoşul: {f.prereq}</p> : null}
                                                            <p className="text-gray-400 text-xs">{f.desc_tr}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-700 flex justify-between shrink-0">
                                <button onClick={() => setLvModal(null)}
                                    className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold rounded-xl transition text-sm">
                                    İptal
                                </button>
                                <button
                                    onClick={advanceLvModal}
                                    disabled={!canAdvance() || isLevelingUp}
                                    className="px-8 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-yellow-950 font-black rounded-xl transition text-sm">
                                    {isLevelingUp ? 'İşleniyor…' : (
                                        lvModal.step === "preview" && (lvModal.needSubclass || lvModal.needASI) ? 'Devam Et →' :
                                            lvModal.step === "subclass" && lvModal.needASI ? 'Devam: ASI/Feat →' :
                                                'Seviye Atla! 🎉'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ══ DM PERMISSION POPUP ══ */}
            {
                showDmPopup && (
                    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDmPopup(false)}>
                        <div className="bg-gray-900 border-4 border-red-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.5)] transform scale-100 transition-transform" onClick={e => e.stopPropagation()}>
                            <div className="text-6xl mb-4">🛑</div>
                            <h2 className="text-3xl font-black text-red-500 mb-2 uppercase">Hey, Dur Orada!</h2>
                            <p className="text-gray-300 font-bold mb-4">Seviye değiştirmek için DM'nin izni (veya merhameti) gerekiyor.</p>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 mb-6 italic text-sm text-gray-400">
                                "Güç kendi kendine gelmez, saygıdeğer Dungeon Master 'Ver' tuşuna basana kadar sadece bir hayaldir."
                            </div>
                            <button onClick={() => setShowDmPopup(false)} className="w-full px-4 py-3 bg-red-700 hover:bg-red-600 font-black text-white rounded-xl transition shadow-lg">
                                Af Dile ve Kapat
                            </button>
                        </div>
                    </div>
                )
            }

            {/* ══ DYNAMIC SHOP MODAL ══ */}
            {
                shopData.isOpen && (
                    <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShopData({ ...shopData, isOpen: false })}>
                        <div className="bg-gray-900 border-4 border-orange-900/50 rounded-2xl w-full max-w-lg p-6 flex flex-col shadow-[0_0_40px_rgba(234,88,12,0.3)] relative" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6 border-b border-orange-900/40 pb-4">
                                <h2 className="text-2xl font-black text-orange-400 flex items-center gap-2">
                                    <span className="text-3xl">🏬</span> Gezgin Tüccar
                                </h2>
                                <button onClick={() => setShopData({ ...shopData, isOpen: false })} className="text-gray-400 hover:text-white bg-gray-800 w-8 h-8 rounded-full flex justify-center items-center font-bold">✕</button>
                            </div>

                            <div className="flex justify-between text-sm bg-gray-800 p-3 rounded-xl border border-gray-700 mb-4 items-center gap-4">
                                <span className="text-gray-400 font-bold">Mevcut Bakiye:</span>
                                <span className="text-yellow-400 font-black text-xl bg-yellow-900/30 px-3 py-1 rounded shadow-inner border border-yellow-700/50">{character?.money?.gp || 0} GP</span>
                            </div>

                            <div className="overflow-y-auto max-h-[400px] flex-1 pr-2 space-y-3">
                                {shopData.items.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8 italic font-bold">Tüccarın tezgahı şu an boş.</p>
                                ) : (
                                    shopData.items.map(item => (
                                        <div key={item.id} className="bg-gray-800/80 border border-gray-700 p-4 rounded-xl flex items-center justify-between hover:bg-gray-750 transition-colors group">
                                            <div className="flex-1 pr-4">
                                                <div className="font-bold text-gray-100 text-lg">{item.name}</div>
                                                {item.note && <div className="text-gray-400 text-xs mt-1 italic">{item.note}</div>}
                                            </div>
                                            <button
                                                onClick={() => buyShopItem(item)}
                                                className="bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-black px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 shadow-md group-hover:shadow-[0_0_15px_rgba(234,88,12,0.4)] whitespace-nowrap"
                                            >
                                                <span className="text-sm">Satın Al</span>
                                                <span className="bg-orange-900/50 px-2 py-0.5 rounded text-yellow-300 text-xs border border-orange-500/30">{item.price} GP</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ══ LONG REST MODAL (Subclass/Class Features) ══ */}
            {
                showLongRestModal && (
                    <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowLongRestModal(false)}>
                        <div className="bg-gray-900 border-4 border-indigo-900/50 rounded-2xl w-full max-w-md p-6 flex flex-col shadow-[0_0_40px_rgba(79,70,229,0.3)] relative" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6 border-b border-indigo-900/40 pb-4">
                                <h2 className="text-2xl font-black text-indigo-400 flex items-center gap-2">
                                    <span className="text-3xl">🌙</span> Uzun Dinlenme
                                </h2>
                                <button onClick={() => setShowLongRestModal(false)} className="text-gray-400 hover:text-white bg-gray-800 w-8 h-8 rounded-full flex justify-center items-center font-bold">✕</button>
                            </div>

                            <p className="text-gray-300 text-sm mb-4 leading-relaxed mt-2">
                                Büyücüler (Seviye 3+), bildikleri bir Cantrip (Başlangıç Büyüsü) yerine Wizard büyü listesinden başka bir Cantrip seçebilirler. İstemiyorsan boş bırakabilirsin.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Unutulacak Cantrip</label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                        value={cantripToReplace}
                                        onChange={e => setCantripToReplace(e.target.value)}
                                    >
                                        <option value="">-- Değiştirmek İstemiyorum --</option>
                                        {(character?.spells || []).map((sName: string) => {
                                            const details = spellDetails[sName];
                                            return details && details.level === "Cantrip" ? <option key={sName} value={sName}>{sName}</option> : null;
                                        })}
                                    </select>
                                </div>

                                {cantripToReplace && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Yeni Cantrip</label>
                                        <select
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                            value={newWizardCantrip}
                                            onChange={e => setNewWizardCantrip(e.target.value)}
                                        >
                                            <option value="">-- Seçiniz --</option>
                                            {wizardCantripOptions.filter(sp => !(character?.spells || []).includes(sp.name)).map(sp => (
                                                <option key={sp.name} value={sp.name}>{sp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={applyLongRest}
                                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black px-4 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 w-full"
                            >
                                Dinlenmeyi Tamamla
                            </button>
                        </div>
                    </div>
                )
            }

            {/* ── WHISPER MODAL ── */}
            {
                isWhisperModalOpen && (
                    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsWhisperModalOpen(false)}>
                        <div className="bg-gray-900 border-2 border-purple-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                            <h2 className="text-2xl font-black text-purple-400 mb-4 flex items-center gap-2">
                                <span>🤫</span> {whisperTarget === 'DM' ? "DM'e Fısılda" : `${whisperTarget}'e Fısılda`}
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">Bu mesajı sadece {whisperTarget === 'DM' ? "Dungeon Master" : whisperTarget} görebilecek.</p>

                            {/* Whisper History Log */}
                            <div className="flex-1 overflow-y-auto mb-4 bg-gray-950/50 rounded-xl p-3 border border-gray-800 space-y-2 max-h-64 custom-scrollbar">
                                {whisperHistory && whisperHistory.length > 0 ? (
                                    whisperHistory.filter((w: any) =>
                                        (w.senderName === character?.name && w.targetName === whisperTarget) ||
                                        (w.senderName === whisperTarget && w.targetName === character?.name)
                                    ).map((w: any, idx: number) => (
                                        <div key={idx} className={`text-sm p-2 rounded-lg ${w.senderName === character?.name ? 'bg-purple-900/40 ml-6 border border-purple-500/20' : 'bg-gray-800/40 mr-6 border border-gray-700/20'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-black text-[9px] uppercase tracking-wider text-purple-400">
                                                    {w.senderName === character?.name ? 'SEN' : w.senderName}
                                                </span>
                                                <span className="text-[9px] text-gray-500 opacity-50">{w.createdAt ? new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                            </div>
                                            <p className="text-gray-200 text-xs leading-relaxed">{w.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-10">
                                        <span className="text-4xl mb-2">🤫</span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Sessizce fısılda...</p>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <textarea
                                value={whisperMessage}
                                onChange={e => setWhisperMessage(e.target.value)}
                                placeholder="Gizli mesajın..."
                                className="w-full h-24 p-4 bg-gray-950 border border-gray-700 rounded-xl text-purple-100 resize-none focus:outline-none focus:border-purple-500 transition-colors mb-4 text-sm"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setIsWhisperModalOpen(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition">İptal</button>
                                <button onClick={sendWhisper} disabled={!whisperMessage.trim()} className="flex-[2] py-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-black rounded-xl transition shadow-lg shadow-purple-900/30">Mesajı Gönder</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Grid Map Modalı (Player View) */}
            {
                isMapOpen && (
                    <div className="fixed inset-0 bg-black/95 z-[70] flex flex-col p-4 md:p-8 backdrop-blur-md animate-fade-in overflow-hidden shadow-2xl">
                        {/* Map Header */}
                        <div className="flex justify-between items-center mb-6 bg-gray-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xl">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                                    <span className="text-4xl">🗺️</span> Stratejik Harita
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">{mapData.tokens.length} Token aktif • {Math.round(mapZoom * 100)}% Yakınlaştırma</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-800/80 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-4 border border-white/10 text-white font-black text-xs">
                                    <button onClick={() => setMapZoom(prev => Math.max(0.2, prev - 0.1))} className="hover:text-purple-400">➖</button>
                                    <span className="w-12 text-center">% {Math.round(mapZoom * 100)}</span>
                                    <button onClick={() => setMapZoom(prev => Math.min(3, prev + 0.1))} className="hover:text-purple-400">➕</button>
                                    <div className="w-px h-4 bg-gray-600 mx-1"></div>
                                    <button onClick={() => { setMapZoom(1); setMapOffset({ x: 0, y: 0 }); }} className="hover:text-purple-400">SIFIRLA</button>
                                </div>
                                <button onClick={() => setIsMapOpen(false)} className="bg-red-700 hover:bg-red-600 text-white w-12 h-12 rounded-xl font-black flex items-center justify-center shadow-lg transition-all text-2xl">✕</button>
                            </div>
                        </div>

                        <div className="flex-1 flex gap-6 overflow-hidden">
                            {/* Token Legend (Left Sidebar) */}
                            <div className="w-64 bg-gray-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 flex flex-col hidden lg:flex shadow-2xl">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Token Listesi</h3>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {mapData.tokens.map((token: any) => (
                                        <div
                                            key={token.id}
                                            onClick={() => {
                                                setMapZoom(1.5);
                                                // Center on token
                                                const container = document.getElementById('map-viewport');
                                                if (container) {
                                                    const rect = container.getBoundingClientRect();
                                                    setMapOffset({
                                                        x: (rect.width / 2) - (token.x * 1.5),
                                                        y: (rect.height / 2) - (token.y * 1.5)
                                                    });
                                                }
                                            }}
                                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] ${token.entityId === character?._id ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-gray-800/40 border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: token.color || '#ef4444' }}>
                                                {token.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-200 truncate">{token.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">{token.type === 'player' ? 'Oyuncu' : 'Yaratık'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {mapData.tokens.length === 0 && <p className="text-gray-600 text-xs text-center py-10 italic">Henüz token yok.</p>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-xl text-[10px] text-purple-300 leading-tight">
                                        💡 Tokenları sürükleyip taşıyabilir, haritayı kaydırmak için boş bir alandan sürükleyebilirsin.
                                    </div>
                                </div>
                            </div>

                            {/* Map Canvas Area */}
                            <div
                                id="map-viewport"
                                className="flex-1 bg-gray-950 rounded-3xl border border-white/10 relative overflow-hidden shadow-inner cursor-grab active:cursor-grabbing"
                                onWheel={(e) => {
                                    const delta = e.deltaY > 0 ? -0.05 : 0.05;
                                    setMapZoom(prev => Math.min(Math.max(0.2, prev + delta), 3));
                                }}
                                onMouseDown={(e) => {
                                    // Only pan if clicking the background, not a token
                                    const target = e.target as HTMLElement;
                                    if (target.id === 'map-viewport' || target.id === 'grid-overlay' || target.id === 'map-img') {
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
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (!isDraggingToken) return;

                                    // Only allow dragging own player token
                                    if (!isDraggingToken.startsWith('player-')) return;

                                    const rect = e.currentTarget.getBoundingClientRect();
                                    // Inverse transform the drop coordinates
                                    const x = (e.clientX - rect.left - mapOffset.x) / mapZoom;
                                    const y = (e.clientY - rect.top - mapOffset.y) / mapZoom;

                                    socket?.emit('move_token', { campaignId, tokenId: isDraggingToken, x, y });
                                    setIsDraggingToken(null);
                                }}
                            >
                                <div
                                    className="absolute origin-top-left transition-transform duration-75 ease-out"
                                    style={{
                                        transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapZoom})`,
                                    }}
                                >
                                    {/* Map Image */}
                                    {mapData.bgUrl && (
                                        <img
                                            id="map-img"
                                            src={mapData.bgUrl}
                                            alt="Harita"
                                            className="block pointer-events-auto select-none rounded shadow-2xl"
                                            style={{ minWidth: '1000px' }} // Ensure some size if small image
                                        />
                                    )}

                                    {/* Grid Overlay */}
                                    {mapData.showGrid && (
                                        <div
                                            id="grid-overlay"
                                            className="absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing"
                                            style={{
                                                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                                                backgroundSize: `${mapData.gridSize}px ${mapData.gridSize}px`,
                                                width: '100%',
                                                height: '100%'
                                            }}
                                        />
                                    )}

                                    {/* Tokens */}
                                    {mapData.tokens.map((token: any) => (
                                        <div
                                            key={token.id}
                                            draggable={token.type === 'player' && token.entityId === character?._id}
                                            onDragStart={() => setIsDraggingToken(token.id)}
                                            className={`absolute w-12 h-12 rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center text-[10px] font-black select-none group transition-shadow hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] ${token.entityId === character?._id ? 'cursor-move ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900 border-yellow-400' : 'cursor-default border-white/40'}`}
                                            style={{
                                                left: token.x - 24,
                                                top: token.y - 24,
                                                backgroundColor: token.color || '#ef4444',
                                                zIndex: 20
                                            }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-white opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all border border-white/10 shadow-xl pointer-events-none scale-90 group-hover:scale-100">
                                                {token.name} {token.entityId === character?._id ? ' (Sen)' : ''}
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/80"></div>
                                            </div>
                                            <div className="text-white text-center leading-tight uppercase font-black text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                                {token.name.substring(0, 2)}
                                            </div>

                                            {/* Status Indicators Placeholder */}
                                            {token.entityId === character?._id && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!mapData.bgUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 flex-col gap-6 backdrop-blur-sm bg-black/40">
                                        <span className="text-9xl animate-bounce-slow">🔍</span>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-white tracking-widest uppercase">Harita Aranıyor...</p>
                                            <p className="text-gray-400 mt-2">Dungeon Master henüz bir savaş alanı yüklemedi.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
