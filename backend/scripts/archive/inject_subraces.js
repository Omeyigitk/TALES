// inject_subraces.js — D&D 5e subrace verisini MongoDB'e enjekte eder
const mongoose = require('mongoose');
const Race = require('./models/Race');

mongoose.connect('mongodb://localhost:27017/dnd_app').then(async () => {
    console.log('MongoDB baglandi');

    const SUBRACES = {
        'Elf': [
            {
                name: 'High Elf',
                description_tr: 'Büyünün ezeli varisi. Yüksek Elfler, antik sihir geleneklerine bağlı, analitik ve kibirli bir yapıya sahiptir.',
                ability_bonuses: [{ ability: 'INT', bonus: 1 }],
                traits: [
                    { name: 'Cantrip', desc_tr: 'Büyücü büyü listesinden 1 adet Cantrip öğrenirsin — INT kullanılarak atılır.' },
                    { name: 'Extra Language', desc_tr: '1 adet ekstra dil bilirsin.' },
                    { name: 'Elf Weapon Training', desc_tr: 'Uzun kılıç, kısa kılıç, uzun yay ve kısa yay ile yeterlilik.' },
                ]
            },
            {
                name: 'Wood Elf',
                description_tr: 'Ormanların sakin koruyucusu. Ahşap Elfler doğayla uyum içinde yaşar, sinsi ve hızlıdır.',
                ability_bonuses: [{ ability: 'WIS', bonus: 1 }],
                traits: [
                    { name: 'Fleet of Foot', desc_tr: 'Hareket hızın 35 feet olur.' },
                    { name: 'Mask of the Wild', desc_tr: 'Hafif doğal örtüler (yaprak, yağmur, kar, sis) içinde gizlenebilirsin.' },
                    { name: 'Elf Weapon Training', desc_tr: 'Uzun kılıç, kısa kılıç, uzun yay ve kısa yay ile yeterlilik.' },
                ]
            },
            {
                name: 'Dark Elf (Drow)',
                description_tr: 'Yeraltının karanlık soygunu. Örümcek tanrıçası Lolth\'un lanetli çocukları — büyücü ya da savaşçı olarak eşsiz yetilere sahip.',
                ability_bonuses: [{ ability: 'CHA', bonus: 1 }],
                traits: [
                    { name: 'Superior Darkvision', desc_tr: '120 feet karanlıkta görme (normal drow 120 ft).' },
                    { name: 'Sunlight Sensitivity', desc_tr: 'Güneş ışığında saldırı ve algı (görme) kontrollerinde dezavantaj.' },
                    { name: 'Drow Magic', desc_tr: 'Dancing Lights Cantrip bilirsin. Sv.3\'te Faerie Fire, Sv.5\'te Darkness (her uzun dinlenmede 1 kullanım).' },
                    { name: 'Drow Weapon Training', desc_tr: 'Rapiyer, kısa kılıç ve el arbaleti ile yeterlilik.' },
                ]
            },
        ],
        'Dwarf': [
            {
                name: 'Hill Dwarf',
                description_tr: 'Bilge ve dayanıklı. Tepe Cüceleri, yüzyıllarca nehir vadilerinde ve tepelerde yaşamış, bilgeliği ve dayanıklılığı ile ünlüdür.',
                ability_bonuses: [{ ability: 'WIS', bonus: 1 }],
                traits: [
                    { name: 'Dwarven Toughness', desc_tr: 'Maksimum HP +1 ve her seviye atlamada +1 HP kazanırsın.' },
                ]
            },
            {
                name: 'Mountain Dwarf',
                description_tr: 'Zırhın ustası. Dağ Cüceleri, kaya gibi serttir ve zırh kullanımında doğal bir yetenek taşır.',
                ability_bonuses: [{ ability: 'STR', bonus: 2 }],
                traits: [
                    { name: 'Dwarven Armor Training', desc_tr: 'Hafif ve orta zırh yetenekleri.' },
                ]
            },
        ],
        'Halfling': [
            {
                name: 'Lightfoot',
                description_tr: 'Sessiz ve kaçamak. Lightfoot Halflingler, büyüklerden gizlenebilen, sosyal ve şanslı küçük yaratıklardır.',
                ability_bonuses: [{ ability: 'CHA', bonus: 1 }],
                traits: [
                    { name: 'Naturally Stealthy', desc_tr: 'Senden daha büyük bir yaratığın arkasına saklanabilirsin.' },
                ]
            },
            {
                name: 'Stout',
                description_tr: 'Cüce kanı taşıyan Halfling. Dayanıklı, inatçı ve zehre direnç sahibi devasa mideli yaratıklar.',
                ability_bonuses: [{ ability: 'CON', bonus: 1 }],
                traits: [
                    { name: 'Stout Resilience', desc_tr: 'Zehre karşı avantaj ve zehir hasarına direnç.' },
                ]
            },
        ],
        'Gnome': [
            {
                name: 'Forest Gnome',
                description_tr: 'Doğanın gizli dostu. Orman Cücelerinin doğayla sırlı dili ve küçük hayvanlarla konuşma yetisi vardır.',
                ability_bonuses: [{ ability: 'DEX', bonus: 1 }],
                traits: [
                    { name: 'Natural Illusionist', desc_tr: 'Minor Illusion Cantrip bilirsin (INT kullanılır).' },
                    { name: 'Speak with Small Beasts', desc_tr: 'Basit fikirler ve duygularla küçük ya da daha küçük hayvanlarla iletişim kurabilirsin.' },
                ]
            },
            {
                name: 'Rock Gnome',
                description_tr: 'Buluşçu ve mühendis. Kaya Cüceler, alet yapmayı seven, merakı doğasında olan mucitlerdir.',
                ability_bonuses: [{ ability: 'CON', bonus: 1 }],
                traits: [
                    { name: "Artificer's Lore", desc_tr: 'Büyülü eşya, alşimik obje ve teknolojik cihazlara ilişkin Tarih kontrollerinde yeterlilik bonusunun iki katını kullanırsın.' },
                    { name: 'Tinker', desc_tr: 'Araç setiyle son derece basit mekanik araçlar (saatin pıtırtısı, ateş kutusu, müzik kutusu) yapabilirsin.' },
                ]
            },
            {
                name: 'Deep Gnome (Svirfneblin)',
                description_tr: 'Yeraltının mutsuz mücevhercisi. Karanlıkta yaşayan, sinsi ve kuşkucu bir altyerkaltı ırkı.',
                ability_bonuses: [{ ability: 'DEX', bonus: 1 }],
                traits: [
                    { name: 'Stone Camouflage', desc_tr: 'Kayalık arazide gizlenme kontrollerine avantaj.' },
                    { name: 'Superior Darkvision', desc_tr: '120 feet karanlıkta görme.' },
                ]
            },
        ],
        'Human': [
            {
                name: 'Standard Human',
                description_tr: 'Her statüye +1 bonus. Sıradan ama çok yönlü — tüm statlar eşit gelişir.',
                ability_bonuses: [
                    { ability: 'STR', bonus: 1 }, { ability: 'DEX', bonus: 1 },
                    { ability: 'CON', bonus: 1 }, { ability: 'INT', bonus: 1 },
                    { ability: 'WIS', bonus: 1 }, { ability: 'CHA', bonus: 1 },
                ],
                traits: []
            },
            {
                name: 'Variant Human',
                description_tr: 'Daha az stat bonusu ama bir Feat kazanırsın. Özelleştirmek isteyenler için ideal.',
                ability_bonuses: [],
                traits: [
                    { name: 'Variable Stats', desc_tr: 'Herhangi 2 farklı stat\'a +1 bonus seç.' },
                    { name: 'Skills', desc_tr: 'Bir Skill Proficiency kazanırsın (DM ile belirle).' },
                    { name: 'Feat', desc_tr: 'Herhangi bir Feat seçersin — Alert, Lucky, War Caster vb.' },
                ]
            },
        ],
        'Dragonborn': [
            {
                name: 'Black (Acid)',
                description_tr: 'Asit nefesi ve karanlık bataklıklarla ilişkilendirilen ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '5×30 ft doğrusal asit nefesi: 2d6 hasar (Sv.1), DEX save DC 8+CON+Prof.' }]
            },
            {
                name: 'Blue (Lightning)',
                description_tr: 'Çöllerde ve fırtınalarda hükmeden mavi ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '5×30 ft doğrusal şimşek nefesi: 2d6 hasar (Sv.1), DEX save.' }]
            },
            {
                name: 'Brass (Fire)',
                description_tr: 'Sıcak çöllere ait, konuşkan ve meraklı pirinç ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '5×30 ft doğrusal ateş nefesi: 2d6 hasar (Sv.1), DEX save.' }]
            },
            {
                name: 'Bronze (Lightning)',
                description_tr: 'Deniz kıyılarını seven iyi huylu bronz ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '5×30 ft doğrusal şimşek nefesi, DEX save.' }]
            },
            {
                name: 'Copper (Acid)',
                description_tr: 'Dağlık arazilerde yaşayan, espri canlı bakır ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '5×30 ft doğrusal asit nefesi, DEX save.' }]
            },
            {
                name: 'Gold (Fire)',
                description_tr: 'En iyi huylu ve güçlü altın ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '15 ft koni ateş nefesi: 2d6 hasar, DEX save.' }]
            },
            {
                name: 'Green (Poison)',
                description_tr: 'Ormanlarda entrika kuran, zehirli yeşil ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '15 ft koni zehir nefesi: 2d6 hasar, CON save.' }]
            },
            {
                name: 'Red (Fire)',
                description_tr: 'En hırslı ve gaddar kırmızı ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '15 ft koni ateş nefesi: 2d6 hasar, DEX save.' }]
            },
            {
                name: 'Silver (Cold)',
                description_tr: 'İnsanlarla dostane yaşayan, soğuk ve asil gümüş ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '15 ft koni soğuk nefesi: 2d6 hasar, CON save.' }]
            },
            {
                name: 'White (Cold)',
                description_tr: 'Buzlu dağlarda yaşayan, içgüdüsel ve vahşi beyaz ejderha soyu.',
                ability_bonuses: [],
                traits: [{ name: 'Breath Weapon', desc_tr: '15 ft koni soğuk nefesi: 2d6 hasar, CON save.' }]
            },
        ],
        'Tiefling': [
            {
                name: 'Asmodeus Tiefling',
                description_tr: 'Şeytanlar şeytanın (Asmodeus) mirasını taşır. Standart Tiefling büyü listesi.',
                ability_bonuses: [],
                traits: [
                    { name: 'Infernal Legacy', desc_tr: 'Thaumaturgy cantrip; Sv.3\'te Hellish Rebuke; Sv.5\'te Darkness (CHA kullanılır).' },
                ]
            },
            {
                name: 'Bloodline of Zariel',
                description_tr: 'Savaşçı şeytanın kanı — savaş odaklı büyüler.',
                ability_bonuses: [{ ability: 'STR', bonus: 1 }],
                traits: [
                    { name: 'Infernal Legacy (Zariel)', desc_tr: 'Thaumaturgy cantrip; Sv.3\'te Searing Smite; Sv.5\'te Branding Smite.' },
                ]
            },
            {
                name: 'Bloodline of Glasya',
                description_tr: 'Aldatıcı şeytanın kanı — gizli ve manipülatif büyüler.',
                ability_bonuses: [{ ability: 'DEX', bonus: 1 }],
                traits: [
                    { name: 'Infernal Legacy (Glasya)', desc_tr: 'Minor Illusion cantrip; Sv.3\'te Disguise Self; Sv.5\'te Invisibility.' },
                ]
            },
            {
                name: 'Bloodline of Levistus',
                description_tr: 'Buzlu şeytanın kanı — soğuk ve hayatta kalma büyüleri.',
                ability_bonuses: [{ ability: 'CON', bonus: 1 }],
                traits: [
                    { name: 'Infernal Legacy (Levistus)', desc_tr: 'Ray of Frost cantrip; Sv.3\'te Armor of Agathys; Sv.5\'te Darkness.' },
                ]
            },
        ],
        'Half-Orc': [
            {
                name: 'Standard Half-Orc',
                description_tr: 'İnsan ve Ork kanı taşır. Savaşta güçlü, gözünü korkutmada üstün.',
                ability_bonuses: [],
                traits: [
                    { name: 'Relentless Endurance', desc_tr: 'HP 0\'a düştüğünde bayılmak yerine HP\'ni 1\'e set edebilirsin (uzun dinlenmede 1 kullanım).' },
                    { name: 'Savage Attacks', desc_tr: 'Hafif silahlarla kritik atış yaptığında, hasar zarını 1 ekstra atar ve toplama eklersin.' },
                ]
            },
        ],
        'Half-Elf': [
            {
                name: 'Standard Half-Elf',
                description_tr: 'İnsan ve Elf kanını harmanlayan çok yönlü melez.',
                ability_bonuses: [],
                traits: [
                    { name: 'Skill Versatility', desc_tr: 'Herhangi 2 skill\'de yeterlilik kazanırsın.' },
                    { name: 'Fey Ancestry', desc_tr: 'Büyülenmeye karşı avantaj; uyutma büyüsü çalışmaz.' },
                    { name: 'Darkvision', desc_tr: '60 feet karanlıkta görme.' },
                ]
            },
        ],
    };

    let updated = 0, skipped = 0;
    for (const [raceName, subraces] of Object.entries(SUBRACES)) {
        const race = await Race.findOne({ name: raceName });
        if (!race) { console.log(`BULUNAMADI: ${raceName}`); skipped++; continue; }
        race.subraces = subraces;
        await race.save();
        console.log(`✓ ${raceName}: ${subraces.length} subrace eklendi`);
        updated++;
    }

    console.log(`\nTamamlandi: ${updated} irk guncellendi, ${skipped} atlandı.`);
    mongoose.disconnect();
});
