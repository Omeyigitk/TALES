const fs = require('fs');
const path = require('path');

const dataDir = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data';

function getEnrichedNames() {
    const names = new Set();
    const files = fs.readdirSync(dataDir).filter(f => f.startsWith('enriched_items_batch_') && f.endsWith('.json'));
    files.forEach(f => {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
            data.forEach(item => {
                if (item.name) names.add(item.name.toLowerCase().trim());
            });
        } catch (e) { }
    });
    return names;
}

function getSourceItems() {
    const items = new Map(); // name -> item object

    // items.json (SRD)
    try {
        const srd = JSON.parse(fs.readFileSync(path.join(dataDir, 'items.json'), 'utf8'));
        srd.forEach(item => {
            const name = item.name.toLowerCase().trim();
            if (!items.has(name)) items.set(name, item);
        });
    } catch (e) { }

    // wondrous_details_batch_X.json
    const batchFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('wondrous_details_batch_') && !f.endsWith('_tr.json'));
    batchFiles.sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

    batchFiles.forEach(f => {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
            data.forEach(item => {
                const name = item.name.toLowerCase().trim();
                // Priority to batches that might have more info? 
                // For now, just first seen.
                if (!items.has(name)) {
                    items.set(name, item);
                }
            });
        } catch (e) { }
    });

    // mundane_raw.json
    try {
        const mundane = JSON.parse(fs.readFileSync(path.join('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend', 'mundane_raw.json'), 'utf8'));
        mundane.forEach(item => {
            const name = item.name.toLowerCase().trim();
            if (!items.has(name)) items.set(name, item);
        });
    } catch (e) { }

    // wondrous_raw.json
    try {
        const wondrous = JSON.parse(fs.readFileSync(path.join('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend', 'wondrous_raw.json'), 'utf8'));
        wondrous.forEach(item => {
            const name = item.name.toLowerCase().trim();
            if (!items.has(name)) items.set(name, item);
        });
    } catch (e) { }

    return items;
}

const enrichedNames = getEnrichedNames();
const sourceItems = getSourceItems();

const missing = [];
sourceItems.forEach((item, name) => {
    if (!enrichedNames.has(name)) {
        missing.push(item);
    }
});

console.log(`Unique Enriched: ${enrichedNames.size}`);
console.log(`Unique Source: ${sourceItems.size}`);
console.log(`Missing Items: ${missing.length}`);

if (missing.length > 0) {
    const batch13 = missing.slice(0, 50); // Small batch first to avoid too much text
    console.log('\n--- BATCH 13 (50 items) ---');
    console.log(JSON.stringify(batch13.map(i => i.name), null, 2));
}
