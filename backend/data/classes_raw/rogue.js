module.exports = {
    name: "Rogue",
    hit_die: "d8",
    primary_ability: "Dexterity",
    saves: ["Dexterity", "Intelligence"],
    armor_proficiencies: ["Light Armor"],
    weapon_proficiencies: ["Simple Weapons", "Hand Crossbows", "Longswords", "Rapiers", "Shortswords"],
    description_tr: "Gizlilik, aldatmaca ve kritik zayıf noktalara isabet ettirilen ölümcül saldırıların (Sneak Attack) kurnaz ve çevik ustası.",
    subclass_unlock_level: 3,
    features: [
        { level: 1, name: "Expertise", desc_tr: "Seçtiğin 2 yetenekte (Skill, örn: Stealth, Sleight of Hand) veya 1 yetenek ve Hırsız Aletleri'nde Uzmanlık (Proficiency bonusu x2) kazanırsın." },
        { level: 1, name: "Sneak Attack", desc_tr: "Sinsice bir zayıf noktaya vur! Turunda BİR KEZ; Eğer saldırıyı Finesse (İnce Kılıç: Rapier, Hançer vs) veya Ranged (Menzilli: Ok) silahıyla AVANTAJLI atarak tutturursan, hasarına Seviyene göre artan ekstra zar eklersin (1d6 ile başlar, seviyeyle artar)." },
        { level: 1, name: "Thieves' Cant", desc_tr: "Sadece hırsızların ve yeraltı suç örgütlerinin bildiği gizli bir el işareti, jargon ve argo dilini (Thieves' Cant) anlarsın." },
        { level: 2, name: "Cunning Action", desc_tr: "İnanılmaz çeviklik! Savaşta her tur Bonus Eylem (Bonus Action) kullanarak Dash (Koşma), Disengage (Fırsat saldırısı yemeden kaçma) veya Hide (Gizlenme) eylemlerinden birini bedavaya yapabilirsin." },
        { level: 3, name: "Roguish Archetype", desc_tr: "Seni tanımlayan Suikastçi, Hırsız veya Büyülü Dolandırıcı (Subclass) arketipini seçersin (Örn: Assassin, Thief)." },
        { level: 3, name: "Steady Aim (Optional TCoE)", desc_tr: "Bonus Eylem ile o tur hareket hızını SIFIRA (0) indirirsen, o tur yapacağın ilk silah saldırısına GARANTİ AVANTAJ (Advantage) kazanırsın. (Okçular için sabitlenip hedefe Sneak Attack atma imkanı)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki farklı yeteneği 1'er artır, ya da Feat seç." },
        { level: 5, name: "Uncanny Dodge", desc_tr: "Gördüğün bir saldırı sana İSABET ETTİĞİNDE Reaksiyon (Reaction) harcayarak o saldırıdan alacağın hasarı ANINDA YARIYA (1/2) düşürürsün." },
        { level: 6, name: "Expertise (2)", desc_tr: "2 adet daha yeteneğinde (Skill) Uzmanlık (Expertise) kazanırsın." },
        { level: 7, name: "Evasion", desc_tr: "Refleks gerektiren kurtarma zarlarında (Dexterity Save isteyen Ateş Topu, Ejder Nefesi vb) Zar başarılıysa HİÇ HASAR ALMAZSIN! Başarısız olursa ise sadece hasarın YARISINI yersin. Anında atlayıp sıyrılıyorsun." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 9, name: "Archetype Feature", desc_tr: "Seçtiğin Dövüş Arketipinden (Subclass) özellik kazanırsın." },
        { level: 10, name: "Ability Score Improvement", desc_tr: "Rogue'lara özel ekstra yetenek/skor geliştirme (ASI) hakkı." },
        { level: 11, name: "Reliable Talent", desc_tr: "Uzman (Proficient) olduğun Yetenek atışlarında (Skillerde), d20 zarı 1,2,3.. veya 9 bile gelse SİSTEM onu direkt 10 GELDİ DİYE sayar! Zayıf iş çıkarmak imkansız olur." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 13, name: "Archetype Feature", desc_tr: "Seçtiğin Dövüş Arketipinden özellik kazanırsın." },
        { level: 14, name: "Blindsense", desc_tr: "10 Feet çevrendeki görünmez veya saklanmış tüm varlıkların yerini, onları görmesen dahi sırf duyarak kesin olarak tespit edersin." },
        { level: 15, name: "Slippery Mind", desc_tr: "Zihnin güçlenir. Bilgelik (Wisdom) Yetenek Zarı Kurtarmalarında Uzmanlık (Proficiency) kazanırsın." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 17, name: "Archetype Feature", desc_tr: "Seçtiğin arketipinin (Subclass) 17. seviye özelliği." },
        { level: 18, name: "Elusive", desc_tr: "Baygın (Incapacitated) değilsen sana yapılan HİÇBİR saldırı atışı AVANTAJ ALAMAZ! (Sana kritik gelme ve vurma ihtimalleri hep zorlaşır)." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 20, name: "Stroke of Luck", desc_tr: "Şansın Zirvesi! Iskaladığın bir saldırı atışını (Kısa dinlenme başına 1 kez) anında otomatik İsabet (Hit) saysırırsın. Veya Yetenek kontrolünde çuvallarsan d20 zarı 20 gelmiş gibi sayarsın!" }
    ],
    subclasses: [
        {
            name: "Thief",
            description_tr: "Duvarlara tırmanan, tuzak çözen, eşyaları saniyeler içinde çalan ya da kullanan klasik usta hırsızlar.",
            features: [
                { level: 3, name: "Fast Hands", desc_tr: "Cunning Action ile artık bonus eyleminle tuzak çözebilir (Thieves' Tools), maymuncuk kullanabilir veya Çantadan iksir içmek / bir eşyayı kapmak gibi Use an Object eylemlerini bedava yapabilirsin." },
                { level: 3, name: "Second-Story Work", desc_tr: "Tırmanmak için artık fazladan hız harcamazsın (Normal hızınla tırmanırsın) ve uzun/yüksek atlamalarında Çeviklik modülün de mesafeye eklenir." },
                { level: 9, name: "Supreme Sneak", desc_tr: "Kendi turunda hızının en fazla yarısı kadar yürümüşsen/hareket etmişsen, Gizlilik (Stealth) Zarlarını AVANTAJLA (Advantage) atarsın." },
                { level: 13, name: "Use Magic Device", desc_tr: "Bir büyülü eşya (Asa, Parşömen, Yüzük) senin Sınıfını, Irkını, veya Seviyeni istemese BİLE, sen sanki o sınıf ve o ırkmişsın gibi zekice her efsanevi o eşyayı kullanabilirsin." },
                { level: 17, name: "Thief's Reflexes", desc_tr: "İnisiyatif (Savaş sırası) belirlendiğinde, İlk Savaş Turu (1. Tur) içinde Normal Turundan bağımsız 2 KERE TUR OYNARSIN (Biri kendi init zarı sıran, diğeri İnit zarından 10 eksik olan sırada)!" }
            ]
        },
        {
            name: "Assassin",
            description_tr: "Zehirler hazırlayan ve hiç fark edilmeden savaşın başladığı saniyede hedefi sırtından uçuran suikastçiler.",
            features: [
                { level: 3, name: "Bonus Proficiencies", desc_tr: "Sahte Kılık değiştirme kiti (Disguise Kit) ve Zehir yapım aletlerinde (Poisoner's Kit) ustalık kazanırsın." },
                { level: 3, name: "Assassinate", desc_tr: "Savaşın İlk Vuruşu Sanatı! Savaşın 1. turunda henüz sırası gelmemiş kişilere karşı attığın tüm saldırılar GARANTİ Avantajlıdır. EĞER düşmanı Baskınla/Şaşırtmayla (Surprise) pusuya düşürürsen vurduğun TÜM vuruşlar otomatik KRİTİK (Kritik x2 Zar) vurur!" },
                { level: 9, name: "Infiltration Expertise", desc_tr: "25 Altın ve 7 gün harcayarak kendine (Sahte isim, evrak, belgeler eşliğinde) KUSURSUZ bir ikinci kimlik / geçmiş (Örn: Aristokrat bir tüccar) yaratabilirsin; şüphe çekmezsin." },
                { level: 13, name: "Impostor", desc_tr: "3 Saat boyunca bir kişinin yazdığı yazıyı, ses tonunu ve tüm davranışlarını zihin olarak kopyalayıp TAKLİT EDEBİLİRSİN. Onu taklit ederken birileri senden şüphelenirse yalan/taklit Zarlarını Avantajla atarsın." },
                { level: 17, name: "Death Strike", desc_tr: "Surprise yemiş (Pusu) kurbanına vurduğun Saldırı Isabet ederse hedef GÜÇ Kurtarması (Con Save) atmak zorundadır; BAŞARAMAZSA ona vereceğin tüm Sneak+Kritik Hasar direkt olarak FAZLADAN İKİYE KATLANIR! Hedefin tek yeme olasılığı devleşir!" }
            ]
        },
        {
            name: "Arcane Trickster",
            description_tr: "Büyücülük becerilerini Rogue gizliliği ile harmanlayan; görünmez uçan ellerle adamların ceplerini soyan hırsız sihirbazlar.",
            features: [
                { level: 3, name: "Spellcasting", desc_tr: "Intelligence (Zeka) tabanlı Wizard listesinden İllüzyon ve Enchantment tarzı büyüler (Kısıtlı slotlu Mage) yapabilirsin." },
                { level: 3, name: "Mage Hand Legerdemain", desc_tr: "Görünmez Büyülü El! Mage Hand büyüsünü Bonus Action kullanarak görünmez şekilde hedeflerin ceplerini karıştırmak, anahtarlar çalmak veya kilit kurcalamak için kullanabilirsin." },
                { level: 9, name: "Magical Ambush", desc_tr: "GİZLENDİĞİN DE (Hidden/Saklanırken) bir düşmana sihir (Spell) atarsan o hedefin büyüden kaçmak için Atacağı Bütün Kurtarma (Save) zarları DEZAVANTAJLI atılır!" },
                { level: 13, name: "Versatile Trickster", desc_tr: "Mage hand (Görünmez elini) kullanarak Adamın kafasını dağıtabilirsin! Bonus Eyleminle eli hedefin yanında şaklabanlık yapmaya yollayıp O DÜŞMANA yapacağın saldırılarda AVANTAJ KAZANIRSIN (Sneak attack hazırla)!" },
                { level: 17, name: "Spell Thief", desc_tr: "Büyü Hırsızı! Biri sana büyü attığında Reaksiyonla hedefi Saving zarı atması için zorlarsın. Kaybederse büyü sana HİÇBİR ŞEY YAPMAZ, üstelik O Büyüyü Hafızasından SİLİP kendi Zihnine kopyalarsın! Adam 8 saat büyüyü atamaz, sen atarsın!" }
            ]
        },
        {
            name: "Mastermind",
            description_tr: "Sahaya inmek yerine zekasıyla arkadan düşman zayıflığını fısıldayan ve arkadaşlarına destek/taktik sağlayan dehalar.",
            features: [
                { level: 3, name: "Master of Intrigue", desc_tr: "Sahte Kit, Forgery Kiti(Sahte belge Basımı) kiti ve ekstra 2 dilde uzmanlık. Üstelik birisinin Vurgusunu/Aksanını kopyalayıp ana diliymiş gibi şivesiyle kandırarak konuşabilirsin." },
                { level: 3, name: "Master of Tactics", desc_tr: "Daha önce Eylem isteyen Yardım(Help) Action'u artık BONUS EYLEM ile ve de 30 Feet UZAĞA verilebilir. Savaşta dostuna uzaktan taktiklerle Avantaj sağlarsın." },
                { level: 9, name: "Insightful Manipulator", desc_tr: "Savaş Dışındayken! 1 dakika birini gözlemler ve analizlersen onun Intelligence (Zeka), Wisdom(Bilgelik) veya Charisma seviyesinin Sendenden yukarıda mı aşağıda mı yoksa eşit mi olduğunu DM'den net şekilde öğrenirsin!" },
                { level: 13, name: "Misdirection", desc_tr: "İllüzyon değil Kayan Hedef! Sana yapılan bir saldırıyı (Eğer sana Vurabilen hedefle aynada/bitişikte başka birisi varsa - Kendi arkadaşı bile olsa) REAKSİYON İLE Mükemmel kaydırarak ona çarptırırsın! Sen kurtulursun diğer adam hasar yer!" },
                { level: 17, name: "Soul of Deceit", desc_tr: "Saf İhtiras Zihni! Telepati ile beyninin okunmasına veya büyülerle(Zone of Truth) doğruyu söyletme zihin kontrolü efektlerine BAĞIŞIKLIK kazanırsın. Büyüler seni hep doğru konuşuyormuş (Hiç yalan söylemiyor) gibi gösterir!" }
            ]
        },
        {
            name: "Swashbuckler",
            description_tr: "Karayip Korsanları ve Üç Silahşörler gibi sinsi olmayan, yüz yüze düelloyu tercih eden hareketli ve karizmatik silahşörler.",
            features: [
                { level: 3, name: "Fancy Footwork", desc_tr: "Zarif Ayakoyunu! Kendi turunda bir düşmana yakın dövüş saldırısı YAPTIYSAN (Iskalasan bile), O düşman senden o tur kaçarken Fırsat Saldırısı (Opportunity Attack) ATAMAZ! Zıpla, vur ve geri çekil!" },
                { level: 3, name: "Rakish Audacity", desc_tr: "İnisiyatif Zarına artık Çeviklik(Dex) Puanıyla beraber (Charisma) Puanın da eklenir! Ayrıca Sinsi Vuruşu (Sneak Attack) artık SADECE SEN ve HEDEF baş başaysanız; (Avantaj veya dosta gerek duymadan) OTOMATİK vurursun (Düello ustası)." },
                { level: 9, name: "Panache", desc_tr: "Persuasion (İkna) ile Şov! Birini kızdırırsan(Tant - Çekici Düello) Sana saldırmaya mecbur olur, başkasına saldırırsa Hedef Dezavantaj yer! Veya düşman olmayan birinde yaparsan ONU kendi büyüsüze aşık ederek (Charm) bağlarsın!" },
                { level: 13, name: "Elegant Maneuver", desc_tr: "Bedava Zariflik. Bonus Eylem ile Akrobasi veya Atletizm (Kaçış ve tırmanış) zarlarına kendini odaklayarak otomatik AVANTAJ sağlarsın!" },
                { level: 17, name: "Master Duelist", desc_tr: "Saldırıyı Kaçırdığında Tekrar Odaklan (Kısa Dinlenmede 1 Kez)! Bir Atakta Iskalarsan O SİLAH ATAĞINI KESİNLİKLE AVANTAJLA baştan Yeniden deneme/atma (Reroll) hakkı kazanırsın!" }
            ]
        }
    ]
};
