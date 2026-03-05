module.exports = {
    name: "Sorcerer",
    hit_die: "d6",
    primary_ability: "Charisma",
    saves: ["Constitution", "Charisma"],
    armor_proficiencies: ["None"],
    weapon_proficiencies: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light Crossbows"],
    description_tr: "Büyüyü çalışarak değil, kanında veya ruhunda doğuştan taşıdığı için kendi içinden çekip şekillendirebilen; büyüleri Metamagic ile eğip büken saf sihirbaz.",
    subclass_unlock_level: 1,
    features: [
        { level: 1, name: "Spellcasting", desc_tr: "Charisma (Karizma) yeteneğini kullanarak kendi içinden gelen Sorcerer büyülerini çekersin." },
        { level: 1, name: "Sorcerous Origin", desc_tr: "Büyüsel gücünün kanındaki kökenini (Örn: Draconic, Wild Magic, Divine Soul) seçersin. Bu seçim sana anında özellik kazandırır." },
        { level: 2, name: "Font of Magic", desc_tr: "Sihrin asıl kaynağına erişirsin. Sorcerer seviyene eşit sayıda Sorcery Point'in (Büyü Puanı) olur. Bu puanları Kısa/Uzun restle doldurup, Eylem (Action) harcayarak fazladan Büyü Slotu'na çevirebilir veya tam tersi Büyü Slotu'nu silip Sorcery Point'e dökebilirsin (Spell Slot 1 = 2 Puan, Lvl 2 = 3 Puan vb)." },
        { level: 3, name: "Metamagic", desc_tr: "Büyülerin kurallarını yıkan becerilerin! 2 Adet Metamagic seçeneği öğrenirsin (10. ve 17. seviyede 1'er tane daha seçilir). Örn: Twinned Spell (Tek hedeflik büyüyü puan yakıp 2 hedefe atma), Quickened Spell (Eylem büyülerini Bonus Eylem ile atma), Subtle Spell (Büyüyü el işareti ve ses çıkartmadan zihinle atıp, Counterspell yenilmezliği sağlama), Heightened Spell (Hedefin Saving zarına dezavantaj verdirme)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat)." },
        { level: 5, name: "Magical Guidance (Optional TCoE)", desc_tr: "Eğer bir Yetenek zarında (Ability Check) başarısız olursan, 1 Sorcery Point harcayarak O ZARI YENİDEN ATABİLİRSİN!" },
        { level: 6, name: "Origin Feature", desc_tr: "Seçtiğin Büyüsel Kökenden (Subclass) özellik kazanırsın." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat al." },
        { level: 10, name: "Metamagic (3rd Option)", desc_tr: "Büyü manipülasyon listenden kullanmak için YENİ bir Metamagic şekillendirmesi öğrenirsin." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat al." },
        { level: 14, name: "Origin Feature", desc_tr: "Seçtiğin Büyüsel Kökenden (Subclass) özellik." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat al." },
        { level: 17, name: "Metamagic (4th Option)", desc_tr: "Son bir Metamagic öğrenirsin." },
        { level: 18, name: "Origin Feature", desc_tr: "Kökensel alt sınıfının (Subclass) en tepe/Avatar özelliği açılır." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya Feat." },
        { level: 20, name: "Sorcerous Restoration", desc_tr: "İçindeki kıvılcım hiç sönmez. Kısa Dinlenmeyi (Short Rest) tamamladığında, harcamış olduğun o değerli Sorcery Point'lerinden Anında 4 Tanesini BEDAVA doldurursun." }
    ],
    subclasses: [
        {
            name: "Draconic Bloodline",
            description_tr: "Damarlarında kadim bir Ejderhanın (Örn: Kızıl ejder, Altın ejder) kanı dolaştığı için pullarla korunan, elemental yıkım büyüleri atan Sorcererlar.",
            features: [
                { level: 1, name: "Dragon Ancestor", desc_tr: "Ejderha türünü (Renk) seçersin (Örn: Gold=Fire, Silver=Cold). Ejder dilini (Draconic) öğrenir, onlarla konuşurken Karizma zarında Avantaj (Advantage) kazanırsın." },
                { level: 1, name: "Draconic Resilience", desc_tr: "Zırh giymiyorken derindeki pullar Zırh Sınıfını (AC) otomatik olarak 13 + Çeviklik (Dex) yapar. Ayrıca Maksimum HP'n her seviyede ek olarak 1 artar." },
                { level: 6, name: "Elemental Affinity", desc_tr: "Soyağacınla uyumlu (Örn: Ateşli kızıl ejder) bir büyü atarsan, o büyünün hasarına Karizma bonusunu eklersin. Ayrıca 1 Büyü Puanı harcayarak o hasar türüne 1 saatliğine Direnç (Resistance) kazanabilirsin." },
                { level: 14, name: "Dragon Wings", desc_tr: "Bonus Eylem ile sırtından bizzat Ejder Kanatları çıkarırsın! Uçma hızın normal hızına eşittir ve istediğinde kanatları gizleyebilirsin." },
                { level: 18, name: "Draconic Presence", desc_tr: "5 Sorcery Puanı harcayarak 1 dakika süren inanılmaz bir ejderha aurası yayarsın. 60 feet içindeki hedeflerin (Wis save başarısızsa) sana AŞIK (Charmed) ya da DEHŞETE DÜŞMÜŞ (Frightened) olur." }
            ]
        },
        {
            name: "Wild Magic",
            description_tr: "Gücünü Feywild veya kontrolsüz kaos tanrılarından çeken; büyüyü her attığında kendi patlama/ışınlanma riski olan rastgele eğlence kaos mageleri.",
            features: [
                { level: 1, name: "Wild Magic Surge", desc_tr: "Seviye 1 veya daha yüksek bir büyü attıktan hemen sonra DM (GM) senden 1d20 atmanı isteyebilir; 1 gelirse Vahşi Büyü Patlaması (Wild Magic Surge) olur. 100 seçenekli tablodan rastgele bir çılgınlık olur!" },
                { level: 1, name: "Tides of Chaos", desc_tr: "İhtiyacın olduğunda 1 Saldırı, Yetenek veya Kurtarma zarına Avantaj kazanırsın! Bunu yapmak DM'e istediğinde bir Vahşi Büyü Patlaması (Surge) yaşatması yetkisini verir; patlama olunca Kaos Dalgaları hakkın yenilenir." },
                { level: 6, name: "Bend Luck", desc_tr: "Gördüğün bir yaratık zar atarken (Hasar/Save vd), 2 Sorcery Point harcayarak Reaksiyonunla o zarı bükebilirsin! O atışa 1d4 ekstra EKLER veya ÇIKARTIRSIN (Hedefin atışını kesinleştirir ya da bozar)." },
                { level: 14, name: "Controlled Chaos", desc_tr: "Vahşi Büyü Patlaması yaşandığında zarı tek değil, İKİ (2) adet atarsın ve aralarından sana daha güvenli/uygun geleni seçebilirsin." },
                { level: 18, name: "Spell Bombardment", desc_tr: "Bir büyü atarken, hasar zarlarından herhangi birisi MAKSİMUM değerinde gelirse (Örn 1d6 zardan 6 atmak), BİR TANE ekstra zar atıp o hasarın üstüne toplayabilirsin (Kritik benzeri patlamalar)." }
            ]
        },
        {
            name: "Divine Soul",
            description_tr: "Bir tanrı veya melek tarafından seçilmiş, ruhunda kutsallık taşıyan; hem Sorcerer hem Cleric büyülerini (Heal vs) birleştiren kutsani büyücüler.",
            features: [
                { level: 1, name: "Divine Magic", desc_tr: "Oyun boyunca büyü öğrenirken SADECE Sorcerer listesinden değil, bizzat CLERIC (Ruhban) listesinden de (Örn: Cure Wounds, Revivify) her türlü büyüyü seçebilirsin." },
                { level: 1, name: "Favored by the Gods", desc_tr: "Tanrıların gözdesi! Eğer bir Saving Throw (Kurtarma) veya Saldırı zarında başarısız olursan, üzerine 2d4 ekleyerek kaderi döndürebilirsin (Kısa veya uzun dinlenmede 1 kez)." },
                { level: 6, name: "Empowered Healing", desc_tr: "Kendine ya da bir dosta kullandığın iyileştirme (Heal) büyüsünün zarlarını beğenmezsen, 1 Sorcery Puanı yakarak(Karizma Modu kadar iyileştirme zarını) yeniden atabilirsin." },
                { level: 14, name: "Otherworldly Wings", desc_tr: "İçindeki tanrısal melekiyet dışa vurur. Bonus eylem ile sırtından kartal, güvercin veya şeytani kanatlar çıkarıp (Senin alignmentine göre) kalıcı Uçuş (Fly) hızı kazanırsın." },
                { level: 18, name: "Unearthly Recovery", desc_tr: "Canın (HP) maksimumun yarısının altına düştüğünde Bonus Eylem (Action) harcayarak eksik sağlığının bir yarısını (Maksimum HP tabanlı) anında ücretsiz iyileştirebilirsin." }
            ]
        },
        {
            name: "Aberrant Mind",
            description_tr: "Zihin Yüzücüleri (Mind Flayer) veya uzaylı dehşetengiz pisişik yaratıkların izini taşıyan telepatik ve devasa zihin bükücüleri.",
            features: [
                { level: 1, name: "Telepathic Speech", desc_tr: "Bonus Eylem kullanarak 30 feetindeki birinin zihnine telepatik olarak dokunursun. Beraberken kilometrelerce öteden bile zihinden konuşabilir, sessiz iletişim kurabilirsiniz." },
                { level: 1, name: "Psionic Spells", desc_tr: "Zihin büken mistik büyülerden (Arms of Hadar, Dissonant Whispers) oluşan bir ekstra Spell Listesi otomatik olarak hafızana eklenir ve Sorcerer limitinden yer yemez." },
                { level: 6, name: "Psionic Sorcery", desc_tr: "1. Sevide öğrendiğin Psionic büyüleri atarken doğrudan Büyü Slotu HARCAMADAN, sadece büyünün seviyesine eşit Sorcery Point ödeyerek atabilirsin. Üstelik böyle atınca büyü hiçbir Ses, El veya Maddeye (Verbal/Somatic) ihtiyaç duymadan mutlak sessizlikte atılır." },
                { level: 14, name: "Revelation in Flesh", desc_tr: "Bedenini alien formlara bükebilme yeteneği. Bonus eylem ve 1 Puanla: Suda nefes alma (solungaçlar), Görünmezi görme (Aboleth gözleri), Uçma veya Ufak sümük olup duvar boşluklarından geçme modları açılır." },
                { level: 18, name: "Warping Implosion", desc_tr: "Eylem (Action) harcayarak bulunduğun yerden görünmez bir karadelik gibi (implode) ışınlanıp anında 120 feet uzağa zıplayabilirsin! Gittiğinde bulunduğun yerdeki (30 feet alanı) uzay bükülür, çevrendeki herkes STR save atamazsa hasar alır ve arkandan sürüklenir!" }
            ]
        },
        {
            name: "Clockwork Soul",
            description_tr: "Kaosun zıttı; Evrenin kusursuz mekanik düzenini (Mechanus) ve çarklarını temsil eden, zamanı/olasılıkları ve şansı garantileyen kuralsal mageler.",
            features: [
                { level: 1, name: "Clockwork Magic", desc_tr: "Büyü seviyen arttıkça (Alarm, Protection from Evil, Counterspell gibi) Koruma/Sönümleme (Abjuration) ve Transmutation (Dönüşüm) büyülerinden oluşan ilave bir Clockwork Büyü Listesi eklersin." },
                { level: 1, name: "Restore Balance", desc_tr: "Kaderin veya Kaosun terazisini eşitlersin. Sen dahil, senin 60 feet yakınındaki birinin bir VURMA, SAVUNMA veya YETENEK zarında AVANTAJ ya da DEZAVANTAJı varsa; Reaksiyon yakarak o Avantajı/Dezavantajı iptal edebilir, Normal zar atılmasını sağlayabilirsin!" },
                { level: 6, name: "Bastion of Law", desc_tr: "Bir müttefikine Mistik bir kalkan verebilirsin (Koruma Duvarı)! 1 ila 5 Büyü Puanı harcarsın; her 1 Puan hedefe kendi etrafında uçan 1d8 Kalkan Zarı verir. Müttefikin Hasar yediğinde harcadığın zarları tüketip yediği Hasarı ANINDA DÜŞÜREBİLİR." },
                { level: 14, name: "Trance of Order", desc_tr: "Bonus Eylem ile Mekanik Matriks Trance'ine girersin (1 Dakika). Attığın hiçbir Savunma (Save), Vuruş (Attack) veya Yetenek Zarı ASLA 9 ve altı gelseler dahi 9 sayılmaz! Otomatikman 10 gelmiş gibi yuvarlanır; şanssızlığı ortadan kaldırırsın." },
                { level: 18, name: "Clockwork Cavalcade", desc_tr: "Etrafında 30 feetlik muazzam bir boyutsal Dişli / Çark Aurası (Cavalcade) açılır. 1. Dostlarını 100 HP iyileştirir 2. Alandaki düşman büyülerini Dispel Magic (İptal eder) 3. Hasar görmüş tüm ekipman ve eşyalar tamir olur (Hepsi kusursuz Onarılır)." }
            ]
        },
        {
            name: "Lunar Sorcery",
            description_tr: "Dragonlance evrenindeki Krynn'in üç gizemli Ay'larından güç çeken; her gün Ay fazına göre büyü listesini değiştiren ve ışık/karanlık arasında gidip gelen efsanevi büyücüler (Dragonlance).",
            features: [
                { level: 1, name: "Moon Fire", desc_tr: "Sacred Flame büyüsünü bedava öğrenirsin. Bu büyüyü attığında ENERJİNİ İKİ HEDEFE BİRDEN Atabilirsin (Normal olarak tek hedeflidir)." },
                { level: 1, name: "Lunar Embodiment", desc_tr: "Her Uzun Dinlenme başında Ay Evresini Seçersin: DOLUNAY (Full: Iyileştirici büyüler), YENİ AY (New: Karanlık/Nekromansi büyüleri) veya YARIM AY (Crescent: Ilüzyon/Abjuration büyüleri). Seçimine göre ilave büyü listesi kazanırsın." },
                { level: 6, name: "Waxing and Waning", desc_tr: "1 Sorcery Puanı harcayarak Bonus Eylemle aktif Ay Evrenizi DEĞİŞTİREBİLİRSİN! Savaş ortasında dolunaydan yeni aya geçip farklı büyü bonuslarını anlık değiştirirsin." },
                { level: 14, name: "Lunar Phenomenon", desc_tr: "Ay evresine göre farklı mucize aktive edilir: FULL MOON: Etrafındaki Tüm Dostları 100 HP iyileştir. NEW MOON: Görünmezliğe (Invisibility) bürün. CRESCENT: Bir Düşmanı anlık başka boyuta (Banish) sürgün et. 1kez/gün kullanılır veya 5 Sorcery Puan harcanabilir." },
                { level: 18, name: "Lunar Empowerment", desc_tr: "Ay Evresi aura efekti pasif biner: Full Moon'dayken etrafındaki dostlar saldırılara Avantaj alır. New Moon'dayken gölgelere gizlenirsin. Crescent'tayken büyü atma hızın artar (Spell haste)." }
            ]
        },
        {
            name: "Pyromancer",
            description_tr: "Ateşi kalbinde taşıyan, alevlere bağışık olan ve kendi bedenini bir vulkan olarak kullanabilen saf ateş sorcererları (homebrew/Primeval Thule).",
            features: [
                { level: 1, name: "Heart of Fire", desc_tr: "Ateş(Fire) hasarına BAĞIŞIKSIN (Immünite)! Bu sayede kendi attığın Fireball veya Burning Hands büyülerinde yanman imkansız." },
                { level: 1, name: "Fire in the Veins", desc_tr: "Birileri sana yakın dövüş silahıyla veya yumrukla vurduğunda, Reaksiyon ile ANINDA o kişiye (Proficiency Bonus + Charisma Modifier) kadar ATEŞ HASARI Yedirirsin (Dokunma hasarı)." },
                { level: 6, name: "Pyromancer's Fury", desc_tr: "Ateş hasarı veren büyüler veya cantrip'ler (Örn: Fire Bolt, Fireball) attığında, hasara Sorcerer level sayısının yarısı kadar ekstra Ateş hasarı eklenir." },
                { level: 14, name: "Fiery Soul", desc_tr: "Artık ateş büyülerin hasarına Direnç (Resistance) değil, DİĞER Canlılara yaptığın Ateş hasarına karşı onların Dirençleri İGNORE edilir (Ateşe %50 dirençli düşmana FULL hasar vurursun)." },
                { level: 18, name: "Volcanic Chaos", desc_tr: "Öldüğünde veya sıfır HP'ye düştüğünde Yanardağ misali PATLARSIN! 30 feet alanına (4d6 x Sorcerer level) seviyesinde devasa ateş hasarı saçılır (Dex save ile yarım). İşte bu şekilde bile ölürken intikam alırsın." }
            ]
        }
    ]
};
