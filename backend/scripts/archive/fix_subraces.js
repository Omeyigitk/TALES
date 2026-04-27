// fix_subraces.js — Elf ve Genasi subrace verilerini düzelt
const mongoose = require('mongoose');
const Race = require('./models/Race');

mongoose.connect('mongodb://localhost:27017/dnd_app').then(async () => {
    // ─── ELF: Elf race'e High Elf, Wood Elf, Drow subrace'lerini ekle ──────────
    const elfRace = await Race.findOne({ name: 'Elf' });
    if (elfRace) {
        elfRace.subraces = [
            {
                name: 'High Elf',
                description_tr: 'Büyü sanatına düşkün, zeki ve kültürlü elvler. Sivri kulakları ve altın ya da gümüş rengi saçlarıyla bilinir.',
                ability_bonus: { INT: 1 },
                traits: [
                    { name: 'Cantrip', desc_tr: 'Wizard büyü listesinden bir cantrip seçersin. Zekân, büyücülük yeteneğin olarak kullanılır.' },
                    { name: 'Elf Weapon Training', desc_tr: 'Longsword, shortsword, shortbow ve longbow konusunda yeterlilik kazanırsın.' },
                    { name: 'Extra Language', desc_tr: 'Kendi tercihinle bir dil öğrenirsin.' }
                ]
            },
            {
                name: 'Wood Elf',
                description_tr: 'Ormanları yuvası kabul eden, çevik ve sezgisel elvler. Doğayla derin bağları sayesinde yıkılmaz hız ve gizlilik kazanır.',
                ability_bonus: { WIS: 1 },
                traits: [
                    { name: 'Elf Weapon Training', desc_tr: 'Longsword, shortsword, shortbow ve longbow konusunda yeterlilik kazanırsın.' },
                    { name: 'Fleet of Foot', desc_tr: 'Temel hareket hızın 35 ft\'e çıkar.' },
                    { name: 'Mask of the Wild', desc_tr: 'Hafif şiddetli hava koşullarında (yağmur, kar, sisli şafak vb.) ya da yoğun bitkiler arasında gizlenebilirsin.' }
                ]
            },
            {
                name: 'Drow (Dark Elf)',
                description_tr: 'Yeraltı dünyası Underdark\'ta yaşayan, karanlığa alışmış elf alt ırkı. Genellikle kötü tanınsa da yüzey dünyasında yaşayan iyi kalpli drowlar da vardır.',
                ability_bonus: { CHA: 1 },
                traits: [
                    { name: 'Superior Darkvision', desc_tr: 'Karanlık görüşün 120 ft\'e kadar uzanır.' },
                    { name: 'Sunlight Sensitivity', desc_tr: 'Güneş ışığında saldırı atışlarında ve görüşe dayalı Perception kontrollerinde dezavantajın olur.' },
                    { name: 'Drow Magic', desc_tr: 'Dancing Lights cantrip\'ini bilirsin. 3. seviyede Faerie Fire, 5. seviyede Darkness büyüsünü 1/uzun dinlenme kullanabilirsin (CHA spellcasting ability).' },
                    { name: 'Drow Weapon Training', desc_tr: 'Rapier, shortsword ve hand crossbow konusunda yeterlilik kazanırsın.' }
                ]
            }
        ];
        await elfRace.save();
        console.log('✅ Elf subraces güncellendi:', elfRace.subraces.map(s => s.name));
    } else {
        console.log('❌ Elf bulunamadı');
    }

    // ─── GENASI: Yeni bir Genasi üst ırkı oluştur ────────────────────────────────
    // Önce mevcut Genasi var mı kontrol et
    let genasiRace = await Race.findOne({ name: 'Genasi' });
    if (!genasiRace) {
        // Air/Fire/Earth/Water Genasi'lerden birini şablon al
        const airGenasi = await Race.findOne({ name: 'Air Genasi' });
        genasiRace = new Race({
            name: 'Genasi',
            description_tr: 'Geasi\'ler, primordial elementlerin gücünü kan yoluyla miras almış yaratıklardır. Dört temel element — hava, ateş, toprak ve su — bu subraceların her birini şekillendirir.',
            ability_bonus: { CON: 2 },
            speed: airGenasi?.speed || 30,
            size: 'Medium',
            languages: ['Common', 'Primordial'],
            traits: [
                { name: 'Elemental Heritage', desc_tr: 'Genasi olman, seçtiğin elemente bağlı ekstra yetenekler kazanmanı sağlar.' }
            ],
            subraces: [
                {
                    name: 'Air Genasi',
                    description_tr: 'Havayı soluklayanlar. Hafif ve çevik olan Air Genasi\'ler doğuştan saçları ve gözleri rüzgarla dans eder, nefesi sonsuz gibi görünür.',
                    ability_bonus: { DEX: 1 },
                    traits: [
                        { name: 'Unending Breath', desc_tr: 'Nefes almaya gerek duymadan nefesini sonsuza kadar tutabilirsin (bilinçsiz kalırsan bu özellik sona erer).' },
                        { name: 'Mingle with the Wind', desc_tr: '3. seviyede Levitate büyüsünü 1/uzun dinlenme kullanabilirsin (CON spellcasting ability).' }
                    ]
                },
                {
                    name: 'Earth Genasi',
                    description_tr: 'Toprağın çocukları. Kaya gibi sağlam ve sabırlı olan Earth Genasi\'lerin derileri kum veya taş rengi olur, bazılarının kristal parçaları çıkar.',
                    ability_bonus: { STR: 1 },
                    traits: [
                        { name: 'Earth Walk', desc_tr: 'Engebeli arazi (toprak veya taş bazlı) hareketi seni yavaşlatmaz.' },
                        { name: 'Merge with Stone', desc_tr: '3. seviyede Pass without Trace büyüsünü 1/uzun dinlenme kullanabilirsin (CON spellcasting ability).' }
                    ]
                },
                {
                    name: 'Fire Genasi',
                    description_tr: 'Alevlerin döl ü. Fire Genasi\'lerin saçları alev gibi dans eder, gözleri turuncu ya da kırmızı parlar, derileri kül grisi ya da kömür tonu olabilir.',
                    ability_bonus: { INT: 1 },
                    traits: [
                        { name: 'Darkvision', desc_tr: '60 ft karanlık görüş (karanlığı loş ışık gibi görmek).' },
                        { name: 'Fire Resistance', desc_tr: 'Ateş hasarına dirençlisin.' },
                        { name: 'Reach to the Blaze', desc_tr: 'Produce Flame cantrip\'ini bilirsin. 3. seviyede Burning Hands büyüsünü 1/uzun dinlenme kullanabilirsin (CON spellcasting ability).' }
                    ]
                },
                {
                    name: 'Water Genasi',
                    description_tr: 'Suyun kanı akanlarda. Genellikle mavi ya da yeşil saçlı, bazen pullu derileri olabilen Water Genasi\'ler denizlere yakın hisseder.',
                    ability_bonus: { WIS: 1 },
                    traits: [
                        { name: 'Acid Resistance', desc_tr: 'Asit hasarına dirençlisin.' },
                        { name: 'Amphibious', desc_tr: 'Hem hava hem de su içinde nefes alabilirsin.' },
                        { name: 'Swim Speed', desc_tr: 'Yüzme hızın 30 ft\'tir.' },
                        { name: 'Call to the Wave', desc_tr: 'Shape Water cantrip\'ini bilirsin. 3. seviyede Create or Destroy Water büyüsünü 1/uzun dinlenme kullanabilirsin (CON spellcasting ability).' }
                    ]
                }
            ]
        });
        await genasiRace.save();
        console.log('✅ Genasi race oluşturuldu:', genasiRace._id);
    } else {
        // Mevcut Genasi'yi güncelle
        genasiRace.subraces = [
            {
                name: 'Air Genasi',
                description_tr: 'Havayı soluklayanlar. Hafif ve çevik, saçları rüzgarla dans eden, nefesi sonsuz gibi görünen elementeller.',
                ability_bonus: { DEX: 1 },
                traits: [
                    { name: 'Unending Breath', desc_tr: 'Nefes almaya gerek duymadan nefesini süresiz tutabilirsin.' },
                    { name: 'Mingle with the Wind', desc_tr: '3. seviyede Levitate büyüsünü 1/uzun dinlenme kullanabilirsin.' }
                ]
            },
            {
                name: 'Earth Genasi',
                description_tr: 'Toprağın çocukları. Kaya gibi sağlam, sabırlı; derileri kum veya taş rengi olan elementeller.',
                ability_bonus: { STR: 1 },
                traits: [
                    { name: 'Earth Walk', desc_tr: 'Toprak/taş bazlı engebeli arazi hareketi seni yavaşlatmaz.' },
                    { name: 'Merge with Stone', desc_tr: '3. seviyede Pass without Trace büyüsünü 1/uzun dinlenme kullanabilirsin.' }
                ]
            },
            {
                name: 'Fire Genasi',
                description_tr: 'Alevlerin dölü. Alev gibi dans eden saçlar, turuncu/kırmızı gözler, kül grisi ya da kömür tonlu deri.',
                ability_bonus: { INT: 1 },
                traits: [
                    { name: 'Darkvision', desc_tr: '60 ft karanlık görüş.' },
                    { name: 'Fire Resistance', desc_tr: 'Ateş hasarına dirençlisin.' },
                    { name: 'Reach to the Blaze', desc_tr: 'Produce Flame cantrip\'ini bilirsin. 3. seviyede Burning Hands 1/uzun dinlenme.' }
                ]
            },
            {
                name: 'Water Genasi',
                description_tr: 'Suyun kanı akanlar. Mavi ya da yeşil saçlı, bazen pullu derileri olan, denizlerle derin bağı bulunan elementeller.',
                ability_bonus: { WIS: 1 },
                traits: [
                    { name: 'Acid Resistance', desc_tr: 'Asit hasarına dirençlisin.' },
                    { name: 'Amphibious', desc_tr: 'Hem hava hem su içinde nefes alabilirsin.' },
                    { name: 'Swim Speed', desc_tr: 'Yüzme hızın 30 ft.' },
                    { name: 'Call to the Wave', desc_tr: 'Shape Water cantrip\'ini bilirsin. 3. seviyede Create or Destroy Water 1/uzun dinlenme.' }
                ]
            }
        ];
        await genasiRace.save();
        console.log('✅ Genasi subraces güncellendi');
    }

    console.log('Tüm işlemler tamamlandı.');
    mongoose.disconnect();
});
