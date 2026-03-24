// combat_data.ts — D&D 5e Combat & Resource Data

// ─── Concentration Spells (kapsamlı liste) ────────────────────────────────────
export const CONCENTRATION_SPELLS = new Set([
    // Cleric
    "Bless", "Bane", "Shield of Faith", "Guiding Bolt", "Inflict Wounds",
    "Spiritual Weapon", "Hold Person", "Silence", "Aid", "Blindness/Deafness",
    "Bestow Curse", "Animate Dead", "Divination", "Banishment", "Concentration",
    "Beacon of Hope", "Crusader's Mantle", "Spirit Guardians",
    "Conjure Celestial", "Flame Strike", "Guardian of Faith",
    // Wizard / Sorcerer
    "Hold Monster", "Wall of Force", "Dominate Monster", "Maze",
    "True Polymorph", "Dominate Person", "Bigby's Hand", "Dominate Beast",
    "Polymorph", "Greater Invisibility", "Confusion", "Hypnotic Pattern",
    "Haste", "Slow", "Fly", "Levitate", "Web",
    "Mirror Image", "Invisibility", "Blur", "Melf's Acid Arrow",
    "Phantasmal Force", "Suggestion", "Darkness", "Misty Step",
    "Enlarge/Reduce", "Crown of Madness", "Hold Person", "Hold Monster",
    "Stinking Cloud", "Sleet Storm", "Call Lightning", "Gaseous Form",
    "Wall of Fire", "Evard's Black Tentacles", "Arcane Eye",
    "Phantasmal Killer", "Resilient Sphere", "Otiluke's Freezing Sphere",
    "Disintegrate", "Globe of Invulnerability", "Irresistible Dance",
    "Telepathy", "Forcecage", "Demiplane", "Antipathy/Sympathy",
    "Power Word Pain", "Mirage Arcane", "Mental Prison", "Psychic Scream",
    "Feeblemind", "Maddening Darkness",
    // Druid
    "Entangle", "Faerie Fire", "Speak with Animals", "Call Lightning",
    "Conjure Animals", "Conjure Woodland Beings", "Conjure Elemental",
    "Conjure Fey", "Wall of Thorns", "Transport via Plants",
    "Wind Walk", "Heroes' Feast", "Sunbeam", "Tsunami", "Shapechange",
    "Storm of Vengeance", "Foresight", "True Resurrection", "Healing Spirit",
    "Erupting Earth", "Bones of the Earth",
    // Paladin
    "Bless", "Compelled Duel", "Protection from Evil and Good",
    "Command", "Wrathful Smite", "Thunderous Smite", "Searing Smite",
    "Blinding Smite", "Staggering Smite", "Banishing Smite", "Destructive Wave",
    "Aura of Purity", "Aura of Life", "Find Steed", "Find Greater Steed",
    "Circle of Power", "Dispel Evil and Good",
    // Ranger
    "Hunter's Mark", "Ensnaring Strike", "Fog Cloud", "Hail of Thorns",
    "Swift Quiver", "Conjure Barrage", "Conjure Volley",
    "Steel Wind Strike", "Freedom of Movement", "Grasping Vine",
    "Longstrider", "Absorb Elements",
    // Warlock
    "Hex", "Armor of Agathys", "Arms of Hadar", "Astral Projection",
    "Banishment", "Compulsory Fantasy", "Sickening Radiance",
    "Haunt", "Synaptic Static",
    // Bard
    "Faerie Fire", "Heroism", "Sleep", "Dissonant Whispers", "Cloud of Daggers",
    "Enthrall", "Heat Metal", "Shatter", "Major Image", "Hypnotic Pattern",
    "Leomund's Tiny Hut",
    // Monk
    "Stunning Focus",
]);

