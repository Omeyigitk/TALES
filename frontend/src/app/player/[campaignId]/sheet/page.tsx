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
import { getSpellSlotTotals, isSpellcaster, getMulticlassSpellSlots, CLASS_ATTACKS, CLASS_RESOURCES, CONCENTRATION_SPELLS } from "../combat_data";

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

const fmt = (n: number) => (n >= 0 ? `+${n}` : String(n));

// Helper to evaluate attack strings like "STR+Prof" or "DEX+Prof"
const evalAtk = (str: string, abilityMods: any, prof: number) => {
    if (!str) return 0;
    if (!isNaN(Number(str))) return Number(str);
    
    // Clean string (uppercase, remove spaces)
    let calc = str.toUpperCase().replace(/\s/g, '');
    
    // Replace ability abbreviations with their values
    const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    abilities.forEach(ab => {
        const modValue = abilityMods[ab] || 0;
        calc = calc.replace(new RegExp(ab, 'g'), (modValue >= 0 ? '+' : '') + modValue);
    });
    
    // Replace PROF
    calc = calc.replace(/PROF/g, (prof >= 0 ? '+' : '') + prof);
    
    // Evaluate the expression safely
    try {
        // Remove any characters that aren't numbers, +, -, *, /, or ( )
        calc = calc.replace(/[^0-9+\-*/()]/g, '');
        // eslint-disable-next-line no-new-func
        return new Function(`return ${calc}`)();
    } catch (e) {
        console.error("EvalAtk error for string:", str, "calc:", calc, e);
        const fallback = parseInt(str);
        return isNaN(fallback) ? 0 : fallback;
    }
};

// Class → saving throw proficiencies (SRD)
const CLASS_SAVES: Record<string, string[]> = {
    Fighter: ["STR", "CON"], Barbarian: ["STR", "CON"], Paladin: ["WIS", "CHA"],
    Ranger: ["STR", "DEX"], Monk: ["STR", "DEX"], Rogue: ["DEX", "INT"],
    Bard: ["DEX", "CHA"], Cleric: ["WIS", "CHA"], Druid: ["INT", "WIS"],
    Sorcerer: ["CON", "CHA"], Warlock: ["WIS", "CHA"], Wizard: ["INT", "WIS"],
    Artificer: ["CON", "INT"],
};

