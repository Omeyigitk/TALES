const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/mundane_raw.json', 'utf8'));

// Batch 1: First 100 items
const batch1Raw = rawData.slice(0, 100);

const batch1Processed = batch1Raw.map(item => {
    let name_tr = item.name;
    let desc_tr = "";

    // Basic Translation Mapping for Common Names
    const translations = {
        "Padded": "Dolgulu Zırh",
        "Leather": "Deri Zırh",
        "Studded Leather": "Çivili Deri Zırh",
        "Hide": "Post Zırh",
        "Chain Shirt": "Zincir Gömlek",
        "Scale Mail": "Pullu Zırh",
        "Spiked Armor": "Dikenli Zırh",
        "Breastplate": "Göğüs Zırhı",
        "Halfplate": "Yarım Plaka Zırh",
        "Ring Mail": "Halka Zırh",
        "Chain Mail": "Zincir Zırh",
        "Splint": "Şerit Zırh",
        "Plate": "Tam Plaka Zırh",
        "Shield": "Kalkan",
        "Club": "Sopa",
        "Dagger": "Hançer",
        "Greatclub": "Gürz-Sopa",
        "Handaxe": "El Baltası",
        "Javelin": "Cirit",
        "Light hammer": "Hafif Çekiç",
        "Mace": "Topuz",
        "Quarterstaff": "Asa-Sopa",
        "Sickle": "Orak",
        "Spear": "Mızrak",
        "Crossbow, light": "Hafif Arbalet",
        "Dart": "Dart",
        "Shortbow": "Kısa Yay",
        "Sling": "Sapan",
        "Battleaxe": "Savaş Baltası",
        "Flail": "Topuzlu Zincir",
        "Glaive": "Gliv",
        "Greataxe": "Büyük Balta",
        "Greatsword": "Büyük Kılıç",
        "Halberd": "Halberd",
        "Lance": "Mızrak (Atlı)",
        "Longsword": "Uzun Kılıç",
        "Maul": "Balyoz",
        "Morningstar": "Sabah Yıldızı",
        "Pike": "Pike (Uzun Mızrak)",
        "Rapier": "Rapiyer",
        "Scimitar": "Pala",
        "Shortsword": "Kısa Kılıç",
        "Trident": "Üçlü Mızrak",
        "War pick": "Savaş Kazması",
        "Warhammer": "Savaş Çekici",
        "Whip": "Kamçı",
        "Blowgun": "Üfleme Borusu",
        "Crossbow, hand": "El Arbaleti",
        "Crossbow, heavy": "Ağır Arbalet",
        "Longbow": "Uzun Yay"
    };

    if (translations[item.name]) {
        name_tr = translations[item.name];
    }

    // Cost parsing
    let costObj = { quantity: 0, unit: 'gp' };
    if (item.cost_raw) {
        const match = item.cost_raw.match(/([\d,]+)\s*(cp|sp|ep|gp|pp)/i);
        if (match) {
            costObj.quantity = parseInt(match[1].replace(',', ''));
            costObj.unit = match[2].toLowerCase();
        }
    }

    // Weight parsing
    let weightVal = 0;
    if (item.weight_raw) {
        const match = item.weight_raw.match(/([\d./]+)/);
        if (match) {
            weightVal = eval(match[1]); // Handle fractions like 1/2
        }
    }

    return {
        name: item.name,
        name_tr: name_tr,
        category: item.category,
        cost: costObj,
        weight: weightVal,
        description: item.properties_raw || item.ac_raw || "",
        description_tr: "", // Will be filled as needed
        source: item.source,
        // Raw fields kept for reference in seeding/conversion
        ...item
    };
});

fs.writeFileSync('backend/data/items_batch_1.json', JSON.stringify(batch1Processed, null, 2));
console.log('Batch 1 (100 items) processed and saved to items_batch_1.json');
