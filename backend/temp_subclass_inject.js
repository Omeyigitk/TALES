const fs = require('fs');
const path = './data/classes.json';
let classes = JSON.parse(fs.readFileSync(path, 'utf8'));

const subclassData = {
    'Barbarian': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Path of the Totem Warrior',
                description_tr: 'Hayvan ruhlarýný (Totem) kanalize ederek vahþi doðanýn gücünü kazanan savaþçýlar.',
                features: [{ level: 3, name: 'Spirit Seeker', desc_tr: 'Beast Sense ve Speak with Animals büyülerini ritüel olarak atabilirsin.' }, { level: 3, name: 'Totem Spirit', desc_tr: 'Örn: Bear Totem seçtiðinde öfkeliyken her türlü hasara (psiþik hariç) direnç kazanýrsýn.' }]
            },
            {
                name: 'Path of the Berserker',
                description_tr: 'Öfkelerini vahþete dönüþtüren, savaþ stresini göz ardý edebilen gözü dönmüþ savaþçýlar.',
                features: [{ level: 3, name: 'Frenzy', desc_tr: 'Rage halindeyken bonus action ile ekstra 1 yakýn dövüþ saldýrýsý yapabilirsin ancak öfken bitince 1 seviye bitkinlik (Exhaustion) alýrsýn.' }]
            }
        ]
    },
    'Bard': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'College of Lore',
                description_tr: 'Bilgiye ve büyüye aç olan bu Ozanlar, diðer sýnýflarýn büyülerine bile eriþim saðlar.',
                features: [{ level: 3, name: 'Cutting Words', desc_tr: 'Bardic Inspiration zarýný düþmanlarýn saldýrý zarlarýndan veya yeteneklerinden düþmek için kullanabilirsin.' }, { level: 3, name: 'Bonus Proficiencies', desc_tr: 'Ýstediðin 3 ekstra yetenekte (skill) uzmanlýk kazanýrsýn.' }]
            },
            {
                name: 'College of Valor',
                description_tr: 'Hem kýlýç hem de büyü kullanan, savaþ alanýnda þiirlerle destek veren savaþçý Ozanlar.',
                features: [{ level: 3, name: 'Combat Inspiration', desc_tr: 'Dostlarýn Bardic Inspiration zarýný doðrudan verdikleri hasara veya kendi Savunma Sýnýflarýna (AC) ekleyebilir.' }, { level: 3, name: 'Bonus Proficiencies', desc_tr: 'Orta boy zýrhlara, kalkanlara ve daha büyük silahlara hakimiyet kazanýrsýn.' }]
            }
        ]
    },
    'Cleric': {
        subclass_unlock_level: 1,
        subclasses: [
            {
                name: 'Life Domain',
                description_tr: 'Ýyileþtirme gücünün en yüksek olduðu, sadece defansa ve yaþama odaklanan ilahi yol.',
                features: [{ level: 1, name: 'Bonus Proficiency', desc_tr: 'Aðýr (Heavy) Zýrhlarda uzmanlýk kazanýrsýn.' }, { level: 1, name: 'Disciple of Life', desc_tr: 'Bir iyileþtirme büyüsü yaptýðýnda, iyileþen can; 2 + büyü seviyesi kadar fazladan artar.' }]
            },
            {
                name: 'War Domain',
                description_tr: 'Savaþ tanrýlarýna inanan, kýlýç sallayarak ilahi emirleri yerine getiren savaþçý rahipler.',
                features: [{ level: 1, name: 'Bonus Proficiency', desc_tr: 'Aðýr (Heavy) Zýrhlarda ve Martial silahlarda uzmanlýk kazanýrsýn.' }, { level: 1, name: 'War Priest', desc_tr: 'Saldýrý yaptýktan sonra bonus action kullanarak fazladan 1 silah saldýrýsý yapabilirsin.' }]
            },
            {
                name: 'Light Domain',
                description_tr: 'Iþýða, güneþe ve ateþe tapan, düþmanlarý dev alev toplarýyla küle çeviren büyü odaklý ruhbanlar.',
                features: [{ level: 1, name: 'Bonus Cantrip', desc_tr: 'Light (Iþýk) büyüsünü bilirsin.' }, { level: 1, name: 'Warding Flare', desc_tr: 'Sana vuran bir düþmanýn gözünü ýþýk parlamasýyla kamaþtýrýp o zarý dezavantajlý (disadvantage) hale getirebilirsin.' }]
            }
        ]
    },
    'Druid': {
        subclass_unlock_level: 2,
        subclasses: [
            {
                name: 'Circle of the Moon',
                description_tr: 'Vahþi hayvanlara dönüþmeyi (Wild Shape) mükemmelleþtirmiþ form deðiþtiriciler.',
                features: [{ level: 2, name: 'Combat Wild Shape', desc_tr: 'Hayvan formuna girmek Action yerine Bonus Action sayýlýr. Ayrýca formdayken can yenileyebilirsin.' }, { level: 2, name: 'Circle Forms', desc_tr: 'Dönüþtüðün hayvanlarýn güç limiti (Challenge Rating) devasa bir þekilde artar.' }]
            },
            {
                name: 'Circle of the Land',
                description_tr: 'Doðanýn sihirli köklerine inerek güçlü doða ve element büyüleri kullanan usta büyücüler.',
                features: [{ level: 2, name: 'Bonus Cantrip', desc_tr: 'Fazladan 1 druid cantripi öðrenirsin.' }, { level: 2, name: 'Natural Recovery', desc_tr: 'Kýsa dinlenmeler sýrasýnda büyü slotlarýnýn bir kýsmýný yenileyebilirsin.' }]
            }
        ]
    },
    'Fighter': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Champion',
                description_tr: 'Ham fiziksel güce, sert antrenmanlara ve saf mekanik vuruþlara dayanan dövüþ ustalarý.',
                features: [{ level: 3, name: 'Improved Critical', desc_tr: 'Silah saldýrýlarý 19 ve 20 zarýnda kritik hasar vurur.' }]
            },
            {
                name: 'Battle Master',
                description_tr: 'Savaþ alanýný kontrol eden, rakiplerini zekasý ve teknik taktikleriyle (Maneuver) dize getiren komutanlar.',
                features: [{ level: 3, name: 'Combat Superiority', desc_tr: 'Düþmaný silahsýzlandýrma, itme vb. manevralar için 4 adet üstünlük puaný ve 3 manevra öðrenirsin.' }]
            },
            {
                name: 'Eldritch Knight',
                description_tr: 'Hem zýrh/silah kullanan hem de savaþ büyüleri sallayan elit þövalyeler.',
                features: [{ level: 3, name: 'Spellcasting', desc_tr: 'Wizard listesinden Abjuration/Evocation büyüleri öðrenirsin.' }, { level: 3, name: 'Weapon Bond', desc_tr: 'Silahýný kendine mühürlersin, düþüremezsin ve çaðýrabilirsin.' }]
            }
        ]
    },
    'Monk': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Way of the Open Hand',
                description_tr: 'Silahsýz dövüþün, çýplak ellerle kemik kýrmanýn zirvesi.',
                features: [{ level: 3, name: 'Open Hand Technique', desc_tr: 'Flurry of Blows yaptýðýnda rakibe fýrlatma, yere serme gibi etkiler dayatabilirsin.' }]
            },
            {
                name: 'Way of Shadow',
                description_tr: 'Karanlýklarý keþif ve suikast için kullanan gölge ustalarý.',
                features: [{ level: 3, name: 'Shadow Arts', desc_tr: 'Ki enerjisiyle karanlýk ve sessizlik sihirleri kullanabilirsin.' }]
            }
        ]
    },
    'Paladin': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Oath of Devotion',
                description_tr: 'Klasik Beyaz Þövalye yeminidir. Korumacý yapýda mükemmeldir.',
                features: [{ level: 3, name: 'Sacred Weapon', desc_tr: 'Silahýný kutsal enerjiyle güçlendirerek saldýrý zarlarýna Karizma bonusunu eklersin.' }, { level: 3, name: 'Turn the Unholy', desc_tr: 'Sihirli ilahilerle zombilerin ve iblislerin senden kaçmasýný saðlarsýn.' }]
            },
            {
                name: 'Oath of Vengeance',
                description_tr: 'Kötülükleri cezalandýrmaya and içmiþ acýmasýz savaþçýlar.',
                features: [{ level: 3, name: 'Vow of Enmity', desc_tr: 'Bir hedefe düþmanlýk yemini ederek 1 dakika Avantaj kazan.' }, { level: 3, name: 'Abjure Enemy', desc_tr: 'Korku salarak düþmanýn hýzýný sýfýrla.' }]
            }
        ]
    },
    'Ranger': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Hunter',
                description_tr: 'Sürülere veya devasa canavarlara karþý en ölümcül avcýlar.',
                features: [{ level: 3, name: 'Hunters Prey', desc_tr: 'Devlere hasar veren veya kalabalýklara kalkan vuran tekniklerden birini seçersin.' }]
            },
            {
                name: 'Beast Master',
                description_tr: 'Vahþi hayvanlarla bað kurup onlarla birlikte savaþan orman ustalarý.',
                features: [{ level: 3, name: 'Ranger Companion', desc_tr: 'Sadýk bir vahþi hayvan dost evcilleþtirirsin.' }]
            }
        ]
    },
    'Rogue': {
        subclass_unlock_level: 3,
        subclasses: [
            {
                name: 'Thief',
                description_tr: 'Zindanlarýn ve çatýlarýn ustasý, elit hýrsýzlar.',
                features: [{ level: 3, name: 'Fast Hands', desc_tr: 'Bonus Action u kilit kýrmak ve eþya kullanmak için harca.' }, { level: 3, name: 'Second-Story Work', desc_tr: 'Duvarlara ve dik yerlere yüksek hýzla týrman.' }]
            },
            {
                name: 'Assassin',
                description_tr: 'Kesin infaz yeteneði olan kiralýk katiller.',
                features: [{ level: 3, name: 'Assassinate', desc_tr: 'Hareket etmemiþ düþmanlara avantajlý vur, sürpriz saldýrýlarda otomatik kritik at.' }]
            },
            {
                name: 'Arcane Trickster',
                description_tr: 'Yanýlsama büyüleriyle akýl çelen sihirbaz hýrsýzlar.',
                features: [{ level: 3, name: 'Spellcasting', desc_tr: 'Illusion ve Enchantment büyüleri öðrenirsin.' }, { level: 3, name: 'Mage Hand Legerdemain', desc_tr: 'Görünmez el büyüsüyle kilit sök ve hýrsýzlýk yap.' }]
            }
        ]
    },
    'Sorcerer': {
        subclass_unlock_level: 1,
        subclasses: [
            {
                name: 'Draconic Bloodline',
                description_tr: 'Ejderha kaný taþýyan doðal element büyücüleri.',
                features: [{ level: 1, name: 'Dragon Ancestor', desc_tr: 'Ateþ, Buz vs elementini seç, o temada güçlen.' }, { level: 1, name: 'Draconic Resilience', desc_tr: 'Zýrhsýz savunman geliþir ve ekstra can alýrsýn.' }]
            },
            {
                name: 'Wild Magic',
                description_tr: 'Saf kaos enerjisi taþýyan tahmin edilemez sihirbazlar.',
                features: [{ level: 1, name: 'Wild Magic Surge', desc_tr: 'Büyü atarken kontrolü kaybedip rastgele etki yaratabilirsin.' }, { level: 1, name: 'Tides of Chaos', desc_tr: 'Zar testine kendi þansýnla avantaj kazandýr.' }]
            }
        ]
    },
    'Warlock': {
        subclass_unlock_level: 1,
        subclasses: [
            {
                name: 'The Fiend',
                description_tr: 'Anlaþmasýný þeytanlarla yapan ateþli tarikatçýlar.',
                features: [{ level: 1, name: 'Expanded Spells', desc_tr: 'Ateþ ve yýkým büyülerine eriþim kazanýrsýn.' }, { level: 1, name: 'Dark Ones Blessing', desc_tr: 'Birini öldürünce ekstra geçici can (Temp HP) kazanýrsýn.' }]
            },
            {
                name: 'The Great Old One',
                description_tr: 'Cthulhu varlýklarýyla antlaþma yapan psiþik büyücüler.',
                features: [{ level: 1, name: 'Expanded Spells', desc_tr: 'Zihin kontrolü büyülerine eriþim kazanýrsýn.' }, { level: 1, name: 'Awakened Mind', desc_tr: 'Etrafýndakilerle telepatik konuþabilirsin.' }]
            }
        ]
    },
    'Wizard': {
        subclass_unlock_level: 2,
        subclasses: [
            {
                name: 'School of Evocation',
                description_tr: 'Alan vurucu element büyülerini bükebilen yýkým ustalarý.',
                features: [{ level: 2, name: 'Evocation Savant', desc_tr: 'Yýkým büyüsü öðrenmek ucuzlar.' }, { level: 2, name: 'Sculpt Spells', desc_tr: 'Alan büyüleri atarken içindeki dostlarýnýn hasar almasýný engellersin.' }]
            },
            {
                name: 'School of Abjuration',
                description_tr: 'Kendini ve ekibini koruyan elit kalkan büyücüleri.',
                features: [{ level: 2, name: 'Abjuration Savant', desc_tr: 'Koruma büyüsü öðrenmek ucuzlar.' }, { level: 2, name: 'Arcane Ward', desc_tr: 'Koruma büyüsü okurken dev bir sihirli kalkan kazanýrsýn.' }]
            }
        ]
    }
};

classes = classes.map(c => {
    if (subclassData[c.name]) {
        return {
            ...c,
            ...subclassData[c.name]
        };
    }
    return c;
});

fs.writeFileSync(path, JSON.stringify(classes, null, 4));
console.log('classes.json subclass injection successful!');
