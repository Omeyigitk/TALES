const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/wondrous_raw.json', 'utf8'));

// Batch 11: Items 800-900
const batch11Raw = rawData.slice(800, 900);

const batch11Processed = batch11Raw.map(item => {
    let name_tr = item.name;

    // Magic Item Name Translations (801-900)
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

fs.writeFileSync('backend/data/items_batch_11.json', JSON.stringify(batch11Processed, null, 2));
console.log('Batch 11 processed.');
