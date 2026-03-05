"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ASI_LEVELS, CLASS_FEATURES } from "../levelup_data";
import { getSpellSlotTotals, isSpellcaster } from "../combat_data";
import { ALL_FEATS, ALL_METAMAGICS } from "../feats_data";
import { ALL_BACKGROUNDS } from "../background_data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SpellCard = ({ spell, isCantrip, limits, isSelected, limitReached, schoolColors = SCHOOL_COLORS, getSpellTags: getTags = getSpellTags, toggleCantrip, toggleLeveledSpell }: any) => {
    const [expanded, setExpanded] = useState(false);
    const schoolClass = schoolColors[spell.school] ?? 'bg-gray-100 text-gray-600 border-gray-300';
    return (
        <div className="flex flex-col h-full">
            <div
                onClick={() => !limitReached && (isCantrip ? toggleCantrip(spell.name) : toggleLeveledSpell(spell.name))}
                className={`p-3 rounded-t-lg border-2 transition-all flex-grow ${limitReached ? 'opacity-30 cursor-not-allowed border-gray-200 bg-gray-50' :
                    isSelected ? 'border-blue-500 bg-blue-50 shadow-[0_0_8px_rgba(59,130,246,0.25)] cursor-pointer' :
                        'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'
                    }`}
            >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                    <p className="font-bold text-gray-900 text-sm leading-tight">{spell.name}</p>
                    {isSelected && <span className="text-blue-600 text-base shrink-0 font-black">✓</span>}
                </div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${schoolClass}`}>{spell.school}</span>
                    {spell.concentration && <span className="text-[10px] px-1.5 py-0.5 rounded border bg-purple-50 text-purple-600 border-purple-300">Konsantrasyon</span>}
                    {spell.ritual && <span className="text-[10px] px-1.5 py-0.5 rounded border bg-amber-50 text-amber-600 border-amber-300">Ritual</span>}
                </div>
                <p className={`text-gray-600 text-xs leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>{spell.desc}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-gray-500 font-medium border-t border-gray-100 pt-1.5">
                    <span>⏱ {spell.time}</span>
                    <span>📏 {spell.range}</span>
                    {spell.components && <span>🔮 {spell.components}</span>}
                    <div className="ml-auto flex gap-1">
                        {getTags(spell).map((tag: string) => (
                            <span key={tag} className="bg-gray-100 px-1 rounded text-[8px] text-gray-400">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="text-[10px] text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 py-1 rounded-b-lg border-x-2 border-b-2 border-blue-100 transition-colors font-bold uppercase tracking-widest"
            >
                {expanded ? "KÜÇÜLT ▲" : "DETAYLARI GÖR ▼"}
            </button>
        </div>
    );
};

const SCHOOL_COLORS: Record<string, string> = {
    evocation: 'bg-red-100 text-red-700 border-red-300',
    conjuration: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    illusion: 'bg-purple-100 text-purple-700 border-purple-300',
    divination: 'bg-blue-100 text-blue-700 border-blue-300',
    abjuration: 'bg-green-100 text-green-700 border-green-300',
    enchantment: 'bg-pink-100 text-pink-700 border-pink-300',
    necromancy: 'bg-gray-200 text-gray-700 border-gray-400',
    transmutation: 'bg-orange-100 text-orange-700 border-orange-300',
};

const getSpellTags = (spell: any) => {
    const tags: string[] = [];
    const desc = (spell.desc || "").toLowerCase();
    const school = (spell.school || "").toLowerCase();

    // Damage
    if (desc.includes("damage") || desc.includes("hasar") || desc.includes("hit") || desc.includes("attack") ||
        /\d+d\d+/.test(desc) || school === "evocation") {
        tags.push("Damage");
    }
    // Control
    if (desc.includes("frightened") || desc.includes("charmed") || desc.includes("restrained") ||
        desc.includes("paralyzed") || desc.includes("stunned") || desc.includes("incapacitated") ||
        desc.includes("prone") || desc.includes("blinded") || desc.includes("deafened") ||
        desc.includes("difficult terrain") || desc.includes("slow") ||
        desc.includes("korkmuş") || desc.includes("büyülenmiş") || desc.includes("engellenmiş")) {
        tags.push("Control");
    }
    // Support
    if (desc.includes("heal") || desc.includes("restore") || desc.includes("temporary hp") ||
        desc.includes("bonus") || desc.includes("advantage") || desc.includes("bless") ||
        desc.includes("iyileştir") || desc.includes("can ver") || desc.includes("avantaj")) {
        tags.push("Support");
    }
    // Defense
    if (desc.includes("ac ") || desc.includes("shield") || desc.includes("resistance") ||
        desc.includes("immune") || desc.includes("absorb") || desc.includes("kalkan") ||
        desc.includes("direnç") || desc.includes("bağışıklık") || school === "abjuration") {
        tags.push("Defense");
    }
    // Utility
    if (desc.includes("detect") || desc.includes("identify") || desc.includes("teleport") ||
        desc.includes("create") || desc.includes("scry") || desc.includes("invisible") ||
        desc.includes("fly") || desc.includes("breathe") || school === "divination" || school === "transmutation") {
        tags.push("Utility");
    }

    return tags.length > 0 ? tags : ["Utility"];
};

const FeatSpellSelectionArea = ({ featName, requirements, selections, onUpdate, token, isRaceFeat = false }: any) => {
    const [libSpells, setLibSpells] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [openSlotIdx, setOpenSlotIdx] = useState<number | null>(null);

    useEffect(() => {
        const fetchNeededSpells = async () => {
            setLoading(true);
            try {
                // Fetch all level 0 and 1 spells to cover most feats
                const res = await axios.get(`${API_URL}/api/spells?max_level=1`, { headers: { 'Authorization': `Bearer ${token}` } });
                setLibSpells(res.data);
            } catch (err) {
                console.error("Feat spells fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNeededSpells();
    }, []);

    const toggleSpell = (spellName: string, slotIdx: number) => {
        const newSels = [...selections];
        newSels[slotIdx] = spellName;
        onUpdate(newSels);
        setOpenSlotIdx(null);
    };

    const borderColor = isRaceFeat ? 'border-rose-700/50' : 'border-yellow-700/50';
    const textColor = isRaceFeat ? 'text-rose-400' : 'text-yellow-400';

    return (
        <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{requirements.label}</p>
            <div className="grid grid-cols-1 gap-2">
                {requirements.slots.map((slot: any, idx: number) => {
                    const currentSpell = selections[idx];
                    const spellData = libSpells.find(s => s.name === currentSpell);

                    // Filtering for this slot
                    const filtered = libSpells.filter(s => {
                        if (slot.type === 'cantrip' && s.level_int !== 0) return false;
                        if (slot.type === 'leveled' && s.level_int !== slot.level) return false;
                        if (slot.school && !slot.school.includes(s.school.toLowerCase())) return false;
                        if (slot.hasAttack) {
                            const desc = (s.desc || "").toLowerCase();
                            if (!desc.includes("attack roll") && !desc.includes("saldırı zarı")) return false;
                        }
                        if (requirements.classes && !requirements.classes.some((c: string) => (s.class || "").includes(c))) return false;
                        return true;
                    });

                    return (
                        <div key={idx} className="relative">
                            <button
                                onClick={() => setOpenSlotIdx(openSlotIdx === idx ? null : idx)}
                                className={`w-full flex items-center justify-between p-2 bg-gray-950 border rounded-lg text-xs font-bold transition-all ${borderColor} ${currentSpell ? textColor : 'text-gray-500'}`}
                            >
                                <span>{slot.label}: {currentSpell || 'Seçilmedi'}</span>
                                <span>{openSlotIdx === idx ? '▲' : '▼'}</span>
                            </button>

                            {openSlotIdx === idx && (
                                <div className="absolute z-[100] left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-2 space-y-1">
                                    {loading ? (
                                        <p className="text-gray-500 text-xs p-2">Yükleniyor...</p>
                                    ) : filtered.length === 0 ? (
                                        <p className="text-gray-500 text-xs p-2">Uygun büyü bulunamadı.</p>
                                    ) : (
                                        filtered.map(s => (
                                            <div
                                                key={s.name}
                                                onClick={() => toggleSpell(s.name, idx)}
                                                className={`p-2 rounded hover:bg-gray-800 cursor-pointer text-xs flex justify-between items-center ${currentSpell === s.name ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                                            >
                                                <span>{s.name}</span>
                                                <span className="text-[10px] opacity-50">{s.school}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {requirements.autoSpells && (
                <div className="flex flex-wrap gap-1">
                    {requirements.autoSpells.map((s: string) => (
                        <span key={s} className="text-[9px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800/50">Auto: {s}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

const FeatStatSelectionArea = ({ featName, requirements, selection, onUpdate, isRaceFeat = false }: any) => {
    const borderColor = isRaceFeat ? 'border-rose-700/50' : 'border-yellow-700/50';
    const textColor = isRaceFeat ? 'text-rose-400' : 'text-yellow-400';

    return (
        <div className="space-y-2 mt-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Yetenek Puanı Artışı (+1)</p>
            <div className="flex flex-wrap gap-2">
                {requirements.statChoices?.map((stat: string) => (
                    <button
                        key={stat}
                        onClick={() => onUpdate(stat)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${selection === stat ? `bg-gray-950 ${borderColor} ${textColor}` : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                    >
                        {stat}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function CharacterCreator() {
    const { campaignId } = useParams();
    const router = useRouter();
    const { user, token, loading: authLoading } = useAuth();
    const [hasMounted, setHasMounted] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading]);

    const [isNpc, setIsNpc] = useState(false);
    const [step, setStep] = useState(1);
    const [chartClass, setChartClass] = useState<any>(null); // level chart popup
    const [races, setRaces] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [castingSpell, setCastingSpell] = useState<string | null>(null);

    // Race UI Tabs
    const [activeRaceTab, setActiveRaceTab] = useState<"Temel" | "Egzotik" | "Soylar">("Temel");
    const CORE_RACES = ["Dwarf", "Elf", "Halfling", "Human", "Variant Human", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"];
    const EXOTIC_RACES = ["Aasimar", "Tabaxi", "Genasi", "Goliath", "Satyr", "Kenku", "Changeling", "Plasmoid", "Goblin"];
    const LINEAGES = ["Dhampir", "Reborn", "Hexblood"];

    // ASI & FEATS STATE
    const [asiSelections, setAsiSelections] = useState<Array<{ type: 'stat2' | 'stat11' | 'feat', stat1?: string, stat2?: string, featName?: string }>>([]);
    const [showFeatPicker, setShowFeatPicker] = useState<number | null>(null); // idx of ASI slot
    const [featSearch, setFeatSearch] = useState('');
    const [featCategoryFilter, setFeatCategoryFilter] = useState<string>('All');
    const [expandedFeat, setExpandedFeat] = useState<string | null>(null);

    // Spell State
    const [availableSpells, setAvailableSpells] = useState<any[]>([]);
    const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
    const [selectedLeveledSpells, setSelectedLeveledSpells] = useState<string[]>([]);
    const [spellSearch, setSpellSearch] = useState("");
    const [spellLevelFilter, setSpellLevelFilter] = useState<number | "all">("all");
    const [spellSchoolFilter, setSpellSchoolFilter] = useState("all");
    const [spellTypeFilter, setSpellTypeFilter] = useState("all");
    const [loadingSpells, setLoadingSpells] = useState(false);
    const SCHOOLS = ["all", "abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];
    const SPELL_TYPES = ["all", "Damage", "Control", "Support", "Utility", "Defense"];
    const SPELLCASTING_CLASSES = ["Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard", "Artificer"];
    // Martial secimler
    const [selectedFightingStyle, setSelectedFightingStyle] = useState("");
    const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
    const [selectedSkillProfs, setSelectedSkillProfs] = useState<string[]>([]);
    // ── Race/Class/Subclass bonus selections ─────────────────────────────────
    const [raceBonusFeat, setRaceBonusFeat] = useState<number | null>(null);   // modal idx for race feat picker
    const [raceExtraSkills, setRaceExtraSkills] = useState<string[]>([]);       // Half-Elf +2 skills
    const [bardExpertise, setBardExpertise] = useState<string[]>([]);           // Bard expertise picks
    const [warlockInvocations, setWarlockInvocations] = useState<string[]>([]); // Warlock invocations (2+)
    const [warlockPact, setWarlockPact] = useState("");                         // Warlock pact boon
    const [bmManeuvers, setBmManeuvers] = useState<string[]>([]);               // Battle Master maneuvers
    const [bmShowPicker, setBmShowPicker] = useState(false);
    const [championExtraStyle, setChampionExtraStyle] = useState("");           // Champion lvl10 2nd style
    const [raceFeatStore, setRaceFeatStore] = useState<{ [slot: number]: string }>({}); // race free feats by slot
    const [raceStatPicks, setRaceStatPicks] = useState<Record<string, string>>({}); // Any stat picks from race/subrace
    const [featSpellSelections, setFeatSpellSelections] = useState<Record<string, string[]>>({}); // Spells selected via feats: { 'Fey Touched': ['Hex'], 'Magic Initiate': ['Light', 'Mage Hand', 'Shield'] }
    const [featStatSelections, setFeatStatSelections] = useState<Record<string, string>>({}); // Stat picks from feats: { 'Fey Touched': 'INT' }
    const getRaceFeatCount = (race: any) => {
        if (!race) return 0;
        if (race.name?.includes('Variant Human') || race.name?.includes('Custom Lineage')) return 1;
        if (race.traits?.some((t: any) => t.name.toLowerCase().includes('bonus feat') || t.name.toLowerCase().includes('free feat'))) return 1;
        return 0;
    };
    // Half-Elf → +2 skills
    const RACE_EXTRA_SKILLS: Record<string, number> = {
        'Half-Elf': 2,
        'Variant Human': 1,
        'Changeling': 2,
        'Kenku': 2
    };
    const FIGHTING_STYLES: Record<string, { name: string, desc: string }[]> = {
        Fighter: [
            { name: "Archery", desc: "+2 bonus to attack rolls with ranged weapons." },
            { name: "Defense", desc: "+1 bonus to AC while wearing armor." },
            { name: "Dueling", desc: "+2 damage with a one-handed weapon (no other weapon in hand)." },
            { name: "Great Weapon Fighting", desc: "Reroll 1s and 2s on damage dice with two-handed weapons." },
            { name: "Protection", desc: "Impose disadvantage on an attack against an ally when you use your reaction (requires shield)." },
            { name: "Two-Weapon Fighting", desc: "Add ability modifier to off-hand attack damage." },
            { name: "Blind Fighting", desc: "Blindsight 10 ft — see invisible/hidden creatures within 10 ft." },
            { name: "Interception", desc: "Reduce damage to a nearby creature by 1d10 + proficiency as a reaction." },
            { name: "Superior Technique", desc: "Learn 1 Battle Master maneuver and gain 1 superiority die (d6)." },
            { name: "Thrown Weapon Fighting", desc: "+2 damage with thrown weapons; draw thrown weapons as part of the attack." },
            { name: "Unarmed Fighting", desc: "Unarmed strikes deal 1d6 (or 1d8 if no weapons/shields). Grappled foes take 1d4 bludgeoning per turn." },
        ],
        Paladin: [
            { name: "Defense", desc: "+1 bonus to AC while wearing armor." },
            { name: "Dueling", desc: "+2 damage with a one-handed weapon (no other weapon in hand)." },
            { name: "Great Weapon Fighting", desc: "Reroll 1s and 2s on damage dice with two-handed weapons." },
            { name: "Protection", desc: "Impose disadvantage on an attack against an ally when you use your reaction (requires shield)." },
            { name: "Blind Fighting", desc: "Blindsight 10 ft." },
            { name: "Interception", desc: "Reduce damage to a nearby creature by 1d10 + proficiency as a reaction." },
        ],
        Ranger: [
            { name: "Archery", desc: "+2 bonus to attack rolls with ranged weapons." },
            { name: "Defense", desc: "+1 bonus to AC while wearing armor." },
            { name: "Dueling", desc: "+2 damage with a one-handed weapon." },
            { name: "Two-Weapon Fighting", desc: "Add ability modifier to off-hand attack damage." },
            { name: "Blind Fighting", desc: "Blindsight 10 ft." },
            { name: "Thrown Weapon Fighting", desc: "+2 damage with thrown weapons." },
        ],
    };
    // Rogue: Expertise secimi (2 beceri)
    const ROGUE_SKILLS = ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth", "Thieves Tools"];
    // Otomatik sinif ozellikleri (Fighter, Monk, Barbarian vb.)
    const CLASS_AUTO_FEATURES: Record<string, { name: string, desc: string }[]> = {
        Fighter: [
            { name: "Second Wind", desc: "Bonus action: regain 1d10 + Fighter level HP once per short rest." },
            { name: "Action Surge (Sv.2)", desc: "Take one additional action on your turn once per rest." },
        ],
        Barbarian: [
            { name: "Rage", desc: "Bonus action: enter Rage for 1 min. +2 melee damage, advantage on STR checks/saves, resistance to B/P/S damage. 2 charges at level 1." },
            { name: "Unarmored Defense", desc: "AC = 10 + DEX mod + CON mod when not wearing armor." },
        ],
        Monk: [
            { name: "Unarmored Defense", desc: "AC = 10 + DEX mod + WIS mod when not wearing armor or shield." },
            { name: "Martial Arts", desc: "Use DEX for unarmed/monk weapon attacks; unarmed strike deals 1d4. Bonus action unarmed strike after weapon attack." },
        ],
        Rogue: [
            { name: "Sneak Attack", desc: "Once per turn: +1d6 extra damage with finesse/ranged weapons when you have advantage or an ally is adjacent to target. Scales up every 2 levels." },
            { name: "Thieves' Cant", desc: "Know a secret language used by thieves and rogues." },
        ],
    };

    // Feats that grant spells or stat choices and their requirements
    const getFeatRequirements = (featName: string) => {
        const name = featName.split('(')[0].trim();
        switch (name) {
            case 'Magic Initiate':
                return {
                    label: 'Magic Initiate (2 Cantrip + 1 Seviye 1 Büyü)',
                    slots: [
                        { type: 'cantrip', count: 1, label: 'Cantrip 1' },
                        { type: 'cantrip', count: 1, label: 'Cantrip 2' },
                        { type: 'leveled', count: 1, level: 1, label: 'Seviye 1 Büyü' }
                    ],
                    classes: ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard']
                };
            case 'Fey Touched':
                return {
                    label: 'Fey Touched (+1 Stat & Büyüler)',
                    statChoices: ['INT', 'WIS', 'CHA'],
                    slots: [
                        { type: 'leveled', count: 1, level: 1, school: ['divination', 'enchantment'], label: 'Seviye 1 Büyü' }
                    ],
                    autoSpells: ['Misty Step']
                };
            case 'Shadow Touched':
                return {
                    label: 'Shadow Touched (+1 Stat & Büyüler)',
                    statChoices: ['INT', 'WIS', 'CHA'],
                    slots: [
                        { type: 'leveled', count: 1, level: 1, school: ['illusion', 'necromancy'], label: 'Seviye 1 Büyü' }
                    ],
                    autoSpells: ['Invisibility']
                };
            case 'Spell Sniper':
                return {
                    label: 'Spell Sniper (1 Attack Cantrip)',
                    slots: [
                        { type: 'cantrip', count: 1, hasAttack: true, label: 'Saldırı Cantrip\'i' }
                    ]
                };
            case 'Artificer Initiate':
                return {
                    label: 'Artificer Initiate (1 Cantrip + 1 Seviye 1 Büyü)',
                    slots: [
                        { type: 'cantrip', count: 1, label: 'Artificer Cantrip' },
                        { type: 'leveled', count: 1, level: 1, label: 'Artificer Seviye 1 Büyü' }
                    ],
                    classes: ['Artificer']
                };
            case 'Telepathic':
                return {
                    label: 'Telepathic (+1 Stat & Büyü)',
                    statChoices: ['INT', 'WIS', 'CHA'],
                    autoSpells: ['Detect Thoughts']
                };
            case 'Telekinetic':
                return {
                    label: 'Telekinetic (+1 Stat & Büyü)',
                    statChoices: ['INT', 'WIS', 'CHA'],
                    autoSpells: ['Mage Hand']
                };
            case 'Resilient':
                return {
                    label: 'Resilient (+1 Stat & Saving Throw)',
                    statChoices: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
                };
            case 'Elven Accuracy':
                return {
                    label: 'Elven Accuracy (+1 Stat)',
                    statChoices: ['DEX', 'INT', 'WIS', 'CHA']
                };
            case 'Actor':
                return {
                    label: 'Actor (+1 CHA)',
                    statChoices: ['CHA']
                };
            case 'Observant':
                return {
                    label: 'Observant (+1 Stat)',
                    statChoices: ['INT', 'WIS']
                };
            case 'Skill Expert':
                return {
                    label: 'Skill Expert (+1 Stat)',
                    statChoices: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
                };
            case 'Slasher':
                return {
                    label: 'Slasher (+1 Stat)',
                    statChoices: ['STR', 'DEX']
                };
            case 'Crusher':
                return {
                    label: 'Crusher (+1 Stat)',
                    statChoices: ['STR', 'CON']
                };
            case 'Piercer':
                return {
                    label: 'Piercer (+1 Stat)',
                    statChoices: ['STR', 'DEX']
                };
            case 'Heavy Armor Master':
                return {
                    label: 'Heavy Armor Master (+1 STR)',
                    statChoices: ['STR']
                };
            default:
                return null;
        }
    };

    // ─── D&D 5e Class Skill Proficiencies (pick N from list) ─────────────────
    const CLASS_SKILL_PROFS: Record<string, { count: number; skills: string[] }> = {
        Barbarian: { count: 2, skills: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"] },
        Bard: { count: 3, skills: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"] },
        Cleric: { count: 2, skills: ["History", "Insight", "Medicine", "Persuasion", "Religion"] },
        Druid: { count: 2, skills: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"] },
        Fighter: { count: 2, skills: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"] },
        Monk: { count: 2, skills: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"] },
        Paladin: { count: 2, skills: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"] },
        Ranger: { count: 3, skills: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"] },
        Rogue: { count: 4, skills: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"] },
        Sorcerer: { count: 2, skills: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"] },
        Warlock: { count: 2, skills: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"] },
        Wizard: { count: 2, skills: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"] },
        Artificer: { count: 2, skills: ["Arcana", "History", "Investigation", "Medicine", "Nature", "Perception", "Sleight of Hand"] },
    };

    // Form State
    const [charName, setCharName] = useState("");
    const [selectedRace, setSelectedRace] = useState<any>(null);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [selectedSubclass, setSelectedSubclass] = useState<any>(null);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [selectedBackground, setSelectedBackground] = useState<any>(null);
    const [selectedSubrace, setSelectedSubrace] = useState<any>(null);
    // NPC-specific state
    const [npcRelationship, setNpcRelationship] = useState<'Dost' | 'Nötr' | 'Düşman'>('Nötr');
    const [npcAlignment, setNpcAlignment] = useState('True Neutral');
    const NPC_ALIGNMENTS = [
        'Lawful Good', 'Neutral Good', 'Chaotic Good',
        'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
        'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ];
    const [stats, setStats] = useState({
        STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8
    });
    const [statMethod, setStatMethod] = useState<"standard" | "pointbuy">("standard");
    const STANDARD_VALUES = [15, 14, 13, 12, 10, 8];
    const [assignedValues, setAssignedValues] = useState<{ [stat: string]: number | null }>({
        STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null
    });
    const POINT_BUY_COST: { [key: number]: number } = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
    const POINT_BUY_BUDGET = 27;
    const pointsSpent = Object.values(stats).reduce((sum, v) => sum + (POINT_BUY_COST[v] ?? 0), 0);
    const pointsLeft = POINT_BUY_BUDGET - pointsSpent;
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const ALL_LANGUAGES = ["Common", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Orc", "Abyssal", "Celestial", "Draconic", "Deep Speech", "Infernal", "Primordial", "Sylvan", "Undercommon"];
    const RACE_LANGUAGES: Record<string, string[]> = {
        'Dwarf': ['Common', 'Dwarvish'],
        'Elf': ['Common', 'Elvish'],
        'Halfling': ['Common', 'Halfling'],
        'Human': ['Common'],
        'Dragonborn': ['Common', 'Draconic'],
        'Gnome': ['Common', 'Gnomish'],
        'Half-Elf': ['Common', 'Elvish'],
        'Half-Orc': ['Common', 'Orc'],
        'Tiefling': ['Common', 'Infernal'],
        'Genasi': ['Common', 'Primordial']
    };
    const [activeSpellTab, setActiveSpellTab] = useState<number>(0);
    const [metamagicSelections, setMetamagicSelections] = useState<string[]>([]);

    // SINIFLARA GÖRE BAŞLANGIÇ EKİPMANLARI (CLASS_EQUIPMENT)
    const CLASS_EQUIPMENT: Record<string, any[]> = {
        Fighter: [{ name: "Dungeoneer's Pack", qty: 1, type: "gear", note: "Sırt çantası, levye, çekiç, 10 piton, meşale(10), erzak(10), 50ft ip" }, { name: "Longsword", qty: 1, type: "weapon", note: "1d8 slashing" }, { name: "Chain Mail", qty: 1, type: "armor", note: "AC 16, STR 13 req, Disadv Stealth" }],
        Barbarian: [{ name: "Explorer's Pack", qty: 1, type: "gear", note: "Sırt çantası, uyku tulumu, sefer tası, çıra kutusu, meşale(10), erzak(10), matara, 50ft ip" }, { name: "Greataxe", qty: 1, type: "weapon", note: "1d12 slashing, ağır" }, { name: "Javelin", qty: 4, type: "weapon", note: "Fırlatma (30/120)" }],
        Rogue: [{ name: "Burglar's Pack", qty: 1, type: "gear", note: "Bilye, ip, meşale(5), yağ(2), kapşonlu fener, vb." }, { name: "Rapier", qty: 1, type: "weapon", note: "1d8 piercing, finesse" }, { name: "Thieves' Tools", qty: 1, type: "tool", note: "Tuzak bozma ve kilit açma için" }, { name: "Leather Armor", qty: 1, type: "armor", note: "AC 11 + DEX" }],
        Wizard: [{ name: "Scholar's Pack", qty: 1, type: "gear", note: "Kitap, mürekkep, kalem, parşömen, notlar" }, { name: "Spellbook", qty: 1, type: "gear", note: "Büyü kitabın" }, { name: "Arcane Focus", qty: 1, type: "gear", note: "Asa, kristal veya küre" }],
        Cleric: [{ name: "Priest's Pack", qty: 1, type: "gear", note: "Battaniye, mum, tütsü, sadak kutusu, dua kitabı" }, { name: "Mace", qty: 1, type: "weapon", note: "1d6 bludgeoning" }, { name: "Scale Mail", qty: 1, type: "armor", note: "AC 14 + DEX (max 2)" }, { name: "Shield", qty: 1, type: "armor", note: "+2 AC" }],
        Ranger: [{ name: "Explorer's Pack", qty: 1, type: "gear", note: "Orman ve dağ yolculukları için temel kamp ekipmanı" }, { name: "Longbow", qty: 1, type: "weapon", note: "1d8 piercing (150/600), ağır" }, { name: "Arrows", qty: 20, type: "ammo", note: "" }, { name: "Shortsword", qty: 2, type: "weapon", note: "1d6 piercing, finesse" }],
        Paladin: [{ name: "Explorer's Pack", qty: 1, type: "gear", note: "Yolculuk kiti" }, { name: "Longsword", qty: 1, type: "weapon", note: "1d8 slashing" }, { name: "Shield", qty: 1, type: "armor", note: "+2 AC" }, { name: "Holy Symbol", qty: 1, type: "gear", note: "Din sembolü" }, { name: "Chain Mail", qty: 1, type: "armor", note: "AC 16" }],
        Bard: [{ name: "Entertainer's Pack", qty: 1, type: "gear", note: "Kostüm, müzik aleti, mum, erzak" }, { name: "Rapier", qty: 1, type: "weapon", note: "1d8 piercing, finesse" }, { name: "Lute", qty: 1, type: "tool", note: "Müzik aleti odak" }, { name: "Leather Armor", qty: 1, type: "armor", note: "AC 11 + DEX" }],
        Warlock: [{ name: "Scholar's Pack", qty: 1, type: "gear", note: "Kitap, parşömen, mürekkep" }, { name: "Arcane Focus", qty: 1, type: "gear", note: "Büyü odağı" }, { name: "Dagger", qty: 2, type: "weapon", note: "1d4 piercing, finesse, fırlatma" }, { name: "Leather Armor", qty: 1, type: "armor", note: "AC 11 + DEX" }],
        Sorcerer: [{ name: "Explorer's Pack", qty: 1, type: "gear", note: "Yolculuk kiti" }, { name: "Arcane Focus", qty: 1, type: "gear", note: "Büyü odağı" }, { name: "Dagger", qty: 2, type: "weapon", note: "1d4 piercing, finesse, fırlatma" }],
        Druid: [{ name: "Explorer's Pack", qty: 1, type: "gear", note: "Yolculuk ve doğa kiti" }, { name: "Wooden Shield", qty: 1, type: "armor", note: "+2 AC" }, { name: "Scimitar", qty: 1, type: "weapon", note: "1d6 slashing, finesse" }, { name: "Druidic Focus", qty: 1, type: "gear", note: "Porsuk ağacı dalı veya totem" }, { name: "Leather Armor", qty: 1, type: "armor", note: "AC 11 + DEX" }],
        Monk: [{ name: "Explorer's Pack", qty: 1, type: "gear", note: "Yolculuk kiti" }, { name: "Shortsword", qty: 1, type: "weapon", note: "1d6 piercing, finesse" }, { name: "Dart", qty: 10, type: "weapon", note: "1d4 piercing, finesse, fırlatma" }],
        Artificer: [{ name: "Dungeoneer's Pack", qty: 1, type: "gear", note: "Yeraltı kiti" }, { name: "Thieves' Tools", qty: 1, type: "tool", note: "" }, { name: "Dagger", qty: 2, type: "weapon", note: "" }, { name: "Studded Leather Armor", qty: 1, type: "armor", note: "AC 12 + DEX" }]
    };


    // Irk secilince dilleri ayarla
    useEffect(() => {
        if (selectedRace) {
            const defaults = RACE_LANGUAGES[selectedRace.name] || ['Common'];
            setSelectedLanguages(defaults);
        }
    }, [selectedRace]);

    // Fetch initial data
    useEffect(() => {
        setHasMounted(true);
        const isNpcQuery = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('npc') === 'true';
        setIsNpc(isNpcQuery);

        async function fetchData() {
            try {
                const [racesRes, classRes] = await Promise.all([
                    axios.get(`${API_URL}/api/races`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${API_URL}/api/classes`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                // Remove subraces that were mistakenly added as top-level races in the DB
                const hiddenRaces = ["High Elf", "Wood Elf", "Drow (Dark Elf)", "Air Genasi", "Earth Genasi", "Fire Genasi", "Water Genasi"];
                const filteredRaces = racesRes.data.filter((r: any) => !hiddenRaces.includes(r.name));

                setRaces(filteredRaces);
                setClasses(classRes.data);
            } catch (error) {
                console.error("Veri çekme hatası:", error);
            }
        }
        fetchData();
    }, []);

    // Step 5'e gecilince sinifa ait buyuleri getir
    const fetchSpells = async () => {
        if (!selectedClass) return;
        setLoadingSpells(true);
        try {
            // Seviyeye gore erisilebilir buyuleri hesapla
            // D&D5e: Seviye 1-4 = slot 1, 5-8 = slot 3, 9-12 = slot 5, vb. Basiti: max_spell_level = ceil(level/2)
            const maxSpellLevel = Math.min(9, Math.ceil(selectedLevel / 2));

            let classesToFetch = [selectedClass.name];
            if (selectedClass.name === 'Sorcerer' && selectedSubclass?.name === 'Divine Soul') {
                classesToFetch.push('Cleric');
            }

            const promises = classesToFetch.map(c => axios.get(`${API_URL}/api/spells?class=${c}&max_level=${maxSpellLevel}`, { headers: { 'Authorization': `Bearer ${token}` } }));
            const results = await Promise.all(promises);
            const allSpells = results.flatMap(res => res.data);

            // Remove duplicates (e.g., both Sorcerer and Cleric have 'Light' cantrip)
            const uniqueSpells = Array.from(new Map(allSpells.map(s => [s.name, s])).values());

            setAvailableSpells(uniqueSpells);
        } catch (err) {
            console.error("Speller yuklenemedi:", err);
        } finally {
            setLoadingSpells(false);
        }
    };

    // D&D 5e Buyul Limitleri (sinif + seviyeye gore)
    const getSpellLimits = () => {
        const lv = selectedLevel;
        const intMod = Math.max(0, Math.floor((stats.INT - 10) / 2));
        const wisMod = Math.max(0, Math.floor((stats.WIS - 10) / 2));
        const chaMod = Math.max(0, Math.floor((stats.CHA - 10) / 2));
        const bardKnown = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
        const sorcKnown = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
        const warlKnown = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]; // Warlock corrected
        const rangKnown = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]; // Ranger corrected

        let bardSpells = bardKnown[lv - 1];
        // College of Lore: Additional Magical Secrets at Level 6 (+2 spells)
        if (selectedClass?.name === "Bard" && selectedSubclass?.name === "College of Lore" && lv >= 6) {
            bardSpells += 2;
        }

        const limits: Record<string, { cantrips: number, spells: number }> = {
            Bard: { cantrips: lv < 4 ? 2 : lv < 10 ? 3 : 4, spells: bardSpells },
            Cleric: { cantrips: lv < 4 ? 3 : lv < 10 ? 4 : 5, spells: Math.max(1, lv + wisMod) },
            Druid: { cantrips: lv < 4 ? 2 : lv < 10 ? 3 : 4, spells: Math.max(1, lv + wisMod) },
            Paladin: { cantrips: 0, spells: Math.max(1, Math.floor(lv / 2) + chaMod) },
            Ranger: { cantrips: 0, spells: rangKnown[lv - 1] },
            Sorcerer: { cantrips: lv < 4 ? 4 : lv < 10 ? 5 : 6, spells: sorcKnown[lv - 1] },
            Warlock: { cantrips: lv < 4 ? 2 : lv < 10 ? 3 : 4, spells: warlKnown[lv - 1] },
            Wizard: { cantrips: lv < 4 ? 3 : lv < 10 ? 4 : 5, spells: Math.max(1, lv + intMod) },
            Artificer: { cantrips: lv < 4 ? 2 : lv < 10 ? 3 : 4, spells: Math.max(1, Math.floor(lv / 2) + intMod) },
        };
        return limits[selectedClass?.name ?? ""] ?? { cantrips: 0, spells: 0 };
    };

    const toggleCantrip = (name: string) => {
        const { cantrips } = getSpellLimits();
        setSelectedCantrips(prev => {
            if (prev.includes(name)) return prev.filter(s => s !== name);
            if (prev.length >= cantrips) return prev; // limit doldu
            return [...prev, name];
        });
    };

    const toggleLeveledSpell = (name: string) => {
        const { spells } = getSpellLimits();
        setSelectedLeveledSpells(prev => {
            if (prev.includes(name)) return prev.filter(s => s !== name);
            if (prev.length >= spells) return prev; // limit doldu
            return [...prev, name];
        });
    };


    // Save Character
    const handleSave = async () => {
        try {
            // ASI stats bonus calculation
            const asiBonus = { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
            const selectedFeats: string[] = [];
            const extraSpells: string[] = [];
            const extraInventory: any[] = [];

            const applySpecialFeats = (featName: string) => {
                if (featName === 'Fey Touched') {
                    extraInventory.push({ name: "Fey Touched Spells", qty: 1, type: "roleplay", note: "Misty Step ve seçtiğin büyü 1 kez bedava atılabilirsin." });
                }

                if (featName === 'Metamagic Adept') {
                    extraInventory.push({ name: "Metamagic Adept Feat", qty: 2, type: "roleplay", note: `2 Sorcery Point. Şunları kullanabilirsin: ${metamagicSelections.length > 0 ? metamagicSelections.join(', ') : 'Seçilmedi'}` });
                }
            };

            asiSelections.forEach(asi => {
                if (asi.type === 'stat2' && asi.stat1) asiBonus[asi.stat1 as keyof typeof asiBonus] += 2;
                if (asi.type === 'stat11' && asi.stat1 && asi.stat2) {
                    asiBonus[asi.stat1 as keyof typeof asiBonus] += 1;
                    asiBonus[asi.stat2 as keyof typeof asiBonus] += 1;
                }
                if (asi.type === 'feat' && asi.featName) {
                    selectedFeats.push(`Feat: ${asi.featName}`);
                    applySpecialFeats(asi.featName);
                }
            });

            Object.values(raceFeatStore).forEach((featName: any) => {
                if (featName) {
                    selectedFeats.push(`Feat: ${featName}`);
                    applySpecialFeats(featName);
                }
            });

            // Merge spells selected via FeatSpellSelectionArea
            Object.values(featSpellSelections).forEach((selectedSpells) => {
                selectedSpells.forEach(s => {
                    if (s && !extraSpells.includes(s)) extraSpells.push(s);
                });
            });

            // Process ALL selected feats for auto-granted spells and requirements
            selectedFeats.forEach(fStr => {
                const featName = fStr.replace('Feat: ', '').split('(')[0].trim();
                const reqs = getFeatRequirements(featName);
                if (reqs && reqs.autoSpells) {
                    reqs.autoSpells.forEach((s: string) => {
                        if (!extraSpells.includes(s)) extraSpells.push(s);
                    });
                }
            });

            // Calculate final stats including race + subrace + Any Picks + ASI
            const finalComputedStats = { ...stats };
            const anyBonuses = [
                ...(selectedRace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || []),
                ...(selectedSubrace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || [])
            ];

            for (const stat of Object.keys(stats)) {
                let bonus = 0;

                // Base Race Bonuses
                selectedRace?.ability_bonuses?.forEach((b: any) => {
                    if (b.ability.toUpperCase().startsWith(stat) && b.ability !== 'Any') bonus += b.bonus;
                });

                // Subrace Bonuses
                selectedSubrace?.ability_bonuses?.forEach((b: any) => {
                    if (b.ability.toUpperCase().startsWith(stat) && b.ability !== 'Any') bonus += b.bonus;
                });

                // "Any" Picked Bonuses (from race/subrace)
                Object.entries(raceStatPicks).forEach(([key, pickedStat]) => {
                    if (pickedStat === stat) {
                        const idx = parseInt(key.replace('any-', ''));
                        const actualBonus = anyBonuses[idx]?.bonus || 1;
                        bonus += actualBonus;
                    }
                });

                // Feat Stat Selections (+1 each)
                Object.values(featStatSelections).forEach(pickedStat => {
                    if (pickedStat === stat) bonus += 1;
                });

                finalComputedStats[stat as keyof typeof stats] += bonus + asiBonus[stat as keyof typeof stats];
            }

            const conMod = Math.floor((finalComputedStats.CON - 10) / 2);
            const hitDie = selectedClass?.hit_die ? parseInt(selectedClass.hit_die.replace("d", "")) : 8;
            const firstLevelHp = hitDie + conMod;
            const extraHp = (selectedLevel - 1) * (Math.floor(hitDie / 2) + 1 + conMod);
            const totalMaxHp = Math.max(1, firstLevelHp + extraHp);
            // Envanter ve Altın Hazırlığı
            let startingInventory: any[] = [];
            let startingGold = 0;

            if (selectedBackground) {
                const bgData = ALL_BACKGROUNDS.find(b => b.name === selectedBackground.name);
                if (bgData) {
                    startingGold = bgData.gold || 0;
                    if (bgData.items) {
                        startingInventory = [...startingInventory, ...bgData.items];
                    }
                }
            }

            if (selectedClass) {
                const classItems = CLASS_EQUIPMENT[selectedClass.name as string] || [];
                startingInventory = [...startingInventory, ...classItems];
            }

            const initialMoney = { cp: 0, sp: 0, ep: 0, gp: startingGold, pp: 0 };

            const payload = {
                campaignId,
                userId: user?.id || "Player-1",
                name: charName || "Bilinmeyen Kahraman",
                raceRef: selectedRace._id,
                classRef: selectedClass._id,
                background: selectedBackground ? selectedBackground.name : "",
                level: selectedLevel,
                subclass: selectedSubclass ? selectedSubclass.name : "",
                subrace: selectedSubrace ? selectedSubrace.name : "",
                fightingStyle: selectedFightingStyle,
                stats: finalComputedStats,
                maxHp: totalMaxHp,
                currentHp: totalMaxHp,
                ac: (() => {
                    const dexMod = Math.floor((finalComputedStats.DEX - 10) / 2);
                    const wisMod = Math.floor((finalComputedStats.WIS - 10) / 2);
                    const conMod = Math.floor((finalComputedStats.CON - 10) / 2);
                    const className = selectedClass?.name || '';
                    // Monk Unarmored Defense: 10 + DEX + WIS
                    if (className === 'Monk') return 10 + dexMod + wisMod;
                    // Barbarian Unarmored Defense: 10 + DEX + CON
                    if (className === 'Barbarian') return 10 + dexMod + conMod;
                    // Draconic Bloodline Sorcerer: 13 + DEX (natural armor)
                    if (className === 'Sorcerer' && selectedSubclass?.name === 'Draconic Bloodline') return Math.max(13 + dexMod, 10 + dexMod);
                    // Default: 10 + DEX
                    return 10 + dexMod;
                })(),
                spells: [...selectedCantrips, ...selectedLeveledSpells, ...extraSpells],
                inventory: startingInventory,
                money: initialMoney,
                skillProfs: [
                    ...selectedSkillProfs,
                    ...raceExtraSkills,
                    ...bardExpertise,
                    ...(selectedBackground?.skills ? selectedBackground.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                    ...(selectedRace?.name === 'Tabaxi' ? ['Perception', 'Stealth'] : []),
                    ...(selectedRace?.name === 'Satyr' ? ['Performance', 'Persuasion'] : []),
                    ...(selectedRace?.name === 'Half-Orc' ? ['Intimidation'] : []),
                    ...(selectedRace?.name === 'Goliath' ? ['Athletics'] : [])
                ],
                expertise: [...selectedExpertise, ...bardExpertise],
                raceBonusFeats: Object.values(raceFeatStore).filter(Boolean),
                warlockInvocations,
                warlockPact,
                bmManeuvers,
                fightingStyles: [selectedFightingStyle, ...(championExtraStyle ? [championExtraStyle] : [])].filter(Boolean),
                languages: selectedLanguages,
                isNpc: isNpc,
                alignment: npcAlignment,
                relationship: npcRelationship,
                metamagicSelections: metamagicSelections, // Add this line
            };

            const res = await axios.post(`${API_URL}/api/characters`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!isNpc) {
                localStorage.setItem(`dnd_character_${campaignId}`, res.data._id);
                router.push(`/player/${campaignId}/sheet`);
            } else {
                router.push(`/dm/${campaignId}/dashboard`);
            }
        } catch (error) {
            console.error(error);
            alert("Karakter kaydedilemedi!");
        }
    };

    const calculateModifier = (stat: number) => Math.floor((stat - 10) / 2);


    if (!hasMounted) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">

            {/* ══ LEVEL CHART MODAL ══ */}
            {chartClass && (() => {
                const clsName = chartClass.name as string;
                const aLevels = ASI_LEVELS[clsName] ?? [4, 8, 12, 16, 19];
                const slotcaster = isSpellcaster(clsName);
                const slotCols = slotcaster
                    ? (clsName === 'Warlock' ? [5] : (clsName === 'Paladin' || clsName === 'Ranger' || clsName === 'Artificer') ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9])
                    : [];
                return (
                    <div className="fixed inset-0 bg-black/85 z-[200] overflow-auto flex items-start justify-center py-10 px-4"
                        onClick={() => setChartClass(null)}>
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{clsName} — Level Progression</h2>
                                    <p className="text-gray-400 text-sm">Hit Die: {chartClass.hit_die} · {chartClass.primary_ability}</p>
                                </div>
                                <button onClick={() => setChartClass(null)} className="text-gray-500 hover:text-white text-2xl font-black">✕</button>
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
                                            const profBonus = Math.ceil(lv / 4) + 1;
                                            const feats: any[] = CLASS_FEATURES[clsName]?.[lv] ?? [];
                                            const isASI = aLevels.includes(lv);
                                            const slots = slotcaster ? getSpellSlotTotals(clsName, lv) : [];
                                            return (
                                                <tr key={lv} className="border-b border-gray-800 hover:bg-gray-800/40 transition">
                                                    <td className="px-3 py-2">
                                                        <span className="font-black text-lg text-white w-8 text-center inline-block">{lv}</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className="text-purple-400 font-black">+{profBonus}</span>
                                                    </td>
                                                    {slotCols.map(sl => {
                                                        const val = slots[sl - 1] ?? 0;
                                                        return (
                                                            <td key={sl} className="px-2 py-2 text-center">
                                                                <span className={val > 0 ? 'text-blue-300 font-bold' : 'text-gray-700'}>{val > 0 ? val : '—'}</span>
                                                            </td>
                                                        );
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

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Başlık ve İlerleme Çubuğu */}
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-4">
                        Kahraman Yarat
                    </h1>
                    <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-sm font-semibold">
                        <span className={step >= 1 ? "text-yellow-400" : "text-gray-500"}>1. Temel</span> &rsaquo;
                        <span className={step >= 2 ? "text-yellow-400" : "text-gray-500"}>2. Irk</span> &rsaquo;
                        <span className={step >= 2.5 ? "text-yellow-400" : "text-gray-500"}>2.5 Alt Irk</span> &rsaquo;
                        <span className={step >= 3 ? "text-yellow-400" : "text-gray-500"}>3. Sinif</span> &rsaquo;
                        <span className={step >= 3.5 ? "text-yellow-400" : "text-gray-500"}>4. Alt Sinif</span> &rsaquo;
                        <span className={step >= 3.6 ? "text-yellow-400" : "text-gray-500"}>5. Geçmiş</span> &rsaquo;
                        <span className={step >= 4 ? "text-yellow-400" : "text-gray-500"}>6. Statlar</span> &rsaquo;
                        <span className={step >= 5 ? "text-yellow-400" : "text-gray-500"}>7. Buyuler</span>
                    </div>
                </div>

                {/* Step 1: İsim ve Seviye */}
                {step === 1 && (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
                        <h2 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
                            {isNpc ? '🤝 Seviyeli NPC Oluştur' : 'Karakterin Adı ve Seviyesi'}
                        </h2>
                        <input
                            type="text"
                            placeholder={isNpc ? 'NPC Adı...' : 'Efsanevi İsmin...'}
                            value={charName}
                            onChange={(e) => setCharName(e.target.value)}
                            className="w-full bg-gray-900 text-white text-2xl p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
                        />
                        <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg border border-gray-700 mb-4">
                            <span className="text-xl font-bold text-gray-300">Başlangıç Seviyesi:</span>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                            <span className="text-3xl font-black text-red-500 w-12 text-center">{selectedLevel}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2 italic">* Seçtiğiniz seviyeye göre alt sınıf ve büyü seçenekleri açılacaktır.</p>

                        {/* NPC-only: Relationship & Alignment */}
                        {isNpc && (
                            <div className="mt-6 space-y-5">
                                {/* Relationship */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">İlişki / Tutum</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['Dost', 'Nötr', 'Düşman'] as const).map((rel) => {
                                            const colors = {
                                                Dost: npcRelationship === 'Dost' ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-emerald-700',
                                                Nötr: npcRelationship === 'Nötr' ? 'border-yellow-500 bg-yellow-900/40 text-yellow-300' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-yellow-700',
                                                Düşman: npcRelationship === 'Düşman' ? 'border-red-500 bg-red-900/40 text-red-300' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-red-700',
                                            };
                                            const icons = { Dost: '🟩', Nötr: '🟨', Düşman: '🟥' };
                                            return (
                                                <button key={rel} onClick={() => setNpcRelationship(rel)}
                                                    className={`p-4 rounded-xl border-2 font-bold transition-all text-center ${colors[rel]}`}>
                                                    <div className="text-2xl mb-1">{icons[rel]}</div>
                                                    {rel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* D&D Alignment Grid */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Hizalama (Alignment)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {NPC_ALIGNMENTS.map((al) => (
                                            <button key={al} onClick={() => setNpcAlignment(al)}
                                                className={`p-2.5 rounded-lg border-2 text-xs font-bold transition-all ${npcAlignment === al
                                                    ? 'border-purple-500 bg-purple-900/40 text-purple-200'
                                                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
                                                    }`}>
                                                {al}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button onClick={() => setStep(2)} disabled={!charName} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-bold transition-colors disabled:opacity-50">
                                Ileri
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Irk Seçimi */}
                {step === 2 && (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-6">
                            <h2 className="text-3xl font-bold text-white">Irk Seçimi</h2>
                            {selectedRace && <span className="text-sm bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full border border-yellow-700 font-bold">Seçilen: {selectedRace.name}</span>}
                        </div>

                        {/* Race Tabs */}
                        <div className="flex gap-2 border-b border-gray-700/50 pb-4 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
                            {(["Temel", "Egzotik", "Soylar"] as const).map(tab => (
                                <button key={tab}
                                    onClick={() => setActiveRaceTab(tab)}
                                    className={`px-5 py-2.5 rounded-xl font-black shrink-0 transition-all ${activeRaceTab === tab ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-gray-900 shadow-[0_0_15px_rgba(234,179,8,0.4)] translate-y-[-2px]' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                                    {tab === "Temel" ? "🛡️ Temel Irklar" : tab === "Egzotik" ? "✨ Egzotik Irklar" : "🩸 Soylar & Lanetler"}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
                            {races.filter(r => {
                                if (activeRaceTab === "Temel") return CORE_RACES.includes(r.name);
                                if (activeRaceTab === "Egzotik") return EXOTIC_RACES.includes(r.name);
                                return LINEAGES.includes(r.name);
                            }).map((race) => (
                                <div
                                    key={race._id}
                                    onClick={() => { setSelectedRace(race); setSelectedSubrace(null); setRaceStatPicks({}); setRaceFeatStore({}); setRaceExtraSkills([]); }}
                                    className={`cursor-pointer p-6 rounded-xl border-2 flex flex-col transition-all hover:-translate-y-2 ${selectedRace?._id === race._id ? 'border-yellow-500 bg-gray-800 shadow-[0_10px_30px_rgba(234,179,8,0.3)] scale-[1.02]' : 'border-gray-700 hover:border-gray-500 bg-gray-900/80 hover:bg-gray-800'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className={`text-2xl font-black ${selectedRace?._id === race._id ? 'text-yellow-400' : 'text-gray-100'}`}>{race.name}</h3>
                                        {race.subraces?.length > 0 && (
                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/50 font-black tracking-wider uppercase">
                                                {race.subraces.length} Alt Tür
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed">{race.description_tr}</p>

                                    <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800 mb-4">
                                        <div className="text-xs text-gray-300 flex items-center gap-2">
                                            <span className="text-red-400 font-black uppercase tracking-widest text-[10px]">Stat Bonus:</span>
                                            <span className="font-semibold">{race.ability_bonuses?.map((b: any) => `+${b.bonus} ${b.ability.substring(0, 3)}`).join(" VEYA ") || "Yok"}</span>
                                        </div>
                                    </div>

                                    {race.traits?.length > 0 && selectedRace?._id === race._id && (
                                        <div className="mt-auto border-t border-gray-700/50 pt-4 animate-fade-in">
                                            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                                Öne Çıkan Özellikler
                                            </p>
                                            <div className="space-y-2.5">
                                                {race.traits.map((trait: any, ti: number) => (
                                                    <div key={ti}>
                                                        <p className="text-xs font-black text-gray-200">{trait.name}</p>
                                                        <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{trait.desc_tr}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button onClick={() => setStep(1)} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">Geri</button>
                            <button
                                onClick={() => selectedRace?.subraces?.length > 0 ? setStep(2.5) : setStep(3)}
                                disabled={!selectedRace}
                                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-bold transition-colors disabled:opacity-50"
                            >İleri</button>
                        </div>
                    </div>
                )}

                {/* Step 2.5: Alt Irk (Subrace) Seçimi */}
                {step === 2.5 && selectedRace && (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
                        <h2 className="text-3xl font-bold mb-2 text-white border-b border-gray-700 pb-2">Alt Irk Seçimi</h2>
                        <p className="text-gray-400 mb-6">
                            <span className="text-yellow-400 font-bold">{selectedRace.name}</span> ırkının alt türünü seç.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedRace.subraces.map((sub: any, idx: number) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedSubrace(sub)}
                                    className={`cursor-pointer p-5 rounded-lg border-2 flex flex-col transition-all hover:-translate-y-1 ${selectedSubrace?.name === sub.name
                                        ? 'border-yellow-500 bg-gray-700 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                                        : 'border-gray-600 hover:border-gray-400 bg-gray-900'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-xl font-bold text-yellow-400">{sub.name}</h3>
                                        {selectedSubrace?.name === sub.name && <span className="text-yellow-400 text-xl">✓</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3 flex-grow">{sub.description_tr}</p>
                                    {sub.ability_bonuses?.length > 0 && (
                                        <div className="text-xs mb-2">
                                            <span className="text-red-400 font-bold">Ekstra Bonus: </span>
                                            <span className="text-gray-300">{sub.ability_bonuses.map((b: any) => `+${b.bonus} ${b.ability}`).join(", ")}</span>
                                        </div>
                                    )}
                                    {sub.traits?.length > 0 && (
                                        <div className="mt-auto pt-3">
                                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Alt Irk Özellikleri</p>
                                            <div className="space-y-1.5">
                                                {sub.traits.map((t: any, ti: number) => (
                                                    <div key={ti} className="text-[10px] p-2 rounded bg-gray-800 border border-gray-700/50 flex flex-col gap-0.5">
                                                        <span className="text-yellow-400 font-bold">{t.name}</span>
                                                        <span className="text-gray-400 leading-tight">{t.desc_tr}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button onClick={() => { setSelectedSubrace(null); setStep(2); }} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">Geri</button>
                            <button onClick={() => setStep(3)} disabled={!selectedSubrace} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-bold transition-colors disabled:opacity-50">İleri</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Sınıf Seçimi */}
                {step === 3 && (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
                        <h2 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-2">Sınıf Seçimi</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {classes.map((cls) => (
                                <div
                                    key={cls._id}
                                    onClick={() => setSelectedClass(cls)}
                                    className={`relative cursor-pointer p-6 rounded-lg border-2 flex flex-col transition-all hover:-translate-y-1 ${selectedClass?._id === cls._id ? 'border-red-500 bg-gray-700 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-gray-600 hover:border-gray-400 bg-gray-900'}`}
                                >
                                    {/* Level Chart Butonu — sağ üst köşe */}
                                    <button
                                        onClick={e => { e.stopPropagation(); setChartClass(cls); }}
                                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-sm transition z-10"
                                        title="Level Chart"
                                    >📊</button>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-2xl font-bold text-red-500">{cls.name}</h3>
                                        <span className="bg-gray-800 px-3 py-1 rounded text-xs text-gray-400 border border-gray-600">Hit Die: {cls.hit_die}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 flex-grow">{cls.description_tr}</p>
                                    <div className="mt-4 pt-4 border-t border-gray-700 text-xs">
                                        <strong className="text-yellow-500">Öncelikli Stat:</strong> {cls.primary_ability}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button onClick={() => setStep(2)} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">Geri</button>
                            <button
                                onClick={() => setStep(3.5)}
                                disabled={!selectedClass}
                                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-bold transition-colors disabled:opacity-50"
                            >Ileri</button>
                        </div>
                    </div>
                )}

                {/* Step 3.5: Alt Sinif Secimi */}
                {step === 3.5 && selectedClass?.subclasses && (() => {
                    const unlockLevel: number = selectedClass.subclass_unlock_level ?? 1;
                    const canSelectSubclass = (selectedLevel ?? 1) >= unlockLevel;

                    return (
                        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
                            <h2 className="text-3xl font-bold mb-2 text-white border-b border-gray-700 pb-2">Alt Sınıf Seçimi</h2>

                            {/* Bilgi Banneri */}
                            {canSelectSubclass ? (
                                <p className="text-gray-400 mb-6">
                                    <span className="text-yellow-400 font-bold">{selectedClass.name}</span> sınıfının uzmanlık yolunu seç.
                                    {unlockLevel === 1 && (
                                        <span className="ml-2 bg-green-900/50 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-700">Seviye 1'den seçilebilir</span>
                                    )}
                                </p>
                            ) : (
                                <div className="mb-6 p-4 rounded-xl bg-orange-900/20 border border-orange-700/50 flex items-start gap-3">
                                    <span className="text-2xl">🔒</span>
                                    <div>
                                        <p className="text-orange-300 font-bold text-sm">Alt Sınıf Seviye {unlockLevel}'de Açılır</p>
                                        <p className="text-orange-400/80 text-xs mt-0.5">
                                            Şu anki seviyeniz ({selectedLevel}) yeterli değil. Aşağıdaki seçenekleri şimdiden inceleyebilirsiniz, ancak seçim Seviye {unlockLevel}'de yapılacak.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedClass.subclasses.map((sub: any, idx: number) => {
                                    const isSelected = selectedSubclass?.name === sub.name;
                                    const isLocked = !canSelectSubclass;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => !isLocked && setSelectedSubclass(sub)}
                                            className={`p-5 rounded-lg border-2 flex flex-col transition-all relative ${isLocked
                                                ? 'border-gray-700 bg-gray-900/70 cursor-not-allowed opacity-75'
                                                : isSelected
                                                    ? 'border-purple-500 bg-gray-700 shadow-[0_0_15px_rgba(168,85,247,0.5)] cursor-pointer hover:-translate-y-1'
                                                    : 'border-gray-600 hover:border-purple-400 bg-gray-900 cursor-pointer hover:-translate-y-1'
                                                }`}
                                        >
                                            {/* Kilitli ise overlay rozet */}
                                            {isLocked && (
                                                <span className="absolute top-3 right-3 text-[10px] bg-orange-900/60 text-orange-300 border border-orange-700 px-2 py-0.5 rounded-full font-bold">
                                                    Sv.{unlockLevel}'de seçilebilir
                                                </span>
                                            )}
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`text-xl font-bold ${isLocked ? 'text-gray-400' : 'text-purple-400'}`}>{sub.name}</h3>
                                                {isSelected && !isLocked && <span className="text-purple-400 text-xl">✓</span>}
                                            </div>
                                            <p className="text-xs text-gray-400 mb-3 flex-grow">{sub.description_tr}</p>
                                            <div className="space-y-1.5">
                                                {sub.features.map((feat: any, fIdx: number) => {
                                                    const featUnlocked = (selectedLevel ?? 1) >= feat.level;
                                                    return (
                                                        <div key={fIdx} className={`text-xs p-2 rounded flex items-start gap-2 ${featUnlocked ? 'bg-gray-800' : 'bg-gray-800/60 border border-orange-900/30'}`}>
                                                            <span className={`shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded border ${featUnlocked ? 'text-green-400 border-green-800 bg-green-900/30' : 'text-orange-400 border-orange-800 bg-orange-900/30'}`}>
                                                                {featUnlocked ? '✓' : '🔒'} Sv.{feat.level}
                                                            </span>
                                                            <div>
                                                                <span className="text-yellow-400 font-semibold">{feat.name}: </span>
                                                                <span className={featUnlocked ? 'text-gray-300' : 'text-gray-400'}>{feat.desc_tr}</span>
                                                                {!featUnlocked && (
                                                                    <span className="ml-1 text-orange-400 text-[9px] font-bold">[Seviye {feat.level}'de açılır]</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 flex justify-between">
                                <button onClick={() => { setSelectedSubclass(null); setStep(3); }} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">Geri</button>
                                {canSelectSubclass ? (
                                    <button onClick={() => setStep(3.6)} disabled={!selectedSubclass} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-bold transition-colors disabled:opacity-50">İleri</button>
                                ) : (
                                    <button onClick={() => setStep(3.6)} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">
                                        Subclass'sız Devam Et →
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })()}


                {/* Step 3.6: Background (Geçmiş) ve Dil Secimi - BİRLEŞTİRİLDİ */}
                {step === 3.6 && (
                    <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Sol Taraf: Background Listesi */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 border-b border-gray-700 pb-4 mb-6 relative z-10">
                                    <div className="w-12 h-12 bg-yellow-900 border border-yellow-700 rounded-lg flex items-center justify-center text-2xl shadow-inner">📜</div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Geçmiş (Background)</h2>
                                        <p className="text-gray-400 mt-1">Karakterinin hikayesini ve ek özelliklerini seç.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 mb-6 relative z-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {ALL_BACKGROUNDS.map((bg) => (
                                        <div
                                            key={bg.name}
                                            onClick={() => {
                                                setSelectedBackground(bg);
                                                // Irk dillerini sıfırlamadan background dillerini temizle
                                                const defaults = RACE_LANGUAGES[selectedRace?.name ?? ''] || ['Common'];
                                                setSelectedLanguages(defaults);
                                            }}
                                            className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 group relative overflow-hidden ${selectedBackground?.name === bg.name
                                                ? 'bg-yellow-900/30 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                                : 'bg-gray-900 border-gray-700 hover:border-yellow-700/50 hover:bg-gray-800'
                                                }`}
                                        >
                                            <h3 className={`text-lg font-black tracking-wide ${selectedBackground?.name === bg.name ? 'text-yellow-400' : 'text-gray-200 group-hover:text-yellow-500'}`}>
                                                {bg.name}
                                            </h3>
                                            <p className="text-xs text-yellow-600/80 uppercase font-bold tracking-widest mb-2">{bg.tr}</p>

                                            <div className="bg-gray-950 p-2 rounded border border-gray-800 mb-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] text-gray-500">Yetkinlikler: {bg.skills}</span>
                                                    <span className="text-xs font-black text-yellow-500 bg-yellow-900/40 px-1.5 py-0.5 rounded shadow-inner">{bg.gold} GP | {bg.langCount} Dil</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-gray-700 pl-2">{bg.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sağ Taraf: Dil Seçimi */}
                            <div className="w-full md:w-80">
                                <div className="flex items-center gap-4 border-b border-gray-700 pb-4 mb-6 relative z-10">
                                    <div className="w-12 h-12 bg-blue-900 border border-blue-700 rounded-lg flex items-center justify-center text-2xl shadow-inner">🗣️</div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Diller</h2>
                                        {(() => {
                                            const defaults = RACE_LANGUAGES[selectedRace?.name ?? ''] || ['Common'];
                                            const bgBonus = selectedBackground?.langCount || 0;
                                            const currentExtra = selectedLanguages.filter(l => !defaults.includes(l)).length;
                                            return (
                                                <p className={`text-xs mt-1 font-bold ${currentExtra > bgBonus ? 'text-red-400' : 'text-blue-400'}`}>
                                                    {bgBonus > 0 ? `Background'dan ${bgBonus} ekstra dil seçebilirsin.` : `Ekstra dil hakkın yok.`}
                                                    <br />({currentExtra} / {bgBonus})
                                                </p>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 relative z-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {ALL_LANGUAGES.map(lang => {
                                        const isDefault = (RACE_LANGUAGES[selectedRace?.name ?? ''] || ['Common']).includes(lang);
                                        const isSelected = selectedLanguages.includes(lang);
                                        const defaults = RACE_LANGUAGES[selectedRace?.name ?? ''] || ['Common'];
                                        const bgBonus = selectedBackground?.langCount || 0;
                                        const currentExtra = selectedLanguages.filter(l => !defaults.includes(l)).length;
                                        const limitReached = currentExtra >= bgBonus && !isSelected;

                                        return (
                                            <button
                                                key={lang}
                                                disabled={isDefault || (limitReached && !isSelected)}
                                                onClick={() => {
                                                    if (isDefault) return;
                                                    setSelectedLanguages(prev =>
                                                        isSelected ? prev.filter(l => l !== lang) : [...prev, lang]
                                                    );
                                                }}
                                                className={`p-2 rounded-lg border-2 font-bold transition-all text-xs ${isDefault ? 'bg-blue-900/50 border-blue-700 text-blue-200 cursor-default' :
                                                    isSelected ? 'border-blue-500 bg-blue-600 text-white' :
                                                        limitReached ? 'opacity-30 cursor-not-allowed bg-gray-900 border-gray-800 text-gray-600' :
                                                            'border-gray-700 bg-gray-900 text-gray-400 hover:border-blue-700'
                                                    }`}
                                            >
                                                {lang} {isDefault && '✓'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {selectedBackground && (
                            <div className="bg-green-900/20 border border-green-800 p-4 rounded-xl mt-6 relative z-10 flex gap-4 items-center animate-fade-in shrink-0">
                                <div className="text-4xl">🎒</div>
                                <div>
                                    <h4 className="font-bold text-green-400">Tebrikler!</h4>
                                    <p className="text-sm text-gray-300">
                                        <span className="font-bold text-yellow-500">{selectedBackground.gold} Altın</span> ve ekipmanlar hazır.
                                        {selectedBackground.langCount > 0 && <span> {selectedBackground.langCount} dil hakkını sağ taraftan kullanabilirsin.</span>}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-between pt-6 border-t border-gray-700 relative z-10">
                            <button onClick={() => {
                                if (selectedClass?.subclass_unlock_level === 1) setStep(3.5);
                                else setStep(3);
                            }} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">Geri</button>
                            <button
                                onClick={() => setStep(4)}
                                disabled={!selectedBackground || (() => {
                                    const defaults = RACE_LANGUAGES[selectedRace?.name ?? ''] || ['Common'];
                                    const bgBonus = selectedBackground?.langCount || 0;
                                    const currentExtra = selectedLanguages.filter(l => !defaults.includes(l)).length;
                                    return currentExtra > bgBonus;
                                })()}
                                className="px-10 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-lg font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                            >
                                İleri: Statlar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Stat Dagitimi */}
                {step === 4 && (
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
                        <h2 className="text-3xl font-bold mb-2 text-white">Yetenek Puanları (Stats)</h2>
                        <p className="text-gray-400 mb-4">Irkından gelen bonuslar başlangıç puanının üstüne otomatik eklenir.</p>

                        {/* --- ANY STAT SELECTION (Race/Subrace) --- */}
                        {(() => {
                            const anyBonuses = [
                                ...(selectedRace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || []),
                                ...(selectedSubrace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || [])
                            ];
                            if (anyBonuses.length === 0) return null;

                            return (
                                <div className="mb-8 p-6 bg-yellow-900/10 border border-yellow-700/50 rounded-xl">
                                    <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        ✨ Irksal Esnek Puan Seçimi
                                        <span className="text-[10px] bg-yellow-900 border border-yellow-700 px-2 py-0.5 rounded text-yellow-300 font-bold font-mono">
                                            {Object.keys(raceStatPicks).length} / {anyBonuses.length}
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {anyBonuses.map((b, idx) => (
                                            <div key={`any-${idx}`}>
                                                <label className="block text-[10px] text-gray-400 font-bold mb-1.5 uppercase">+{b.bonus} Bonus Puanı</label>
                                                <select
                                                    value={raceStatPicks[`any-${idx}`] || ''}
                                                    onChange={(e) => setRaceStatPicks(prev => ({ ...prev, [`any-${idx}`]: e.target.value }))}
                                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 text-sm font-bold focus:border-yellow-500"
                                                >
                                                    <option value="">-- Stat Seç --</option>
                                                    {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(s => {
                                                        const isPicked = Object.entries(raceStatPicks).some(([k, v]) => k !== `any-${idx}` && v === s);
                                                        const hasBaseBonus = selectedRace?.ability_bonuses?.some((rb: any) => rb.ability.toUpperCase().startsWith(s) && rb.ability !== 'Any') || selectedSubrace?.ability_bonuses?.some((sb: any) => sb.ability.toUpperCase().startsWith(s) && sb.ability !== 'Any');
                                                        return (
                                                            <option key={s} value={s} disabled={isPicked || hasBaseBonus}>
                                                                {s}{(isPicked || hasBaseBonus) ? ' (Atanamaz)' : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-[10px] text-gray-500 italic">* Aynı statı birden fazla kez seçemezsiniz (isteğe bağlı kural değilse).</p>
                                </div>
                            );
                        })()}

                        {/* Yöntem Seçimi */}
                        <div className="flex space-x-3 mb-6 pb-5 border-b border-gray-700">
                            <button
                                onClick={() => {
                                    setStatMethod('standard');
                                    setAssignedValues({ STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null });
                                }}
                                className={`px-5 py-2 rounded-lg font-bold transition-all ${statMethod === 'standard'
                                    ? 'bg-yellow-500 text-gray-900 shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                🎲 Standart Dizi
                            </button>
                            <button
                                onClick={() => {
                                    setStatMethod('pointbuy');
                                    setStats({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 });
                                }}
                                className={`px-5 py-2 rounded-lg font-bold transition-all ${statMethod === 'pointbuy'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                💰 Nokta Alımı (Point Buy)
                            </button>
                        </div>

                        {/* --- STANDART DİZİ --- */}
                        {statMethod === 'standard' && (
                            <div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <p className="w-full text-sm text-gray-400 mb-1">
                                        Aşağıdaki değerlerden her birini sadece <span className="text-yellow-400 font-bold">bir kezine</span> bir stat’a atayabilirsin:
                                    </p>
                                    {STANDARD_VALUES.map(val => {
                                        const isUsed = Object.values(assignedValues).includes(val);
                                        return (
                                            <span key={val} className={`px-4 py-1 rounded-full font-mono font-bold text-sm border ${isUsed ? 'bg-gray-700 text-gray-500 border-gray-600 line-through' : 'bg-yellow-900/50 text-yellow-400 border-yellow-700'
                                                }`}>{val}</span>
                                        );
                                    })}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {(Object.keys(stats) as Array<keyof typeof stats>).map((stat) => {
                                        // Bonus calculation (Base + Subrace + Any Picks)
                                        let bonus = 0;
                                        selectedRace?.ability_bonuses?.forEach((b: any) => {
                                            if (b.ability.toUpperCase().startsWith(stat) && b.ability !== 'Any') bonus += b.bonus;
                                        });
                                        selectedSubrace?.ability_bonuses?.forEach((b: any) => {
                                            if (b.ability.toUpperCase().startsWith(stat) && b.ability !== 'Any') bonus += b.bonus;
                                        });
                                        const localAnyBonuses = [
                                            ...(selectedRace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || []),
                                            ...(selectedSubrace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || [])
                                        ];
                                        Object.entries(raceStatPicks).forEach(([key, pickedStat]) => {
                                            if (pickedStat === stat) {
                                                const idx = parseInt(key.replace('any-', ''));
                                                const actualBonus = localAnyBonuses[idx]?.bonus || 1;
                                                bonus += actualBonus;
                                            }
                                        });

                                        // Feat Stat Selections (+1 each)
                                        Object.values(featStatSelections).forEach(pickedStat => {
                                            if (pickedStat === stat) bonus += 1;
                                        });

                                        const baseVal = assignedValues[stat];
                                        const finalVal = (baseVal ?? 8) + bonus;
                                        const mod = Math.floor((finalVal - 10) / 2);
                                        const isPrimary = selectedClass?.primary_ability?.includes(stat === 'STR' ? 'Strength' : stat === 'DEX' ? 'Dexterity' : stat === 'CON' ? 'Constitution' : stat === 'INT' ? 'Intelligence' : stat === 'WIS' ? 'Wisdom' : 'Charisma');
                                        return (
                                            <div key={stat} className={`bg-gray-900 rounded-xl p-4 text-center border-2 ${isPrimary ? 'border-yellow-500' : 'border-gray-700'}`}>
                                                <h3 className="text-lg font-bold text-gray-300">{stat}</h3>
                                                {isPrimary && <span className="text-[10px] text-yellow-500 uppercase tracking-wider">Primary</span>}
                                                <div className="text-4xl font-black text-white my-3">{baseVal !== null ? finalVal : '—'}</div>
                                                <div className={`text-sm font-bold mb-3 ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {baseVal !== null ? (mod >= 0 ? `+${mod}` : mod) : '?'}
                                                </div>
                                                <select
                                                    value={baseVal ?? ''}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value ? Number(e.target.value) : null;
                                                        setAssignedValues(prev => ({ ...prev, [stat]: newVal }));
                                                        if (newVal) setStats(prev => ({ ...prev, [stat]: newVal }));
                                                        else setStats(prev => ({ ...prev, [stat]: 8 }));
                                                    }}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-1.5 px-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                                                >
                                                    <option value="">-- Seç --</option>
                                                    {STANDARD_VALUES.filter(v => !Object.values(assignedValues).includes(v) || assignedValues[stat] === v).map(v => (
                                                        <option key={v} value={v}>{v}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className={`mt-4 text-sm font-bold ${Object.values(assignedValues).every(v => v !== null) ? 'text-green-400' : 'text-yellow-400'
                                    }`}>
                                    {Object.values(assignedValues).filter(v => v !== null).length} / 6 stat atandı
                                    {Object.values(assignedValues).every(v => v !== null) && ' ✓ Hepsi tamam!'}
                                </p>
                            </div>
                        )}

                        {/* --- POINT BUY --- */}
                        {statMethod === 'pointbuy' && (
                            <div>
                                <div className={`flex items-center justify-between mb-4 px-4 py-3 rounded-xl border ${pointsLeft === 0 ? 'bg-green-900/30 border-green-700' :
                                    pointsLeft < 0 ? 'bg-red-900/30 border-red-700' :
                                        'bg-blue-900/20 border-blue-800'
                                    }`}>
                                    <span className="text-gray-300 font-semibold">Kalan Puan</span>
                                    <span className={`text-2xl font-black ${pointsLeft < 0 ? 'text-red-400' : pointsLeft === 0 ? 'text-green-400' : 'text-blue-400'
                                        }`}>{pointsLeft} / {POINT_BUY_BUDGET}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-5">Her stat en az 8, en fazla 15 olabilir. 13–15 arası artışlar daha pahalıdır.</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {(Object.keys(stats) as Array<keyof typeof stats>).map((stat) => {
                                        // Bonus calculation (Base + Subrace + Any Picks)
                                        let bonus = 0;
                                        selectedRace?.ability_bonuses?.forEach((b: any) => {
                                            if (b.ability.toUpperCase().startsWith(stat) && b.ability !== 'Any') bonus += b.bonus;
                                        });
                                        selectedSubrace?.ability_bonuses?.forEach((b: any) => {
                                            if (b.ability.toUpperCase().startsWith(stat) && b.ability !== 'Any') bonus += b.bonus;
                                        });
                                        const localAnyBonuses = [
                                            ...(selectedRace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || []),
                                            ...(selectedSubrace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || [])
                                        ];
                                        Object.entries(raceStatPicks).forEach(([key, pickedStat]) => {
                                            if (pickedStat === stat) {
                                                const idx = parseInt(key.replace('any-', ''));
                                                const actualBonus = localAnyBonuses[idx]?.bonus || 1;
                                                bonus += actualBonus;
                                            }
                                        });

                                        // Feat Stat Selections (+1 each)
                                        Object.values(featStatSelections).forEach(pickedStat => {
                                            if (pickedStat === stat) bonus += 1;
                                        });

                                        const baseVal = stats[stat];
                                        const finalVal = baseVal + bonus;
                                        const mod = Math.floor((finalVal - 10) / 2);
                                        const isPrimary = selectedClass?.primary_ability?.includes(stat === 'STR' ? 'Strength' : stat === 'DEX' ? 'Dexterity' : stat === 'CON' ? 'Constitution' : stat === 'INT' ? 'Intelligence' : stat === 'WIS' ? 'Wisdom' : 'Charisma');
                                        const canIncrease = baseVal < 15 && pointsLeft >= (POINT_BUY_COST[baseVal + 1] ?? 99) - POINT_BUY_COST[baseVal];
                                        const canDecrease = baseVal > 8;
                                        return (
                                            <div key={stat} className={`bg-gray-900 rounded-xl p-4 text-center border-2 ${isPrimary ? 'border-yellow-500' : 'border-gray-700'}`}>
                                                <h3 className="text-lg font-bold text-gray-300">{stat}</h3>
                                                {isPrimary && <span className="text-[10px] text-yellow-500 uppercase tracking-wider">Primary</span>}
                                                <div className="text-4xl font-black text-white my-3">{finalVal}</div>
                                                <div className={`text-sm font-bold mb-3 ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {mod >= 0 ? `+${mod}` : mod}
                                                </div>
                                                <div className="flex justify-between items-center bg-gray-800 rounded p-1">
                                                    <button
                                                        disabled={!canDecrease}
                                                        onClick={() => setStats(prev => ({ ...prev, [stat]: prev[stat] - 1 }))}
                                                        className="w-9 h-9 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
                                                    >-</button>
                                                    <span className="text-xs text-gray-400 font-mono">{baseVal} (Maliyet: {POINT_BUY_COST[baseVal] ?? '?'})</span>
                                                    <button
                                                        disabled={!canIncrease}
                                                        onClick={() => setStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }))}
                                                        className="w-9 h-9 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
                                                    >+</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-12 flex justify-between pt-6 border-t border-gray-700">
                            <button onClick={() => {
                                setStep(3.6);
                            }} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">Geri</button>
                            <button
                                onClick={() => {
                                    const asiLevelMap = ASI_LEVELS[selectedClass?.name ?? ""] ?? [4, 8, 12, 16, 19];
                                    const asiCount = asiLevelMap.filter(l => selectedLevel >= l).length;
                                    const raceFeatCount = getRaceFeatCount(selectedRace);
                                    const hasRaceFeat = raceFeatCount > 0;

                                    if (asiCount > 0 || hasRaceFeat) {
                                        if (asiCount > 0) {
                                            setAsiSelections(prev => prev.length === asiCount ? prev : Array(asiCount).fill({ type: 'stat2', stat1: 'STR' }));
                                        }
                                        setStep(4.5);
                                    } else {
                                        setStep(5);
                                        fetchSpells();
                                    }
                                }}
                                disabled={
                                    (statMethod === 'standard' && !Object.values(assignedValues).every(v => v !== null)) ||
                                    (statMethod === 'pointbuy' && pointsLeft < 0) ||
                                    (() => {
                                        const anyBonuses = [
                                            ...(selectedRace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || []),
                                            ...(selectedSubrace?.ability_bonuses?.filter((b: any) => b.ability === 'Any') || [])
                                        ];
                                        return Object.values(raceStatPicks).filter(v => v).length < anyBonuses.length;
                                    })()
                                }
                                className="px-10 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-lg font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-105"
                            >
                                Ileri
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4.5: Ability Score Improvement & Feats */}
                {step === 4.5 && (
                    <div className="max-w-3xl mx-auto animate-fadeIn mt-10">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-sm uppercase tracking-wider mb-2">Feat & ASI Seçimi</h2>
                            <p className="text-gray-400 text-lg">Seviyenizden dolayı {asiSelections.length} adet yetenek artışı (ASI) veya Feat seçme hakkınız var.</p>
                        </div>

                        <div className="space-y-6">
                            {/* ── Seviye ASI/Feat Seçimleri ── */}
                            {asiSelections.map((asi, idx) => (
                                <div key={`asi-${idx}`} className="bg-gray-800 rounded-xl p-5 border border-yellow-700/50 shadow-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-black text-yellow-500 tracking-widest text-sm uppercase flex items-center gap-2">
                                            <span className="bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                                            Seviye ASI / Feat
                                        </h3>
                                        <span className="text-[10px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded border border-gray-600 font-bold uppercase tracking-tighter">Sınıf Özelliği</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                        {(['stat2', 'stat11', 'feat'] as const).map(t => (
                                            <button key={t} onClick={() => {
                                                const newAsi = [...asiSelections];
                                                newAsi[idx] = { ...newAsi[idx], type: t, stat1: 'STR', stat2: 'DEX', featName: '' };
                                                setAsiSelections(newAsi);
                                            }} className={`px-4 py-3 border-2 rounded-xl text-sm font-bold transition-all ${asi.type === t ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400' : 'border-gray-600 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}>
                                                {t === 'stat2' ? '+2 Bir Stata' : t === 'stat11' ? '+1 İki Stata' : 'Feat Seç'}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-700">
                                        {asi.type === 'stat2' && (
                                            <div>
                                                <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Hangi yeteneğe +2 eklensin?</label>
                                                <select value={asi.stat1} onChange={e => {
                                                    const newAsi = [...asiSelections];
                                                    newAsi[idx] = { ...newAsi[idx], stat1: e.target.value };
                                                    setAsiSelections(newAsi);
                                                }} className="w-full bg-gray-950 border border-gray-700 text-white rounded p-2 outline-none focus:border-yellow-500 font-bold">
                                                    {Object.keys(stats).map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        {asi.type === 'stat11' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">1. Yetenek (+1)</label>
                                                    <select value={asi.stat1} onChange={e => {
                                                        const newAsi = [...asiSelections];
                                                        newAsi[idx] = { ...newAsi[idx], stat1: e.target.value };
                                                        setAsiSelections(newAsi);
                                                    }} className="w-full bg-gray-950 border border-gray-700 text-white rounded p-2 outline-none focus:border-yellow-500 font-bold">
                                                        {Object.keys(stats).map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">2. Yetenek (+1)</label>
                                                    <select value={asi.stat2} onChange={e => {
                                                        const newAsi = [...asiSelections];
                                                        newAsi[idx] = { ...newAsi[idx], stat2: e.target.value };
                                                        setAsiSelections(newAsi);
                                                    }} className="w-full bg-gray-950 border border-gray-700 text-white rounded p-2 outline-none focus:border-yellow-500 font-bold">
                                                        {Object.keys(stats).map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    {asi.stat1 === asi.stat2 && <span className="text-red-400 text-[10px] mt-1 block">Aynı statı iki kez seçemezsiniz (bunun yerine +2 seçeneğini kullanın).</span>}
                                                </div>
                                            </div>
                                        )}
                                        {asi.type === 'feat' && (
                                            <div>
                                                <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Feat Seçin</label>
                                                <button
                                                    onClick={() => { setShowFeatPicker(idx); setFeatSearch(''); setFeatCategoryFilter('All'); setExpandedFeat(null); }}
                                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 border border-yellow-700/50 rounded-xl text-sm font-bold transition-all hover:border-yellow-500 hover:bg-yellow-900/10"
                                                >
                                                    <span className={asi.featName ? 'text-yellow-300' : 'text-gray-500'}>
                                                        {asi.featName || '📖 Feat seçmek için tıkla...'}
                                                    </span>
                                                    <span className="text-gray-500 text-xs">▼ {ALL_FEATS.length} feat</span>
                                                </button>
                                                {asi.featName && (() => {
                                                    const f = ALL_FEATS.find(x => x.name === asi.featName);
                                                    if (!f) return null;
                                                    return (
                                                        <div className="mt-2 p-3 bg-yellow-900/10 border border-yellow-800/40 rounded-lg">
                                                            <p className="text-xs text-gray-300 leading-relaxed">{f.desc_tr}</p>
                                                            {f.prereq && <p className="text-yellow-600 text-[10px] mt-1 font-bold">Önkoşul: {f.prereq}</p>}
                                                            {asi.featName === 'Metamagic Adept' && (
                                                                <div className="mt-4 border-t border-yellow-800/30 pt-3">
                                                                    <p className="text-xs font-bold text-yellow-400 mb-2 uppercase tracking-wide">2 Adet Metamagic Seçin ({metamagicSelections.length}/2)</p>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {ALL_METAMAGICS.map(m => {
                                                                            const isSel = metamagicSelections.includes(m.name);
                                                                            const isDisabled = !isSel && metamagicSelections.length >= 2;
                                                                            return (
                                                                                <label
                                                                                    key={m.name}
                                                                                    className={`flex items-center p-2 border rounded-lg transition-all cursor-pointer ${isSel ? 'bg-yellow-900/40 border-yellow-500' : isDisabled ? 'bg-gray-800 opacity-50 border-gray-700 cursor-not-allowed' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isSel}
                                                                                        disabled={isDisabled}
                                                                                        onChange={() => {
                                                                                            if (isSel) setMetamagicSelections(metamagicSelections.filter(x => x !== m.name));
                                                                                            else if (!isDisabled) setMetamagicSelections([...metamagicSelections, m.name]);
                                                                                        }}
                                                                                        className="form-checkbox h-4 w-4 text-yellow-600 transition duration-150 ease-in-out mr-2"
                                                                                    />
                                                                                    <div className="flex flex-col">
                                                                                        <span className={`text-xs font-bold ${isSel ? 'text-yellow-300' : 'text-gray-300'}`}>{m.name}</span>
                                                                                        <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{m.desc}</span>
                                                                                    </div>
                                                                                </label>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Feat Selection Area (Spells & Stats) */}
                                                            {(() => {
                                                                const reqs = getFeatRequirements(asi.featName);
                                                                if (!reqs) return null;
                                                                return (
                                                                    <div className="mt-4 border-t border-yellow-800/30 pt-3 space-y-4">
                                                                        {reqs.statChoices && (
                                                                            <FeatStatSelectionArea
                                                                                featName={asi.featName}
                                                                                requirements={reqs}
                                                                                selection={featStatSelections[asi.featName]}
                                                                                onUpdate={(val: string) => setFeatStatSelections(prev => ({ ...prev, [asi.featName as string]: val }))}
                                                                            />
                                                                        )}
                                                                        {reqs.slots && (
                                                                            <FeatSpellSelectionArea
                                                                                featName={asi.featName}
                                                                                requirements={reqs}
                                                                                selections={featSpellSelections[asi.featName as string] || []}
                                                                                token={token}
                                                                                onUpdate={(newSels: any[]) => setFeatSpellSelections(prev => ({ ...prev, [asi.featName as string]: newSels }))}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* ── IRK BONUS FEAT SEÇİMLERİ (ÖRN: VARIANT HUMAN) ── */}
                            {getRaceFeatCount(selectedRace) > 0 && (() => {
                                const featCount = getRaceFeatCount(selectedRace);
                                return Array.from({ length: featCount }, (_, i) => (
                                    <div key={`race-feat-${i}`} className="bg-gray-800 rounded-xl p-5 border border-rose-700/50 shadow-lg">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-black text-rose-500 tracking-widest text-sm uppercase flex items-center gap-2">
                                                <span className="bg-rose-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">★</span>
                                                Irk Bonus Feat
                                            </h3>
                                            <span className="text-[10px] bg-rose-900/40 text-rose-300 px-2 py-0.5 rounded border border-rose-700 font-bold uppercase tracking-tighter">{selectedRace?.name} Mirası</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-4">{selectedRace!.name}, 1. seviyede ücretsiz bir Feat kazanır.</p>

                                        <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-700">
                                            <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Bonus Feat Seçin</label>
                                            <button
                                                onClick={() => { setRaceBonusFeat(i); setFeatSearch(''); setFeatCategoryFilter('All'); setExpandedFeat(null); }}
                                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 border border-rose-700/50 rounded-xl text-sm font-bold transition-all hover:border-rose-500 hover:bg-rose-900/10"
                                            >
                                                <span className={raceFeatStore[i] ? 'text-rose-300' : 'text-gray-500'}>
                                                    {raceFeatStore[i] || '📖 Ücretsiz feat seç...'}
                                                </span>
                                                <span className="text-gray-500 text-xs">▼ {ALL_FEATS.length} feat</span>
                                            </button>
                                            {raceFeatStore[i] && (() => {
                                                const f = ALL_FEATS.find(x => x.name === raceFeatStore[i]);
                                                if (!f) return null;
                                                return (
                                                    <div className="mt-2 p-3 bg-rose-900/10 border border-rose-800/40 rounded-lg">
                                                        <p className="text-xs text-gray-300 leading-relaxed">{f.desc_tr}</p>
                                                        {f.prereq && <p className="text-rose-600 text-[10px] mt-1 font-bold">Önkoşul: {f.prereq}</p>}
                                                        {raceFeatStore[i] === 'Metamagic Adept' && (
                                                            <div className="mt-4 border-t border-rose-800/30 pt-3">
                                                                <p className="text-xs font-bold text-rose-400 mb-2 uppercase tracking-wide">2 Adet Metamagic Seçin ({metamagicSelections.length}/2)</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {ALL_METAMAGICS.map(m => {
                                                                        const isSel = metamagicSelections.includes(m.name);
                                                                        const isDisabled = !isSel && metamagicSelections.length >= 2;
                                                                        return (
                                                                            <label
                                                                                key={m.name}
                                                                                className={`flex items-center p-2 border rounded-lg transition-all cursor-pointer ${isSel ? 'bg-rose-900/40 border-rose-500' : isDisabled ? 'bg-gray-800 opacity-50 border-gray-700 cursor-not-allowed' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSel}
                                                                                    disabled={isDisabled}
                                                                                    onChange={() => {
                                                                                        if (isSel) setMetamagicSelections(metamagicSelections.filter(x => x !== m.name));
                                                                                        else if (!isDisabled) setMetamagicSelections([...metamagicSelections, m.name]);
                                                                                    }}
                                                                                    className="form-checkbox h-4 w-4 text-rose-600 transition duration-150 ease-in-out mr-2"
                                                                                />
                                                                                <div className="flex flex-col">
                                                                                    <span className={`text-xs font-bold ${isSel ? 'text-rose-300' : 'text-gray-300'}`}>{m.name}</span>
                                                                                    <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{m.desc}</span>
                                                                                </div>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Feat Selection Area (Spells & Stats) */}
                                                        {(() => {
                                                            const reqs = getFeatRequirements(raceFeatStore[i]);
                                                            if (!reqs) return null;
                                                            return (
                                                                <div className="mt-4 border-t border-rose-800/30 pt-3 space-y-4">
                                                                    {reqs.statChoices && (
                                                                        <FeatStatSelectionArea
                                                                            featName={raceFeatStore[i]}
                                                                            requirements={reqs}
                                                                            selection={featStatSelections[raceFeatStore[i] as string]}
                                                                            onUpdate={(val: string) => setFeatStatSelections(prev => ({ ...prev, [raceFeatStore[i] as string]: val }))}
                                                                            isRaceFeat={true}
                                                                        />
                                                                    )}
                                                                    {reqs.slots && (
                                                                        <FeatSpellSelectionArea
                                                                            featName={raceFeatStore[i]}
                                                                            requirements={reqs}
                                                                            selections={featSpellSelections[raceFeatStore[i] as string] || []}
                                                                            token={token}
                                                                            onUpdate={(newSels: any[]) => setFeatSpellSelections(prev => ({ ...prev, [raceFeatStore[i] as string]: newSels }))}
                                                                            isRaceFeat={true}
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>

                        <div className="mt-12 flex justify-between pt-6 border-t border-gray-700">
                            <button onClick={() => setStep(4)} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">Geri</button>
                            <button onClick={() => {
                                // Validation
                                const invalid = asiSelections.some(asi =>
                                    (asi.type === 'stat11' && asi.stat1 === asi.stat2) ||
                                    (asi.type === 'feat' && !asi.featName?.trim())
                                );
                                const raceFeatCount = getRaceFeatCount(selectedRace);
                                const raceInvalid = Array.from({ length: raceFeatCount }).some((_, i) => !raceFeatStore[i]);

                                if (invalid) return alert("Lütfen ASI seçimlerinizi geçerli şekilde tamamlayın (aynı statı iki kez seçmeyin veya Feat adını boş bırakmayın).");
                                if (raceInvalid) return alert("Lütfen ırkınızdan gelen bonus feat seçimini tamamlayın.");

                                setStep(5);
                                fetchSpells();
                            }} className="px-10 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded-lg text-lg font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-105">
                                Ileri: Son Adım
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Buyul Secimi - yeniden tasarlandi */}
                {step === 5 && (() => {
                    const limits = getSpellLimits();
                    const isSpellcaster = SPELLCASTING_CLASSES.includes(selectedClass?.name ?? "");
                    const cantrips = availableSpells.filter(s => s.level_int === 0);
                    const leveled = availableSpells.filter(s => s.level_int > 0);

                    const filterSpell = (spell: any) => {
                        const matchSearch = !spellSearch || spell.name.toLowerCase().includes(spellSearch.toLowerCase());
                        const matchSchool = spellSchoolFilter === "all" || spell.school === spellSchoolFilter;
                        const tags = getSpellTags(spell);
                        const matchType = spellTypeFilter === "all" || tags.includes(spellTypeFilter);
                        return matchSearch && matchSchool && matchType;
                    };


                    return (
                        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
                            <h2 className="text-3xl font-bold mb-1 text-white">Büyü Seçimi</h2>
                            <p className="text-gray-400 text-sm mb-4">
                                {selectedClass?.name} sınıfına ait büyüler.
                                {!isSpellcaster && <span className="ml-2 text-yellow-400 font-semibold">(Bu sınıf büyücü değildir — atlayabilirsin)</span>}
                            </p>

                            <div className="space-y-3 mb-5 p-4 bg-gray-900 rounded-xl border border-gray-700">
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        type="text" placeholder="Büyü ara..."
                                        value={spellSearch} onChange={e => setSpellSearch(e.target.value)}
                                        className="flex-1 min-w-[160px] bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                    <select value={spellSchoolFilter} onChange={e => setSpellSchoolFilter(e.target.value)}
                                        className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 text-sm focus:outline-none focus:border-blue-500">
                                        {SCHOOLS.map(s => <option key={s} value={s}>{s === "all" ? "Tüm Okullar" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase self-center mr-2">Kategori:</span>
                                    {SPELL_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSpellTypeFilter(type)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${spellTypeFilter === type
                                                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                                                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            {type === 'all' ? 'HEPSİ' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loadingSpells ? (
                                <div className="text-center text-gray-400 py-12 text-xl">✨ Büyüler yükleniyor...</div>
                            ) : (
                                <div className="space-y-6">
                                    {/* TABS HEADER */}
                                    <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-thin scrollbar-thumb-gray-600">
                                        {limits.cantrips > 0 && (
                                            <button
                                                onClick={() => setActiveSpellTab(0)}
                                                className={`px-4 py-2 rounded-lg font-bold shrink-0 transition-all ${activeSpellTab === 0 ? 'bg-yellow-600 text-gray-900 shadow-[0_0_10px_rgba(202,138,4,0.5)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                            >
                                                Kantripler {selectedCantrips.length > 0 && <span className="text-xs bg-black/30 text-white px-1.5 py-0.5 rounded ml-1">{selectedCantrips.length}/{limits.cantrips}</span>}
                                            </button>
                                        )}
                                        {limits.spells > 0 && Array.from(new Set(leveled.map(s => s.level_int))).sort((a, b) => a - b).map(lvl => {
                                            const pickedAtLvl = selectedLeveledSpells.filter(name => leveled.find(s => s.name === name)?.level_int === lvl).length;
                                            return (
                                                <button
                                                    key={lvl}
                                                    onClick={() => setActiveSpellTab(lvl)}
                                                    className={`px-4 py-2 rounded-lg font-bold shrink-0 transition-all ${activeSpellTab === lvl ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                                >
                                                    Seviye {lvl} {pickedAtLvl > 0 && <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded ml-1">{pickedAtLvl}</span>}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* GLOBAL LIMIT INDICATORS */}
                                    <div className="flex flex-wrap items-center gap-6 bg-gray-900/80 p-4 rounded-xl border border-gray-700 shadow-inner mb-6">
                                        {limits.cantrips > 0 && (
                                            <div>
                                                <span className="text-yellow-500 uppercase font-black tracking-widest text-[10px] block mb-1">Cantrip Hakkı</span>
                                                <span className={`text-lg font-bold ${selectedCantrips.length >= limits.cantrips ? 'text-green-400' : 'text-gray-300'}`}>
                                                    {selectedCantrips.length} <span className="text-gray-500 text-sm">/ {limits.cantrips} Seçildi</span>
                                                </span>
                                            </div>
                                        )}
                                        {limits.spells > 0 && (
                                            <div className={`${limits.cantrips > 0 ? 'border-l border-gray-700 pl-6' : ''}`}>
                                                <span className="text-blue-500 uppercase font-black tracking-widest text-[10px] block mb-1">Büyü Hakkı (Svl 1+)</span>
                                                <span className={`text-lg font-bold ${selectedLeveledSpells.length >= limits.spells ? 'text-green-400' : 'text-gray-300'}`}>
                                                    {selectedLeveledSpells.length} <span className="text-gray-500 text-sm">/ {limits.spells} Seçildi</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* ACTIVE TAB CONTENT */}
                                    {activeSpellTab === 0 && limits.cantrips > 0 && (
                                        <div className="animate-fade-in">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {cantrips.filter(filterSpell).map(spell => {
                                                    const isSelected = selectedCantrips.includes(spell.name);
                                                    const limitReached = selectedCantrips.length >= limits.cantrips && !isSelected;
                                                    return (
                                                        <SpellCard
                                                            key={spell._id} spell={spell} isCantrip={true} limits={limits}
                                                            isSelected={isSelected} limitReached={limitReached}
                                                            toggleCantrip={toggleCantrip} toggleLeveledSpell={toggleLeveledSpell}
                                                        />
                                                    );
                                                })}
                                                {cantrips.filter(filterSpell).length === 0 && <p className="text-gray-400 italic text-sm col-span-1 md:col-span-2 lg:col-span-3 text-center py-8 bg-gray-900/50 rounded-xl border border-gray-800">Seçtiğiniz filtrelere uygun cantrip bulunamadı.</p>}
                                            </div>
                                        </div>
                                    )}

                                    {activeSpellTab > 0 && limits.spells > 0 && (() => {
                                        const spellsAtLvl = leveled.filter(s => s.level_int === activeSpellTab && filterSpell(s));
                                        return (
                                            <div className="animate-fade-in">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {spellsAtLvl.map(spell => {
                                                        const isSelected = selectedLeveledSpells.includes(spell.name);
                                                        const limitReached = selectedLeveledSpells.length >= limits.spells && !isSelected;
                                                        return (
                                                            <SpellCard
                                                                key={spell._id} spell={spell} isCantrip={false} limits={limits}
                                                                isSelected={isSelected} limitReached={limitReached}
                                                                toggleCantrip={toggleCantrip} toggleLeveledSpell={toggleLeveledSpell}
                                                            />
                                                        );
                                                    })}
                                                    {spellsAtLvl.length === 0 && <p className="text-gray-400 italic text-sm col-span-1 md:col-span-2 lg:col-span-3 text-center py-8 bg-gray-900/50 rounded-xl border border-gray-800">Seçtiğiniz filtrelere uygun Seviye {activeSpellTab} büyüsü bulunamadı.</p>}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* SINIF VE IRK ÖZELLİKLERİ */}
                                    {(() => {
                                        const styles = FIGHTING_STYLES[selectedClass?.name ?? ""] ?? [];
                                        const autoFeatures = CLASS_AUTO_FEATURES[selectedClass?.name ?? ""] ?? [];
                                        const isRogue = selectedClass?.name === "Rogue";
                                        return (
                                            <div className="space-y-8 mt-5 border-t border-gray-700 pt-5">
                                                {/* Fighting Style secimi */}
                                                {styles.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h3 className="text-lg font-black text-orange-400 uppercase tracking-wide">⚔️ Savas Stili (Fighting Style)</h3>
                                                            <span className={`px-3 py-1 rounded-full text-sm font-black border ${selectedFightingStyle ? 'bg-green-900 text-green-300 border-green-700' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                                                                {selectedFightingStyle ? "✓ Secildi" : "1 tane sec"}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {styles.map(style => (
                                                                <div
                                                                    key={style.name}
                                                                    onClick={() => setSelectedFightingStyle(prev => prev === style.name ? "" : style.name)}
                                                                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${selectedFightingStyle === style.name
                                                                        ? 'border-orange-500 bg-orange-50 shadow-[0_0_8px_rgba(251,146,60,0.3)]'
                                                                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/20'
                                                                        }`}
                                                                >
                                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                                        <p className="font-black text-gray-900 text-sm">{style.name}</p>
                                                                        {selectedFightingStyle === style.name && <span className="text-orange-500 font-black shrink-0">✓</span>}
                                                                    </div>
                                                                    <p className="text-gray-600 text-xs leading-relaxed">{style.desc}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ── CLASS SKILL PROFICIENCY PICKER ── */}
                                                {(() => {
                                                    const clsProf = CLASS_SKILL_PROFS[selectedClass?.name ?? ''];
                                                    if (!clsProf) return null;
                                                    const { count, skills } = clsProf;
                                                    const bgSkills = (selectedBackground?.skills ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
                                                    const picked = selectedSkillProfs;
                                                    const canPick = count;
                                                    return (
                                                        <div className="mb-5">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h3 className="text-lg font-black text-purple-400 uppercase tracking-wide">🎓 Sınıf Beceri Uzmanlıkları</h3>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-black border ${picked.length >= canPick ? 'bg-purple-900 text-purple-300 border-purple-700' : 'bg-gray-700 text-gray-300 border-gray-600'
                                                                    }`}>{picked.length} / {canPick}</span>
                                                            </div>
                                                            {bgSkills.length > 0 && (
                                                                <p className="text-xs text-gray-400 mb-2">🎒 Background&apos;dan otomatik: <span className="text-yellow-400 font-bold">{bgSkills.join(', ')}</span></p>
                                                            )}
                                                            <div className="flex flex-wrap gap-2">
                                                                {skills.map((skill: string) => {
                                                                    const fromBg = bgSkills.includes(skill);
                                                                    const isSelected = picked.includes(skill) || fromBg;
                                                                    const atLimit = picked.length >= canPick && !picked.includes(skill);
                                                                    return (
                                                                        <button key={skill}
                                                                            disabled={fromBg || atLimit}
                                                                            onClick={() => {
                                                                                if (fromBg || atLimit) return;
                                                                                setSelectedSkillProfs(prev =>
                                                                                    prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                                                                                );
                                                                            }}
                                                                            className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${fromBg ? 'bg-yellow-900/60 text-yellow-300 border-yellow-600 cursor-default' :
                                                                                isSelected ? 'bg-purple-700 text-white border-purple-500' :
                                                                                    atLimit ? 'opacity-30 cursor-not-allowed bg-gray-700 text-gray-500 border-gray-600' :
                                                                                        'bg-gray-700 text-gray-300 border-gray-600 hover:border-purple-400 hover:text-purple-300'
                                                                                }`}
                                                                        >{skill}{fromBg ? ' ✓' : ''}</button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Rogue Expertise */}
                                                {isRogue && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h3 className="text-lg font-black text-green-400 uppercase tracking-wide">🎯 Expertise (2 beceri sec)</h3>
                                                            <span className={`px-3 py-1 rounded-full text-sm font-black border ${selectedExpertise.length >= 2 ? 'bg-green-900 text-green-300 border-green-700' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                                                                {selectedExpertise.length} / 2
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {ROGUE_SKILLS.map(skill => {
                                                                const isSelected = selectedExpertise.includes(skill);
                                                                const atLimit = selectedExpertise.length >= 2 && !isSelected;
                                                                return (
                                                                    <button key={skill}
                                                                        onClick={() => {
                                                                            if (atLimit) return;
                                                                            setSelectedExpertise(prev => isSelected ? prev.filter(s => s !== skill) : [...prev, skill]);
                                                                        }}
                                                                        className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${isSelected ? 'bg-green-600 text-white border-green-500' :
                                                                            atLimit ? 'opacity-30 cursor-not-allowed bg-gray-700 text-gray-500 border-gray-600' :
                                                                                'bg-gray-700 text-gray-300 border-gray-600 hover:border-green-500 hover:text-green-300'
                                                                            }`}
                                                                    >{skill}</button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ── Race bonus feats removed from here, moved to Step 4.5 ── */}

                                                {/* ── HALF-ELF +2 SKILLS ── */}
                                                {RACE_EXTRA_SKILLS[selectedRace?.name ?? ''] && (() => {
                                                    const needed = RACE_EXTRA_SKILLS[selectedRace!.name]!;
                                                    const ALL_SKILLS = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
                                                    return (
                                                        <div className="mb-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h3 className="text-lg font-black text-teal-400 uppercase tracking-wide">🌟 {selectedRace!.name} Ekstra Beceriler</h3>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-black border ${raceExtraSkills.length >= needed ? 'bg-teal-900 text-teal-300 border-teal-700' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>{raceExtraSkills.length} / {needed}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mb-2">Half-Elf, herhangi 2 beceri listesinden proficiency kazanır.</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {ALL_SKILLS.map(skill => {
                                                                    const isSel = raceExtraSkills.includes(skill);
                                                                    const atLim = raceExtraSkills.length >= needed && !isSel;
                                                                    return (
                                                                        <button key={skill} onClick={() => { if (atLim) return; setRaceExtraSkills(prev => isSel ? prev.filter(s => s !== skill) : [...prev, skill]); }}
                                                                            className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${isSel ? 'bg-teal-700 text-white border-teal-500' : atLim ? 'opacity-30 cursor-not-allowed bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-teal-400 hover:text-teal-300'}`}
                                                                        >{skill}</button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ── BARD EXPERTISE ── */}
                                                {selectedClass?.name === 'Bard' && (() => {
                                                    const ALL_SKILLS = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
                                                    const needed = selectedLevel >= 3 ? 4 : 2;
                                                    return (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h3 className="text-lg font-black text-green-400 uppercase tracking-wide">🎭 Expertise ({needed} beceri)</h3>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-black border ${bardExpertise.length >= needed ? 'bg-green-900 text-green-300 border-green-700' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>{bardExpertise.length} / {needed}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mb-2">Bard, seçilen becerilerde Proficiency bonusu ikiye katlanır (Expertise).</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {ALL_SKILLS.map(skill => {
                                                                    const isSel = bardExpertise.includes(skill);
                                                                    const atLim = bardExpertise.length >= needed && !isSel;
                                                                    return (
                                                                        <button key={skill} onClick={() => { if (atLim) return; setBardExpertise(prev => isSel ? prev.filter(s => s !== skill) : [...prev, skill]); }}
                                                                            className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${isSel ? 'bg-green-600 text-white border-green-500' : atLim ? 'opacity-30 cursor-not-allowed bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-green-400 hover:text-green-300'}`}
                                                                        >{skill}</button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ── WARLOCK: ELDRITCH INVOCATIONS ── */}
                                                {selectedClass?.name === 'Warlock' && selectedLevel >= 2 && (() => {
                                                    const invocCount = selectedLevel >= 18 ? 8 : selectedLevel >= 15 ? 7 : selectedLevel >= 12 ? 6 : selectedLevel >= 9 ? 5 : selectedLevel >= 7 ? 4 : selectedLevel >= 5 ? 3 : 2;
                                                    const INVOCATIONS = ['Agonizing Blast', 'Armor of Shadows', 'Ascendant Step', 'Beast Speech', 'Beguiling Influence', 'Bewitching Whispers', 'Book of Ancient Secrets', 'Chains of Carceri', 'Devil\'s Sight', 'Dreadful Word', 'Eldritch Sight', 'Eldritch Spear', 'Eyes of the Rune Keeper', 'Fiendish Vigor', 'Gaze of Two Minds', 'Ghostly Gaze', 'Gift of the Depths', 'Gift of the Ever-Living Ones', 'Grasp of Hadar', 'Improved Pact Weapon', 'Investment of the Chain Master', 'Lance of Lethargy', 'Lifedrinker', 'Maddening Hex', 'Mask of Many Faces', 'Master of Myriad Forms', 'Minions of Chaos', 'Misty Visions', 'One with Shadows', 'Otherworldly Leap', 'Relentless Hex', 'Repelling Blast', 'Sculptor of Flesh', 'Sign of Ill Omen', 'Thief of Five Fates', 'Thirsting Blade', 'Tomb of Levistus', 'Trickster\'s Escape', 'Undying Servitude', 'Visions of Distant Realms', 'Voice of the Chain Master', 'Whispers of the Grave', 'Witch Sight'];
                                                    return (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h3 className="text-lg font-black text-violet-400 uppercase tracking-wide">👁️ Eldritch Invocations</h3>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-black border ${warlockInvocations.length >= invocCount ? 'bg-violet-900 text-violet-300 border-violet-700' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>{warlockInvocations.length} / {invocCount}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mb-2">Patronundan güç hediyeleri — {invocCount} Invocation seç.</p>
                                                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                                                {INVOCATIONS.map(inv => {
                                                                    const isSel = warlockInvocations.includes(inv);
                                                                    const atLim = warlockInvocations.length >= invocCount && !isSel;
                                                                    return (
                                                                        <button key={inv} onClick={() => { if (atLim) return; setWarlockInvocations(prev => isSel ? prev.filter(x => x !== inv) : [...prev, inv]); }}
                                                                            className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${isSel ? 'bg-violet-700 text-white border-violet-500' : atLim ? 'opacity-30 cursor-not-allowed bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-violet-400 hover:text-violet-300'}`}
                                                                        >{inv}</button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ── WARLOCK: PACT BOON ── */}
                                                {selectedClass?.name === 'Warlock' && selectedLevel >= 3 && (
                                                    <div>
                                                        <h3 className="text-lg font-black text-violet-400 uppercase tracking-wide mb-3">🔮 Pact Boon</h3>
                                                        <p className="text-xs text-gray-400 mb-2">Patronunun sana verdiği bağ hediyesi.</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {[
                                                                { name: 'Pact of the Blade', desc: 'Bonus eylemle bir silah çağırabilirsin. Bu silahla CHA kullanabilirsin. Savaş silahınla saldırılarda Eldritch Invocation keşiflerini uygulayabilirsin.' },
                                                                { name: 'Pact of the Chain', desc: 'Find Familiar büyüsünü öğren ve özel Familiar türleri (Imp, Quasit, Pseudodragon, Sprite) seçebilirsin.' },
                                                                { name: 'Pact of the Tome', desc: 'Herhangi 3 cantrip öğrenen bir kitap kazanırsın (tüm büyü listelerinden seçilebilir).' },
                                                                { name: 'Pact of the Talisman', desc: 'Bir muska takar, kazıyan yetenek zarı başarısız olduğunda d4 ekler.' },
                                                            ].map(p => (
                                                                <div key={p.name} onClick={() => setWarlockPact(prev => prev === p.name ? '' : p.name)}
                                                                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${warlockPact === p.name ? 'border-violet-500 bg-violet-900/20' : 'border-gray-700 bg-gray-900/50 hover:border-violet-700'}`}>
                                                                    <p className="font-black text-sm mb-1">{p.name} {warlockPact === p.name && '✓'}</p>
                                                                    <p className="text-gray-400 text-xs">{p.desc}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ── BATTLE MASTER MANEUVERS ── */}
                                                {selectedSubclass?.name === 'Battle Master' && (() => {
                                                    const manCount = selectedLevel >= 15 ? 6 : selectedLevel >= 7 ? 5 : 3;
                                                    const MANEUVERS = ['Ambush', 'Bait and Switch', 'Brace', 'Commander\'s Strike', 'Commanding Presence', 'Disarming Attack', 'Distracting Strike', 'Evasive Footwork', 'Feinting Attack', 'Goading Attack', 'Grappling Strike', 'Lunging Attack', 'Maneuvering Attack', 'Menacing Attack', 'Parry', 'Precision Attack', 'Pushing Attack', 'Quick Toss', 'Rally', 'Riposte', 'Sweeping Attack', 'Tactical Assessment', 'Trip Attack'];
                                                    return (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">⚔️ Battle Master Maneuvers</h3>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-black border ${bmManeuvers.length >= manCount ? 'bg-amber-900 text-amber-300 border-amber-700' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>{bmManeuvers.length} / {manCount}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mb-3">Taktiksel Superiority Dice kullanan özel kombo hareketler. {manCount} maneuver seç.</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {MANEUVERS.map(m => {
                                                                    const isSel = bmManeuvers.includes(m);
                                                                    const atLim = bmManeuvers.length >= manCount && !isSel;
                                                                    return (
                                                                        <button key={m} onClick={() => { if (atLim) return; setBmManeuvers(prev => isSel ? prev.filter(x => x !== m) : [...prev, m]); }}
                                                                            className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${isSel ? 'bg-amber-700 text-white border-amber-500' : atLim ? 'opacity-30 cursor-not-allowed bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-amber-400 hover:text-amber-300'}`}
                                                                        >{m}</button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ── CHAMPION: ADDITIONAL FIGHTING STYLE (lvl 10+) ── */}
                                                {selectedSubclass?.name === 'Champion' && selectedLevel >= 10 && (() => {
                                                    const styles = FIGHTING_STYLES['Fighter'] ?? [];
                                                    return (
                                                        <div>
                                                            <h3 className="text-lg font-black text-orange-400 uppercase tracking-wide mb-3">⚔️ Champion: Ek Savaş Stili</h3>
                                                            <p className="text-xs text-gray-400 mb-3">Seviye 10 Champion özelliği: İkinci bir Fighting Style kazanırsın.</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {styles.filter(s => s.name !== selectedFightingStyle).map(style => (
                                                                    <div key={style.name} onClick={() => setChampionExtraStyle(prev => prev === style.name ? '' : style.name)}
                                                                        className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${championExtraStyle === style.name ? 'border-orange-500 bg-orange-900/20' : 'border-gray-700 bg-gray-900/50 hover:border-orange-700'}`}>
                                                                        <p className="font-black text-sm mb-1">{style.name} {championExtraStyle === style.name && '✓'}</p>
                                                                        <p className="text-gray-400 text-xs">{style.desc}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ── HEXBLADE: AUTO PROFICIENCIES (info card) ── */}
                                                {selectedSubclass?.name === 'Hexblade' && (
                                                    <div className="p-3 rounded-lg border border-violet-700/50 bg-violet-900/10">
                                                        <p className="font-black text-violet-300 text-sm mb-1">⚔️ Hexblade: Otomatik Özellikler</p>
                                                        <p className="text-gray-400 text-xs">Medium Armor, Kalkan ve Martial Weapon proficiency otomatik olarak eklendi. Karizma ile silah saldırıları yapabilirsin (Hex Warrior).</p>
                                                    </div>
                                                )}

                                                {/* Otomatik sinif ozellikleri */}
                                                {autoFeatures.length > 0 && (
                                                    <div>
                                                        <h3 className="text-lg font-black text-gray-300 uppercase tracking-wide mb-3">📋 Otomatik Sinif Ozellikleri</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {autoFeatures.map(f => (
                                                                <div key={f.name} className="p-3 rounded-lg border border-gray-600 bg-gray-900/60">
                                                                    <p className="font-black text-white text-sm mb-1">✦ {f.name}</p>
                                                                    <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-gray-500 text-xs mt-2 italic">Bu ozellikler karakter sayfanda otomatik olarak gözükecek.</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            <div className="mt-8 flex justify-between pt-6 border-t border-gray-700">
                                <button onClick={() => {
                                    const asiLevelMap = ASI_LEVELS[selectedClass?.name ?? ""] ?? [4, 8, 12, 16, 19];
                                    const asiCount = asiLevelMap.filter(l => selectedLevel >= l).length;
                                    const raceFeatCount = getRaceFeatCount(selectedRace);
                                    const hasRaceFeat = raceFeatCount > 0;
                                    setStep((asiCount > 0 || hasRaceFeat) ? 4.5 : 4);
                                }} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors">Geri</button>
                                <button onClick={handleSave} className="px-10 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded-lg text-lg font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-105">
                                    ✨ Karakteri Yarat
                                </button>
                            </div>
                        </div>
                    );
                })()}

            </div>

            {/* ══════════ FEAT PICKER MODAL ══════════ */}
            {
                (showFeatPicker !== null || raceBonusFeat !== null) && (() => {
                    const isRacePicker = raceBonusFeat !== null;
                    const currentFeat = isRacePicker ? raceFeatStore[raceBonusFeat!] : asiSelections[showFeatPicker!]?.featName;
                    const closeModal = () => { setShowFeatPicker(null); setRaceBonusFeat(null); };
                    const selectFeat = (featName: string) => {
                        if (isRacePicker) {
                            setRaceFeatStore(prev => ({ ...prev, [raceBonusFeat!]: featName }));
                        } else {
                            const newAsi = [...asiSelections];
                            newAsi[showFeatPicker!] = { ...newAsi[showFeatPicker!], featName };
                            setAsiSelections(newAsi);
                        }
                        closeModal();
                    };
                    const CATEGORIES = ['All', 'General', 'Half Feat', 'Skill', 'Origin', 'Fighting Style', 'Epic Boon'];
                    const filtered = ALL_FEATS.filter(f => {
                        const matchCat = featCategoryFilter === 'All' || f.category === featCategoryFilter;
                        const matchSearch = !featSearch || f.name.toLowerCase().includes(featSearch.toLowerCase()) || f.desc_tr.toLowerCase().includes(featSearch.toLowerCase());
                        return matchCat && matchSearch;
                    });
                    return (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-gray-900 rounded-2xl border border-yellow-700/50 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="px-6 py-4 bg-gradient-to-r from-yellow-900/40 to-gray-900 border-b border-yellow-800/30 flex items-center justify-between shrink-0">
                                    <div>
                                        <h2 className="text-xl font-black text-yellow-400">📖 Feat Seç</h2>
                                        <p className="text-gray-400 text-xs">{ALL_FEATS.length} resmi feat — birine tıkla ve açıklamasını oku, seç</p>
                                    </div>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl leading-none">✕</button>
                                </div>

                                {/* Search + Category Filter */}
                                <div className="px-4 py-3 border-b border-gray-800 shrink-0 space-y-2">
                                    <input
                                        autoFocus
                                        value={featSearch}
                                        onChange={e => setFeatSearch(e.target.value)}
                                        placeholder="🔍 Feat adı veya açıklama ara..."
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-yellow-500"
                                    />
                                    <div className="flex flex-wrap gap-1.5">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setFeatCategoryFilter(cat)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${featCategoryFilter === cat
                                                    ? 'bg-yellow-600 text-white border-yellow-500'
                                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-yellow-600 hover:text-yellow-300'
                                                    }`}
                                            >{cat}</button>
                                        ))}
                                        <span className="ml-auto text-gray-600 text-xs self-center">{filtered.length} sonuç</span>
                                    </div>
                                </div>

                                {/* Feat List */}
                                <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
                                    {filtered.length === 0 && (
                                        <p className="text-center text-gray-500 py-8">Sonuç bulunamadı…</p>
                                    )}
                                    {filtered.map(feat => {
                                        const isExpanded = expandedFeat === feat.name;
                                        const isSelected = currentFeat === feat.name;
                                        return (
                                            <div
                                                key={feat.name}
                                                className={`rounded-xl border transition-all overflow-hidden ${isSelected
                                                    ? 'border-yellow-500 bg-yellow-900/20'
                                                    : isExpanded
                                                        ? 'border-gray-600 bg-gray-800'
                                                        : 'border-gray-700/50 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                                                    }`}
                                            >
                                                {/* Row */}
                                                <div
                                                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                                                    onClick={() => setExpandedFeat(isExpanded ? null : feat.name)}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`font-black text-sm ${isSelected ? 'text-yellow-300' : 'text-white'}`}>{feat.name}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${feat.category === 'Epic Boon' ? 'text-purple-300 border-purple-700 bg-purple-900/40' :
                                                                feat.category === 'Half Feat' ? 'text-blue-300 border-blue-700 bg-blue-900/40' :
                                                                    feat.category === 'Skill' ? 'text-green-300 border-green-700 bg-green-900/40' :
                                                                        feat.category === 'Origin' ? 'text-orange-300 border-orange-700 bg-orange-900/40' :
                                                                            feat.category === 'Fighting Style' ? 'text-red-300 border-red-700 bg-red-900/40' :
                                                                                'text-gray-400 border-gray-600 bg-gray-800'
                                                                }`}>{feat.category}</span>
                                                            {feat.prereq && <span className="text-[10px] text-yellow-600 font-bold">⚠ {feat.prereq}</span>}
                                                            {isSelected && <span className="text-[10px] text-yellow-400 font-black">✓ SEÇİLDİ</span>}
                                                        </div>
                                                        {!isExpanded && (
                                                            <p className="text-gray-500 text-[11px] truncate mt-0.5">{feat.desc_tr}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-600 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
                                                </div>
                                                {/* Expanded description + Select button */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-3 border-t border-gray-700/50 pt-2">
                                                        <p className="text-gray-300 text-sm leading-relaxed mb-3">{feat.desc_tr}</p>
                                                        <button
                                                            onClick={() => {
                                                                selectFeat(feat.name);
                                                            }}
                                                            className={`w-full py-2 rounded-lg text-sm font-black transition-all ${isSelected
                                                                ? 'bg-yellow-600 text-white hover:bg-yellow-500'
                                                                : 'bg-gray-700 text-gray-200 hover:bg-yellow-700 hover:text-white'
                                                                }`}
                                                        >
                                                            {isSelected ? '✓ Bu feat seçili — değiştirmek için başkasına tıkla' : `✨ "${feat.name}" seç`}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })()
            }
        </div >
    );
}
