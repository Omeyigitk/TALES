module.exports = {
    name: "Fighter",
    hit_die: "d10",
    primary_ability: "Strength or Dexterity",
    saves: ["Strength", "Constitution"],
    armor_proficiencies: ["All Armor", "Shields"],
    weapon_proficiencies: ["Simple Weapons", "Martial Weapons"],
    description_tr: "Savaş alanının mutlak ustası; silah, zırh ve strateji konusunda en kapsamlı eğitime sahip olağanüstü dövüşçü.",
    subclass_unlock_level: 3,
    features: [
        { level: 1, name: "Fighting Style", desc_tr: "Archery (Okçuluk +2 Atak zarı), Defense (+1 Zırh Sınıfı), Dueling (Tek silahla +2 Hasar), Great Weapon Fighting (Çift el silah hasarında 1 ve 2'leri baştan atma), Protection (Kalkanla dostu koruma) veya Two-Weapon Fighting (İkinci silaha modifikasyonunu ekleme) stillerinden birini seç." },
        { level: 1, name: "Second Wind", desc_tr: "Bonus Eylem (Bonus Action) kullanarak 1d10 + Fighter seviyesi kadar Can (HP) yenileyebilirsin. Kısa veya Uzun dinlenmede 1 kez kullanılır." },
        { level: 2, name: "Action Surge (1/Rest)", desc_tr: "İnanılmaz bir refleksle sınırlarını zorla. Turunda standart Eylemin (Action) ve Bonus Eylemine İLAVE OLARAK, ekstra tam 1 Eylem (Action) daha kazanabilirsin. Kısa veya uzun dinlenmede 1 kullanılır." },
        { level: 3, name: "Martial Archetype", desc_tr: "Savaşçı tarzını belirleyen bir Dövüş Arketipi (Subclass) seçersin (Örn: Champion, Battle Master)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu (Ability Score) 2 artırabilir veya iki farklı yeteneği 1'er artırabilirsin (Maksimum 20). Alternatif olarak bir Feat (Özel yetenek) seçebilirsin." },
        { level: 5, name: "Extra Attack", desc_tr: "Kendi turunda Saldırı (Attack) eylemi aldığında 1 yerine peş peşe 2 saldırı yaparsın." },
        { level: 6, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al (Fighter'lar oyundaki en çok ASI/Feat alan sınıftır)." },
        { level: 7, name: "Archetype Feature", desc_tr: "Seçtiğin Dövüş Arketipinden (Subclass) özellik kazanırsın." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 9, name: "Indomitable (1/Rest)", desc_tr: "Başarısız olduğun bir Kurtarma Zarını (Saving Throw) baştan atabilir (Reroll) ve ikinci zarı kullanmayı seçebilirsin." },
        { level: 10, name: "Archetype Feature", desc_tr: "Seçtiğin Dövüş Arketipinden (Subclass) yeni bir özellik kazanırsın." },
        { level: 11, name: "Extra Attack (2)", desc_tr: "Saldırı Eylemi (Attack action) aldığında artık tek eylemle 2 değil, 3 kez kılıcını savurursun." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 13, name: "Indomitable (2/Rest)", desc_tr: "Kurtarma zarlarını (Saving throw) yeniden atma hakkın 2'ye çıkar." },
        { level: 14, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 15, name: "Archetype Feature", desc_tr: "Seçtiğin Dövüş Arketipinden (Subclass) özellik kazanırsın." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 17, name: "Action Surge (2/Rest)", desc_tr: "Aynı tur içinde peş peşe kullanılmamak şartıyla, Action Surge kullanım hakkın ikiye çıkar." },
        { level: 17, name: "Indomitable (3/Rest)", desc_tr: "Kurtarma zarları hakkı 3'e çıkar." },
        { level: 18, name: "Archetype Feature", desc_tr: "Seçtiğin Dövüş Arketipinden (Subclass) nihai savaş özelliğini kazanırsın." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 20, name: "Extra Attack (3)", desc_tr: "Savaşın tam anlamıyla Zirvesindesin! Kendi turunda Attack Action aldığında artık 3 yerine muazzam bir şekilde tek harekette 4 kere peş peşe saldırabilirsin." }
    ],
    subclasses: [
        {
            name: "Champion",
            description_tr: "Ham fiziksel mükemmeliyeti hedefleyen, karmaşık teknikler ve büyüler yerine devasa kritik hasarlar ve saf güce odaklanan gladyatörler.",
            features: [
                { level: 3, name: "Improved Critical", desc_tr: "Silah saldırılarında sadece zar=20 geldiğinde DEĞİL, zarda 19 VEYA 20 geldiğinde doğrudan Kritik Hasar (Critical Hit - Tüm zarların ikiyle çarpılması) vurursun." },
                { level: 7, name: "Remarkable Athlete", desc_tr: "Uzman (Proficient) olmadığın herhangi bir Güç (Str), Çeviklik (Dex) veya Dayanıklılık (Con) zarına Yeterlilik Bonusunun yarısını doğrudan eklersin." },
                { level: 10, name: "Additional Fighting Style", desc_tr: "1. seviyede seçtiğin dövüş stiline (Fighting Style) ek olarak 1 dövüş stili DAHA kazanırsın (Örn: Hem Okçuluk hem Defans)." },
                { level: 15, name: "Superior Critical", desc_tr: "Kritik yelpazen daha da genişler. Zarda 18, 19 ve 20 geldiğinde doğrudan Kritik Vuruş (Critical Hit) vurursun. Neredeyse her 5 vuruşundan biri Kritik olur!" },
                { level: 18, name: "Survivor", desc_tr: "Savaşta yenilmezlik: Her turunun başlangıcında, eğer canın (HP) maksimum canının yarısından az ama 0'dan yüksekse; anında bedavadan (5 + Con modifier) kadar HP yenilersin. Yıkılmayan adam." }
            ]
        },
        {
            name: "Battle Master",
            description_tr: "Savaşı bir sanat ve satranç tahtası gibi oynayan; taktiksel Manevra zarlarıyla rakibini kontrol eden akıllı generaller.",
            features: [
                { level: 3, name: "Combat Superiority", desc_tr: "Sana özel 4 adet (1d8) boyutunda Superiority Dice (Üstünlük Zarı) verilir. Listeden özel Manevralar seçersin (Örn: Disarming Attack-Silah Düşürtme, Pushing Attack-Geri İtme, Trip Attack-Yere Mıhlama) ve bu zarları kullanarak kılıç vuruşlarına inanılmaz etkiler ve Ekstra (1d8 Zarı kadar ek hasar) yedirirsin." },
                { level: 3, name: "Student of War", desc_tr: "1 Adet Zanaatkarlık (Artisan's Tools) aletinde (Örn: Demircilik veya Hat Sanatı) uzmanlık kazanırsın." },
                { level: 7, name: "Know Your Enemy", desc_tr: "Bir düşmanını 1 dakika gözlemleyerek; Güç-Çeviklik skoru, HP'si, Zırhı kalitesi veya Sınıf seviyeleri seninkinden zayıf mı yoksa daha mı güçlü kesin istihbarat çekersin." },
                { level: 10, name: "Improved Combat Superiority (d10)", desc_tr: "Ekstra Manevralar öğrenirsin. Artı Üstünlük Zarlarının hepsi d8'den (d10) zarına dönüşerek hem hasar hem de etkilerini büyütür." },
                { level: 15, name: "Relentless", desc_tr: "Tükenmez taktikler. Savaş başladığında taze (İnisiyatif Atıldığında) eğer cebinde hiç kullanılabilecek Superiority (Manevra) zarın kalmamışsa; anında 1 adet zar sana hediye edilir." },
                { level: 18, name: "Improved Combat Superiority (d12)", desc_tr: "Tüm Manevra Üstünlük zarların maksimum potansiyeline; (d12)'ye yükselir." }
            ]
        },
        {
            name: "Eldritch Knight",
            description_tr: "Büyüsel zekayı ve ağır zırhı birleştiren; bir yandan kılıç saplarken diğer yandan alan hasarları ve kalkan büyüleri fırlatan sihirli şövalyeler.",
            features: [
                { level: 3, name: "Spellcasting", desc_tr: "Zeka (Int) tabanlı Wizard listesinden; savunma(Abjuration) ve hasar verme(Evocation) büyülerine erişim sağlarsın." },
                { level: 3, name: "Weapon Bond", desc_tr: "Bir ritüelle iki silahı ruhuna bağlarsın. Bağlı silahınıBonus Eylemle boş eline Işınlayabilir (Summon) edebilirsin. Kimse bu silahı elinden zorla düşüremez (Seni uyurken bile silahsız bırakamazlar)." },
                { level: 7, name: "War Magic", desc_tr: "Savaş büyüsü: Ana Eylem (Action) olarak bir Cantrip (Örn: Fire Bolt) attığında, hediye olarak Bonus Eylem ile o tur içinde kılıçla(Silahla) fazladan 1 bedava saldırı daha patlatabilirsin!" },
                { level: 10, name: "Eldritch Strike", desc_tr: "Kılıç ve sihrin kombosu: Bir düşmana silahla HİT / isabetli hasar verdiğinde, o hedefe atacağın HER TÜRLÜ BÜYÜNÜN (Fireball vs) Kurtarma Zarlarını (Saving Throw) Hedefe DEZAVANTAJLI Attırırsın! Vurduğun büyüden kaçamaz." },
                { level: 15, name: "Arcane Charge", desc_tr: "Action Surge (2. Kere atak sırası alma) özelliğini tetiklediğinde, Vücudunun atomlarına ayrılıp 30 feet öteye anında IŞINLANIP (Teleport) öyle kılıcını savurursun (Mistik ani yer değişimi)." },
                { level: 18, name: "Improved War Magic", desc_tr: "Cantrip değil artık gerçek büyü zamanı! Ana Eyleminle normal 1. / 2. / 3. Seviye ateşTopu vb büyü fırlattığında BİLE Bonus Action ile 1 kılıç Saldırısı vurma hakkın SAKLI KALIR!" }
            ]
        },
        {
            name: "Arcane Archer",
            description_tr: "Oklarını elflerin kadim geleneksel sihiriyle dolduran; düşmanını sapladığı okla donduran, alevle patlatan, zihin kontrolü veya kara deliğe süren keskin nişancılar.",
            features: [
                { level: 3, name: "Arcane Archer Lore", desc_tr: "Doğa (Nature) ya da Kozmik (Arcana) bilgisinden birisine Uzmanlık (Proficient) alırsın. Ayrıca Prestidigitation Büyüsünü oklarında estetik amaçlı beleşe öğrenirsin." },
                { level: 3, name: "Arcane Shot (2/Rest)", desc_tr: "Sihirli Oklar. Dinlenme başına Okuna harcayacağın 2 Özel Atış yeteneğin olur. Örn: (Grasping Arrow: Zarbını zehirli dikenli sarmaşıkla sarar) - (Banishing Arrow: Adamın o gün turunu silip Ceheneme ışınlayıp oyun dışı Atar - Sürgün Oku) - (Bursting Arrow: Adamda devasa bir bomba Şarapneli Patlatarak hasarlar verir)." },
                { level: 7, name: "Curving Shot", desc_tr: "Akıl almaz atış: Yay(Ok/Arbalet) la yapıp Attığın Büyülü BİR OK düşmana İsabet Etmez (ISKALAYIP KARAVANA OLURSA)- Hedefe Değmediği o anda Reaksiyon basıp Oku Kavisle Döndürür VE ISKA GEÇTİKLERİ BİR BAŞKA Yaratığa Tekrar Yeni Bir ZAR atarak saplarsın." },
                { level: 10, name: "Magic Arrow", desc_tr: "Atmıs olduğun TÜM Sıradan normal Oklar BİLE (Fiziksel zırhları delmesi maksadıyla) Sihirli (Magical DamagePiercing) mermi kategorisinde sayılır dirence takılmaz!" },
                { level: 15, name: "Ever-Ready Shot", desc_tr: "Pusuda asla cephanesiz kalma. Savaş (İnisiyatif Zarları) başlatılırken Şayet 'Yok Edici / Banishing vb Arcana Okların' BİTMİŞ VE SIFIR İSE; Hemen sana havadan 1 Arcane Shot cephanesi daha sağlanır." },
                { level: 18, name: "Arcane Shot Improvement", desc_tr: "Arcane(Özel Okların) Yaptığı 2D6(veya Zarar) hasarlarının Hepsine muazzam Güç yüklenmesi uygulanıp Hasarlarını En yıkıcı Zarara (4D6)'ya Katlarlar!" }
            ]
        },
        {
            name: "Cavalier",
            description_tr: "Kalkan, ağır mızrak veya kırıklarıyla sadece kendi canını değil, takım arkadaşlarının da hasarını kalkanıyla bloklayan ve düşmanı adım attırmayan savaş lordu şövalyeler.",
            features: [
                { level: 3, name: "Born to the Saddle", desc_tr: "Ata/Binite Çıkmak-inmek senin normal süren yerine sadece (5 feet) hareket maliyetine denk gelir. Ayrıca atından düşürülmen Zordur (Advantage Save) Artı Düştüğünde ZARAR GÖRMEDEN Ayağına Düşersin." },
                { level: 3, name: "Unwavering Mark", desc_tr: "Yakınındaki Saldırdığın Kişilere 'MARK (İşaret)' Koyarsın! Hedef İşaretli kişi senden BAŞKA BİR DOSTUNA Vurmaya yeltenir veya hasar atarsa; O Vuruşu tamamen Dezavantajlı Zayıflamış AttırırSınVe Vurulursa: Sonraki Tura kadar Onu Bonus eylem ile Ağır (Ekstra hasarlı) şekilde Cezalandırıp darbe Atma hakkı Kazanırsın!" },
                { level: 7, name: "Warding Maneuver", desc_tr: "Dayanıklılık (Con modifier) Sayın kadar. Bir Dostuna Ya Da Sana Saldırı GELDİĞİNDE Reaksiyon AT, ZIRH Puanınıza (AC'ye) BEDAVADAN 1D8 (+8 defansa kadar) Puan Geçir Ve O VURUŞU Havada Engelleyerek Iska Yaptırt! Hasar alınıyorsa Yarıya Katlar!" },
                { level: 10, name: "Hold the Line", desc_tr: "Fırsat saldırıları değişiyor. 1- Artık Fırsat saldırısı İçin Birinin senden Uzaklaşması Gerekmiyor, Senin (5 ft Yanında GEZMENİN de Cezası Fırsat kılıcı olacaktır). 2- Kılıçla bu şekilde VURDUĞUN Kişinin HARAKET Hızı Tık diye (0)'a Kitlenir Kaçamaz Orada yapışır Kalır." },
                { level: 15, name: "Ferocious Charger", desc_tr: "Tur Sürcesinde Dümdüz 10 FEET(Zıplama /Kuşma) Hedefe doğru Çarparsın! Ve Senin bu çarpışmanın sonundaki İlk Fiziksel Kılıç/Kalkan Vurman Karşı Hedefin (Str Save Zarını Yedirerek) onu PRONE(Yere kapaklanan) çaresiz duruma sürükler." },
                { level: 18, name: "Vigilant Defender", desc_tr: "En iyi Savunma Karakteri zirvesi:(Aslan Koruması). NORMAL OYUNDA Turda/Her round Her oyuncunun 1 Reaction Hakkı varken; SEN Etrafında Senin yanında OPORTUNİTY(Kılıç yiyebilecek Durumdaki) KAÇIŞAN Veya Hareket Eden Düşman Sayısı KADAR Sınırsız Teoki Hakkı Ve Ekstra VURUŞ Şovuna Girisir Kaçan HER ADAMIN ARDINDAN Reaksiyonsuz (Ona Özel Fırsat Savurması Çizersin). Herkese kestiğini dağıtırısın." }
            ]
        },
        {
            name: "Samurai",
            description_tr: "Tükenmez bir iradeye (Willpower) ve sarsılmaz bir ruh asaletine sahip olan, onuru için ölene kadar iki eliyle kılıcını durmadan savuran doğulu savaş ustaları.",
            features: [
                { level: 3, name: "Bonus Proficiency", desc_tr: "Görgü Kuralları; History, Insight, Performance, veya Persuasion(İkna) skillerinden birini uzmanlaştırırsınız (Veya Alternatifçe Extra Dil seçilir)." },
                { level: 3, name: "Fighting Spirit", desc_tr: "Bonus Eylemle (Bonus Action) İle Savaşın Ortasında ruhunu Parlat(Günde 3 Kez) !. 1. (Fighter Lvl'ine göre artan Dev Geçici/Temp HP) Kalkanı Al!. 2. SENİN BU TURDAKİ YAPACAĞIN(4-5 kere vurabildiğin) ATTACK (Silah SALDIRILARININ TÜMÜNE) BEDAVAYA Avantaj Zarı (Advantage) kazandır. Barbarian gibi kalkan kaybetmeden ÇİFT zar vur." },
                { level: 7, name: "Elegant Courtier", desc_tr: "Siz savaşçıdan çok daha saray adamısınız. Persuasion(İkna Etme) Zarlarında Artık Sadece Karizma Puanın Değil: +WISDOM (Bilgelik Niteleyicisi Puanını) Da Ekleyebilerek, İknada tanrısal sayılara çıkarsın. Üstüne Wis Save(Ustalık alırsın ki Büyü Yeme Savunman artsın)." },
                { level: 10, name: "Tireless Spirit", desc_tr: "Yenilenen onur: Eğer Fighting Spirit (Vuruşlardaki Avantaj hakkın) cebinden tükenmiş / bitmiş ise; Savaş zarları çekildiğinde BAŞLARKEN Sana Anında Bedava (1) Adet kullanım hakkı geri Bahşedilir." },
                { level: 15, name: "Rapid Strike", desc_tr: "Tek vuruş yetmez!: EĞER Bir Saldırıyı AVANTAJLA Yapıyorsan (Çift zar); AVANTAJDAN Vazgeçme/İptal Etme Şartını kabul ederek, Normal Düz tek Zar Atmak ŞARTIYLA (1 VURUŞ Hakkını -> 2 AYRI VURUŞ HAKKINA) Dönüştür. (4 Vuruş yapan bir Fighter için Avantajlı turunde 5 VURUŞ Kombosu çıkartma anlamına gelir)." },
                { level: 18, name: "Strength Before Death", desc_tr: "İradenin Asla bitmeyeceği an: Canın 0'a Düştüğünde(Bayılırıp YERE KAPAKLANMAK/ÖLMEK ÜZEREYKEN!) ANİDEN Zaman Duran bir Tura SOKULURSUN(Kendinize ait olan 1 Tur Oynama Çizgisi). Tur içinde Ya Potion Dikin, Ya da Action Surgelerinizi Yakıp Onuruza Karşılık DÜşene Kadar Önündeki Mob İLE Son TAkasını Yaparsınız!" }
            ]
        },
        {
            name: "Psi Warrior",
            description_tr: "Zihin ve fiziksel limitlerini birleştiren, beyin gücündeki Telekinetik/Psionik enerjiyi kılıçlarına yönlendirerek havadan dövüşen psişik savaşçılar.",
            features: [
                { level: 3, name: "Psionic Power", desc_tr: "Sende Zihin Gücü var (Int modifier kadar D6 Zarı). Zarları üç seyde HARCARSIN: 1.(Psionic Strike): Saldırı Tutturunca silahına D6 zarı+Psişik Beyin Zarar Vurur.+ 2.(Protective Field): Sen Veya Yanınızdaki Dostnunuz Hasar yerse Zarı Zarar Kalkanı (Damage Azaltıcı) Olarak Eksiğeltet. 3.(Telekinectic MEvement): Zihninle Bir Objeyi/Büyük silahı Hava Kaldırıp (Jedi Gücü) 30 feet havada Taşıma yap!" },
                { level: 7, name: "Telekinetic Adept", desc_tr: "Fiziki Uçuşlar!- Bonus Actionla O tur sonuna Kadar Kendini (Zihinsel Uçuş- Fly Speed) Kuvvetline Al(Psisik zıpzyp).! Ve Psisic Thrush: (Psişik vuruş eklediğin) Yaratıklara Ek Olarak (+1) Adet Zar Yedirmeden 10 Feet GERİ İtebilrr (Telekineti Kılıcı) veyahot YERE Koparıp kapaktatabilirsin!" },
                { level: 10, name: "Guarded Mind", desc_tr: "Psionik Zarın Erimi(D8) Boyutuna Yükselirken; Senin ZİHNİNE Büyü (Charmed-Aşk) VEYA (Frightened-Korkutulma) Etkileri Tamamen Bağıl İşler(Etki geçmez/ İraden İmkansız kırılır). Yapsalar bile Psionik Zar kapatarak (Direkt Kaldırırsın)." },
                { level: 15, name: "Bulwark of Force", desc_tr: "Takımı Zırhla! Action Alıp Kendine ve (Int modiifern kadar DOSTUNA) Psişik Force kalkanıyla Sarmalla. Herkese (Cover = Siper koruması AC si + Ve Saving Throllara Ekstra Başarı Puan Kalkanları dağıt). 1 Dakika sürer devasa orkestra taktiğidir." },
                { level: 18, name: "Telekinetic Master", desc_tr: "Tüm Psişik zarların (D10) Büyünse Çıkar! Günde BİR KERE Bedavaya(Sonrası Zar harcatan) TAM TELEKİNESİS (Level 5 Büyü Sistemi) Çekebilir, Evleri Kayaları Canavarları Zihin Gücüyle BOĞARAK Kontrol Edebilirken Üstüne Bu Büyüyü Yaparken İlaveten VURUŞ (Attack) Gerçekleştırebilen Nadir bir canavar haline Dönersiniz!" }
            ]
        },
        {
            name: "Rune Knight",
            description_tr: "Devlerin (Giants) boyutlarını ve gücünü gizemli Rünlerini/alfabelerini silah ve kalkanlarına oyarak kullanan, savaş alanında koca bir deve büyüyen efsanevi Cüce-tabanlı Savaşçılar.",
            features: [
                { level: 3, name: "Bonus Proficiencies", desc_tr: "Smith Tools(Demircilik) Ehliyeti Al!. Ve Giant (DevCE Lisânı) dili çözdün." },
                { level: 3, name: "Rune Carver", desc_tr: "Öğrendiğin İki Adet DEV RÜNÜNÜ (Büyüsel taş) Gün başında Silah, Zırh Veya Elbisene Kazırsın. Eşsiz pasif GÜÇLER Verir Veyahut(Bonusla aktif olunca): FIRE(Demirci uzmanlık+ Silahın Ateşli Zincirlere dönüp adamı bağlı Tutar)- FROST(İkna Uzmanlığı + STR nize +2 Pasif ZAR İlavesi Vurur)- CLOUD (Dolandırıcı bonus + Sana Vuranın Attack Hasarını Veya Zarını ZİHNİN İLE KAYDIRARAK Yanında Bulunan BİR BAŞKASINA Transfer Edersin)- STONE (Gece Görüşü + Adamı Prone Stune taşlaştırma) Rünlerinden seçersiniz." },
                { level: 3, name: "Giant's Might", desc_tr: "Asıl Olay! BONUS ACTION a Bas => Vücudun GENİŞLER! BÜYÜYORSUN.. Boyutun LARGE (Devasa) Olur!, Gücün Aratar Str Avajntaj ve Artı Silah Vuruşuna Extra Hasar Basarak Devleşmiş Hasara ulaşırsın!" },
                { level: 7, name: "Runic Shield", desc_tr: "Takım İçin Kalkan: Bir Müttefikine Ya da Yanda Duran'a KRİTİK İSABET Mİ GELDİ(Düşman Vurduysa! REACTION Kullan! Ve adamın O Çift atıp Sevindiği ZARI BAŞTAN SIFIRDAN Attırt! İptal Et Kritik Cıksın! (Savunma Devi olursun)." },
                { level: 10, name: "Great Stature", desc_tr: "Boyunuz artık Normal İnsan formunda Bile 1 METRE Daha uzar. Giant Might (Büyümeniz Formundaki EKSTRA HASARINIZ) D6 Boyutundan Büyük (d8) boyutuna ve devasal Vuruşlara çevrilir." },
                { level: 15, name: "Master of Runes", desc_tr: "Dev Rünlerin Artık KISA REST atarak değil Direkt olarak ; Her Kısa/Uzun Mola Dinleniminde Her BİR RÜNÜ(Teker TEKER) Tam(2şer DEFA) Kesintisiz Uygulama/Aktive limitlerin İkiye katlanır." },
                { level: 18, name: "Runic Juggernaut", desc_tr: "Titan Büyümesi!! Artık Gücünüz LARGE (İkiye iki kare) Formattan => (Üç Kareye Üç HUge Boyut devasa 20 metrelik varlıksal Evrim) Moduna Geçebilir!. Giant Might Formun KILIÇ Veya Sopa Ulaşma Menzili (REACH= Silah +10 Feet öteye) Ve Giant Dmagane +1d10 Zarar Pompalamaktadır!" }
            ]
        },
        {
            name: "Echo Knight",
            description_tr: "Farklı zaman çizgilerindeki paralel evren kopyalarını 'Echo (Yankı)' sıfatıyla kendi boyutuna çeken; hem yer değiştirip hem aynı anda saldıran karmaşık zaman manipülatörleri.",
            features: [
                { level: 3, name: "Manifest Echo", desc_tr: "Gölgenin Yansıması: Bonus Eylemle yanından Saydam Siyah Bir KOPYANI (Echo= 1Hp, + Zırhınızla Aynı) Formda Çıkarabilirsin!. Bu Echo'nla Sen Tura Ait (Aksiyon) Kullanarak => İster kopyanının Elinden KARŞIYA Sen Silahına Basıp Hasar Yolla.. İstersende 15 FT ile Yer Değiştir(Swap) Yani BEDAVAYA Anında Kendinle Kopyanı Işınlayarak Yerlerine Taşı ve Tehlikelerden sıyrıl! Echo yok edilene dek Kalır." },
                { level: 3, name: "Unleash Incarnation", desc_tr: "Zaman saldırısı: SEN ASIL BEDEN İle Kendi Atağını Atarken, Zamanda (Kopya da bedava bir tur kazanır!): Sen Atağın Tam İçindeyken BEDAVADAN Bir Attack HAKKI/VURUŞU Daha Kopyan Üstünden Savurursun (Saldırılarınız Kopyayla Şişer)." },
                { level: 7, name: "Echo Avatar", desc_tr: "Ruhunu Uzaktan Komuta: 10 Dakika için Gözlerin /Kulaklarını ECHO KOPYAYA Taşıyarak Onu (1000 FEET) Uzağa casus Gibi uçurtup Gönderirsin. Onun duyduğu Ve İzlediğini Sen hissedip İstihbarat ÇekersİN.! (Casus Dron)." },
                { level: 10, name: "Shadow Martyr", desc_tr: "Kendini Siper Eden Kopya: 30 ft uzağındaki Korumasız Dostuna Veya Priestinize bir Saldırı-OK vs GELİYOR İSE , REAKSİYON İLE KOPYANI (Dostunun Üzerine ŞİPER ET!. O Saldırı senin kopyana Vurup Paramparça ederek Müttefiğinizin CANINA Değemeden Kaybolur Gider!" },
                { level: 15, name: "Reclaim Potential", desc_tr: "Ruhun dönüyor.. Senin yankın Savaş İçi PARAMPARÇA Olup veya Sen siper edince Kırıldığında Canını sıkma! Sistem Sana Bu yok oluştan DOLAYI Temp / Geçici (2D6+ Con Modifier) Puanı Boyutunda ZIRH HP Kalkanı Çıkartır." },
                { level: 18, name: "Legion of One", desc_tr: "Tek Kişilik Ordu!!! Artık BONUS Actionunuzda 1 DEĞİL; PARALEL ZAMANDAN(Tam 2 ADET Kopya) GETİRECEK Eşsizliçe Yükselirsin. Savaş Alanının Tamamen Şekillendiği ve Bir köşesi 1. Kopya Bir taraf Sen ve Son yer İse Kopyan (Sürekli üçgenden 7 Saldırı Kombosu vs Yaratmalara imkan Verir!)." }
            ]
        },
        {
            name: "Gunslinger",
            description_tr: "Kara tozu metalle buluşturan, barutlu silahları ve altıpatlarları kendi atölyesinde icat edip özel 'Trick-Shot' mermileriyle rakiplerini kör eden/diz çöktüren vahşi batı tüfekşörleri.",
            features: [
                { level: 3, name: "Firearm Proficiency & Gunsmith", desc_tr: "Demirci Ustası! Tinker's Tools (Mühendislik Aletlerive) ve (Tabanca/Tüfek) Kullanma ve Onarma Beceriniz gelişti.! Silah Misfire(Tıkanıklık) Yaptığı Vakit Alet Edevat Skiliyle Hızlı Onarım yapabilirsiniz." },
                { level: 3, name: "Adept Marksman", desc_tr: "Cesaret Puanları (Grit Havuzu -Wisdom Modeli Kadar Var). Bu özel Puanlraınızla SİLAHINIZIN atışlarına Şov veya Trick Ekleyebilirsiniz! Gözden (Deadeye- Avantajla Zar vur), Silahı Hedefin Elinden Vur (Winging), Yada Onları Dizlerine sıkaracak (Prone) Çöktürt! vb gibi." },
                { level: 7, name: "Quickdraw", desc_tr: "İnisiyatifler(Initiatve Savaş Sürpriz zarlarına) Wis modüle Edilir!! Çok daha çevik davranır Artı Silahınızda/Ateşlinizda Şarjör Değiştirilimi Veya Belden Mermi çekilmeleri BOŞ Eylemle harcamasız Çerlirsiniz." },
                { level: 10, name: "Rapid Repair", desc_tr: "Silah Patlayıp / Sıkıştığında NORMAL Olarak Action Hakkı Çöpe atar iken; Artık bu REAKSİYON VEYA (BONUS ACTION) Kısmına geçilerek Siz Silah Tıkanmasına rağmen Saldırı Eyleminize Çat pat devam Edersiniz." },
                { level: 15, name: "Lightning Reload", desc_tr: "Silahınızdaki tüm Mermileleri (Reload= Şarjör fullenme işlemini) Action Yerine Bonus Eylemle yaparak, Tüm Eylem turunuzu (Actionunuzun hepsini) Düşmanı taramaya ayırtma yetkisi alırsınız." },
                { level: 18, name: "Vicious Intent", desc_tr: "Eşsiz Vuruş Zarı!. Silah Vuruş(Gun Atacklarda) Zar Artık ZAR=20 Değilde! 19 Veya 20 Attığında Kritik Hasara Biner. Ayrıca Sen Ne kadar ÇOK KRİTİK Atar O Düşman Parçalarsan Seni Havuzuna(Grit) Cephanesi Bedavadan Eklenir! Çevik Hız Şovu Devam Eder." }
            ]
        }
    ]
};
