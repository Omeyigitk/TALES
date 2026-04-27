const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/wondrous_raw.json', 'utf8'));

// Batch 6: Items 300-400
const batch6Raw = rawData.slice(300, 400);

const batch6Processed = batch6Raw.map(item => {
    let name_tr = item.name;

    // Magic Item Name Translations (301-400)
    const translations = {
        "Amulet of Pure Good": "Saf İyilik Muskası",
        "Amulet of Ultimate Evil": "Nihai Kötülük Muskası",
        "Apparatus of the Crab": "Yengeç Tertibatı (Apparatus of Kwalish)",
        "Armor of Gleaming": "Işıltı Zırhı",
        "Armor of Smoldering": "Tüten Zırh",
        "Bag of Beans": "Fasulye Çantası",
        "Bead of Nourishment": "Beslenme Boncuğu",
        "Bead of Refreshment": "Tazelenme Boncuğu",
        "Boots of False Tracks": "Sahte İz Çizmeleri",
        "Candle of the Deep": "Derinlik Mumu",
        "Cast-Off Armor": "Hızlı Çıkarılan Zırh",
        "Charlatan's Die": "Şarlatanın Zarı",
        "Cloak of Billowing": "Dalgalanan Pelerin",
        "Cloak of Many Fashions": "Pek Çok Moda Pelerini",
        "Clockwork Amulet": "Saatli Muska",
        "Clothes of Mending": "Onarım Kıyafetleri",
        "Dark Shard Amulet": "Karanlık Parça Muskası",
        "Dread Helm": "Dehşet Kalkanı/Miğferi",
        "Earring of Whisper": "Fısıltı Küpesi",
        "Enduring Spellbook": "Dayanıklı Büyü Kitabı",
        "Ersatz Eye": "Yedek Göz",
        "Hat of Vermin": "Haşere Şapkası",
        "Hat of Wizardry": "Büyücülük Şapkası",
        "Heward's Handy Haversack": "Heward'ın Kullanışlı Çantası",
        "Horn of Silent Alarm": "Sessiz Alarm Borusu",
        "Instrument of Illusions": "İllüzyon Enstrümanı",
        "Instrument of Scribing": "Yazı Enstrümanı",
        "Lock of Trickery": "Hile Kilidi",
        "Moon-Touched Sword": "Ay Temaslı Kılıç",
        "Mystery Key": "Gizemli Anahtar",
        "Orb of Direction": "Yön Küresi",
        "Orb of Time": "Zaman Küresi",
        "Perfume of Bewitching": "Büyüleme Parfümü",
        "Pipe of Smoke Monsters": "Duman Canavarları Piposu",
        "Pole of Angling": "Olta Sırığı",
        "Pole of Collapsing": "Katlanır Sırık",
        "Pot of Awakening": "Uyanış Saksısı",
        "Rope of Mending": "Onarım Halatı",
        "Ruby of the War Mage": "Savaş Büyücüsü Yakutu",
        "Shield of Expression": "İfade Kalkanı",
        "Smoldering Armor": "Tüten Zırh",
        "Staff of Adornment": "Süsleme Asası",
        "Staff of Birdcalls": "Kuş Sesi Asası",
        "Staff of Flowers": "Çiçekler Asası",
        "Talking Doll": "Konuşan Oyuncak Bebek",
        "Tankard of Sobriety": "Ayıklık Kupası",
        "Unbreakable Arrow": "Kırılmaz Ok",
        "Veteran's Cane": "Gazi Bastonu",
        "Walloping Arrow": "Gümbürdeyen Ok",
        "Wand of Conducting": "Yönetme Asası",
        "Wand of Pyrotechnics": "Havai Fişek Asası",
        "Wand of Scowls": "Kaş Çatma Asası",
        "Wand of Smiles": "Gülümseme Asası"
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

fs.writeFileSync('backend/data/items_batch_6.json', JSON.stringify(batch6Processed, null, 2));
console.log('Batch 6 processed.');
