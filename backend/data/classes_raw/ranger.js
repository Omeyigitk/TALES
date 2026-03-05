module.exports = {
    name: "Ranger",
    hit_die: "d10",
    primary_ability: "Dexterity & Wisdom",
    saves: ["Strength", "Dexterity"],
    armor_proficiencies: ["Light Armor", "Medium Armor", "Shields"],
    weapon_proficiencies: ["Simple Weapons", "Martial Weapons"],
    description_tr: "Vahşi doğanın avcısı, düşmanlarını gizlenerek uzaktan oklarla ya da iki elindeki bıçaklarla seri şekilde avlayan, doğa büyülere hakim uzman bir iz sürücü.",
    subclass_unlock_level: 3,
    features: [
        { level: 1, name: "Favored Enemy (veya TCoE Favored Foe)", desc_tr: "Belirli bir yaratık türünü (Örn: Ejderhalar, Ölümsüzler, İblisler veya 2 insansı ırk) Favori Düşmanın seçersin. İzi sürmek ve bilgi almakta Avantajlı olursun, dillerini öğrenirsin. (Opsiyonel: Favored Foe ile hedefini işaretleyip her tur ilk isabette 1d4 ekstra hasar vurabilirsin)." },
        { level: 1, name: "Natural Explorer (veya TCoE Deft Explorer)", desc_tr: "Orman, Dağ veya Çöl gibi 1 Favori Arazi seçersin. Burada grubun asla kaybolmaz ve yavaşlamaz. (Opsiyonel Deft Explorer: İstediğin 1 yetenekte Uzmanlık (Expertise) ve ilave diller kazanırsın)." },
        { level: 2, name: "Fighting Style", desc_tr: "Dövüş stilini belirle: Archery (+2 Menzilli silah isabeti), Defense (+1 AC), Dueling (+2 Tek el kılıç hasarı), Two-Weapon Fighting (İkinci el hasarına stat ekler) veya Blind Fighting (10 feet kör görüş)." },
        { level: 2, name: "Spellcasting", desc_tr: "Wisdom kullanarak Ranger (Doğa tabanlı) büyüleri okumaya başlarsın (Örn: Hunter's Mark, Cure Wounds, Pass Without Trace)." },
        { level: 3, name: "Ranger Archetype", desc_tr: "Dövüş ve avlanma konusundaki doğa felsefeni (Örn: Hunter, Beast Master, Gloom Stalker) seçersin." },
        { level: 3, name: "Primeval Awareness (veya Primal Awareness)", desc_tr: "Büyü slotu harcayarak 1 mil etraftaki canavarların türlerini sezersin. (Opsiyonel Primal Awareness: Hayvanlarla Konuşma gibi belirli büyüleri bedava öğrenirsin)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu (Ability Score) 2 artırabilir veya iki farklı yeteneği 1'er artırabilirsin (Maksimum 20). Alternatif olarak bir Feat seçebilirsin." },
        { level: 5, name: "Extra Attack", desc_tr: "Kendi turunda Attack eylemi aldığında 1 yerine peş peşe 2 kere vurabilirsin." },
        { level: 6, name: "Favored Enemy/Explorer Improvement", desc_tr: "Ekstra favori düşman ve arazi eklersin. (Opsiyonel Roving alırsan Hızın 5 feet artar; ayrıca Tırmanma ve Yüzme hızı kazanırsın)." },
        { level: 7, name: "Archetype Feature", desc_tr: "Seçtiğin arketipten seviye 7 özelliği gelir." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat al." },
        { level: 8, name: "Land's Stride", desc_tr: "Zorlu arazilerde (Büyüsel Olmayan Ağlar ve Dikenler vb) hızın yavaşlamaz! Büyülü Sarmaşıklardan ise hasar değil, kurtarma Zarlarına (Saving Throw) AVANTAJ kazanırsın." },
        { level: 10, name: "Hide in Plain Sight (veya Nature's Veil)", desc_tr: "Kamuflaj ile kıpırdamadan saklandığında +10 Gizlilik Puanına ulaşırsın. (Opsiyonel Nature's Veil: Bonus Eylem ile turun sonuna kadar Görünmez -Invisible- olursun! Wisdom modun kadar kullanılabilir)." },
        { level: 11, name: "Archetype Feature", desc_tr: "Archetype'inden 11. seviye özelliği." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır Veya Feat al." },
        { level: 14, name: "Vanish", desc_tr: "Bonus Eylemle saklanabilir (Hide) hale gelirsin. Üstelik büyülü araçlarla veya doğaüstü iz sürmeyle bile takip edilemezsin (Sen istemedikçe bıraktığın izler silinir)." },
        { level: 15, name: "Archetype Feature", desc_tr: "Seçtiğin alt sınıfın (Subclass) en son özelliği." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır Veya Feat al." },
        { level: 18, name: "Feral Senses", desc_tr: "Kör dövüş ustası. Göremediğin bir düşmana saldırırken (Sende Körlük veya o Görünmez olsa bile) Dezavantaj yemezsin! Düşman 30 feet yakınındaysa görünmezliklerini hiçe sayarak yerini kesin olarak bilirsin." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır Veya Feat al." },
        { level: 20, name: "Foe Slayer", desc_tr: "Avcının tepe noktası. Favori Düşmanına (veya Markladığın hedefe) her tur bir isabet veya hasar zarında Bilgelik (Wisdom) bonusunu BEDAVA ekleyebilirsin!" }
    ],
    subclasses: [
        {
            name: "Hunter",
            description_tr: "Ork ordularına karşı alan temizleyen veya devasa trolleri avlamak için canavar katili teknikleri barındıran uzman savaşçılar.",
            features: [
                { level: 3, name: "Hunter's Prey", desc_tr: "Avlanma tarzını seç: 1. Colossus Slayer (Canı tam olmayan hedeflere her tur ekstra 1d8 hasar vur!), 2. Giant Killer (Büyük boy düşman sana ıskalarsa Reaksiyon ile hemen sen ona vur!), 3. Horde Breaker (Birbirine yapışık iki düşmana saldırırken birine bedava ekstra saldırı hakkı!)." },
                { level: 7, name: "Defensive Tactics", desc_tr: "Savunma stili seç: 1. Escape the Horde (Sen kaçarken atılan fırsat saldırıları Dezavantaj yer), 2. Multiattack Defense (Sana isabet eden ilk saldırıdan sonra AC'n tur sonuna kadar +4 artar, comboyu bozar), 3. Steel Will (Korkutulmaya -Frightened- karşı Avantaj kazanırsın)." },
                { level: 11, name: "Multiattack", desc_tr: "Çoklu saldırı Seçeneği: Volley (Elindeki Okla/Menzilli silahla 10 feet içindeki HERKESE birer ok yağdır) VEYA Whirlwind Attack (Elindeki Kılıçla yanındaki HERKESE etrafında dönerek kılıç salla)." },
                { level: 15, name: "Superior Hunter's Defense", desc_tr: "Üstün Defans: 1. Evasion (Alan hasarlarından yarım veya sıfır hasar alma), 2. Stand Against the Tide (Bir düşman sana ıskaladığında saldırısını alıp yanındaki başka bir düşmana saptırarak ona vurdur!), 3. Uncanny Dodge (Bir saldırının hasarını Reaksiyonla yarıya indir)." }
            ]
        },
        {
            name: "Beast Master",
            description_tr: "Yanında kurt, ayı veya ejderhacık gibi sadık bir hayvan dostu ile tüm yolculuğu ve savaşı bir bütün olarak yapan doğa efendileri.",
            features: [
                { level: 3, name: "Primal Companion", desc_tr: "Sihirsel Güçlü Ruhhayvanı yaratırsın (Beast of the Earth, Sky veya Sea). Onu diriltmek kolaydır. Turunda Bonus Action harcayarak ona Saldırt, Koş (Dash) veya Kaçırırt (Disengage). Sen vururken hedefi çizer veya ısırır." },
                { level: 7, name: "Exceptional Training", desc_tr: "Hayvan dostunun (Companion) yaptığı saldırılar Büyülü (Magical) sayılır ve fiziksel dirençleri ezip geçer. Sen ona emir vermediğinde o kendiliğinden Dodge (Savunma) yaparak güvende kalır." },
                { level: 11, name: "Bestial Fury", desc_tr: "Hayvan dostunun içindeki vahşiliği tetiklersin! Ona Saldır (Attack) emrini verdiğinde artık 1 değil, peş peşe İKİ KERE (Multiattack) saldırı yapar." },
                { level: 15, name: "Share Spells", desc_tr: "Kendine yönelik bir büyü (Örneğin: Cure Wounds, Zehir Koruma, Haste vb) yaptığında, şayet hayvanın sana 30 feet yakınındaysa o büyü İKİNİZE BİRDEN etki eder (Çift Buff)!" }
            ]
        },
        {
            name: "Gloom Stalker",
            description_tr: "Karanlıkların içinde gizlenen ve savaşın başladığı ilk saniye düşmanın üzerine en ağır hasarı boşaltan ölümcül gölge avcıları.",
            features: [
                { level: 3, name: "Dread Ambusher", desc_tr: "Savaş başladığında (İlk turda) İnisiyatif zarına Bilgelik modülünü eklersin! Üstelik İlk turun boyunca Hızın 10 feet artar ve 1. turunda BİR EKSTRA SALDIRI DAHA atarsın (Ekstra atışın isabet ederse bir de bedava +1d8 Hasar verir)!" },
                { level: 3, name: "Umbral Sight", desc_tr: "Görme yeteneğin uçar! Karanlık Görüşü (Darkvision) kazanırsın (Zaten varsa mesafesi artar). DAHA ÖNEMLİSİ: Karanlık bir Zindanda veya Ortamdaysan, Darkvision kullanan yaratıklara GÖRÜNMEZ (Invisible) SAYILIRSIN!" },
                { level: 7, name: "Iron Mind", desc_tr: "Gölgeler zihnini sertleştirir. Wisdom (Bilgelik) kurtarma zarlarında (Save) Uzmanlık (Proficiency) kazanırsın (Büyülere karşı çok daha dirençli olursun)." },
                { level: 11, name: "Stalker's Flurry", desc_tr: "Avdan kaçılmaz! Turun sırasında bir saldırı (Attack) zarı atarken ISKALARSAN, hatanı anında telafi edip o saldırının YERİNE BOŞA GİTMEYEN yepyeni bir Saldırı daha savurabilirsin." },
                { level: 15, name: "Shadowy Dodge", desc_tr: "Karartı gibi sıyrıl. Bir düşman sana hasar atarken Isabet Zarı atmadan önce Reaksiyon (Reaction) vererek gölgelere bulanırsın, hedefin sana yapacağı o atışa otomatik DEZAVANTAJ (Disadvantage) verirsin." }
            ]
        },
        {
            name: "Horizon Walker",
            description_tr: "Farklı astral düzlemler arası ışınlanan, teleport olarak yaratıkları deşen Portal yürüyüşçüleri.",
            features: [
                { level: 3, name: "Planar Warrior", desc_tr: "Bonus Eylemle 30 feet içindeki bir hedefi işaretlersin. O tur ona yapacağın ilk Vuruş, tüm savunmaları delen SAF BÜYÜ TÜRÜ (Force Hasarı) olarak vurur ve ekstradan +1d8 (11. levelde 2d8) ekstra Saf Hasar yersin." },
                { level: 3, name: "Portal Lore", desc_tr: "Çevrende (1 mil) yeni açılmış veya var olan herhangi gizli bir Geçit (Portal) varsa onun yerini ve hangi boyuta gittiğini direkt hissedersin." },
                { level: 7, name: "Ethereal Step", desc_tr: "Bonus Eylemle fiziksel dünyadan 1 Turluğuna Ethereal Düzleme (Ruh formuna vb) geçiş yaparsın; o tur duvarların ve yaratıkların İÇİNDEN geçebilir, hasar almadan konumunu değiştirebilirsin." },
                { level: 11, name: "Distant Strike", desc_tr: "Işınlanarak savaşan makine! Saldırı (Attack) eylemi yaptığında HER BİR VURUŞUNDAN (OK/KILIÇ) önce veya sonra 10 Feet bedava IŞINLANABİLİRSİN! Eğer 2 farklı kişiye vurursan sana 3. hedefe beleş fazladan 3. Saldırıyı yapma hakkı verir!" },
                { level: 15, name: "Spectral Defense", desc_tr: "Sana yönelik bir saldırı isabet ettiğinde Reaksiyon kullanarak uzay-zamanla oynarsın ve aldığın o hasarı otomatik YARIYA BÖLERSİN (Resistance)." }
            ]
        },
        {
            name: "Monster Slayer",
            description_tr: "Canavarların zayıflığını öğrenmeye ve özellikle büyücüleri ile vampirleri avlamaya odaklı anti-büyü rangerları.",
            features: [
                { level: 3, name: "Hunter's Sense", desc_tr: "Eylem (Action) harcayarak rakibini incelersin! Onun hangi hasarlara Dirençli (Resistance), Hangilerine Bağışık (Immunity), hangilerine ise Zayıf (Vulnerability) olduğunu DM'den kesin olarak öğrenirsin." },
                { level: 3, name: "Slayer's Prey", desc_tr: "Bonus Eylemle düşmanı Odak Noktası (Prey) belle. O kişiye o tur yapacağın İLK silah vuruşuna her zaman ekstra 1d6 Hasar eklersin." },
                { level: 7, name: "Supernatural Defense", desc_tr: "Prey (Avın) belleğidin düşman senden kaçmak için Save atarsa veya SANA karşı bir Kurtarma/Kaçma(Save) atmanı gerektiren büyü(Spell) kullanırsa, O Zarlara hep +1d6 ekstra zar eklersin." },
                { level: 11, name: "Magic-User's Nemesis", desc_tr: "Sihir Avcısı! Biri Eylem ile Teleport/Işınlanma kullanmaya VEYA Büyü Atmaya (Spellcasting) çalışırsa Reaksiyonun ile onun zihnini bozarsın. Wisdom save fail yerse O BÜYÜ veya IŞINLANMA iptal olur, başarısızlıkla sonuçlanır." },
                { level: 15, name: "Slayer's Counter", desc_tr: "Eğer Prey (Hedefin) SANA BİR BÜYÜ/SALDIRI İÇİN Zar atmak üzereyse... O zar atmadan saniyeler önce REAKSİYON ile Sen ona önden 1 Ok/Kılıç çakarsın! Senin vuruşun tutarsa ADAM OTOMATİK ISKALAR/BÜYÜSÜNÜ FAILLER!" }
            ]
        },
        {
            name: "Fey Wanderer",
            description_tr: "Feywild'ın renkli ama manipülatif cazibesini taşıyan, sosyal durumlarda zeki ve savaşta perisel psikolojik hasarlar dağıtan kurnaz doğa okçuları.",
            features: [
                { level: 3, name: "Dreadful Strikes", desc_tr: "Her tur BAŞKA bir düşmana hasar vurduğun ilk seferde, onlara silahının ucuyla ekstra 1d4 (Büyüdükçe d6) Psişik (Zihinsel) Hasar eklersin." },
                { level: 3, name: "Otherworldly Glamour", desc_tr: "İnsanları çok rahat kandırırsın. İkna (Persuasion), Kandırma (Deception) ve Gösteri (Performance) yetenek zarlarına BİLGELİK (Wisdom) Puanını KENDİLİĞİNDEN eklersin! Artı olarak bunlardan birinde uzmanlık alırsın." },
                { level: 7, name: "Beguiling Twist", desc_tr: "Düşmanın Büyücüsü Kendi Tuzağına Düşsün! Bir düşman birine Charm(Kandırma) veya Frightened (Korkutma) zarı attırıp Hedef FAIL yemez de BAŞARIRSA... Sen Reaksiyonla bu boşluktaki büyü enerjisini alıp, 120 feet içindeki BAŞKA BİR ADAMI doğrudan Charm/Frightend edebilirsin!" },
                { level: 11, name: "Fey Reinforcements", desc_tr: "Peri Dünyasından yardım istersin. 'Summon Fey' (Peri Çağırma) büyüsünü otomatik öğrenirsin ve maddi materyal istemeden atıp bir Periyi hizmetine alabilirsin." },
                { level: 15, name: "Misty Wanderer", desc_tr: "Bedava Işınlanma ustası. Misty Step büyüsünü (Bonus Eylem ışınlanmasını) Wisom Modülün kadar bedava kullanırsın; üstelik her kullandığında yanındaki BİR DOSTUNU (Müttefik) da seninle beraber ışınlayabilirsin!" }
            ]
        },
        {
            name: "Swarmkeeper",
            description_tr: "Silahını çektiğinde arılar, periler veya vahşi böceklerden oluşan bir sürüyü silahına ve bedenine saran mistik komutanlar.",
            features: [
                { level: 3, name: "Gathered Swarm", desc_tr: "Saldırını yaptığında sürün harekete geçer (Turda 1 kez): 1. Böcekler hedefini ısırıp Ekstra Piercing (1d6) hasar vurur. VEYA 2. Hedefini sürükleyip 15 Feet GERİYE atarlar! VEYA 3. Sürü SENİ Kucaklayıp 5 feet güvenli bir noktaya taşır." },
                { level: 3, name: "Swarmkeeper Magic", desc_tr: "Sürü Büyüleri: Mage Hand sürüsü öğrenirsin. Ekstra olarak alan büyücüleri (Örn: Web / Zehirli Bulut / Böcek sürüsü) öğrenirsin." },
                { level: 7, name: "Writhing Tide", desc_tr: "Bonus Eylem ile sürü seni havaya kaldırır! Sana 10 feetlik Uçuş (Fly Speed) ve yerden süzülme (Hover) yeteneği verir. Tuzakları veya uçurumları umursamadan havalanarak uçarsın!" },
                { level: 11, name: "Mighty Swarm", desc_tr: "Sürünün gücü artar! Hasar veren sürü 1d8 ekstra hasara çıkar. İtiş gücü hedefin Yere Düşmesini (Prone) sağlayabilir. Kendinii taşıttığında ise sürü sana koruma kalkanı yapıp Yarı Siper (Half Cover / +2 AC) sağlar!" },
                { level: 15, name: "Swarming Dispersal", desc_tr: "Darbe aldığında Reaksiyon ile SÜRÜYE DÖNÜŞÜP DAĞILIR ve hasarı yarı yarıya düşürürsün(Resistance). Akabinde böcek bulutun 30 feet uzağa uçarak kendini saniyeler içinde baştan toparlar (Kusursuz bedava ışınlanmalı savunma)." }
            ]
        }
    ]
};
