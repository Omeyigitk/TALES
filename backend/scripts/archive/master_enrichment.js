require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

const MASTER_EFFECTS = {
    'Belt of Hill Giant Strength': [{ type: 'stat_set', value: { STR: 21 } }],
    'Belt of Stone Giant Strength': [{ type: 'stat_set', value: { STR: 23 } }],
    'Belt of Frost Giant Strength': [{ type: 'stat_set', value: { STR: 23 } }],
    'Belt of Fire Giant Strength': [{ type: 'stat_set', value: { STR: 25 } }],
    'Belt of Cloud Giant Strength': [{ type: 'stat_set', value: { STR: 27 } }],
    'Belt of Storm Giant Strength': [{ type: 'stat_set', value: { STR: 29 } }],
    'Gauntlets of Ogre Power': [{ type: 'stat_set', value: { STR: 19 } }],
    'Headband of Intellect': [{ type: 'stat_set', value: { INT: 19 } }],
    'Amulet of Health': [{ type: 'stat_set', value: { CON: 19 } }],
    'Cloak of Protection': [{ type: 'ac_bonus', value: 1 }, { type: 'stat_bonus', value: { SAVE: 1 } }],
    'Ring of Protection': [{ type: 'ac_bonus', value: 1 }, { type: 'stat_bonus', value: { SAVE: 1 } }],
    'Stone of Good Luck': [{ type: 'stat_bonus', value: { SAVE: 1, SKILL: 1 } }],
    'Luckstone': [{ type: 'stat_bonus', value: { SAVE: 1, SKILL: 1 } }],
    'Staff of Power': [
        { type: 'ac_bonus', value: 2 },
        { type: 'stat_bonus', value: { SAVE: 2 } },
        { type: 'stat_bonus', value: { SPELL_ATTACK: 2, SPELL_DC: 2 } }
    ],
    'Bracers of Defense': [{ type: 'ac_bonus', value: 2 }], // Only if unarmored (handled by frontend)
    'Belt of Dwarvenkind': [{ type: 'stat_bonus', value: { CON: 2 } }],
    'Boots of Speed': [{ type: 'speed_bonus', value: 30 }], // Approximation
};

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log('Master Enrichment started...');

    // 1. Precise updates for top items
    for (const [name, effects] of Object.entries(MASTER_EFFECTS)) {
        await Item.updateOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }, { $set: { effects } });
    }

    // 2. Generic pattern matching for the rest
    const magicItems = await Item.find({ category: 'Magic Item' });
    let fuzzyCount = 0;

    const statMap = {
        'strength': 'STR', 'güç': 'STR',
        'dexterity': 'DEX', 'çeviklik': 'DEX',
        'constitution': 'CON', 'dayanıklılık': 'CON',
        'intelligence': 'INT', 'zeka': 'INT',
        'wisdom': 'WIS', 'bilgelik': 'WIS',
        'charisma': 'CHA', 'karizma': 'CHA'
    };

    for (const item of magicItems) {
        // Skip if already updated by master list
        if (Object.keys(MASTER_EFFECTS).some(n => new RegExp(`^${n}$`, 'i').test(item.name))) continue;

        const desc = (item.description || "").toLowerCase();
        const trDesc = (item.description_tr || "").toLowerCase();
        const full = desc + " " + trDesc;
        const effects = [];

        // Weapon/Armor +1/2/3
        const numMatch = item.name.match(/\+(\d)/) || full.match(/\+(\d)\s+bonus/i);
        if (numMatch) {
            const val = parseInt(numMatch[1]);
            const lowerName = item.name.toLowerCase();
            if (lowerName.includes('armor') || lowerName.includes('zırh') || lowerName.includes('shield') || lowerName.includes('kalkan')) {
                effects.push({ type: 'ac_bonus', value: val });
            } else if (lowerName.includes('wand') || lowerName.includes('staff') || lowerName.includes('rod')) {
                effects.push({ type: 'stat_bonus', value: { SPELL_ATTACK: val, SPELL_DC: val } });
            } else {
                // assume weapon
                effects.push({ type: 'attack_bonus', value: val });
                effects.push({ type: 'damage_bonus', value: val });
            }
        }

        // Generic AC bonus
        if (full.includes('bonus to ac') || full.includes("ac'ye bonus")) {
            const m = full.match(/\+(\d)\s+bonus/i) || full.match(/bonus\s+\+(\d)/i);
            if (m) {
                const v = parseInt(m[1]);
                if (!effects.some(e => e.type === 'ac_bonus')) effects.push({ type: 'ac_bonus', value: v });
            }
        }

        // Resitances
        const types = ['fire', 'cold', 'poison', 'acid', 'lightning', 'necrotic', 'radiant', 'ateş', 'soğuk', 'zehir'];
        types.forEach(t => {
            if (full.includes(`resistance to ${t}`) || full.includes(`${t} hasarına karşı direnç`)) {
                let eng = t;
                if (t === 'ateş') eng = 'fire'; else if (t === 'soğuk') eng = 'cold'; else if (t === 'zehir') eng = 'poison';
                effects.push({ type: 'resistance', value: eng });
            }
        });

        if (effects.length > 0) {
            item.effects = effects;
            await item.save();
            fuzzyCount++;
        }
    }

    console.log(`Master Enrichment done. Top items: ${Object.keys(MASTER_EFFECTS).length}, Fuzzy matched: ${fuzzyCount}. o7`);
    process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
