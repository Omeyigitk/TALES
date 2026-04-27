const fs = require('fs');

const translatedSpells = {
    "Spirit of Death": {
        name: "Spirit of Death",
        level: "4th-level", level_int: 4, school: "necromancy", time: "1 action", range: "60 feet", components: "V, S, M", material_desc: "en az 400 GP değerinde yaldızlı bir ölüm meleği kartı", duration: "Concentration, up to 1 hour", ritual: false, concentration: true,
        classes: ["Sorcerer", "Warlock", "Wizard"],
        desc: "Ölümü temsil eden bir ruh çağırırsınız. Ruh, menzil içindeki boş bir alanda belirir (ölüm meleği özelliklerini taşır). Hit point'i 0 olduğunda veya büyü sona erdiğinde kaybolur.\nRuh size ve müttefiklerinize dosttur. Kendi turunu sizinkinden hemen sonra oynar. Sözlü emirlerinize uyar. Eğer emir vermezseniz Dodge (Kaçınma) eylemi alır ve tehlikeden kaçınır.",
        higher_level: "", subclasses: []
    },
    "Sapping Sting": {
        name: "Sapping Sting",
        level: "Cantrip", level_int: 0, school: "necromancy", time: "1 action", range: "30 feet", components: "V, S", material_desc: "", duration: "Instantaneous", ritual: false, concentration: false,
        classes: ["Wizard"],
        desc: "Menzildeki görebildiğiniz bir hedefin canlılığını somurursunuz. Hedef Constitution kurtarma zarı atmalıdır, başarısız olursa 1d4 nekrotik (necrotic) hasar alır ve Prone (Yere Serilme) durumuna düşer.",
        higher_level: "Hasar 5. seviyede 2d4, 11. seviyede 3d4, 17. seviyede 4d4 olur.", subclasses: []
    },
    "Tether Essence": {
        name: "Tether Essence",
        level: "7th-level", level_int: 7, school: "necromancy", time: "1 action", range: "60 feet", components: "V, S, M", material_desc: "en az 250 gp değerinde platin ip (tüketilir)", duration: "Concentration, up to 1 hour", ritual: false, concentration: true,
        classes: ["Wizard"],
        desc: "Menzil içerisindeki görebildiğiniz iki yaratık Constitution saving throw atar (birbirlerine 30 feet'ten yakınlarsa dezavantajlı). İki zar da başarısız olursa ruhsal olarak bağlanırlar. Biri hasar yediğinde diğeri de aynı hasarı yer. Biri şifa can yenilediğinde diğeri de aynı şekilde can yeniler. Canları 0'a ulaştığında büyü sona erer.",
        higher_level: "", subclasses: []
    },
    "Time Ravage": {
        name: "Time Ravage",
        level: "9th-level", level_int: 9, school: "necromancy", time: "1 action", range: "90 feet", components: "V, S, M", material_desc: "5.000 GP değerinde pırlanta tozu dolu kum saati (tüketilir)", duration: "Instantaneous", ritual: false, concentration: false,
        classes: ["Wizard"],
        desc: "Hedef canlının fiziksel formunu hızla yaşlandırarak zamanı bükeriniz. Hedef Constitution kurtarma zarında başarısız olursa 10d12 nekrotik hasar yer. Ayrıca hayatından sadece 30 gün yaşayabileceği kadar hızla yaşlanır. Bu yaşlılık halinde hız yarıya düşer, tüm zarlarda dezavantaj alır. Sadece Wish büyüsü veya 9. seviyeden atılan Greater Restoration ile yaşlılık durumu düzeltilebilir.",
        higher_level: "", subclasses: []
    },
    "Death Armor": {
        name: "Death Armor",
        level: "2nd-level", level_int: 2, school: "necromancy", time: "1 action", range: "Touch", components: "V, S, M", material_desc: "50+ GP onyx taşı (tüketilir)", duration: "1 hour", ritual: false, concentration: false,
        classes: ["Warlock", "Wizard"],
        desc: "Dokunulan yaratık etrafında karanlık bir aura oluşturulur. Ölüm kurtarma (Death Save) zarlarında Avantaj kazanırsın. Ayrıca turunda en az bir kere yanına gelip sana vuran birine tepki olarak 2d4 Nekrotik hasar geri yansıtırsın.",
        higher_level: "", subclasses: []
    },
    "Feign Death": {
        name: "Feign Death",
        level: "3rd-level", level_int: 3, school: "necromancy", time: "1 action", range: "Touch", components: "V, S, M", material_desc: "bir tutam mezar toprağı", duration: "1 hour", ritual: true, concentration: false,
        classes: ["Bard", "Cleric", "Druid", "Wizard"],
        desc: "Dokunduğunuz gönüllü bir hedefin nabzını durdurup dışarıdan tamamen ÖLÜ taklidi yapmasını sağlarsınız. Hedef Blinded ve Incapacitated durumuna düşer (Hareket 0). Büyü süresince Psişik hasar hariç tüm hasarlara karşı Resistance (Direnç) kazanır. Hastalık ve zehirlenmeler etki etmez ve donar.",
        higher_level: "", subclasses: []
    },
    "Wither and Bloom": {
        name: "Wither and Bloom",
        level: "2nd-level", level_int: 2, school: "necromancy", time: "1 action", range: "60 feet", components: "V, S, M", material_desc: "solmuş bir çember şeklinde sarmaşık", duration: "Instantaneous", ritual: false, concentration: false,
        classes: ["Druid", "Sorcerer", "Wizard"],
        desc: "Seçtiğiniz noktada 10 feetlik bir çürüme/yeşerme çemberi patlatırsınız. İstediğiniz yaratıklar Constitution saving throw atar; başarısız olurlarsa 2d6 nekrotik hasar yer. Bölgedeki sihirli olmayan tüm otlar ve çimenler solarak ölür.\nAyrıca hedef aldığınız yaratıklardan Biri, sahip olduğu Hit Dice'ını harcayarak attığı zar kadar ve spellcasting yeteneğin kadar Şifa (Can Puanı) yenileyebilir.",
        higher_level: "Büyüyü 3. veya üzeri bir seviye slotuyla atarsanız, hasar seviye başına 1d6 artar.", subclasses: []
    },
    "Spirit Shroud": {
        name: "Spirit Shroud",
        level: "3rd-level", level_int: 3, school: "necromancy", time: "1 bonus action", range: "Self", components: "V, S", material_desc: "", duration: "Concentration, up to 1 minute", ritual: false, concentration: true,
        classes: ["Cleric", "Paladin", "Warlock", "Wizard"],
        desc: "Ölülerin ruhlarını çağırırsın. Büyü süresi boyunca 10 feet yakınındaki düşmanlara vurduğun tüm saldırılar fazladan 1d8 Radiant, Necrotic veya Cold (Büyüyü atarken seç) hasarı vurur. Bu hasarı yiyenler bir dahaki turuna kadar can yenileyemezler.\nAyrıca 10 feet yanına girenlerin veya orada başlayanların hareket hızı 10 feet yavaşlar.",
        higher_level: "5. ve 6. slotta hasar zarı 2d8, 7. ve 8. slotta 3d8, 9. slotta 4d8 olur.", subclasses: []
    },
    "Summon Undead": {
        name: "Summon Undead",
        level: "3rd-level", level_int: 3, school: "necromancy", time: "1 action", range: "90 feet", components: "V, S, M", material_desc: "en az 300 GP yaldızlı kafatası", duration: "Concentration, up to 1 hour", ritual: false, concentration: true,
        classes: ["Warlock", "Wizard"],
        desc: "Karanlık bir Undead ruh çağırırsınız (Ölümcül Form, Çürüyen Form veya İskelet Formu). Ruhun güç seviyeleri bu formu belirler. Ruh müttefik olarak hareket eder ve sözle kontrolünüzdedir. Saldırı komutlarını yerine getirir, emir verilmezse kendini savunur.",
        higher_level: "Kullanılan slot seviyesi ne kadar yüksekse ruhun AC, Can puanı, hasar atışları ve bonusları da o kadar artar.", subclasses: []
    },
    "Abi-Dalzim's Horrid Wilting": {
        name: "Abi-Dalzim's Horrid Wilting",
        level: "8th-level", level_int: 8, school: "necromancy", time: "1 action", range: "150 feet", components: "V, S, M", material_desc: "ufak bir sünger", duration: "Instantaneous", ritual: false, concentration: false,
        classes: ["Sorcerer", "Wizard"],
        desc: "Menzil içerisindeki 30 feet'lik küp alanındaki TÜM yaşam formlarının vücudundaki suyu tamamen çeker kurutursunuz. Canlılar Constitution saving throw atar; başarısızlarsa 12d8 nekrotik (necrotic) hasar alırlar. Zombiler/iskeletler ve taş yaratıklar etkilenmez, asırlık ormanlardaki sihirli olmayan tüm orman anında kül olarak yok olur.",
        higher_level: "", subclasses: []
    },
    "Cause Fear": {
        name: "Cause Fear",
        level: "1st-level", level_int: 1, school: "necromancy", time: "1 action", range: "60 feet", components: "V", material_desc: "", duration: "Concentration, up to 1 minute", ritual: false, concentration: true,
        classes: ["Warlock", "Wizard"],
        desc: "Bir canlının zihnine ölümlülüğünü hissettirip korku salarsınız. Wisdom saving throw atar; kurtaramazsa büyü bitene dek sizden Frightened (Korkmuş) durumu alır.",
        higher_level: "2. seviye veya üzeriyle attığınızda, her slot seviyesine göre fazladan 1 canlı daha hedeflersiniz.", subclasses: []
    },
    "Danse Macabre": {
        name: "Danse Macabre",
        level: "5th-level", level_int: 5, school: "necromancy", time: "1 action", range: "60 feet", components: "V, S", material_desc: "", duration: "Concentration, up to 1 hour", ritual: false, concentration: true,
        classes: ["Warlock", "Wizard"],
        desc: "Karanlık enerjiyi etrafınızdaki en fazla 5 ölü cesedin içine salıp canlandırırsınız. Cesetler Zombi veya İskelet olarak dirilir (Seçebilirsiniz). Bu şekilde canlanan yaratıkların saldırı atışlarına (Attack Rolls) sizin kendi Büyü yetenek (Spellcasting) bonusunuz da eklenir.\nBonus Eylem (Bonus Action) kullanarak kafanızdan hepsine birden tek seferde emir verebilirsiniz.",
        higher_level: "6. veya daha üst seviye slot kullandığınızda, seviye başına fazladan 2 ceset daha canlandırırsınız.", subclasses: []
    },
    "Enervation": {
        name: "Enervation",
        level: "5th-level", level_int: 5, school: "necromancy", time: "1 action", range: "60 feet", components: "V, S", material_desc: "", duration: "Concentration, up to 1 minute", ritual: false, concentration: true,
        classes: ["Sorcerer", "Warlock", "Wizard"],
        desc: "Ellerinizden çıkan karanlık bir lazer gibi hedefin canını emer. Hedef Dexterity saving throw atar; tutmazsa 4d8 nekrotik hasar yer. Büyü tutunduğunda, artık büyü bitene kadar her turunuzda Action kullanarak adama yeniden otomatik 4d8 nekrotik kanatabilirsiniz. (Yarı canlanırsınız). Eğer adam menzilden çıkarsa veya duvar arkasına saklanırsa büyü kopar.",
        higher_level: "6. ve üstüyle atıldığında her seviyeye ekstra 1d8 hasar eklenir.", subclasses: []
    },
    "Life Transference": {
        name: "Life Transference",
        level: "3rd-level", level_int: 3, school: "necromancy", time: "1 action", range: "30 feet", components: "V, S", material_desc: "", duration: "Instantaneous", ritual: false, concentration: false,
        classes: ["Cleric", "Wizard"],
        desc: "Kendi sağlığınızı fedakarca bir başkasına şifa (heal) olarak aktarırsınız. Büyüyü attığınızda hemen 4d8 Nekrotik (Necrotic) kendi kendinize Hasar alırsınız (bu hasar hiçbir şekilde düşürülemez veya engellenemez). Sizin yediğiniz bu MİKTARIN İKİ KATI kadar (Örn 20 hasar yediyseniz; 40 can olarak) seçtiğiniz bir Müttefikin HP'sine anında sağlık olarak dolmasını sağlarsınız.",
        higher_level: "4. seviye ve üstü atıldığında; senin kendine vurduğun zarar her slotta artar, dolayısıyla aktardığın iyileştirme gücünü kat kat devasa boyuta taşıyabilirsin.", subclasses: []
    },
    "Negative Energy Flood": {
        name: "Negative Energy Flood",
        level: "5th-level", level_int: 5, school: "necromancy", time: "1 action", range: "60 feet", components: "V, M", material_desc: "bir parça kemik ve siyah ipek", duration: "Instantaneous", ritual: false, concentration: false,
        classes: ["Warlock", "Wizard"],
        desc: "Negatif karanlık enerji şelalesi gönderirsin. Yaşayan canlılar Constitution kurtarma zarı atar; başarısızsa 5d12 nekrotik hasar alır. Eğer bu hasarla ölen olursa anında bir ZOMBİ olarak dirilip herkese saldırır.\n(Undead) Ölümsüz bir yaratığa atılırsa, zarar ETMEZ, bilakis zarın YARISI kadar ona GEÇİCİ CAN (Temp HP) kalkanı kazandırır.",
        higher_level: "", subclasses: []
    },
    "Shadow of Moil": {
        name: "Shadow of Moil",
        level: "4th-level", level_int: 4, school: "necromancy", time: "1 action", range: "Self", components: "V, S, M", material_desc: "en az 150 GP değerinde taşa oyulmuş ölümsüz gözü (Tüketilir!)", duration: "Concentration, up to 1 minute", ritual: false, concentration: true,
        classes: ["Warlock"],
        desc: "Ateşe benzer yoğun gölgeler vücudunuzu sarıp gölgelerin içinde gizlenmenizi sağlar ve etrafı tamamen karanlık (Heavily Obscured) yapar.\nBüyü sürerken Radiant (Işıyan) hasarına Dirençlisinizdir. Ayrıca yanınıza kadar yaklaşıp size vuran biri olursa o adamlara anında alev gölgeleri kırbaç gibi çarpar ve 2d8 necrotic hasar geri püskürtür.",
        higher_level: "", subclasses: []
    },
    "Soul Cage": {
        name: "Soul Cage",
        level: "6th-level", level_int: 6, school: "necromancy", time: "1 reaction", range: "60 feet", components: "V, S, M", material_desc: "100 gp ufak gümüş kafes", duration: "8 hours", ritual: false, concentration: false,
        classes: ["Warlock", "Wizard"],
        desc: "Uygulayacağınız 60 ft mesafedeki bir insansının (Humanoid) can verirken RUHUNU Çalarak kafese kitlersiniz. Kafesteyken adam ASLA Diriltilemez (Revive Yiyemez).\nRuhu Toplam (6 Kere) kullanarak onu kafesten boşaltana dek Emebilirsiniz:\n1) 2d8 Heal Basma (Aksiyon)\n2) Ruha sorular sorup (Ölüyle Konuşur Gibi) Zorla kafasına Girebilirsiniz.\n3) Gelecek ilk turunuzdaki Saldırı Atışlarında (Avantaj vs) kazanmak İçin onun Hayat Enerjisini Sızırtırsınız.\n4) Adam Ölmeden, Hayattayken Gördüğü En Gizli Kalesinin/Yerlerin görüntülerini Bir hayalet gibi Siz De kamera Gibi Oradan Görebilirsiniz.",
        higher_level: "", subclasses: []
    },
    "Toll the Dead": {
        name: "Toll the Dead",
        level: "Cantrip", level_int: 0, school: "necromancy", time: "1 action", range: "60 feet", components: "V, S", material_desc: "", duration: "Instantaneous", ritual: false, concentration: false,
        classes: ["Cleric", "Warlock", "Wizard"],
        desc: "Hedefin üzerinde ölümü çağrıştıran kilise çan sesleri duyulur. Hedef Wisdom kurtarma zarı atmalıdır; başarısız olursa 1d8 nekrotik (necrotic) hasar alır. EĞER HEDEFİN CANI HAFİF BİLE AZALMIŞSA (Tam HP'de değilse) hasar zarı 1d12 ile değişip çok daha ölümcül olur.",
        higher_level: "Hasar 5. seviyede 2d12, 11. seviyede 3d12, 17. seviyede 4d12 olur.", subclasses: []
    }
};

const spillsPath = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json';
const spillsRaw = fs.readFileSync(spillsPath, 'utf8');
const spillsObj = JSON.parse(spillsRaw);
const spillsArr = Array.isArray(spillsObj) ? spillsObj : Object.values(spillsObj);

let appended = 0;
const localNames = new Set(spillsArr.map(s => s.name.toLowerCase()));

for (const spellName of Object.keys(translatedSpells)) {
    if (!localNames.has(spellName.toLowerCase())) {
        spillsArr.push(translatedSpells[spellName]);
        appended++;
    }
}

let resultData = Array.isArray(spillsObj) ? spillsArr : spillsArr.reduce((acc, curr) => { acc[curr.name] = curr; return acc; }, {});
fs.writeFileSync(spillsPath, JSON.stringify(resultData, null, 4));
console.log(`Added ${appended} translated missing Necromancy spells!`);
