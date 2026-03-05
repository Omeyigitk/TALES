// levelup_data.ts — D&D 5e Level-Up Verileri
// ASI seviyeleri, class özellikleri, feat listesi

// ─── ASI (Ability Score Improvement) Seviyeleri ──────────────────────────────
export const ASI_LEVELS: Record<string, number[]> = {
    Barbarian: [4, 8, 12, 16, 19],
    Bard: [4, 8, 12, 16, 19],
    Cleric: [4, 8, 12, 16, 19],
    Druid: [4, 8, 12, 16, 19],
    Fighter: [4, 6, 8, 12, 14, 16, 19],
    Monk: [4, 8, 12, 16, 19],
    Paladin: [4, 8, 12, 16, 19],
    Ranger: [4, 8, 12, 16, 19],
    Rogue: [4, 8, 10, 12, 16, 19],
    Sorcerer: [4, 8, 12, 16, 19],
    Warlock: [4, 8, 12, 16, 19],
    Wizard: [4, 8, 12, 16, 19],
    Artificer: [4, 8, 12, 16, 19],
};

// ─── Sınıf Özellikleri (Seviye Başına) ───────────────────────────────────────
export interface ClassFeature {
    name: string;
    desc_tr: string;
}

export const CLASS_FEATURES: Record<string, Record<number, ClassFeature[]>> = {
    Barbarian: {
        1: [{ name: "Rage", desc_tr: "Bonus aksiyon olarak öfkeye girebilirsin. Öfke süresince fiziksel hasar bonusu, STR/CON kurtarma atışlarına avantaj ve fiziksel hasar direnci kazanırsın." },
        { name: "Unarmored Defense", desc_tr: "Zırh giymezsen AC = 10 + DEX modi + CON modi olur." }],
        2: [{ name: "Reckless Attack", desc_tr: "Tur başında saldırını avantajlı yapabilirsin; ancak bu tur sana karşı yapılan saldırılar da avantajlı olur." },
        { name: "Danger Sense", desc_tr: "DEX kurtarma atışlarına avantaj (gördüğün tehlikeler için)." }],
        3: [{ name: "Primal Path", desc_tr: "Barbarian alt sınıfın olan İlkel Yol'u seçersin (Berserker, Totem Warrior vb.)" }],
        5: [{ name: "Extra Attack", desc_tr: "Saldırı aksiyonunda 2 saldırı yapabilirsin." },
        { name: "Fast Movement", desc_tr: "Zırh giymezsen hareket hızın 10 ft artar." }],
        7: [{ name: "Feral Instinct", desc_tr: "İnisiyatife avantaj. Sürprizlenirsen öfkelenerek normal hareket edebilirsin." }],
        9: [{ name: "Brutal Critical", desc_tr: "Kritik vuruşlarda 1 ekstra hasar zarı atarsın." }],
        10: [{ name: "Intimidating Presence", desc_tr: "Aksiyon harcayarak bir yaratığı korkutabilirsin (WIS DC)." }],
        11: [{ name: "Relentless Rage", desc_tr: "Öfkeliyken 0 HP'ye düşersen DC 10 CON save ile 1 HP kalabilirsin." }],
        13: [{ name: "Brutal Critical", desc_tr: "Kritik vuruşlarda 2 ekstra hasar zarı atarsın." }],
        15: [{ name: "Persistent Rage", desc_tr: "İstemeden öfken sönmez; sadece bilinçsiz kalırsan biter." }],
        17: [{ name: "Brutal Critical", desc_tr: "Kritik vuruşlarda 3 ekstra hasar zarı atarsın." }],
        18: [{ name: "Indomitable Might", desc_tr: "STR (Atletizm) kontrolünde zardan düşük çıkarsan zarın yerine STR skorunu kullanırsın." }],
        20: [{ name: "Primal Champion", desc_tr: "STR +4, CON +4 (maksimum 24'e kadar)." }],
    },
    Fighter: {
        1: [{ name: "Fighting Style", desc_tr: "Savaş stilini seçersin (Archery, Defense, Dueling, Great Weapon Fighting, Protection, Two-Weapon Fighting)." },
        { name: "Second Wind", desc_tr: "Bonus aksiyon: 1d10 + Fighter seviyesi kadar HP kazanırsın. Kısa/uzun dinlenmede yenilenir." }],
        2: [{ name: "Action Surge", desc_tr: "Turunda bir kez ekstra bir aksiyon kazanırsın. Kısa/uzun dinlenmede yenilenir." }],
        3: [{ name: "Martial Archetype", desc_tr: "Savaşçı alt sınıfını seçersin (Champion, Battle Master, Eldritch Knight)." }],
        5: [{ name: "Extra Attack", desc_tr: "Saldırı aksiyonunda 2 saldırı yapabilirsin." }],
        9: [{ name: "Indomitable", desc_tr: "Bir kurtarma atışını yeniden atabilirsin. Uzun dinlenmede yenilenir." }],
        11: [{ name: "Extra Attack (2)", desc_tr: "Saldırı aksiyonunda 3 saldırı yapabilirsin." }],
        13: [{ name: "Indomitable (x2)", desc_tr: "Kurtarma atışını 2 kez yeniden atabilirsin." }],
        17: [{ name: "Action Surge (x2)", desc_tr: "Turunda iki kez Action Surge kullanabilirsin." },
        { name: "Indomitable (x3)", desc_tr: "Kurtarma atışını 3 kez yeniden atabilirsin." }],
        20: [{ name: "Extra Attack (3)", desc_tr: "Saldırı aksiyonunda 4 saldırı yapabilirsin." }],
    },
    Wizard: {
        1: [{ name: "Spellcasting", desc_tr: "Büyücü büyü listesinden büyü öğrenirsin. INT spellcasting ability'dir." },
        { name: "Arcane Recovery", desc_tr: "Kısa dinlenmede toplam seviyesi Wizard lv / 2'ye (yukarı yuv.) eşit büyü slotlarını geri kazanırsın." }],
        2: [{ name: "Arcane Tradition", desc_tr: "Büyü okulunu seçersin (Evocation, Conjuration, Abjuration vb.)" }],
        5: [{ name: "3rd Level Spells", desc_tr: "3. seviye büyü slotları açılır." }],
        18: [{ name: "Spell Mastery", desc_tr: "Seçtiğin 1. ve 2. seviye büyüleri slot harcamadan atabilirsin." }],
        20: [{ name: "Signature Spells", desc_tr: "3. seviye iki büyüyü slot harcamadan hazır tutabilirsin." }],
    },
    Rogue: {
        1: [{ name: "Expertise", desc_tr: "Yeterlilik bonusunun 2 katını seçtiğin 2 beceri için kullanırsın." },
        { name: "Sneak Attack", desc_tr: "Avantajlı saldırıda +1d6 ekstra hasar (Sv. başına +1d6 artar)." },
        { name: "Thieves' Cant", desc_tr: "Hırsızlar dilini bilirsin." }],
        2: [{ name: "Cunning Action", desc_tr: "Bonus aksiyon: Dash, Disengage veya Hide yapabilirsin." }],
        3: [{ name: "Roguish Archetype", desc_tr: "Alt sınıfını seçersin (Thief, Assassin, Arcane Trickster vb.)" }],
        5: [{ name: "Uncanny Dodge", desc_tr: "Görebileceğin saldırılara karşı reaksiyon ile hasarı yarıya indirirsin." }],
        6: [{ name: "Expertise (x2)", desc_tr: "2 beceri daha için uzmanlık kazanırsın." }],
        7: [{ name: "Evasion", desc_tr: "DEX save gerektiren alan büyülerine başarılıysan 0, başarısızsan yarım hasar alırsın." }],
        11: [{ name: "Reliable Talent", desc_tr: "Yeterli olduğun beceri/araç kontrollerinde 9 veya daha düşük zarları 10 sayılır." }],
        14: [{ name: "Blindsense", desc_tr: "Gizlenen bir yaratığın nerede olduğunu 10 ft içinde hissedebilirsin." }],
        15: [{ name: "Slippery Mind", desc_tr: "WIS kurtarma atışlarında yeterlilik kazanırsın." }],
        18: [{ name: "Elusive", desc_tr: "Avantajsız olmadıkça saldırganlar sana karşı avantaj kazanamaz." }],
        20: [{ name: "Stroke of Luck", desc_tr: "Bir saldırıyı isabet ettirmek ya da bir kontrol için d20'yi 20 saymak için kullanabilirsin. Uzun dinlenmede yenilenir." }],
    },
    Paladin: {
        1: [{ name: "Divine Sense", desc_tr: "1 + CHA modi kadar kullanımla 60 ft içinde şeytanları, canavarları ve cenneti algılarsın." },
        { name: "Lay on Hands", desc_tr: "Her uzun dinlenmede Paladin seviyesi × 5 HP puanı ile yaralanmaları iyileştirirsin." }],
        2: [{ name: "Fighting Style", desc_tr: "Paladin savaş stilini seçersin." },
        { name: "Spellcasting", desc_tr: "İlahi büyücülük. CHA spellcasting ability." },
        { name: "Divine Smite", desc_tr: "Melee vuruşu isabetlendirince slot harcayarak +2d8 parıltı hasarı yapabilirsin." }],
        3: [{ name: "Divine Health", desc_tr: "Hastalıklara karşı bağışıklısın." },
        { name: "Sacred Oath", desc_tr: "Paladinin yeminine (Devotion, Ancients, Vengeance vb.) göre özellikler kazanırsın." }],
        5: [{ name: "Extra Attack", desc_tr: "Saldırı aksiyonunda 2 saldırı yapabilirsin." }],
        6: [{ name: "Aura of Protection", desc_tr: "10 ft mesafedeki tüm dostlar kurtarma atışlarına CHA modi ekler (en az +1)." }],
        10: [{ name: "Aura of Courage", desc_tr: "10 ft mesafedeki dostlar korkutulamaz (Paladin bilinçliyken)." }],
        11: [{ name: "Improved Divine Smite", desc_tr: "Melee isabetine +1d8 parıltı hasarı otomatik eklenir." }],
        14: [{ name: "Cleansing Touch", desc_tr: "Aksiyon: Bir büyüyü kendi veya dokunduğun birisinden kaldırırsın (CHA modi x/gün)." }],
        18: [{ name: "Aura Improvements", desc_tr: "Auralarının menzili 30 feet'e çıkar." }],
        20: [{ name: "Sacred Oath Feature", desc_tr: "Yemininin nihai özelliğini kazanırsın." }],
    },
    Ranger: {
        1: [{ name: "Favored Enemy", desc_tr: "Seçtiğin yaratık türüne karşı Survival/History kontrollerinde avantaj ve ekstra hasar kazanırsın." },
        { name: "Natural Explorer", desc_tr: "Seçtiğin arazide yolculuk daha hızlı, iz takibi avantajlı, vb." }],
        2: [{ name: "Fighting Style", desc_tr: "Ranger savaş stilini seçersin." },
        { name: "Spellcasting", desc_tr: "Ranger büyücülüğü. WIS spellcasting ability." }],
        3: [{ name: "Ranger Archetype", desc_tr: "Alt sınıf seçimi (Hunter, Beast Master, Gloom Stalker vb.)" },
        { name: "Primeval Awareness", desc_tr: "Büyü slotu harcayarak 1 mil içindeki belirli yaratık türlerini hissedebilirsin." }],
        5: [{ name: "Extra Attack", desc_tr: "Saldırı aksiyonunda 2 saldırı yapabilirsin." }],
        8: [{ name: "Land's Stride", desc_tr: "Büyüsüz güç arazi ve fıskiyelerden hareket kısıtlanmaz." }],
        10: [{ name: "Hide in Plain Sight", desc_tr: "Camouflage ile DC 20 Stealth kontrolü ile saatlerce gizlenebilirsin." }],
        14: [{ name: "Vanish", desc_tr: "Bonus aksiyon: Hide. Kaçamadığın sürece hiçbir zaman izlenemezsin." }],
        18: [{ name: "Feral Senses", desc_tr: "Görünmez varlıkları 30 ft içinde hissedebilirsin." }],
        20: [{ name: "Foe Slayer", desc_tr: "Her tirde bir sefer, Favored Enemy'e karşı saldırı veya hasar zarına WIS modi ekleyebilirsin." }],
    },
    Monk: {
        1: [{ name: "Unarmored Defense", desc_tr: "Zırh/kalkan yoksa AC = 10 + DEX + WIS modi." },
        { name: "Martial Arts", desc_tr: "Silahsız saldırılar ve Monk silahları için STR veya DEX kullanabilirsin. Hasar martial arts die kadar artar." }],
        2: [{ name: "Ki", desc_tr: "Monk seviyesi kadar Ki puanı kazanırsın. Flurry of Blows, Patient Defense, Step of the Wind için kullanılır." },
        { name: "Unarmored Movement", desc_tr: "Zırh giymezken hareket hızın artar." }],
        3: [{ name: "Monastic Tradition", desc_tr: "Alt sınıf seçimi (Way of the Open Hand, Shadow, Four Elements vb.)" },
        { name: "Deflect Missiles", desc_tr: "Reaksiyon ile gelen mermi hasarını azaltırsın; 0'a indirirsen geri atabilirsin." }],
        4: [{ name: "Slow Fall", desc_tr: "Reaksiyon ile düşme hasarını Monk Sv × 5 kadar azaltırsın." }],
        5: [{ name: "Extra Attack", desc_tr: "Saldırı aksiyonunda 2 saldırı yapabilirsin." },
        { name: "Stunning Strike", desc_tr: "İsabetli vuruşta 1 Ki: CON save ya da hedef Stunıd olur." }],
        6: [{ name: "Ki-Empowered Strikes", desc_tr: "Silahsız saldırılar büyülü hasar yapar." }],
        7: [{ name: "Evasion", desc_tr: "DEX save gerektiren büyülerde başarılıysan 0 hasar." },
        { name: "Stillness of Mind", desc_tr: "Aksiyon ile bir Charm veya Fear etkisini bitirirsin." }],
        10: [{ name: "Purity of Body", desc_tr: "Hastalık ve zehre karşı bağışıklısın." }],
        13: [{ name: "Tongue of the Sun and Moon", desc_tr: "Tüm dilleri anlayabilir ve konuşabilirsin." }],
        14: [{ name: "Diamond Soul", desc_tr: "Tüm kurtarma atışlarında yeterlilik. Başarısız olursan 1 Ki harcayarak yeniden atabilirsin." }],
        15: [{ name: "Timeless Body", desc_tr: "Artık yaşlanmıyorsun ve yaşlandırma büyülerinden etkilenmiyorsun." }],
        18: [{ name: "Empty Body", desc_tr: "4 Ki: 1 Concentration dakikası görünmez ol. 8 Ki: Astral Projeksiyon." }],
        20: [{ name: "Perfect Self", desc_tr: "Turbaşında Ki yoksa 4 Ki kazanırsın." }],
    },
    Cleric: {
        1: [{ name: "Spellcasting", desc_tr: "Cleric büyücülüğü. WIS spellcasting ability." },
        { name: "Divine Domain", desc_tr: "İlahi alanını seçersin (Knolwedge, Life, Light, Nature, Tempest, Trickery, War vb.)" }],
        2: [{ name: "Channel Divinity", desc_tr: "İlahi gücünü kullanırsın — Turn Undead ve domain özelliği. Kısa/uzun dinlenme yeniley." }],
        5: [{ name: "Destroy Undead (CR 1/2)", desc_tr: "Turn Undead esnasında CR 1/2 veya altındaki Undead'ler anında yok edilir." }],
        6: [{ name: "Channel Divinity (2/rest)", desc_tr: "Kısa dinlenme başına 2 kez Channel Divinity kullanabilirsin." }],
        8: [{ name: "Destroy Undead (CR 1)", desc_tr: "CR 1 veya altındaki Undead'ler anında yok edilir." },
        { name: "Domain Feature", desc_tr: "Alanına göre özellik kazanırsın (Potent Spellcasting veya Divine Strike)." }],
        10: [{ name: "Divine Intervention", desc_tr: "Tanrına yardım çağrısında bulunursun (%sayı = Cleric lv)." }],
        11: [{ name: "Destroy Undead (CR 2)", desc_tr: "CR 2 veya altındaki Undead'ler anında yok edilir." }],
        14: [{ name: "Destroy Undead (CR 3)", desc_tr: "CR 3 veya altındaki Undead'ler anında yok edilir." }],
        17: [{ name: "Destroy Undead (CR 4)", desc_tr: "CR 4 veya altındaki Undead'ler anında yok edilir." },
        { name: "Domain Feature", desc_tr: "Alanının en üst seviye özelliğini kazanırsın." }],
        18: [{ name: "Channel Divinity (3/rest)", desc_tr: "Kısa dinlenme başına 3 kez Channel Divinity kullanabilirsin." }],
        20: [{ name: "Divine Intervention (Improved)", desc_tr: "Divine Intervention otomatik çalışır." }],
    },
    Druid: {
        1: [{ name: "Druidic", desc_tr: "Sadece Druidlerin bildiği gizli dili bilirsin." },
        { name: "Spellcasting", desc_tr: "Druid büyücülüğü. WIS spellcasting ability." }],
        2: [{ name: "Wild Shape", desc_tr: "Bonus aksiyon: Hayvan şekline girebilirsin. Kısa/uzun dinlenmede 2 kullanım yenilenir." },
        { name: "Druid Circle", desc_tr: "Druid alt sınıfını seçersin (Moon, Land, Stars vb.)" }],
        18: [{ name: "Timeless Body", desc_tr: "Artık yaşlanmıyorsun." },
        { name: "Beast Spells", desc_tr: "Wild Shape formundayken büyü yapabilirsin." }],
        20: [{ name: "Archdruid", desc_tr: "Wild Shape kullanım sayın sınırsız olur." }],
    },
    Bard: {
        1: [{ name: "Spellcasting", desc_tr: "Bard büyücülüğü. CHA spellcasting ability." },
        { name: "Bardic Inspiration (d6)", desc_tr: "Bonus aksiyon: Bir dosta 1d6 Inspiration zarı ver. CHA modi kadar kullanım/uzun dinlenme." }],
        2: [{ name: "Jack of All Trades", desc_tr: "Yeterlilik bonusunun yarısını (aşağı yuvarlama) tüm beceri kontrollerine eklersin." },
        { name: "Song of Rest (d6)", desc_tr: "Kısa dinlenmede dostlar ekstra 1d6 HP kazanır." }],
        3: [{ name: "Bard College", desc_tr: "Bard alt sınıfını seçersin (Lore, Valor, Glamour vb.)" },
        { name: "Expertise", desc_tr: "2 beceri için uzmanlık (yeterlilik ×2) kazanırsın." }],
        5: [{ name: "Bardic Inspiration (d8)", desc_tr: "İlham zarı 1d8 olur." },
        { name: "Font of Inspiration", desc_tr: "Bardik İlham kısa dinlemede de yenilenir." }],
        6: [{ name: "Countercharm", desc_tr: "Aksiyon: 30 ft içindeki dostlara charm veya fright kurtarma atışlarında avantaj." },
        { name: "College Feature", desc_tr: "Alt sınıfından bir özellik kazanırsın." }],
        9: [{ name: "Song of Rest (d8)", desc_tr: "Kısa dinlenmede dostlar ekstra 1d8 HP kazanır." }],
        10: [{ name: "Bardic Inspiration (d10)", desc_tr: "İlham zarı 1d10 olur." },
        { name: "Expertise", desc_tr: "2 beceri daha için uzmanlık kazanırsın." },
        { name: "Magical Secrets", desc_tr: "Herhangi 2 büyü öğrenebilirsin (herhangi bir sınıf listesinden)." }],
        13: [{ name: "Song of Rest (d10)", desc_tr: "Kısa dinlenmede dostlar ekstra 1d10 HP kazanır." }],
        14: [{ name: "Magical Secrets", desc_tr: "Herhangi 2 büyü daha öğrenebilirsin." },
        { name: "College Feature", desc_tr: "Alt sınıfından üst seviye bir özellik kazanırsın." }],
        15: [{ name: "Bardic Inspiration (d12)", desc_tr: "İlham zarı 1d12 olur." }],
        17: [{ name: "Song of Rest (d12)", desc_tr: "Kısa dinlenmede dostlar ekstra 1d12 HP kazanır." }],
        18: [{ name: "Magical Secrets", desc_tr: "Herhangi 2 büyü daha öğrenebilirsin." }],
        20: [{ name: "Superior Inspiration", desc_tr: "İnisiyatifte Bardic Inspiration yoksa 1 kazanırsın." }],
    },
    Sorcerer: {
        1: [{ name: "Spellcasting", desc_tr: "Sorcerer büyücülüğü. CHA spellcasting ability." },
        { name: "Sorcerous Origin", desc_tr: "Büyü kaynağını seçersin (Draconic, Wild Magic, Divine Soul vb.)" }],
        2: [{ name: "Font of Magic", desc_tr: "Sorcery Points kazanırsın. Büyü slotlarına çevirebilir veya Metamagic için kullanabilirsin." }],
        3: [{ name: "Metamagic", desc_tr: "2 Metamagic seçeneği seçersin (Careful, Distant, Empowered, Extended, Heightened, Quickened, Subtle, Twinned)." }],
        20: [{ name: "Sorcerous Restoration", desc_tr: "Kısa dinlenmede 4 Sorcery Points kazanırsın." }],
    },
    Warlock: {
        1: [{ name: "Otherworldly Patron", desc_tr: "Paktını kurduğun varlığı seçersin (Archfey, Fiend, Great Old One vb.)" },
        { name: "Pact Magic", desc_tr: "Warlock büyücülüğü. CHA spellcasting ability. Büyü slotları kısa dinlenmede yenilenir." }],
        2: [{ name: "Eldritch Invocations", desc_tr: "2 adet Eldritch Invocation seçersin (Agonizing Blast, Devil's Sight vb.)" }],
        3: [{ name: "Pact Boon", desc_tr: "Patron hediyeni seçersin: Pact of the Chain (familiar), Tome (kitap büyüleri) veya Blade (silah)." }],
        6: [{ name: "Patron Feature", desc_tr: "Patronundan bir özellik kazanırsın." }],
        10: [{ name: "Patron Feature", desc_tr: "Patronundan bir özellik kazanırsın." }],
        11: [{ name: "Mystic Arcanum (6th level)", desc_tr: "Slot harcamadan 6. seviye bir büyüyü 1/gün kullanabilirsin." }],
        13: [{ name: "Mystic Arcanum (7th level)", desc_tr: "Slot harcamadan 7. seviye bir büyüyü 1/gün kullanabilirsin." }],
        14: [{ name: "Patron Feature", desc_tr: "Patronundan en üst seviye bir özellik kazanırsın." }],
        15: [{ name: "Mystic Arcanum (8th level)", desc_tr: "Slot harcamadan 8. seviye bir büyüyü 1/gün kullanabilirsin." }],
        17: [{ name: "Mystic Arcanum (9th level)", desc_tr: "Slot harcamadan 9. seviye bir büyüyü 1/gün kullanabilirsin." }],
        20: [{ name: "Eldritch Master", desc_tr: "Patronuna 1 dk yalvararak tüm Pact Magic slotlarını geri alabilirsin." }],
    },
};

