require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

// Frontend Logic Mimic
function calculateMod(baseStat, statName, inventory, feats, libFeats) {
    let bonus = 0;
    let setVal = null;

    // Feats (simplified for test)
    if (feats && libFeats) {
        feats.forEach(fName => {
            const fData = libFeats.find(x => x.name === fName);
            if (fData && fData.effects) {
                fData.effects.forEach(eff => {
                    if (eff.type === 'stat_bonus' && eff.value[statName]) bonus += eff.value[statName];
                });
            }
        });
    }

    // Items
    if (inventory) {
        inventory.forEach(item => {
            if (item.isEquipped && item.effects) {
                item.effects.forEach(eff => {
                    if (eff.type === 'stat_bonus' && eff.value[statName]) bonus += eff.value[statName];
                    if (eff.type === 'stat_set' && eff.value[statName]) {
                        setVal = Math.max(setVal || 0, eff.value[statName]);
                    }
                });
            }
        });
    }

    if (setVal !== null && setVal > (baseStat + bonus)) {
        return Math.floor((setVal - 10) / 2);
    }
    return Math.floor(((baseStat + bonus) - 10) / 2);
}

function calculateAC(dexBase, inventory) {
    const dexMod = Math.floor((dexBase - 10) / 2);
    let baseAC = 10 + dexMod;
    let shieldAC = 0;
    let acBonus = 0;

    if (inventory) {
        inventory.forEach(item => {
            if (!item.isEquipped) return;

            if (item.armor_class) {
                if (item.name.toLowerCase().includes('shield')) {
                    shieldAC += item.armor_class.base || 2;
                } else {
                    const armorBase = item.armor_class.base;
                    const useDex = item.armor_class.dex_bonus;
                    const maxDex = item.armor_class.max_bonus;

                    if (useDex) {
                        baseAC = armorBase + (maxDex !== null ? Math.min(maxDex, dexMod) : dexMod);
                    } else {
                        baseAC = armorBase;
                    }
                }
            } else if (item.type === 'armor') {
                // Legacy fallback logic
                const name = item.name.toLowerCase();
                if (name.includes('shield')) shieldAC += 2;
                else if (name.includes('plate')) baseAC = 18;
            }

            if (item.effects) {
                item.effects.forEach(eff => {
                    if (eff.type === 'ac_bonus') acBonus += eff.value;
                });
            }
        });
    }

    return baseAC + shieldAC + acBonus;
}

async function test() {
    await mongoose.connect(MONGODB_URI);
    console.log("--- TEST BAŞLIYOR ---\n");

    // Case 1: Plate Armor + Shield (Should be 20 AC)
    const plate = await Item.findOne({ name: 'Plate' });
    const shield = await Item.findOne({ name: 'Shield' });

    if (plate && shield) {
        const inv = [
            { ...plate.toObject(), isEquipped: true },
            { ...shield.toObject(), isEquipped: true }
        ];
        const ac = calculateAC(10, inv); // Str character with 10 Dex
        console.log(`Test 1 (Plate + Shield): AC = ${ac} (Beklenen: 20) ${ac === 20 ? '✅' : '❌'}`);
    } else {
        console.log("Test 1: Eşyalar bulunamadı.");
    }

    // Case 2: Gauntlets of Ogre Power (Should set Str Mod to +4)
    const gauntlets = await Item.findOne({ name: /Gauntlets of Ogre Power/i });
    if (gauntlets) {
        const inv = [{ ...gauntlets.toObject(), isEquipped: true }];
        const strMod = calculateMod(10, 'STR', inv, [], []);
        console.log(`Test 2 (Ogre Power): STR Mod = ${strMod} (Beklenen: 4) ${strMod === 4 ? '✅' : '❌'}`);
    } else {
        console.log("Test 2: Gauntlets bulunamadı.");
    }

    // Case 3: Cloak of Protection (+1 AC, +1 Saves)
    const cloak = await Item.findOne({ name: /Cloak of Protection/i });
    if (cloak) {
        const inv = [
            { ...cloak.toObject(), isEquipped: true },
            { name: 'Leather', type: 'armor', armor_class: { base: 11, dex_bonus: true, max_bonus: null }, isEquipped: true }
        ];
        const ac = calculateAC(16, inv); // 16 Dex (+3)
        // Leather (11) + Dex (3) + Cloak (1) = 15 AC
        console.log(`Test 3 (Leather + Dex 16 + Cloak): AC = ${ac} (Beklenen: 15) ${ac === 15 ? '✅' : '❌'}`);

        const saveMod = calculateMod(10, 'SAVE', inv, [], []);
        console.log(`Test 3 (Cloak Save): SAVE Mod = ${saveMod} (Beklenen: 1) ${saveMod === 1 ? '✅' : '❌'}`);
    } else {
        console.log("Test 3: Cloak bulunamadı.");
    }

    console.log("\n--- TEST BİTTİ ---");
    process.exit(0);
}

test();
