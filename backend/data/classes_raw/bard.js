module.exports = {
    name: "Bard",
    hit_die: "d8",
    primary_ability: "Charisma",
    saves: ["Dexterity", "Charisma"],
    armor_proficiencies: ["Light Armor"],
    weapon_proficiencies: ["Simple Weapons", "Hand Crossbows", "Longswords", "Rapiers", "Shortswords"],
    description_tr: "Müzik, şiir ve sihir aracılığıyla dünyayı değiştiren, partisine ilham veren ve hem savaşta hem diplomaside eşsiz olan çok yönlü bir sanatçı.",
    subclass_unlock_level: 3,
    features: [
        { level: 1, name: "Spellcasting", desc_tr: "Charisma (Karizma) yeteneğini kullanarak Ozan (Bard) büyüleri yapabilirsin. Büyülerini müzik aletlerini çalarak veya şarkı söyleyerek odaklarsın." },
        { level: 1, name: "Bardic Inspiration (d6)", desc_tr: "Bonus Eylemle 60 feet içindeki bir dosta ilham (Inspiration) ver. Dostun sonraki 10 dakika içinde yapacağı herhengi bir saldırı(Attack), yetenek zarı (Skill) veya kurtarma zarına (Saving Throw) 1d6 (Artı Zar) ekleyebilir." },
        { level: 2, name: "Jack of All Trades", desc_tr: "Her işin ehli! Uzmanlığın (Proficiency) OLMAYAN herhangi bir yetenek zarına (Buna İnisiyatif / Initative Savaş Sırası zarları da dahil), Yeterlilik Bonusunun (Proficiency) yarısını eklersin." },
        { level: 2, name: "Song of Rest", desc_tr: "Kısa dinlenme (Short Rest) sırasında ilahi müzik çalarak dostlarının yaralarını sararsın. Dinlenmede can(Hit die) dolduran tüm dostların, ekstra 1d6 can (HP) kazanır." },
        { level: 3, name: "Bard College", desc_tr: "Uzmanlaşacağın Ozan okulunu (Örn: Lore, Valor) seçersin. Sana yetenek türünü belirleyen büyük güçler verir." },
        { level: 3, name: "Expertise", desc_tr: "Hali hazırda Uzman (Proficient) olduğun 2 yeteneği (Örn: İkna, Akrobasi) seç. Bu yeteneklerin bonusları İkiye Katlanır (Double Proficiency)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu (Ability Score) 2 artırabilir veya iki farklı yeteneği 1'er artırabilirsin (Maksimum 20). Veya Feat al." },
        { level: 5, name: "Bardic Inspiration (d8)", desc_tr: "İlham zarın 1d8 boyutuna yükselir." },
        { level: 5, name: "Font of Inspiration", desc_tr: "İlham hakların eskiden uzun dinlenmede dolardı; artık her KISA DİNLENMEDE (Short Rest) yeniden tamamiyle dolar." },
        { level: 6, name: "Countercharm", desc_tr: "Performans sergiliyerek zihin oyunlarını bozarsın. Action harcayarak müzik çaldığında 30 feet etrafındaki dostların Kokutulma (Frightened) veya Asık Olma (Charmed) etkilerine karşı AVANTAJLI atar." },
        { level: 6, name: "College Feature", desc_tr: "Ozan Okulu'ndan (Subclass) yeni bir özellik." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat al." },
        { level: 9, name: "Song of Rest (d8)", desc_tr: "Kısa dinlenme şifa şarkısı zarı 1d8 olur." },
        { level: 10, name: "Bardic Inspiration (d10)", desc_tr: "İlham zarın 1d10 boyutuna büyür." },
        { level: 10, name: "Expertise", desc_tr: "Fazladan 2 yeteneğinde daha Uzmanlık (Expertise) kazanırsın." },
        { level: 10, name: "Magical Secrets", desc_tr: "Oyunun En Güçlü Büyü Alma Yeteneği: D&D dünyasındaki HANGİ SINIF OLURSA OLSUN (Wizard, Paladin, Warlock, Cleric) onların listesinden seviyen yetiyorsa istediğin 2 büyüyü kalıcı öğrenirsin! (Örneğin Paladinin özel atının çağırma büyüsünü sen de atarsın)." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat." },
        { level: 13, name: "Song of Rest (d10)", desc_tr: "Kısa dinlenme şifa zarın 1d10 olur." },
        { level: 14, name: "Magical Secrets", desc_tr: "Herhangi bir sınıfın listesinden 2 adet yeni sihir/büyü daha öğrenirsin." },
        { level: 14, name: "College Feature", desc_tr: "Seçtiğin Ozan Okulu'ndan (Subclass) zirve özelliği." },
        { level: 15, name: "Bardic Inspiration (d12)", desc_tr: "İlham zarın limitini kırarak; 1d12'ye yükselir." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat." },
        { level: 17, name: "Song of Rest (d12)", desc_tr: "Kısa dinlenme şifa zarın maksimum boyutlanarak 1d12 olur." },
        { level: 18, name: "Magical Secrets", desc_tr: "Sınır Tanımaz: Sınıf kısıtlaması olmaksızın 2 büyü daha öğren (Wish, Meteor Mwarm gibi 9. Seviye devasa büyüleri bile seçebilirsin!)." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat al." },
        { level: 20, name: "Superior Inspiration", desc_tr: "Savaş inisiyatifi zarları atıldığında, eğer elinde hiç Bardic Inspiration kalmamışsa sana anında Hediye olarak 1 adet İlham kullanımı Hakkı sağlanır." }
    ],
    subclasses: [
        {
            name: "College of Lore",
            description_tr: "Büyü peşinde koşan, sözleriyle rakiplerini zayıflatan ve 'Magical Secrets' ile diğer sınıfların en güçlü sihirlerini erken çalan bilgin Ozanlar.",
            features: [
                { level: 3, name: "Bonus Proficiencies", desc_tr: "Bedavadan istediğin 3 adet yetenekte (Örn: Perception, Arcana) uzmanlık alırsın." },
                { level: 3, name: "Cutting Words", desc_tr: "Düşmanına ani bir hakaret savur! Reaksiyon kullanarak Bardic Inspiration zarını; bir düşmanın saldırı(Attack) zarı veya Yetenek(Skill/Hasar) zarından düşürerek onun başarısız olup ıskalamasını veya az hasar vermesini sağlarsın." },
                { level: 6, name: "Additional Magical Secrets", desc_tr: "Bilgeliğin meyvesi. DİĞER OZANLARDAN ÇOK DAHA ÖNCE (Lv 6'da), İstediğin HERHANGİ İKİ SINIFIN büyü listesinden 2 büyü kaçırır (Öğrenir) ve kendi listene katarsın(Fireball, Counterspell vb)." },
                { level: 14, name: "Peerless Skill", desc_tr: "Kendisinin en büyük İlhamı! Kendi attığın Skill Check (Yetenek Zarında) kendi kendine İlham (Bardic Zarını Ekleterek) sonucunu güçlendirebilir, ikna veya araştırmalarda kusursuz olursun." }
            ]
        },
        {
            name: "College of Valor",
            description_tr: "Meydan muharebesinde kılıcı ve şiiriyle ön saflarda yer alan, ağır silahşörlerle ve zırhlarla birlikte dövüşen savaş ozanları.",
            features: [
                { level: 3, name: "Bonus Proficiencies", desc_tr: "Orta Zırhlar (Medium Armor), Kalkan (Shields) ve Tüm Askeri (Martial) silahları Kullanma ehliyeti kazanırsın." },
                { level: 3, name: "Combat Inspiration", desc_tr: "Dostlarının savaşına ilham ver. İlham verdiğin dostun O ZARI silah HASARINA ekleyerek zarı büyültebilir, Ya da kendisine yapılan bir Vuruş zarında REAKSİYON ile onu Zırhına (Kalkan puanına) ekleyerek darbenin ISKALAMASINI sağlayabilir." },
                { level: 6, name: "Extra Attack", desc_tr: "Kendi turunda Attack Action (Saldırı Eylemi) aldığında, Tek Vuruş yerine İKİ VURUŞ yapabilirsin." },
                { level: 14, name: "Battle Magic", desc_tr: "Aksiyon harcayarak bir Büyü (Spell) attığında, Bonus Action (Hızlı eylem) harcayarak hedefe kılıcınla fiziksel savaş saldırısı çakabilirsin." }
            ]
        },
        {
            name: "College of Glamour",
            description_tr: "Feywild'ın (Peri Diyarı) cazibesi ve büyüleyici güzelliğiyle kalabalıkları aşığı yapan, zihin büken çekici elfler ve periler.",
            features: [
                { level: 3, name: "Mantle of Inspiration", desc_tr: "Bonus Eylemle sahneye çık: Karizma modün kadar dosta Geçici (Temp) Can dağıtırsın. Daha da önemlisi o dostlar Anında REAKSİYONLA yürüme(Konum Alma/Dash) hakkı kazanır ve Opportunity (Fırsat kaçış) zarı YEMEZLER." },
                { level: 3, name: "Enthralling Performance", desc_tr: "1 Dakikalık dans-şarkı ile dinleyen herkesi BÜYÜLERSİN! Wisdom save yemezlerse Sana KALICI (Charmed /Aşk-Hayranlık) durumu Beslerler. İdolün olurlar ve bir daha onlara yanlış şeyler yapsan bile seni savunurlar." },
                { level: 6, name: "Mantle of Majesty", desc_tr: "Perilerin Güzellik Modu (1 DK): Bonus Eylem harcayarak bu formdayken BÜYÜ SLOTU (Level) harcamadan Bedavaya Command (Emret!) Büyüsü sallayabilir, düşmanları Diz çöktürtüp yere süründürürsün." },
                { level: 14, name: "Unbreakable Majesty", desc_tr: "Senin güzelliğine Kimse vuramaz: Kendini koruyan peri aurası açarsın(1Dk). Biri SANA VURMADAN ÖNCE Charisma Save Atmak Zorundadır. Başaramazsa Kılıcını İndiremez Vuruşu YARIM KALIR VE SEN YERİNE Başka bir adama Vurur Veya Iska Saydırırsın!" }
            ]
        },
        {
            name: "College of Swords",
            description_tr: "Seyyar kılıç cambazları; çift kılıçlarıyla sahnede jönlük yaparak hem düşman deşen hem şovla savunmasını arttıran düellocular.",
            features: [
                { level: 3, name: "Bonus Proficiencies", desc_tr: "Orta Zırha ve Scimitar (Pala) Kılıçlarına ehliyet. Kılıcını Bard büyüsü yaparken (Asa veya Odak Taşı) gibi Büyüsel Materyal niyetine kullanabilirsin." },
                { level: 3, name: "Fighting Style", desc_tr: "Dueling (+2 Tek el silah hasarı) Veya Two-Weapon Fighting (İkinci ele mod ekleme) Dövüşünden birini al." },
                { level: 3, name: "Blade Flourish", desc_tr: "Kılıç Dansı: Vururken hızın 10FT artar. Kılıçla Adama ISABET ettirirsen 1 İlham Zarı yakarak Şov Yaparsın -> 1(Defensive- Vurduğun zarar artı O Zar kadar Kendi Defansını/AC ni arttırır) 2(Slashing- Yanındaki adamlara da aynı kılıç sektirme hasarını uygularsın) 3(Mobile- Düşmanı Puan kadar GERİ fırlatırsın)." },
                { level: 6, name: "Extra Attack", desc_tr: "Kendi turunda Attack eyleminde 2 Kılıç (Saldırı) hareketi gerçekleştirme hakkı." },
                { level: 14, name: "Master's Flourish", desc_tr: "Kılıç Dansları Mükemmelleşti. Artık Kılıç Dansı Şovu(Defans/Yere itme vb) Yaparken Senden İLHAM (Bardic inpiration zar havuzun) Eksilmeyecektir. Sen Havuzdan Harcamak Yerine BEDAVA D6 zarı Olarak Sonsuza Kadar o Şovu yaparsın!" }
            ]
        },
        {
            name: "College of Whispers",
            description_tr: "Ozanlık becerilerini şantaj, suikast ve psikolojik dehşet için kullanan; zihin zehirleyen ölümcül gizli ajanlar.",
            features: [
                { level: 3, name: "Psychic Blades", desc_tr: "Rogue'ların Sinsi Atışı (Sneak Attack) gibi! Silahla bir düşmana İSABET ETTİĞİNDE 1 İlham yakarak silahının Ucuna Gölgeler Bulaştırır ve düşmana (Extradan 2d6 Psişik zihin hasardı) fırlatırsın. Level büyüdükçe bu hasar (8d6'ya) çıkar." },
                { level: 3, name: "Words of Terror", desc_tr: "Masumane bir sohbet! 1 Dakika biriyle konuştuktan Sonra O adama Mistik bir Paronaya yerleştirirsin. Wis Save Kurtaramazsa Sen kimin (Kimin ismini Verirsen ondan Veya Senden) Korkuya (Frightened Mode) Girerek 1 SAAT Titrer!" },
                { level: 6, name: "Mantle of Whispers", desc_tr: "Gölge Hırsızı. Yanında Biri ÖLDÜĞÜ Vakit O adamın Gölgesini çalarsın. Çaldığında 1 SAAT Boyunca Tipin/Ceketin/Sesin Kısaca Sen DEĞİŞİR 'ÖLEN O KİŞİ' GİBİ Görünürsün. Kusursuz Casuslar, herkes seni o adam olarak hatırlar! " },
                { level: 14, name: "Shadow Lore", desc_tr: "Adamın Şantajını öğren! Aksiyonla 1 Karakterin Gördüğü en Karanlık sırrını bilirmiş gibi Ona FISILDARSIN. Zavallı yaratık Wis Save kaybederse; 8 SAAT BOYUNCA Kendi canı tehlikesi hariç Tüm Emirlerine İtaat eden(Charmed) şantajlanmış Hizmetkarın olur." }
            ]
        },
        {
            name: "College of Creation",
            description_tr: "Müziği fiziksel yaratıma dönüştüren, hiçlikten eşyalar yaratan ve eşyaları canlandıran büyüsel heykeltraş/ressam ozanlar.",
            features: [
                { level: 3, name: "Mote of Potential", desc_tr: "Verdiğin Klasik İlham Zarında (Müzik Perisi/Notası Belirir). O Zarı DOSTUN ATTIĞINDA Ekstralar Sağlar: 1.Yetenek İse ZARI ÇİFT Atıp İyisini seçer. 2. Atak Zarı ise ZAR patlayıp YANINDAKİLERE GÖK GÜRÜTÜLÜ (Paticik zar kadar) Hasar saçar. 3. Saving İse Ona Vurduğu Zar Kadar Anında Geçici Ufak bir HP (Kalkan) verir." },
                { level: 3, name: "Performance of Creation", desc_tr: "HAVADAN OBJE ÇAĞIRMA (Yaratılış Şarkısı): Ozan Leveline bağlı boyutlarda GP/Maliyet kısıtı olan HERHANGİ BİR EŞYAYI (Araba / Sandık / Kılıç / Ayna vb) Elinde Çıkarabilirsin! Obje yarı saat kalana Kadar varlığını (Sahtesini) belli etmez çalışır!" },
                { level: 6, name: "Animating Performance", desc_tr: "Animasyon/Masal Vakti. Yerdeki Masayı / Halıyı Objeyi CANLANDIR! Seni koruyan, Dans eden Evcil (Dancing Pet Yaratık) Yap! Statları Mükemmel ve Savaşa Kendi Karakteriymiş gibi dalıp, senin komutunla (Bonus Action) Düşmanına vurmaya başlar." },
                { level: 14, name: "Creative Crescendo", desc_tr: "Havadan Sentezlediğin O Eşyaların Maliyet ve GP fiyatı SINIRI KALKAR! Üstelik 1 Yerine (Kozmik Limit olan) 5 ADET Ayrı eşya (Dev Bir Altın gemi Gibi) Sentezleyebilecek Kadar İlahlaşırsın." }
            ]
        },
        {
            name: "College of Eloquence",
            description_tr: "Konuşarak kralları diz çöktüren, sözcükleriyle düşman zırhlarını değil argümanlarını ve iradelerini parçalayan eşşsiz hatipler.",
            features: [
                { level: 3, name: "Silver Tongue", desc_tr: "Tatlı dil yılanı deliğinden Çıkarır! Sende İkna(Persuasion) veya Kandırma(Deception) Yalan Söyleme Zarında Eğer attığın Zar 1 ile 9 aralığında Küçük Gelse Bile ZAR SİSTEMSEL OLARAK KENDİNİ OTOMATİK 10 ÜZERİNE ATAR! (Örn 1 Atarsan-> 10'A tamamlanıp Stat Bonusu (Eklenir=22 vs). Hata yapmaz diplomsı yaparsın!." },
                { level: 3, name: "Unsettling Words", desc_tr: "Kelimelerinle Zehirle. Bonus eylemle İlham Zarı Yak. Bunu Düşmana Olan Nefret/Hakaretle ÇAK. Ve Düşman ÜZERİNE ATACAĞIN Bir SONRAKİ NE OLURSA OLSUN SAVING THROW'dan O İlham Zarını EKSİLTEREK ADAMIN KURTULMA ŞANSINI MİNUMUMA ÇEK! (Kesin Tutacak büyülerin Kilidi)!" },
                { level: 6, name: "Unfailing Inspiration", desc_tr: "Kesintisiz İlham: Eğer bir Dostun senin İlham (Bardic) Zarını savaşta kullandı VE Buna Rağmen ISKALADI veya BAŞARISIZ OLDUYSA, Zar KAYBOLMAZY Yada Tüketilmez!!. Dostun Zarını kaybetmemiş oşduğu için O İLHAMI Başka tur Saklayıp kullanabilir." },
                { level: 6, name: "Universal Speech", desc_tr: "Uzaylı bile seni anlar. Action Harcayarak Karizma modülün kadar Kişiye (Uzay / Animal / Canavar vb) büyüsel bir Konuşma Lisanı atarsın. Sen Düz Kendi Dilini Konuşsan da ONLAR SENİ KENDİ DİLLERİNDE VE ANADİLLERİ Gibi Sular seller Gibi Anlarlar!" },
                { level: 14, name: "Infectious Inspiration", desc_tr: "Bir İlham Çarkeliği! Dostunun Attığı Bir İLHAM ZARI (Savaş veya bir Teste) MÜKEMMEL BİR Başarıyla Zafere Kavuştuğunda: Sen Reaksiyon kullanarak (Havuzundan EKSTRA 1 Bardic ILHAM Harcamadan BELEŞE) 60 FeeTteki BAŞKA Birisine Havadan Yeni İlham Zarı verebilirsin (Toplam Karizma puanı limitnde)!" }
            ]
        },
        {
            name: "College of Spirits",
            description_tr: "Ölülerin ruhlarını çağırıp efsanelerini ve güçlerini aktaran, medyum ve gizemli mit anlatıcılarının destansı geleneği.",
            features: [
                { level: 3, name: "Guiding Whispers", desc_tr: "Guidance Cantrip'ini bedava öğrenirsin. Bu cantrip'i normal 5 feet yerine tam 60 feet uzaktan atabilirsin (Ruhaniler sana fısıldar)." },
                { level: 3, name: "Spiritual Focus", desc_tr: "Bir Kristal Küre, Mum veya Tarot Destesi (Fortune-telling focus) sihirli odaklanman olur. Bunu aracılığıyla attığın Bard büyüleri hasarına Proficiency Bonusunu eklersin!" },
                { level: 3, name: "Tales from Beyond", desc_tr: "Spiritüel Masallar: Bardic İlham Zarın kullanarak Listeden Rastgele (Zara Bağlı) Ruhlardan Gelen dev Güçler 1'er kez kullanırsın: İnsanlık Efsanesi (Inspirasyonel Şifa), Savaş Destanı (Bonus Saldırı), Kehanetin Sesi (Advantage on Check) gibi hayatın farklı hikayelerine atıfta bulunan mucizeler kazanırsın." },
                { level: 6, name: "Spirit Session", desc_tr: "1 Saatlik Ritueli tamamladıktan sonra canlılardan veya ölülerden bir ruh çağırırsın. O ruh sana (Bard + Wisdom kombinasyonuna göre) belirli sayıda büyü bağışlar. Bu büyüler gün boyunca kullanılabilir." },
                { level: 14, name: "Mystical Connection", desc_tr: "Tales from Beyond ile ruh çağırdığında, zarın sonuçlarından biriyle kalmak zorunda değilsin: İstersen o zarı yeniden atıp Farklı bir Ruh Masalı efektini kullanabilirsin (İkinci çıkan kesinlikle geçerlidir)." }
            ]
        }
    ]
};
