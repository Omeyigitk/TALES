require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

const ARMOR_DATA = {
    'Padded': { base: 11, dex: true, maxDex: null, stealth: true },
    'Leather': { base: 11, dex: true, maxDex: null },
    'Studded Leather': { base: 12, dex: true, maxDex: null },
    'Hide': { base: 12, dex: true, maxDex: 2 },
    'Chain Shirt': { base: 13, dex: true, maxDex: 2 },
    'Scale Mail': { base: 14, dex: true, maxDex: 2, stealth: true },
    'Breastplate': { base: 14, dex: true, maxDex: 2 },
    'Half Plate': { base: 15, dex: true, maxDex: 2, stealth: true },
    'Ring Mail': { base: 14, dex: false, maxDex: null, stealth: true },
    'Chain Mail': { base: 16, dex: false, maxDex: null, stealth: true, minStr: 13 },
    'Splint': { base: 17, dex: false, maxDex: null, stealth: true, minStr: 15 },
    'Plate': { base: 18, dex: false, maxDex: null, stealth: true, minStr: 15 },
    'Shield': { base: 2, dex: false, maxDex: null }
};

async function enrich() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Enrich SRD Armor
        console.log('Enriching SRD Armor...');
        for (const [name, data] of Object.entries(ARMOR_DATA)) {
            await Item.updateOne(
                { name: { $regex: new RegExp(`^${name}$`, 'i') } },
                {
                    $set: {
                        armor_class: {
                            base: data.base,
                            dex_bonus: data.dex,
                            max_bonus: data.maxDex
                        },
                        stealth_disadvantage: data.stealth || false,
                        str_minimum: data.minStr || 0,
                        category: (name === 'Shield') ? 'Armor' : 'Armor' // Ensure consistency
                    }
                }
            );
        }

        // 2. Comprehensive Magic Item Parsing
        console.log('Parsing Magic Item effects...');
        const magicItems = await Item.find({ category: 'Magic Item' });
        let updatedCount = 0;

        for (const item of magicItems) {
            const desc = (item.description || "").toLowerCase();
            const trDesc = (item.description_tr || "").toLowerCase();
            const effects = [];

            // Weapon Bonuses (+1, +2, +3)
            const weaponBonus = desc.match(/\+(\d)\s+bonus\s+to\s+(attack|atış)/i) || trDesc.match(/\+(\d)\s+bonus/i);
            if (weaponBonus) {
                const val = parseInt(weaponBonus[1]);
                effects.push({ type: 'attack_bonus', value: val });
                effects.push({ type: 'damage_bonus', value: val });
            }

            // AC Bonus (Improved)
            const acMatch = desc.match(/\+(\d)\s+bonus\s+to\s+ac/i) || trDesc.match(/ac'ye\s*\+(\d)/i);
            if (acMatch) {
                effects.push({ type: 'ac_bonus', value: parseInt(acMatch[1]) });
            }

            // Attribute Setters (e.g. Gauntlets of Ogre Power)
            const setterMatch = desc.match(/your\s+([a-z]+)\s+score\s+becomes\s+(\d+)/i);
            if (setterMatch) {
                const stat = setterMatch[1].substring(0, 3).toUpperCase();
                const val = parseInt(setterMatch[2]);
                effects.push({ type: 'stat_set', value: { [stat]: val } });
            }

            // Saving Throw Bonuses
            if (desc.includes("bonus to saving throws") || trDesc.includes("kurtarma atışlarına bonus")) {
                effects.push({ type: 'stat_bonus', value: { 'SAVE': 1 } });
            }

            // Speed
            if (desc.includes("speed increases by") || (trDesc.includes("hızınız") && trDesc.includes("artar"))) {
                const speedMatch = desc.match(/speed increases by (\d+)/i) || trDesc.match(/hızınız (\d+) feet artar/i);
                if (speedMatch) effects.push({ type: 'speed_bonus', value: parseInt(speedMatch[1]) });
            }

            // Initiative
            if (desc.includes("bonus to initiative") || trDesc.includes("inisiyatif bonusu")) {
                effects.push({ type: 'initiative_bonus', value: 5 });
            }

            // Spells
            const spellRegex = /can cast (the )?([a-z ]+) spell/gi;
            let match;
            while ((match = spellRegex.exec(desc)) !== null) {
                effects.push({ type: 'spell_auto', spellName: match[2].trim() });
            }

            if (effects.length > 0) {
                item.effects = effects;
                await item.save();
                updatedCount++;
            }
        }

        console.log(`Enrichment complete. Updated ${updatedCount} magic items o7`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

enrich();