// ─── D&D 5e Feat Listesi (Türkçeleştirilmiş) ─────────────────────────────────
export interface Feat {
    name: string;
    name_tr: string;
    prerequisite?: string;
    desc_tr: string;
}

export const FEATS: Feat[] = [
    {
        name: "Alert", name_tr: "Tetikte",
        desc_tr: "+5 inisiyatif bonusu. Bilinçliyken sürprizlene mazsın. Seni göremeyenler saldırı atışlarında avantaj kazanamaz."
    },
    {
        name: "Actor", name_tr: "Aktör",
        desc_tr: "CHA +1. Şaklabanite ve taklitçilikte yeterlilik. Performans ve Aldatma kontrollerinde yeterlilik bonusu iki katına çıkar. Birinin sesini gerçekçi biçimde taklit edebilirsin."
    },
    {
        name: "Athlete", name_tr: "Atlet",
        desc_tr: "STR veya DEX +1. Yatarken kalkmak yalnızca 5 ft hareket harcıyor. Tırmanmak artık ekstra hareket harcatmaz. Durarak uzun atlamada hız maliyeti yok."
    },
    {
        name: "Charger", name_tr: "Atak",
        desc_tr: "Dash aksiyonuyla hareket ettiğinde, bonus aksiyon olarak melee saldırısı veya Shove yapabilirsin. Saldırıda isabet edersen +5 hasar."
    },
    {
        name: "Crossbow Expert", name_tr: "Yayçı Uzmanı",
        desc_tr: "Elle doldurma kosulunu yoksayarsın. Yanındaki düşmana karşı dezavantaj olmaya devam etmez. Bonus aksiyon olarak el arbaleti ile saldırı yapabilirsin."
    },
    {
        name: "Defensive Duelist", name_tr: "Savunmacı Düellist",
        desc_tr: "Önkoşul: DEX 13. Finesse silah tutarken bir saldırı sana isabet ettiğinde reaksiyon olarak yeterlilik bonusunu AC'ına ekleyebilirsin."
    },
    {
        name: "Dual Wielder", name_tr: "İki El Savaşçısı",
        desc_tr: "+1 AC ikiboyutlu silahlarda. Tek elde taşınabilen büyük silahlarla da ikiboyutlu savaş yapabilirsin. Bonus aksiyon saldırında iki silahın da hasar bonusu geçer."
    },
    {
        name: "Dungeon Delver", name_tr: "Zindan Kaşifi",
        desc_tr: "Gizli kapıları aramaya avantaj. Tuzakları tespit/etkisizleştirmeye avantaj. Tuzak hasarı için DEX Save'e avantaj. Yavaş ilerlerken tuzakları normal hızda tespit edebilirsin."
    },
    {
        name: "Durable", name_tr: "Dayanıklı",
        desc_tr: "CON +1. Kısa dinlenmede Hit Die atışları minimum 2 × CON modifier kadar HP verir."
    },
    {
        name: "Elemental Adept", name_tr: "Unsur Ustası",
        desc_tr: "Önkoşul: Büyü yapabilme. Seçtiğin hasar türü (asit, şimşek, ateş, soğuk veya gök gürültüsü) için 1'ler yeniden atılır ve dirençler yoksayılır."
    },
    {
        name: "Grappler", name_tr: "Pençeci",
        desc_tr: "Önkoşul: STR 13. Tuttuğun yaratığa karşı avantaj. Tuttuğun yaratık, ikisini de kısıtlayan bir hareket olarak tutabilirsin."
    },
    {
        name: "Great Weapon Master", name_tr: "Büyük Silah Ustası",
        desc_tr: "Kritik vuruyorsa veya bir yaratığı öldürüyorsa, bonus aksiyon olarak melee saldırısı yapabilirsin. Büyük silahla saldırırken -5 isabet / +10 hasar seçimi yapabilirsin."
    },
    {
        name: "Healer", name_tr: "Şifacı",
        desc_tr: "Healer's Kit ile bir yaratığı stabilize ettiğinde 1 HP da kazandırırsın. Healer's Kit kullanarak 1d6 + 4 + yaratığın max Hit Die sayısı kadar HP kazandırırsın (her yaratık için 1 dinlenme çevriminde 1 kez)."
    },
    {
        name: "Heavily Armored", name_tr: "Ağır Zırh",
        desc_tr: "Önkoşul: Orta zırh yeterliliği. STR +1. Ağır zırh yeterliliği kazanırsın."
    },
    {
        name: "Heavy Armor Master", name_tr: "Ağır Zırh Ustası",
        desc_tr: "Önkoşul: Ağır zırh yeterliliği. STR +1. Ağır zırh giyerken büyüsüz kaynaklı vur/deld/künt hasarı 3 azalır."
    },
    {
        name: "Inspiring Leader", name_tr: "İlham Veren Lider",
        desc_tr: "Önkoşul: CHA 13. 10 dakikalık konuşmayla 6 dosta geçici HP = Sv + CHA modi kazandırırsın."
    },
    {
        name: "Keen Mind", name_tr: "Keskin Zihin",
        desc_tr: "INT +1. Her zaman kuzey yönünü, gün doğumu ve batımını, ay fazını bilirsin. 1 ay öncesine kadar yaşadığın her şeyi hatırlayabilirsin."
    },
    {
        name: "Lightly Armored", name_tr: "Hafif Zırh",
        desc_tr: "STR veya DEX +1. Hafif zırh yeterliliği kazanırsın."
    },
    {
        name: "Linguist", name_tr: "Dilbilimci",
        desc_tr: "INT +1. 3 dil öğrenirsin. Şifreli mesajlar yazabilir ve çözebilirsin (INT DC 15)."
    },
    {
        name: "Lucky", name_tr: "Şanslı",
        desc_tr: "3 Şans puanı (uzun dinlenmede yenilenir). Saldırı, kontrol veya save atmadan önce/sonra harcayarak ekstra d20 atabilir, sonucu seçebilirsin. Sana karşı saldırılarda da kullanabilirsin."
    },
    {
        name: "Mage Slayer", name_tr: "Büyücü Katili",
        desc_tr: "Yakındaki büyücü büyü yaparsa reaksiyon ile melee saldırısı yapabilirsin. Konsantrasyonu kırmak için avantaj. 5 ft içindeyken düşman save'lerinde dezavantaj."
    },
    {
        name: "Magic Initiate", name_tr: "Büyü Başlangıcı",
        desc_tr: "Bir sınıf seçersin: o sınıfın listesinden 2 Cantrip ve 1. seviye bir büyü öğrenirsin (1/uzun dinlenme)."
    },
    {
        name: "Martial Adept", name_tr: "Savaş Acemi",
        desc_tr: "2 Battle Master manevra öğrenirsin. 1 Superiority Die (d6) kazanırsın (kısa/uzun dinl. yenilenir)."
    },
    {
        name: "Medium Armor Master", name_tr: "Orta Zırh Ustası",
        desc_tr: "Önkoşul: Orta zırh yeterliliği. Orta zırhlayken dezavantaj yok Stealth'e. AC hesabında DEX +3'e kadar katkıda bulunabilir (normalde +2 sınır)."
    },
    {
        name: "Mobile", name_tr: "Hareketli",
        desc_tr: "+10 ft hareket hızı. Dash yaparken engebeli arazi ekstra hareket harcatmaz. Melee saldırısından sonra saldırdığın yaratık fırsat saldırısı yapamaz."
    },
    {
        name: "Moderately Armored", name_tr: "Orta Zırh",
        desc_tr: "Önkoşul: Hafif zırh yeterliliği. STR veya DEX +1. Orta zırh ve kalkan yeterliliği kazanırsın."
    },
    {
        name: "Mounted Combatant", name_tr: "Binici Savaşçı",
        desc_tr: "Binekten küçük yaratıklara saldırıda avantaj. Fırsat saldırılarını binekten sen üstüne alabilirsin. Araç başarılı DEX Save yaparken hasarı bineğe aktarabilirsin."
    },
    {
        name: "Observant", name_tr: "Gözlemci",
        desc_tr: "INT veya WIS +1. Aktif arama yapmadan pasif Perception ve Investigation +5. Dudak okuyabilirsin."
    },
    {
        name: "Polearm Master", name_tr: "Saplı Silah Ustası",
        desc_tr: "Halberd/glaive/quarterstaff/spear ile saldırı sonrası bonus aksiyonla silahın diğer ucuyla 1d4 vur hasarı yapabilirsin. Saplı silahla yaratıklar menzilini girince fırsat saldırısı yapabilirsin."
    },
    {
        name: "Resilient", name_tr: "Dirençli",
        desc_tr: "Seçilen istatistik +1 (max 20). O istatistiğin kurtarma atışlarında yeterlilik kazanırsın."
    },
    {
        name: "Ritual Caster", name_tr: "Ritüel Büyücüsü",
        desc_tr: "Önkoşul: INT veya WIS 13. Bir ritual büyü kitabı kazanırsın. 2 Ritual büyü öğrenirsin; yeni ritüelleri kitabına ekleyebilirsin."
    },
    {
        name: "Savage Attacker", name_tr: "Vahşi Saldırgan",
        desc_tr: "Her turda bir kez, melee saldırısındaki hasar zarlarını yeniden atabilir ve iki sonuçtan birini seçebilirsin."
    },
    {
        name: "Sentinel", name_tr: "Bekçi",
        desc_tr: "Fırsat saldırısı isabet edince düşmanın hızı 0 olur. Yakındaki düşman Disengage yapsa bile fırsat saldırısı yapabilirsin. Bir yaratık sana komşu başka birine saldırırsa reaksiyon ile ona melee saldırısı yapabilirsin."
    },
    {
        name: "Sharpshooter", name_tr: "Keskin Nişancı",
        desc_tr: "Uzun menzilde dezavantaj yok. Menzilli saldırılarda yarı kapak avantajlarını yoksayarsın. -5 isabet / +10 hasar seçimi yapabilirsin."
    },
    {
        name: "Shield Master", name_tr: "Kalkan Ustası",
        desc_tr: "Saldırı aksiyonu aldıktan sonra bonus aksiyon ile Shove yapabilirsin. Kalkan AC'ı DEX save'lerine ekler. Bölge hasar save'inde başarılıysan kalkan ile tamamen korunun (sıfır hasar)."
    },
    {
        name: "Skilled", name_tr: "Becerikli",
        desc_tr: "Üç beceri veya araç setinde yeterlilik kazanırsın."
    },
    {
        name: "Skulker", name_tr: "Sinsi",
        desc_tr: "Önkoşul: DEX 13. Görünmez bir düşmana karşı saklanmaya çalışabilirsin. Gizliyken isabet etmeyen menzilli saldırı gizliliği bozmaz. Hafif ışıkta Stealth'e dezavantaj yok."
    },
    {
        name: "Spell Sniper", name_tr: "Büyü Nişancısı",
        desc_tr: "Önkoşul: Büyü yapabilme. Saldırı atışı gerektiren büyülerin menzili iki katına çıkar. Yarı ve 3/4 kapağı yoksayarsın. Saldırı atışı ile hasarlı bir cantrip öğrenirsin."
    },
    {
        name: "Tavern Brawler", name_tr: "Meyhane Kavgacısı",
        desc_tr: "STR veya CON +1. Silahsız vuruşlarında yeterlilik. Silahsız/doğaçlama silah isabeti sonrası bonus aksiyonla tutabilirsin."
    },
    {
        name: "Tough", name_tr: "Güçlü",
        desc_tr: "Maksimum HP her seviye için 2 artar (mevcut ve gelecek seviyeler)."
    },
    {
        name: "War Caster", name_tr: "Savaş Büyücüsü",
        desc_tr: "Önkoşul: En az 1 büyü. Konsantrasyon save'lerine avantaj. Elde silah/kalkan varken Somatic component kullanabilirsin. Fırsat saldırısı yerine 1 aksiyonluk büyü yapabilirsin."
    },
    {
        name: "Weapon Master", name_tr: "Silah Ustası",
        desc_tr: "STR veya DEX +1. 4 silah üzerinde yeterlilik kazanırsın."
    },
    {
        name: "War Caster", name_tr: "Savaş Büyücüsü",
        desc_tr: "Önkoşul: Büyü yapabilme yeteneği. Konsantrasyon koruma için CON save'lerine avantaj. Elde silah veya kalkan varken Somatic componentler kullanabilirsin. Fırsat saldırısı yerine 1 aksiyonluk büyü kullanabilirsin."
    },
    {
        name: "Warcaster", name_tr: "Savaş Büyücüsü",
        desc_tr: "Büyü yapma yeteneği gerektiren bu feat, konsantrasyon save'lerine avantaj sağlar."
    },
    {
        name: "Fade Away", name_tr: "Soluklaşma",
        desc_tr: "Önkoşul: Gnome. INT veya DEX +1. Hasar aldığında reaksiyon ile görünmez olabilirsin (bir tur veya saldırı/hasar yapana kadar). Uzun dinlenmede 1 kullanım."
    },
    {
        name: "Fey Teleportation", name_tr: "Peri Işınlanması",
        desc_tr: "Önkoşul: Elf. INT veya CHA +1. Sylvan dilini öğrenirsin. 1/kısa dinlenme: Misty Step büyüsü yapabilirsin."
    },
    {
        name: "Dragon Fear", name_tr: "Ejderha Korkusu",
        desc_tr: "Önkoşul: Dragonborn. STR, CON veya CHA +1. Breath Weapon yerine korkutucu çığlık: 30 ft koni, WIS DC = 8 + prof + CHA, başarısız olunca 1 dakika frightened."
    },
    {
        name: "Infernal Constitution", name_tr: "Cehennem Anayasası",
        desc_tr: "Önkoşul: Tiefling. CON +1. Soğuk, ateş ve zehir direnci. Zehir kurtarma atışlarına avantaj."
    },
    {
        name: "Orcish Fury", name_tr: "Ork Öfkesi",
        desc_tr: "Önkoşul: Half-Orc. STR veya CON +1. Hasar zarını bir kez yeniden at. 0 HP'de Relentless Endurance kullanınca bir saldırı yapabilirsin (reaksiyon)."
    },
    {
        name: "Second Chance", name_tr: "İkinci Şans",
        desc_tr: "Önkoşul: Halfling. DEX, CON veya CHA +1. Bir yaratık sana isabet ettiğinde reaksiyon ile yeniden atmasını sağlayabilirsin. Kısa/uzun dinlenmede yenilenir."
    },
    {
        name: "Squat Nimbleness", name_tr: "Küçük Çeviklik",
        desc_tr: "Önkoşul: Dwarf veya Small yaratık. STR veya DEX +1. +5 ft hareket hızı. Atletizm veya Akrobasi'de yeterlilik ve o kontrolde avantaj. Yaratıkların alanından geçmek artık kısıtlamaz."
    },
    {
        name: "Elven Accuracy", name_tr: "Elf Hassasiyeti",
        desc_tr: "Önkoşul: Elf veya Half-Elf. DEX, INT, WIS veya CHA +1. DEX/INT/WIS/CHA kullanarak avantajlı saldırı yaptığında üç zar atıp en yükseği seçersin."
    },
    {
        name: "Flames of Phlegethos", name_tr: "Cehennnem Alevleri",
        desc_tr: "Önkoşul: Tiefling. INT veya CHA +1. Ateş zarlarını yeniden atabilirsin. Ateş büyüsü attıktan sonra bir tur boyunca 5 ft çevrendekiler 1d4 ateş hasarı alır."
    },
    {
        name: "Bountiful Luck", name_tr: "Bol Şans",
        desc_tr: "Önkoşul: Halfling. Bir arkadaşın d20'de 1 attığında reaksiyon ile ona Lucky kullanabilirsin (kendi puanını harcamadan)."
    },
    {
        name: "Prodigy", name_tr: "Deha",
        desc_tr: "Önkoşul: Human, Half-Orc veya Half-Elf. Bir beceri, bir araç seti ve bir dil öğrenirsin. Seçilen beceri için uzmanlık kazanırsın."
    },
    {
        name: "Dungeon Delver", name_tr: "Zindan Kaşifi",
        desc_tr: "Gizli kapıları aramak, tuzakları tespit/etkisizleştirmek için avantaj. Tuzak hasarına DEX save avantajı. Dikkatli arama hızını düşürmez."
    },
    {
        name: "Telekinetic", name_tr: "Telekinetik",
        desc_tr: "INT, WIS veya CHA +1. Mage Hand cantrip öğrenirsin (görünmez el). Bonus aksiyon ile 5 ft itme/çekme yapabilirsin (STR DC: 8 + prof + özellik modi)."
    },
    {
        name: "Telepathic", name_tr: "Telepatik",
        desc_tr: "INT, WIS veya CHA +1. 60 ft tüm anlaşılabilir dillerde zihinsel iletişim. Detect Thoughts büyüsü (1/uzun dinlenme). Aldatma/Sezgi yeteneklerinde avantaj."
    },
    {
        name: "Poisoner", name_tr: "Zehirci",
        desc_tr: "Zehirci Kit yeterliliği. Bonus aksiyon ile silah veya ok zehirle kaplanır: +2d8 zehir hasarı (1 dk). Zehir Direnci. Zehir hasarını yoksayan yaratıklara karşı CON save."
    },
    {
        name: "Fighting Initiate", name_tr: "Savaş Başlangıcı",
        desc_tr: "Önkoşul: Silah yeterliliği. Savaşçı sınıfından bir Fighting Style öğrenirsin. Sadece bir tane öğrenebilirsin (mevcut değiştirilemez)."
    },
    {
        name: "Crusher", name_tr: "Ezici",
        desc_tr: "STR veya CON +1. Künt hasarlı saldırıda bonus aksiyon olmaksızın 5 ft itme. Kritik vuruşta tüm saldırganlar bir tur için o yaratığa karşı avantaj kazanır."
    },
    {
        name: "Piercer", name_tr: "Delici",
        desc_tr: "STR veya DEX +1. Delme hasarlı isabette bir zarı yeniden at (yüksek seçim). Kritik vuruşta bir ekstra hasar zarı at."
    },
    {
        name: "Slasher", name_tr: "Parçalayıcı",
        desc_tr: "STR veya DEX +1. Kesme hasarlı isabette hareket hızını 10 ft azaltırsın. Kritik vuruşta bir tur boyunca saldırı atışlarına dezavantaj."
    },
    {
        name: "Skill Expert", name_tr: "Beceri Uzmanı",
        desc_tr: "Herhangi bir istatistik +1. Bir beceri yeterliliği ve mevcut/yeni bir beceri için uzmanlık kazanırsın."
    },
];
