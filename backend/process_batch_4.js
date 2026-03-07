const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/wondrous_raw.json', 'utf8'));

// Batch 4: Items 100-200 from Wondrous list
const batch4Raw = rawData.slice(100, 200);

const batch4Processed = batch4Raw.map(item => {
    let name_tr = item.name;

    // Magic Item Name Translations (101-200)
    const translations = {
        "Manual of Bodily Health": "Vücut Sağlığı Kitabı",
        "Manual of Gainful Exercise": "Faydalı Egzersiz Kitabı",
        "Manual of Golems": "Golem Kitabı",
        "Manual of Quickness of Action": "Eylem Çabukluğu Kitabı",
        "Marvelous Pigments": "Harika Pigmentler",
        "Medallion of Thoughts": "Düşünce Madalyonu",
        "Mirror of Life Trapping": "Yaşam Tuzağı Aynası",
        "Mithral Armor": "Mitril Zırh",
        "Necklace of Adaptation": "Uyum Kolyesi",
        "Necklace of Fireballs": "Ateş Topu Kolyesi",
        "Necklace of Prayer Beads": "Dua Boncukları Kolyesi",
        "Nine Lives Stealer": "Dokuz Can Çalan",
        "Oil of Etherealness": "Eteriklik Yağı",
        "Oil of Sharpness": "Keskinlik Yağı",
        "Oil of Slipperiness": "Kayganlık Yağı",
        "Oliwa": "Oliwa",
        "Orb of Dragonkind": "Ejderha Türü Küresi",
        "Periapt of Proof against Poison": "Zehre Karşı Koruma Muskası",
        "Periapt of Wound Closure": "Yara Kapatma Muskası",
        "Philter of Love": "Aşk İksiri",
        "Pipes of Haunting": "Korkutma Kavalı",
        "Pipes of the Sewers": "Lağım Kavalı",
        "Portable Hole": "Taşınabilir Delik",
        "Potion of Animal Friendship": "Hayvan Dostluğu İksiri",
        "Potion of Clairvoyance": "Durugörü İksiri",
        "Potion of Diminution": "Küçülme İksiri",
        "Potion of Flying": "Uçma İksiri",
        "Potion of Gaseous Form": "Gaz Formu İksiri",
        "Potion of Giant Strength": "Dev Gücü İksiri",
        "Potion of Growth": "Büyüme İksiri",
        "Potion of Heroism": "Kahramanlık İksiri",
        "Potion of Invisibility": "Görünmezlik İksiri",
        "Potion of Mind Reading": "Akıl Okuma İksiri",
        "Potion of Poison": "Zehir İksiri",
        "Potion of Resistance": "Direnç İksiri",
        "Potion of Speed": "Hız İksiri",
        "Potion of Water Breathing": "Su Altında Nefes Alma İksiri",
        "Restorative Ointment": "Onarıcı Merhem",
        "Ring of Animal Influence": "Hayvan Etkileme Yüzüğü",
        "Ring of Djinni Summoning": "Cin Çağırma Yüzüğü",
        "Ring of Elemental Command": "Elementel Hükmetme Yüzüğü",
        "Ring of Evasion": "Kaçınma Yüzüğü",
        "Ring of Feather Falling": "Tüy Gibi Düşme Yüzüğü",
        "Ring of Free Action": "Özgür Hareket Yüzüğü",
        "Ring of Invisibility": "Görünmezlik Yüzüğü",
        "Ring of Jumping": "Zıplama Yüzüğü",
        "Ring of Mind Shielding": "Zihin Kalkanı Yüzüğü",
        "Ring of Protection": "Koruma Yüzüğü",
        "Ring of Regeneration": "Yenilenme Yüzüğü",
        "Ring of Resistance": "Direnç Yüzüğü",
        "Ring of Shooting Stars": "Kayan Yıldızlar Yüzüğü",
        "Ring of Spell Storing": "Büyü Depolama Yüzüğü",
        "Ring of Spell Turning": "Büyü Yansıtma Yüzüğü",
        "Ring of Swimming": "Yüzme Yüzüğü",
        "Ring of Telekinesis": "Telekinezi Yüzüğü",
        "Ring of Three Wishes": "Üç Dilek Yüzüğü",
        "Ring of Water Walking": "Su Üstünde Yürüme Yüzüğü",
        "Ring of X-ray Vision": "Röntgen Görüşü Yüzüğü",
        "Robe of Eyes": "Gözler Bornozu",
        "Robe of Scintillating Colors": "Işıldayan Renkler Bornozu",
        "Robe of Stars": "Yıldızlar Bornozu",
        "Robe of Useful Items": "Faydalı Eşyalar Bornozu",
        "Robe of the Archmagi": "Başbüyücü Bornozu",
        "Rod of Absorption": "Emme Asası",
        "Rod of Alertness": "Teyakkuz Asası",
        "Rod of Lordly Might": "Soylu Güç Asası",
        "Rod of Rulership": "Hükümdarlık Asası",
        "Rod of Security": "Güvenlik Asası",
        "Rope of Climbing": "Tırmanma Halatı",
        "Rope of Entanglement": "Dolanma Halatı",
        "Scarab of Protection": "Koruma Skarabı",
        "Sovereign Glue": "Egemen Tutkal",
        "Spellguard Shield": "Büyü Korumalı Kalkan",
        "Sphere of Annihilation": "Yok Oluş Küresi",
        "Staff of Charming": "Cazibe Asası",
        "Staff of Fire": "Ateş Asası",
        "Staff of Frost": "Don Asası",
        "Staff of Healing": "İyileştirme Asası",
        "Staff of Power": "Güç Asası",
        "Staff of Striking": "Darbe Asası",
        "Staff of Thunder and Lightning": "Gök Gürültüsü ve Yıldırım Asası",
        "Staff of the Magi": "Magi Asası",
        "Staff of the Woodlands": "Ormanlık Alan Asası",
        "Stone of Good Luck (Luckstone)": "İyi Şans Taşı",
        "Sun Blade": "Güneş Kılıcı",
        "Sword of Answering": "Cevap Verme Kılıcı",
        "Sword of Life Stealing": "Yaşam Çalan Kılıç",
        "Sword of Sharpness": "Keskinlik Kılıcı",
        "Sword of Wounding": "Yaralama Kılıcı",
        "Talisman of Pure Good": "Saf İyilik Tılsımı",
        "Talisman of Ultimate Evil": "Nihai Kötülük Tılsımı",
        "Talisman of the Sphere": "Küre Tılsımı",
        "Tome of Clear Thought": "Berrak Düşünce Kitabı",
        "Tome of Leadership and Influence": "Liderlik ve Etki Kitabı",
        "Tome of Understanding": "Anlayış Kitabı",
        "Trident of Fish Command": "Balık Hükmetme Üçlü Mızrağı",
        "Universal Solvent": "Evrensel Çözücü",
        "Vicious Weapon": "Gaddar Silah",
        "Vorpal Sword": "Vorpal Kılıç"
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

fs.writeFileSync('backend/data/items_batch_4.json', JSON.stringify(batch4Processed, null, 2));
console.log('Batch 4 (100 Magic Items) processed and saved to items_batch_4.json');
