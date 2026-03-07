const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/wondrous_raw.json', 'utf8'));

// Final Batch: Items 1000 to end
const finalBatchRaw = rawData.slice(1000);

const finalBatchProcessed = finalBatchRaw.map(item => {
    return {
        name: item.name,
        name_tr: item.name, // Bulk items, keep original if no manual map
        category: item.category,
        subcategory: item.subcategory,
        rarity: item.rarity_raw,
        description: `Type: ${item.type_raw}`,
        description_tr: "",
        source: item.source,
        ...item
    };
});

fs.writeFileSync('backend/data/items_final.json', JSON.stringify(finalBatchProcessed, null, 2));
console.log(`Final batch (${finalBatchProcessed.length} items) processed.`);
