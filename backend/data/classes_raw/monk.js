module.exports = {
    name: "Monk",
    hit_die: "d8",
    primary_ability: "Dexterity & Wisdom",
    saves: ["Strength", "Dexterity"],
    armor_proficiencies: ["None"],
    weapon_proficiencies: ["Simple Weapons", "Shortswords"],
    description_tr: "Bedenini ve zihnini kusursuz bir uyum içinde eğiten, çıplak elleriyle ve Chi (Ki) enerjisiyle savaşan doğulu dövüş sanatları ustası.",
    subclass_unlock_level: 3,
    features: [
        { level: 1, name: "Unarmored Defense", desc_tr: "Hiçbir zırh giymediğinde ve kalkan kullanmadığında Zırh Sınıfın (AC), 10 + Çeviklik (Dex) + Bilgelik (Wis) modifiye edicilerinin toplamı olur." },
        { level: 1, name: "Martial Arts", desc_tr: "Çıplak ellerinle (Unarmed Strike) veya Monk silahlarıyla (Örn: Shortsword, Quarterstaff) saldırırken özel avantajlar kazanırsın. Güç (Str) yerine Çeviklik (Dex) kullanabilirsin. Silah hasarın yerine Monk Hasar Zarını (d4, seviye arttıkça d10'a kadar büyür) kullanabilirsin. Eylem (Action) olarak saldırdığında, Bonus Eylem harcayarak bedavadan 1 tekme/yumruk daha atabilirsin." },
        { level: 2, name: "Ki", desc_tr: "İçindeki manevi enerji olan 'Ki' havuzunu kontrol edersin. Monk seviyen kadar Ki puanın vardır. Bu puanları harcayarak muhteşem teknikler yapabilirsin. Kısa veya Uzun dinlenmede tamamen dolar." },
        { level: 2, name: "Ki: Flurry of Blows", desc_tr: "1 Ki puanı harcadığında, turunda Attack eyleminden HEMEN sonra Bonus action kullanarak 1 yerine İKİ (2) ekstra yumruk/tekme daha atıp kombo yaparsın." },
        { level: 2, name: "Ki: Patient Defense", desc_tr: "1 Ki puanı harcayarak, Bonus eylem olarak 'Dodge' (Savunma/Kaçınma) eylemini alırsın. Sana yapılan tüm saldırılar dezavantajlı olur." },
        { level: 2, name: "Ki: Step of the Wind", desc_tr: "1 Ki puanı harcayarak, Bonus eylem ile 'Dash' (Koşma) veya 'Disengage' (Güvenle Geri Çekilme) eylemi atarsın. Ayrıca atlama mesafen iki katına çıkar." },
        { level: 2, name: "Unarmored Movement", desc_tr: "Zırh giymiyorsan hızın (Speed) +10 feet artar (Artış seviye ilerledikçe daha da büyür)." },
        { level: 3, name: "Monastic Tradition", desc_tr: "Felsefene uygun bir Manastır Geleneği (Subclass) seçersin (Örn: Way of the Open Hand, Way of Shadow)." },
        { level: 3, name: "Deflect Missiles", desc_tr: "Üstüne atılan oklara ve mermilere reaksiyon vererek havada tutup hasarını dondurabilirsin. Zararın (1d10 + Dex modifier + Level) azalır. Hasar sıfıra inerse o ok/mermiyi yakalar ve 1 Ki puanı ile ona geri fırlatarak (onu vurabilirsin)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat al)." },
        { level: 4, name: "Slow Fall", desc_tr: "Yüksekten düştüğünde reaksiyon atarak aldığın düşme hasarını (Monk Seviyen x 5) kadar azaltırsın. Şelaleden atlasan bile dik düşebilirsin." },
        { level: 5, name: "Extra Attack", desc_tr: "Turunda standart Saldırı (Attack) eylemi aldığında 1 yerine 2 kere saldırırsın (Bonus action yumrukları bu sayıya dahil değildir!)." },
        { level: 5, name: "Stunning Strike", desc_tr: "Efsanevi Monk vuruşu. Yakın dövüşte bir düşmana isabet ettirdiğinde 1 Ki puanı harcayabilirsin. Hedef Con kurtarma zarı atar, başarısız olursa sonraki turun sonuna kadar STUN(Sersemleme - Felç durumu) yer. Hareket edemez ve ona yapılan her vuruş AVANTAJLIDIR." },
        { level: 6, name: "Ki-Empowered Strikes", desc_tr: "Çıplak el yumruk/tekmelerin artık doğal olarak büyü direnci olan düşmanlara hasar verebilmek için (Büyülü Silah - Magical) sayılır." },
        { level: 6, name: "Tradition Feature", desc_tr: "Seçtiğin Manastır Geleneği Alt Sınıfından (Subclass) özellik kazanırsın." },
        { level: 7, name: "Evasion", desc_tr: "Bir büyücü üstüne alan ateş topu vs(Dexterity Save isteyen büyü) attığında çevikliğinle sıyrılırsın. Başarılı atış yaparsan YARIM değil, sifir (Sıfır) hasar alırsın. Zar atışını bile ıskalasan sadece yarım hasarla kurtulursun." },
        { level: 7, name: "Stillness of Mind", desc_tr: "Eylem (Action) harcayarak üstündeki mevcut bir Korkutulma (Frightened) veya Charmed durumunu zihinsel dinginlikle silebilirsin." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat." },
        { level: 9, name: "Unarmored Movement Improvement", desc_tr: "Sıvıların (Su, bataklık) üzerinde koşabilir ve dik duvarda düşmeden koşarak tırmanabilirsin." },
        { level: 10, name: "Purity of Body", desc_tr: "Bağışıklık kazanırsın! Hastalıklar ve her türlü zehre karşı tamamen doğuştan dirençlisin (İmmünite)." },
        { level: 11, name: "Tradition Feature", desc_tr: "Seçtiğin Alt Sınıftan 11. seviye yeteneği." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat." },
        { level: 13, name: "Tongue of the Sun and Moon", desc_tr: "Zihin telepatisi başlar. Konuşulan HERHANGİ BİR DİLİ anlar ve söylediğin her düşünceyi her varlığa kendi dilinde anlaşılır kılabilirsin." },
        { level: 14, name: "Diamond Soul", desc_tr: "Tüm Kurtarma Zarlarına (Saving Throws, Death saves dahil) doğuştan sahip ol (Uzmanlık al) ve başarısız olduğun zarı 1 Ki puanı Yakarak bir kez Reroll at (Yeniden salla)." },
        { level: 15, name: "Timeless Body", desc_tr: "Hücrelerin yaşlanmayı durdurur (Öldüremez ama yavaşlatır). Yaşlılık eksikleri işlemez ve hiç yiyecek/suya ihtiyaç duymazsın." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat." },
        { level: 17, name: "Tradition Feature", desc_tr: "Seçtiğin Manastır Geleneğinin nihai vuruşu/özelliği." },
        { level: 18, name: "Empty Body", desc_tr: "Action ve 4 Ki Puanı harcayarak Astral/Ruhani formuna bir dakika için Görünmez (Invisibility) ve Kuvvet(Force hasarı) dışındaki her şeye karşı Direnç alırsın (Tam Resistance kalkanı). 8 Ki ile uzay astral harita formuna seyahat planları falan eklersin." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat." },
        { level: 20, name: "Perfect Self", desc_tr: "Savaş başlangıcında Ki enerjin SIFIR İse sana beleşe (Anında) 4 Ki puanı zerk edilir." }
    ],
    subclasses: [
        {
            name: "Way of the Open Hand",
            description_tr: "Klasik silahsız dövüşün, Bruce Lee tarzı çıplak el vur-kaç dövüşlerinin piri. Vücudun limitlerini Ki enerjisiyle kontrol eden geleneksel monklar.",
            features: [
                { level: 3, name: "Open Hand Technique", desc_tr: "Flurry of Blows (Ki yumruğu) kombosu attığında, RAKİBE İLAVE BİR CEZA VUR! Kilit adamlara Seç: 1. Dexterity save attır, tutturamazsa Prone düşür. 2. Strength save attır; başaramazsa onu Kışkırtma İterek (15 FT) Uzağa Geri Fırlat. 3. Hiç savunmasızca o adam senin Reaksiyon/Fırsat Kılıç Ataklarını ÇOK ÇEKECEĞİ İçin (Sana fırsat hakkı atmasına mani koy)." },
                { level: 6, name: "Wholeness of Body", desc_tr: "Uzun dinlenme (Long rest) başına 1 kere Eylem(Action) tuşu ile Vücuduna Sakil Ruhani enerji sokup (Monk level x 3) HP değerinde Sağlıklı Cansuyunu yenilersin." },
                { level: 11, name: "Tranquility", desc_tr: "Uzun dinlenmeden kalktığında her sefer (Savaş Başlamadan). (Sanctuary) Korunma Duası/Büyüsü ile bedeni kaplanmış sayılır. Sana(Kuşlara) ilk Ateş eden Sana saldırmadan EVVEL Wis Save'e takılır ve Sana saldırma eyleminden CAYAR!" },
                { level: 17, name: "Quivering Palm", desc_tr: "EN ÖLÜMCÜL Teknik. Bir Düşmana silahsız isabetli vurduğunda 3 Ki harcayıp, onun Vücuduna titreşen görünmez ölümcül bir enerji (Ki) bırakırsın. Etki güncel kalır(Monk day max). VE SEN İSTEDİĞİN ZAMAN 1 EYLEM İLE o enerjiyi tetiklediğin saniyede: Düşman CON zarı atar. KAYBEDERSE HP'si anında (0 Olur, DİREKT ÖLÜR) / Zarı kurtarsa Bile (TAM 10d10 Necrocit/Acı Hasarı kalır!). Anime (You Are Already Dead) misalindeki eşdeğer vuruştur!" }
            ]
        },
        {
            name: "Way of Shadow",
            description_tr: "Rogue ve ninja öğretisi. Gölgelerin arasında kaybolan, karanlıktan ışınlanan sinsi casusların gölge suikastçilerinin yolu.",
            features: [
                { level: 3, name: "Shadow Arts", desc_tr: "2 Ki Enerjini yakarak Kendi üzerine ya da zihnine: Darkness (Büyülü Karanlık Alan yaratma), Darkvision(Görme), Pass without Trace (Takıma +10 İz bırakmayan Stealth) veya Silence (Sessizlik mühürlemesi) büyülerini (Söz/Ses Malzemesi ÇIKAN SIFIR EFEKTLE) okuyabilirsin. Ayrıca Minor Illusion (Ufak Görüntü yanılması) Cantribi de hediyedir!" },
                { level: 6, name: "Shadow Step", desc_tr: "Bir Gölgeli yâhut Loş/karanlık bölgedeyken, (Bonus Eylemle) Etrafındaki Başka Bir Karanlığa/Gölgeliğe TAM (60 Feet mesafe anında) IŞINLANIRSIN (Teleporting Jump)! Ve Bir de ışınlanma sonrası Adamlarına(Vuracağınız zaman ilk Hasar için) AVANTAJ Alırsınız." },
                { level: 11, name: "Cloak of Shadows", desc_tr: "Loş veya Gölge bölgesinde Eylemle(Action tuşu). Bir hamlede Kendinize görünmezlik(Invisibility) Açabiliyorsunuz, hiç Ki Puanı Maaliyeti Yok!. Bu siz Savaşta Silah çekene yahut büyüyü atana dek Bedava devam edecek." },
                { level: 17, name: "Opportunist", desc_tr: "İhtilaflı Casus. Ne zaman Sizden Başka Bir Dostunuz (Örn Fighter vs.) Aranızdaki 5 Fette Bulunan Bir RAKİBE vuruş sağlarsa/İsabetlendirip Hasar verirse. Sen (Reaksiyonunu patlatlatıp) O Hasar yiyip sersemleyen adama Ekstrdan 'Araya Katılan' BELEŞ BİR Cİlasız MELEE Tokadı Savurtursun." }
            ]
        },
        {
            name: "Way of the Sun Soul",
            description_tr: "Ki enerjisini parlayan koca bir ışık hüzmesine dönüştürüp uzaktan avuç içinden ateşleyen, aydınlığın hızlı okları.",
            features: [
                { level: 3, name: "Radiant Sun Bolt", desc_tr: "Hava Kuvveti Yumruğu!! (30 Feet uzağındaki) Birime Saf Beyaz Parlar ışın vuruşu Fıyıtlatırsın (Radiant Damage= Dexterity vurur/Normal Monk yumuruğu statlarıyla uzaktan mermi sallar). Hem de Atackta! Artı Bonus Eylem(Tıpkı Flurry blow -Ki ) Harcarsan O Uzak mesafedeki adamlara 2 Tane birden Lazer Ok'u göndertmeyi ekletirsn!" },
                { level: 6, name: "Searing Arc Strike", desc_tr: "Attack vuruşlarından Hemen sonra, Reaksiyon(Bonus Eylem) Çekerek +2 Ki harcar VE Avuçlarını Birleştirirsin!!! İçinden TAM BİR 'Burning Hands' Vüyüsünü Düşmanın suratında Yakarsın Fire Dmg!" },
                { level: 11, name: "Searing Sunburst", desc_tr: "Eylem ile 150 Feet E! Dev(Fireball GİB) PArllayan Lazer Topu FIRLAT! (20 ft Çarpıp patlayan Çaplı küre!). Tutanlar (CON Zarını ıskalarsa= 2d6 Mermi zarı Yerler) Ayrıcana Bunu Ne kadar ÇOK Ki puanıyla besleyip (Ek Ki koyarsan-Maks3 Ki ye kadar-) Merminin İÇİNDEKİ HASAR O DENLİ Güçleşip patlar. (Ki yokken beleşe sonsuz defa düz lazeri sallarsın zati 0 maaliyetle)." },
                { level: 17, name: "Sun Shield", desc_tr: "Süper Sayan Modu. Parıltılı bir IŞIK KÜMÜSÜ Sizi Sarar! 30 Feette Fener Gİbİ parlarsın). VE Bu Formu AÇTIYKSAN! Biri Seni gelip Yakın/Melee yumrular Döver Vururas SANA DEĞDİĞİ SIRADA Reaksiyonunu kullanarak Adamları Direk Çarpıp İTİCİ RADIANT(5+Wis Bonusun Kadarn Net Haserle/Hasarla ATEŞE VE IŞIYAN KÜLEYE Cızlatsırsın!!" }
            ]
        },
        {
            name: "Way of the Drunken Master",
            description_tr: "Sarhoş dövüş stilini taklit ederek sendeleyen hareketlerle kılıçların arasından kayan düzensiz, akrobatik kombo monkları.",
            features: [
                { level: 3, name: "Bonus Proficiencies", desc_tr: "Performance(Dans vs Eğlenme/Yeteneklerİ Skilli!) Ve Brewer's supplies (İçki Demleme ustalık ehloyetinede bedava Uzanırlar)." },
                { level: 3, name: "Drunken Technique", desc_tr: "Sarhoş Hızlı! Sen Flurry OF bLOWS (Kombo seri Yumrukları Attığın saniyede SADECE Hasarla KAlmaz!) + O Tur Koşu(Speed) değerinize 10 feet ek hız Sağlanırken Sizi Etkileyenleri Sarstıran DISENGAGE statülü (Savaşdan çıkarken Hasar ALMADAN-Oportunity zarı yemeden Yürüme) kaçışı sunulur!" },
                { level: 6, name: "Tipsy Sway", desc_tr: "1. Leap to Ft(Anında Kalk!): Prone(Yere KapaKlanıp Bayılanlardan / Düşenerdenken Ayağa Kalkmak MEsafenizin yarısıdır) Siz Sadece (5FT Maaliyele Sarhoşça Geri dirilir ayaklanırsınız!). 2(Redirect Taktik): Sana Olan Bir Atak Zarını(Adam Iskaladığında!) 1 KI PUANIyla RAKİBİN GÜCÜNÜ(Yanınızda Durak BAŞKA Bir düşmana Çarpmasını Ve Saldırının ONA YAPILMASINI Saçlatır - Zekice Dürter)." },
                { level: 11, name: "Drunkard's Luck", desc_tr: "Şans Sizinle. Şayet Atıcağınız Savunan ZAar(Saving Throws)'larda Veya Attack Ve Becerileri Karşısında İstersenız Dezavantaja Sahipseniz(Kör olmuşsunuz vb) 2 Kİ(Enerjisi) Yaktıktan(Sonra / Reaksiyoa İptali) O DEZAVANTAJDAN Feragat eder Zarı NORMAL Atma kurtuluşuna ulaştırırsın!" },
                { level: 17, name: "Intoxicated Frenzy", desc_tr: "Füzyon Serisi Kombosu. FLURRY OF BLOWS (Ki Enerjiyisiyle Açtıgınız Exta İkili saldırılar Turu İçiddeykkrn!) İkinin Aksına Sen Atak O Turunda TOPLAM 5 (BEŞŞŞ TANE!!) RAKİBE AYRI AYRI ZAR / YUMRUK GEÇİRME İMKANINA YÜKSELİRSİNİZ. SADECE Her vurduğunuz hedefin 'AYRI FARKLI ADAMLAR/Mobloar Olması gerekmektedir." }
            ]
        },
        {
            name: "Way of the Kensei",
            description_tr: "Bedenleri değil, doğrudan tuttukları 'silahlarla' usta kılıç tekniğine erişen; kılıç azizlerinin/yay ustalarının ölümcül tekniği.",
            features: [
                { level: 3, name: "Path of the Kensei", desc_tr: "1. İki Adeyt Klasik Olmayan Silahı(Seviyeli Sword Veya Yay'ı) 'Kensei Weapons Veya Silahı Yapar! 2: Bu Kenseji Yaptuğn O Kılıcı Süs Olarak elinde taşırken (Silahsız/TEkmeyle Birine vururasn Dövüşte! Eline KESNEİ silahından Zırsh (+2 AC TANK Kalkna Puanı) İlan Eder / Kısaca defabs basar). İster kılıçla vur ister ok atta hasarı Monk hasar zarına modüle ETttit. Ve Özel Artistlik Çizim Ustalığı Alırsınız (Painteers falan)." },
                { level: 6, name: "One with the Blade", desc_tr: "Sanattaki Silahı. 1. KENSEİ SİLAHLARINIZIN Hepsi Sihirli(Magic Damage Weapon Direnç Kırıcı). 2 (Deft Strike!): Hasar Giren Saldırıyla kestiğiniz ADAMA / KI Enerjisi YAKIP Hasarına (İlave Olarak Sınıfınızın O MONK Vurma ZARINI) Bonus Extra Hasar/Darmage Olarak EKLERSERİN Zarı Katlasın Puanları Çoştursun." },
                { level: 11, name: "Sharpen the Blade", desc_tr: "Odaklan... Sizlerin Kensei (Bağlı Silahına Savaş Başında! Kİ Yak! (3 Ki Ye Kadar Harca) Verdiğin Kİ KADAR(+Maksimum/Ve Silah Başlangıcına Göre +1,+2 ,+3 Kadar İLK Sürümlü ACıksız GÜÇ!) Ve Hasar/Vurma İhtimalinden Puan Biner Silah Kusuruzz Güçe Zıplar 1 Dakıka Silahınızı Parltatır (Bonus Hasar vs)." },
                { level: 17, name: "Unerring Accuracy", desc_tr: "Iska Yok Asker. Eğer ki KENSEİ Silahından/Yayından vs HerHangi Saldrı Zarı (Attack ZArunuz Misslersiz / Tutarmaz!) Karşssında Tur Başu 1 TANE BELEŞ TEKRAR Zari ATTIRMA Ve Vurma Fırsatınız Kesinleşir.. Asla İskama Kapanır Hata yapılmaz!." }
            ]
        },
        {
            name: "Way of the Astral Self",
            description_tr: "Dövüşürken içindeki manevi 'Astral' yansımasını çıkararak kollarını ve tüm vücudunu stand büyüsü gibi öne çıkaran psişik doğu monkları.",
            features: [
                { level: 3, name: "Arms of the Astral Self", desc_tr: "Ki gücü Kullan!(1Ki!) Sırtınızdan İKİ TANE DEVASA RUHANİ KOLLAR/EL Pırtlatın Çıkarrırtn. (Bu Kollar Wisdom ZARIYLA Kullanıllıp Zarlar Ordan Vurulabilir! Hasarları Force/Uzay Zararı Verir!, Artı UZANMA (REACH!) Meilini Silahsın Vurma Mesefesi +10 Ft Uzatsın.) Kuvvet ve Sıçramalarda Da ZArınız Gücü Onu Etkiler." },
                { level: 6, name: "Visage of the Astral Self", desc_tr: "Zihin Vizörü; Kafana (Kask(Astral Parça( Gecir. (1 Ki YAKARAK)! Size Karanlıkları / Zıfır büyüleri Kırıtan SİHİRLİ(DarkVision Dev Görfüş) Artı!. Başkasına BAKIP Onun Sözündeki veya Durumu İnsight Yeteneğinde(Zekice İknalarda vb Avantaj Kazanın). Bir de(Fısıldarsınız, Veya Sesnizi (Ses Bombası Megafonu Gibi) İletiştirp Güççe BAĞIRTIP Konuşturma Sağlarsınız." },
                { level: 11, name: "Body of the Astral Self", desc_tr: "TÜM Bedeni Çıkarrttın / Aura Halinizde(Ruhunuz Ve Kollarınız Başınız var iken Olan Astral Mod!): Defans/Korunma -> (Herhangi Bir Elektrik Soğuk Buz Fırtına Gibi Saldırıda REAKSİYON İp çekip Kendine İner (Ve Kalkan Ekleyerek O Zarın Tüm Hasarındran 10 Zar Düşürebilecek kAlkan)! Ayrıeten (BİR VURUŞ) Yaparkende Hasarına EK Bir (MARTİAL/Monk zar hasarı Ekle Hasarı Uçur!)." },
                { level: 17, name: "Awakened Astral Self", desc_tr: "Avatar (Eksiksiz) Uyanışı! BEDEN-KAFA_KOL(5Kİ Toptan Açarak) İŞE GİRERSEN: SİLAHSIZ/Vuruş Attacklarınızın Her Birine AC(Bonus Olarak +2 Lık CİDDİ Zırh (Aarmor Classe) Ve Sen(Her Eylem Action Atıtgıgında ! 2 YERİNE +3(HATA FLURRYA 1 Zarı da Daha Ekle Toplam Uzanarak/Zihden TAM Uçaktan Beşinci - 5 Hasar / Vuruş/Ok ) Patlatıyorsun Kİlitlemesine Dal!" }
            ]
        },
        {
            name: "Way of Mercy",
            description_tr: "Şifacı eller ve ölüm getiren vuruşlar; hem dostunu ölüm kıyısından döndüren hem de merhametsizce hastalık ve çürüme fırlatan 'veba doktoru' tipli monklar.",
            features: [
                { level: 3, name: "Implements of Mercy", desc_tr: "Doktor Çantası!. Insight(Kavrama) Veya Medicine(Sağlık/Hastlık) Yeteneğine Ehlıyet / Uzmanlık Kazancınız. Zehir Usta setinide de kullanırsınız (Maskeniniz vardır Veba)." },
                { level: 3, name: "Hand of Healing", desc_tr: "1 Kİ Kullan / Veya Flurry Of Blows (KOMBO YAParken Yumrukların!) Birisini Adama (Vurmak Hasar Vermek /yerine HEAL(Sağlık Can) İçin DOSTUNA BİNDiR)!, Arkadaşına Bir dokunarak Şlak (Monk Zarı+WİSDOM) Puanında ŞİFA Canı Veriyorsunuz." },
                { level: 3, name: "Hand of Harm", desc_tr: "Daha da Tehlikeli! Flurry veya Normal vurdudunuz RAKİBİNİZE VURGU İSABET Etti mi! (Heal Yerine -> ZARAR AŞILIYIN 1 KI! İLE): Adama Vurmuş Halınden HARİÇ! Sızan Ekstra (Monk Zarızınıza Ekler + WISDOM Puanı) GÜCÜNDE Nekrotik PIs Saf ZEhir Acı HASARını Üzerine Patlatırsınız!" },
                { level: 6, name: "Physician's Touch", desc_tr: "Ellerinizle VeridiğiniŞİFALARınız(Heal) Sadece Canı Basmıyor: Artık Yatıran(Kör. Sağır. Veya Poison/Zehir Felci Vb)'Den Tamamen Arıttırıp MUAFF Kılar Temizler!!! VE ZARAR(Harm) Verdiğinizdende Onuda (Hİç SAVE attıkmadan Kilitli sekılde (Zehirlendi-Poison) debuffına Batar! Zarları Ve canını Zayıflatarak O Tur mahafedersiniz." },
                { level: 11, name: "Flurry of Healing and Harm", desc_tr: "Kombokar Şifalı ve Acılı! Artık(Flurry OF BLows -İkili Yumruk eylemleri Bonus Actionunda!) Ekstra Kİ Ödemeksizin! BU İlk yumruğunuz Heal (Bedva Ek Ki Harcatmadan Verilecektir!) Sonrasında Acısı İçinde 1 Zarsal Harm Hasarı Sağlayıp Eylemlerinizi Yarı Yarıya (Düşük masraflarile Max Hasara İndirirsiniz!)." },
                { level: 17, name: "Hand of Ultimate Mercy", desc_tr: "Hayati Diriliş! Müttefik(Tankınız/Healerin) Veya Arkdaşınız 24 SAAT İçeriisndre Gecmiste ÖZLMÜŞ (CeSedi Varsa); Eylem İLE 5 Kİ Harccararak Ceseede İğneyi ÇAK / Dokunarak, ONU GEritip Anında! Hayata (Max Canının Hpsi İÇinde TAmamen Dirilt / Kalkıttırr). Ve Hemde Tğm Charmed zarı Poinlarınını Siil! Kısa Restede yenilenecek kadar seri kullanlıyor." }
            ]
        },
        {
            name: "Way of the Ascendant Dragon",
            description_tr: "Ejderhaların devasa yırtıcılığından feyzalan The Last Airbender gibi elementler fışkırtan; yumruklarıyla ateş, buz ve yıldırım kusan kutsal monklar.",
            features: [
                { level: 3, name: "Draconic Disciple", desc_tr: "1. (Element Yumruğu!): Ne zaman ki (Kılıç Silahsız/Melee yumruğunuz Vurduğunda Vururken!, Fiziksel Hasar yerine (Acid=Zehirsuyu/ Cold=Souk / Fire=Ateş / Lightning=Yıldırım / Poison=ZehirAğı) Vuracağını Siz Seçebilirsiniz Rengarenk Vurursunuz. 2. (Ejderha Dili) Dragon Dili Kazanırsınız. Veee Kendi İkna Veya Tehdit zarlarınızı Yaparken WİS Atabilir Ve Ek Zar Başarısını Alabilirsiniz." },
                { level: 3, name: "Breath of the Dragon", desc_tr: "Saldırı(Eylem Attack)nızı Yaparken Vurmak Yeribne AĞZINI (EJDAR KUSMASI/ Nefesi! Mermileri 20 Feete (Koni veya Uzun Işın şeklinde!) Verilen Damage türlerinde Püskürtür ve Üfürdürürsünüz! Tutturazlarsa Yarım Atarlar. (Prof modüle kadar bedava - Sonra Sınırsız Herseferde 2Kİ yakarsılır)." },
                { level: 6, name: "Wings Unfurled", desc_tr: "Kanatlar Çıktı(Step Of The Wİnd- KoşuDash Atlaması İcib(Ki) Basın! ) O Sırada Kanatlarınuz Yırtılır Görsel Şölen!! (Yürüş/Hızınız Kadar UÇUŞ(Flying ACceess!) Ve o tur Boyunca Kuş gibi Yukarıdaki adamlara atlama vb Zıplatması alırak Şovlarsıız." },
                { level: 11, name: "Aspect of the Wyrm", desc_tr: "10Feet'lik DEvasa Aura (Ejdar Kanı) Aç!! 1dAKIKA Durur (Bonus action). Aauradaki YANINDA OLAN Arkadaşlarına İsteyeerel (Asit-Cold_Yıldırım Vb Seçilen TÜRLERİ Onların BEDENLERİNE HASARI Dirençle (Resistance=Yarım Hasar korumasıylla Kaplarsın) - VE!! Düşmanların Aura İçinde Kalanı/SANA/Dostlarına DEğen Çarpanlara (Reaksityonun) İle (Aura Elementi neyse = Örn Fire, Adama ateş vurdurtup patlatırsın!)." },
                { level: 17, name: "Ascendant Aspect", desc_tr: "Kör Eden Ejder: Artık AĞZINDAN (Püskürttüğün Elementlerin BÜTÜNÜ İçin Düşman Sadec Hasar YMEZ. 30Feetlik (Ateşe Yana Yana Korku YEMEYE BÜYÜLENİRP BÜYLÜ/VE BLINDED. Göze Külleri yiyip KÖRLÜK! Etkiyi kaparlar). Ayrıcana Gökkuşağı Aura(Elementinizle Birine Reasktiyon Patlattıpınız Vurunca o Vurus Sıçrayrak Parçalanır Zrı İzi (4D10 A Çıkar ve Hasarı Maxa sürerler!)." }
            ]
        },
        {
            name: "Way of the Long Death",
            description_tr: "Ölüm korkusuyla güçlenen; can çekişen düşmanların ruhundan geçici hayat enerjisi çalan ve ölümün eşiğine gelenleri cadı gibi donduran karanlık manastır monkları (SCAG).",
            features: [
                { level: 3, name: "Touch of Death", desc_tr: "Yakınınızda birileri ÖLÜRSE (0 HP düşerse); O kişiden ruhsal enerji çekerek sana (Monk Seviyeni) kadar Geçici HP (Temp HP) sağlarsın. Sonsuz seferde kullanılabilir; etraftaki her ölüm canı yeniler." },
                { level: 6, name: "Hour of Reaping", desc_tr: "Action harcayarak 30 feet çevresindeki tüm yaratıklara Dehşet saçarsın; seni görebilen herkes (Wis Save) başarısız olursa Frightened (Korkup) 1 tur donup kalır." },
                { level: 11, name: "Mastery of Death", desc_tr: "HP'n sıfıra düştüğünde (Ölmek üzereyken!), 1 Ki Puanı yakarak baygınlığı reddederek 1 HP ile AYAKTa kalırsın! Hayatı kazanmak için Ki harcayan tek Monk Yolu budur." },
                { level: 17, name: "Touch of the Long Death", desc_tr: "Action ile Dokunduğun hedefe 1-10 Ki Puanı Harcar; Her Ki başına 2d10 Nekrotik Hasar verirsin (Con Save ile yarım). 10 Ki'de 20d10 anlık Nekrotik Patlama yaratırsın." }
            ]
        },
        {
            name: "Way of the Four Elements",
            description_tr: "Avatar: The Last Airbender misali dört elementi (Ateş, Hava, Su, Toprak) Ki enerjisiyle yönlendiren, ateş topu fırlatan ve su duvarları yaratan elemental monklar (Player's Handbook).",
            features: [
                { level: 3, name: "Disciple of the Elements", desc_tr: "Ki Puanı harcayarak elemantal teknikler (Elemental Disciplines) kullanmaya başlarsın. 3. seviyede iki teknik seçersin: (Fangs of the Fire Snake - Yumruğun alevlenir ve uzar), (Gust of Wind - Rüzgar büyüsü), (Rush of the Gale Spirits - Itme dalgası), (Water Whip - Su kamçısı), (Earth Tremor - Yer sarsıntısı) gibi seçenekler mevcuttur." },
                { level: 6, name: "Additional Disciplines", desc_tr: "Seviye 6, 11 ve 17'de birer ek Elemental Discipline öğrenirsin. İleri seviye teknikler: (Clench of the North Wind - Kışın Pençesi: Zarf tutan adamı Paralel (Paralyzed) yapar), (Flames of the Phoenix - Fireball büyüsü, 4 Ki), (Ride the Wind - Fly büyüsü, 4 Ki) gibi güçlü teknikler açılır." },
                { level: 11, name: "Elemental Attunement", desc_tr: "Küçük element efektleri yaratmak için Ki harcamana gerek kalmaz (Avuçta alev tutma, küçük su dalgası, rüzgar ses çıkarma gibi). Pasif Uyum yeteneği olarak sürekli aktiftir." },
                { level: 17, name: "Eternal Mountain Defense", desc_tr: "En güçlü toprak tekniği: 5 Ki harcayarak 10 dakika boyunca Stone Skin büyüsüne denk kalkan kazanırsın. Ayrıca birine dokunup 6 Ki harcayarak onu Taş/Kaya'ya dönüştürebilirsin (Petrification - vücudu billurlaşır)." }
            ]
        }
    ]
};
