const fs = require('fs');
const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'node' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
            });
        }).on('error', reject);
    });
}

// 5etools bonus fields → app effects
function extractEffectsFrom5e(item5e) {
    const effects = [];
    if (item5e.bonusAc) {
        const val = parseInt(item5e.bonusAc.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'ac_bonus', value: val });
    }
    if (item5e.bonusWeapon) {
        const val = parseInt(item5e.bonusWeapon.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) {
            effects.push({ type: 'attack_bonus', value: val });
            effects.push({ type: 'damage_bonus', value: val });
        }
    }
    if (item5e.bonusSpellAttack) {
        const val = parseInt(item5e.bonusSpellAttack.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'spell_attack_bonus', value: val });
    }
    if (item5e.bonusSpellSaveDc) {
        const val = parseInt(item5e.bonusSpellSaveDc.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'spell_dc_bonus', value: val });
    }
    if (item5e.bonusSavingThrow) {
        const val = parseInt(item5e.bonusSavingThrow.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'save_bonus', value: val });
    }
    if (item5e.bonusProficiencyBonus) {
        const val = parseInt(item5e.bonusProficiencyBonus.replace(/[^0-9-]/g, ''));
        if (!isNaN(val)) effects.push({ type: 'proficiency_bonus', value: val });
    }
    if (item5e.ability) {
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
    if (item5e.resist) {
        item5e.resist.forEach(dmgType => {
            effects.push({ type: 'resistance', damageType: dmgType });
        });
    }
    if (item5e.immune) {
        item5e.immune.forEach(dmgType => {
            effects.push({ type: 'immunity', damageType: dmgType });
        });
    }
    if (item5e.stealth) {
        effects.push({ type: 'stealth_disadvantage', value: true });
    }
    return effects;
}

// Parse Turkish description for mechanical bonuses
function extractEffectsFromDesc(item) {
    const desc = (item.description || '') + ' ' + (item.name || '');
    const effects = [];

    // AC bonus patterns like "+2 AC", "AC değerini 2 artırır", "Zırh Sınıfınızı +2"
    const acPatterns = [
        /\+(\d+)\s*(?:Armor Class|AC|Zırh Sınıfı)/i,
        /(?:AC|Zırh Sınıfı|Armor Class)\s*[^\d]*\+(\d+)/i,
        /(\d+)\s*puan.*?(?:AC|Zırh Sınıfı)/i,
    ];
    for (const p of acPatterns) {
        const m = desc.match(p);
        if (m && !effects.some(e => e.type === 'ac_bonus')) {
            effects.push({ type: 'ac_bonus', value: parseInt(m[1]) });
            break;
        }
    }

    // Attack bonus
    const atkPatterns = [
        /\+(\d+)\s*(?:bonus to attack|saldırı atış|attack roll)/i,
        /saldırı atışlarına?\s*\+(\d+)/i,
    ];
    for (const p of atkPatterns) {
        const m = desc.match(p);
        if (m && !effects.some(e => e.type === 'attack_bonus')) {
            effects.push({ type: 'attack_bonus', value: parseInt(m[1]) });
            break;
        }
    }

    // +1/+2/+3 weapon - detect from name like "Longsword +2", "+2 Sword"
    const magicBonus = item.name.match(/\+(\d+)/);
    const weaponTypes = ['sword','dagger','bow','axe','mace','hammer','spear','rapier','longsword','shortsword','greatsword','battleaxe','greataxe','warhammer','shortbow','longbow','crossbow','handaxe','flail','glaive','halberd','lance','maul','morningstar','pike','quarterstaff','scimitar','sickle','trident','war pick','whip'];
    const isWeapon = weaponTypes.some(w => item.name.toLowerCase().includes(w)) || item.type === 'Weapon';
    const isArmor = ['armor', 'shield', 'zırh', 'kalkan'].some(w => item.name.toLowerCase().includes(w) || (item.type||'').toLowerCase().includes(w));

    if (magicBonus && !effects.some(e => e.type === 'attack_bonus')) {
        const val = parseInt(magicBonus[1]);
        if (isWeapon) {
            effects.push({ type: 'attack_bonus', value: val });
            effects.push({ type: 'damage_bonus', value: val });
        }
        if (isArmor && !effects.some(e => e.type === 'ac_bonus')) {
            effects.push({ type: 'ac_bonus', value: val });
        }
        if (!isWeapon && !isArmor && val > 0) {
            // Generic +X item - likely spell focus
            effects.push({ type: 'spell_attack_bonus', value: val });
            effects.push({ type: 'spell_dc_bonus', value: val });
        }
    }

    // Stat bonuses: "+2 STR", "Güç puanınız +2"
    const statEN = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
    const statNames = {
        str: ['str', 'strength', 'güç'],
        dex: ['dex', 'dexterity', 'çeviklik'],
        con: ['con', 'constitution', 'dayanıklılık'],
        int: ['int', 'intelligence', 'zeka'],
        wis: ['wis', 'wisdom', 'bilgelik', 'hikmet'],
        cha: ['cha', 'charisma', 'karizma'],
    };
    for (const [statKey, names] of Object.entries(statNames)) {
        for (const name of names) {
            const m1 = desc.match(new RegExp(`\\+(\\d+)\\s*${name}`, 'i'));
            const m2 = desc.match(new RegExp(`${name}\\s*[^\\d]*\\+(\\d+)`, 'i'));
            const m = m1 || m2;
            if (m && !effects.some(e => e.type === 'stat_bonus' && e.stat === statEN[statKey])) {
                effects.push({ type: 'stat_bonus', stat: statEN[statKey], value: parseInt(m[1]) });
                break;
            }
        }
    }

    // Resistance patterns
    const dmgTypes = ['fire','cold','lightning','thunder','acid','poison','psychic','radiant','necrotic','force','bludgeoning','piercing','slashing'];
    dmgTypes.forEach(dt => {
        const patterns = [
            new RegExp(`resistance.*?${dt}`, 'i'),
            new RegExp(`${dt}.*?resistance`, 'i'),
            new RegExp(`${dt}.*?direnç`, 'i'),
            new RegExp(`direnç.*?${dt}`, 'i'),
        ];
        if (patterns.some(p => p.test(desc)) && !effects.some(e => e.type === 'resistance' && e.damageType === dt)) {
            effects.push({ type: 'resistance', damageType: dt });
        }
    });

    return effects;
}

