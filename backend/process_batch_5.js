const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('backend/wondrous_raw.json', 'utf8'));

// Batch 5: Items 200-300
const batch5Raw = rawData.slice(200, 300);

const batch5Processed = batch5Raw.map(item => {
    let name_tr = item.name;

    // Magic Item Name Translations (201-300)
    const translations = {
        "Wand of Binding": "Bağlama Asası",
        "Wand of Enemy Detection": "Düşman Tespit Asası",
        "Wand of Fear": "Korku Asası",
        "Wand of Fireballs": "Ateş Topu Asası",
        "Wand of Lightning Bolts": "Yıldırım Asası",
        "Wand of Magic Detection": "Büyü Tespit Asası",
        "Wand of Magic Missiles": "Büyülü Ok (Magic Missile) Asası",
        "Wand of Paralysis": "Felç Asası",
        "Wand of Polymorph": "Biçim Değiştirme Asası",
        "Wand of Secrets": "Sırlar Asası",
        "Wand of Smile": "Gülümseme Asası",
        "Wand of Web": "Ağ Asası",
        "Wand of Wonder": "Mucize Asası",
        "Wand of the War Mage": "Savaş Büyücüsü Asası",
        "Weapon of Warning": "Uyarı Silahı",
        "Well of Many Worlds": "Pek Çok Dünyanın Kuyusu",
        "Wind Fan": "Rüzgar Yelpazesi",
        "Winged Boots": "Kanatlı Çizmeler",
        "Wings of Flying": "Uçuş Kanatları",
        "Arcane Grimoire": "Gizemli Grimoire",
        "Bloodwell Vial": "Kan Kuyusu Şişesi",
        "Dragonhide Belt": "Ejderha Derisi Kemer",
        "Rhythm-Maker's Drum": "Ritim Yapıcı Davul",
        "Moon-Sickle": "Ay Orağı",
        "Nature's Mantle": "Doğa Pelerini",
        "Reveler's Concertina": "Eğlence Akordeonu",
        "All-Purpose Tool": "Çok Amaçlı Araç",
        "Amulet of the Devout": "Dindar Muskası",
        "Bell Branch": "Zil Dalı",
        "Barrier Tattoo": "Bariyer Dövmesi",
        "Blood Furrow Tattoo": "Kan Arkı Dövmesi",
        "Coiling Grasp Tattoo": "Sarmal Kavrayış Dövmesi",
        "Eldritch Claw Tattoo": "Eldritch Pençe Dövmesi",
        "Ghost Step Tattoo": "Hayalet Adımı Dövmesi",
        "Illuminator's Tattoo": "Aydınlatıcı Dövmesi",
        "Lifewell Tattoo": "Yaşam Kuyusu Dövmesi",
        "Masquerade Tattoo": "Maskeli Balo Dövmesi",
        "Shadowfell Brand Tattoo": "Shadowfell Markası Dövmesi",
        "Spellwrought Tattoo": "Büyü İşlemeli Dövme",
        "Absorbing Tattoo": "Emici Dövme",
        "Alchemical Compendium": "Simyasal Külliyat",
        "Astromancy Archive": "Astromansi Arşivi",
        "Atlas of Endless Horizons": "Sonsuz Ufuklar Atlası",
        "Duplicitous Manuscript": "Hileli El Yazması",
        "Fulminating Treatise": "Paralayıcı İnceleme",
        "Heart Weaver's Manifesto": "Kalp Dokuyan Manifestosu",
        "Libram of Souls and Flesh": "Ruhlar ve Et Kitabı",
        "Lyre of Building": "İnşa Liri",
        "Planecaller's Codex": "Düzlem Çağıranın Kodeksi",
        "Protective Verses": "Koruyucu Ayetler",
        "Crystalline Chronicle": "Kristal Günlük",
        "Bell-Branch": "Zil Dalı",
        "Astromancy-Archive": "Astromansi-Arşivi",
        "Alchemical-Compendium": "Simyasal-Külliyat",
        "Atlas-of-Endless-Horizons": "Sonsuz-Ufuklar-Atlası",
        "Duplicitous-Manuscript": "Hileli-El-Yazması",
        "Fulminating-Treatise": "Paralayıcı-İnceleme",
        "Heart-Weaver's-Manifesto": "Kalp-Dokuyan-Manifestosu",
        "Libram-of-Souls-and-Flesh": "Ruhlar-ve-Et-Kitabı",
        "Planecaller's-Codex": "Düzlem-Çağıran-Kodeksi",
        "Protective-Verses": "Koruyucu-Ayetler"
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

fs.writeFileSync('backend/data/items_batch_5.json', JSON.stringify(batch5Processed, null, 2));
console.log('Batch 5 processed.');
