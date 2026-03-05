module.exports = {
    name: "Cleric",
    hit_die: "d8",
    primary_ability: "Wisdom",
    saves: ["Wisdom", "Charisma"],
    armor_proficiencies: ["Light Armor", "Medium Armor", "Shields"],
    weapon_proficiencies: ["Simple Weapons"],
    description_tr: "Tanrılara hizmet eden, hem iyileştirme gücüne sahip hem de zırh giyip ön saflarda savaşabilen seçilmiş bir din adamı ve ilahi büyücü.",
    subclass_unlock_level: 1,
    features: [
        { level: 1, name: "Spellcasting", desc_tr: "Wisdom (Bilgelik) yeteneğini kullanarak ilahi (Divine) Ruhban büyüleri yapabilirsin. Büyülerini Tanrının Kutsal Sembolü (Holy Symbol) aracılığıyla kanalize edersin." },
        { level: 1, name: "Divine Domain", desc_tr: "Taptığın Tanrı'nın doğasına uygun bir Uzmanlık Alanı (Domain) seçersin (Örn: Life, Light, Tempest). Bu seçim sana anında sürekli hazır olan Domain Büyüleri ve 1. seviye Domain yeteneği verir." },
        { level: 2, name: "Channel Divinity (1/Rest)", desc_tr: "Tanrından doğrudan ilahi enerji çekerek büyülü etkiler yaratırsın. Kısa veya Uzun dinlenmede 1 kez kullanabilirsin. Hangi etkiyi yapabildiğin Domain'ine bağlıdır, ancak tüm Cleric'ler 'Turn Undead' yapabilir." },
        { level: 2, name: "Channel Divinity: Turn Undead", desc_tr: "Kutsal sembolünü kaldırıp dua edersin. 30 feet içindeki görebildiğin ve seni duyabilen tüm Ölümsüzler (Undead / Zombi / İskelet) Wisdom kurtarma zarı atar. Başaramayanlar 1 dakika boyunca dehşete kapılıp senden kaçmak zorunda kalır (Turned)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu (Ability Score) 2 artırabilir veya iki farklı yeteneği 1'er artırabilirsin (Maksimum 20). Alternatif olarak bir Feat seçebilirsin." },
        { level: 5, name: "Destroy Undead (CR 1/2)", desc_tr: "Turn Undead özelliğinden etkilenen ve CR (Tehlike Seviyesi) değeri 1/2 veya daha düşük olan bir Ölümsüz, kaçmak yerine ilahi ışıkta anında yok olur (kül olur)." },
        { level: 6, name: "Channel Divinity (2/Rest)", desc_tr: "Kısa veya Uzun dinlenme başına Channel Divinity (İlahi Kanalize) kullanma hakkın 2'ye çıkar." },
        { level: 6, name: "Domain Feature", desc_tr: "Seçtiğin Divine Domain'den (Alt Sınıf) 6. seviye yeni bir özellik kazanırsın." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat al)." },
        { level: 8, name: "Destroy Undead (CR 1)", desc_tr: "Anında yok ettiğin Ölümsüzlerin maksimum CR seviyesi 1'e yükselir." },
        { level: 8, name: "Domain Feature", desc_tr: "Seçtiğin Divine Domain'den (Alt Sınıf) 8. seviye özelliğini kazanırsın (Genelde Potent Spellcasting veya Divine Strike olur)." },
        { level: 10, name: "Divine Intervention", desc_tr: "Tanrından doğrudan duruma müdahale etmesini isteyebilirsin! Action harca, dua et ve d100 (Yüzlük zar) at. Attığın zar eğer Cleric seviyen (Örn: 10) gelirse, Tanrın tam istediğin mucizeyi yaratır (Etkiyi DM belirler). Başarırsan bu mucizeyi 7 gün tekrar kullanamazsın." },
        { level: 11, name: "Destroy Undead (CR 2)", desc_tr: "Anında yok ettiğin Ölümsüzlerin maksimum CR seviyesi 2'ye yükselir." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat al)." },
        { level: 14, name: "Destroy Undead (CR 3)", desc_tr: "Anında yok ettiğin Ölümsüzlerin maksimum CR seviyesi 3'e yükselir." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat al)." },
        { level: 17, name: "Destroy Undead (CR 4)", desc_tr: "Anında yok ettiğin Ölümsüzlerin maksimum CR seviyesi 4'e yükselir." },
        { level: 17, name: "Domain Feature", desc_tr: "Seçtiğin Divine Domain'den (Alt Sınıf) zirve (17. seviye) mucizesini kazanırsın." },
        { level: 18, name: "Channel Divinity (3/Rest)", desc_tr: "Kısa veya Uzun dinlenme başına Channel Divinity kullanma hakkın 3'e çıkar." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat al)." },
        { level: 20, name: "Divine Intervention Improvement", desc_tr: "Tanrından müdahale istediğinde (Divine Intervention) artık ZAR ATMAK YOK! Tanrın yakarışını her zaman %100 duyar ve anında mucizeyi gerçekleştirir." }
    ],
    subclasses: [
        {
            name: "Life Domain",
            description_tr: "Yaraları sarmaya, hastalıkları arındırmaya ve tüm canlıları korumaya adanmış, partinin belkemiği olan tartışmasız en iyi İyileştirici (Healer) rahipler.",
            features: [
                { level: 1, name: "Bonus Proficiency", desc_tr: "Ağır Zırh (Heavy Armor) giyme ustası olursun." },
                { level: 1, name: "Disciple of Life", desc_tr: "İyileştirme dehası. Büyü slotu harcayarak birine Can (HP) veren bir büyü attığında (Örn: Cure Wounds), hedef fazladan (2 + Büyü Seviyesi) kadar ekstra HP kazanır." },
                { level: 2, name: "Channel Divinity: Preserve Life", desc_tr: "İlahi kanalize. Action harca ve 30 feetindeki kritik yaralılara kutsal şifa dalgası yay. (Cleric Seviyen x 5) kadar HP'yi istediğin müttefiklere bölüştürerek iyileştir. Ancak bu güç, birinin canını SADECE maksimum canının yarısına (%50) kadar doldurabilir." },
                { level: 6, name: "Blessed Healer", desc_tr: "Karşılıksız iyilik. KENDİN HARİCİ birisine 1. Seviye veya üstü (Büyü Slotuyla) İyileştirme Büyüsü attığında, Tanrın SANA DA hediye olarak (2 + Büyü Seviyesi) kadar kendi HP'ni yenileme gücü verir." },
                { level: 8, name: "Divine Strike", desc_tr: "Turunda bir kez, bir yakın dövüş silahıyla hedefe isabet ettirdiğinde fazladan 1d8 Işıyan (Radiant) hasar çarparsın (14. Seviyede bu 2d8 olur)." },
                { level: 17, name: "Supreme Healing", desc_tr: "Ölümsüzlüğün sırrı. Büyü ile Can(HP) iyileştirirken artık ZAR ATMAZSIN. Zarların hepsi otomatik olarak GELEBİLECEK EN YÜKSEK SONUCU vermiş olarak hesaplanır (Örn 1d8 atıldığında direkt 8 geçerlidir)." }
            ]
        },
        {
            name: "Light Domain",
            description_tr: "Karanlığı kovan, güneşe tapan ve rakiplerini kör edip devasa ateş toplarıyla (Fireball) yakan Dps/Büyücü karakterli rahipler.",
            features: [
                { level: 1, name: "Bonus Cantrip", desc_tr: "Bedava 'Light' (Işık yaratma) cantrip'ini öğrenirsin." },
                { level: 1, name: "Warding Flare", desc_tr: "Göz kamaştıran flaş. Sana saldıran ve gözlerini görebildiğin bir düşmana Reaksiyon (Reaction) vererek ilahi bir Işık parlatırsın, onun sana yapacağı Saldırı zarı (Attack Roll) Dezavantajlı olur." },
                { level: 2, name: "Channel Divinity: Radiance of the Dawn", desc_tr: "Güneş patlaması. Action Harca, 30 feet içindeki büyülü karanlıklar SİLİNİR ve tüm düşmanlar (Con Save atar) başarısız olanlara Güneş Işığı (Radiant: 2d10 + Cleric Lvl) kadar alan hasarı Vurursun." },
                { level: 6, name: "Improved Flare", desc_tr: "Koruyucu Işık. Warding Flare (Kör eden flaş) özelliğini artık sadece kendini DEĞİL, 30 feet içindeki Müttefik arkadaşlarına yapılan saldırıları da sekteye uğratmak için atabilirsin." },
                { level: 8, name: "Potent Spellcasting", desc_tr: "Cleric Cantrip'lerinle (Örn: Sacred Flame) hasar vurduğunda, zararın üstüne Wisdom Modifiye Puanını kalıcı olarak ilave edersin." },
                { level: 17, name: "Corona of Light", desc_tr: "Kutsal Güneş Aurası: Action ile etrafına 60 Feet gün ışığı (60 FT daha loş ışık) açarsın (1dk sürer). Bu auranın ışığında duran HERHANGİ BİR düşman; Senin ve partinin attığı Fire (Ateş) veya Radiant (Işıyan) Büyülerinin Kurtarma Zarlarına (Save) Karşı DEZAVANTAJLI kıvranır." }
            ]
        },
        {
            name: "Knowledge Domain",
            description_tr: "Her şeyin doğrusunu bilen, geçmişi okuyan, dilleri ve evrenin sırlarını koruyan bilgelik, araştırma ve kehanet rahipleri.",
            features: [
                { level: 1, name: "Blessings of Knowledge", desc_tr: "İstediğin ilave 2 Dil öğrenirsin. Arcana, History, Nature veya Religion yeteneklerinden ikisine kalıcı Ustalık/Expertise (Yeterlilik Bonusunun iki Katı) alırsın." },
                { level: 2, name: "Channel Divinity: Knowledge of the Ages", desc_tr: "Tanrından fısıldanan bilgiler. Action harcayarak 10 Dakika boyunca oyundaki HERHANGİ BİR Yeteneğe (Skill) veya Alete (Tool) Anında Geçici Uzmanlık (Proficiency) bağlanırsın." },
                { level: 6, name: "Channel Divinity: Read Thoughts", desc_tr: "Zihin Okuyucu. 60 feet'teki birinin zihnini Actionla okumaya başlarsın (Wis Save atar). Başarısız olursa Düşüncelerini duyarsın ve daha da iyisi o esnada ona anında Kısmi bir 'Suggestion' (Empoze/Emir) büyüsü yollayarak onun hareketlerini kısıtlı yönlendirebilirsin." },
                { level: 8, name: "Potent Spellcasting", desc_tr: "Cleric Cantrip hasarlarına Wisdom (Bilgelik) bonusunu dahil edersin." },
                { level: 17, name: "Visions of the Past", desc_tr: "Zamanın gözleri. Bir odaya/alana girdiğinde veya cinayet aletine odaklandığında; Orada Saatler ve GÜNLERCE ÖNCESİNDE ne yaşandıysa Hayalet film şeridi misali (Vizyon olarak) izler, Geçmişi aydınlatırsın." }
            ]
        },
        {
            name: "Trickery Domain",
            description_tr: "Kaos tanrılarına tapan; hile, şaka, illüzyon, kılık değiştirme ve kopyalar ile düşmanla alay eden sinsi destek rahipleri.",
            features: [
                { level: 1, name: "Blessing of the Trickster", desc_tr: "Action ile KENDİN HARİCİ bir müttefike (Örn: Paladin) dokunursun. O kişi tam 1 Saat boyunca (Gizlilik - Stealth) zarlarına AVANTAJ sağlar." },
                { level: 2, name: "Channel Divinity: Invoke Duplicity", desc_tr: "Pürüzsüz İkiz. KENDİNİN Kusursuz Büyülü KOPYASINI (Clone) 1 Dakika boyunca çıkartırsın (Konsantrasyon). Onu Bonus Actionla yürütebilirsin! Senin büyülerin O Kopyadan Atılabilir VE İkiniz aynı hedefe kılıç sallarsanız Sen AVANTAJ elde edersin." },
                { level: 6, name: "Channel Divinity: Cloak of Shadows", desc_tr: "Görünmez Muhafız. Action kullanarak anında KENDİNİ Bir sonraki turuna (Veya bir büyü/hasar atana dek) TAMAMEN GÖRÜNMEZ (Invisibility) yaparsın." },
                { level: 8, name: "Divine Strike", desc_tr: "Silahlı saldırılarında (Pala, topuz vs) turda bir kez +1d8 ZEHİR (Poison) hasarı vurursun." },
                { level: 17, name: "Improved Duplicity", desc_tr: "Tiyatro büyüyor. İkiz Kopyan Artık Dört (4 Adet) Sayısına Ulaşır! Karşında Dört sahte Karakterle Düşmanın tüm kontrolünü altüst edersin!" }
            ]
        },
        {
            name: "Nature Domain",
            description_tr: "Doğanın vahşi veya bereketli yüzünü koruyan, bitkileri dirilten, ağaçlar ve hayvanlara hükmeden druid benzeri savaşçı rahipler.",
            features: [
                { level: 1, name: "Acolyte of Nature", desc_tr: "Ağır Zırh (Heavy Armor) uzmanlığı alırsın. İstediğin 1 Druid cantrip'i öğrenir ve Nature, Animal Handling veya Survival skill'lerinden birini cebine koyarsın." },
                { level: 2, name: "Channel Divinity: Charm Animals and Plants", desc_tr: "Ormanın huzuru. Kutsal sembol, 30 feet'teki Hayvanlar veya Bitki (Canavar/Sarmaşık) Yaratıklara Barış saçar. (Wis Save) yapamazlarsa 1 dakika boyunca sana Çarpılıp DOST (Charmed) kalırlar." },
                { level: 6, name: "Dampen Elements", desc_tr: "Doğa Kalkanı. Sen veya 30 feet içindeki Müttefikin ASİT, SOĞUK, ATEŞ, YILDIRIM VEYA GÖKGÜRÜLTÜSÜ (Thunder) hasarlarından hasar yediği saniye REAKSİYON çakarak o Alınacak spesifik element hasarına DİRENÇ (Yarıya düşürme / Resistance) bağlarsın." },
                { level: 8, name: "Divine Strike", desc_tr: "Turda bir silah atağına Vurduğun anda +1d8 Ekstra Hasar eklersin (Ancak bu Hasar Tipini: Soğuk, Ateş veya Yıldırım Olarak Sen seçiyorsun)." },
                { level: 17, name: "Master of Nature", desc_tr: "Diktatör orman. (Charm) ile dost ettiğin bütün Hayvan/Bitki karakterlere Bonus Action atarak Kime ve Nereye Saldıracaklarını Telepatik olarak emredip kontrolün altına bağlarsın." }
            ]
        },
        {
            name: "Tempest Domain",
            description_tr: "Fırtına, kasırga, deprem ve okyanus tanrılarının kaotik gazabıyla donanmış, şimşekleriyle yeri göğü inleten ağır zırhlı Thor-vari rahipler.",
            features: [
                { level: 1, name: "Bonus Proficiencies", desc_tr: "Gökleri yarmak için Ağır Zırhlar (Heavy Armor) ve Tüm Askeri (Martial) silahları Kullanma tecrübesi alırsın." },
                { level: 1, name: "Wrath of the Storm", desc_tr: "Göğün İntikamı. 5 feet yanından EĞER BİRİSİ SANA VURAN Kılıç atarsa (Sana isabet etse de etmese de), Reaksiyon vererek ONA Direkt YILDIRIM düşürtürsün (2d8 Lightning or Thunder Damage - Dex save ile yarım)." },
                { level: 2, name: "Channel Divinity: Destructive Wrath", desc_tr: "Yıkıcı Gazap! Şimşek veya Gökgürültüsü(Thunder) alan hasarı vuran Büyüler attığında DAİMİ BİR DEHŞET: Zarları ATMANA GEREK KALMAZ! Atılabilecek Tüm zarlar otomatik EN YÜKSEK MAXİMUM zarı vurmuşa döner (Örn 4d8 = Direkt 32 Hasar)." },
                { level: 6, name: "Thunderbolt Strike", desc_tr: "Artık herhangi bir Büyü VEYA Silahla YILDIRIM (Lightning) Hasarı yansıttığın Büyük(Huge) Veya Küçük boy her düşman Hasar alırken Anında TAM 10 FEET Uzağa FIRLATILIR(Push)." },
                { level: 8, name: "Divine Strike", desc_tr: "Turda 1 kere vurduğun yakın Silah hasarına +1d8 Extra GÖK GÜRÜLTÜSÜ (Thunder) Hasarı ilave olur." },
                { level: 17, name: "Stormborn", desc_tr: "Açık gökyüzü altındaysan (Yeraltında değilken), Normal Koşma hızın kadar Göklerde (UÇMA HIZI / FLY SPEED) kazanırsın. Fırtınanın efendisi süzülür." }
            ]
        },
        {
            name: "War Domain",
            description_tr: "Savaşı, kanı ve ilahi taktiği kutsal gören; ağır kılıcıyla en öne fırlayıp takımını zafere sürükleyen inançlı şövalyeler.",
            features: [
                { level: 1, name: "Bonus Proficiencies", desc_tr: "Ağır Zırhlar (Heavy Armor) ve Tüm Askeri (Martial) silahlarda Ustalık." },
                { level: 1, name: "War Priest", desc_tr: "Action harcayarak Silahla Saldırı (Attack) gerçekleştirdiğinde, Bonus Action harcayarak O TUR GERİYE bir Ekstra (1) Silah Saldırısı daha YAPIŞTIRABİLİRSİN. (Bilgelik modifier sayısı kadar kullanım hakkı)." },
                { level: 2, name: "Channel Divinity: Guided Strike", desc_tr: "İlahi Keskinlik. Bir Attack (Saldırı) zarını attıktan sonra(Iskaladığını Hissettiğinde); ZARIN ÜSTÜNE TANRISAL +10 Puan Ekler! O ıskalanan Zar Kesin İsabet Tutar." },
                { level: 6, name: "Channel Divinity: War God's Blessing", desc_tr: "Şövalye Kardeşliği! Senin hemen 30 FT yakınındaki (Müttefik-Dostun) kılıcını/Okluğunu savurduğunda ISKALARSA: Reaksiyon ÇAKARAK ONA (Kanalize) lütfunla +10 Vuruş puanı Hediyesi paslarsın ve vurdurtursun!" },
                { level: 8, name: "Divine Strike", desc_tr: "Silahının cinsine(Kesici, Delici, Ezici) göre turda bir +1d8 Extra Aynı türde Kutsal Hasar verir." },
                { level: 17, name: "Avatar of Battle", desc_tr: "Savaşın Avatarlığı! FİZİKSEL HASARLARIN HEPSİNDEN (Oklar, Kılıçlar, Baltalardan Gelen; Piercing, Bludgeoning, Slashing Hasarları Büyülü Değilse) TAM DİRENÇ (Resistance / Hasarı Yarıdan Bölerek yeme) Kazanırsın!" }
            ]
        },
        {
            name: "Death Domain",
            description_tr: "Nekromansi (Ölü Çağırma), çürümüşlük ve yaşamı emen ölüm büyülerini kucaklayan daha karanlık tanrılara bağlı, can yakan rahipler.",
            features: [
                { level: 1, name: "Bonus Proficiency", desc_tr: "Askeri Silahlara (Martial Weapons) Proficency (Uzmanlık) eklersin." },
                { level: 1, name: "Reaper", desc_tr: "Nekromansi gücü. Büyücü/Cleric listesinden (Chill Touch/Toll the Dead vb) Nekromansi (Necromancy) hedefli bir CANTRIP attığında, hedefin 5 Feet BİTİŞİĞİNDE BAŞKA BİR ADAM VARSA ikisine de AYNANDA atarsın (Tek Büyüyle 2 kişiyi hedeflersin)." },
                { level: 2, name: "Channel Divinity: Touch of Death", desc_tr: "Ölüm Dokunuşu. Silah saldırısı veya Büyülü yakın Dövüş saldırısı Tutan bir Adama Anında (Cleric Lvl x 2 + 5 puan) Kadar Saf NEKROTİK Hasarı Gömersin!" },
                { level: 6, name: "Inescapable Destruction", desc_tr: "Kaçınılmaz Ölüm: Senin büyü/yeteneklerinden vuran Nekrotik hasarlar; Düşmanlardaki 'Nekrotik Direnç (Necrotic Resistance)' özelliğini TAMAMEN DELİP YOK SAYAR. Yüzde Yüz Hasar verilir." },
                { level: 8, name: "Divine Strike", desc_tr: "Silah Savurmana Bonus (14 de 2D8) Extra Nekrotik hasar." },
                { level: 17, name: "Improved Reaper", desc_tr: "1. Leveldeki Reaper gelişiyor! SADECE CANTRIPLERE değil! Artık 1. seviyeden 5. Seviyeye Kadarki ATTIĞIN TÜM Nekrotik Hasar Büyüleri (Örn: Blight) Birbirine bitişik İKİ adama ÇİFT TARGET atılarak aynanda Vurur/Uygulanır!" }
            ]
        },
        {
            name: "Forge Domain",
            description_tr: "Demirci ocağının sıcak aleviyle donanan, sihirli silahlar ve kırılmaz kalkanlar işleyen demirci-şövalye rahipler.",
            features: [
                { level: 1, name: "Bonus Proficiencies", desc_tr: "Ağır zırhlara ve Demircilik Aletlerine (Smith Tools) uzmanlık alırsın." },
                { level: 1, name: "Blessing of the Forge", desc_tr: "Uzun Dinlenme sonunda Dokunduğun Büyüsüz bir Zırha (+1 AC Zırh Puanı) Sihri YADA Büyüsüz bir Silaha (+1 Atak ve Hasar Zarı) Sihri aşılayarak, dinlenmeye kadar onu Büyülü (Magic Weapon/Armor) yaparsın." },
                { level: 2, name: "Channel Divinity: Artisan's Blessing", desc_tr: "Yaratıcı Alev: Kısa Rest (1 Saatlik süre) boyunca ritüel yaparak; elindeki hurda demiri, altın paraları sihirle eritir VE BİREBİR Bedeli karşılığında Dilediğin Çelik Parçayı, Zırhı, Silahı TIK diye kusursuz YARATIRSIN!" },
                { level: 6, name: "Soul of the Forge", desc_tr: "Alev Rezistansı (Ateş hasarı Direnci). Ayrıcana sen Ağır Zırh (Heavy AC) Giyiyorsan KENDİ ZIRHINA EKSTRA (+1 AC) Zırh Puanı daha kalıcı olarak biner!" },
                { level: 8, name: "Divine Strike", desc_tr: "Silah zarına vururken +1D8 Ekstra ATEŞ(Fire) Hasarı çak." },
                { level: 17, name: "Saint of Forge and Fire", desc_tr: "Ateşe BAĞIŞIKLIK(Immunity - Hiçbir alev, LAVA DÜŞSEN BİLE hasar veremez). Artı Büyütsüz Gelen Dünyevi Ok, Kılıç ve Gürz Fiziksel Hasarlarına DİRENÇ (Yarı yeme) elde edersin." }
            ]
        },
        {
            name: "Grave Domain",
            description_tr: "Yaşamla ölüm çizgisinin melekleri. Nekromansiyi lanetler, ama ölüm eşiğindeki dostlarını dipten kusursuz çıkaran ve düşmanı zafiyetle parçalayan mezarcılardır.",
            features: [
                { level: 1, name: "Circle of Mortality", desc_tr: "Ölümün Eşiği: (0 HP)'ye düşen, baykuş veya Can Çekişen Bir DOSTUNA Attığın TÜM Healing (Zarlı İyileştirmeler) Zar atılmasını GEREKTİRMEZ! Zarlar OTOMATİK MAX GÜCE döner (Örn 3d8 attıysan 24HP basmış Sayılır) çok uçuk bir Heal atarsın. Bonus: Spare The Dying uzak mesafeden Atılabilir." },
                { level: 1, name: "Eyes of the Grave", desc_tr: "60 feet çevrendeki saklanan (Görünmez olan vb) tüm Ölümsüzleri (Undead) duvar arkası hisseterek sezinlersin." },
                { level: 2, name: "Channel Divinity: Path to the Grave", desc_tr: "Action ile bir Düşmana Kutsal Lanet İşareli çizersin. O Adama (Gelecek olan İLK Hasar Saldırısı) zayıflık kazanır. Saldırının hasarı ÇİFTE KATLANIR! (Vulnerability alır, Rogue veya Paladin'in attığı kritik ona Ölüm Demektir!)." },
                { level: 6, name: "Sentinel at Death's Door", desc_tr: "Reaksiyon ile Koru! Senin VEYA Yanındaki 30 Feet'teki bir Müttefikine; Düşman KRİTİK İSABET (Crit Vuruş) Zar attığında!! O KRİTİĞİ SİLİP NORMAL Vuruşa Geri çevirebilirsin!" },
                { level: 8, name: "Potent Spellcasting", desc_tr: "Cantrip Hasarlarına + Wisdom Mod eklersin." },
                { level: 17, name: "Keeper of Souls", desc_tr: "Bir Düşmanın 30 Feet Veya 60 Feet yanında Öldüğünde(Geberdiğinde), O ölen Düşmanın (Hit Diy Zarı kadar) ÖZÜ/CANINI Alıp, Yanındaki MÜTTEFİĞİNE Vücudunu dolduracak BEDAVA ŞİFA (HP) Olarak sunarsın!" }
            ]
        },
        {
            name: "Order Domain",
            description_tr: "Yasa ve Düzeni savunan taktiksel generaller. Büyüleriyle hem destek verirken takım arkadaşını bedavadan tekrar düşmana saldırtırlar.",
            features: [
                { level: 1, name: "Bonus Proficiencies", desc_tr: "Ağır zırhlara uzmanlık + Ek Olarak (Persuasion: İkna Veya Intimidation: Tehditkar Skilli)." },
                { level: 1, name: "Voice of Authority", desc_tr: "Taktik Komutan: Müttefikine 1. Seviye veya Üstü Zarlı büyü Yaparsan (Heal atmak/ Buff atmak Tipi Büyüler), Sen daha Büyüyü Verrir Vermez O DOSTUN BEDAVA BİR REACTION Harcayarak Anında Kılıcını Çekip (Etraftaki birine İLAVE SAVAŞ TARAFI/ SALDIRISI ATTACKU) Yapar!" },
                { level: 2, name: "Channel Divinity: Order's Demand", desc_tr: "Action ile Kanun Narası. 30 Feet'te Seni Duyan Düşmanlar (Wis Save tutturamazsa) Korkudan Silahlarını YERE DÜŞÜRÜRLER. Sen onlara Charmed (Karşı Tılsım/Aşk) etksi geçirir, Kımıldamadan Size bakmalarını sağlarsın." },
                { level: 6, name: "Embodiment of the Law", desc_tr: "Enchantment Tipi Büyüleri (Zihin Kontrol VEYA Command türü Emredici Hükümleri) Normal Action Yerine BONUS ACTİON (Çok hızlı Eylem) harcayarak Kullanma fırsatın Var (Wisdom modifier tur kadar!)." },
                { level: 8, name: "Divine Strike", desc_tr: "Vurduğun silah Atışlarında Zarına +1d8 Extra Psişik (Psychic/Zihin yakan) damage işler." },
                { level: 17, name: "Order's Wrath", desc_tr: "Vurduğun adama Mühür vurulur. SEN DEĞİL; Sendeki o Mühürlü adama Vuran MÜTTEFİKLERİN (Örn Fighter Veya Rogue) O hasarı verdiği an Onların Hasarına 2D8 Kadar İlave PSİŞİK/BEYİN Zedeleyici Çatlama Bonusu Dağıtılır." }
            ]
        },
        {
            name: "Peace Domain",
            description_tr: "Barış, diplomasi ve sarsılmaz sevgi bağlarıyla partiyi koruma altına alan destek karakterlerin piri.",
            features: [
                { level: 1, name: "Implement of Peace", desc_tr: "Insight, Performance, veya Persuasion(İkna) skillerinden birini uzmanlaştırırsınız." },
                { level: 1, name: "Emboldening Bond", desc_tr: "Şefkat Bağı: Prof Boyunca Karakter sayısı(Kendin ve müttefik) Arasında Bağ Kur (10 DK sürer) Bu elemanlar Birbirine 30Feet Ken ne zaman Saldırı, Yada Bir Defansif Check veya Yetenek atıcaksa + Zarlarnına EKSTRA (1 D4 ZARI) Ücretsiz EKLEYEBİLİR(Turda 1 Kere)." },
                { level: 2, name: "Channel Divinity: Balm of Peace", desc_tr: "Barışın merhemi: Action ile (Oportunity atacksız) YÜRÜMEYE BAŞLA! Senin yürürken O TUR İÇİNDE YANINDAN GEÇTİĞİN HERKESE(Takım Arkadaşı) TAM TAMINA (2d6 + Wis) KADAR Şifa dağıtarak yürürsün." },
                { level: 6, name: "Protective Bond", desc_tr: "Şefkat Bağından Etkili Adamlar 30 Ft içindeyse Bir Dostu YARALANIR HASAR Alırsa REAKSİYONU ile YERE IŞINLANIR O DOSTUN YERİNE Geçerek O Hasarı O Tanka veya Adama Devrettirilir!!!(Zarar Takımdab Takıma paylaşılır)." },
                { level: 8, name: "Potent Spellcasting", desc_tr: "Cantriplere + Wisdom Damage eklersin!" },
                { level: 17, name: "Expansive Bond", desc_tr: "Eski Bağının Etkisi (30 feet olan aralık 60 FEET'E Yükselir! Ve Bağı olan bir Kardeş Işınlanıp Diğerinin YERİNE HASAR aldığı an O GEÇEN HASARDAN(Direnç alarak) KENDİNİ Yarı Yarıya (RESISTANCE) Hasar yer." }
            ]
        },
        {
            name: "Twilight Domain",
            description_tr: "Gecenin karanlığında gizlenen, parti için geçici can ve devasa korumalar sağlayan, uçabilen loş ışık muhafızları.",
            features: [
                { level: 1, name: "Bonus Proficiencies", desc_tr: "Ağır Zırhlar (Heavy Armor) ve Tüm Martial Weapons ehliyeti!." },
                { level: 1, name: "Eyes of Night", desc_tr: "Karanlığı Deler: 300 FEET! (Devasa alan) Karanlık Görüş (Darkvision) ve bunu Action Harcayarak Partinin Kalan Dostlarına (Senin kadar kişi) Ücretsiz PAYLAŞTIRABİLİYORSUN!" },
                { level: 1, name: "Vigilant Blessing", desc_tr: "Kutsama: Kendine veya Dokunduğun dosta GELECEK İLK İnisiyatif (Initiative - Savaşa başlama Zarı)'na AVANTAJ sağlarsın. Hızlı başlardınız." },
                { level: 2, name: "Channel Divinity: Twilight Sanctuary", desc_tr: "Senin Vcudundan 30 FEETlik Bir Küre Şelalesi (Loş Işık Karanlığı Çemberi Başlar-1dk kalır) Küre içindeki Sana Ve Müttefiklerine HER TURUNUN BAŞINDA Beleş (1d6 + Cleric lv) Temp (Geçici HP kalkanı) VERİR VEYA Frightened(Korku) etkilerini üzerlerinden SİLER." },
                { level: 6, name: "Steps of Night", desc_tr: "Bonus action! Loş Işıklı veya Ufak Karanlık ortamda olursan (Kendi fenerini kapatsan dahi) Bir yarasamsız Gölge Çıkar! Kendine normal hızın Kadar Uçma(Fly) yetisi yaratırsın!" },
                { level: 8, name: "Divine Strike", desc_tr: "Turda isabet ettirdiğinde +1d8 Ekstra IŞIYAN Yıpranma Hasarı." },
                { level: 17, name: "Twilight Shroud", desc_tr: "Yarattığın Twilight Sanctuary Küresi içinde DURAN MÜTTEFİKLER Eğer Ortalıktalarsa SADECE Hplenmezler KENDİLERİNE (Yarım Siperlik (Half-Cover) defansı alarak +2 AC Kalkan defansı zırhı kazanırlar Da!" }
            ]
        },
        {
            name: "Arcana Domain",
            description_tr: "Büyüyü tanrının lütfu olarak kullanan, Sorcerer/Wizard büyülerinden üstün hasar ve Arcana odaklı büyücü rahipler (SCAG).",
            features: [
                { level: 1, name: "Arcane Initiate", desc_tr: "Wizard büyü listesine erişim kazanırsın! Domain Büyülerin seçerken Cleric listesi yerine Wizard listesinden de seçebilirsin." },
                { level: 2, name: "Channel Divinity: Arcane Abjuration", desc_tr: "Celestials (Göksel), Elementals, Fey veya Undead gibi güçlü yaratıklara bakararak Reaksiyon atarsın; (Wis Save) kaybedenler Korkuya kapılıp (Turned - Kovulmuş) senden kaçarlar. Düşük seviyeli yaratıklar anında Banish (kovulur) edilir!" },
                { level: 6, name: "Spell Breaker", desc_tr: "Bir müttefikini bir zarardan kurtarmak için iyileştirici büyü attığında, o büyü seviyesinden 1 Düşük bir Büyüyü da beleşte sönümlü (Dispel) atabilirsin! Hem Heal hem Dispel tek vuruşta." },
                { level: 8, name: "Potent Spellcasting", desc_tr: "Cleric Cantrip'lerin hasarına Wisdom Modifiye Puanını ilave edersin." },
                { level: 17, name: "Arcane Mastery", desc_tr: "Wizard listesinden sana özel 4 büyü eklenir: 6. Seviye, 7. Seviye, 8. Seviye ve 9. Seviye Büyüler seçersin. Bu büyüler her zaman hazır ve otomatik olarak Domain Büyülerin sayılır." }
            ]
        }
    ]
};
