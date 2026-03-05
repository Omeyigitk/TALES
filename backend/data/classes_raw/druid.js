module.exports = {
    name: "Druid",
    hit_die: "d8",
    primary_ability: "Wisdom",
    saves: ["Intelligence", "Wisdom"],
    armor_proficiencies: ["Light Armor", "Medium Armor", "Shields (druidler metal zırh veya kalkan kullanmaz)"],
    weapon_proficiencies: ["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"],
    description_tr: "Doğanın eski ve gizemli güçlerini kullanan, elementleri yönlendiren ve vahşi hayvan biçimlerine (Wild Shape) dönüşebilen doğa büyücüsü.",
    subclass_unlock_level: 2,
    features: [
        { level: 1, name: "Druidic", desc_tr: "Sadece Druidlerin bildiği gizli doğa dilini (Druidic) bilirsin. Bu dilde bırakılan gizli mesajları okuyabilirsin." },
        { level: 1, name: "Spellcasting", desc_tr: "Wisdom (Bilgelik) yeteneğini kullanarak doğa tabanlı (Nature) Druid büyüleri yapabilirsin. Büyülerini Druidic Focus (Örn: asa, ökse otu) kullanarak odaklayabilirsin." },
        { level: 2, name: "Wild Shape (2/Rest)", desc_tr: "Eylem (Action) harcayarak daha önceden gördüğün bir Hayvan (Beast) biçimine dönüşebilirsin. Dönüştüğün hayvanın Canını (HP) ve fiziksel zarlarını (Güç, Çeviklik) alırsın, kendi zihnin (Wisdom, Int, Cha) kalır. Canın sıfırlanırsa sadece hayvan formu biter ve eski asıl canına dönersin. Şimdilik Maksimum CR: 1/4 (Yüzme/Uçma hızı yasak)." },
        { level: 2, name: "Druid Circle", desc_tr: "Doğa felsefeni yansıtan bir Druid Çemberi (Subclass) seçersin (Örn: Circle of the Moon, Çemberi). Bu sana anında özel yetenek kazandırır." },
        { level: 4, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu (Ability Score) 2 artırabilir veya iki farklı yeteneği 1'er artırabilirsin (Maksimum 20). Alternatif olarak bir Feat seçebilirsin." },
        { level: 4, name: "Wild Shape Improvement", desc_tr: "Daha güçlü hayvanlara (Maksimum CR: 1/2) dönüşebilirsin ve bu hayvanların Yüzme (Swimming) hızı olabilir (Kurbağa veya timsah vs.)." },
        { level: 6, name: "Circle Feature", desc_tr: "Seçtiğin Druid Çemberi'nden (Subclass) 6. seviye yeteneği." },
        { level: 8, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat)." },
        { level: 8, name: "Wild Shape Improvement (Flying)", desc_tr: "Artık çok usta bir dönüşümcü olarak (Maksimum CR: 1) hayvanlarına geçebilir ve UÇMA (Flying) hızına sahip dev kartallar veya baykuşlara da dönüşebilirsin." },
        { level: 10, name: "Circle Feature", desc_tr: "Seçtiğin Druid Çemberi'nden (Subclass) 10. seviye özelliğini kazanırsın." },
        { level: 12, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat)." },
        { level: 14, name: "Circle Feature", desc_tr: "Seçtiğin Druid Çemberi'nden (Subclass) 14. seviye nihai özelliğini kazanırsın." },
        { level: 16, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat)." },
        { level: 18, name: "Timeless Body", desc_tr: "Doğanın büyüsü senin bedenini öyle bir dinçleştirir ki; her geçen 10 yıl senin vücudunu sadece 1 yıl yaşlandırır." },
        { level: 18, name: "Beast Spells", desc_tr: "Mükemmel Evrim: Wild Shape ile bir HAYAAN formundayken BÜYÜ (Spell) OKUMAYA (Sözlü/El kolla yapılanlarını) devam edebilirsin! Malzeme gerektirmeyen her büyüyü ayı bedeniyle de fırlatabilirsin." },
        { level: 19, name: "Ability Score Improvement", desc_tr: "Bir yetenek skorunu 2 artır veya iki yeteneği 1'er artır (veya Feat)." },
        { level: 20, name: "Archdruid", desc_tr: "Doğanın tam efendisidir. Wild Shape (Dönüşüm) kullanımların artık SINIRSIZ! İstediğin zaman hayvana geçip formlar arası sürekli takla atarsın. Ayrıca büyü okurken Pahalı Olmayan Maddeler (ve Söz/El Hareketleri) gereksinimi tamamen YOK OLUR." }
    ],
    subclasses: [
        {
            name: "Circle of the Land",
            description_tr: "Belirli bir coğrafyayla (Çöl, Orman, Kutup vb.) derin bağlar kuran, büyüyü bitkiler ve yer yüzeyinden çeken usta büyücü druidler.",
            features: [
                { level: 2, name: "Bonus Cantrip", desc_tr: "Ekstradan seçebileceğin (+1) Druid Cantrip'i öğren." },
                { level: 2, name: "Natural Recovery", desc_tr: "Doğanın yenilenmesi. Günde 1 kez Kısa Rest (1 Saat Dinlenme) esnasında, (Toplam Druid Seviyenin Yarısına eşit oranda) Harcanmış Büyü (Spell Slot)'larını Geri Cüzdanına doldurursun/Yenilersin." },
                { level: 6, name: "Land's Stride", desc_tr: "Doğada engel tanımaz. Sihiri Olmayan Orman Dikenleri, Sık Çalılar, Çamur gibi ZORLU ZEMİNLERİN (Difficult terrain) hiçbiri senin Hızını yavaşlatamaz! Ve bitkilerden (Zehirli sarmaşık vb) asla yara almazsın." },
                { level: 10, name: "Nature's Ward", desc_tr: "Bağışıklık kazanırsın: Elementaller (Ateş/Su varlıkları) veya Perilerden (Fey) gelecek Charm(Aşk büyüsü) veya Frightened(Korkutma) Büyülerine karşı tamamen DOKUNULMAZ OLURSUN. Zehir hastalıklarına etkilenmezsin." },
                { level: 14, name: "Nature's Sanctuary", desc_tr: "Doğanın Kutsalı: Etraftaki Vahşi yaratıklar (Hayvanlar) ve Bitkiler (Canavar bitkiler vs.) SANA VURMAK İçin ZAR ATAR. Zar atıp (Wis save) başarısız olan yaratık Kararını Aniden ŞAŞIRI BAŞKASINA Vurur (Senin yerine başkasına)." }
            ]
        },
        {
            name: "Circle of the Moon",
            description_tr: "Ayın döngüsüne ve hayvanların vahşiliğine adanmış; savaş alanında Devasa Ayılara/Dinazorlara dönüşerek tanklayan ön saf savaşçı druidleri.",
            features: [
                { level: 2, name: "Combat Wild Shape", desc_tr: "Savaşın Ustası! Hayvana Dönüşme (Wild Shape) Eylem Değil, BONUS ACTİON İle YAPILIR. Ve Hayvan Vücudundayken Hasar yediğinde, Druid Büyü Slotu harcayarak O Vücudu iyileştirebilir(Heal Zarları atarak) Çok daha yüksek Tanklığa ulaşabilirsin." },
                { level: 2, name: "Circle Forms", desc_tr: "Emsalsiz hayvanlar. Dönüşebileceğin Hayvanın Gücü Cüssesi NORMAL DRUİDLERİN sınırlarını Paramparça eder! Seviye 2'de CR1 (Dire Wolf, Kahverengi Ayı, vb.) Dönüşebilirsin (Formül: Druid Levelin Bölü Üç'ü kadar Güçte hayvanlar)." },
                { level: 6, name: "Primal Strike", desc_tr: "Dönüştüğün her hayvanın Pençeleri (Saldırıları) SİHİRLİ (Magical) Silah Saldırısı sayılır. Fiziksel Vuruş direncine sahip hayaletvari canavarlara Tam hasar geçirirsiniz." },
                { level: 10, name: "Elemental Wild Shape", desc_tr: "Hayvan formunu aştın. Artık cebindeki İKİ WildShape Hakkını da aynı anda Yakarak doğrudan Saf ELEMENTAL Ruhlara (Air, Earth, Fire Veya Water Elemental Canavarlarına) Dönüşebilirsin!! (CR 5 çok dayanıklı elementollerdir)." },
                { level: 14, name: "Thousand Forms", desc_tr: "Sonsuz şekil. Her turun istediğin zaman hiç bir gereksinim duymadan BELEŞTEN Kendine Alter Self (Kendini Değiştir) Sınırsız Büyüsü Okuyarak. İnsanken bile Boyut değişme Solungaç Çıkartma vb bedensel değişim yaparsın." }
            ]
        },
        {
            name: "Circle of Dreams",
            description_tr: "Feywild'ın (Peri Diyarı) rüya boyutundan pozitif şifa çeken, partisini uzaktan mükemmel destekleyen uyku ve barış elçileri.",
            features: [
                { level: 2, name: "Balm of the Summer Court", desc_tr: "Sadece sana özel Ekstra Büyülü Peri Şifası(Fey Havuzu) olur. Her Gün (Druid seviyesi kadar miktar) D6 Zarların olur. Bonus Action atarak 120 Feet uzaklıktaki adamlara Can (Hem gerçek can hemi Geçici Can kalkanı HP'si) İyileştirmesi sağlarsın. (Büyü Slotu HARCAMAZ!)." },
                { level: 6, name: "Hearth of Moonlight and Shadow", desc_tr: "Mistik Kamp: Takımın çadır kurduğunda (Dinlenmede) Oraya bir Küre (Gölgeli Kamp Aurası) atarsın. Uyuyan Arkadaşlarınız (Stealth-Gizlilik) ve Gözlem Nöbetindekiler (Perception-Kavrama) Skillerine çok kuvvetli +5 Bonus Alır. Yaratık baskını yemenizi önler." },
                { level: 10, name: "Hidden Paths", desc_tr: "Görünmez kapılar. Bonus Eylem atarak aniden Kendini (60 ft uzaklıktaki) bir yere. Veyahutta KENDİN HARİCİ Bir dostunu Onaylarsa (30 Fte Uzağa tehlikeden kaçırmak İçin) IŞINLARSIN (Teleport). Göz açıp kapayıncaya dek konum deşiştirtir." },
                { level: 14, name: "Walker in Dreams", desc_tr: "Kısa rest(Yarım dinlenme bittiğinde) Sen Direkt hiç büyü hakkı ve Materyal TUKETMEDEN rüyasal teleport büyülerinden: (Dream, Scrying Veya Teleportation Circle) Büyülerinden İstediğini O Gün Beleş Okur/Uygularsın." }
            ]
        },
        {
            name: "Circle of the Shepherd",
            description_tr: "Doğa hayvanlarına yol gösteren, hayvan sürüleri çağırarak ve Ruh Totemleriyle arkadaşlarını minyonlayıp bufflayan destek druidleri.",
            features: [
                { level: 2, name: "Speech of the Woods", desc_tr: "Ormanda yalnız değilsin. Çevrendeki Tüm Hayvanlar ile Doğrudan OTOMATİK İletişime geçebilme/Konuşabilme yetisi Kazanırsın!. Ve Peri dilini (Sylvan) öğrenirsin." },
                { level: 2, name: "Spirit Totem", desc_tr: "Bonus Eylemde havadan Dev Bir DOĞA HUHU çağırıp Takım Arkadaşlarını (Aurasında) GÜÇLENDİR! BEAR(Ayı Ruhu): Takıma Toplu Geçici Can ve Güç Zarı. HAWK(Kartal Ruhu): Bir dosta Saldırı Zarında AVANTAJ vermek (Reaksiyonunla şahin saldırtır). UNICORN(Tek boynuzlu at Ruhu): Sen birisine Tek Gıdım Can İyileştirdiğin anda Bu Unicorn Aura içinde Duran Herkesin Topluca CANINI Eşit yeniler." },
                { level: 6, name: "Mighty Summoner", desc_tr: "Ordunun efendisi. Büyüyle (Örn Conjure Animal) Çağırttığın Tüm hayvan veya fey'ler; Çap olarak Seviyelerince Ekstra Can / HP alır Artı Hepsinin attığı Isırıklar Doğal Yoldan SİHİRLİ HASAR (Magical Strike) Atar Sayılır." },
                { level: 10, name: "Guardian Spirit", desc_tr: "Ruhun koruması. Havadan Totem Diktiğinde, Ve Birisi O Totemin Altında Senin (Canavarlaştırdığın Varlıklarına vb) Can basarken (Ekstradan Totem Ruhu Onların Canlarını Her Tur Yenilemesinde Süzülen Ek güç/Healing atar!)." },
                { level: 14, name: "Faithful Summons", desc_tr: "Fedakar doüa: HPn Sıfıra Ulaştığı Anda Veyahut Karakterin Çöktüğünde (Bayılırken)! BİR ANDA SENİN İÇİN! (Çok Yüksek Levele Denk Gelen Konjürasyon / Tam 4 Adet Güçlü CR2) Orman Yaratığı Yoktan Var Olup, Seni Parçalamaya gelenleri Parçalamak Üzere Etrafını kuşatır!" }
            ]
        },
        {
            name: "Circle of Spores",
            description_tr: "Doğanın çiçekli yanını değil, zehrin, mantarların, bulaşıcı salgınların ve çürümenin güzelliğini manipüle eden Spore(Mantar) druidleri.",
            features: [
                { level: 2, name: "Halo of Spores", desc_tr: "Düşmanlar sana ÇOK Yaklaşırsa (10 feet alan) Veya O bölgede dolaşırlarsa Reaksiyonunu kullanarak ONA DİREKT olarak Zarar Veren (Nekrotik) Yakan Spor Mantar Tozları Savurursun (O Da Dayanıklılık zarında kaybederse Hasar Tutar)." },
                { level: 2, name: "Symbiotic Entity", desc_tr: "Vahşi formunda farklılık var: Wild Shape slotunu Hayvana dönüşmek YERİNE. Direkt Kendinin Üstündeki Mantarları Püskürtüp SENİ (Symbiom/Venom gibi) Mutasyona Uğratır. Vucudun Mantarlaşırken Devasa Temp (Geçici Kalkan) HP alır; Spres Toz Hasarın 2 ye Katlanır ve Silah Atışlarına BİLDİĞİN +D6 Nekrotik Sancı vurdurtursun.(Mantar Formun 10 dk Sürer)." },
                { level: 6, name: "Fungal Infestation", desc_tr: "Zombi yetiştirici. EĞER Etrafındaki 10 feette (Beast/Hayvan Sınıfı veya Humanoid/İnsan-Cüce Cesedi Sınıfı) bir Leş düşerse! Reaksiyon kullanarak Cesedi ZOMBİ'ye (Fungal Zombie) Dönüştürüp AYAKLANDIR! Seninle 1 Saat Gezsin Uşak gibi Saldırsın!." },
                { level: 10, name: "Spreading Spores", desc_tr: "Zehir Bulutu: Mantar (Symbiotic) Mutasyonunda isen, Gücünü kullanarak İstediğin Uzaktaki Bir (Hedef Alana) 10 FT genişiliğinde Devasa bir mantar fırtınası At! Mantar içinde Oksijen alan Çekilen/Yürüyen herkes Nekrotik Dumanın Zehrinden ağır zararlar alır." },
                { level: 14, name: "Fungal Body", desc_tr: "Senin vucudun hastalıklara o kadar bütünleşti ve mutasyona girdi Ki!! Körlük (Blinded), Sağırlık (Deafened), Korku (Frightened) VE Zehirlenme (Poisoned). HİÇ BİRİSİ SANA ASLA İŞLEMEZ Yüzde 100 Doğal İmmünsün! VE Sana Kritik(Hasar İkiye Çarpılma) Kritik Saldırı Attıklarında Vücudundaki parazitler bunu normal (Düz Hasar ) seviyesinde Emecektir." }
            ]
        },
        {
            name: "Circle of Stars",
            description_tr: "Yıldız yollarını haritalandıran, takım yıldızlarından psişik hasar ve şifalı galaktik enerjiler çeken parlak ışıklı kadim bilginler.",
            features: [
                { level: 2, name: "Star Map", desc_tr: "Elindeki gizemli bir yıldız haritasın olur(Işık Yayar). (Guidance büyüsünü beleş verir) Yıldızlardan güç çekerek; Senin elinden fırlayan Şahane Guiding Bolt ATEŞ TOPU gibi 4d6(Hasarlı Parlayan) Büyü Saldırısını Her Gün BELEŞTEN(Prof Sayın kadar Slot Gitmeden) Mermi atarak atmanı Sağlar." },
                { level: 2, name: "Starry Form", desc_tr: "Wild Shape(Dönüşüm Slotu) Yakarak => YILDIZ FORMUNA (İçinde Takımyıldızlar parlayan Mavi Forma) Bürün!. Üç Şekilden birisi Seçilir: (OKÇU/Archer) Bonus Eyleniz de Yıldız Oku (1d8+Wis dmg) Sıçratırsınız. (KADEH/Chalice) Ne Zaman Heal/Şifa yeteneği uygularsanız Yanındaki Yakın DOSTUNUZ YADA SİZ DE BEDAVA Parçacıktan (1D8 +wİS) HP HEali ÇEKMİŞ Olursunuz. (EJDERHA/Dragon) Wisdom Konsantre Testlerinizi(Intelligence Ve wİSDOM Kontorl Zarınızı) Atmadan Eğer 9 Ve ALTIysa 10 GEÇERLİ Saydıran Ejder Kanadı Parıltısı." },
                { level: 6, name: "Cosmic Omen", desc_tr: "Zar(Evreni) Kader Okuma! Gün Başında Zar at (Dinlenmede)!... EĞER(TEK Gelirse WEAL): Takım Arkadaşının Gelecekte atacağı Başarısız Savelere / Ataklara 1D6 Ekstra Güç Puanı Verip O Kaderi Geri Kurtar! EĞER (ÇİFT Sayı Gelirse WOE): Düşmanın Atacağı Attacklardan Zarları 1D6 EKSİLT Ayrıca Düşür ve Dengesini ŞAŞIRT." },
                { level: 10, name: "Twinkling Constellations", desc_tr: "Yıldız Işıması Çoğaldı! Archer'ın (Yıldız oku Atış Kuvveti) / Veya Challice'n Heal(Bölüşen Şifa Kuvveti) gücü Artık 1D8'den => Zar Tavan Yaparak (2D8 Zararına / Yada 2D8 Şifasına)'e FIrlar! AyrIcana Her Tur Başlamasında; Formlarını (Okçu-Kadeh-Ejderha Arasında Bedava Tık Tık Değiştirebilirsiniz)." },
                { level: 14, name: "Full of Stars", desc_tr: "Yıldız Formunda Kalırken Zırhına Dokunulmazlık ve Boyut Aşımı Uygulanır: Fiziksel Silahların Senin Işık Hüzmene Hasar Vermeleri (Delici Ok, Kesici kılıç ve Bludgeoning Sopalar Hepsi) SANA VURSALAR Bile Yarım Hasar (DİRENÇLİ / RESISTANCE) Gücüne Kapılırsın." }
            ]
        },
        {
            name: "Circle of Wildfire",
            description_tr: "Yıkıcı yangının doğadaki yeniden büyüme döngüsünün zorunlu bir evresi olduğuna inanan; saf alev ile hem iyileştiren hem rakipleri kül yığınına çeviren druidler.",
            features: [
                { level: 2, name: "Summon Wildfire Spirit", desc_tr: "Wild Shape (Hayvana Geçmek) Harcadığında Bunun Yerinde Sana Alev Canlısı Bir ATEŞ PERİSİ(Canavarı - Fire Spirit) Yaratır! Ruh senin emirlerini dinler ve kendi Başına ateş tükürüp uçar. Çıktığı alanda Püskürtme Alan Alevi sıçatarak Hasar Vererek Spawmlanır Yaratı." },
                { level: 6, name: "Enhanced Bond", desc_tr: "Wildfire Spirit (Hayvanın) Dışarıda Açıkken Senin elinden fırlayan Ateş ve Şifa Hasarlarında Güç Patlaması Yaşanır! Yani Ateş / Heil attığında O Büyünün içine Extra (1d8 + Büyüleyici hasar/ Can) Koymanı ekletir!" },
                { level: 10, name: "Cauterizing Flames", desc_tr: "Ölümden Doğuş. 30 Feet içinde Küçükten Büyükte hiç fark etmeden herhangi bir Canlı (Yaratık yada Düşman) Öldüğünde(Bayıldığında) Hayalet bir Alev Parçası Bırakır (Görkemli Tılsım). Sen Eylem harcayarak Reaksiyon Alıp o Işık Parçasını Bir Dostunuza UÇURUR (Can-Heal Verdirir) VEYA Alevi Düşmanın üstünden PATLATARAK (ATEŞ ZARARINDA) Zarar Verdirtsin!" },
                { level: 14, name: "Blazing Revival", desc_tr: "Mükemmel fedakarlık. Eğer Senin Canın O hp ile sıfırlanıp ve Tam Ölmek Yere devrilmek Üzereysen!!! Ve FireSpirit (Ateş perisinin CİSMİ DIŞARIDAYSA): Hayvancağız (Ruh Parçacığıı Anında İçinde İNTİHAR EDER/Kendini Parçalar Yok olup Sana GİRER!); O An Sen 0 Can Olmak Yerine O canavarın CANI YARISINA KADAR Geri gelerek ANINDA HEALLENİR Ayağa Kalkarsın (Baştan doğan bir Feniks gibisiniz!)." }
            ]
        }
    ]
};
