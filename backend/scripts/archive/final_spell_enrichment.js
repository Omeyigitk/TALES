const fs = require('fs');
const https = require('https');

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || ''; // Use user key if available, otherwise fallback
const DB_PATH = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json';

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

async function translateText(text) {
    if (!text || text.trim() === '') return text;
    if (!API_KEY) return text; // Can't translate without key

    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
        const body = JSON.stringify({
            q: text,
            target: 'tr',
            format: 'text'
        });

        return new Promise((resolve, reject) => {
            const req = https.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            }, (res) => {
                let d = '';
                res.on('data', chunk => d += chunk);
                res.on('end', () => {
                    const js = JSON.parse(d);
                    resolve(js.data?.translations[0]?.translatedText || text);
                });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    } catch (e) {
        console.error("Translation error:", e);
        return text;
    }
}

async function main() {
    console.log("Starting Global Spell Enrichment...");
    
    // 1. Load Local DB
    const localData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const localSpells = Array.isArray(localData) ? localData : Object.values(localData);
    const localNames = new Set(localSpells.map(s => s.name.toLowerCase()));
    
    // 2. Load Mappings
    console.log("Fetching class mappings...");
    const sourcesData = await fetchJson('https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/spells/sources.json');
    
    // 3. Load Spell Files Index
    console.log("Fetching spell index...");
    const index = await fetchJson('https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/spells/index.json');
    const files = Object.values(index);

    let newSpells = [];

    for (const file of files) {
        if (!file.endsWith('.json') || file.includes('xphb') || file.includes('fluff')) continue;
        console.log(`Processing ${file}...`);
        
        const data = await fetchJson('https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/spells/' + file);
        if (!data || !data.spell) continue;

        for (const s of data.spell) {
            if (localNames.has(s.name.toLowerCase())) continue;
            if (s.source && (s.source.includes("UA") || s.source === "XPHB")) continue;

            console.log(`Found missing spell: ${s.name}`);

            // Get classes from sources mapping
            let classes = [];
            const srcKey = s.source.toUpperCase();
            if (sourcesData[srcKey] && sourcesData[srcKey][s.name]) {
                const list = sourcesData[srcKey][s.name].class || [];
                classes = list.map(c => c.name.toLowerCase());
            }

            // Map school codes
            const schools = {
                'A': 'Abjuration', 'C': 'Conjuration', 'D': 'Divination', 'E': 'Enchantment',
                'V': 'Evocation', 'I': 'Illusion', 'N': 'Necromancy', 'T': 'Transmutation'
            };
            const schoolName = schools[s.school] || s.school;

            // Prepare description
            let englishDesc = s.entries ? s.entries.join('\n') : '';
            // Very simple "hybrid" translation: translate paragraphs but keep terms
            // For now, let's just do a basic translation to keep it safe
            let trDesc = await translateText(englishDesc);

            const newSpell = {
                name: s.name,
                name_tr: s.name, // Keep English name as primary but can add name_tr if needed
                level: s.level,
                school: schoolName,
                castingTime: s.time ? `${s.time[0].number} ${s.time[0].unit}` : "1 action",
                range: s.range ? (s.range.distance ? `${s.range.distance.amount} ${s.range.distance.type}` : s.range.type) : "Self",
                components: s.components ? Object.keys(s.components).join(', ').toUpperCase() : "V, S",
                duration: s.duration ? (s.duration[0].duration ? `${s.duration[0].duration.amount} ${s.duration[0].duration.type}` : s.duration[0].type) : "Instantaneous",
                description: trDesc,
                classes: classes,
                subclasses: [],
                source: s.source
            };

            newSpells.push(newSpell);
            localNames.add(s.name.toLowerCase());
            
            // Safety break for testing/rate limit
            if (newSpells.length >= 300) break; 
        }
        if (newSpells.length >= 300) break;
    }

    if (newSpells.length > 0) {
        console.log(`Injecting ${newSpells.length} new spells...`);
        const finalData = [...localSpells, ...newSpells];
        fs.writeFileSync(DB_PATH, JSON.stringify(finalData, null, 4));
        console.log("Successfully injected all expansion spells!");
    } else {
        console.log("No new spells found to add.");
    }
}

main().catch(console.error);
