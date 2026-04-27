const fs = require('fs');
const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function findMissingNecromancy() {
    const localRaw = fs.readFileSync('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json', 'utf8');
    const localSpellsObj = JSON.parse(localRaw);
    const localSpells = Array.isArray(localSpellsObj) ? localSpellsObj : Object.values(localSpellsObj);
    const localNames = new Set(localSpells.map(s => s.name.toLowerCase()));

    const baseUrl = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/spells/';
    const index = await fetchJson(baseUrl + 'index.json');
    const files = Object.values(index);

    const missing = [];

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const data = await fetchJson(baseUrl + file);
        if (!data.spell) continue;

        for (const spell of data.spell) {
            if (!localNames.has(spell.name.toLowerCase())) {
                missing.push(spell);
            }
        }
    }

    console.log(`Found ${missing.length} missing spells total.`);
    missing.forEach(m => console.log(`- ${m.name} (Level ${m.level}) [${m.source}]`));
    
    // Save to tmp file for agent to read
    fs.writeFileSync('/tmp/missing_necro.json', JSON.stringify(missing, null, 2));
}

findMissingNecromancy().catch(console.error);
