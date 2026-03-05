module.exports = {
    name: "Wizard",
    hit_die: "d6",
    primary_ability: "Intelligence",
    saves: ["Intelligence", "Wisdom"],
    armor_proficiencies: ["None"],
    weapon_proficiencies: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light Crossbows"],
    description_tr: "Büyüyü kanında taşımak yerine sırlarını yıllarca kitaplardan çalışarak öğrenen, D&D evreninin en geniş büyü (Spellbook) havuzuna sahip usta arcanistler.",
    subclass_unlock_level: 2,
    features: [
        { level: 1, name: "Spellcasting", desc_tr: "Intelligence (Zeka) kullanarak devasa büyü kitabından (Spellbook) hazırladığın spells'leri kullanırsın. Dünyadaki parşömenleri (Scroll) bulup para ve zaman harcayarak kitabına KOPYALAYABİLİRSİN!" },
        { level: 1, name: "Arcane Recovery", desc_tr: "Kısa rest(Short Rest) sırasında Büyü kitabını okuyarak, Seviyenin YARISI(Yuvarlak üst) KADAR Harcanmış Büyü Slotunu Geri kazanırsın(Örn Lvl 4 büyücü 2 Lvl'lık slotları bedava geri alır)." },
        { level: 2, name: "Arcane Tradition", desc_tr: "Çalıştığın üniversite veya Sihir okulunu(Subclass) seçersin. (Örn: Abjuration-Korunma, Evocation-Yıkım, Necromancy-Ölüm gibi temel okullar). Seçtiğin okuldaki büyüleri kitabına yazmak Yarı Yarıya (Zaman ve Para) ucuzlar." },
        { level: 3, name: "Cantrip Formulas (Optional TCoE)", desc_tr: "Her Uzun Rest'ten sonra, bildiğin bir Wizard cantrip'ini, Wizard listesindeki başka bir cantrip ile değiştirebilirsin." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu (Ability Score) 2 artırabilir veya iki farklı yeteneği 1'er artırabilirsin (Maksimum 20). Alternatif olarak bir Feat seçebilirsin." },
        { level: 6, name: "Arcane Tradition Feature", desc_tr: "Seçtiğin sihir okulundan (Subclass) yeni bir özellik gelir." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat." },
        { level: 10, name: "Arcane Tradition Feature", desc_tr: "Seçtiğin sihir okulundan (Subclass) özellik alırsın." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat." },
        { level: 14, name: "Arcane Tradition Feature", desc_tr: "Seçtiğin okulun (Subclass) EN ÜST uzmanlık özelliği açılır." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat." },
        { level: 18, name: "Spell Mastery", desc_tr: "Ustalığın Zirvesi! Büyü kitabından 1 tane Seviye-1(Lvl 1) VE 1 tane Seviye-2(Lvl 2) Büyü SEÇ!. Seçtiğin bu 2 büyü ömrün boyunca HİÇ SLOT HARCAMADAN (BEDAVA!) sınırsız mana ile otomatik atılabilir (Mage Armor, Shield, Misty Step vb. harika olur)." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat." },
        { level: 20, name: "Signature Spells", desc_tr: "İmza Büyülerin! Büyü kitabından iki tane Seviye-3 (Lvl 3) büyü seç. Bunları her Kısa veya Uzun restte 1 Kere hiç Slot yakmadan BEDAVAYA atabilirsin (Ayrıca her zaman hazırlanmış sayılırlar)!" }
    ],
    subclasses: [
        {
            name: "School of Evocation",
            description_tr: "Saf yıkım, ateş topları (Fireball), yıldırımlar ve enerji dondurmalarında uzmanlaşan; hasar odaklı savaş büyücüleri (Player's Handbook).",
            features: [
                { level: 2, name: "Evocation Savant", desc_tr: "Evocation (Yıkım) büyülerini kitabına yazmak yarı yarıya ucuzlar." },
                { level: 2, name: "Sculpt Spells", desc_tr: "Dostlara ZARAR YOK! Bir Evocation büyüsü attığında (Örn Fireball), o alanın içinde kalan dostlarını koruyabilirsin (1 + Büyünün seviyesi kadar kişiyi). O kişiler otomatik save tutar ve HİÇ hasar almazlar." },
                { level: 6, name: "Potent Cantrip", desc_tr: "Senin Evocation Cantrip'lerinde düşman Save zarını tuttursa bile, hiç hasar almamak yerine (Yarı yarıya) Hasar yer." },
                { level: 10, name: "Empowered Evocation", desc_tr: "Evocation büyüleri ile vurduğun hasar zarlarına Intelligence Modifier'ını eklersin." },
                { level: 14, name: "Overchannel", desc_tr: "Seviye 1'den 5'e kadar olan herhangi bir Evocation büyüsünde (MAX HASAR) garantile! (Örn 8d6 zar atmak yerine direkt 48 vur!). Bunu ilk kez bedava yaparsın, aynı gün içinde tekrar yaparsan kendine feci necrotic hasarlar vermeye başlarsın." }
            ]
        },
        {
            name: "School of Abjuration",
            description_tr: "Kalkanlar (Shield), koruma çemberleri ve Counterspell(Büyü bozma) gibi savunma büyülerini mükemmelleştirip takımı hayatta tutan sihirbazlar (Player's Handbook).",
            features: [
                { level: 2, name: "Abjuration Savant", desc_tr: "Abjuration (Korunma) büyülerini kitabına yazmak yarı yarıya ucuzlar." },
                { level: 2, name: "Arcane Ward", desc_tr: "Bir Abjuration büyüsü attığında (Örn Mage Armor, Shield), etrafında mistik bir Kalkan (Ward) oluşur. Kalkanın Canı = (Wizard Level x 2) + Int Mod. Sen hasar alınca önce kalkan erir (Sana HP gibi davranır). Kalkanın canı sıfırlanırsa sen hasar almaya başlarsın. Abjuration büyüsü attıkça kalkan iyileşir." },
                { level: 6, name: "Projected Ward", desc_tr: "30 ft içindeki bir müttefikin hasar aldığında, Reaksiyon atarak Kalkanını (Arcane Ward) ona yollayıp hasarı kalkanından düşürtebilirsin." },
                { level: 10, name: "Improved Abjuration", desc_tr: "Büyü bozma(Counterspell) ve Büyü silme(Dispel Magic) attığında, atacağın yetenek zarına Proficiency Bonusunu eklersin! Büyü bozmada en büyük ustasın." },
                { level: 14, name: "Spell Resistance", desc_tr: "Adamın dibi oldun! Atılan BÜTÜN Büyülü etkilere ve Büyü hasarlarına karşı Zarlarında AVANTAJ kazanırsın, ayrıca büyü hasarlarına karşı Çift Direnç (Resistance) sahibi olursun (Hasarı hep yarı yersin)." }
            ]
        },
        {
            name: "School of Necromancy",
            description_tr: "Canlıların enerjisini emerek ölüleri (Zombi, İskelet vs) diriltip kendi ordusunu kurmayı hedefleyen ölüm okulu bilginleri (Player's Handbook).",
            features: [
                { level: 2, name: "Necromancy Savant", desc_tr: "Necromancy büyülerini kitabına yazmak yarı yarıya ucuzlar." },
                { level: 2, name: "Grim Harvest", desc_tr: "Bir düşmanı Seviye-1 veya daha yüksek bir büyüyle öldürdüğünde, büyünün seviyesi x 2 kadar (Eğer büyü Necromancy ise seviye x 3 kadar) HP kazanırsın." },
                { level: 6, name: "Undead Thralls", desc_tr: "Animate Dead (Ölü diriltme) büyüsünü bedava öğrenirsin! Bu büyüyü attığında 1 yerine 2 ceset kaldırırsın. Kalkan iskelet veya zombilerinin Maximum HP'sine senin WIZARD LEVELİN eklenir, vuruş hasarlarına ise Proficiency Bonusun eklenir (Zombilerin Çok Güçlü olur)." },
                { level: 10, name: "Inured to Undeath", desc_tr: "Maximum HP limitin asla küçültülemez (Vampir ısırıkları vs). Ayrıca Necrotic (Ölümcül) hasarlara karşı Direnç (Resistance) kazanırsın." },
                { level: 14, name: "Command Undead", desc_tr: "Başka birinin yarattığı veya vahşi olan bir UNDEAD'i (Zombi, Mumya vb.) kontrolün altına alabilirsin (Cha Save atar). Eğer zekası çok düşükse sonsuza dek senin esirin olur." }
            ]
        },
        {
            name: "School of Divination",
            description_tr: "Gelecekteki ihtimalleri görebilen, zar sonuçlarını önceden bilip kaderi baştan yazabilen kehanet büyücüleri (Player's Handbook).",
            features: [
                { level: 2, name: "Divination Savant", desc_tr: "Divination (Kehanet) büyülerini kitabına yazmak yarı yarıya ucuzlar." },
                { level: 2, name: "Portent", desc_tr: "Oyunun en güçlü Kader bükmesi! Her uzun rest sonrası 2 TANE D20 Zar at (Zarlar kaç gelirse not et). O gün boyunca; senin, bir müttefikinin veya BİR DÜŞMANININ attığı HERHANGİ BİR zarı iptal edip, YERİNE Sabah attığın not ettiğin zarlardan birini Koyabilirsin! (Düşman sana mükemmel vurduğunda, zarını iptal edip yerine sabah attığın '2' zarını koyup Iskalamasını sağlarsın!)." },
                { level: 6, name: "Expert Divination", desc_tr: "Bir Kehanet(Divination) büyüsü attığında, harcadığın slotun 1 Düşüğü seviyesindeki Büyü Slotunu geri kazanırsın (Böylece habire kehanet atabilirsin)." },
                { level: 10, name: "The Third Eye", desc_tr: "Action harcayarak 3 Gözünü aç (Rest'e kadar sürer): Darkvision(60ft), Ethereal Sight(60ft Ruhlar Alemini görme), Görünmezlik(Invisibility) Görebilme veya Okuma(Read Her Dili anlama) özelliklerinden birini seçersin." },
                { level: 14, name: "Greater Portent", desc_tr: "Sabahları attığın Portent zarlarının (Kader Zarı) sayısı 2'den 3'e Çıkar!" }
            ]
        },
        {
            name: "Bladesinging",
            description_tr: "Sadece uzaktan büyü atmak yerine elinde ince kılıçla savaşın ortasına dalan, Elf şarkılarıyla efsanevi bir yakın dövüş (Melee) dansına (Bladesong) giren savaşçı büyücüler (SCAG / TCoE).",
            features: [
                { level: 2, name: "Training in War and Song", desc_tr: "Light Armor (Hafif Zırh) ve 1 adet Tek elli Melee Silah (Örn: Rapier, Shortsword) uzmanlığı kazanırsın. Ayrıca Performance skill'inde ustalaşırsın." },
                { level: 2, name: "Bladesong", desc_tr: "1 Dakika süren Kılıç Dansına (Bladesong) girersin (Bonus eylemle). Bu formdayken: 1) Zırh Sınıfına (AC) Intelligence Modifier'ın Eklenir. 2) Yürüme hızın 10 feet artar. 3) Akrobasi zarlarında Avantaj kazanırsın. 4) Concentration zarlarında INT mod eklenir. (Sadece hafif zırhlı ve kalkan takmıyorken çalışır)." },
                { level: 6, name: "Extra Attack", desc_tr: "Kendi turunda Attack Action kullandığında 2 kere kılıç sallayabilirsin. DAHA DA İYİSİ: Bu saldırılardan BİRİNİ yerine Cantrip büyü (Örn: Booming Blade, Fire Bolt) atabilirsin!" },
                { level: 10, name: "Song of Defense", desc_tr: "Bladesong formundayken hasar aldığında; Reaksiyon kullanarak istediğin seviye BİR BÜYÜ SLOTU YAK (Burn). Yakıtıgn Slot'un seviyesi x 5 kadar Hasarı EMMİŞ ve azaltmış olursun (Büyüyle Can kurtarma)." },
                { level: 14, name: "Song of Victory", desc_tr: "Bladesong aktifken Melee (Yakın dövüş) silah saldırılarının Hasar Zarına Intelligence Modifier'ını Bonus Hasar olarak (Garanti) eklersin." }
            ]
        },
        {
            name: "Order of Scribes",
            description_tr: "Kitapların bizzat kendisine tapan, büyü kitabını akıllı bir ruha (Awakened Spellbook) çevirip, uçan kalemi sayesinde büyülerin element türünü anında değiştirebilen dahi yazıcılar (TCoE).",
            features: [
                { level: 2, name: "Wizardly Quill", desc_tr: "Bonus Action'la sihirli ve mürekkep gerektirmeyen bir tüy kalem çağırırsın. Bu kalemle büyü kitabına parşömen kopyalamak Normalin 12 Katı Daha Hızlı sürer (Dakikalar içinde büyü yazarsın)." },
                { level: 2, name: "Awakened Spellbook", desc_tr: "Büyü kitabın Ruhu olan sihirli bir eşyaya dönüşür (Focus olarak kullanırsın). 1. Kitabını Bonus Eylemle yanına teleport edebilirsin. 2. BÜYÜ TÜRÜ DEĞİŞTİRME: Bir büyü attığında, Kitabında yazılı olan AYNI SEVİYEDEKİ başka bir büyünün Hasar Türünü O büyüye Geçirebilirsin! (Örn: Fireball atacaksın ama adam ateşe dirençli. Kitabında 3. Seviye Vampiric Touch(Necrotic) var => Fireball ateş değil NECROTIC HASAR VURARAK PATLAR!)." },
                { level: 6, name: "Manifest Mind", desc_tr: "Büyü kitabının Ruhunu (Mind) hayalet gibi dışarı çıkarırsın! (60ft uzağa kadar uçar). Savaşta GÖZÜN gibi 60ft Darkvision ile etrafı izler VEEE EN ÖNEMLİSİ: BÜYÜLERİNİ KENDİ YERİNE BU HAYALET KİTABIN OLDUĞU YERDEN FIŞKIRTARAK ATABİLİRSİN! (Sen kayanın arkasında tam gizlisin, ruh kitabın köşeden ateş topu atar)." },
                { level: 10, name: "Master Scrivener", desc_tr: "Uzun dinlenme sonrasında Büyü kitabından Seviye-1 veya Seviye-2 bir büyüyü bir Parşömene (Scroll) Sihirleyebilirsin. Bu parşömeni sen okuduğunda (1 Kere Bedava atılır) Büyünün seviyesi Otomatik 1 Level Üstte Cast Edilir!" },
                { level: 14, name: "One with the Word", desc_tr: "Eğer feci bir hasar alıp ölecek gibi olursan; Reaksiyon atıp Hayalet Kitabının içine ruhsal olarak Kaçarak O Darbeden (0 Hasar Yiyip) kurtulabilirsin! Ancak karşılığında kitabından bir miktar büyük Büyüyü geçici olarak (1d6 gün) Unutursun (Cezalı Kurtuluş)." }
            ]
        },
        {
            name: "School of Conjuration",
            description_tr: "Eşyaları yoksulluktan var eden, yaratıkları başka diyarlardan çağırıp köleleştiren boyut büyücüleri (Player's Handbook).",
            features: [
                { level: 2, name: "Conjuration Savant", desc_tr: "Conjuration (Çağırma) büyülerini kitabına yazmak yarı yarıya ucuzlar." },
                { level: 2, name: "Minor Conjuration", desc_tr: "Action harcayarak elinde 10 pound'a kadar parlayan mistik, cansız bir EŞYA yaratabilirsin (Örn: hançer, levye, anahtar, sandalye). Eşya 1 saat kalır veya sen ona hasar verdiğinde yok olur." },
                { level: 6, name: "Benign Transposition", desc_tr: "Action kullanarak 30 feet'te görebildiğin boş bir karesine IŞINLANIRSIN (Teleport). Ya da seninle gitmeyi kabul eden Küçük veya Orta boy bir yaratıkla (Örn: takım arkadaşı) yer değiştirebilirsin." },
                { level: 10, name: "Focused Conjuration", desc_tr: "Konsantrasyon kalkanı. Bir Conjuration büyüsüne (Örn: Conjure Elemental) konsantre olurken, hasar yediğin için zar atmana (Concentration check) gerek kalmaz. O konsantrasyon asla kırılmaz." },
                { level: 14, name: "Durable Summons", desc_tr: "Conjuration büyüleri ile çağırdığın (Summonladığın) her yaratık, çağrıldığı an anında 30 Geçici Hit Points (Temp HP) kazanarak devasa bir tanklık alır." }
            ]
        },
        {
            name: "School of Enchantment",
            description_tr: "Zihin kontrolü, hipnoz, aşka düşürme ve hafıza silme konusunda uzman, kelimeleriyle krallıkları yıkan yanılsama büyücüleri (Player's Handbook).",
            features: [
                { level: 2, name: "Enchantment Savant", desc_tr: "Enchantment (Efsunlama) büyülerini kitabına yazmak yarı yarıya ucuzlar." },
                { level: 2, name: "Hypnotic Gaze", desc_tr: "Action harcayarak 5 feet yanındaki birinin gözlerine bakarsın (Wis Save). Başarısız olursa büyülenir (Charmed); hızın sıfıra iner ve adam sersemleyip boşluğa dalarak sana vuramaz. Her tur action harcayarak bu transı sürdürebilirsin." },
                { level: 6, name: "Instinctive Charm", desc_tr: "Sana 30 feet içinde saldıran (Atak zarı atan) adama Reaksiyon fırlat! Adam aniden şaşırır ve (Eğer başarısız olursa) senin yerine SENİN YANINDAKİ BAŞKA BİR DOSTUNA/ADAMA Vurmak zorunda kalır (Yani atışı saptırırsın)." },
                { level: 10, name: "Split Enchantment", desc_tr: "Tek hedefli bir Enchantment büyüsü attığında (Örn: Charm Person, Dominate Monster, Hold Monster), o büyüyü BÖLEREK Aynanda İKİ KİŞİYE BİRDEN atabilirsin!" },
                { level: 14, name: "Alter Memories", desc_tr: "Enchantment büyüsü attığın adamlar kendilerine Büyü yapıldığını/Kontrol edildiklerini BİLEMEZLER (Büyü bitince anlamazlar). Ayrıca Charm altındayken onun kafasından (Büyüde geçirdiği süreyi) silip unutturabilirsin, uyanınca hiçbir şey hatırlamaz." }
            ]
        },
        {
            name: "School of Illusion",
            description_tr: "Gerçekliği bir tuval gibi kullanıp şaşırtıcı görseller, sahte sesler ve gerçeküstü halüsinasyonlarla düşmanın algısını oynatan usta illüzyonistler (Player's Handbook).",
            features: [
                { level: 2, name: "Illusion Savant", desc_tr: "Illusion (Göz yanılması) büyülerini kitabına yazmak yarı yarıya ucuzlar." },
                { level: 2, name: "Improved Minor Illusion", desc_tr: "Minor Illusion cantrip'ini ekstra öğrenirsin. Ayrıca bu büyüyü attığında ARTIK AYNI ANDA YARATTIĞIN GÖRÜNTÜYLE Beraber SES DE Çıkarabilirsin (Kükreyen bir aslan hologramı vs)." },
                { level: 6, name: "Malleable Illusions", desc_tr: "Eylem (Action) harcayarak, önceden atmış olduğun ve devamlılık sağlayan bir İllüzyon Büyüsünün şeklini HAREKET ETTİRİP (Kutusunu köpeğe vs) çevirebilirsin; büyüyü bitirip yeniden atmana gerek kalmaz." },
                { level: 10, name: "Illusory Self", desc_tr: "Savaşın ortasında Reaksiyonla SAHTE bir bedenin (Hologram) aniden belirir. Sana gelen ve İSABET EDEN Zarı %100 oranında ISSKALATIR (Kılıç hologramın içinden geçer ve yansıma kaybolur)." },
                { level: 14, name: "Illusory Reality", desc_tr: "İllüzyon büyüleriyle GERÇEKLİĞİ DEĞİŞTİR: Bir seviye/lvl illüzyon büyüsü attığında, yarattığın objelerin SADECE BİRİCİK Cisim kısmını 1 Dakika boyunca (Gerçek, katı bir maddeye) çevirebilirsin! (Sahte İllüzyon Köprüyü geçebilecek kadar sertleştirip Köprü yaparsın)." }
            ]
        },
        {
            name: "School of Transmutation",
            description_tr: "Maddeyi, enerjiyi ve formları değiştirip (polymorph), taşı altına, suyu şaraba çeviren simyacı büyücüler (Player's Handbook).",
            features: [
                { level: 2, name: "Transmutation Savant", desc_tr: "Transmutation (Dönüşüm) büyülerini kitabına yazmak yarı yarıya ucuzlar." },
                { level: 2, name: "Minor Alchemy", desc_tr: "Tahtayı taşa, taşı demire, gümüşü altına dönüştür! (10 dakika harcayarak 1 saatlik geçici bir simya değişimi sağlarsın. Bir masayı gümüş sandırıp satıp kaçabilirsin)." },
                { level: 6, name: "Transmuter's Stone", desc_tr: "Uzun dinlenme bitişinde mistik bir TAŞ yarat. Bu taşı Taşıyan kişi (Sen veya başkası) şu bonuslardan BİRİNİ kullanır: Karanlık Görüş(Darkvision 60ft), Çeviklik (+10 Hız), Constitution(Dayanıklılık) zarlarına Ustalık, Veya (Asit/Soğuk/Ateş/Yıldırım) hasarından birisine Direnç (Resistance)." },
                { level: 10, name: "Shapechanger", desc_tr: "Polymorph büyüsünü kitabına Beleşe eklersin. Kendine (Sadece kendine) dönüştürme atacağın vakit Manna(Slot) harcamadan 1 kere Çevirebilirsin. Ama CR'si/canavarın Gücü Max 1 olan yaratığa dönüşür (Kuş olup uçarak gözlem yapmak için birebirdir)." },
                { level: 14, name: "Master Transmuter", desc_tr: "Transmuter (Simyacı Taşı) Taşını YIKIP PATLATARAK olağanüstü dört güçten birini serbest Bırak: 1. (TAM İYİLEŞTİRME): Taşla Dokunduğun adamı Max HP'ye Fuller ve Tün zehirlerini Siler. 2. (ÖLÜ DİRİLTME): Cast of Raise Dead bedava büyücüde olmamasına rağmen! Ölmüş Dostunu canlandırırsın. 3. (BEDEN GENÇLEŞTİRME): Yaşlanmış Birinin Yaşını saniyeler içinde geri alırsın (Ömür uzatıcı). 4. (DEV CİSİM DÖNÜŞÜMÜ): Devasa (5x5 kargo kutusu büyüklüğünde) tahta veya metalleri başka bir kütleye saniyede dönüştür!" }
            ]
        },
        {
            name: "School of War Magic",
            description_tr: "Abjuration ve Evocation okullarını birleştiren; bir elinde ateş topu fırlatırken diğer eliyle taktiksel zırhını yükselten askeri harp savaş büyücüleri (Xanathar's Guide).",
            features: [
                { level: 2, name: "Arcane Deflection", desc_tr: "Biri sana vurduğunda (Reaksiyonla) koruyucu sihir patlatır ve ZIRHINA (AC) anında +2 eklersin, veya Kurtarma zarına +4 eklersin! (Bir sonraki turuna kadar Sadece Cantrip Eylemi Atma cezası Yersin ama HİÇ zarar Görmekten iyidir)." },
                { level: 2, name: "Tactical Wit", desc_tr: "İnisiyatif (Savaşa Başlama Hız zarlarına) Intelligence (Zeka Puanı Modifieri)'nı da eklersin! Yani Savaş Başlar başlamaz Daima İLK TURLARI Oynayan Sen Olursun (Hızlı Atak)." },
                { level: 6, name: "Power Surge", desc_tr: "Bir büyü (Counter/Dispel magic ile bozulana kdar) Mistik Yük (Power Surge) toplarsın. Büyülerle vurduğun hasarlarına O topladığın yükü Serbest bırakıp Hasarına + Ekstra(Seviyenin Yarısına Eş Değerde GÜÇ hasarı/Force) yedirirsin." },
                { level: 10, name: "Deflecting Shroud", desc_tr: "Arcane Deflection özelliği için Reaksiyon Kalkanını açtığın anda: Etrafında BÜYÜ Patlar! Ve 10 FT etrafındaki (Sensin Seçtiğin 3 Kişiye birden) Anında GÜÇ(Force) hasarı yedirirsin." },
                { level: 14, name: "Durable Magic", desc_tr: "Sırtın Yere gelmez: Concentration (Konsantrasyon=Devamlılık İsteyen) bir sihire Konsantre Olurken. Pasif Olarak (+2 Zırh / Armor Class) ve Kurtarıcı Zarlarına (+2 EK Puan) Savunması Cuk diye gelir." }
            ]
        },
        {
            name: "Chronurgy Magic",
            description_tr: "Zamanın akışını yavaşlatıp donduran, düşmanını stasise sokarak büyü fırlatmayı erteleyen zaman (Dunce) hakimleri savaşçı-büyücüler (Explorer's Guide to Wildemount).",
            features: [
                { level: 2, name: "Chronal Shift", desc_tr: "Günde 2 Kere (Reaction atarak)! Herhangi bir Adama (İste kendin, İste Düşmanın İster DOSTUN OLSUN) Attığı BİR ROLÜ/Zarı tamamen YENİDEN attırmaya Zorlama ve İkinci Zarı Mecburi kılarsın! (Zamanı minikçe Geri sarar iptal edersin)." },
                { level: 2, name: "Temporal Awareness", desc_tr: "İnisiyatifinize Gelen ZAMAN(Kavrama) yetiniz ile (Intelligence - Zeka Modifierınızı) Savaşa başlama sırasındaki zarınıza (Initiative) ilave edersiniz. Çok hızlı vurursunuz." },
                { level: 6, name: "Momentary Stasis", desc_tr: "Action harcayarak 60 feet'teki Yaratığı ZAMAN STASİS'ine (1 Turluk Hapseder Sokar) Hapset (Con Save Atar)! Başaramazsa, O Hedef 'Incapacitated' olup hareket Hızı SIFIRA İNER. (Yani O TUR PAS GEÇİRİLİR MÜDAHELE EDEMEZ) Ciddi bir kilittir." },
                { level: 10, name: "Arcane Abeyance", desc_tr: "Attığın seviye 4 ten düşük (Herangi bi büyüyü) Bir cam küre içine Zamanını Durudurup HAPSEDERSİN (Dondurursun). O Küreyi savaşta (Başka birisine fırlatırsan Veya verirsen) O ADAM KÜREYİ PATLATIP (Senin Hapsettiğin Büyüyü Bizzat Kendi Actionuyla VURUR!)." },
                { level: 14, name: "Convergent Future", desc_tr: "Artık Reaksiyon vererek sadece zar tekrarlama yapmazsın: KADERİ BELİRLERSİN, Attığı Zarı GÖRMEZDEN GELİR Ve O Zarın Ya Başarılı Ya DA Mecburen Fail (BAŞARISIZ OLMASINI) Söylersin. Ancak bu eylem Senin BEDENİNEGeri teper Ve Sana 1 Yorgunluk Zarı (Exhaustion leveli Ekler)." }
            ]
        }
    ]
};