// ─── Spell Slot Tables ────────────────────────────────────────────────────────
// [level-1][slot level - 1]
const FULL_CASTER: number[][] = [
    [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
    [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
    [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
    [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
    [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
    [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
    [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
    [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
    [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
    [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
    [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
    [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
    [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
    [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
    [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];
const HALF_CASTER: number[][] = [
    [0, 0, 0, 0, 0], // 1
    [2, 0, 0, 0, 0], // 2
    [3, 0, 0, 0, 0], // 3
    [3, 0, 0, 0, 0], // 4
    [4, 2, 0, 0, 0], // 5
    [4, 2, 0, 0, 0], // 6
    [4, 3, 0, 0, 0], // 7
    [4, 3, 0, 0, 0], // 8
    [4, 3, 2, 0, 0], // 9
    [4, 3, 2, 0, 0], // 10
    [4, 3, 3, 0, 0], // 11
    [4, 3, 3, 0, 0], // 12
    [4, 3, 3, 1, 0], // 13
    [4, 3, 3, 1, 0], // 14
    [4, 3, 3, 2, 0], // 15
    [4, 3, 3, 2, 0], // 16
    [4, 3, 3, 3, 1], // 17
    [4, 3, 3, 3, 1], // 18
    [4, 3, 3, 3, 2], // 19
    [4, 3, 3, 3, 2], // 20
];
const ARTIFICER_CASTER: number[][] = [
    [2, 0, 0, 0, 0], // 1
    [2, 0, 0, 0, 0], // 2
    [3, 0, 0, 0, 0], // 3
    [3, 0, 0, 0, 0], // 4
    [4, 2, 0, 0, 0], // 5
    [4, 2, 0, 0, 0], // 6
    [4, 3, 0, 0, 0], // 7
    [4, 3, 0, 0, 0], // 8
    [4, 3, 2, 0, 0], // 9
    [4, 3, 2, 0, 0], // 10
    [4, 3, 3, 0, 0], // 11
    [4, 3, 3, 0, 0], // 12
    [4, 3, 3, 1, 0], // 13
    [4, 3, 3, 1, 0], // 14
    [4, 3, 3, 2, 0], // 15
    [4, 3, 3, 2, 0], // 16
    [4, 3, 3, 3, 1], // 17
    [4, 3, 3, 3, 1], // 18
    [4, 3, 3, 3, 2], // 19
    [4, 3, 3, 3, 2], // 20
];
// Warlock Pact Magic: [slotCount, slotLevel]
const WARLOCK_PACT: [number, number][] = [
    [1, 1], [2, 1], [2, 2], [2, 2], [2, 3],
    [2, 3], [2, 4], [2, 4], [2, 5], [2, 5],
    [3, 5], [3, 5], [3, 5], [3, 5], [3, 5],
    [3, 5], [4, 5], [4, 5], [4, 5], [4, 5],
];

export type SlotState = number[]; // index 0 = 1st level slot count (used)

export function getSpellSlotTotals(className: string, level: number): number[] {
    const lv = Math.min(Math.max(level, 1), 20) - 1;
    if (['Wizard', 'Sorcerer', 'Bard', 'Cleric', 'Druid'].includes(className)) {
        return [...FULL_CASTER[lv]];
    }
    if (['Paladin', 'Ranger'].includes(className)) {
        return [...HALF_CASTER[lv]];
    }
    if (className === 'Artificer') {
        return [...ARTIFICER_CASTER[lv]];
    }
    if (className === 'Warlock') {
        const [count, slotLv] = WARLOCK_PACT[lv];
        const r = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        r[slotLv - 1] = count;
        return r;
    }
    return [];
}

const SPELLS_KNOWN: Record<string, number[]> = {
    Bard: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
    Sorcerer: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
    Warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
    Ranger: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
};

const CANTRIPS_KNOWN: Record<string, number[]> = {
    Bard: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    Cleric: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    Druid: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    Sorcerer: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    Warlock: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    Wizard: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    Artificer: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
};

// Wizard starting spellbook is 6, +2 per level
// Prepared = Level + Mod for Wizard/Cleric/Druid/Paladin/Artificer
export function getSpellLimits(className: string, level: number, stats?: Record<string, number>) {
    const lv = Math.min(Math.max(level, 1), 20);
    const lvIdx = lv - 1;

    const getMod = (stat: string) => {
        if (!stats) return 0;
        const val = stats[stat] ?? 10;
        return Math.floor((val - 10) / 2);
    };
    
    let cantrips = CANTRIPS_KNOWN[className]?.[lvIdx] ?? 0;
    let spellsTotal = 0; // Total that can be "known" or in "spellbook"
    let prepared = 0;    // Total that can be "prepared" or "castable" at once

    if (className === 'Wizard') {
        spellsTotal = 6 + (lv - 1) * 2;
        prepared = Math.max(1, lv + getMod('INT'));
    } else if (['Cleric', 'Druid'].includes(className)) {
        spellsTotal = 999; // Represents "All"
        prepared = Math.max(1, lv + getMod('WIS'));
    } else if (className === 'Paladin') {
        spellsTotal = 999;
        prepared = Math.max(1, Math.floor(lv / 2) + getMod('CHA'));
    } else if (className === 'Artificer') {
        spellsTotal = 999;
        prepared = Math.max(1, Math.floor(lv / 2) + getMod('INT'));
    } else {
        // Known casters (Bard, Sorcerer, Warlock, Ranger)
        spellsTotal = SPELLS_KNOWN[className]?.[lvIdx] ?? 0;
        prepared = spellsTotal;
    }

    return { cantrips, spellsTotal, prepared };
}


export function isSpellcaster(className: string): boolean {
    return ['Wizard', 'Sorcerer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Warlock', 'Artificer'].includes(className);
}

// ─── Multiclass Spell Slot Merging ────────────────────────────────────────────
// Returns [normal merged slots, warlock pact slots]
// normal slots: 9-element array (1st-9th level slot counts)
// warlockSlots: { count, level } | null
export function getMulticlassSpellSlots(
    primaryClass: string,
    primaryLevel: number,
    multiclasses: { className: string; level: number }[]
): { merged: number[]; warlockPact: { count: number; level: number } | null } {
    const FULL_CASTERS = ['Wizard', 'Sorcerer', 'Bard', 'Cleric', 'Druid'];
    const HALF_CASTERS = ['Paladin', 'Ranger'];
    const THIRD_CASTERS: string[] = []; // e.g. Eldritch Knight / Arcane Trickster subclasses — skip for now
    const ARTIFICER = 'Artificer';

    // Sum caster levels (Warlock and non-casters excluded from merged)
    let casterLevel = 0;
    let warlockPact: { count: number; level: number } | null = null;

    const allClasses = [{ className: primaryClass, level: primaryLevel }, ...multiclasses];

    for (const { className, level } of allClasses) {
        if (FULL_CASTERS.includes(className)) {
            casterLevel += level;
        } else if (HALF_CASTERS.includes(className)) {
            casterLevel += Math.floor(level / 2);
        } else if (className === ARTIFICER) {
            casterLevel += Math.ceil(level / 2); // Artificer rounds up
        } else if (className === 'Warlock') {
            // Warlock pact magic is separate
            const pactIdx = Math.min(level, 20) - 1;
            const [count, slotLv] = WARLOCK_PACT[pactIdx];
            warlockPact = { count, level: slotLv };
        }
        // Non-caster classes contribute 0
    }

    casterLevel = Math.min(casterLevel, 20);

    let merged: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (casterLevel >= 1) {
        merged = [...FULL_CASTER[casterLevel - 1]];
    }

    return { merged, warlockPact };
}

// ─── Class Resources ─────────────────────────────────────────────────────────
export interface ClassResource {
    key: string;
    name: string;
    desc_tr: string;
    recharge: 'short' | 'long';
    icon: string;
    getMax: (level: number, modifiers?: Record<string, number>) => number;
}

export const CLASS_RESOURCES: Record<string, ClassResource[]> = {
    Barbarian: [
        {
            key: 'rage', name: 'Rage', icon: '😤',
            desc_tr: 'Bonus aksiyon olarak öfkelen. 1 dk boyunca: fiziksel hasar direnci, +2/+3/+4 hasar (Sv. için artar), STR/CON save avantajı.',
            recharge: 'long',
            getMax: (lv) => lv >= 20 ? 999 : lv >= 17 ? 6 : lv >= 12 ? 5 : lv >= 6 ? 4 : lv >= 3 ? 3 : 2,
        },
    ],
    Fighter: [
        {
            key: 'second_wind', name: 'Second Wind', icon: '💨',
            desc_tr: 'Bonus aksiyon: 1d10 + Fighter Sv. kadar HP kazanırsın.',
            recharge: 'short',
            getMax: () => 1,
        },
        {
            key: 'action_surge', name: 'Action Surge', icon: '⚡',
            desc_tr: 'Ekstra bir aksiyon kazanırsın.',
            recharge: 'short',
            getMax: (lv) => lv >= 17 ? 2 : lv >= 2 ? 1 : 0,
        },
        {
            key: 'indomitable', name: 'Indomitable', icon: '🛡️',
            desc_tr: 'Bir kurtarma atışını yeniden atabilirsin.',
            recharge: 'long',
            getMax: (lv) => lv >= 17 ? 3 : lv >= 13 ? 2 : lv >= 9 ? 1 : 0,
        },
    ],
    Monk: [
        {
            key: 'ki', name: 'Ki Points', icon: '🌀',
            desc_tr: 'Flurry of Blows (2 Ki: 2 bonus attack), Patient Defense (1 Ki: Dodge bonus), Step of the Wind (1 Ki: Dash/Disengage bonus), Stunning Strike (1 Ki: stun on hit).',
            recharge: 'short',
            getMax: (lv) => lv >= 2 ? lv : 0,
        },
    ],
    Cleric: [
        {
            key: 'channel_divinity', name: 'Channel Divinity', icon: '✝️',
            desc_tr: 'Turn Undead veya alan özelliği. Sv. 6\'ya kadar 1/short rest, Sv. 18\'e kadar 2/short rest, Sv. 20 3/short rest.',
            recharge: 'short',
            getMax: (lv) => lv >= 18 ? 3 : lv >= 6 ? 2 : lv >= 2 ? 1 : 0,
        },
    ],
    Druid: [
        {
            key: 'wild_shape', name: 'Wild Shape', icon: '🐺',
            desc_tr: 'Bonus aksiyon: Hayvan formuna girersin. Kısa/uzun dinlenmede 2 kullanım yenilenir.',
            recharge: 'short',
            getMax: (lv) => lv >= 2 ? 2 : 0,
        },
    ],
    Sorcerer: [
        {
            key: 'sorcery_points', name: 'Sorcery Points', icon: '💎',
            desc_tr: 'Metamagic için kullan (Quickened, Twinned, Empowered vb.) veya büyü slotuna dönüştür.',
            recharge: 'long',
            getMax: (lv) => lv >= 2 ? lv : 0,
        },
    ],
    Bard: [
        {
            key: 'bardic_inspiration', name: 'Bardic Inspiration', icon: '🎵',
            desc_tr: 'Bonus aksiyon: Bir dosta 1d6–1d12 Inspiration zarı ver (saldırı, kontrol veya save\'e ekler). Sv. 5\'te Short Rest\'te de yenilenir.',
            recharge: 'long',
            getMax: (lv, mods) => Math.max(1, mods?.CHA ?? 1),
        },
    ],
    Paladin: [
        {
            key: 'lay_on_hands', name: 'Lay on Hands (HP Pool)', icon: '🤲',
            desc_tr: 'Dokunarak iyileştirirsin. Toplam HP havuzundan kullanırsın. Her kullanımda 1+ HP dökülebilir.',
            recharge: 'long',
            getMax: (lv) => lv * 5,
        },
        {
            key: 'divine_sense', name: 'Divine Sense', icon: '👁️',
            desc_tr: 'Aksiyon: 60 ft içinde Undead, Fiend veya Celestial varlığını hissedersin. 1 + CHA modi / uzun dinlenme.',
            recharge: 'long',
            getMax: (lv, mods) => Math.max(1, 1 + (mods?.CHA ?? 0)),
        },
    ],
    Rogue: [
        {
            key: 'lucky', name: 'Uncanny Dodge Uses', icon: '🎰',
            desc_tr: 'Passive: Görebileceğin saldırganın saldırısı isabetlendikçe reaksiyon ile hasarı yarıya indirirsin (Sv. 5\'ten itibaren).',
            recharge: 'short',
            getMax: (lv) => lv >= 5 ? 1 : 0,
        },
    ],
    Warlock: [
        {
            key: 'pact_magic', name: 'Pact Magic Slots', icon: '🔮',
            desc_tr: 'Warlock büyü slotları Short Rest\'te yenilenir. Tüm slotlar aynı seviyededir.',
            recharge: 'short',
            getMax: (lv) => {
                const [count] = WARLOCK_PACT[Math.min(lv, 20) - 1];
                return count;
            },
        },
    ],
    Ranger: [
        {
            key: 'hunters_mark_track', name: "Hunter's Mark Charges", icon: '🎯',
            desc_tr: "Hunter's Mark slotu olmakla birlikte birden fazla hedefe taşınabilir — bu sayaç Concentrate bilgisini tutar.",
            recharge: 'long',
            getMax: () => 1,
        },
    ],
};

// ─── Basic Attacks per Class ──────────────────────────────────────────────────
export interface Attack {
    name: string;
    type: 'melee' | 'ranged' | 'save' | 'heal' | 'special';
    toHit?: string;
    damage: string;
    range?: string;
    note?: string;
    desc_tr: string;
    resourceCost?: { key: string; amount: number; name: string };
}

export const CLASS_ATTACKS: Record<string, Attack[]> = {
    Barbarian: [
        {
            name: 'Greataxe', type: 'melee', toHit: 'STR+Prof', damage: '1d12 Slashing', range: 'Melee 5 ft',
            desc_tr: 'Standarт büyük balta saldırısı. Öfke aktifken fiziksel hasarlara direnç kazanırsın ve her isabette +2/+3/+4 ekstra hasar eklersin (seviye 9/16 ile artar).'
        },
        {
            name: 'Handaxe', type: 'ranged', toHit: 'STR+Prof', damage: '1d6 Slashing', range: '20/60 ft',
            desc_tr: 'Yakın veya uzak mesafede kullanılabilen hafif balta. Düşmana fırlat ya da yakın dövüşte kullan.'
        },
        {
            name: 'Unarmed Strike', type: 'melee', toHit: 'STR+Prof', damage: '1+STR Bludgeoning', range: 'Melee 5 ft',
            desc_tr: 'Yumruk, dirsek veya kafa vuruşu. Öfke aktifken yumruk darbesi bile işe yarar.'
        },
    ],
    Fighter: [
        {
            name: 'Longsword', type: 'melee', toHit: 'STR+Prof', damage: '1d8 Slashing', range: 'Melee 5 ft',
            desc_tr: 'Güvenilir uzun kılıç saldırısı. Çift elle kullanınca 1d10 hasar verir. Extra Attack kazandığında aynı turda birden fazla kez saldırabilirsin.'
        },
        {
            name: 'Longbow', type: 'ranged', toHit: 'DEX+Prof', damage: '1d8 Piercing', range: '150/600 ft',
            desc_tr: 'Uzun menzilli yay saldırısı. Yakın mesafede saldırı yaparsan dezavantajla atış yaparsın.'
        },
        {
            name: 'Unarmed Strike', type: 'melee', toHit: 'STR+Prof', damage: '1+STR Bludgeoning', range: 'Melee 5 ft',
            desc_tr: 'Silahsız saldırı. Temel fiziksel hasar.'
        },
        {
            name: 'Second Wind', type: 'heal', damage: '1d10+Fighter Sv.',
            desc_tr: 'Bonus aksiyon: Kendini bir anlığına toparlayıp 1d10 + Fighter seviyesi kadar HP kazanırsın. Kısa veya uzun dinlenmede yenilenir.',
            resourceCost: { key: 'second_wind', amount: 1, name: 'Second Wind' }
        },
        {
            name: 'Action Surge', type: 'special', damage: '—',
            desc_tr: 'Bonus olarak ekstra bir tam aksiyon kazanırsın — saldırı, büyü veya her türlü aksiyon alabilirsin. Kısa/uzun dinlenmede yenilenir.',
            resourceCost: { key: 'action_surge', amount: 1, name: 'Action Surge' }
        },
    ],
    Paladin: [
        {
            name: 'Longsword', type: 'melee', toHit: 'STR+Prof', damage: '1d8 Slashing', range: 'Melee 5 ft',
            desc_tr: 'Ana kılıç saldırısı. İsabet sonrasında Divine Smite veya Improved Divine Smite ile güçlendirebilirsin.'
        },
        {
            name: 'Divine Smite', type: 'special', damage: '2d8 (+1d8/slot) Radiant',
            desc_tr: 'Düşmana isabetten hemen sonra bir spell slotu harca. 1. seviye slot = 2d8, her ekstra slot seviyesi +1d8 radiant hasar. Undead veya Fiend hedeflere +1d8 ekstra. Slot harcanır ama spell değildir.'
        },
        {
            name: 'Lay on Hands', type: 'heal', damage: 'HP Havuzu (Sv.×5)',
            desc_tr: 'Aksiyon: Kutsal dokunuşla iyileştirirsin. Seviye×5 büyüklüğünde HP havuzun var, istediğin miktarda kullanabilirsin. 5 puan harcayarak bir hastalık veya zehri de temizleyebilirsin. Uzun dinlenmede yenilenir.'
        },
        {
            name: 'Divine Sense', type: 'special', damage: '—',
            desc_tr: 'Aksiyon: 60 ft içindeki Undead, Fiend veya Celestial varlıkları hissedersin — gizli olsalar bile konumlarını algılarsın. 1 tur sürer. Kullanım hakkı: 1 + CHA mod / uzun dinlenmede.',
            resourceCost: { key: 'divine_sense', amount: 1, name: 'Divine Sense' }
        },
    ],
    Ranger: [
        {
            name: 'Longbow', type: 'ranged', toHit: 'DEX+Prof', damage: '1d8 Piercing', range: '150/600 ft',
            desc_tr: 'Uzun menzilli yay saldırısı. Düşman Hunter\'s Mark altındaysa her isabette +1d6 ek hasar alır.'
        },
        {
            name: 'Shortsword', type: 'melee', toHit: 'DEX+Prof', damage: '1d6 Piercing', range: 'Melee 5 ft',
            desc_tr: 'Yakın dövüş kısa kılıç. Finesse özelliği sayesinde DEX veya STR hangisi yüksekse onu kullanabilirsin.'
        },
        {
            name: "Hunter's Mark", type: 'special', damage: '+1d6 Piercing/isabet',
            desc_tr: 'Bonus aksiyon + konsantrasyon büyüsü: Hedefi işaretle, her isabette +1d6 hasar ekle. Hedef düşerse bonus aksiyon ile başka hedefe kaydırabilirsin. Yüksek slotlarla süresi uzar.'
        },
        {
            name: 'Ensnaring Strike', type: 'special', damage: '—',
            desc_tr: 'Konsantrasyon büyüsü. İsabetten sonra hedef STR save atar. Başarısız olursa Restrained (hareketsiz) kalır. Tur sonunda tekrar save atabilir.'
        },
    ],
    Rogue: [
        {
            name: 'Shortsword', type: 'melee', toHit: 'DEX+Prof', damage: '1d6 Piercing', range: 'Melee 5 ft',
            desc_tr: 'Birincil yakın dövüş silahı. Sneak Attack koşulları sağlanırsa ek hasar zinciri devreye girer.'
        },
        {
            name: 'Hand Crossbow', type: 'ranged', toHit: 'DEX+Prof', damage: '1d6 Piercing', range: '30/120 ft',
            desc_tr: 'Tek elle kullanılan teke atarlık el arbalet. Düşmana yakın mevzidenmiş bir müttefikin varsa Sneak Attack devreye girer.'
        },
        {
            name: 'Sneak Attack', type: 'special', damage: '⌈Sv/2⌉d6 Piercing',
            desc_tr: 'Tur başında YALNIZCA BİR KERE: Avantajlı saldırı attıysan VEYA mücadelecinin bitişiğinde düşmanla temas eden bir müttefikin varsa (dezavantajın yoksa) ekstra ⌈seviye/2⌉d6 hasar ekle. (Sv. 1=1d6, Sv. 3=2d6, Sv. 5=3d6...)'
        },
        {
            name: 'Cunning Action', type: 'special', damage: '—',
            desc_tr: 'Bonus aksiyon olarak: Dash (hızlı koş), Disengage (düşman fırsatçı saldırısına karşı güvende çekil) veya Hide (gizlen) eylemlerinden birini yap. Savaş manevralarını çok esnek kılar.'
        },
    ],
    Monk: [
        {
            name: 'Unarmed Strike', type: 'melee', toHit: 'STR/DEX+Prof', damage: 'Martial Arts die+STR/DEX Bludgeoning', range: 'Melee 5 ft',
            desc_tr: 'Yumruk, tekme veya başka vücut darbesi. Martial Arts zarı seviyeyle büyür: Sv.1-4→1d4, Sv.5-10→1d6, Sv.11-16→1d8, Sv.17-20→1d10. STR veya DEX hangisi yüksekse kullanılır.'
        },
        {
            name: 'Shortsword', type: 'melee', toHit: 'DEX+Prof', damage: '1d6 Piercing', range: 'Melee 5 ft',
            desc_tr: 'Monk\'lar için standart kılıç. Monk silahlarıyla yapılan saldırı/hasarda STR yerine DEX kullanılabilir.'
        },
        {
            name: 'Flurry of Blows', type: 'special', damage: '2× Martial Arts Bludgeoning',
            desc_tr: '1 Ki noktası: Saldırı yapan bir aksiyondan sonra BONUS aksiyon olarak ard arda 2 Unarmed Strike at. Her biri normal Martial Arts zarı+DEX/STR hasar yapar.',
            resourceCost: { key: 'ki', amount: 1, name: 'Ki Points' }
        },
        {
            name: 'Stunning Strike', type: 'special', damage: '—',
            desc_tr: '1 Ki noktası: Düşmana isabet ettikten sonra kullanabilirsin. Hedef CON saving throw atar (DC = 8+Prof+WIS). Başarısız olursa bir sonraki turuna kadar Stunned (sersemlemiş) kalır — saldırılara avantaj, fail DEX save, hareket edemez.',
            resourceCost: { key: 'ki', amount: 1, name: 'Ki Points' }
        },
        {
            name: 'Patient Defense', type: 'special', damage: '—',
            desc_tr: '1 Ki noktası: Bonus aksiyon olarak Dodge al. Sana yapılan saldırılar dezavantajla atılır, DEX saves avantajlı yapılır.',
            resourceCost: { key: 'ki', amount: 1, name: 'Ki Points' }
        },
    ],
    Wizard: [
        {
            name: 'Fire Bolt', type: 'ranged', toHit: 'INT+Prof', damage: '1d10 Fire (cantrip)', range: '120 ft',
            desc_tr: 'Alev topağı fırlatır. Cantrip olduğu için slot harcamaz. Sv.1-4→1d10, Sv.5-10→2d10, Sv.11-16→3d10, Sv.17-20→4d10. Tahta nesneleri de yakar.'
        },
        {
            name: 'Dagger', type: 'melee', toHit: 'STR/DEX+Prof', damage: '1d4 Piercing', range: 'Melee 5ft / 20/60ft',
            desc_tr: 'Hafif bıçak. Hem yakın hem de fırlatma silahı olarak kullanılabilir. Finesse özelliği var.'
        },
        {
            name: 'Shocking Grasp', type: 'melee', toHit: 'INT+Prof', damage: '1d8 Lightning (cantrip)', range: 'Touch',
            desc_tr: 'Dokunuşla elektrik şoku. Metal zırh giyen hedefe avantajlı saldırı atılır. İsabet ederse hedef bir sonraki turuna kadar Reaksiyon kullanamaz (kaçamaz!). Cantrip.'
        },
        {
            name: 'Ray of Frost', type: 'ranged', toHit: 'INT+Prof', damage: '1d8 Cold (cantrip)', range: '60 ft',
            desc_tr: 'Soğuk ışın. İsabet ederse 1 tur boyunca hareket hızını 10 ft azaltır. Cantrip.'
        },
    ],
    Sorcerer: [
        {
            name: 'Fire Bolt', type: 'ranged', toHit: 'CHA+Prof', damage: '1d10 Fire (cantrip)', range: '120 ft',
            desc_tr: 'Alev topağı. Cantrip — slot yok. Sv. artışıyla zarı büyür (1d10→2d10→3d10→4d10).'
        },
        {
            name: 'Chill Touch', type: 'ranged', toHit: 'CHA+Prof', damage: '1d8 Necrotic (cantrip)', range: '120 ft',
            desc_tr: 'Hayalet pençesi: İsabet eden hedef 1 tur boyunca HP kazanamaz (iyileştirme almaz). Undead hedeflere saldırı atışlarında dezavantaj verir. Cantrip.'
        },
        {
            name: 'Ray of Frost', type: 'ranged', toHit: 'CHA+Prof', damage: '1d8 Cold (cantrip)', range: '60 ft',
            desc_tr: 'Buz ışını. İsabette hedefin hız 10 ft düşer (1 tur). Cantrip.'
        },
        {
            name: 'Dagger', type: 'melee', toHit: 'DEX+Prof', damage: '1d4 Piercing', range: '20/60 ft',
            desc_tr: 'Acil durum yakın dövüş silahı. Finesse.'
        },
        {
            name: 'Metamagic: Quickened', type: 'special', damage: '—',
            desc_tr: '2 Sorcery noktası: Casting time\'ı 1 aksiyon olan bir büyüyü Bonus Aksiyon olarak yap. Aynı turda bir Aksiyon büyüsü de yapabilirsin.',
            resourceCost: { key: 'sorcery_points', amount: 2, name: 'Sorcery Points' }
        },
        {
            name: 'Metamagic: Twinned', type: 'special', damage: '—',
            desc_tr: '1-9 Sorcery noktası (büyü seviyesi kadar): Tek hedefe yönelik bir büyüyü ikinci bir hedefe de uygula (ek slot yok). Charm, Hold Person gibi büyüler için güçlü.'
        },
    ],
    Warlock: [
        {
            name: 'Eldritch Blast', type: 'ranged', toHit: 'CHA+Prof', damage: '1d10 Force/ışın (cantrip)', range: '120 ft',
            desc_tr: 'Warlock\'un temel cantrip saldırısı. Seviye artışıyla ışın sayısı büyür: Sv.1-4→1 ışın, Sv.5-10→2, Sv.11-16→3, Sv.17-20→4 ışın. Her ışın bağımsız hedef alabilir. Eldritch Invocation\'larla güçlendirilebilir (itmek, yavaşlatmak vb.).'
        },
        {
            name: 'Hex', type: 'special', damage: '+1d6 Necrotic/isabet',
            desc_tr: 'Bonus aksiyon + konsantrasyon büyüsü: Hedefe laneti yaz. Her isabette +1d6 necrotik hasar. Seçilen bir ability check\'te dezavantaj verir. Hedef düşerse konsantrasyon bozmadan başka hedefe taşıyabilirsin.'
        },
        {
            name: 'Dagger', type: 'melee', toHit: 'DEX+Prof', damage: '1d4 Piercing', range: '20/60 ft',
            desc_tr: 'Yakın dövüş acil silahı.'
        },
        {
            name: 'Pact of the Blade', type: 'melee', toHit: 'CHA+Prof', damage: 'Silah hasarı + CHA (Magic)', range: 'Melee 5 ft',
            desc_tr: 'Pact of the Blade özelliği alınmışsa büyülü bir silah çağırabilirsin. Saldırı ve hasar atışlarında CHA kullanılır. Bu silahı sihirli kabul et.'
        },
    ],
    Cleric: [
        {
            name: 'Sacred Flame', type: 'save', damage: '1d8 Radiant (cantrip)', range: '60 ft',
            desc_tr: 'DEX saving throw (DC = 8+Prof+WIS). Başarısız olursa ilahi alev hasarı alır. Kapak avantajı vermez — her zaman görünür hedefe işe yarar. Cantrip.'
        },
        {
            name: 'Toll the Dead', type: 'save', damage: '1d8/1d12 Necrotic (cantrip)', range: '60 ft',
            desc_tr: 'WIS saving throw. Hedef zaten yaralıysa zar 1d12\'ye çıkar. Ölümün çanını duyar — necrotik hasar. Cantrip.'
        },
        {
            name: 'Mace', type: 'melee', toHit: 'STR+Prof', damage: '1d6 Bludgeoning', range: 'Melee 5 ft',
            desc_tr: 'Basit künt silah. Cleric\'lerin temel melee seçeneği.'
        },
        {
            name: 'Channel Divinity: Turn Undead', type: 'special', damage: '—',
            desc_tr: 'Aksiyon: İlahi enerjini yak. 30 ft içindeki tüm Undead yaratıklar WIS saving throw atar (DC = 8+Prof+WIS). Başarısız olanlar Frightened (korkmuş) hale gelir ve senden uzaklaşmaları gerekir. 1 dk sürer veya zarar görene kadar. Sv.5\'ten itibaren zayıf Undead\'lar yok edilebilir.',
            resourceCost: { key: 'channel_divinity', amount: 1, name: 'Channel Divinity' }
        },
        {
            name: 'Spiritual Weapon', type: 'special', damage: '1d8+WIS Force/Bludgeoning',
            desc_tr: 'Konsantrasyonsuz 2. seviye büyü (yüksek slotla güçlenir). Bonus aksiyon ile yarı görünür bir silah çağırır — her turda bonus aksiyon ile bu silahla saldırabilirsin. 1 dk sürer.'
        },
    ],
    Druid: [
        {
            name: 'Shillelagh', type: 'melee', toHit: 'WIS+Prof', damage: '1d8 Bludgeoning (cantrip)', range: 'Melee 5 ft',
            desc_tr: 'Quarterstaff veya club\'ı doğa enerjisiyle büyüle. Hasar zarı 1d8\'e çıkar ve WIS ile saldırırsın. Cantrip.'
        },
        {
            name: 'Produce Flame', type: 'ranged', toHit: 'WIS+Prof', damage: '1d8 Fire (cantrip)', range: '30 ft',
            desc_tr: 'Elinde bir alev oluşturur (ışık verir) veya fırlatırsın. Fırlatılınca WIS ile saldırı atışı yapılır. Cantrip.'
        },
        {
            name: 'Thorn Whip', type: 'melee', toHit: 'WIS+Prof', damage: '1d6 Piercing (cantrip)', range: '30 ft',
            desc_tr: 'Uzun dikenli bitki kırbacı. İsabet ederse büyük yaratıkları 10 ft yakına çeker. Düşmanı çukura ya da tuzağa sürüklemek için idealdir. Cantrip.'
        },
        {
            name: 'Wild Shape', type: 'special', damage: 'Hayvan formu istatistikleri',
            desc_tr: 'Bonus aksiyon: Tamamen bir hayvana dönüşürsün. Hayvanın HP\'ini kazanırsın (erir). Svye göre CR sınırı: Sv.2→CR1/4, Sv.4→CR1/2, Sv.8→CR1. Moon Druid daha güçlü formlar alabilir. Kısa/uzun dinlenmede 2 kullanım yenilenir.',
            resourceCost: { key: 'wild_shape', amount: 1, name: 'Wild Shape' }
        },
    ],
    Bard: [
        {
            name: 'Vicious Mockery', type: 'save', damage: '1d4 Psychic (cantrip)', range: '60 ft',
            desc_tr: 'WIS saving throw (DC = 8+Prof+CHA). Başarısız olursa hasarın yanı sıra hedef bir sonraki saldırı atışında dezavantajla atar. Eğlenceli ama güçlü moral bozucu büyü. Cantrip.'
        },
        {
            name: 'Rapier', type: 'melee', toHit: 'DEX+Prof', damage: '1d8 Piercing (finesse)', range: 'Melee 5 ft',
            desc_tr: 'Şık melee silahı. Finesse özelliğiyle DEX kullanılır. Bard\'ın en iyi yakın dövüş seçeneği.'
        },
        {
            name: 'Shortbow', type: 'ranged', toHit: 'DEX+Prof', damage: '1d6 Piercing', range: '80/320 ft',
            desc_tr: 'Orta menzilli yay. Uzak mesafe saldırı seçeneği.'
        },
        {
            name: 'Bardic Inspiration', type: 'special', damage: '—',
            desc_tr: 'Bonus aksiyon: 60 ft içindeki sana başka bir yaratığa d6–d12 boyutunda Inspiration zarı ver. Alıcı bu zarı 10 dk içinde saldırı atışı, ability check veya saving throw\'a ekleyebilir (atıştıktan sonra). Sorcerer seviyesiyle büyür ve CHA mod kadar kullanım hakkın var.',
            resourceCost: { key: 'bardic_inspiration', amount: 1, name: 'Bardic Inspiration' }
        },
    ],
    Artificer: [
        {
            name: 'Fire Bolt', type: 'ranged', toHit: 'INT+Prof', damage: '1d10 Fire (cantrip)', range: '120 ft',
            desc_tr: 'Mekanik büyü atışı. INT ile saldırı. Cantrip.'
        },
        {
            name: 'Thorn Whip', type: 'melee', toHit: 'INT+Prof', damage: '1d6 Piercing (cantrip)', range: '30 ft',
            desc_tr: 'Bitki kırbacı. İsabette çeker. INT tabanlı. Cantrip.'
        },
        {
            name: 'Light Crossbow', type: 'ranged', toHit: 'DEX+Prof', damage: '1d8 Piercing', range: '80/320 ft',
            desc_tr: 'Artificer\'ın temel ranged silahı. Basit silah kategorisindedir.'
        },
        {
            name: 'Infuse Item', type: 'special', damage: '—',
            desc_tr: 'Uzun dinlenmede en fazla seviyene göre değişen sayıda eşyaya büyücü özelliği (infüzyon) ver: Bag of Holding, Alchemy Jug, Enhanced Weapon (+1), Replicate Magic Item vb. Bir sonraki uzun dinlenmeye kadar aktif kalır.'
        },
    ],
};

