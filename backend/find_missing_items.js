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
        } catch (e) {
            console.error(`Error reading ${f}:`, e.message);
        }
    });
    return names;
}

function getSourceItems() {
    const items = new Map(); // name -> item object

    // items.json (SRD)
    try {
        const srd = JSON.parse(fs.readFileSync(path.join(dataDir, 'items.json'), 'utf8'));
        srd.forEach(item => {
            items.set(item.name.toLowerCase().trim(), item);
        });
    } catch (e) { }

    // wondrous_details_batch_X.json
    const batchFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('wondrous_details_batch_') && !f.endsWith('_tr.json'));
    batchFiles.forEach(f => {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
            data.forEach(item => {
                const name = item.name.toLowerCase().trim();
                if (!items.has(name)) {
                    items.set(name, item);
                }
            });
        } catch (e) { }
    });

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

console.log(`Total Unique Enriched: ${enrichedNames.size}`);
console.log(`Total Unique Source: ${sourceItems.size}`);
console.log(`Total Missing: ${missing.length}`);

// Output first 100 missing items for Batch 13
if (missing.length > 0) {
    const batch13 = missing.slice(0, 100);
    fs.writeFileSync(path.join(dataDir, 'missing_items_batch_13.json'), JSON.stringify(batch13, null, 2));
    console.log(`\nWritten 100 missing items to missing_items_batch_13.json`);
}

