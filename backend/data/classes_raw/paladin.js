module.exports = {
    name: "Paladin",
    hit_die: "d10",
    primary_ability: "Strength & Charisma",
    saves: ["Wisdom", "Charisma"],
    armor_proficiencies: ["All Armor", "Shields"],
    weapon_proficiencies: ["Simple Weapons", "Martial Weapons"],
    description_tr: "Kutsal bir yemine(Oath) hayatını adamış, adalet, intikam veya koruyuculuk peşinde koşan; muazzam kritik hasarı olan kutsal güç şövalyeleri.",
    subclass_unlock_level: 3,
    features: [
        { level: 1, name: "Divine Sense", desc_tr: "Eylem harcayarak 60 feet içindeki tüm Melek (Celestial), İblis (Fiend) veya Ölümsüz (Undead) varlıkların yerini duvarların arkasından dahi sezebilirsin (Karizma modülün kadar kullanım)." },
        { level: 1, name: "Lay on Hands", desc_tr: "Kutsal dokunuşla vücutları onar. Kendi iyileştirme havuzun (Seviye x 5) kadar HP barındırır. Dokunduğun canlıya havuzdan dilediğin kadar can aktarabilir, 5 puan harcayarak 1 Hastalığı veya Zehri bedavadan silebilirsin." },
        { level: 2, name: "Fighting Style", desc_tr: "Dövüş Stili Seçersin: Defense (+1 AC), Dueling (+2 Tek El Silah Hasarı), Great Weapon Fighting (Çift elli kılıçta 1 veya 2 gelen hasar zarlarını baştan atma şansı), Protection (Yanındaki dosta kalkan olma) veya Blessed Warrior (2 Ruhban Cantrip'i)." },
        { level: 2, name: "Spellcasting", desc_tr: "Karizma (Charisma) yeteneğini kullanarak kutsal Paladin Büyüleri kullanmaya başlarsın." },
        { level: 2, name: "Divine Smite", desc_tr: "Paladin'in İmza Yeteneği! Bir düşmana kılıçla (veya melee ile) İSABET ettirdiğinde SADECE O GÜN, o vuruşta 1 Büyü Slotu yakarak saldırıya Işıyan (Radiant) Hasar eklersin! Slot başına 2d8 ile başlar, hedefin ölülere aitse ekstra 1d8 daha vurur. Kritiklerde (zarx2) olduğu için en korkulu hasardır." },
        { level: 3, name: "Divine Health", desc_tr: "İçindeki kutsal yaşam enerjisi nedeniyle Mistik ve doğal hiçbir Hastalığa (Disease) asla yakalanmazsın (Kalıcı Bağışıklık)." },
        { level: 3, name: "Sacred Oath", desc_tr: "Seni gerçek bir Paladin yapan Yemini (Subclass) seçersin (Örn: Vengeance, Devotion). Bu sana bedava kalıcı Büyüler ve Channel Divinity (İlahi Yansıma - Kısa restte 1 Kez Kullanılan Güç) verir." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat seç." },
        { level: 5, name: "Extra Attack", desc_tr: "Saldırı Eylemi (Attack Action) aldığında 1 yerine sırasıyla 2 vuruş atma hakkı kazanırsın." },
        { level: 6, name: "Aura of Protection", desc_tr: "Oyundaki en güçlü destek aurası! Sana veya 10 Feet yakınında duran DOSTLARINA yapılan tüm SAVING THROW'lara (Kurtarma Zarları - Örn alevden kaçma) otomatik olarak SENİN KARİZMA (Cha) BONUSUN KADAR EK Puan gelir!" },
        { level: 7, name: "Oath Feature", desc_tr: "Seçtiğin Yeminden (Subclass) aurana ek olarak gelen özel aura eklentisi." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat seç." },
        { level: 10, name: "Aura of Courage", desc_tr: "Korkular silinir! Sen ve senin 10 feet etrafındaki dostlarına hiçbir canavar Korku (Frightened) Efekti veremez. Korka bağışıklık aurası yayarsın." },
        { level: 11, name: "Improved Divine Smite", desc_tr: "Artık yaptığın BÜTÜN Yakın Dövüşe ait silah vuruşlarına (Slot harcamaya VEYA Smite etmeye gerek olmadan) kendiliğinden 1d8 Işıyan (Radiant) ekstra hasar eklenir!" },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat al." },
        { level: 14, name: "Cleansing Touch", desc_tr: "Kutlu dokunuş! Kendi üzerinde (Veya bir dostta) AKTİF halde duran kötücül bir büyü / lanet / debuff varsa Eylemle bunu doğrudan Silip Atarsın (Dispel Magic gibi çalışır, Karizma modülün kadar kullanımı vardır)." },
        { level: 15, name: "Oath Feature", desc_tr: "Seçtiğin Yeminden gelen özellikler." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat al." },
        { level: 18, name: "Aura Improvements", desc_tr: "Muazzam menzil! Tüm Paladin Auralarının (Protection, Courage ve Subclass) etki alanı 10 feet'ten devasa bir şekilde 30 FEET'E genişler. Sahadaki herkesi etki altına alırsın." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu artır veya Feat al." },
        { level: 20, name: "Oath Feature", desc_tr: "Seçtiğin Yeminin En Üst Formu (1 dakika boyunca Avatar Haline girdiğin Nihai Form)." }
    ],
    subclasses: [
        {
            name: "Oath of Devotion",
            description_tr: "İyiliğin, adalet, merhamet ve dürüstlüğün en saf beyaz şövalyeleri; Şeytanların baş düşmanı ve köylülerin koruyucuları.",
            features: [
                { level: 3, name: "Channel Divinity: Sacred Weapon", desc_tr: "Kısa restte 1 Kez. Silahını parlak, güneş gibi bir İlahi Işıkla Kutsarsın! 1 Dakika boyunca ATAK ZARLARINA (Vuruş İsabetlerine) Karizma (Cha) Puanın otomatik olarak eklenir ve iska atman imkansızlaşır." },
                { level: 3, name: "Channel Divinity: Turn the Unholy", desc_tr: "30 Feet etrafındaki tüm Ölümsüzleri (Undead) veya İblisleri (Fiend) uzağa Sürersin! Wis (Bilgelik) Kurtarma zarı atamayanlar senden 1 dakika boyunca korkarak kaçarlar." },
                { level: 7, name: "Aura of Devotion", desc_tr: "Aurana katılan eklenti: Sana ve senin etki alanındaki takım arkadaşlarına karşı 'Cezbedilme / Aşka Düşme' (Charmed) etkilerine MUTLAK BAĞIŞIKLIK kazandırır." },
                { level: 15, name: "Purity of Spirit", desc_tr: "Protection from Evil and Good büyüsünün etkisini sürekli kalıcı olarak pasif kazanırsın! Karşına çıkan herhangi bir Undead (Zombi) veya Fiend (İblis) SANA VURURKEN saldırı zarları daima DEZAVANTAJLI atılır!" },
                { level: 20, name: "Holy Nimbus", desc_tr: "Eylem ile 1 dakika Güneş'in Avatarı olursun. Çevrendeki (30FT) tüm düşmanlar turlarına başladığında sormadan 10 Işıyan (Radiant) hasar yer. Onlarla savaşırken atacağın tüm kurtarmalara (Saving Throws) AVANTAJ sağlarsın." }
            ]
        },
        {
            name: "Oath of the Ancients",
            description_tr: "Ormanın, yaşamın parıltısını ve evreni koruyan kadim yeşil şövalyeler. Doğanın yıkılmaz engin kalkanlarıdır.",
            features: [
                { level: 3, name: "Channel Divinity: Nature's Wrath", desc_tr: "Kısa Restte 1 Kez. Doğanın gazabını hedefe savur! 10 feet içinde bir Düşman eğer Str/Dex zarı tutturamazsa köklerle Sarmaşıklanır VEYA Restrained (Yere sabitlenip hareket edemez/dezavantaj yer) olur." },
                { level: 3, name: "Channel Divinity: Turn the Faithless", desc_tr: "Düşman Perileri (Fey) ve İblisleri (Fiend/Demon) ışığınla kovup korkutursun. Ayrıca etrafında GÖRÜNMEZ gizlenen yaratıkların bu korku sırasında gerçek şekillerini ortaya dökersin!" },
                { level: 7, name: "Aura of Warding", desc_tr: "DND'NİN EN İYİ ANTİ BÜYÜCÜ AURASI: Senin ve AURANIN içindeki müttefiklerin Üzerinize KULLANILAN (Fireball gibi hasar vuran) BÜTÜN BÜYÜLERDEN (SPELL) ALACAĞINIZ HASAR YARIYA BÖLÜNÜR (Resistance)!" },
                { level: 15, name: "Undying Sentinel", desc_tr: "Ormanın Ruhu bitmez. Eğer savaştayken canın TAMAMEN 0'A İNERSE(Ölümcül darbe alsan bile), O vurusta bayılmak Şartı yerine anında 1 CANLA AYAKTA kalırsın (Günde 1 kez). Ayrıca hiç yaşlanmazsın." },
                { level: 20, name: "Elder Champion", desc_tr: "Doğanın Avatarı Formu (1 Dk). 1. Leveliniz altındaki Tüm Paladin büyülerinizi Eylem istemeden BONUS EYLEMLE anında dökebilirsiniz. 2. Etrafınızdakiler büyü atmadan hemen önce DEZAVANTAJLA engellenir. 3. Her turun başında kendini doğrudan 10 HP İyileştirirsin." }
            ]
        },
        {
            name: "Oath of Vengeance",
            description_tr: "Adaleti veya cezayı kendi elleriyle getirmeye yemin etmiş, affı söküp atmış karanlık ve ölümcül intikam şövalyeleri.",
            features: [
                { level: 3, name: "Channel Divinity: Abjure Enemy", desc_tr: "Silahını doğrultup tek bir hedefe dehşet saçarsın (Hedef Fiend Veya Undeadse Avantajsız kurtulamaz). Kurtulursa hızı %50 düşer, Kurtulamazsa hedefin hızı 1 dakika boyunca TAMAMEN SIFIR OLUR! Ve Korku (Frightened) yer." },
                { level: 3, name: "Channel Divinity: Vow of Enmity", desc_tr: "Bir adama İntikam Yemini (Vow) mühürlersin. 1 DAKİKA BOYUNCA o adama savuracağın BÜTÜN SALDIRI İSABET ZARLARINI OTOMATİKMAN AVANTAJLA (Advantage) atarsın! Bossları eritmek için kusursuzdur." },
                { level: 7, name: "Relentless Avenger", desc_tr: "Fırsatını kaçırmaz. Bir adam senden kaçarken Fırsat Saldırısı (Opportunity Attack) yaptığına İsabet Ettirirsen Üstüne hızının yariıs kadar adamın peşinden BEDAVADAN (Fırsat saldırısı kışkırtmadan) adama sürüklenir/kovalarsın." },
                { level: 15, name: "Soul of Vengeance", desc_tr: "Senin mühürlediğin Vow Düşmanı (İntikam Yemini hedefin) o tur eğer SANA karşı bir Atak yaparsa, sen O atışı alır almaz Adama BONUS olarak Kılıcını savurup Reaksiyonunla KARŞILIK verir, ektra hasar çakarsın!" },
                { level: 20, name: "Avenging Angel", desc_tr: "1 Saatlik İntikam Meleği Formu! Sırtından kanatlar çıkarıp UÇMA hızı kazanırsın. Üstelik sana (veya 30 ft aurana) GİREN herkes senin görkeminle Mistik Dehşete (Frightened - Korku ve Kaçış) uğrar; onlara Atılan zarlarınız (Seninkiler) Onlara Karşı OTOMATİK AVANTAJLI atılır." }
            ]
        },
        {
            name: "Oath of Conquest",
            description_tr: "Onurun veya iyiliğin değil, savaşta mutlak korkunun, dominasyonun ve düşmanı acımasızca ezerek yönetmenin savaş lordları.",
            features: [
                { level: 3, name: "Channel Divinity: Conquering Presence", desc_tr: "Savaşa bir tehdit narasıyla gir! Çevrendeki (30FT) herkes Wis Save (Kurtarma zarı) atamazsa Senden FRIGHTENED (Korkuya kapılır). Sana vuramayacak şekilde korkudan sinerler!" },
                { level: 3, name: "Channel Divinity: Guided Strike", desc_tr: "Eğer saldırı zarın düşmanı kıl payı ıskalayacaksa anında KARAR VERİP Atışını (İsabet Zarını) Şaşmaz bir isabetle +10 EKLERSİN! Kesin tutan smite saldırısını garantiye alırsın." },
                { level: 7, name: "Aura of Conquest", desc_tr: "KORKU Aurası! Eğer bir düşman Senden KORKUYOR (Frightened) İse, ve senin aurana girerse HIZI ANINDA 0 OLUR, donup kalır! VE her turun başında korkudan felç olduğu için Paladin Seviyenin Yarısı Kadar KİLİT/PSİŞİK Hasarı Bedava alır!" },
                { level: 15, name: "Scornful Rebuke", desc_tr: "Seni Yaralayan Bedelini Öder! Artık bir savaşta Biri SANA hasar vuran her Yakın Dövüşe ait (Melee) Silah kullanan düşman(Kendiliğinden Hiçbir Reaksiyon harcamana gerek kalmadan!) ANINDA Senin Karizma Modülün (Cha) Kadar Psişik hasarı onlara Geri Yansıtır!" },
                { level: 20, name: "Invincible Conqueror", desc_tr: "Yenilmez Lider! 1 Dakikalık Form. Tüm fiziksel silahlara Topyekün DİRENÇLİ (Resistance-Yarım Hasar Yeme) olursun! Her turda bir Ekstra Saldırı (Attack Eyleminde 3 Vuruş) atarsın! Üstüne Kılıç zarların artık (Sadece 20 ile DEĞİL) 19 Veya 20 gelirse OTO Kritik Sayılır!" }
            ]
        },
        {
            name: "Oath of Glory",
            description_tr: "Zafere, kahramanlığa ve destansı öykülere inanan, bedensel mükemmeliyete ulaşan (Herkül gibi) cüsseli, hız abidesi şovmen şövalyeler.",
            features: [
                { level: 3, name: "Channel Divinity: Peerless Athlete", desc_tr: "10 Dakikalık Sporcu Formu! Güçle Alakalı (Atletizm ve Akrobasi) Zarlarına AVANTAJ Alısın... Zıplama mesafen Düz veya Uzun olarak +10 FEET Artar ve Taşıma/İtme (Maksimum Kilo Kapasiten) DOĞRUDAN İkiye Katlanır (Heykelleri Kaldırırsın)." },
                { level: 3, name: "Channel Divinity: Inspiring Smite", desc_tr: "Bir düşmana İLAHİ(Smite) vurduğunda Savaş alanından Bonus Eylem ile Tüm TAKIMDAKİ 4 Kişiye Geçici CAn (Temp Hp) Fırlatırsın (Alandaki dostlara Karizma + Paladin Seviyen kadar can dağıtılır)." },
                { level: 7, name: "Aura of Alacrity", desc_tr: "Hız Aurası! Seni ve Senin AUranda Dolaşan BÜTÜN DOSTLARINI Coşturarak 10 FEETLİK Topyekün İlave Ekstra (Movement Türü) KOŞU HIZl (Speed) Katar!" },
                { level: 15, name: "Glorious Defense", desc_tr: "Senin yanından geçen bir ATAK İsabet etmeye çalıştığında (Sana Veya Aurandaki Dostuna),! EĞER Vuracak adamı engellemek istersen REAKSİYON İle Zırhına (AC'ye) KARİZMA(Cha) Puanını Bonus Ekleyerek darbeyi BOŞA ÇIKARTIRSIN. EĞER MİSS(IskalarSa).... Anında Düşmana BEDAVA BiR Kılıç Tokadı Savurursun!" },
                { level: 20, name: "Living Legend", desc_tr: "Gerçek Bir Efsane / Kahraman Formu (1 DK Sürer). Sen tüm Charisma İle atılacak zarlarna AVANTAJLISIN. Eğer takım arkdşlrından biri ATAK Vurunca MİSSLER(Iskalarsa)... REAKSİYONLA ONUN Iska Zarını TUTMUŞ Gİbi Baştan Reroll attırırsın!" }
            ]
        },
        {
            name: "Oath of the Open Sea",
            description_tr: "Okyanusların serbest ruhunu, dalgaların özgürlüğünü ve keşifin heyecanını kutsal bilen, deniz kadar sınır tanımayan denizci şövalyeler (homebrew/popular variant).",
            features: [
                { level: 3, name: "Oath Spells", desc_tr: "Denizcilik büyüleri otomatik hazırlı gelir: Create or Destroy Water, Fog Cloud, Gust of Wind, Misty Step, Call Lightning, Sleet Storm, Control Water, Freedom of Movement, Commune with Nature, Conjure Elemental." },
                { level: 3, name: "Channel Divinity: Marine Layer", desc_tr: "Etrafına (Wisdom modifierin kadar) kalın, gizemli bir sis perdesi yayıp; tüm içeridekilerin (Senin ve dostlarının) görüşünü engeller ama KENDİLERİ HER ŞEYI GÖRÜR! Düşman, içeride kimin nerede olduğunu bilemez." },
                { level: 3, name: "Channel Divinity: Fury of the Tides", desc_tr: "1 Dakika boyunca her saldırın sonrası hedefi 10 feet geri itebilirsin (Str Save tutturmazsa). Düşmanı uçuruma atabilir ya da müttefiklerden uzaklaştırabilirsin." },
                { level: 7, name: "Aura of Liberation", desc_tr: "Senin ve 10 feet etrafındaki Tüm müttefiklerin hiçbir büyüden SITKIŞTIRILAMAZ, bağlanamaz veya Grappled duruma düşürülemez. Ayrıca yüzme hızın Yürüme Hızına eşit olur." },
                { level: 15, name: "Stormy Waters", desc_tr: "Sana 5 feet içinden geçen HERHANGİ BİR DÜŞMAN, reaksiyonunla derhal 1d12 + Str Hasar yiyip geri itilir (Feda gerektirmez, pasif suları savar)." },
                { level: 20, name: "Mythic Swashbuckler", desc_tr: "Son Maceraci! Bir aksiyon buutonu ile 1 dakika boyunca mükemmel denizci formuna girersin: Duvarları tırmansın, üzerinde olduğun su üzerinde koşun, ve rakiplerinle mükemmel duello yap (saldırı zarına Cha ekle ve karşı tarafın Opportunity Saldırı hakkını sıfırla)." }
            ]
        }
    ]
};
