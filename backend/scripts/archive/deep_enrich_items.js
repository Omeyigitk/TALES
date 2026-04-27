require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

async function deepEnrich() {
    try {
        await mongoose.connect(MONGODB_URI);
        const items = await Item.find({ category: 'Magic Item' });
        let count = 0;

        const statMap = {
            'strength': 'STR', 'güç': 'STR',
            'dexterity': 'DEX', 'çeviklik': 'DEX',
            'constitution': 'CON', 'dayanıklılık': 'CON',
            'intelligence': 'INT', 'zeka': 'INT',
            'wisdom': 'WIS', 'bilgelik': 'WIS',
            'charisma': 'CHA', 'karizma': 'CHA'
        };

        for (const item of items) {
            const desc = (item.description || "").toLowerCase();
            const trDesc = (item.description_tr || "").toLowerCase();
            const fullDesc = desc + " " + trDesc;
            const effects = [];

            // 1. AC Bonuses
            const acMatch = fullDesc.match(/\+(\d)\s+bonus\s+to\s+ac/i) ||
                fullDesc.match(/ac'ye\s*\+(\d)/i) ||
                fullDesc.match(/ac\s+bonus\s+of\s+\+(\d)/i);
            if (acMatch) effects.push({ type: 'ac_bonus', value: parseInt(acMatch[1]) });

            // 2. Attack and Damage
            const atkDmgMatch = fullDesc.match(/\+(\d)\s+bonus\s+to\s+attack\s+and\s+damage/i) ||
                fullDesc.match(/saldırı\s+ve\s+hasar\s+atışlarına\s*\+(\d)/i);
            if (atkDmgMatch) {
                effects.push({ type: 'attack_bonus', value: parseInt(atkDmgMatch[1]) });
                effects.push({ type: 'damage_bonus', value: parseInt(atkDmgMatch[1]) });
            }

            // 3. Stat "Becomes" (Setters)
            const setterMatch = fullDesc.match(/([a-zğüşıöç]+)\s+score\s+becomes\s+(\d+)/i) ||
                fullDesc.match(/([a-zğüşıöç]+)\s+skorunuz\s+(\d+)\s+olur/i);
            if (setterMatch) {
                const statName = setterMatch[1].toLowerCase();
                const statKey = statMap[statName];
                if (statKey) effects.push({ type: 'stat_set', value: { [statKey]: parseInt(setterMatch[2]) } });
            }

            // 4. Stat Increases
            const increaseMatch = fullDesc.match(/([a-zğüşıöç]+)\s+score\s+increases\s+by\s+(\d+)/i) ||
                fullDesc.match(/([a-zğüşıöç]+)\s+skorunuz\s+(\d+)\s+artar/i);
            if (increaseMatch) {
                const statName = increaseMatch[1].toLowerCase();
                const statKey = statMap[statName];
                if (statKey) effects.push({ type: 'stat_bonus', value: { [statKey]: parseInt(increaseMatch[2]) } });
            }

            // 5. Saving Throw Bonuses
            const saveMatch = fullDesc.match(/\+(\d)\s+bonus\s+to\s+all\s+saving\s+throws/i) ||
                fullDesc.match(/\+(\d)\s+bonus\s+to\s+saving\s+throws/i) ||
                fullDesc.match(/kurtarma\s+atışlarına\s*\+(\d)/i) ||
                (fullDesc.includes("bonus to saving throws") && fullDesc.includes("+1")) ? { 1: 1 } : null; // Hack for common text
            if (saveMatch && saveMatch[1]) effects.push({ type: 'stat_bonus', value: { 'SAVE': parseInt(saveMatch[1]) } });

            // 6. Resistance
            const damTypes = ['acid', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic', 'radiant', 'thunder', 'asit', 'soğuk', 'ateş', 'şimşek', 'yıldırım', 'nekrotik', 'zehir'];
            damTypes.forEach(t => {
                if (fullDesc.includes(`resistance to ${t}`) || fullDesc.includes(`${t} hasarına karşı direnç`)) {
                    // map turkish to english for frontend
                    let eng = t;
                    if (t === 'ateş') eng = 'fire'; if (t === 'soğuk') eng = 'cold'; if (t === 'zehir') eng = 'poison';
                    effects.push({ type: 'resistance', value: eng });
                }
            });

            // 7. Spells
            const spellP = /can cast (the )?([a-z ]+) spell/gi;
            let m;
            while ((m = spellP.exec(desc)) !== null) {
                effects.push({ type: 'spell_auto', spellName: m[2].trim() });
            }

            if (effects.length > 0) {
                item.effects = effects;
                await item.save();
                count++;
            }
        }

        console.log(`Deep enrichment complete. Updated ${count} magic items. o7`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

deepEnrich();
