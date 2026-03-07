const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/wondrous_raw.json', 'utf8'));

// Batch 8: Items 500-600
const batch8Raw = rawData.slice(500, 600);

const batch8Processed = batch8Raw.map(item => {
    let name_tr = item.name;

    // Magic Item Name Translations (501-600)
    const translations = {
        "Amulet of Health": "Sağlık Muskası",
        "Belt of Giant Strength": "Dev Gücü Kemeri",
        "Cloak of Protection": "Koruma Pelerini",
        "Ioun Stone of Absorption": "Ioun Emilim Taşı",
        "Ioun Stone of Agility": "Ioun Çeviklik Taşı",
        "Ioun Stone of Fortitude": "Ioun Dayanıklılık Taşı",
        "Ioun Stone of Insight": "Ioun Sezgi Taşı",
        "Ioun Stone of Intellect": "Ioun Zeka Taşı",
        "Ioun Stone of Leadership": "Ioun Liderlik Taşı",
        "Ioun Stone of Mastery": "Ioun Ustalık Taşı",
        "Ioun Stone of Protection": "Ioun Koruma Taşı",
        "Ioun Stone of Regeneration": "Ioun Yenilenme Taşı",
        "Ioun Stone of Reserve": "Ioun Rezerv Taşı",
        "Ioun Stone of Strength": "Ioun Güç Taşı",
        "Ioun Stone of Sustenance": "Ioun Besin Taşı",
        "Ioun Stone of Understanding": "Ioun Anlayış Taşı",
        "Manual of Bodily Health": "Vücut Sağlığı Kitabı",
        "Manual of Golems": "Golem Kitabı",
        "Manual of Gainful Exercise": "Faydalı Egzersiz Kitabı",
        "Manual of Quickness of Action": "Eylem Çabukluğu Kitabı",
        "Staff of the Magi": "Büyücülerin Asası",
        "Staff of Power": "Güç Asası",
        "Tome of Clear Thought": "Berrak Düşünce Kitabı",
        "Tome of Leadership and Influence": "Liderlik ve Nüfuz Kitabı",
        "Tome of Understanding": "Anlayış Kitabı"
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

fs.writeFileSync('backend/data/items_batch_8.json', JSON.stringify(batch8Processed, null, 2));
console.log('Batch 8 processed.');
