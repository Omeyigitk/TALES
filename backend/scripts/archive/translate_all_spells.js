const fs = require('fs');
const https = require('https');

// Helper to reliably translate text
function translateText(text) {
    if (!text || text.trim() === '') return Promise.resolve(text);
    return new Promise((resolve) => {
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=' + encodeURIComponent(text);
        https.get(url, (res) => {
            let d = '';
            res.on('data', chunk => d += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(d);
                    const translated = parsed[0].map(x => x[0]).join('');
                    resolve(translated);
                } catch (e) {
                    resolve(text); // fallback to original on fail
                }
            });
        }).on('error', () => resolve(text));
    });
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
            });
        }).on('error', reject);
    });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("Starting master spell ingestion...");
    const dbPath = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json';
    const localRaw = fs.readFileSync(dbPath, 'utf8');
    const localSpellsObj = JSON.parse(localRaw);
    const localSpells = Array.isArray(localSpellsObj) ? localSpellsObj : Object.values(localSpellsObj);
    const localNames = new Set(localSpells.map(s => s.name.toLowerCase()));

    const baseUrl = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/spells/';
    const index = await fetchJson(baseUrl + 'index.json');
    if (!index) { console.log("Failed to fetch 5etools index."); return; }
    
    // Some basic formats mappings
    const formatTime = (tArr) => {
        if (!tArr || tArr.length === 0) return "1 action";
        const t = tArr[0];
        return `${t.number} ${t.unit}${t.condition ? ' (' + t.condition + ')' : ''}`;
    };
    const formatComponents = (c) => {
        if (!c) return "V";
        let str = [];
        if (c.v) str.push("V");
        if (c.s) str.push("S");
        if (c.m) str.push("M");
        return str.join(", ");
    };
    const formatMaterial = (c) => {
        if (!c || !c.m) return "";
        if (typeof c.m === 'string') return c.m;
        if (c.m.text) return c.m.text;
        return "";
    };
    const formatDuration = (dArr) => {
        if (!dArr || dArr.length === 0) return "Instantaneous";
        const d = dArr[0];
        let durStr = "";
        if (d.type === 'instant') durStr = "Instantaneous";
        else if (d.type === 'timed') durStr = `${d.duration.amount} ${d.duration.type}`;
        else durStr = "Special";
        return d.concentration ? `Concentration, up to ${durStr}` : durStr;
    };
    const getSchool = (s) => {
        const smap = { "A": "abjuration", "C": "conjuration", "D": "divination", "E": "enchantment", "V": "evocation", "I": "illusion", "N": "necromancy", "T": "transmutation" };
        return smap[s] || "evocation";
    };

    let missing = [];
    const files = Object.values(index);
    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const data = await fetchJson(baseUrl + file);
        if (!data || !data.spell) continue;

        for (const spell of data.spell) {
            // Ignore UA/Variants/One D&D duplicates mostly, keep to base + core books
            if (spell.source.includes("UA") || spell.source === "XPHB") continue; 
            
            // Check if valid spellcasting class
            let hasClass = false;
            let classesArr = [];
            if (spell.classes && spell.classes.fromClassList) {
                const coreClasses = ['wizard','warlock','sorcerer','cleric','paladin','ranger','druid','bard','artificer'];
                const valid = spell.classes.fromClassList.filter(c => coreClasses.includes(c.name.toLowerCase()));
                if (valid.length > 0) {
                    hasClass = true;
                    classesArr = valid.map(c => c.name);
                }
            }
            // Some subclasses give spells directly
            let subclassesArr = [];
            if (spell.classes && spell.classes.fromSubclass) {
                hasClass = true;
                subclassesArr = spell.classes.fromSubclass.map(sc => sc.subclass.name);
            }

            if (hasClass && !localNames.has(spell.name.toLowerCase())) {
                missing.push({
                    raw: spell,
                    classes: classesArr,
                    subclasses: subclassesArr
                });
                localNames.add(spell.name.toLowerCase()); // Avoid duplicates across modules e.g., Tasha & Xanathar overlaps
            }
        }
    }

    console.log(`Found ${missing.length} missing spells! Starting translation...`);
    
    // We'll translate descriptions
    let addedCount = 0;
    
    for (let i = 0; i < missing.length; i++) {
        const item = missing[i];
        const sp = item.raw;
        
        let descEng = "";
        if (sp.entries) {
            descEng = sp.entries.map(e => typeof e === 'string' ? e : (e.name ? `[${e.name}]: ` + (e.entries ? e.entries.join(' ') : '') : '')).join('\n\n');
        }
        // Remove 5etools tags like {@spell ...} -> ...
        descEng = descEng.replace(/\{@[^}]*?\|([^}]+)\}/g, '$1').replace(/\{@[^}]*? ([^}]+)\}/g, '$1');
        
        let higherEng = "";
        if (sp.entriesHigherLevel && sp.entriesHigherLevel[0]) {
            const h = sp.entriesHigherLevel[0];
            higherEng = (h.entries || []).map(e => typeof e === 'string' ? e : '').join(' ');
            higherEng = higherEng.replace(/\{@[^}]*?\|([^}]+)\}/g, '$1').replace(/\{@[^}]*? ([^}]+)\}/g, '$1');
        }

        const transDesc = await translateText(descEng);
        await sleep(150); // Be nice to google
        let transHigher = "";
        if (higherEng) {
            transHigher = await translateText(higherEng);
            await sleep(150);
        }

        // Material translation
        let transMat = "";
        const matDesc = formatMaterial(sp.components);
        if (matDesc) {
            transMat = await translateText(matDesc);
            await sleep(150);
        }

        const formattedSpell = {
            name: sp.name,
            level: sp.level === 0 ? "Cantrip" : `${sp.level}th-level`,
            level_int: sp.level,
            school: getSchool(sp.school),
            time: formatTime(sp.time),
            range: sp.range ? (sp.range.distance ? `${sp.range.distance.amount || ''} ${sp.range.distance.type || 'Self'}`.trim() : "Self") : "Self",
            components: formatComponents(sp.components),
            material_desc: transMat,
            duration: formatDuration(sp.duration),
            ritual: !!sp.ritual,
            concentration: sp.duration && sp.duration[0] && sp.duration[0].concentration ? true : false,
            classes: item.classes,
            desc: transDesc,
            higher_level: transHigher,
            subclasses: item.subclasses
        };

        if (Array.isArray(localSpellsObj)) {
            localSpellsObj.push(formattedSpell);
        } else {
            localSpellsObj[formattedSpell.name] = formattedSpell;
        }
        addedCount++;

        if (i % 25 === 0) console.log(`Progress: translated ${i} / ${missing.length}`);
    }

    fs.writeFileSync(dbPath, JSON.stringify(localSpellsObj, null, 4));
    console.log(`\nSuccessfully translated and appended ${addedCount} total spells!`);
}

main().catch(console.error);
