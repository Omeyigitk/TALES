const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/wondrous_raw.json', 'utf8'));

// Batch 9: Items 600-700
const batch9Raw = rawData.slice(600, 700);

const batch9Processed = batch9Raw.map(item => {
    let name_tr = item.name;

    // Magic Item Name Translations (601-700)
    const translations = {
        "Amulet of Health": "Sağlık Muskası",
        "Belt of Giant Strength": "Dev Gücü Kemeri",
        "Cloak of Protection": "Koruma Pelerini"
    };

    if (translations[item.name]) {
        name_tr = translations[item.name];
    }

    return {
        name: item.name,
        name_tr: name_tr,
        category: item.category,
        subcategory: item.subcategory,
        rarity: item.rarity_raw,
        description: `Type: ${item.type_raw}`,
        description_tr: "",
        source: item.source,
        ...item
    };
});

fs.writeFileSync('backend/data/items_batch_9.json', JSON.stringify(batch9Processed, null, 2));
console.log('Batch 9 processed.');
