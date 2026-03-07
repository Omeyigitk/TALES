const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/mundane_raw.json', 'utf8'));

// Batch 1 covered the main 18 armor/weapon rows. 
// Let's grab the next 100, starting after the initial set.
const batch2Raw = rawData.slice(182, 282);

const batch2Processed = batch2Raw.map(item => {
    let name_tr = item.name;
    let desc_tr = "";

    // Common Item Translations
    const translations = {
        "Abacus": "Abaküs",
        "Acid (vial)": "Asit (Şişe)",
        "Alchemist's fire (flask)": "Simyacı Ateşi (Matara)",
        "Antitoxin (vial)": "Antitoksin (Şişe)",
        "Backpack": "Sırt Çantası",
        "Ball bearings (bag of 1,000)": "Misketler (1.000'lik Torba)",
        "Barrel": "Varil",
        "Basket": "Sepet",
        "Bedroll": "Uyku Tulumu",
        "Bell": "Zil",
        "Blanket": "Battaniye",
        "Block and tackle": "Makara Sistemi",
        "Book": "Kitap",
        "Glass bottle": "Cam Şişe",
        "Bucket": "Kova",
        "Caltrops (bag of 20)": "Dikenler (20'lik Torba)",
        "Candle": "Mum",
        "Case, crossbow bolt": "Arbalet Oku Kutusu",
        "Case, map or scroll": "Harita veya Parşömen Tüpü",
        "Chain (10 feet)": "Zincir (10 feet)",
        "Chalk (1 piece)": "Tebeşir (1 adet)",
        "Chest": "Sandık",
        "Climber's kit": "Tırmanma Kiti",
        "Clothes, common": "Sıradan Kıyafetler",
        "Clothes, costume": "Kostüm Kıyafetleri",
        "Clothes, fine": "Kaliteli Kıyafetler",
        "Clothes, traveler's": "Yolcu Kıyafetleri",
        "Component pouch": "Bileşen Kesesi",
        "Crowbar": "Levye",
        "Fishing tackle": "Balıkçılık Takımı",
        "Flask or tankard": "Matara veya Kupa",
        "Grappling hook": "Kanca",
        "Hammer": "Çekiç",
        "Hammer, sledge": "Balyoz",
        "Holy symbol": "Kutsal Sembol",
        "Amulet": "Muska",
        "Emblem": "Amblem",
        "Reliquary": "Yadigar Kutusu",
        "Holy water (flask)": "Kutsal Su (Matara)",
        "Hourglass": "Kum Saati",
        "Hunting trap": "Av Tuzağı",
        "Ink (1 ounce bottle)": "Mürekkep (1 onsluk şişe)",
        "Ink pen": "Mürekkep Kalemi",
        "Ladder (10 feet)": "Merdiven (10 feet)",
        "Lamp": "Lamba",
        "Lantern, bullseye": "Odaklı Fener",
        "Lantern, hooded": "Kapüşonlu Fener",
        "Lock": "Kilit",
        "Magnifying glass": "Büyüteç",
        "Manacles": "Kelepçe",
        "Mess kit": "Yemek Takımı",
        "Mirror, steel": "Çelik Ayna",
        "Oil (flask)": "Yağ (Matara)",
        "Paper (one sheet)": "Kağıt (bir sayfa)",
        "Parchment (one sheet)": "Parşömen (bir sayfa)",
        "Perfume (vial)": "Parfüm (Şişe)",
        "Pick, miner's": "Kazma",
        "Piton": "Piton (Tırmanma Çivisi)",
        "Poison, basic (vial)": "Temel Zehir (Şişe)",
        "Pole (10-foot)": "Sırık (10 feet)",
        "Pot, iron": "Demir Tencere",
        "Potion of healing": "İyileştirme İksiri",
        "Pouch": "Kese",
        "Quiver": "Sadak",
        "Ram, portable": "Taşınabilir Koçbaşı",
        "Rations (1 day)": "Erzak (1 günlük)",
        "Ropes": "Halatlar",
        "Hempen rope (50 feet)": "Kenevir Halat (50 feet)",
        "Silk rope (50 feet)": "İpek Halat (50 feet)",
        "Sack": "Çuval",
        "Scale, merchant's": "Tüccar Terazisi"
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
            weightVal = eval(match[1]);
        }
    }

    return {
        name: item.name,
        name_tr: name_tr,
        category: item.category,
        cost: costObj,
        weight: weightVal,
        description: item.properties_raw || item.ac_raw || "",
        description_tr: "",
        source: item.source,
        ...item
    };
});

fs.writeFileSync('backend/data/items_batch_2.json', JSON.stringify(batch2Processed, null, 2));
console.log('Batch 2 (100 items) processed and saved to items_batch_2.json');
