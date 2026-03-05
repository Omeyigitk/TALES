module.exports = {
    name: "Warlock",
    hit_die: "d8",
    primary_ability: "Charisma",
    saves: ["Wisdom", "Charisma"],
    armor_proficiencies: ["Light Armor"],
    weapon_proficiencies: ["Simple Weapons"],
    description_tr: "Karanlık veya gizemli varlıklarla (Şeytan, Cthulhu, Periler vb) ruhani anlaşmalar imzalayarak eldritch büyü yetenekleri kazanan okült büyücüler.",
    subclass_unlock_level: 1,
    features: [
        { level: 1, name: "Otherworldly Patron", desc_tr: "Ruhunu sattığın veya anlaşma imzaladığın Patronu (Subclass) seçersin (Örn: The Fiend, Hexblade). Bu sana ekstra büyüler ve özellikler verir." },
        { level: 1, name: "Pact Magic", desc_tr: "Maksimum 4 büyü slotun vardır ama hepsi sahip olduğun en yüksek seviyeden (Max 5. Lvl) otomatik atılır. Bu slotlar Kısa Dinlenmede tamamen dolar." },
        { level: 2, name: "Eldritch Invocations", desc_tr: "Patronundan kazandığın yasaklı pasif yetenekler. 2 tane seçersin, seviye atladıkça artar. (Örn: Agonizing Blast, Armor of Shadows)." },
        { level: 3, name: "Pact Boon", desc_tr: "Patronun anlaşmanı somutlaştıran bir hediye sunar. Pact of the Blade (Kılıç), Tome (Büyü Kitabı), Chain (Familiar/Evcil) veya Talisman (Kolye)." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu 2 veya iki yeteneği 1'er artır, ya da Feat seç." },
        { level: 6, name: "Patron Feature", desc_tr: "Seçtiğin Otherworldly Patron'dan (Subclass) yeni bir özellik kazanırsın." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 10, name: "Patron Feature", desc_tr: "Seçtiğin Patron'dan seviye 10 özelliği gelir." },
        { level: 11, name: "Mystic Arcanum (6th level)", desc_tr: "6. seviye bir Warlock büyüsünü her uzun dinlenme (Long Rest) başına 1 kez büyü slotu harcamadan ücretsiz atma hakkı kazanırsın." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 13, name: "Mystic Arcanum (7th level)", desc_tr: "7. seviye bir büyüyü uzun dinlenme başına 1 kez bedava atma hakkı kazanırsın." },
        { level: 14, name: "Patron Feature", desc_tr: "Seçtiğin Patron'un (Subclass) seviye 14 tepesi özelliği." },
        { level: 15, name: "Mystic Arcanum (8th level)", desc_tr: "8. seviye bir büyüyü uzun dinlenme başına 1 kez bedava atalarsın." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 17, name: "Mystic Arcanum (9th level)", desc_tr: "9. seviye (En Yüksek) bir büyüyü uzun dinlenme başına 1 kez slot harcamadan atma hakkı kazanırsın." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Yetenek skorunu artır veya Feat al." },
        { level: 20, name: "Eldritch Master", desc_tr: "Patronuna yalvararak, uzun dinlenmede dolar dediğimiz büyü slotlarını sadece 1 Dakika harcayarak tümünü (4 Slot) tamamen geri kazanabilirsin (Günde 1 kez)." }
    ],
    subclasses: [
        {
            name: "The Fiend",
            description_tr: "Asmodeus veya Demon Lordları gibi cehennemin şeytanlarıyla ruhani bir anlaşma imzalayan ateş büyücüleri.",
            features: [
                { level: 1, name: "Dark One's Blessing", desc_tr: "Bir düşmanı öldürdüğünde veya canını 0'a indirdiğinde Karizma modülün + Warlock seviyen kadar Geçici Can Puanı (Temp HP) kazanırsın." },
                { level: 6, name: "Dark One's Own Luck", desc_tr: "Şeytanın şansı! Bir Zar atarken (Örn: Savunma veya Yetenek zarı) başarısız olursan 1d10 ekleyerek zarı kurtarabilirsin (Kısa veya uzun dinlenmede 1 kez)." },
                { level: 10, name: "Fiendish Resilience", desc_tr: "Kısa veya uzun dinlenmeyi bitirdiğinde 1 tür hasar (Örn: Ateş, Kesici) seç. Büyülü olmayan veya Gümüş olmayan silahlardan o hasar türü geldiğinde Hasar Direnci (Resistance) kazanırsın." },
                { level: 14, name: "Hurl Through Hell", desc_tr: "Bir düşmana isabetli vurduğunda onu 1 turluğuna Cehennemden aşağı atabilirsin. Savaş alanına geri döndüğünde hedef 10d10 Psişik hasar alır (Sadece uzun dinlenmede 1 kez)." }
            ]
        },
        {
            name: "The Archfey",
            description_tr: "Doğanın kurnaz, çekici ve zihin büken peri beyleriyle (Örn: Titania) güç takası yapan orman büyücüleri.",
            features: [
                { level: 1, name: "Fey Presence", desc_tr: "Bonus Eylem kullanarak 10 feet çevrendeki herkesin Wisdom (Bilgelik) kurtarma zarı atmasını istersin; başarısız olanları tur sonuna kadar Cezbedebilir (Charmed) veya Korkutabilirsin (Frightened)." },
                { level: 6, name: "Misty Escape", desc_tr: "Hasar aldığında Reaksiyon kullanarak görünmez olur ve 60 feet uzağa ışınlanabilirsin. Ertesi turun başlangıcına kadar veya saldırana kadar GÖRÜNMEZ (Invisible) kalırsın." },
                { level: 10, name: "Beguiling Defenses", desc_tr: "Sana karşı kullanılan Çekicilik (Charm) etkilerine tamamen BAĞIŞIKLIK kazanırsın. Ayrıca birisi seni charm etmeye çalışırsa Reaksiyon ile onu kendi tuzağına düşürüp charm edebilirsin." },
                { level: 14, name: "Dark Delirium", desc_tr: "Bir hedefin bilincini kilitlersin; Wis save atamazsa yaratık 1 dakika boyunca gördüğü her şeyi uçsuz bucaksız bir ork illüzyonuna veya sis dünyasına dönüşmüş olarak algılar. Sana ve saldırana kadar sadece senin hayalinle çırpınır." }
            ]
        },
        {
            name: "The Hexblade",
            description_tr: "Gölgeler Diyarının mistik bilinçli silahlarıyla (veya The Raven Queen ile) anlaşan, eldritch güçleri kılıca işleyen yakın dövüş (Melee) Warlockları.",
            features: [
                { level: 1, name: "Hex Warrior", desc_tr: "Orta Boy Zırh (Medium Armor), Kalkan ve Askeri (Martial) silahlarda uzmanlık kazanırsın. Ayrıca silahla vururken Güç (Str) veya Çeviklik (Dex) yerine doğrudan Karizma (Cha) puanını kullanabilirsin." },
                { level: 1, name: "Hexblade's Curse", desc_tr: "Bonus Eylem ile 1 hedefi lanetlersin (Kısa/Uzun restte 1 kez). O hedefe fazladan Hasar vurur, 19 ve 20 atınca Kritik vurur ve ölünce seviyen + Karizma kadar Can kazanırsın." },
                { level: 6, name: "Accursed Specter", desc_tr: "Lanetlediğin bir hedef öldüğünde ruhunu çalarak sana itaat eden, hizmetkar bir Hayalet'e (Specter) çevirebilirsin; bu hayalet hedefin geçici HP'sini alır." },
                { level: 10, name: "Armor of Hexes", desc_tr: "Seni hedef alan bir Lanet (Hex) kurbanı sana saldırdığında veya sihir atarken 1d6 at; eğer zar 4 veya daha yüksek gelirse, hedef zarı yüksek gelse dahi saldırısını/büyüsünü tamamen ıskalar." },
                { level: 14, name: "Master of Hexes", desc_tr: "Hedefin öldüğünde, eğer yakında başka bir yaratık varsa Lanetini (Hexblade's Curse) anında başka bir hedefe geçirebilir (ziyan olmadan kullanmaya devam edebilirsin)." }
            ]
        },
        {
            name: "The Genie",
            description_tr: "Ateş, Su, Hava veya Toprak Genieleriyle (Cin) dost olup dilekler fısıldayan, efendisinin sihirli küçük bir şişesinde saklanan kadim varlıkların warlock'ları.",
            features: [
                { level: 1, name: "Genie's Vessel", desc_tr: "Cin sana büyülü bir şişe veya yüzük verir. Bu eşyanın içine eylemle girebilir ve güvenle uzun saatler (warlock seviyene eşit saat) dinlenebilirsin. Ayrıca turda bir kez saldırılarına ek elemental hasar verebilirsin." },
                { level: 6, name: "Elemental Gift", desc_tr: "Efendine (Patronuna) uygun türe hasar direnci (Resistance) kazanırsın. Ayrıca Bonus Eylemle kendine 10 dakikalık 30 feet Uçma Hızı (Fly) kazandırabilirsin." },
                { level: 10, name: "Sanctuary Vessel", desc_tr: "Cin'in şişesinin içine (Vessel) seninle birlikte 5 arkadaşını daha alabilirsin! İçeride Kısa Dinlenmeler sadece 10 dakika sürer ve dinlenmede atılan zarlara senin Karizma Puanın eklenir." },
                { level: 14, name: "Limited Wish", desc_tr: "Bonus eylem harcayarak Patronundan mini bir Dilek dilersin! Seviye 6 veya Daha Düşük tüm sınıfların (Büyücü,Ruhban,Druid,Bard,vs) büyülerinden BİRİSİNİ bedava atabilirsin." }
            ]
        },
        {
            name: "The Undying",
            description_tr: "Ölümü yenmiş, çürüyemeyen antik bir Lich'in, Vampirin veya ölümsüz varlığın lütfuna erişen; ölüm eşiğini defalarca aşabilen yaşamın warlocku (SCAG).",
            features: [
                { level: 1, name: "Among the Dead", desc_tr: "Spare the Dying cantrip'ini bedava öğrenirsin. Ayrıca Undead yaratıklar sana şüpheli gözüyle bakmaz; sen, onları düşman gibi davranmaya zorlayan bir özellik ya da büyü kullanmadığın sürece sana saldırmazlar (seni kendi türlerinden zannederler)." },
                { level: 6, name: "Defy Death", desc_tr: "Ölüm atlatma: Başarılı bir Death Saving Throw attığında ya da Spare the Dying ile birini stabilize ettiğinde, kendi HP'ni 1d8 + Con Modifier kadar yenilersin!" },
                { level: 10, name: "Undying Nature", desc_tr: "Bedene kazınmış ölümsüzlük: Artık uyku, yiyecek, su veya nefese ihtiyaç duymazsın. Nefes almader deniz altında saatlerce bekleyebilirsin. Yavaş yaşlanmaya başlarsın ve doğal yaşlanma etkilerin asla %50'yi geçemez." },
                { level: 14, name: "Indestructible Life", desc_tr: "Cennet'ten gelen HP. Her turun BAŞINDA canın 0 ise veya 0'ın üzerindeyse; Con Modifier + Warlock Seviyesi kadar HP kazanırsın. Bu özellik bazı durumlarda birden fazla kez ölmene rağmen kalkmana neden olabilir." }
            ]
        }
    ]
};
