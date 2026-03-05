module.exports = {
    name: "Barbarian",
    hit_die: "d12",
    primary_ability: "Strength",
    saves: ["Strength", "Constitution"],
    armor_proficiencies: ["Light Armor", "Medium Armor", "Shields"],
    weapon_proficiencies: ["Simple Weapons", "Martial Weapons"],
    description_tr: "Vahşi bir öfkeyle beslenen, olağanüstü dayanıklılığa ve yıkıcı yakın dövüş yeteneklerine sahip korkusuz bir savaşçı.",
    subclass_unlock_level: 3,
    features: [
        { level: 1, name: "Rage", desc_tr: "Savaşta Bonus Eylem (Bonus Action) harcayarak 'Öfke' (Rage) haline girersin. Öfkeliyken Güç (Strength) zarlarına avantaj kazanırsın. Güç tabanlı yakın dövüş silah hasarlarına Barbarian seviyene göre artan ekstra hasar eklersin. Ayrıca tüm fiziksel hasarlara (Bludgeoning, Piercing, Slashing) karşı Direnç (Resistance - Yarım Hasar) kazanırsın. Öfke 1 dakika sürer; ağır zırh giyiyorsan veya turunda hasar almaz/vermezsen sona erer." },
        { level: 1, name: "Unarmored Defense", desc_tr: "Hiçbir zırh giymiyorken Zırh Sınıfın (AC), 10 + Çeviklik (Dex) + Dayanıklılık (Con) modifiye edicilerinin toplamı olarak hesaplanır. Kalkan kullanabilirsin." },
        { level: 2, name: "Reckless Attack", desc_tr: "Saldırırken tüm Güç (Str) tabanlı yakın dövüş saldırılarında Avantaj (Advantage) kazanmayı seçebilirsin, ancak turunun sonuna kadar düşmanların sana yapacağı tüm saldırılar da Avantajlı olur." },
        { level: 2, name: "Danger Sense", desc_tr: "Görebildiğin tehlikelere (tuzak, ateş topu vb.) karşı yapılan Çeviklik (Dex) kurtarma zarlarında Avantaj kazanırsın. Bu özellik kör veya sağır iken çalışmaz." },
        { level: 3, name: "Primal Path", desc_tr: "Sana özel vahşi yetenekler sunan bir Öfke Yolu (Subclass) seçersin (Örn: Berserker, Totem Warrior)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır, ya da Feat seç." },
        { level: 5, name: "Extra Attack", desc_tr: "Kendi turunda Attack eylemi aldığında 1 yerine 2 kere saldırabilirsin." },
        { level: 5, name: "Fast Movement", desc_tr: "Ağır zırh giymiyorsan yürüme hızın kalıcı olarak +10 feet artar." },
        { level: 6, name: "Path Feature", desc_tr: "Seçtiğin Öfke Yolu'ndan (Subclass) yeni bir özellik kazanırsın." },
        { level: 7, name: "Feral Instinct", desc_tr: "Savaş İnisiyatif (Initiative) zarlarını daima Avantaj ile atarsın. Ayrıca pusuya (Surprised) düşürülsen bile, sıran geldiğinde bir Rage harcayarak turunu normal oynayabilirsin." },
        { level: 7, name: "Instinctive Pounce (Optional TCoE)", desc_tr: "Bonus Eylem ile Rage'e girdiğinde, normal yürüme hızının yarısı kadar bedava bir hareket (koşu) yapabilirsin." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 9, name: "Brutal Critical", desc_tr: "Yakın dövüş silahıyla kritik (Zar 20) vuruş yaptığında hasar zarına ekstra 1 zar daha eklersin." },
        { level: 10, name: "Path Feature", desc_tr: "Seçtiğin Öfke Yolu'ndan 10. seviye özelliği gelir." },
        { level: 11, name: "Relentless Rage", desc_tr: "Öfkeliyken canın 0'a düşerse DC 10 Dayanıklılık (Con) zarı at. Başarırsan canın 1'de kalır ve ayakta durursun. Her başarılı atışta DC 5 artar (Kısa veya uzun dinlenmede sıfırlanır)." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 13, name: "Brutal Critical (2 Dice)", desc_tr: "Kritik vuruşlarda artık ekstra 2 silah zarı atarsın." },
        { level: 14, name: "Path Feature", desc_tr: "Seçtiğin Öfke Yolu'ndan nihai özellik." },
        { level: 15, name: "Persistent Rage", desc_tr: "Öfken (Rage) artık sen bilincini kaybedene veya sen bilerek kapatana kadar asla zamanından önce bitmez." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 17, name: "Brutal Critical (3 Dice)", desc_tr: "Kritik vuruşlarda artık ekstra 3 silah zarı atarsın." },
        { level: 18, name: "Indomitable Might", desc_tr: "Eğer yaptığın bir Güç (Str) yetenek zarı toplamı, kendi Güç puanından düşük gelirse, doğrudan kendi Güç değerini atış sonucu sayabilirsin." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 20, name: "Primal Champion", desc_tr: "Vahşi gücün zirvesi! Güç (Str) ve Dayanıklılık (Con) skorların doğrudan 4 artar. Artık bu iki skorun maksimum limiti 20 yerine 24 olur." }
    ],
    subclasses: [
        {
            name: "Path of the Berserker",
            description_tr: "Öfkelerini saf vahşete ve çılgınlığa dönüştüren, savaşın ortasında kendinden geçerek ekstra güç kazanan gerçek manyaklar.",
            features: [
                { level: 3, name: "Frenzy", desc_tr: "Rage halindeyken Çılgınlığa (Frenzy) geçebilirsin. Bu haldeyken her tur Bonus Eylem (Bonus Action) harcayarak ekstra 1 yakın dövüş saldırısı yaparsın. Rage bittiğinde yorgunluktan 1 seviye Exhaustion (Bitkinlik) alırsın." },
                { level: 6, name: "Mindless Rage", desc_tr: "Rage halindeyken (Charmed) Aşka düşme veya (Frightened) Korkutulma efektlerinden ASLA etkilenmezsin. Önceden etkilendiysen, Rage açınca bu etkiler Rage bitene kadar duraklar." },
                { level: 10, name: "Intimidating Presence", desc_tr: "Eylem (Action) harcayarak 30 feet içindeki bir düşmanı gözlerinle korkutabilirsin (Wisdom Save). Başarısız olursa senden Dehşete Düşer (Frightened). Etkideyken her tur Action harcayarak süresini uzatabilirsin." },
                { level: 14, name: "Retaliation", desc_tr: "Sana 5 feet yakınındaki biri hasar verdiğinde (Saldırı isabet ettiğinde), Reaksiyon (Reaction) vererek anında ona 1 kılıç/balta tokadı savurabilirsin." }
            ]
        },
        {
            name: "Path of the Totem Warrior",
            description_tr: "Hayvan ruhlarıyla bağ kurarak doğanın vahşi gücünü içine çeken şamanik savaşçılar.",
            features: [
                { level: 3, name: "Spirit Seeker", desc_tr: "Beast Sense ve Speak with Animals (Hayvanlarla konuşma) büyülerini ritüel olarak atabilirsin." },
                { level: 3, name: "Totem Spirit", desc_tr: "Bir hayvan ruhu kazan: AYI (Psişik harici Dünyadaki BÜTÜN hasarlara Dirençli olursun). KARTAL (Hareket ederken fırsat saldırıları sana Dezavantajlı atılır ve Bonus Action ile koşarsın). KURT (Senin yanındaki düşmanlara senin dostların hep Avantajlı vurur)." },
                { level: 6, name: "Aspect of the Beast", desc_tr: "Hayvanın pasif özelliğini al: AYI (Kaldırma kilen 2 katına çıkar, kapıları devirirsin). KARTAL (1 mil öteyi 100 feet gibi net görür, loş ışıkta iyi izlersin). KURT (Takımınla ormanda iz sürerken hızınız kesilmez)." },
                { level: 10, name: "Spirit Walker", desc_tr: "Commune with Nature büyüsünü ritüel olarak okutup, doğa ruhlarından bölge hakkında kapsamlı istihbarat alabilirsin." },
                { level: 14, name: "Totemic Attunement", desc_tr: "Nihai totem: AYI (Düşmanın sana yakınken SENDEN BAŞKASINA VURURSA saldırılarını Dezavantajlı atar - Tank). KARTAL (Hareket ederken Uçma Hızı kazanırsın). KURT (Bonus eylemle rakibini yere serebilirsin)." }
            ]
        },
        {
            name: "Path of the Ancestral Guardian",
            description_tr: "Savaş alanında hem kendini hem dostlarını korumak için atalarının devasa ruhlarını çağıran manevi koruyucular.",
            features: [
                { level: 3, name: "Ancestral Protectors", desc_tr: "Rage halinde ilk saldırdığın düşmana Ataların musallat olur. O hedefin SANA VURMADIĞI tüm saldırıları Dezavantajlıdır ve bir dostuna hasar verirse O HASAR YARIYA DÜŞER." },
                { level: 6, name: "Spirit Shield", desc_tr: "30 feet içindeki bir müttefikin hasar aldığında, Reaksiyon atarak Atalarını onun önüne enerji kalkanı olarak dizersin. Gelen hasarı anında 2d8 (İlerde 4d8) kadar eksiltirsin." },
                { level: 10, name: "Consult the Spirits", desc_tr: "Geçmişin bilgeliğine danış. Augury veya Clairvoyance (Geleceği/Uzağı görme) büyüsünü hiçbir büyü malzemesi harcamadan, her kısa/uzun dinlenmede bir atabilirsin." },
                { level: 14, name: "Vengeful Ancestors", desc_tr: "Spirit Shield ile dostunun yediği hasarı (4d8) ne kadar azalttıysan, o engellediğin BÜtün hasarı DOĞRUDAN o saldırıyı yapan düşmanın yüzüne Yansıtırsın (Force hasarı olarak)." }
            ]
        },
        {
            name: "Path of the Storm Herald",
            description_tr: "İçlerinde fırtına, çöl kumu ya da buz tufanı gibi dev bir elementel güç barındıran yıkıcı kabile savaşçıları.",
            features: [
                { level: 3, name: "Storm Aura", desc_tr: "Rage esnasında etrafında 10 feetlik elementel aura başlar: ÇÖL (Tüm rakiplere ateş hasarı atarsın). DENİZ (Reaksiyonla bir düşmana yıldırım çarptırırsın). TUNDRA (Kendine ve müttefiklerine geçici HP kalkanı dağıtırsın)." },
                { level: 6, name: "Storm Soul", desc_tr: "Auranın Elementine PASİF DİRENÇ kazanırsın. Çöl: Ateş direnci, aşırı ısınmadan etkilenmeme. Deniz: Yıldırım direnci, su altında nefes alma. Tundra: Soğuk direnci." },
                { level: 10, name: "Shielding Storm", desc_tr: "Auranın içindeki (10 feet etrafındaki) tüm müttefiklerin de senin sahip olduğun Element Direncine tamamen sahip olurlar." },
                { level: 14, name: "Raging Storm", desc_tr: "Elementler gazaba gelir: Çöl (Sana vuran ateşe yanar). Deniz (Vurduğun adamları havaya / geriye itersin). Tundra (Auran içindeki adamın hızını dondurup tamamen 0'a kilitlersin)." }
            ]
        },
        {
            name: "Path of the Zealot",
            description_tr: "Bir tanrının veya idealin uğruna ölmeyi göze alan, din adamları tarafından bedavaya diriltilen kutsal ölüm makineleri.",
            features: [
                { level: 3, name: "Divine Fury", desc_tr: "Rage halindeyken turda vurduğun ilk düşmana ekstra (1d6 + Barbari seviyenin yarısı) kadar Işıyan (Radiant) veya Nekrotik hasar eklersin." },
                { level: 3, name: "Warrior of the Gods", desc_tr: "İlahi kutsama. Seni ölümden diriltmek için atılan büyülerin (Revivify, Raise Dead vb.) maddi maliyeti (Elmas) yoktur. Rahipler seni elmassız, bedavaya diriltirler." },
                { level: 6, name: "Fanatical Focus", desc_tr: "Rage sırasındayken başarısız olduğun herhangi bir Kurtarma Zarını (Saving Throw) baştan atabilir (Reroll) ve yenisiyle durumu kurtarabilirsin (Rage başı 1 kez)." },
                { level: 10, name: "Zealous Presence", desc_tr: "Günde 1 kez Kutsal bir Savaş Narası at! 60 feet içindeki 10 Müttefikin, sonraki tur sonuna kadar yapacağı BÜTÜN Saldırı ve Kurtarma zarlarına AVANTAJ (Advantage) alır." },
                { level: 14, name: "Rage Beyond Death", desc_tr: "Öfken ölümü aşar! Canın (HP) 0 olsa bile Ölmez, bayılmaz ve ayakta Tamsayı Savaşa Devam Edersin. Ancak 3 Death Save kaybedersen, Öfken (Rage) bittiği VE eğer canın hala sıfırsa anında ölürsün. O zamana kadar ölümsüzsündür." }
            ]
        },
        {
            name: "Path of the Beast",
            description_tr: "İçlerindeki yabanı serbest bırakarak bedenlerinde mutasyon geçiren; pençe, ısırık veya sivri kuyruklar çıkartan form değiştiriciler.",
            features: [
                { level: 3, name: "Form of the Beast", desc_tr: "Rage girdiğinde vücudunu mutasyona uğrat: ISIRIK (Ağzın büyür, vurduğunda canını doldurursun). PENÇE (Ellerin pençe olur, bir kere vurduktan sonra BEDAVA bir pençe daha atarsın). KUYRUK (10 feet menzilli kamçı gibi vurur, düşman sana vurunca reaksiyonla AC Zırhını artırır)." },
                { level: 6, name: "Bestial Soul", desc_tr: "Vahşi formun (Pençe vb) sihirli (Magic Weapon) sayılır. Ayrıca her dinlenişte seçebileceğin bir hayvan yeteneği alırsın: Suda nefes alma/hızlı yüzme, Örümcek gibi duvarda tırmanma VEYA Devasa mesafelere sıçrama." },
                { level: 10, name: "Infectious Fury", desc_tr: "Mutasyonlu silahınla (Kuyruk/Pençe) adama vurduğunda bir Zehir/Lanet aşılarsın. Adam (Wis Save tutmazsa) ya 2d12 Psişik hasar yer, YADA kendi iradesini kaybedip senin takım arkadaşın yerine KENDİ ARKADAŞINA Vurur!" },
                { level: 14, name: "Call the Hunt", desc_tr: "Rage'e girdiğinde sürüyü çağır. Çevrendeki (Maks 5) müttefikine +1d6 ekstra saldırı zarı hasarı hediye edersin. Ayrıca bu gücü verdiğin kişi başına (Örn 5 kişi = 25 Geçici Can) sana devasa bir Geçici (Temp) HP kalkanı gelir." }
            ]
        },
        {
            name: "Path of Wild Magic",
            description_tr: "Vücudunda kontrol edemediği vahşi bir büyü kıvılcımı yatan, öfkelendiğinde rastgele sihirsel patlamalar çıkaran barbarlar.",
            features: [
                { level: 3, name: "Magic Awareness", desc_tr: "Günde Karizma modun kadar; Eylem harcayarak etrafındaki gizli büyüleri sezinleyebilir, büyü okullarının auralarını koklayabilirsin." },
                { level: 3, name: "Wild Surge", desc_tr: "Rage moduna geçtiğin anda içindeki büyü patlar! Sürpriz Zarı (1d8) atarsın ve tablodan rastgele bir Güç gelir (Örn: Işınlanma yeteneği, Göğsünden ateş çıkan ışın, Etraftaki herkese zarar veren Peri fırtınası vb)." },
                { level: 6, name: "Bolstering Magic", desc_tr: "Sihrini bir arkadaşına transfer edersin. Ya onun Saldırı ve Yetenek zarlarına (+1d3 Puanlık bir katkı bonusu) eklersin, Ya da (Bir büyücüyse) harcamış olduğu çok değerli bir Büyü Slotunu (Spell Slot) ona geri kazandırırsın." },
                { level: 10, name: "Unstable Backlash", desc_tr: "Rage içindeyken yara aldığında/hasar yediğinde Vahşi Sihrin kontrolden çıkar! Reaksiyon kullanarak ANINDA Vahşi Sihir Zarı (1d8) atarsın, eski etkini silip anında sürpriz yeni bir etki patlatırsın!" },
                { level: 14, name: "Controlled Surge", desc_tr: "Artık Rage girdiğinde Zar atarken (1d8) yerine (2d8) çift zar atarsın! İki zardan sana hangisi LAZIMSA (Veya ikisi aynı gelirse istediğin bir efekti seçerek) Vahşi Sihri tamamen kontrol edersin." }
            ]
        },
        {
            name: "Path of the Giant",
            description_tr: "Devlerin (Giants) boyutlarını taklit eden, koca bedenlerle objeleri veya düşmanları uzağa fırlatan cüsseli şampiyonlar.",
            features: [
                { level: 3, name: "Giant's Power", desc_tr: "Devlerin büyüklüğünü anlıyorsun. Giant (Dev) dilini öğrenirsin. Ayrıca sesi gürleştiren Thaumaturgy büyüsünü öğrenirsin." },
                { level: 3, name: "Giant's Havoc", desc_tr: "Rage sırasında BÜYÜRSÜN (Büyük/Large boyutuna Çıkarsın). Kolların uzadığı için Silah Menzilin (Reach) 5 feet daha artar. Ayrıca Fırlatmalı silahların (Javelin vb) hasarına Rage Güç bonusunu eklersin." },
                { level: 6, name: "Elemental Cleaver", desc_tr: "Silahını asit, ateş, soğuk veya elektrikle kaplarsın. Vuruşlarına +1d6 ekstra element hasarı biner. Üstelik silahı atarsan veya fırlatırsan, Bumerang (Thor Çekici) gibi saniyeler içinde eline geri ışınlanır!" },
                { level: 10, name: "Mighty Impel", desc_tr: "Dev gücü. Rage esnasında Bonus Eylem harcayarak orta boy (Medium) Veya küçük bir yaratığı kapıp TAM 30 FEET Uzağa İTEBİLİR Veya FIRLATABİLİRSİN. Düşmanı uçurumdan atabilirsin!" },
                { level: 14, name: "Demiurgic Colossus", desc_tr: "Artık Rage esnasında Dev ötesi, KOCAMAN (Huge) olursun! Menzilin 10 Feet'e (Kuşatma kulesi gibi) ulaşır, Ayrıca Element silahının bindiği O ekstra hasar (2d6'ya) çıkar." }
            ]
        }
    ]
};
