const fs = require('fs');
const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'node' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve(null); }
            });
        }).on('error', reject);
    });
}

// Map 5etools bonus fields to our app's effect schema
function extractEffects(item5e) {
    const effects = [];

    // AC bonus (armor, shield, ring etc.)
    if (item5e.bonusAc) {
        const val = parseInt(item5e.bonusAc.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'ac_bonus', value: val });
    }

    // Weapon attack & damage bonus (+1, +2, +3 weapons)
    if (item5e.bonusWeapon) {
        const val = parseInt(item5e.bonusWeapon.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) {
            effects.push({ type: 'attack_bonus', value: val });
            effects.push({ type: 'damage_bonus', value: val });
        }
    }

    // Spell attack bonus
    if (item5e.bonusSpellAttack) {
        const val = parseInt(item5e.bonusSpellAttack.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'spell_attack_bonus', value: val });
    }

    // Spell DC bonus
    if (item5e.bonusSpellSaveDc) {
        const val = parseInt(item5e.bonusSpellSaveDc.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'spell_dc_bonus', value: val });
    }

    // Saving throw bonus
    if (item5e.bonusSavingThrow) {
        const val = parseInt(item5e.bonusSavingThrow.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'save_bonus', value: val });
    }

    // Specific stat bonuses from property list or ability scores
    if (item5e.ability) {
        // e.g. {static: {str: 21}} or {str: 1}
        if (item5e.ability.static) {
            Object.entries(item5e.ability.static).forEach(([stat, val]) => {
                effects.push({ type: 'stat_set', stat: stat.toUpperCase(), value: val });
            });
        } else {
            Object.entries(item5e.ability).forEach(([stat, val]) => {
                if (typeof val === 'number' && ['str','dex','con','int','wis','cha'].includes(stat)) {
                    effects.push({ type: 'stat_bonus', stat: stat.toUpperCase(), value: val });
                }
            });
        }
    }

    // Stealth disadvantage (heavy armor etc.)
    if (item5e.stealth) {
        effects.push({ type: 'disadvantage', skill: 'stealth' });
    }

    // Resistance to damage types
    if (item5e.resist) {
        item5e.resist.forEach(dmgType => {
            effects.push({ type: 'resistance', damageType: dmgType });
        });
    }

    // Immunity to damage types
    if (item5e.immune) {
        item5e.immune.forEach(dmgType => {
            effects.push({ type: 'immunity', damageType: dmgType });
        });
    }

    return effects;
}

async function main() {
    console.log("Fetching 5etools items...");
    const data5e = await fetchJson('https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/items.json');
    const items5e = data5e.item || [];

    // Also fetch magic items file, which has more magical items
    const mdata5e = await fetchJson('https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/items-base.json');
    const moreItems = (mdata5e && mdata5e.baseitem) || [];
    
    const allItems5e = [...items5e, ...moreItems];
    console.log("5etools items:", allItems5e.length);

    // Build lookup by normalized name
    const lookup5e = new Map();
    allItems5e.forEach(item => {
        const key = item.name.toLowerCase().replace(/[+\d\s,'-]/g, '').trim();
        if (!lookup5e.has(key)) lookup5e.set(key, item);
    });

    // Process all enriched_items_batch files
    const dataDir = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data';
    const batchFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('enriched_items_batch') && f.endsWith('.json'));

    let totalUpdated = 0;
    let totalProcessed = 0;

    for (const batchFile of batchFiles.sort()) {
        const filePath = `${dataDir}/${batchFile}`;
        const raw = fs.readFileSync(filePath, 'utf8');
        const items = JSON.parse(raw);
        let updated = 0;

        items.forEach(localItem => {
            const key = localItem.name.toLowerCase().replace(/[+\d\s,'-]/g, '').trim();
            const item5e = lookup5e.get(key);

            if (item5e) {
                const newEffects = extractEffects(item5e);
                if (newEffects.length > 0) {
                    // Merge: keep existing non-empty effects, add new ones
                    const existing = (localItem.effects || []).filter(e => e.type !== undefined);
                    const existingTypes = new Set(existing.map(e => e.type + (e.stat || '')));
                    const toAdd = newEffects.filter(e => !existingTypes.has(e.type + (e.stat || '')));
                    if (toAdd.length > 0) {
                        localItem.effects = [...existing, ...toAdd];
                        updated++;
                    }
                }
                // Also fill in missing rarity
                if (!localItem.rarity && item5e.rarity) {
                    localItem.rarity = item5e.rarity.charAt(0).toUpperCase() + item5e.rarity.slice(1);
                }
                // Fill in requiresAttunement
                if (item5e.reqAttune) {
                    localItem.requiresAttunement = true;
                    if (typeof item5e.reqAttune === 'string') {
                        localItem.attunementNote = item5e.reqAttune;
                    }
                }
            }
            totalProcessed++;
        });

        fs.writeFileSync(filePath, JSON.stringify(items, null, 4));
        console.log(`${batchFile}: ${updated} items updated with effects`);
        totalUpdated += updated;
    }

    console.log(`\nDone! Updated ${totalUpdated} / ${totalProcessed} items total.`);
}

main().catch(console.error);