// ─── Spell Categories & Tags ────────────────────────────────────────────────
const SCHOOLS = ["all", "abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];
const SPELL_TYPES = ["all", "Damage", "Control", "Support", "Utility", "Defense"];

const getSpellTags = (spell: any) => {
    const tags: string[] = [];
    const desc = (spell.desc || "").toLowerCase();
    const school = (spell.school || "").toLowerCase();

    // Damage
    if (desc.includes("damage") || desc.includes("hit") || desc.includes("attack") ||
        /\d+d\d+/.test(desc) || school === "evocation") {
        tags.push("Damage");
    }
    // Control
    if (desc.includes("frightened") || desc.includes("charmed") || desc.includes("restrained") ||
        desc.includes("paralyzed") || desc.includes("stunned") || desc.includes("incapacitated") ||
        desc.includes("prone") || desc.includes("blinded") || desc.includes("deafened") ||
        desc.includes("difficult terrain") || desc.includes("slow") ||
        desc.includes("disadvantage")) {
        tags.push("Control");
    }
    // Support
    if (desc.includes("heal") || desc.includes("restore") || desc.includes("temporary hp") ||
        desc.includes("bonus") || desc.includes("advantage") || desc.includes("bless") ||
        desc.includes("check") || desc.includes("saving throw")) {
        tags.push("Support");
    }
    // Defense
    if (desc.includes("ac ") || desc.includes("shield") || desc.includes("resistance") ||
        desc.includes("immune") || desc.includes("absorb") || 
        school === "abjuration") {
        tags.push("Defense");
    }
    // Utility
    if (desc.includes("detect") || desc.includes("identify") || desc.includes("teleport") ||
        desc.includes("create") || desc.includes("scry") || desc.includes("invisible") ||
        desc.includes("fly") || desc.includes("breathe") || 
        school === "divination" || school === "transmutation") {
        tags.push("Utility");
    }

    return tags.length > 0 ? tags : ["Utility"];
};

const PlayerSheet = () => {
    const { campaignId } = useParams();
    const router = useRouter();
    const { user, token, loading: authLoading } = useAuth();

    const [character, setCharacter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const characterRef = useRef<any>(null);
    const [hasMounted, setHasMounted] = useState(false);

    // Socket Connection
    const { 
        socket, partyStats, diceLogs, dmLevelPermission, whisperData, whisperHistory,
        partyGold, fogOfWar, quests, factions, sessionNotes 
    } = useCampaignSocket(campaignId, 'Player', character?.name, token);

    // Toast Notification System
    const [toast, setToast] = useState<{ show: boolean, title: string, message: string, color: string }>({ show: false, title: '', message: '', color: '' });
    const showToast = (title: string, message: string, color: string) => {
        setToast({ show: true, title, message, color });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
    };

    // UI & Tab States
    const [activeTab, setActiveTab] = useState('combat');
    const [isPrivateNotesOpen, setIsPrivateNotesOpen] = useState(false);
    const [isSavingPrivateNotes, setIsSavingPrivateNotes] = useState(false);
    const [privateNotes, setPrivateNotes] = useState("");
    const [whisperTarget, setWhisperTarget] = useState('DM');
    const [whisperMessage, setWhisperMessage] = useState("");
    const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);

    // Modal & Selection States
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
    const [showLongRestModal, setShowLongRestModal] = useState(false);
    const [showLevelChart, setShowLevelChart] = useState(false);
    const [showSpellPicker, setShowSpellPicker] = useState(false);
    const [showAsiFeatModal, setShowAsiFeatModal] = useState(false);
    const [castingSpell, setCastingSpell] = useState<any>(null);
    const [selectedSpell, setSelectedSpell] = useState<any>(null);

    // Data States
    const [gallery, setGallery] = useState<any[]>([]);
    const [shopItems, setShopItems] = useState<any[]>([]);
    const [isShopPublished, setIsShopPublished] = useState(false);
    const [gallerySearch, setGallerySearch] = useState("");
    const [galleryFilter, setGalleryFilter] = useState<number | 'all'>('all');
    const [actualSpells, setActualSpells] = useState<any[]>([]);
    const [libFeats, setLibFeats] = useState<any[]>([]);
    const [allClasses, setAllClasses] = useState<any[]>([]);
    const [asiPicks, setAsiPicks] = useState<any[]>([]);
    const [concentrationSpell, setConcentrationSpell] = useState<string | null>(null);
    const [spellDetails, setSpellDetails] = useState<Record<string, any>>({});

    // Feature States
    const [newResourceName, setNewResourceName] = useState("");
    const [newResourceValue, setNewResourceValue] = useState(1);
    const [spellSlotsUsed, setSpellSlotsUsed] = useState<Record<string, number>>({});
    const [resourcesUsed, setResourcesUsed] = useState<Record<string, number>>({});
    const [cantripToReplace, setCantripToReplace] = useState<string | null>(null);
    const [leveledSpellsToReplace, setLeveledSpellsToReplace] = useState<string[]>([]);
    
    // Gallery/Image Viewer State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imgZoom, setImgZoom] = useState(1);
    const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
    const [isImgPanning, setIsImgPanning] = useState(false);
    const [imgPanStart, setImgPanStart] = useState({ x: 0, y: 0 });

    // Filter States
    const [spellSearchModal, setSpellSearchModal] = useState("");
    const [spellLevelFilter, setSpellLevelFilter] = useState<number | 'all'>('all');
    const [spellSchoolFilter, setSpellSchoolFilter] = useState('all');
    const [spellTypeFilter, setSpellTypeFilter] = useState('all');
    const [spellSearch, setSpellSearch] = useState("");
    const [selectedSkill, setSelectedSkill] = useState<any>(null);
    const [showClassFeatsUI, setShowClassFeatsUI] = useState(true);
    const [saves, setSaves] = useState<string[]>(character?.classRef?.saving_throws || []);

    // Missing Global States
    const [currentHp, setCurrentHp] = useState(character?.currentHp || 0);
    const [hpInput, setHpInput] = useState("");
    const [conditions, setConditions] = useState<string[]>(character?.conditions || []);
    const [hitDiceUsed, setHitDiceUsed] = useState(character?.hitDiceUsed || 0);
    const [deathSaves, setDeathSaves] = useState(character?.deathSaves || { successes: 0, failures: 0 });
    const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
    const [lvModal, setLvModal] = useState<any>(null);
    const [isLevelingUp, setIsLevelingUp] = useState(false);
    const [showLevelChoiceModal, setShowLevelChoiceModal] = useState(false);
    const [showDmPopup, setShowDmPopup] = useState(false);
    const [mcPickedClassId, setMcPickedClassId] = useState<string | null>(null);
    const [showMulticlassPickModal, setShowMulticlassPickModal] = useState(false);
    const [isAddingMulticlass, setIsAddingMulticlass] = useState(false);
    const [lvSubclassChoice, setLvSubclassChoice] = useState<any>(null);
    const [lvChoice, setLvChoice] = useState<'asi' | 'feat'>('asi');
    const [featPick, setFeatPick] = useState<any>(null);
    const [featSearch, setFeatSearch] = useState("");
    const [featStatSelections, setFeatStatSelections] = useState<Record<string, any>>({});
    const [featSpellSelections, setFeatSpellSelections] = useState<Record<string, any[]>>({});
    const [featChoiceSelections, setFeatChoiceSelections] = useState<Record<string, any>>({});
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isSavingStory, setIsSavingStory] = useState(false);
    const [allSpells, setAllSpells] = useState<any[]>([]);
    const [newItemName, setNewItemName] = useState("");
    const [newItemQty, setNewItemQty] = useState(1);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [showCustomResourceModal, setShowCustomResourceModal] = useState(false);
    const [newResourceMax, setNewResourceMax] = useState(1);
    const [newResourceDesc, setNewResourceDesc] = useState("");
    const [newResourceRecharge, setNewResourceRecharge] = useState<'short' | 'long'>('long');

    // Restored UI & Data States
    const [shopData, setShopData] = useState<{ isOpen: boolean, items: any[] }>({ isOpen: false, items: [] });
    const [backstory, setBackstory] = useState("");
    const [newItemNote, setNewItemNote] = useState<string>("");
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [mapData, setMapData] = useState<any>(null);
    const [mapZoom, setMapZoom] = useState(1);
    const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
    const [showHitDiceModal, setShowHitDiceModal] = useState(false);
    const [hitDiceToSpend, setHitDiceToSpend] = useState(1);
    const [newWizardCantrip, setNewWizardCantrip] = useState<string>("");
    const [wizardCantripOptions, setWizardCantripOptions] = useState<any[]>([]);
    const [isDraggingToken, setIsDraggingToken] = useState<string | null>(null);
    const [showFeatsUI, setShowFeatsUI] = useState(true);
    const [expandedFeat, setExpandedFeat] = useState<string | null>(null);
    const [showDiceLogUI, setShowDiceLogUI] = useState(true);
    const [confirmShortRest, setConfirmShortRest] = useState(false);
    const [buyShopItem, setBuyShopItem] = useState<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);


    // Helper: Modifiers
    const mod = (score: number, statName: string) => {
        let val = Math.floor((score - 10) / 2);
        // Add item bonuses if applicable
        if (character) {
            (character.inventory || []).filter((it: any) => it.isEquipped && it.effects).forEach((it: any) => {
                it.effects.forEach((eff: any) => {
                    if (eff.type === 'stat_bonus' && eff.stat === statName) val += eff.value;
                });
            });
        }
        return val;
    };

    const extractDice = (str: string) => {
        if (!str) return null;
        const match = str.match(/\d+d\d+([+-]\d+)?/i);
        return match ? match[0] : null;
    };

    // Derived Values
    const stats = character?.stats || {};
    const mods = {
        STR: mod(stats.STR || 10, 'STR'),
        DEX: mod(stats.DEX || 10, 'DEX'),
        CON: mod(stats.CON || 10, 'CON'),
        INT: mod(stats.INT || 10, 'INT'),
        WIS: mod(stats.WIS || 10, 'WIS'),
        CHA: mod(stats.CHA || 10, 'CHA')
    };
    const lv = character?.level || 1;
    const level = lv; // Alias for level which is used in some calculations
    const prof = profBonus(lv);
    const clsName = character?.classRef?.name || '';
    const cls = clsName; // Alias for cls which is used in some calculations
    const mcs = character?.multiclasses || [];
    const canCast = isSpellcaster(clsName) || mcs.some((mc: any) => isSpellcaster(mc.className));
    const hpPct = character?.maxHp ? Math.round((currentHp / character.maxHp) * 100) : 0;
    const actualFeats = [...(character?.feats || []), ...(character?.raceBonusFeats || [])];

    // Auto-derived defenses (Resistances/Immunities)
    const autoDefenses = (() => {
        const res: string[] = character?.resistances || [];
        const imm: string[] = character?.immunities || [];
        const vuln: string[] = character?.vulnerabilities || [];
        
        // Add race/class/feat/item defenses logic here if needed
        return { res, imm, vuln };
    })();

    // Spell Slots & Resources
    const { merged: slotTotals, warlockPact } = getMulticlassSpellSlots(clsName, lv, mcs);
    const resources = CLASS_RESOURCES[clsName] || [];
    const baseAttacks = CLASS_ATTACKS[clsName] || [];

    // Save Logic
    const saveCombatState = async (updates: any) => {
        if (!character?._id) return;
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, updates, { headers: { 'Authorization': `Bearer ${token}` } });
        } catch (e) { console.error("Save failure:", e); }
    };


    // Effects
    useEffect(() => {
        setHasMounted(true);
        if (!campaignId || !token) return;
        const fetchChar = async () => {
             try {
                const charId = localStorage.getItem(`dnd_character_${campaignId}`);
                if (!charId) {
                    router.push(`/player/${campaignId}/character-creator`);
                    return;
                }
                const res = await axios.get(`${API_URL}/api/characters/${charId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                setCharacter(res.data);
                characterRef.current = res.data;
                setPrivateNotes(res.data.privateNotes || "");
                setSpellSlotsUsed(res.data.spellSlotsUsed || {});
                setResourcesUsed(res.data.resourcesUsed || {});
                setConcentrationSpell(res.data.concentrationSpell || null);
                setLoading(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setLoading(false);
            }
        };
        fetchChar();
    }, [campaignId, token, router]);

    useEffect(() => {
        const fetchSpells = async () => {
            if (!character?.spells || character.spells.length === 0) return;
            try {
                const res = await axios.post(`${API_URL}/api/spells/batch`, { names: character.spells }, { headers: { 'Authorization': `Bearer ${token}` } });
                const details: any = {};
                res.data.forEach((s: any) => details[s.name] = s);
                setSpellDetails(details);
                setActualSpells(res.data);
            } catch (e) { }
        };
        if (token) fetchSpells();
    }, [character?.spells, token]);

    useEffect(() => {
        const fetchAllSpells = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/spells`, { headers: { 'Authorization': `Bearer ${token}` } });
                setAllSpells(res.data);
            } catch (e) { }
        };
        if (token) fetchAllSpells();
    }, [token]);

    useEffect(() => {
        if (!socket || !character) return;
        
        const onCharUpdated = (data: any) => {
            if (data.characterId === character._id || data.characterId === character.name) {
                setCharacter((prev: any) => {
                    if (!prev) return prev;
                    const next = { ...prev, [data.stat]: data.value };
                    characterRef.current = next;
                    return next;
                });
            }
        };

        const onShopPublished = (data: any) => {
            setShopItems(data.shopItems || []);
            setIsShopPublished(data.isPublished);
            if (data.isPublished) {
                showToast("Shop Published!", "The DM has updated the available items.", "bg-orange-900 border-orange-500 text-orange-100");
            }
        };

        (socket as any).on('character_stat_updated', onCharUpdated);
        (socket as any).on('shop_published', onShopPublished);

        return () => {
            (socket as any).off('character_stat_updated', onCharUpdated);
            (socket as any).off('shop_published', onShopPublished);
        };
    }, [socket, character]);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [fRes, cRes] = await Promise.all([
                    axios.get(`${API_URL}/api/feats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${API_URL}/api/classes`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                setLibFeats(fRes.data);
                setAllClasses(cRes.data);
            } catch (e) { }
        };
        if (token) fetchMeta();
    }, [token]);

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

    const updateHp = async (val: number) => {
        if (!character) return;
        const clamped = Math.max(0, Math.min(character.maxHp || 10, val));
        setCurrentHp(clamped);
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { currentHp: clamped }, { headers: { 'Authorization': `Bearer ${token}` } });
            if (socket) (socket as any).emit('character_stat_updated', { campaignId, characterId: character._id, stat: 'currentHp', value: clamped });
        } catch (e) { console.error(e); }
    };

    const updateMoney = async (coin: string, amount: number) => {
        if (!character) return;
        const currentMoney = character.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
        const newMoney = { ...currentMoney, [coin]: Math.max(0, (currentMoney[coin] || 0) + amount) };
        setCharacter({ ...character, money: newMoney });
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { money: newMoney }, { headers: { 'Authorization': `Bearer ${token}` } });
            if (socket) (socket as any).emit('character_stat_updated', { campaignId, characterId: character._id, stat: 'money', value: newMoney });
        } catch (e) { console.error(e); }
    };

    const setMoney = async (coin: string, absoluteAmount: number) => {
        if (!character) return;
        const currentMoney = character.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
        const newMoney = { ...currentMoney, [coin]: Math.max(0, absoluteAmount) };
        setCharacter({ ...character, money: newMoney });
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { money: newMoney }, { headers: { 'Authorization': `Bearer ${token}` } });
            if (socket) (socket as any).emit('character_stat_updated', { campaignId, characterId: character._id, stat: 'set_money', value: newMoney });
        } catch (e) { console.error(e); }
    };

    const updateDeathSaves = async (type: 'successes' | 'failures', val: number) => {
        if (!character) return;
        const newSaves = { ...deathSaves, [type]: val };
        setDeathSaves(newSaves);
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { deathSaves: newSaves }, { headers: { 'Authorization': `Bearer ${token}` } });
        } catch (e) { console.error(e); }
    };

    const getEffectiveScore = (stat: string, baseScore: number) => {
        let total = baseScore;
        if (character?.inventory) {
            character.inventory.forEach((it: any) => {
                if (it.isEquipped && it.effects) {
                    it.effects.forEach((eff: any) => {
                        if (eff.type === 'stat_set' && eff.stat === stat) total = Math.max(total, eff.value);
                        if (eff.type === 'stat_bonus' && eff.stat === stat) total += eff.value;
                    });
                }
            });
        }
        return total;
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

    const handleDeleteCharacter = async () => {
        if (!character) return;
        if (!confirm(`Are you sure you want to completely delete "${character.name}"? This action cannot be undone.`)) return;
        try {
            await axios.delete(`${API_URL}/api/characters/${character._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            localStorage.removeItem(`dnd_character_${campaignId}`);
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Error deleting character.");
        }
    };

    useEffect(() => {
        if (!whisperData || !character) return;
        const wd = whisperData as any;
        // Check if I am the target
        if (wd.targetPlayerName === 'DM') {
            if (dmLevelPermission) {
                showToast(`${wd.senderName} Whispers 🤫`, wd.message, 'bg-purple-900 border-purple-500 text-purple-100');
            }
        } else if (wd.targetPlayerName === character.name) {
            showToast(`${wd.senderName} Whispers 🤫`, wd.message, 'bg-purple-900 border-purple-500 text-purple-100');
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
    }, [socket, campaignId, token]);

    const addItem = async () => {
        if (!newItemName.trim() || !character) return;
        setIsAddingItem(true);
        const newItem = { name: newItemName, qty: newItemQty, isEquipped: false };
        const newInventory = [...(character.inventory || []), newItem];
        try {
            const res = await axios.put(`${API_URL}/api/characters/${character._id}`, { inventory: newInventory }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
            setNewItemName("");
            setNewItemQty(1);
            showToast('Eşya Eklendi', `${newItemName} envantere eklendi.`, 'bg-green-900 border-green-500 text-green-100');
        } catch { alert("Eşya eklenemedi."); }
        finally { setIsAddingItem(false); }
    };

    const removeItem = async (index: number) => {
        if (!character) return;
        const newInventory = character.inventory.filter((_: any, i: number) => i !== index);
        try {
            const res = await axios.put(`${API_URL}/api/characters/${character._id}`, { inventory: newInventory }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
        } catch { alert("Eşya silinemedi."); }
    };

    const toggleEquip = async (index: number) => {
        if (!character) return;
        const newInventory = character.inventory.map((item: any, i: number) => 
            i === index ? { ...item, isEquipped: !item.isEquipped } : item
        );
        try {
            const res = await axios.put(`${API_URL}/api/characters/${character._id}`, { inventory: newInventory }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
            showToast(newInventory[index].isEquipped ? 'Kuşanıldı' : 'Çıkarıldı', `${newInventory[index].name} durumu güncellendi.`, 'bg-blue-900 border-blue-500 text-blue-100');
        } catch { alert("Eşya durumu güncellenemedi."); }
    };

    const addCustomResource = async () => {
        if (!newResourceName.trim() || !character) return;
        const newRes = {
            name: newResourceName,
            max: newResourceMax,
            recharge: newResourceRecharge,
            desc: newResourceDesc,
            key: `custom_${Date.now()}`
        };
        const currentCustom = character.customResources || [];
        const newCustom = [...currentCustom, newRes];
        try {
            const res = await axios.put(`${API_URL}/api/characters/${character._id}`, { customResources: newCustom }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
            setShowCustomResourceModal(false);
            setNewResourceName("");
            setNewResourceMax(1);
            setNewResourceDesc("");
            showToast('Kaynak Eklendi', `${newResourceName} başarıyla eklendi.`, 'bg-orange-900 border-orange-500 text-orange-100');
        } catch { alert("Kaynak eklenemedi."); }
    };

    const toggleSpell = async (spellName: string) => {
        if (!character) return;
        const currentSpells = [...(character.spells || [])];
        const isKnown = currentSpells.includes(spellName);
        let newSpells = isKnown ? currentSpells.filter(s => s !== spellName) : [...currentSpells, spellName];
        
        try {
            const res = await axios.put(`${API_URL}/api/characters/${character._id}`, { spells: newSpells }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
            showToast(isKnown ? 'Spell Unlearned 🔮' : 'Spell Learned ✨', `${spellName} has been updated in your library.`, 'bg-purple-900 border-purple-500 text-purple-100');
        } catch { 
            showToast('Error', 'Failed to update spell list.', 'bg-red-900 border-red-500 text-red-100');
        }
    };

    const useSlot = async (slotLevel: number, spellName: string = 'Basic Spell', isConcentration: boolean = false) => {
        if (!character) return;
        const currentUsed = { ...spellSlotsUsed };
        const key = String(slotLevel);
        const totalRows = slotTotals[slotLevel - 1] ?? 0;
        
        if ((currentUsed[key] || 0) >= totalRows) {
            showToast("Insufficient Spell Slots", `You have no level ${slotLevel} slots remaining.`, "bg-red-900 border-red-500 text-red-100");
            return false;
        }

        currentUsed[key] = (currentUsed[key] || 0) + 1;
        setSpellSlotsUsed(currentUsed);

        if (isConcentration) {
            setConcentrationSpell(spellName);
        }

        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { 
                spellSlotsUsed: currentUsed, 
                concentrationSpell: isConcentration ? spellName : concentrationSpell 
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast('Büyü Yapıldı', `${spellName} (${slotLevel}. seviye) başarıyla kullanıldı.`, 'bg-purple-900 border-purple-500 text-purple-100');
            return true;
        } catch { 
            alert("Büyü slotu güncellenemedi."); 
            return false;
        }
    };

    const dropConcentration = async () => {
        setConcentrationSpell(null);
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { concentrationSpell: null }, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast('Konsantrasyon Bozuldu', 'Artık bir büyüye konsantre olmuyorsunuz.', 'bg-gray-800 border-gray-600 text-gray-300');
        } catch { }
    };

    const getSpellcastingAbility = (className: string) => {
        const map: any = {
            'Wizard': 'INT', 'Druid': 'WIS', 'Cleric': 'WIS', 'Ranger': 'WIS',
            'Bard': 'CHA', 'Paladin': 'CHA', 'Sorcerer': 'CHA', 'Warlock': 'CHA',
            'Artificer': 'INT', 'Sorceror': 'CHA' // Handling common typo
        };
        return map[className] || 'INT';
    };

    const getModifier = (statName: string) => {
        if (!stats) return 0;
        const val = stats[statName] || 10;
        return Math.floor((val - 10) / 2);
    };

    const getItemBonus = (bonusType: string, secondaryType?: string) => {
        let bonus = 0;
        if (character?.inventory) {
            character.inventory.forEach((it: any) => {
                if (it.isEquipped && it.effects) {
                    it.effects.forEach((eff: any) => {
                        if (eff.type === bonusType) {
                            if (!secondaryType || eff.stat === secondaryType) bonus += eff.value;
                        }
                    });
                }
            });
        }
        return bonus;
    };

    const handleShortRest = () => setShowHitDiceModal(true);
    const handleLongRest = () => setShowLongRestModal(true);

    const applyLongRest = async () => {
        if (!character) return;
        setIsLevelingUp(true);
        try {
            // Restore all HP, half hit dice, all spell slots
            const maxHD = character.level || 1;
            const newHDUsed = Math.max(0, hitDiceUsed - Math.floor(maxHD / 2));
            const updates = {
                currentHp: character.maxHp,
                spellSlotsUsed: {},
                resourcesUsed: {},
                hitDiceUsed: newHDUsed,
                concentrationSpell: null
            };
            const res = await axios.put(`${API_URL}/api/characters/${character._id}`, updates, { headers: { 'Authorization': `Bearer ${token}` } });
            setCharacter(res.data);
            setCurrentHp(res.data.currentHp);
            setSpellSlotsUsed({});
            setResourcesUsed({});
            setHitDiceUsed(newHDUsed);
            setConcentrationSpell(null);
            setShowLongRestModal(false);
            showToast("Long Rest Complete ⛺", "All HP, spell slots and resources restored.", "bg-indigo-900 border-indigo-500 text-indigo-100");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLevelingUp(false);
        }
    };



    const saveBackstory = async () => {
        if (!character) return;
        setIsSavingStory(true);
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { backstory }, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast('Save Successful', 'Your character backstory has been updated.', 'bg-green-900 border-green-500 text-green-100');
        } catch { alert("Failed to save backstory."); }
        finally { setIsSavingStory(false); }
    };

    const savePrivateNotes = async () => {
        if (!character) return;
        setIsSavingPrivateNotes(true);
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, { privateNotes }, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast('Notes Saved', 'Your personal notes have been updated.', 'bg-blue-900 border-blue-500 text-blue-100');
        } catch { alert("Failed to save notes."); }
        finally { setIsSavingPrivateNotes(false); }
    };

    const sendWhisper = () => {
        if (!whisperMessage.trim() || !socket) return;
        (socket as any).emit('whisper_player', {
            campaignId,
            targetPlayerName: whisperTarget,
            message: whisperMessage,
            senderName: character?.name || 'A Player'
        });
        setWhisperMessage("");
        setIsWhisperModalOpen(false);
        showToast('Whisper Sent 🤫', `Secret message delivered to ${whisperTarget === 'DM' ? 'DM' : whisperTarget}.`, 'bg-purple-900 border-purple-500 text-purple-100');
    };






    const useResource = async (key: string, amount: number = 1) => {
        const res = resources.find(r => r.key === key);
        if (!res) return false;
        const maxVal = res.getMax(lv, mods);
        const used = resourcesUsed[key] ?? 0;
        if (used + amount > maxVal) {
            showToast("Insufficient Resource", `No remaining uses for ${res.name}.`, "bg-red-900 border-red-500 text-red-100");
            return false;
        }
        const newUsed = { ...resourcesUsed, [key]: used + amount };
        setResourcesUsed(newUsed);
        await saveCombatState({ resourcesUsed: newUsed });
        return true;
    };



    const handleRoll = async (name: string, dice: any, typeLabel: string, cost?: { key: string, amount: number, name: string }) => {
        if (cost) {
            const success = await useResource(cost.key, cost.amount);
            if (!success) return; 
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
        showToast(`🎲 ${name} - ${formula}`, cost ? `${cost.amount} ${cost.name} used! Result: ${total}` : `${typeLabel} Result: ${total}`, 'bg-purple-900 border-purple-500 text-purple-100');
    };

    const startLevelUp = () => {
        // Use characterRef for always-fresh data (fixes consecutive level-up bug)
        const char = characterRef.current;
        if (!char) return;
        const cls = char.classRef;
        if (!cls || typeof cls !== 'object') { alert('Class information could not be loaded, please refresh.'); return; }
        const newLv = char.level + 1;
        if (newLv > 20) return; // Max level 20
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

    const handleLevelUpClick = () => {
        if (!dmLevelPermission) {
            setShowDmPopup(true);
            return;
        }

        const char = characterRef.current;
        if (!char) return;
        if ((char.level || 1) >= 20) {
            alert('Character has already reached the maximum level (20).');
            return;
        }

        // Show choice modal: same class or multiclass
        setShowLevelChoiceModal(true);
    };

    const continueMulticlassChoice = async () => {
        setShowLevelChoiceModal(false);
        // Fetch classes if not loaded
        if (allClasses.length === 0) {
            try {
                const res = await axios.get(`${API_URL}/api/classes`, { headers: { 'Authorization': `Bearer ${token}` } });
                setAllClasses(res.data);
            } catch (e) { console.error('Classes fetch failed', e); }
        }
        setMcPickedClassId('');
        setShowMulticlassPickModal(true);
    };

    const addMulticlass = async () => {
        const char = characterRef.current;
        if (!char || !mcPickedClassId) return;
        const pickedCls = allClasses.find((c: any) => c._id === mcPickedClassId);
        if (!pickedCls) return;

        // Hit die average + CON mod for new class first level
        const hitDieMax = parseInt((pickedCls.hit_die || 'd8').replace('d', '')) || 8;
        const conMod = mod(char.stats?.CON ?? 10, 'CON');
        const hpGained = Math.floor(hitDieMax / 2) + 1 + conMod;

        const currentMulticlasses = char.multiclasses || [];
        // Check if already multclassed into this class
        const alreadyExists = currentMulticlasses.find((mc: any) => mc.classRef === mcPickedClassId || mc.classRef?._id === mcPickedClassId);
        if (alreadyExists) {
            alert('You have already multiclassed into this class.');
            return;
        }
        // Check vs primary class
        if (char.classRef?._id === mcPickedClassId || char.classRef === mcPickedClassId) {
            alert('This is already your primary class.');
            return;
        }

        const newLv = 1;
        const classFeats: any[] = CLASS_FEATURES[pickedCls.name]?.[newLv] ?? [];
        const needSubclass = newLv === pickedCls.subclass_unlock_level; // For Mc, subclass doesn't exist yet
        const asiLevels = ASI_LEVELS[pickedCls.name] ?? [4, 8, 12, 16, 19];
        const needASI = asiLevels.includes(newLv);

        setLvSubclassChoice(null);
        setLvChoice("asi");
        setAsiPicks([]);
        setFeatPick(null);
        setFeatSearch("");
        setLvModal({
            open: true, step: "preview", newLv, hpGained, classFeats, subFeats: [], 
            needSubclass, needASI, 
            mcAction: 'add', mcData: { pickedClassId: mcPickedClassId, pickedClassName: pickedCls.name }
        });
        
        setShowMulticlassPickModal(false);
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
        if (!cls || typeof cls !== 'object') { alert('Class information could not be loaded.'); return; }

        const hitDie = (cls.hit_die || 'd8') as string;
        const hitDieMax = parseInt(hitDie.replace('d', '')) || 8;
        const conMod = mod(char.stats?.CON ?? 10, 'CON');
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
            showToast("Magic Fade", "Level decreased.", "bg-red-900 border-red-500 text-red-100");
            if (res.data.featSelections) {
                setFeatStatSelections(res.data.featSelections.stats || {});
                setFeatSpellSelections(res.data.featSelections.spells || {});
                setFeatChoiceSelections(res.data.featSelections.choices || {});
            }
        } catch (error) {
            console.error(error);
            alert("Error while decreasing level.");
        } finally {
            setIsLevelingUp(false);
        }
    };

    // Level up an existing secondary (multiclass) entry
    const levelUpMulticlass = async (mcIndex: number) => {
        const char = characterRef.current;
        if (!char) return;
        if ((char.level || 1) >= 20) { alert('Character has already reached the maximum level (20).'); return; }

        const mc = mcs[mcIndex];
        if (!mc) return;

        // Look up that class's hit die
        let hitDieStr = 'd8';
        if (allClasses.length > 0) {
            const clsData = allClasses.find((c: any) => c._id === (mc.classRef?._id || mc.classRef) || c.name === mc.className);
            if (clsData) hitDieStr = clsData.hit_die || 'd8';
        }
        const hitDieMax = parseInt(hitDieStr.replace('d', '')) || 8;
        const conMod = mod(char.stats?.CON ?? 10, 'CON');
        const hpGained = Math.floor(hitDieMax / 2) + 1 + conMod;

        const newLv = (mc.level || 1) + 1;
        const classFeats: any[] = CLASS_FEATURES[mc.className]?.[newLv] ?? [];
        
        let subFeats: any[] = [];
        const clsData = allClasses.length > 0 ? allClasses.find((c: any) => c._id === (mc.classRef?._id || mc.classRef) || c.name === mc.className) : null;
        if (mc.subclass && clsData?.subclasses) {
            const sub = clsData.subclasses.find((s: any) => s.name === mc.subclass);
            if (sub) subFeats = sub.features.filter((f: any) => f.level === newLv);
        }

        const needSubclass = newLv === clsData?.subclass_unlock_level && !mc.subclass;
        const asiLevels = ASI_LEVELS[mc.className] ?? [4, 8, 12, 16, 19];
        const needASI = asiLevels.includes(newLv);

        setLvSubclassChoice(null);
        setLvChoice("asi");
        setAsiPicks([]);
        setFeatPick(null);
        setFeatSearch("");
        setLvModal({
            open: true, step: "preview", newLv, hpGained, classFeats, subFeats, 
            needSubclass, needASI, 
            mcAction: 'levelup', mcData: { mcIndex }
        });
        
        setShowLevelChoiceModal(false);
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
                currentHp: character.currentHp + lvModal.hpGained,
            };
            
            if (!lvModal.mcAction) {
                payload.level = lvModal.newLv;
                payload.maxHp = newMaxHp;
                payload.subclass = subclassStr;
            } else if (lvModal.mcAction === 'add') {
                const currentMulticlasses = character.multiclasses || [];
                const newMc = { 
                    classRef: lvModal.mcData.pickedClassId, 
                    className: lvModal.mcData.pickedClassName, 
                    level: 1, 
                    subclass: lvSubclassChoice ? lvSubclassChoice.name : '', 
                    hitDiceUsed: 0 
                };
                payload.multiclasses = [...currentMulticlasses, newMc];
                payload.level = (character.level || 1) + 1;
                payload.maxHp = newMaxHp;
            } else if (lvModal.mcAction === 'levelup') {
                const updatedMcs = mcs.map((m: any, i: number) => 
                    i === lvModal.mcData.mcIndex 
                    ? { ...m, level: lvModal.newLv, subclass: lvSubclassChoice ? lvSubclassChoice.name : (m.subclass || '') } 
                    : m
                );
                payload.multiclasses = updatedMcs;
                payload.level = (character.level || 1) + 1;
                payload.maxHp = newMaxHp;
            }

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
                (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'level', value: payload.level });
                (socket as any).emit('update_character_stat', { campaignId, characterId: character._id, stat: 'maxHp', value: newMaxHp });
            }
            setLvModal(null);
            
            let toastTitle = `Level ${lvModal.newLv}! 🎉`;
            if (lvModal.mcAction === 'add') toastTitle = `🎉 ${lvModal.mcData.pickedClassName} Added!`;
            else if (lvModal.mcAction === 'levelup') toastTitle = `🎉 ${character.multiclasses?.[lvModal.mcData.mcIndex]?.className || 'Multiclass'} Lv.${lvModal.newLv}!`;

            showToast(toastTitle,
                `+${lvModal.hpGained} max HP gained!${(lvModal.classFeats.length + lvModal.subFeats.length) > 0 ? ` ${lvModal.classFeats.length + lvModal.subFeats.length} new features unlocked.` : ''}`,
                'bg-yellow-900 border-yellow-500 text-yellow-100');
        } catch (e) { console.error(e); }
        finally { setIsLevelingUp(false); }
    };

    const hpPctOldAvoidClash = character ? Math.round((currentHp / character.maxHp) * 100) : 0;

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


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl font-black tracking-widest uppercase animate-pulse">Loading Character...</p>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-6 p-4 text-center">
                <div className="text-6xl">🚫</div>
                <div>
                    <h1 className="text-3xl font-black mb-2">Character Not Found</h1>
                    <p className="text-gray-400">You don't have a character for this campaign yet, or an error occurred while loading.</p>
                </div>
                <button 
                    onClick={() => router.push(`/player/${campaignId}/character-creator`)}
                    className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-black rounded-xl transition shadow-lg border border-red-500"
                >
                    Create New Character
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans">

            {/* ══ LEVEL CHART MODAL ══ */}
            {showLevelChart && (() => {
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
                                    <p className="text-gray-400 text-sm">Gains when leveling up</p>
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
                                                            {isCurrent && <span className="text-[10px] bg-red-700 text-red-100 px-1.5 py-0.5 rounded font-bold">CURRENT</span>}
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
                                                            {feats.map((f: ClassFeature, fi: number) => (
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
            {/* ── LEVEL CHOICE MODAL (level same class OR multiclass?) ── */}
            {showLevelChoiceModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowLevelChoiceModal(false)}>
                    <div className="bg-gray-900 border-2 border-yellow-700 rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">⬆️ Seviye Atla</h2>
                        <p className="text-gray-400 text-sm mb-4">Hangi sınıfı yükseltmek istiyorsun?</p>
                        <div className="flex flex-col gap-3">
                            {/* Primary class level-up */}
                            <button
                                onClick={() => { setShowLevelChoiceModal(false); startLevelUp(); }}
                                className="w-full bg-yellow-700 hover:bg-yellow-600 text-white font-black py-4 rounded-xl text-left px-5 transition shadow-lg border border-yellow-600 flex items-center gap-4"
                            >
                                <span className="text-3xl">⚔️</span>
                                <div>
                                    <div className="text-white font-black text-lg">{character.classRef?.name || 'Ana Sınıf'}</div>
                                    <div className="text-yellow-200 text-xs font-normal mt-0.5">
                                        Sv. {character.level - ((character.multiclasses || []).reduce((s: number, mc: any) => s + (mc.level || 0), 0))} → {character.level - ((character.multiclasses || []).reduce((s: number, mc: any) => s + (mc.level || 0), 0))+1}
                                    </div>
                                </div>
                            </button>

                            {/* Existing secondary class level-up buttons */}
                            {(character.multiclasses || []).map((mc: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => levelUpMulticlass(idx)}
                                    disabled={isLevelingUp}
                                    className="w-full bg-violet-900/60 hover:bg-violet-800 text-white font-black py-4 rounded-xl text-left px-5 transition shadow-lg border border-violet-600 flex items-center gap-4 disabled:opacity-40"
                                >
                                    <span className="text-3xl">✨</span>
                                    <div>
                                        <div className="text-white font-black text-lg">{mc.className || 'Bilinmiyor'}</div>
                                        <div className="text-violet-200 text-xs font-normal mt-0.5">
                                            Sv. {mc.level || 1} → {(mc.level || 1) + 1}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {/* Add a brand new multiclass */}
                            <button
                                onClick={continueMulticlassChoice}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-black py-3 rounded-xl text-left px-5 transition border border-gray-600 flex items-center gap-3 text-sm"
                            >
                                <span className="text-xl">➕</span>
                                <div>
                                    <div className="text-white font-bold">Yeni Sınıf Ekle (Multiclass)</div>
                                    <div className="text-gray-400 text-xs font-normal">Farklı bir sınıfa 1. seviyeden başla</div>
                                </div>
                            </button>
                        </div>
                        <button onClick={() => setShowLevelChoiceModal(false)} className="mt-4 text-gray-500 hover:text-gray-300 text-sm w-full text-center transition">İptal</button>
                    </div>
                </div>
            )}


            {/* ── MULTICLASS CLASS PICKER MODAL ── */}
            {showMulticlassPickModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowMulticlassPickModal(false)}>
                    <div className="bg-gray-900 border-2 border-violet-700 rounded-2xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-black text-white mb-1 tracking-tight">✨ Multiclass Sınıf Seç</h2>
                        <p className="text-gray-400 text-xs mb-5">Yeni bir sınıfa 1. seviyeden başlayacaksın. HP o sınıfın hit die'ına göre hesaplanır.</p>

                        {/* Prerequisite Warning */}
                        <div className="text-[10px] text-violet-300 bg-violet-900/30 border border-violet-700/40 rounded-lg px-3 py-2 mb-4 leading-relaxed">
                            ⚠️ D&D kurallarına göre bazı sınıfların minimum stat ön koşulları vardır. Lütfen Dungeon Master'ınla kontrol et.
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 mb-5">
                            {allClasses.filter((c: any) => {
                                // Hide primary class and existing multiclasses
                                const primaryId = character.classRef?._id || character.classRef;
                                const mcIds = (character.multiclasses || []).map((mc: any) => mc.classRef?._id || mc.classRef);
                                return c._id !== primaryId && !mcIds.includes(c._id);
                            }).map((c: any) => (
                                <button
                                    key={c._id}
                                    onClick={() => setMcPickedClassId(c._id)}
                                    className={`p-3 rounded-xl border text-left transition font-bold text-sm ${
                                        mcPickedClassId === c._id
                                            ? 'bg-violet-700 border-violet-500 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-violet-600 hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="font-black">{c.name}</div>
                                    <div className="text-xs opacity-60 font-normal">{c.hit_die} hit die</div>
                                </button>
                            ))}
                        </div>
                        
                        {/* Selected Class Features Display */}
                        {mcPickedClassId && (() => {
                            const c = allClasses.find((x: any) => x._id === mcPickedClassId);
                            if(!c) return null;
                            const feats = CLASS_FEATURES[c.name]?.[1] || [];
                            return (
                                <div className="mb-4 bg-violet-900/20 border border-violet-800/50 rounded-xl p-3 max-h-48 overflow-y-auto">
                                    <h3 className="text-violet-300 font-black text-sm mb-2">⚔️ {c.name} 1. Seviye Özellikleri</h3>
                                    {feats.length > 0 ? feats.map((f: any, i: number) => (
                                        <div key={i} className="mb-2 last:mb-0">
                                            <div className="text-violet-200 text-xs font-bold">{f.name}</div>
                                            <div className="text-gray-400 text-[10px] leading-tight">{f.desc_tr}</div>
                                        </div>
                                    )) : <div className="text-gray-500 text-xs italic">Özel bir yetenek yok.</div>}
                                </div>
                            );
                        })()}

                        <button
                            onClick={addMulticlass}
                            disabled={!mcPickedClassId || isAddingMulticlass}
                            className="w-full bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white font-black py-3 rounded-xl transition shadow-lg"
                        >
                            {isAddingMulticlass ? 'Ekleniyor...' : `✨ ${allClasses.find((c: any) => c._id === mcPickedClassId)?.name || 'Sınıf'} Olarak Multiclass Ol`}
                        </button>
                        <button onClick={() => setShowMulticlassPickModal(false)} className="mt-3 text-gray-500 hover:text-gray-300 text-sm w-full text-center transition">İptal</button>
                    </div>
                </div>
            )}

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
                            {/* Inspiration Badge */}
                            {character.inspiration && (
                                <div className="flex items-center bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-bounce h-5">
                                    ⚡ INSPIRATION
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">
                            {character.raceRef?.name}{character.subrace ? ` (${character.subrace})` : ''} ·{' '}
                            {/* Primary class */}
                            <span className="text-white font-bold">{cls}</span>
                            {character.level && character.multiclasses?.length > 0 && (
                                <span className="text-gray-400"> {character.level - (character.multiclasses || []).reduce((s: number, mc: any) => s + (mc.level || 0), 0)}</span>
                            )}
                            {character.subclass && <span className="text-purple-400"> [{character.subclass}]</span>}
                            {/* Secondary classes (multiclasses) */}
                            {(character.multiclasses || []).map((mc: any, idx: number) => (
                                <span key={idx} className="text-violet-300 font-bold"> / {mc.className || 'Bilinmiyor'} {mc.level}</span>
                            ))}
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
                        <div className="flex items-center gap-2 bg-yellow-950/30 border border-yellow-700/50 px-3 py-1.5 rounded-xl">
                            <span className="text-yellow-500 text-xs font-black uppercase tracking-widest">Parti Altını</span>
                            <span className="text-white font-black text-lg">{partyGold} <span className="text-yellow-500 text-sm">gp</span></span>
                        </div>
                        <button onClick={() => setIsWhisperModalOpen(true)} className="px-3 py-2 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 font-bold rounded-lg text-xs transition border border-purple-700/50 shadow-sm">
                            🤫 DM'e Fısılda
                        </button>
                        <button onClick={handleShortRest} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition border border-slate-600 shadow-sm hidden lg:block">
                            ⏳ Short Rest
                        </button>
                        <button onClick={handleLongRest} className="px-4 py-2 bg-indigo-900/80 hover:bg-indigo-700 text-indigo-100 font-black rounded-lg text-sm transition border border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:scale-105 transform">
                            ⛺ Long Rest
                        </button>
                        <button onClick={handleDeleteCharacter} className="ml-2 px-3 py-2 bg-red-900/40 hover:bg-red-700/60 text-red-300 font-bold rounded-lg text-xs transition border border-red-700/50 shadow-sm" title="Karakteri Sil">
                            🗑️ Sil
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
                        <input type="text" value={hpInput} onChange={e => setHpInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    const val = hpInput.trim();
                                    if (!val) return;
                                    let delta = 0;
                                    if (val.startsWith('+')) {
                                        delta = parseInt(val.slice(1)) || 0;
                                    } else if (val.startsWith('-')) {
                                        delta = -(parseInt(val.slice(1)) || 0);
                                    } else {
                                        // Varsayılan olarak hasar (eksi)
                                        delta = -(parseInt(val) || 0);
                                    }
                                    updateHp(currentHp + delta);
                                    setHpInput("");
                                }
                            }}
                            placeholder="± HP…" className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white text-center" />
                    </div>
                    {/* Hit Dice */}
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-1 -m-1 rounded transition" onClick={handleShortRest} title="Kısa Dinlenme (Can Zarı Harca)">
                        <span className="text-gray-400 text-sm font-bold">🎲 HD</span>
                        <span className="text-2xl font-black text-pink-400">
                            {(() => {
                                const mainLv = character.level - mcs.reduce((acc: number, mc: any) => acc + (mc.level || 1), 0);
                                const diceMap = new Map<string, number>();
                                const addDice = (hd: string, lv: number) => diceMap.set(hd, (diceMap.get(hd) || 0) + lv);
                                
                                addDice(character.classRef?.hit_die || 'd8', mainLv);
                                mcs.forEach((mc: any) => {
                                    const hd = allClasses.find((c: any) => c._id === (mc.classRef?._id || mc.classRef) || c.name === mc.className)?.hit_die || 'd8';
                                    addDice(hd, mc.level || 1);
                                });
                                
                                let totalMax = 0;
                                let desc: string[] = [];
                                Array.from(diceMap.entries()).forEach(([hd, count]) => {
                                    totalMax += count;
                                    desc.push(`${count}${hd}`);
                                });
                                const remaining = Math.max(0, totalMax - hitDiceUsed);
                                return <span title={`Zarlar: ${desc.join(' + ')}`}>{remaining} <span className="text-gray-500 text-lg">/ {totalMax}</span></span>;
                            })()}
                        </span>
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
                        const abilityMod = mod(stats[ability] || 10, ability);
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

            {/* ── DEATH SAVES FULLSCREEN MODAL ── */}
            {currentHp <= 0 && (
                <div className="fixed inset-0 bg-black/90 z-[100] backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-gray-900 border-2 border-red-700/60 rounded-3xl w-full max-w-lg p-8 shadow-[0_0_50px_rgba(185,28,28,0.4)] animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 bg-red-900/40 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                ☠️
                            </div>
                            <h2 className="text-4xl font-black text-red-500 uppercase tracking-tighter mb-2">Ölümün Kıyısında!</h2>
                            <p className="text-gray-400 font-bold">Ölüm Kurtarışları: 10+ Başarılı Olur</p>
                        </div>

                        <div className="space-y-10">
                            {/* SUCCESSES */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-green-400 font-black uppercase tracking-widest text-xs">Başarılar (Successes)</span>
                                    <span className="text-gray-500 font-mono text-xs">{deathSaves.successes} / 3</span>
                                </div>
                                <div className="flex justify-center gap-6">
                                    {[1, 2, 3].map(i => (
                                        <button key={`s${i}`} onClick={() => updateDeathSaves('successes', deathSaves.successes === i ? i - 1 : i)}
                                            className={`w-14 h-14 rounded-2xl border-[3px] flex items-center justify-center transition-all duration-300 ${deathSaves.successes >= i ? 'bg-green-500 border-green-400 text-white font-black scale-110 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'bg-gray-800 border-gray-700 hover:border-green-600 cursor-pointer hover:bg-gray-700'}`}>
                                            {deathSaves.successes >= i ? '✓' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* FAILURES */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-red-500 font-black uppercase tracking-widest text-xs">Başarısızlıklar (Failures)</span>
                                    <span className="text-gray-500 font-mono text-xs">{deathSaves.failures} / 3</span>
                                </div>
                                <div className="flex justify-center gap-6">
                                    {[1, 2, 3].map(i => (
                                        <button key={`f${i}`} onClick={() => updateDeathSaves('failures', deathSaves.failures === i ? i - 1 : i)}
                                            className={`w-14 h-14 rounded-2xl border-[3px] flex items-center justify-center transition-all duration-300 ${deathSaves.failures >= i ? 'bg-red-600 border-red-500 text-white font-black scale-110 shadow-[0_0_20px_rgba(185,28,28,0.6)]' : 'bg-gray-800 border-gray-700 hover:border-red-600 cursor-pointer hover:bg-gray-700'}`}>
                                            {deathSaves.failures >= i ? '✕' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                            <p className="text-gray-500 text-xs italic">Eğer 3 başarıya ulaşırsan durumun stabilize olur, 3 başarısızlıkta karakterin ölür.</p>
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
                        ["world", "🌍 Dünya / Görevler"],
                        ["party", "🛡️ Parti / Oda"]
                    ] as const).map(([tab, label]) => {
                        if (tab === "spells") {
                            const isCharSpellcaster = isSpellcaster(character.classRef?.name || '') || mcs.some((mc: any) => isSpellcaster(mc.className));
                            if (actualSpells.length === 0 && !isCharSpellcaster) return null;
                        }
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
                                    {Object.entries(stats).map(([s, v]: any) => {
                                        const effective = getEffectiveScore(s, v);
                                        const isBoosted = effective > v;
                                        return (
                                            <div key={s} className="bg-gray-800 p-3 text-center">
                                                <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isBoosted ? 'text-blue-400' : 'text-gray-500'}`}>{s}</div>
                                                <div className={`text-2xl font-black ${isBoosted ? 'text-blue-300 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-white'}`}>{effective}</div>
                                                <div className={`text-sm font-black ${mod(v, s) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(mod(v, s))}</div>
                                            </div>
                                        );
                                    })}
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
                                        const base = mod(stats[skill.ability] || 10, skill.ability);
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

                            {/* Ana ve Multiclass Özellikleri (Seviyeye Göre Kazanılanlar) */}
                            {(() => {
                                const features: any[] = [];
                                const addFeats = (clsName: string, maxLv: number) => {
                                    if (!clsName) return;
                                    for (let l = 1; l <= maxLv; l++) {
                                        const feats = CLASS_FEATURES[clsName]?.[l];
                                        if (feats) {
                                            feats.forEach((f: any) => features.push({ ...f, clsName, level: l }));
                                        }
                                    }
                                };
                                const mainLv = character.level - mcs.reduce((acc: number, mc: any) => acc + (mc.level || 1), 0);
                                addFeats(character.classRef?.name, mainLv);
                                mcs.forEach((mc: any) => addFeats(mc.className, mc.level || 1));
                                
                                if (features.length === 0) return null;
                                
                                return (
                                    <div className="bg-gray-800 rounded-xl border border-blue-800/50 overflow-hidden mb-4">
                                        <div 
                                            className="px-4 py-3 bg-blue-900/30 border-b border-blue-800/50 flex items-center justify-between cursor-pointer hover:bg-blue-800/30 transition-colors"
                                            onClick={() => setShowClassFeatsUI(!showClassFeatsUI)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-400 text-lg">⚔️</span>
                                                <h3 className="font-black text-blue-300">Sınıf Özellikleri</h3>
                                            </div>
                                            <span className="text-blue-400 text-xs">{showClassFeatsUI ? '▼' : '▲'}</span>
                                        </div>
                                        {showClassFeatsUI && (
                                        <div className="p-4 space-y-3">
                                            {features.map((f, i) => (
                                                <div key={i} className="p-3 rounded-lg border border-gray-700 bg-gray-900/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-900/50 text-blue-300">
                                                            {f.clsName} (Sv.{f.level})
                                                        </span>
                                                        <span className="text-sm font-black text-gray-200">{f.name}</span>
                                                    </div>
                                                    <p className="text-xs leading-relaxed text-gray-400">{f.desc_tr || f.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                        )}
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
                                    <div 
                                        className="px-4 py-2 bg-yellow-900/20 border-b border-yellow-800/40 flex items-center justify-between cursor-pointer hover:bg-yellow-800/30 transition-colors"
                                        onClick={() => setShowFeatsUI(!showFeatsUI)}
                                    >
                                        <h3 className="font-black text-yellow-500 uppercase text-xs tracking-widest">🌟 Featlar <span className="text-yellow-600/70 normal-case font-normal ml-1">(tıkla: {showFeatsUI ? 'gizle' : 'göster'})</span></h3>
                                        <span className="text-yellow-500 text-xs">{showFeatsUI ? '▼' : '▲'}</span>
                                    </div>
                                    {showFeatsUI && (
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
                                    )}
                                </div>
                            )}

                            {/* Dice Log */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <div 
                                    className="px-4 py-2 border-b border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors"
                                    onClick={() => setShowDiceLogUI(!showDiceLogUI)}
                                >
                                    <h3 className="font-black text-gray-300 uppercase text-xs tracking-widest">📜 Dice Log</h3>
                                    <span className="text-gray-400 text-xs">{showDiceLogUI ? '▼' : '▲'}</span>
                                </div>
                                {showDiceLogUI && (
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
                                )}
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
                                        const m = mod(v as number, s);
                                        return (
                                            <button key={s} onClick={() => {
                                                const roll = Math.floor(Math.random() * 20) + 1;
                                                const total = roll + m;
                                                if (socket) (socket as any).emit('roll_dice', {
                                                    campaignId,
                                                    playerName: character.name,
                                                    rollResult: total,
                                                    type: `${s} Kontrolü (d20${fmt(m)})`
                                                });
                                                showToast(`${s} Kontrolü`, `Zar: ${roll} ${fmt(m)} | Sonuç: ${total}`, total >= 20 ? 'bg-green-900 border-green-500 text-green-100' : 'bg-gray-800 border-gray-500 text-gray-100');
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
                    // Find equipped weapons from inventory
                    const equippedWeapons = (character.inventory || []).filter((it: any) => it.isEquipped && (it.type === 'weapon' || (it.name && it.name.toLowerCase().match(/sword|axe|dagger|bow|staff|mace|hammer|spear|javelin/))));

                    // Map equipped weapons to attack objects
                    const mappedWeaponAttacks = equippedWeapons.map((w: any) => {
                        const name = (w.name || "").toLowerCase();
                        const isFinesse = name.includes('dagger') || name.includes('rapier') || name.includes('shortsword') || name.includes('scimitar') || name.includes('whip') || name.includes('bow') || name.includes('crossbow');
                        const isRanged = name.includes('bow') || name.includes('crossbow') || name.includes('sling') || name.includes('dart');

                        const atkAbility = isRanged ? 'DEX' : (isFinesse ? (mods.DEX > mods.STR ? 'DEX' : 'STR') : 'STR');
                        const abilityMod = mods[atkAbility as keyof typeof mods] || 0;

                        // Get weapon-specific bonus (e.g. +1 weapon)
                        let weaponBonus = 0;
                        if (w.effects && Array.isArray(w.effects)) {
                            w.effects.forEach((eff: any) => {
                                if (eff && eff.type === 'item_bonus' && typeof eff.value === 'number') weaponBonus += eff.value;
                            });
                        }

                        // Global bonuses from other items/features
                        const globalAtkBonus = (isRanged && character.fightingStyle === 'Archery') ? 2 : 0;
                        const globalDmgBonus = getItemBonus('damage_bonus', isRanged ? 'ranged' : 'melee');

                        const toHit = prof + abilityMod + weaponBonus + globalAtkBonus;
                        const damageMod = abilityMod + weaponBonus + globalDmgBonus;

                        // Default damage values if not in note
                        let damage = "1d6";
                        if (name.includes('dagger')) damage = "1d4";
                        else if (name.includes('greataxe') || name.includes('greatsword')) damage = "1d12";
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

                    const allAttacks = [
                        ...baseAttacks.map(atk => ({
                            ...atk,
                            toHit: atk.toHit ? fmt(evalAtk(atk.toHit, mods, prof)) : undefined,
                            damage: atk.damage.includes('+') || atk.damage.includes('-') 
                                ? atk.damage.replace(/(STR|DEX|CON|INT|WIS|CHA|Prof)/g, (m) => {
                                    if (m === 'Prof') return String(prof);
                                    return String(mods[m as keyof typeof mods]);
                                  })
                                : (atk.damage.match(/^[0-9d+\s-]+$/) ? atk.damage : (() => {
                                    // Handle cases like "1+STR"
                                    const parts = atk.damage.split(' ');
                                    const dice = parts[0];
                                    const type = parts.slice(1).join(' ');
                                    const val = evalAtk(dice, mods, prof);
                                    return isNaN(Number(dice)) ? `${val} ${type}` : atk.damage;
                                  })())
                        })), 
                        ...mappedWeaponAttacks
                    ];

                    return (
                        <div className="pb-8 space-y-5">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {allAttacks.map((atk, idx) => (
                                        <div key={idx} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-500 transition-all flex items-center justify-between group shadow-lg">
                                            <div className="flex-1">
                                                <h4 className="font-black text-white text-sm uppercase tracking-tight group-hover:text-red-400 transition-colors">{atk.name}</h4>
                                                <div className="flex gap-3 mt-1 items-center">
                                                    <span className="text-[10px] bg-red-900/40 text-red-300 font-black px-2 py-0.5 rounded border border-red-500/30">BONUS: {fmt(atk.bonus)}</span>
                                                    <span className="text-[10px] bg-gray-900/60 text-gray-400 font-bold px-2 py-0.5 rounded border border-white/5 uppercase">{atk.damage} {atk.type}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRoll(atk.name, { count: 1, sides: 20, bonus: atk.bonus }, 'Atak')}
                                                className="bg-red-700 hover:bg-red-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                                            >
                                                🎲
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── CLASS RESOURCES ── */}
                            {activeTab === "attacks" && resources.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    {resources.map(res => {
                                        const maxVal = res.getMax(lv, mods);
                                        if (maxVal <= 0) return null;
                                        const used = resourcesUsed[res.key] ?? 0;
                                        const remaining = Math.max(0, maxVal - used);
                                        return (
                                            <div key={res.key} className="bg-gray-800 rounded-2xl border border-orange-500/20 p-4 shadow-xl hover:border-orange-500/40 transition-all group">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/30 text-orange-400 group-hover:scale-110 transition-transform">
                                                        <span className="text-xl">{res.icon}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-black text-white text-sm uppercase tracking-tight">{res.name}</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{res.recharge === 'short' ? 'Short Rest' : 'Long Rest'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-xl font-black ${remaining > 0 ? 'text-orange-400' : 'text-red-500'}`}>{remaining}</span>
                                                        <span className="text-gray-600 text-xs">/{maxVal}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-1.5 mb-3 flex-wrap">
                                                    {Array.from({ length: Math.min(maxVal, 20) }).map((_, i) => (
                                                        <div key={i} className={`w-3 h-3 rounded-full border ${i < remaining ? 'bg-orange-500 border-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-gray-950 border-gray-800'}`}></div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 mt-auto">
                                                    <button 
                                                        onClick={() => useResource(res.key)} 
                                                        disabled={remaining <= 0}
                                                        className="flex-1 py-1.5 bg-orange-700 hover:bg-orange-600 disabled:opacity-40 text-white font-black rounded-lg text-[10px] uppercase tracking-widest transition shadow-lg shadow-orange-900/20"
                                                    >
                                                        Use
                                                    </button>
                                                    <button 
                                                        onClick={() => setResourcesUsed(p => ({ ...p, [res.key]: Math.max(0, (p[res.key] ?? 0) - 1) }))}
                                                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 font-bold rounded-lg text-xs transition"
                                                    >
                                                        ↩
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === "spells" && (
                                <div className="space-y-6 pb-20">
                                    {/* ── SPELLS OVERVIEW CARD ── */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl border border-blue-500/20 p-5 shadow-xl flex items-center justify-between border-l-4 border-l-blue-500 group hover:bg-indigo-900/50 transition-all duration-500">
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Casting Ability</p>
                                                <h4 className="text-xl font-black text-white uppercase tracking-tight">{getSpellcastingAbility(clsName) || 'None'}</h4>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-2xl">🧠</span>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl border border-purple-500/20 p-5 shadow-xl flex items-center justify-between border-l-4 border-l-purple-500 group hover:bg-purple-900/50 transition-all duration-500">
                                            <div>
                                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Spell Save DC</p>
                                                <h4 className="text-2xl font-black text-white font-mono">{8 + (getModifier(getSpellcastingAbility(clsName))) + (prof)}</h4>
                                            </div>
                                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-2xl">⚡</span>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-5 shadow-xl flex items-center justify-between border-l-4 border-l-cyan-500 group hover:bg-cyan-900/50 transition-all duration-500">
                                            <div>
                                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Spell Attack</p>
                                                <h4 className="text-2xl font-black text-white font-mono">+{getModifier(getSpellcastingAbility(clsName)) + (prof)}</h4>
                                            </div>
                                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-2xl">🎯</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ── PREMIUM SPELL SLOTS ── */}
                                    {canCast && slotTotals.some(t => t > 0) && (
                                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-blue-500/20 p-6 shadow-xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 bg-blue-500/5 blur-[100px] rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors duration-1000"></div>

                                            <div className="flex items-center gap-3 mb-6 relative">
                                                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 text-blue-400">
                                                    <span className="text-xl">🔮</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-white text-base lg:text-lg uppercase tracking-wider">Spell Slots</h3>
                                                    <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest leading-none">
                                                        {clsName === 'Warlock' ? 'Pact Magic — Short Rest' : 'Magical Energy — Long Rest'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative">
                                                {slotTotals.map((total, idx) => {
                                                    if (total === 0) return null;
                                                    const slotLv = idx + 1;
                                                    const used = spellSlotsUsed[String(slotLv)] ?? 0;
                                                    const remaining = Math.max(0, total - used);
                                                    return (
                                                        <div key={slotLv} className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50 flex flex-col items-center gap-3 group/slot hover:border-blue-500/40 transition-all duration-300">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Level {slotLv}</span>
                                                            <div className="flex gap-2">
                                                                {Array.from({ length: total }).map((_, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 ${i < remaining
                                                                            ? 'bg-blue-400 border-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.6)] animate-pulse-slow'
                                                                            : 'bg-gray-900 border-gray-700'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <div className="bg-gray-900/60 px-2 py-0.5 rounded-lg border border-gray-700">
                                                                <span className={`text-xs font-black font-mono ${remaining > 0 ? 'text-blue-300' : 'text-red-500/80'}`}>
                                                                    {remaining} <span className="text-gray-600 mx-0.5">/</span> {total}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── SPELLS LIST ── */}
                                    <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-2xl overflow-hidden mt-8">
                                        <div className="px-6 py-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-purple-500/30 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30 text-purple-400">
                                                    <span className="text-lg">✨</span>
                                                </div>
                                                <h3 className="font-black text-white text-base lg:text-lg uppercase tracking-wider">Spell Grimoire</h3>
                                                <button 
                                                    onClick={() => setShowSpellPicker(true)}
                                                    className="ml-4 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black rounded-lg transition border border-purple-400 shadow-sm uppercase tracking-widest"
                                                >
                                                    Manage Spells
                                                </button>
                                            </div>
                                            <div className="bg-gray-950/60 px-3 py-1 rounded-full border border-purple-500/30">
                                                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">{actualSpells.length} Known Spells</span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {actualSpells.length === 0 ? (
                                                <div className="text-center py-12 space-y-4">
                                                    <div className="text-4xl">📚</div>
                                                    <p className="text-gray-400 text-sm font-medium">Henüz bir büyü seçmediniz.</p>
                                                    <button 
                                                        onClick={() => setShowSpellPicker(true)}
                                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl transition border border-purple-400 shadow-lg uppercase tracking-widest"
                                                    >
                                                        Büyüleri Yönet / Ekle
                                                    </button>
                                                </div>
                                            ) : (() => {
                                                const groupedSpells: Record<string, string[]> = {};
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
                                                    <div className="space-y-12">
                                                        {activeCategories.map(cat => (
                                                                    <div key={cat} className="space-y-4">
                                                                        <div className="flex items-center gap-4 group/header">
                                                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-800"></div>
                                                                            <h4 className="font-black text-orange-500 tracking-[0.2em] text-xs uppercase bg-gray-800/50 px-4 py-1.5 rounded-full border border-gray-700/50 group-hover:border-orange-500/30 transition-colors duration-300">{cat}</h4>
                                                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-800"></div>

                                                                            <div className="flex justify-end min-w-[100px]">
                                                                        {(() => {
                                                                            const levelMatch = cat.match(/Level (\d+)/);
                                                                        if (levelMatch) {
                                                                            const slotLv = parseInt(levelMatch[1]);
                                                                            const total = slotTotals[slotLv - 1] ?? 0;
                                                                            const used = spellSlotsUsed[String(slotLv)] ?? 0;
                                                                            if (total > 0) {
                                                                                const remaining = total - used;
                                                                                return (
                                                                                    <div className="flex gap-1.5 items-center">
                                                                                        {Array.from({ length: total }).map((_, i) => (
                                                                                            <div key={i} className={`w-3.5 h-3.5 border rounded-sm transition-all duration-500 ${i < remaining ? 'bg-blue-400 border-blue-300 shadow-[0_0_8px_rgba(96,165,250,0.4)]' : 'bg-transparent border-gray-700 grayscale'}`}></div>
                                                                                        ))}
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {groupedSpells[cat].map((sp: string, i: number) => {
                                                                    const isConc = CONCENTRATION_SPELLS.has(sp);
                                                                    const isActiveConc = concentrationSpell === sp;
                                                                    const isActiveCastTarget = castingSpell === sp;
                                                                    const details = spellDetails[sp];
                                                                    const isExpanded = expandedSpell === sp;
                                                                    const hasValidSlotsForSpell = details?.level_int > 0 ? slotTotals.some((total, idx) => {
                                                                        const slotLv = idx + 1;
                                                                        return slotLv >= details.level_int && (total - (spellSlotsUsed[String(slotLv)] ?? 0) > 0);
                                                                    }) : true;

                                                                    return (
                                                                        <div
                                                                            key={i}
                                                                            className={`group/card relative rounded-2xl transition-all duration-300 border ${isActiveConc
                                                                                ? 'bg-blue-900/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                                                                : 'bg-gray-800/30 border-gray-700/50 hover:border-purple-500/40 hover:bg-gray-800/50'
                                                                                } ${isExpanded ? 'md:col-span-2' : ''}`}
                                                                        >
                                                                            <div
                                                                                className="p-4 cursor-pointer flex items-center justify-between gap-4"
                                                                                onClick={() => setExpandedSpell(isExpanded ? null : sp)}
                                                                            >
                                                                                <div className="flex flex-col gap-1 flex-1">
                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                        <span className="font-black text-white text-sm lg:text-base group-hover/card:text-purple-300 transition-colors uppercase tracking-tight">{sp}</span>
                                                                                        {isConc && (
                                                                                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md font-black uppercase tracking-widest" title="Concentration">Conc</span>
                                                                                        )}
                                                                                        {isActiveConc && (
                                                                                            <span className="text-[9px] px-1.5 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-md font-black uppercase tracking-widest animate-pulse">Active</span>
                                                                                        )}
                                                                                    </div>
                                                                                    {details && (
                                                                                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                                            <span>{details.casting_time}</span>
                                                                                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                                                            <span>{details.range}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                <div className="flex items-center gap-3">
                                                                                    {!isExpanded && (
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); setCastingSpell(sp); }}
                                                                                            className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 hover:border-purple-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 opacity-0 group-hover/card:opacity-100 transform translate-x-2 group-hover/card:translate-x-0"
                                                                                        >
                                                                                            Cast
                                                                                        </button>
                                                                                    )}
                                                                                    <div className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                                                        <span className="text-xs">▼</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* EXPANDED DETAILS */}
                                                                            {isExpanded && (
                                                                                <div className="px-4 pb-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                                                    {details && (
                                                                                        <div className="space-y-3">
                                                                                            {/* STATS BAR */}
                                                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                                                <div className="bg-gray-900/60 p-2 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-1">
                                                                                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Time</span>
                                                                                                    <span className="text-[10px] text-purple-300 font-bold">{details.casting_time}</span>
                                                                                                </div>
                                                                                                <div className="bg-gray-900/60 p-2 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-1">
                                                                                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Range</span>
                                                                                                    <span className="text-[10px] text-blue-300 font-bold">{details.range}</span>
                                                                                                </div>
                                                                                                <div className="bg-gray-900/60 p-2 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-1">
                                                                                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Comps</span>
                                                                                                    <span className="text-[10px] text-orange-300 font-bold">{details.components}</span>
                                                                                                </div>
                                                                                                <div className="bg-gray-900/60 p-2 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-1">
                                                                                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Duration</span>
                                                                                                    <span className="text-[10px] text-green-300 font-bold">{details.duration}</span>
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* DESCRIPTION */}
                                                                                            <div className="p-4 bg-gray-950/40 backdrop-blur-sm rounded-2xl border border-gray-800/80 shadow-inner group/desc relative overflow-hidden">
                                                                                                <div className="absolute top-0 right-0 p-4 bg-purple-500/5 blur-[40px] rounded-full -mr-8 -mt-8 grayscale group-hover/desc:grayscale-0 transition-all duration-700"></div>
                                                                                                <p className="text-xs text-gray-300 leading-relaxed relative whitespace-pre-wrap opacity-90">{details.desc_tr || details.desc}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* ACTIONS */}
                                                                                    {!isActiveCastTarget ? (
                                                                                        <div className="flex gap-2 pt-2">
                                                                                            <button
                                                                                                onClick={() => setCastingSpell(sp)}
                                                                                                disabled={canCast && details?.level_int > 0 && !hasValidSlotsForSpell && !isConc}
                                                                                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:grayscale text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20 active:scale-[0.98]"
                                                                                            >
                                                                                                Cast This Spell
                                                                                            </button>
                                                                                            {(() => {
                                                                                                const dice = extractDice(details?.desc_tr || details?.desc);
                                                                                                if (!dice) return null;
                                                                                                return (
                                                                                                    <button
                                                                                                        onClick={() => handleRoll(sp, dice, 'Büyü')}
                                                                                                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/20 rounded-xl font-black text-xs transition-all duration-300 active:scale-[0.98]"
                                                                                                    >
                                                                                                        🎲 Roll
                                                                                                    </button>
                                                                                                );
                                                                                            })()}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="bg-gray-900/60 backdrop-blur-md border border-purple-500/30 p-4 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200">
                                                                                            {isConc && concentrationSpell && concentrationSpell !== sp && (
                                                                                                <div className="bg-yellow-900/20 border border-yellow-500/30 px-3 py-2 rounded-xl flex items-center gap-2">
                                                                                                    <span className="text-sm">⚠️</span>
                                                                                                    <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-tight">Warning: <strong>{concentrationSpell}</strong> will end!</p>
                                                                                                </div>
                                                                                            )}

                                                                                            {canCast && details?.level_int > 0 ? (
                                                                                                <div className="space-y-3">
                                                                                                    <p className="text-purple-400/60 text-[10px] font-black uppercase tracking-widest text-center">Select Slot Level</p>
                                                                                                    <div className="flex gap-2 flex-wrap justify-center">
                                                                                                        {slotTotals.map((total, idx) => {
                                                                                                            if (total === 0) return null;
                                                                                                            const slotLv = idx + 1;
                                                                                                            if (slotLv < details.level_int) return null;
                                                                                                            const avail = total - (spellSlotsUsed[String(slotLv)] ?? 0);
                                                                                                            return (
                                                                                                                <button
                                                                                                                    key={slotLv}
                                                                                                                    onClick={() => useSlot(slotLv, sp, isConc)}
                                                                                                                    disabled={avail <= 0}
                                                                                                                    className={`min-w-[50px] py-2.5 rounded-xl text-xs font-black transition-all duration-300 border shadow-sm active:scale-95 ${avail > 0
                                                                                                                        ? 'bg-purple-600 border-purple-400 text-white hover:bg-purple-500 shadow-purple-900/20'
                                                                                                                        : 'bg-gray-800 border-gray-700 text-gray-600 grayscale cursor-not-allowed opacity-50'
                                                                                                                        }`}
                                                                                                                >
                                                                                                                    L{slotLv}
                                                                                                                    <div className="text-[8px] opacity-60">({avail})</div>
                                                                                                                </button>
                                                                                                            );
                                                                                                        })}
                                                                                                        <button
                                                                                                            onClick={() => setCastingSpell(null)}
                                                                                                            className="px-4 py-2.5 text-xs font-black text-gray-500 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-widest"
                                                                                                        >
                                                                                                            Cancel
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="flex gap-2">
                                                                                                    <button
                                                                                                        onClick={() => { setCastingSpell(null); showToast(`✨ ${sp}`, 'Kullanıldı!', 'bg-blue-900 border-blue-500 text-blue-100'); }}
                                                                                                        className="flex-1 py-3 bg-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-900/20 transition-all active:scale-95"
                                                                                                    >
                                                                                                        ✓ Confirm Cast
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => setCastingSpell(null)}
                                                                                                        className="px-6 py-3 text-xs font-black text-gray-500 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-widest"
                                                                                                    >
                                                                                                        Cancel
                                                                                                    </button>
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
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}
                    
                {/* ══════════ TAB: INVENTORY ══════════ */}
                {activeTab === "inventory" && (
                    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                            <input
                                                type="number"
                                                value={amount}
                                                min="0"
                                                onChange={(e) => setMoney(coin.key, parseInt(e.target.value) || 0)}
                                                className="w-full bg-transparent text-center text-2xl font-black text-white mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 rounded"
                                            />
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
                                                        {(item.type === 'armor' || item.type === 'weapon' || item.type === 'shield' || item.name?.toLowerCase().includes('shield') || (item.effects && item.effects.length > 0)) && (
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

                {/* ══════════ TAB: WORLD ══════════ */}
                {activeTab === "world" && (
                    <div className="pb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 blur-[100px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>
                            <div className="relative">
                                <hgroup className="flex flex-col gap-1">
                                    <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                                        <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">🌍</span> Dünya Bilgileri
                                    </h2>
                                    <p className="text-gray-400 text-sm font-medium opacity-80 max-w-2xl">DM tarafından paylaşılan aktif görevler, tanışılan gruplar ve seans notları.</p>
                                </hgroup>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Quests */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <h3 className="text-lg font-black text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                                        <span className="text-xl">📜</span> Görevler
                                    </h3>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">{quests.length} AKTİF</span>
                                </div>
                                <div className="space-y-4">
                                    {quests.length === 0 ? (
                                        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center group">
                                            <div className="w-16 h-16 bg-gray-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-2xl grayscale opacity-30 italic">?</span>
                                            </div>
                                            <p className="text-gray-500 italic font-medium">Henüz bir görev tanımlanmadı.</p>
                                        </div>
                                    ) : (
                                        quests.map((q: any) => (
                                            <div key={q._id} className={`group/quest relative bg-white/5 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 ${q.status === 'completed' ? 'opacity-50 grayscale border-white/5 scale-95 hover:grayscale-0 hover:opacity-100 hover:scale-100' : 'border-emerald-500/20 hover:border-emerald-500/40 shadow-lg shadow-emerald-900/5 hover:-translate-y-1'}`}>
                                                <div className="px-5 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover/quest:via-emerald-500/5 transition-all duration-1000"></div>
                                                    <span className="font-black text-white text-sm tracking-tight relative uppercase">{q.title}</span>
                                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest relative ${q.status === 'completed' ? 'bg-gray-800 text-gray-400' : 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                                                        {q.status === 'completed' ? 'TAMAMLANDI' : 'AKTİF'}
                                                    </span>
                                                </div>
                                                <div className="p-5 relative">
                                                    <p className="text-gray-300 text-xs leading-relaxed mb-4 font-medium opacity-80">{q.description}</p>
                                                    {q.rewards && (
                                                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
                                                            <span className="text-lg">🎁</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest opacity-60">Ödüller</span>
                                                                <span className="text-emerald-300 text-[11px] font-bold">{q.rewards}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Factions */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <h3 className="text-lg font-black text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                                        <span className="text-xl">🛡️</span> Gruplar & İtibarlar
                                    </h3>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">{factions.length} KEŞFEDİLDİ</span>
                                </div>
                                <div className="space-y-4">
                                    {factions.length === 0 ? (
                                        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center group">
                                            <div className="w-16 h-16 bg-gray-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-2xl grayscale opacity-30">🛡️</span>
                                            </div>
                                            <p className="text-gray-500 italic font-medium">Henüz bir grup keşfedilmedi.</p>
                                        </div>
                                    ) : (
                                        factions.map((f: any) => (
                                            <div key={f._id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 shadow-xl group/faction">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover/faction:scale-110 transition-transform duration-500">
                                                        <span className="text-xl">🛡️</span>
                                                    </div>
                                                    <h4 className="font-black text-white text-base uppercase tracking-tight">{f.name}</h4>
                                                </div>
                                                <p className="text-gray-400 text-[11px] leading-relaxed mb-4 italic font-medium opacity-70 group-hover/faction:opacity-100 transition-opacity">{f.description}</p>
                                                <div className="space-y-3">
                                                    {f.reputations?.map((rep: any) => (
                                                        <div key={rep.characterId} className="bg-gray-950/40 p-3 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rep.characterName}</span>
                                                                <span className={`text-[11px] font-black min-w-[20px] text-right ${rep.score >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                                                    {rep.score > 0 ? `+${rep.score}` : rep.score}
                                                                </span>
                                                            </div>
                                                            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                                <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 z-10"></div>
                                                                <div 
                                                                    className={`absolute inset-y-0 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)] ${rep.score >= 0 ? 'bg-gradient-to-r from-blue-600 to-blue-400 left-1/2 rounded-r-full' : 'bg-gradient-to-l from-red-600 to-red-400 right-1/2 rounded-l-full'}`} 
                                                                    style={{ width: `${Math.min(Math.abs(rep.score), 50)}%` }} 
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Session Notes */}
                            <div className="lg:col-span-2 space-y-6 pt-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <h3 className="text-lg font-black text-purple-400 flex items-center gap-2 uppercase tracking-widest">
                                        <span className="text-xl">📝</span> Seans Özetleri & Notlar
                                    </h3>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">{sessionNotes.length} GİRDİ</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sessionNotes.length === 0 ? (
                                        <div className="col-span-full bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-16 text-center group">
                                            <div className="w-16 h-16 bg-gray-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-2xl grayscale opacity-30">📝</span>
                                            </div>
                                            <p className="text-gray-500 italic font-medium">Henüz bir not paylaşılmadı.</p>
                                        </div>
                                    ) : (
                                        sessionNotes.map((n: any) => (
                                            <div key={n._id} className="group/note relative bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 shadow-xl overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 bg-purple-500/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover/note:bg-purple-500/10 transition-colors"></div>
                                                <div className="relative">
                                                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest">{n.authorName}</span>
                                                            <span className="text-[9px] text-gray-500 font-bold">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <span className="text-lg grayscale opacity-30 group-hover/note:grayscale-0 group-hover/note:opacity-100 transition-all duration-500">✍️</span>
                                                    </div>
                                                    <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap flex-1 font-medium opacity-80 group-hover/note:opacity-100 transition-opacity">{n.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ TAB: PARTY ══════════ */}
                {activeTab === "party" && (
                    <div className="pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl col-span-full mb-2">
                            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                                <span className="text-yellow-500">🛡️</span> Campaign Participants
                            </h2>
                            <p className="text-gray-400 text-sm">Whisper to other players in the room or view their status.</p>
                        </div>

                        {/* DM Card */}
                        <div className="bg-gray-900/60 rounded-2xl border-2 border-purple-900/50 p-5 flex flex-col gap-4 hover:border-purple-500/50 transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-purple-400 text-xl">Dungeon Master</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Game Master</p>
                                </div>
                                <span className="bg-purple-900 text-purple-100 text-[10px] font-black px-2 py-1 rounded uppercase">DM</span>
                            </div>
                            <button onClick={() => { setWhisperTarget("DM"); setIsWhisperModalOpen(true); }} className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-purple-900/20">
                                🤫 Whisper to DM
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
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Adventurer</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black text-gray-400">LV {stats.level || 1}</span>
                                            <div className="flex gap-1 mt-1">
                                                {stats.conditions && stats.conditions.map((c: string) => (
                                                    <span key={c} className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" title={c}></span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            <span>Hit Points (HP)</span>
                                            <span>{stats.currentHp || 0} / {stats.maxHp || 10}</span>
                                        </div>
                                        <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-700/50">
                                            <div className={`h-full transition-all duration-500 ${((stats.currentHp || 0) / (stats.maxHp || 1)) > 0.5 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.max(0, Math.min(100, ((stats.currentHp || 0) / (stats.maxHp || 1)) * 100))}%` }}></div>
                                        </div>
                                    </div>

                                    <button onClick={() => { setWhisperTarget(name); setIsWhisperModalOpen(true); }} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold rounded-xl transition text-sm">
                                        🤫 Whisper
                                    </button>
                                </div>
                            );
                        })}

                        {(!partyStats || Object.keys(partyStats).filter(name => name !== character?.name).length === 0) && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                                <p className="text-gray-500 font-bold italic">Waiting for other players...</p>
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
                                        <span className="text-4xl">🖼️</span> DM Gallery
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Shared images and resources</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={gallerySearch}
                                            onChange={e => setGallerySearch(e.target.value)}
                                            placeholder="Search..."
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
                                    { id: 'all', label: 'All', icon: '🌈' },
                                    { id: 'image', label: 'Images', icon: '🖼️' },
                                    { id: 'link', label: 'Links', icon: '🔗' }
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
                                                <p className="text-gray-400 font-bold">Nothing found.</p>
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
                                                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black text-white border border-white/20">ENLARGE</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-3">
                                                                <span className="text-4xl opacity-50">🔗</span>
                                                                <a href={m.url} target="_blank" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all">Open Link</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 bg-gray-900/40 backdrop-blur-sm border-t border-gray-700/30 flex-1">
                                                        <h4 className="text-gray-200 font-bold text-sm truncate mb-1">{m.name}</h4>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.type === 'image' ? 'Image' : 'Resource'}</span>
                                                            <span className="text-[10px] text-gray-600">{new Date(m.createdAt || Date.now()).toLocaleDateString('en-US')}</span>
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
                                <button onClick={() => { setImgZoom(1); setImgOffset({ x: 0, y: 0 }); }} className="hover:text-purple-400">RESET</button>
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
                                🖱️ Use scroll wheel to zoom
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
                                <button onClick={() => setToast({ show: false, title: '', message: '', color: '' })} className="text-lg opacity-70 hover:opacity-100 leading-none">✕</button>
                            </div>
                            <p className="text-sm opacity-90">{toast.message}</p>
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
                                You took a short break. Your abilities have refreshed. You can also spend Hit Dice to heal.
                            </p>

                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-5 flex flex-col items-center">
                                <span className="text-gray-400 text-xs font-bold uppercase mb-2">Hit Dice to Spend</span>
                                <div className="flex items-center gap-4 mb-2">
                                    <button onClick={() => setHitDiceToSpend(Math.max(0, hitDiceToSpend - 1))} className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 font-black text-xl text-white flex items-center justify-center">-</button>
                                    <div className="text-3xl font-black text-green-400">{hitDiceToSpend} <span className="text-sm text-gray-400 font-normal">/ {level - hitDiceUsed} Left</span></div>
                                    <button onClick={() => setHitDiceToSpend(Math.min(level - hitDiceUsed, hitDiceToSpend + 1))} className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 font-black text-xl text-white flex items-center justify-center">+</button>
                                </div>
                                {(() => {
                                    const mainLv = character.level - mcs.reduce((acc: number, mc: any) => acc + (mc.level || 1), 0);
                                    const diceMap = new Map<string, number>();
                                    const addDice = (hd: string, lv: number) => diceMap.set(hd, (diceMap.get(hd) || 0) + lv);
                                    
                                    addDice(character.classRef?.hit_die || 'd8', mainLv);
                                    mcs.forEach((mc: any) => {
                                        const hd = allClasses.find((c: any) => c._id === (mc.classRef?._id || mc.classRef) || c.name === mc.className)?.hit_die || 'd8';
                                        addDice(hd, mc.level || 1);
                                    });
                                    let desc: string[] = [];
                                    Array.from(diceMap.entries()).forEach(([hd, count]) => {
                                        desc.push(`${count}${hd}`);
                                    });
                                    return (
                                        <div className="text-center">
                                            <p className="text-pink-300 text-[10px] font-bold uppercase mb-1">Available Dice: {desc.join(' + ')}</p>
                                            <p className="text-gray-500 text-xs">Each die restores <span className="font-bold text-gray-300">1 die + {mod(character.stats?.CON ?? 10, 'CON')}</span> HP on average.</p>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => { handleShortRest(); setShowHitDiceModal(false); }} className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg border border-green-500 shadow-sm transition">
                                    Finish Rest
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
                                        🎉 Level {lvModal.newLv}!
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        {lvModal.step === "preview" && "Review your gains"}
                                        {lvModal.step === "subclass" && "Choose your subclass"}
                                        {lvModal.step === "asi" && "Ability Score Improvement or Feat"}
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
                                            <p className="font-black text-green-400 text-lg">+{lvModal.hpGained} Maximum HP</p>
                                            <p className="text-gray-400 text-sm">{character.maxHp} → {character.maxHp + lvModal.hpGained}</p>
                                        </div>
                                    </div>

                                    {/* Proficiency Bonus */}
                                    <div className="bg-orange-900/20 border border-orange-700/40 rounded-xl p-4 flex items-center gap-4">
                                        <span className="text-4xl">✦</span>
                                        <div>
                                            <p className="font-black text-orange-400 text-lg">Proficiency Bonus: +{profBonus(lvModal.newLv)}</p>
                                            <p className="text-gray-400 text-sm">Level {lvModal.newLv} proficiency bonus</p>
                                        </div>
                                    </div>

                                    {/* ASI Notice */}
                                    {lvModal.needASI && (
                                        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 flex items-center gap-4">
                                            <span className="text-4xl">⬆️</span>
                                            <div>
                                                <p className="font-black text-blue-400 text-lg">Ability Score Improvement</p>
                                                <p className="text-gray-400 text-sm">You can increase an ability score or choose a Feat at this level.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Subclass Notice */}
                                    {lvModal.needSubclass && (
                                        <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 flex items-center gap-4">
                                            <span className="text-4xl">✨</span>
                                            <div>
                                                <p className="font-black text-purple-400 text-lg">Subclass Selection</p>
                                                <p className="text-gray-400 text-sm">Choose a specialization for your {character.classRef?.name} class.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Class Features */}
                                    {lvModal.classFeats.length > 0 && (
                                        <div>
                                            <h3 className="font-black text-white text-sm uppercase tracking-wide mb-2">⚔️ Class Features</h3>
                                            <div className="space-y-2">
                                                {lvModal.classFeats.map((f: any, i: number) => (
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
                                                {lvModal.subFeats.map((f: any, i: number) => (
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
                            {lvModal.step === "subclass" && (() => {
                                const lvClassData = lvModal.mcAction === 'add' 
                                    ? allClasses.find((c: any) => c._id === lvModal.mcData.pickedClassId)
                                    : lvModal.mcAction === 'levelup'
                                    ? allClasses.find((c: any) => c.name === character.multiclasses[lvModal.mcData.mcIndex].className)
                                    : character?.classRef;
                                return lvClassData?.subclasses ? (
                                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                    {lvClassData.subclasses.map((sub: any, idx: number) => (
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
                                ) : null;
                            })()}

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
                                                                <div className="text-xs text-gray-500 mb-2">{mod(v, s) >= 0 ? '+' : ''}{mod(v, s)}</div>
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
                                                placeholder="Search Feats..."
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
                                    Cancel
                                </button>
                                <button
                                    onClick={advanceLvModal}
                                    disabled={!canAdvance() || isLevelingUp}
                                    className="px-8 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-yellow-950 font-black rounded-xl transition text-sm">
                                    {isLevelingUp ? 'Processing...' : (
                                        lvModal.step === "preview" && (lvModal.needSubclass || lvModal.needASI) ? 'Continue →' :
                                            lvModal.step === "subclass" && lvModal.needASI ? 'Continue: ASI/Feat →' :
                                                'Level Up! 🎉'
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
                            <h2 className="text-3xl font-black text-red-500 mb-2 uppercase">Whoa, slow down!</h2>
                            <p className="text-gray-300 font-bold mb-4">You need the DM's permission to change your level.</p>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 mb-6 italic text-sm text-gray-400">
                                "Power doesn't come for free; until the Dungeon Master clicks 'Grant', it's just a dream."
                            </div>
                            <button onClick={() => setShowDmPopup(false)} className="w-full px-4 py-3 bg-red-700 hover:bg-red-600 font-black text-white rounded-xl transition shadow-lg">
                                Ask for Mercy and Close
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
                                    <span className="text-3xl">🏬</span> Traveling Merchant
                                </h2>
                                <button onClick={() => setShopData({ ...shopData, isOpen: false })} className="text-gray-400 hover:text-white bg-gray-800 w-8 h-8 rounded-full flex justify-center items-center font-bold">✕</button>
                            </div>

                            <div className="flex justify-between text-sm bg-gray-800 p-3 rounded-xl border border-gray-700 mb-4 items-center gap-4">
                                <span className="text-gray-400 font-bold">Current Balance:</span>
                                <span className="text-yellow-400 font-black text-xl bg-yellow-900/30 px-3 py-1 rounded shadow-inner border border-yellow-700/50">{character?.money?.gp || 0} GP</span>
                            </div>

                            <div className="overflow-y-auto max-h-[400px] flex-1 pr-2 space-y-3">
                                {shopData.items.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8 italic font-bold">The merchant's stall is currently empty.</p>
                                ) : (
                                    shopData.items.map(item => (
                                        <div key={item.id} className="bg-gray-800/80 border border-gray-700 p-4 rounded-xl flex items-center justify-between hover:bg-gray-750 transition-colors group">
                                            <div className="flex-1 pr-4">
                                                <div className="font-bold text-gray-100 text-lg">{item.name}</div>
                                                {item.note && <div className="text-gray-400 text-xs mt-1 italic">{item.note}</div>}
                                            </div>
                                            <button
                                                onClick={() => setBuyShopItem(item)}
                                                className="bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-black px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 shadow-md group-hover:shadow-[0_0_15px_rgba(234,88,12,0.4)] whitespace-nowrap"
                                            >
                                                <span className="text-sm">Buy Item</span>
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
                                    <span className="text-3xl">🌙</span> Long Rest
                                </h2>
                                <button onClick={() => setShowLongRestModal(false)} className="text-gray-400 hover:text-white bg-gray-800 w-8 h-8 rounded-full flex justify-center items-center font-bold">✕</button>
                            </div>

                            <p className="text-gray-300 text-sm mb-4 leading-relaxed mt-2">
                                Wizards (Level 3+) can swap one cantrip they know for another from the Wizard spell list during a long rest. Leave blank if you don't wish to swap.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cantrip to Forget</label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                        value={cantripToReplace}
                                        onChange={e => setCantripToReplace(e.target.value)}
                                    >
                                        <option value="">-- No changes --</option>
                                        {(character?.spells || []).map((sName: string) => {
                                            const details = spellDetails[sName];
                                            return details && details.level === "Cantrip" ? <option key={sName} value={sName}>{sName}</option> : null;
                                        })}
                                    </select>
                                </div>

                                {cantripToReplace && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">New Cantrip</label>
                                        <select
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                            value={newWizardCantrip}
                                            onChange={e => setNewWizardCantrip(e.target.value)}
                                        >
                                            <option value="">-- Select --</option>
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
                                Finish Long Rest
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
                                <span>🤫</span> {whisperTarget === 'DM' ? "Whisper to DM" : `Whisper to ${whisperTarget}`}
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">Only {whisperTarget === 'DM' ? "the Dungeon Master" : whisperTarget} will be able to see this message.</p>

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
                                                    {w.senderName === character?.name ? 'YOU' : w.senderName}
                                                </span>
                                                <span className="text-[9px] text-gray-500 opacity-50">{w.createdAt ? new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                            </div>
                                            <p className="text-gray-200 text-xs leading-relaxed">{w.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-10">
                                        <span className="text-4xl mb-2">🤫</span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Whisper silently...</p>
                                    </div>
                                )}
                                <div ref={chatEndRef as any} />
                            </div>

                            <textarea
                                value={whisperMessage}
                                onChange={e => setWhisperMessage(e.target.value)}
                                placeholder="Your secret message..."
                                className="w-full h-24 p-4 bg-gray-950 border border-gray-700 rounded-xl text-purple-100 resize-none focus:outline-none focus:border-purple-500 transition-colors mb-4 text-sm"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setIsWhisperModalOpen(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition">Cancel</button>
                                <button onClick={sendWhisper} disabled={!whisperMessage.trim()} className="flex-[2] py-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-black rounded-xl transition shadow-lg shadow-purple-900/30">Send Message</button>
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
                                    <span className="text-4xl">🗺️</span> Strategic Map
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">{mapData.tokens.length} Tokens active • {Math.round(mapZoom * 100)}% Zoom</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-800/80 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-4 border border-white/10 text-white font-black text-xs">
                                    <button onClick={() => setMapZoom(prev => Math.max(0.2, prev - 0.1))} className="hover:text-purple-400">➖</button>
                                    <span className="w-12 text-center">% {Math.round(mapZoom * 100)}</span>
                                    <button onClick={() => setMapZoom(prev => Math.min(3, prev + 0.1))} className="hover:text-purple-400">➕</button>
                                    <div className="w-px h-4 bg-gray-600 mx-1"></div>
                                    <button onClick={() => { setMapZoom(1); setMapOffset({ x: 0, y: 0 }); }} className="hover:text-purple-400">RESET</button>
                                </div>
                                <button onClick={() => setIsMapOpen(false)} className="bg-red-700 hover:bg-red-600 text-white w-12 h-12 rounded-xl font-black flex items-center justify-center shadow-lg transition-all text-2xl">✕</button>
                            </div>
                        </div>

                        <div className="flex-1 flex gap-6 overflow-hidden">
                            {/* Token Legend (Left Sidebar) */}
                            <div className="w-64 bg-gray-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 flex flex-col hidden lg:flex shadow-2xl">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Token List</h3>
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
                                                <p className="text-[10px] text-gray-500 uppercase">{token.type === 'player' ? 'Player' : 'Creature'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {mapData.tokens.length === 0 && <p className="text-gray-600 text-xs text-center py-10 italic">No tokens yet.</p>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-xl text-[10px] text-purple-300 leading-tight">
                                        💡 You can drag and move tokens, or pan the map by dragging from an empty area.
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
                                            alt="Map"
                                            draggable={false}
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

                                    {/* Fog of War Overlays (Player View) */}
                                    {(fogOfWar as string[]).map(coord => {
                                        const [gx, gy] = coord.split(',').map(Number);
                                        return (
                                            <div 
                                                key={coord}
                                                className="absolute bg-gray-950 transition-opacity duration-300"
                                                style={{
                                                    left: gx * mapData.gridSize,
                                                    top: gy * mapData.gridSize,
                                                    width: mapData.gridSize,
                                                    height: mapData.gridSize,
                                                    zIndex: 15
                                                }}
                                            />
                                        );
                                    })}

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
                                                {token.name} {token.entityId === character?._id ? ' (You)' : ''}
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
                                            <p className="text-2xl font-black text-white tracking-widest uppercase">Searching for Map...</p>
                                            <p className="text-gray-400 mt-2">Dungeon Master has not uploaded a battleground yet.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* ══ CUSTOM RESOURCE MODAL ══ */}
            {
                showCustomResourceModal && (
                    <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-orange-800/50 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-black text-orange-400 mb-4">New Custom Resource</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Resource Name</label>
                                    <input type="text" value={newResourceName} onChange={e => setNewResourceName(e.target.value)}
                                        placeholder="e.g. Sorcery Points, Superiority Die..." className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Max Uses</label>
                                        <input type="number" value={newResourceMax} onChange={e => setNewResourceMax(parseInt(e.target.value) || 1)}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Recharge</label>
                                        <select value={newResourceRecharge} onChange={e => setNewResourceRecharge(e.target.value as any)}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none">
                                            <option value="long">Long Rest</option>
                                            <option value="short">Short/Long Rest</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Description</label>
                                    <textarea value={newResourceDesc} onChange={e => setNewResourceDesc(e.target.value)}
                                        placeholder="Briefly describe what the feature does..." className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white h-24 resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowCustomResourceModal(false)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-lg transition border border-gray-700">Cancel</button>
                                <button onClick={addCustomResource} disabled={!newResourceName.trim()} className="flex-1 py-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-40 text-white font-black rounded-lg transition border border-orange-500 shadow-lg">Add</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* ── SPELL SELECTION MODAL ── */}
            {showSpellPicker && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 transition-all animate-fade-in" onClick={() => { setShowSpellPicker(false); setSpellSearch(""); setSpellLevelFilter("all"); setSpellSchoolFilter("all"); setSpellTypeFilter("all"); }}>
                    <div className="bg-gray-900 border border-purple-500/30 rounded-3xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.15)] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-purple-900/40 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-purple-600/20">✨</div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-wider leading-none">Manage Spells</h2>
                                        <p className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">Sync spells for all your classes</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-1 max-w-2xl w-full gap-2">
                                    <div className="relative flex-1 group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors">🔍</span>
                                        <input 
                                            type="text" 
                                            placeholder="Search spells..." 
                                            value={spellSearch}
                                            onChange={(e) => setSpellSearch(e.target.value)}
                                            className="w-full bg-gray-950/50 border border-purple-500/20 focus:border-purple-500/60 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-purple-900/50 font-bold outline-none transition-all focus:bg-gray-950"
                                        />
                                    </div>
                                    <select 
                                        className="bg-gray-950/50 border border-purple-500/20 focus:border-purple-500/60 rounded-2xl px-4 py-3 text-sm text-purple-300 font-bold outline-none transition-all cursor-pointer hover:bg-gray-950"
                                        value={spellLevelFilter}
                                        onChange={(e) => setSpellLevelFilter(e.target.value)}
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="0">Cantrips</option>
                                        <option value="1">Level 1</option>
                                        <option value="2">Level 2</option>
                                        <option value="3">Level 3</option>
                                        <option value="4">Level 4</option>
                                        <option value="5">Level 5</option>
                                        <option value="6">Level 6</option>
                                        <option value="7">Level 7</option>
                                        <option value="8">Level 8</option>
                                        <option value="9">Level 9</option>
                                    </select>
                                    <select 
                                        className="bg-gray-950/50 border border-purple-500/20 focus:border-purple-500/60 rounded-2xl px-4 py-3 text-sm text-purple-300 font-bold outline-none transition-all cursor-pointer hover:bg-gray-950"
                                        value={spellSchoolFilter}
                                        onChange={(e) => setSpellSchoolFilter(e.target.value)}
                                    >
                                        {SCHOOLS.map(s => <option key={s} value={s}>{s === "all" ? "School: All" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>

                                <button onClick={() => { setShowSpellPicker(false); setSpellSearch(""); setSpellLevelFilter("all"); setSpellSchoolFilter("all"); setSpellTypeFilter("all"); }} className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-red-600/20 hover:text-red-400 text-gray-400 flex items-center justify-center transition-all border border-gray-700 hover:border-red-500/50">✕</button>
                            </div>

                            <div className="flex flex-wrap gap-2 w-full max-w-2xl px-4 py-2 bg-black/20 rounded-2xl border border-white/5">
                                <span className="text-[9px] text-purple-500 font-black uppercase tracking-widest self-center mr-2">Categories:</span>
                                {SPELL_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSpellTypeFilter(type)}
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${spellTypeFilter === type
                                            ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                            : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-purple-500/50'
                                            }`}
                                    >
                                        {type === 'all' ? 'ALL' : type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-8 space-y-8 bg-gray-950/20 custom-scrollbar">
                            {(() => {
                                if (!character) return null;
                                const charClasses = [
                                    character.classRef?.name,
                                    ...(character.multiclasses || []).map((mc: any) => mc.className)
                                ].filter(Boolean);
                                
                                const filteredByClass = allSpells.filter(sp => {
                                    if (!sp.classes || !Array.isArray(sp.classes)) return false;
                                    const normalizedCharClasses = charClasses.map(c => String(c).toLowerCase());
                                    return sp.classes.some((c: string) => normalizedCharClasses.includes(c.toLowerCase()));
                                });

                                const filteredBySearch = filteredByClass.filter(sp => {
                                    const nameMatch = sp.name.toLowerCase().includes(spellSearch.toLowerCase());
                                    const trMatch = (sp.name_tr || "").toLowerCase().includes(spellSearch.toLowerCase());
                                    const levelMatch = spellLevelFilter === "all" || String(sp.level_int ?? 0) === spellLevelFilter;
                                    const matchSchool = spellSchoolFilter === "all" || (sp.school || "").toLowerCase() === spellSchoolFilter.toLowerCase();
                                    const tags = getSpellTags(sp);
                                    const matchType = spellTypeFilter === "all" || tags.includes(spellTypeFilter);
                                    return (nameMatch || trMatch) && levelMatch && matchSchool && matchType;
                                });
                                
                                const grouped: Record<string, any[]> = {};
                                const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                                levels.forEach(lv => grouped[lv] = []);
                                
                                filteredBySearch.forEach(sp => {
                                    const lv = sp.level_int ?? 0;
                                    if (grouped[lv]) grouped[lv].push(sp);
                                });
                                
                                let hasResults = false;
                                const content = levels.map(lv => {
                                    if (grouped[lv].length === 0) return null;
                                    hasResults = true;
                                    return (
                                        <div key={lv} className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] whitespace-nowrap">
                                                    {lv === 0 ? "Cantrips" : `Level ${lv} Spells`}
                                                </h3>
                                                <div className="h-px bg-gradient-to-r from-orange-500/30 to-transparent flex-1"></div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                {grouped[lv].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((sp: any) => {
                                                    const isKnown = (character.spells || []).includes(sp.name);
                                                    return (
                                                        <button
                                                            key={sp._id || sp.name}
                                                            onClick={() => toggleSpell(sp.name)}
                                                            className={`p-4 rounded-2xl border text-left transition-all duration-300 group relative overflow-hidden ${
                                                                isKnown 
                                                                ? 'bg-purple-600/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                                                                : 'bg-gray-800/20 border-gray-700/50 hover:bg-gray-800 hover:border-purple-500/40 hover:scale-[1.02]'
                                                            }`}
                                                        >
                                                            {isKnown && <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500 opacity-5 -mr-8 -mt-8 rotate-45"></div>}
                                                            <div className="flex items-center justify-between gap-3 relative z-10">
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className={`text-xs font-black uppercase tracking-tight truncate ${isKnown ? 'text-purple-300' : 'text-gray-300 group-hover:text-white'}`}>
                                                                        {sp.name_tr || sp.name}
                                                                    </span>
                                                                    {sp.name_tr && <span className="text-[10px] text-gray-500 font-bold truncate opacity-60 italic">{sp.name}</span>}
                                                                </div>
                                                                {isKnown ? (
                                                                    <div className="shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs shadow-lg shadow-purple-500/40">✓</div>
                                                                ) : (
                                                                    <div className="shrink-0 w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center text-gray-500 text-xs transition-colors group-hover:border-purple-500 group-hover:text-purple-400">+</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                });

                                if (!hasResults) {
                                    return (
                                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                                            <div className="text-8xl mb-6">🔮</div>
                                            <p className="text-xl font-black uppercase tracking-widest text-center">No spells found</p>
                                            <p className="text-xs text-gray-400 mt-2 font-bold uppercase">Change search term or filters</p>
                                        </div>
                                    );
                                }
                                return content;
                            })()}
                        </div>
                        
                        <div className="p-8 border-t border-white/5 bg-gray-950 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60">Library Size</span>
                                    <span className="text-sm font-black text-purple-400">{allSpells.length} Spells</span>
                                </div>
                                <div className="w-px h-8 bg-gray-800"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60">Selected</span>
                                    <span className="text-sm font-black text-green-400">{character?.spells?.length || 0} Known</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowSpellPicker(false); setSpellSearch(""); setSpellLevelFilter("all"); setSpellSchoolFilter("all"); setSpellTypeFilter("all"); }} 
                                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-purple-900/40 hover:scale-[1.05] active:scale-95"
                            >
                                Done & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerSheet;
