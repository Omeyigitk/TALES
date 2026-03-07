const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/wondrous_raw.json', 'utf8'));

// Batch 3: First 100 Wondrous Items
const batch3Raw = rawData.slice(0, 100);

const batch3Processed = batch3Raw.map(item => {
    let name_tr = item.name;

    // Magic Item Name Translations (First 100)
    const translations = {
        "Abracadabrus": "Abracadabrus",
        "Adamantine Armor": "Adamantin Zırh",
        "Amulet of Health": "Sağlık Muskası",
        "Amulet of Proof against Detection and Location": "Tespit ve Yer Belirlemeye Karşı Muska",
        "Amulet of the Planes": "Düzlemler Muskası",
        "Animated Shield": "Hareketli Kalkan",
        "Apparatus of Kwalish": "Kwalish Tertibatı",
        "Armor of Invulnerability": "İncinmezlik Zırhı",
        "Armor of Resistance": "Direnç Zırhı",
        "Armor of Vulnerability": "Hassasiyet Zırhı",
        "Arrow-Catching Shield": "Ok Yakalayan Kalkan",
        "Arrow of Slaying": "Katletme Oku",
        "Bag of Beans": "Fasulye Torbası",
        "Bag of Devouring": "Yutma Torbası",
        "Bag of Holding": "Eşya Torbası (Sonsuz Torba)",
        "Bag of Tricks": "Hile Torbası",
        "Bead of Force": "Kuvvet Boncuğu",
        "Belt of Dwarvenkind": "Cüce Türü Kemeri",
        "Belt of Giant Strength": "Dev Gücü Kemeri",
        "Berserker Axe": "Berserker Baltası",
        "Boots of Elvenkind": "Elf Türü Çizmeleri",
        "Boots of Levitation": "Levitasyon Çizmeleri",
        "Boots of Speed": "Hız Çizmeleri",
        "Boots of Striding and Springing": "Adımlama ve Sıçrama Çizmeleri",
        "Boots of the Winterlands": "Kış Diyarı Çizmeleri",
        "Bowl of Commanding Water Elementals": "Su Elementallerine Hükmetme Kasesi",
        "Bracers of Archery": "Okçuluk Kollukları",
        "Bracers of Defense": "Savunma Kollukları",
        "Brazier of Commanding Fire Elementals": "Ateş Elementallerine Hükmetme Mangalı",
        "Brooch of Shielding": "Kalkan Broşu",
        "Broom of Flying": "Uçan Süpürge",
        "Candle of Invocation": "Yakarma Mumu",
        "Cape of the Mountebank": "Şarlatan Pelerini",
        "Censer of Controlling Air Elementals": "Hava Elementallerini Kontrol Etme Buhurdanlığı",
        "Chime of Opening": "Açılış Çanı",
        "Cloak of Arachnida": "Örümcek Pelerini",
        "Cloak of Displacement": "Yer Değiştirme Pelerini",
        "Cloak of Elvenkind": "Elf Türü Pelerini",
        "Cloak of Invisibility": "Görünmezlik Pelerini",
        "Cloak of Protection": "Koruma Pelerini",
        "Cloak of the Bat": "Yarasa Pelerini",
        "Cloak of the Manta Ray": "Vatoz Pelerini",
        "Crystal Ball": "Kristal Küre",
        "Cube of Force": "Kuvvet Küpü",
        "Cubic Gate": "Kübik Kapı",
        "Daern's Instant Fortress": "Daern'in Anlık Kalesi",
        "Decanter of Endless Water": "Sonsuz Su Sürahisi",
        "Deck of Illusions": "İllüzyon Destesi",
        "Deck of Many Things": "Pek Çok Şeyin Destesi",
        "Defender": "Savunucu",
        "Demon Armor": "İblis Zırhı",
        "Dimensional Shackles": "Boyutsal Kelepçeler",
        "Dragon Slayer": "Ejderha Katili",
        "Dust of Appearance": "Görünme Tozu",
        "Dust of Disappearance": "Kaybolma Tozu",
        "Dust of Dryness": "Kuruluk Tozu",
        "Dust of Sneezing and Choking": "Hapşırma ve Boğulma Tozu",
        "Efreeti Bottle": "İfrit Şişesi",
        "Elemental Gem": "Elementel Mücevher",
        "Elixir of Health": "Sağlık İksiri",
        "Eversmoking Bottle": "Hiç Sönmeyen Duman Şişesi",
        "Eyes of Charming": "Cazibe Gözleri",
        "Eyes of Minute Seeing": "Detay Görme Gözleri",
        "Eyes of the Eagle": "Kartal Gözleri",
        "Feather Token": "Tüy Nişanı",
        "Figurine of Wondrous Power": "Harika Güç Figürü",
        "Flame Tongue": "Alev Dili",
        "Folding Boat": "Katlanır Tekne",
        "Frost Brand": "Don Markası",
        "Gauntlets of Ogre Power": "Ogre Gücü Eldivenleri",
        "Gem of Brightness": "Parlaklık Mücevheri",
        "Gem of Seeing": "Görü Mücevheri",
        "Giant Slayer": "Dev Katili",
        "Glamoured Studded Leather": "Büyülü Çivili Deri Zırh",
        "Gloves of Missile Snaring": "Füze Yakalama Eldivenleri",
        "Gloves of Swimming and Climbing": "Yüzme ve Tırmanma Eldivenleri",
        "Gloves of Thievery": "Hırsızlık Eldivenleri",
        "Goggles of Night": "Gece Gözlükleri",
        "Hammer of Thunderbolts": "Yıldırım Çekici",
        "Hat of Disguise": "Kılık Değiştirme Şapkası",
        "Helm of Brilliance": "Görkem Miğferi",
        "Helm of Comprehending Languages": "Dil Anlama Miğferi",
        "Helm of Telepathy": "Telepati Miğferi",
        "Helm of Teleportation": "Işınlanma Miğferi",
        "Holy Avenger": "Kutsal İntikamcı",
        "Horn of Blasting": "Patlama Borusu",
        "Horn of Valhalla": "Valhalla Borusu",
        "Horseshoes of Speed": "Hız Nalları",
        "Horseshoes of a Zephyr": "Meltem Nalları",
        "Instant Fortress": "Anlık Kale",
        "Ioun Stone": "Ioun Taşı",
        "Iron Bands of Bilarro": "Bilarro'nun Demir Bağları",
        "Iron Flask": "Demir Matara",
        "Javelin of Lightning": "Yıldırım Ciriti",
        "Lantern of Revealing": "Açığa Çıkarma Feneri",
        "Luck Blade": "Şans Kılıcı",
        "Mace of Disruption": "Bozma Topuzu",
        "Mace of Smiting": "Darbe Topuzu",
        "Mace of Terror": "Dehşet Topuzu",
        "Mantle of Spell Resistance": "Büyü Direnci Pelerini"
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

fs.writeFileSync('backend/data/items_batch_3.json', JSON.stringify(batch3Processed, null, 2));
console.log('Batch 3 (100 Magic Items) processed and saved to items_batch_3.json');