async function main() {
    console.log("Fetching 5etools items...");
    const data5e = await fetchJson('https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/items.json');
    const baseData = await fetchJson('https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/items-base.json');
    
    const items5e = [...(data5e?.item || []), ...(baseData?.baseitem || [])];
    
    // Build MULTIPLE lookups for better matching
    const byExact = new Map();
    const byNorm = new Map(); // stripped of +1/+2/spaces/punctuation
    
    items5e.forEach(item => {
        byExact.set(item.name.toLowerCase(), item);
        const norm = item.name.toLowerCase().replace(/[+\d(),'\-\s]/g, '').trim();
        if (!byNorm.has(norm)) byNorm.set(norm, item);
    });

    const dataDir = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data';
    const batchFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('enriched_items_batch') && f.endsWith('.json'));

    let totalItems = 0;
    let matched5e = 0;
    let matchedDesc = 0;
    let noEffects = 0;

    for (const batchFile of batchFiles.sort()) {
        const filePath = `${dataDir}/${batchFile}`;
        const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        items.forEach(localItem => {
            totalItems++;
            const existingEffects = (localItem.effects || []).filter(e => e.type);
            
            // Try 5etools match first
            const exactKey = localItem.name.toLowerCase();
            const normKey = localItem.name.toLowerCase().replace(/[+\d(),'\-\s]/g, '').trim();
            
            let item5e = byExact.get(exactKey) || byNorm.get(normKey);
            
            // Try stripping common prefixes like "+1 " from name
            if (!item5e) {
                const stripped = localItem.name.replace(/^\+\d+\s+/, '').toLowerCase();
                item5e = byExact.get(stripped) || byNorm.get(stripped.replace(/[+\d(),'\-\s]/g, '').trim());
            }

            let newEffects = [];
            if (item5e) {
                newEffects = extractEffectsFrom5e(item5e);
                if (newEffects.length > 0) matched5e++;
            }

            // Also parse description for any bonuses not already found
            const descEffects = extractEffectsFromDesc(localItem);
            const existingTypes = new Set([...existingEffects, ...newEffects].map(e => e.type + (e.stat || '')));
            const descExtra = descEffects.filter(e => !existingTypes.has(e.type + (e.stat || '')));

            const merged = [...existingEffects, ...newEffects, ...descExtra];
            
            if (merged.length > existingEffects.length) {
                if (newEffects.length === 0 && descExtra.length > 0) matchedDesc++;
            }
            
            if (merged.length === 0) noEffects++;
            
            localItem.effects = merged;
        });

        fs.writeFileSync(filePath, JSON.stringify(items, null, 4));
    }

    console.log(`\nTotal items: ${totalItems}`);
    console.log(`Enriched via 5etools match: ~${matched5e}`);
    console.log(`Enriched via description parsing: ~${matchedDesc}`);
    console.log(`Still no parseable effects (flavor/RP items like Candle of Deep, etc.): ${noEffects}`);
    console.log('\nDone!');
}

main().catch(console.error);
