// fix_encoding.js — classes.json subclass verilerini UTF-8 ile yeniden yazar
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'classes.json');
let classes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const subclassData = {
    'Barbarian': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Path of the Totem Warrior',
                description_tr: 'Hayvan ruhlarını (Totem) kanalize ederek vahşi doğanın gücünü kazanan savaşçılar.',
                features: [
                    { level: 3, name: 'Spirit Seeker', desc_tr: 'Beast Sense ve Speak with Animals büyülerini ritüel olarak atabilirsin.' },
                    { level: 3, name: 'Totem Spirit', desc_tr: 'Örneğin Bear Totem seçtiğinde öfkeliyken her türlü hasara (psişik hariç) direnç kazanırsın.' }
                ]
            },
            {
                name: 'Path of the Berserker',
                description_tr: 'Öfkelerini vahşete dönüştüren, savaş stresini göz ardı edebilen gözü dönmüş savaşçılar.',
                features: [
                    { level: 3, name: 'Frenzy', desc_tr: 'Rage halindeyken bonus action ile ekstra 1 yakın dövüş saldırısı yapabilirsin, ancak öfken bitince 1 seviye bitkinlik (Exhaustion) alırsın.' }
                ]
            }
        ]
    },
    'Bard': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'College of Lore',
                description_tr: 'Bilgiye ve büyüye aç olan bu Ozanlar, diğer sınıfların büyülerine bile erişim sağlar.',
                features: [
                    { level: 3, name: 'Cutting Words', desc_tr: 'Bardic Inspiration zarını düşmanların saldırı zarlarından veya yeteneklerinden düşmek için kullanabilirsin.' },
                    { level: 3, name: 'Bonus Proficiencies', desc_tr: 'İstediğin 3 ekstra yetenekte (skill) uzmanlık kazanırsın.' }
                ]
            },
            {
                name: 'College of Valor',
                description_tr: 'Hem kılıç hem de büyü kullanan, savaş alanında şiirlerle destek veren savaşçı Ozanlar.',
                features: [
                    { level: 3, name: 'Combat Inspiration', desc_tr: 'Dostların Bardic Inspiration zarını doğrudan verdikleri hasara veya kendi Savunma Sınıflarına (AC) ekleyebilir.' },
                    { level: 3, name: 'Bonus Proficiencies', desc_tr: 'Orta boy zırhlara, kalkanlara ve daha büyük silahlara hakimiyet kazanırsın.' }
                ]
            }
        ]
    },
    'Cleric': {
        subclass_unlock_level: 1,
        subclasses: [
            {
                name: 'Life Domain',
                description_tr: 'İyileştirme gücünün en yüksek olduğu, sadece defansa ve yaşama odaklanan ilahi yol.',
                features: [
                    { level: 1, name: 'Bonus Proficiency', desc_tr: 'Ağır (Heavy) Zırhlarda uzmanlık kazanırsın.' },
                    { level: 1, name: 'Disciple of Life', desc_tr: 'Bir iyileştirme büyüsü yaptığında, iyileşen can; 2 artı büyü seviyesi kadar fazladan artar.' }
                ]
            },
            {
                name: 'War Domain',
                description_tr: 'Savaş tanrılarına inanan, kılıç sallayarak ilahi emirleri yerine getiren savaşçı rahipler.',
                features: [
                    { level: 1, name: 'Bonus Proficiency', desc_tr: 'Ağır (Heavy) Zırhlarda ve Martial silahlarda uzmanlık kazanırsın.' },
                    { level: 1, name: 'War Priest', desc_tr: 'Saldırı yaptıktan sonra bonus action kullanarak fazladan 1 silah saldırısı yapabilirsin.' }
                ]
            },
            {
                name: 'Light Domain',
                description_tr: 'Işığa, güneşe ve ateşe tapan, düşmanları dev alev toplarıyla küle çeviren büyü odaklı ruhbanlar.',
                features: [
                    { level: 1, name: 'Bonus Cantrip', desc_tr: 'Light (Işık) büyüsünü bilirsin.' },
                    { level: 1, name: 'Warding Flare', desc_tr: 'Sana vuran bir düşmanın gözünü ışık parlamasıyla kamaştırıp o zarı dezavantajlı (disadvantage) hale getirebilirsin.' }
                ]
            }
        ]
    },
    'Druid': {
        subclass_unlock_level: 2,
        subclasses: [
            {
                name: 'Circle of the Moon',
                description_tr: 'Vahşi hayvanlara dönüşmeyi (Wild Shape) mükemmelleştirmiş form değiştiriciler.',
                features: [
                    { level: 2, name: 'Combat Wild Shape', desc_tr: 'Hayvan formuna girmek Action yerine Bonus Action sayılır. Ayrıca formdayken can yenileyebilirsin.' },
                    { level: 2, name: 'Circle Forms', desc_tr: 'Dönüştüğün hayvanların güç limiti (Challenge Rating) büyük ölçüde artar.' }
                ]
            },
            {
                name: 'Circle of the Land',
                description_tr: 'Doğanın sihirli köklerine inerek güçlü doğa ve element büyüleri kullanan usta büyücüler.',
                features: [
                    { level: 2, name: 'Bonus Cantrip', desc_tr: 'Fazladan 1 druid cantripi öğrenirsin.' },
                    { level: 2, name: 'Natural Recovery', desc_tr: 'Kısa dinlenmeler sırasında büyü slotlarının bir kısmını yenileyebilirsin.' }
                ]
            }
        ]
    },
    'Fighter': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Champion',
                description_tr: 'Ham fiziksel güce, sert antrenmanlara ve saf mekanik vuruşlara dayanan dövüş ustaları.',
                features: [
                    { level: 3, name: 'Improved Critical', desc_tr: 'Silah saldırıları 19 ve 20 zarında kritik hasar vurur.' }
                ]
            },
            {
                name: 'Battle Master',
                description_tr: 'Savaş alanını kontrol eden, rakiplerini zekası ve teknik taktikleriyle (Maneuver) dize getiren komutanlar.',
                features: [
                    { level: 3, name: 'Combat Superiority', desc_tr: 'Düşmanı silahsızlandırma, itme vb. manevralar için 4 adet üstünlük puanı ve 3 manevra öğrenirsin.' }
                ]
            },
            {
                name: 'Eldritch Knight',
                description_tr: 'Hem zırh ve silah kullanan hem de savaş büyüleri sallayan elit şövalyeler.',
                features: [
                    { level: 3, name: 'Spellcasting', desc_tr: 'Wizard listesinden Abjuration ve Evocation büyüleri öğrenirsin.' },
                    { level: 3, name: 'Weapon Bond', desc_tr: 'Silahını kendine mühürlersin; düşüremezsin ve istediğin anda geri çağırabilirsin.' }
                ]
            }
        ]
    },
    'Monk': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Way of the Open Hand',
                description_tr: 'Silahsız dövüşün, çıplak ellerle kemik kırmanın ve bedensel enerjinin zirvesi.',
                features: [
                    { level: 3, name: 'Open Hand Technique', desc_tr: 'Flurry of Blows yaptığında rakibe fırlatma veya yere serme (prone) gibi etkiler dayatabilirsin.' }
                ]
            },
            {
                name: 'Way of Shadow',
                description_tr: 'Karanlıkları keşif ve suikast için kullanan gölge ustaları.',
                features: [
                    { level: 3, name: 'Shadow Arts', desc_tr: 'Ki enerjisiyle karanlık ve sessizlik sihirleri kullanabilirsin.' }
                ]
            }
        ]
    },
    'Paladin': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Oath of Devotion',
                description_tr: 'Klasik Beyaz Şövalye yeminidir. Korumacı yapıda mükemmeldir.',
                features: [
                    { level: 3, name: 'Sacred Weapon', desc_tr: 'Silahını kutsal enerjiyle güçlendirerek saldırı zarlarına Karizma bonusunu eklersin.' },
                    { level: 3, name: 'Turn the Unholy', desc_tr: 'Sihirli ilahilerle iblislerin ve ölülerin canlıların senden kaçmasını sağlarsın.' }
                ]
            },
            {
                name: 'Oath of Vengeance',
                description_tr: 'Büyük kötülükleri cezalandırmaya and içmiş, savaş alanında acımasız olan şövalyeler.',
                features: [
                    { level: 3, name: 'Vow of Enmity', desc_tr: 'Bir hedefe düşmanlık yemini ederek 1 dakika boyunca avantajlı saldıran.' },
                    { level: 3, name: 'Abjure Enemy', desc_tr: 'Korku salarak düşmanın tüm hareket hızını sıfırlarsın veya büyük oranda kilitlersin.' }
                ]
            }
        ]
    },
    'Ranger': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Hunter',
                description_tr: 'Sürülere veya devasa canavarlara karşı en ölümcül avcılık tekniklerini kullanan korucular.',
                features: [
                    { level: 3, name: "Hunter's Prey", desc_tr: 'Devlere hasar veren veya kalabalıklara salvo yapan tekniklerden birini seçersin.' }
                ]
            },
            {
                name: 'Beast Master',
                description_tr: 'Vahşi hayvanlarla bağ kurup onlarla birlikte avlanan orman ustaları.',
                features: [
                    { level: 3, name: "Ranger's Companion", desc_tr: 'Sadık bir vahşi hayvan dost evcilleştirirsin; o senin komutlarınla hareket eder.' }
                ]
            }
        ]
    },
    'Rogue': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Thief',
                description_tr: 'Zindanların ve çatıların ustası, elit hırsızlar.',
                features: [
                    { level: 3, name: 'Fast Hands', desc_tr: 'Bonus Action kullanarak kilit kır, tuzak sök veya eşya kullan.' },
                    { level: 3, name: 'Second-Story Work', desc_tr: 'Duvarlara ve dik yerlere normal hızında tırmanabilirsin.' }
                ]
            },
            {
                name: 'Assassin',
                description_tr: 'Tek vuruşta kesin infaz yeteneğine sahip kiralık katiller.',
                features: [
                    { level: 3, name: 'Assassinate', desc_tr: 'Henüz saldırmamış düşmanlara avantajlı vur; sürpriz saldırılarda otomatik kritik at.' }
                ]
            },
            {
                name: 'Arcane Trickster',
                description_tr: 'Yanılsama büyüleriyle akıl çelen sihirbaz hırsızlar.',
                features: [
                    { level: 3, name: 'Spellcasting', desc_tr: 'Illusion ve Enchantment büyüleri öğrenirsin.' },
                    { level: 3, name: 'Mage Hand Legerdemain', desc_tr: 'Görünmez el büyüsüyle uzaktan kilit sök ve cep hırsızlığı yap.' }
                ]
            }
        ]
    },
    'Sorcerer': {
        subclass_unlock_level: 1,
        subclasses: [
            {
                name: 'Draconic Bloodline',
                description_tr: 'Soyunda ejderha kanı taşıyan, doğal element büyücüleri.',
                features: [
                    { level: 1, name: 'Dragon Ancestor', desc_tr: 'Ateş, Buz vb. elementini seç; o temada güçlen ve Ejderha dilini anlarsın.' },
                    { level: 1, name: 'Draconic Resilience', desc_tr: 'Zırhsız savunman gelişir; ekstra can alırsın.' }
                ]
            },
            {
                name: 'Wild Magic',
                description_tr: 'Saf kaos enerjisi taşıyan, tahmin edilemez sihirbazlar.',
                features: [
                    { level: 1, name: 'Wild Magic Surge', desc_tr: 'Büyü atarken kontrolü kaybedip rastgele beklenmedik bir etki yaratabilirsin.' },
                    { level: 1, name: 'Tides of Chaos', desc_tr: 'Şansını manipüle ederek bir zar testine önceden avantaj (Advantage) kazandır.' }
                ]
            }
        ]
    },
    'Warlock': {
        subclass_unlock_level: 1,
        subclasses: [
            {
                name: 'The Fiend',
                description_tr: 'Anlaşmasını şeytanlarla yapan ateşli ve yıkımcı tarikatçılar.',
                features: [
                    { level: 1, name: 'Expanded Spell List', desc_tr: 'Ateş ve yıkım odaklı büyülere erişim kazanırsın.' },
                    { level: 1, name: "Dark One's Blessing", desc_tr: 'Bir düşmanı öldürünce ekstra geçici can (Temp HP) kazanırsın.' }
                ]
            },
            {
                name: 'The Great Old One',
                description_tr: 'Uzayötesi varlıklarla (Cthulhu türevi) antlaşma yapan psişik büyücüler.',
                features: [
                    { level: 1, name: 'Expanded Spell List', desc_tr: 'Zihin kontrolü ve psişik büyülere erişim kazanırsın.' },
                    { level: 1, name: 'Awakened Mind', desc_tr: 'Etrafındakilerle dil engelini aşarak telepatik konuşabilirsin.' }
                ]
            }
        ]
    },
    'Wizard': {
        subclass_unlock_level: 2,
        subclasses: [
            {
                name: 'School of Evocation',
                description_tr: 'Alan vurucu element büyülerini mükemmelleştiren yıkım ustaları.',
                features: [
                    { level: 2, name: 'Evocation Savant', desc_tr: 'Yıkım büyüsü öğrenmek daha ucuz ve hızlıdır.' },
                    { level: 2, name: 'Sculpt Spells', desc_tr: 'Alan büyüleri atarken içindeki dostlarının hasar almasını engelleyebilirsin.' }
                ]
            },
            {
                name: 'School of Abjuration',
                description_tr: 'Kendini ve ekibini koruyan koruma büyüsü ustaları.',
                features: [
                    { level: 2, name: 'Abjuration Savant', desc_tr: 'Koruma büyüsü öğrenmek daha ucuz ve hızlıdır.' },
                    { level: 2, name: 'Arcane Ward', desc_tr: 'Koruma büyüsü okurken seni koruyan dev bir sihirli kalkan oluşur.' }
                ]
            }
        ]
    }
};

classes = classes.map(c => {
    if (subclassData[c.name]) {
        return { ...c, ...subclassData[c.name] };
    }
    return c;
});

// UTF-8 BOM olmadan kaydet
fs.writeFileSync(filePath, JSON.stringify(classes, null, 4), { encoding: 'utf8' });
console.log('classes.json UTF-8 olarak başarıyla yeniden yazıldı!');
