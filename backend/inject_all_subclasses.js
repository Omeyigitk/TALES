const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'classes.json');
let classes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// ============================================================
// TÜM ALT SINIFLAR — UTF-8 — 12 Sınıf, ~102 Alt Sınıf
// ============================================================
const allSubclasses = {
    Barbarian: {
        subclass_unlock_level: 3,
        subclasses: [
            { name: 'Path of the Berserker', description_tr: 'Öfkelerini saf vahşete dönüştüren, savaşın ortasında çılgınca güç kazanan gözü dönmüş savaşçılar.', features: [{ level: 3, name: 'Frenzy', desc_tr: 'Rage halindeyken bonus action ile ekstra 1 yakın dövüş saldırısı yap; öfken bitince 1 Exhaustion alırsın.' }] },
            { name: 'Path of the Totem Warrior', description_tr: 'Hayvan ruhlarıyla (Totem) bağ kurarak doğanın vahşi gücünü ve koruyuculuğunu içine çeken savaşçılar.', features: [{ level: 3, name: 'Totem Spirit (Bear)', desc_tr: 'Öfkeliyken psişik hasar hariç tüm hasara direnç kazanırsın.' }, { level: 3, name: 'Totem Spirit (Eagle)', desc_tr: 'Öfkeliyken fırsat saldırılarına dezavantaj uygular; bonus action ile koşarsın.' }] },
            { name: 'Path of the Ancestral Guardian', description_tr: 'Atalarının ruhlarını çağırarak savaş alanında hem kendini hem de dostlarını koruyan şamanik savaşçılar.', features: [{ level: 3, name: 'Ancestral Protectors', desc_tr: 'Rage halinde saldırdığın ilk düşman, diğer hedeflere zarar verirken direnç kazanamaz.' }] },
            { name: 'Path of the Storm Herald', description_tr: 'İçlerinde fırtına, çöl kumu ya da buz tufanı gibi bir elementel güç barındıran ve Rage sırasında doğa olaylarını ateşleyen savaşçılar.', features: [{ level: 3, name: 'Storm Aura', desc_tr: 'Tundra (buz), Sea (yıldırım) veya Desert (ateş) arasından bir aura seç; her Rage\'de hasara ya da geçici cana dönüşür.' }] },
            { name: 'Path of the Zealot', description_tr: 'İlahı adına ateşli bir bağlılıkla savaşan ve ölümden geri döndürülmesi çok ucuz olan savaşçılar.', features: [{ level: 3, name: 'Divine Fury', desc_tr: 'Rage halindeyken saldırılarında ekstra ışıyan (radiant) veya nekrotik hasar verirsin.' }] },
            { name: 'Path of the Beast', description_tr: 'İçlerindeki canavar ruhunu serbest bırakarak pençe, ısırık ve kuyrukla savaşan vahşi doğa savaşçıları.', features: [{ level: 3, name: 'Form of the Beast', desc_tr: 'Rage halinde pençe, ısırık veya kuyruktan birini seçerek doğal silah kazanırsın.' }] },
            { name: 'Path of Wild Magic', description_tr: 'Kontrol edilemez büyü enerjisi barındıran; Rage sırasında kaotik sihir patlamaları yaşayan savaşçılar.', features: [{ level: 3, name: 'Wild Surge', desc_tr: 'Rage\'e girince rastgele kaotik büyüsel etkiler ortaya çıkar.' }] },
            { name: 'Path of the Battlerager', description_tr: 'Sivri zırh parçaları giyen ve gövde temasıyla düşmanları kanatan Cüce savaşçılar.', features: [{ level: 3, name: 'Battlerager Armor', desc_tr: 'Sivri zırh giydiğinde yakın dövüş saldırılarında ek delici hasar verirsin.' }] }
        ]
    },
    Bard: {
        subclass_unlock_level: 3,
        subclasses: [
            { name: 'College of Lore', description_tr: 'Bilgiyi güç olarak kullanan, diğer sınıfların büyülerine bile erişebilen en çok yönlü Ozan okulu.', features: [{ level: 3, name: 'Cutting Words', desc_tr: 'Bardic Inspiration zarını bir düşmanın saldırı, hasar veya yetenek zarından düşebilirsin.' }] },
            { name: 'College of Valor', description_tr: 'Cephede savaşan ve müttefiklerine ilham veren savaşçı Ozanlar.', features: [{ level: 3, name: 'Combat Inspiration', desc_tr: 'Dostların Bardic Inspiration zarını saldırı zarına veya AC\'ye ekleyebilir.' }] },
            { name: 'College of Glamour', description_tr: 'Feywild\'dan güç alan, büyüleyici cazibesiyle düşmanları etkisiz kılan Ozanlar.', features: [{ level: 3, name: 'Mantle of Inspiration', desc_tr: 'Bardic Inspiration harcayarak etraftakilere geçici can ver ve onları hareket ettir.' }] },
            { name: 'College of Swords', description_tr: 'Bıçak numaraları yapan, kılıcını büyüyle bütünleştiren akrobatik savaşçı Ozanlar.', features: [{ level: 3, name: 'Blade Flourish', desc_tr: 'Saldırı sonrası Bardic Inspiration harcayarak AC kazan, saldırı genişlet veya rakibi geri it.' }] },
            { name: 'College of Whispers', description_tr: 'Topluma sızdıran, dedikodu ve korku yayan, gölgede hareket eden karanlık casuslar.', features: [{ level: 3, name: 'Psychic Blades', desc_tr: 'Bardic Inspiration harcayarak silah saldırına ekstra psişik hasar ekle.' }] },
            { name: 'College of Creation', description_tr: 'Dünyanın yaratılışındaki ilk ezgiden güç alan, yoktan eşya yaratan Ozanlar.', features: [{ level: 3, name: 'Animating Performance', desc_tr: 'Bir eşyayı canlandırabilirsin; o eşya savaşta yardımcın olur.' }] },
            { name: 'College of Eloquence', description_tr: 'Kelimenin gücüne hükmeden, her konuşmada mükemmeliyetçi olan retoriğin ustaları.', features: [{ level: 3, name: 'Silver Tongue', desc_tr: 'Persuasion ve Deception zarlarında 9 veya altı attığında 10 saymak olur.' }] },
            { name: 'College of Spirits', description_tr: 'Öteki dünyanın ruhlarıyla irtibata geçen, tarot ve kehanet yoluyla güç toplayan gizem Ozanları.', features: [{ level: 3, name: 'Spiritual Focus', desc_tr: 'Haritama tahtası veya kristal top gibi ruhsal bir odak nesnesi büyü odağı olarak kullanırsın.' }] }
        ]
    },
    Cleric: {
        subclass_unlock_level: 1,
        subclasses: [
            { name: 'Life Domain', description_tr: 'İyileştirme ve sağlığa adanmış en güçlü destek ilahi yolu.', features: [{ level: 1, name: 'Disciple of Life', desc_tr: 'İyileştirme büyülerinde iyileşen can miktarı 2 + büyü seviyesi kadar fazla artar.' }] },
            { name: 'War Domain', description_tr: 'Savaş tanrılarına hizmet eden ve ön safta çarpışan pastoral savaşçı rahipler.', features: [{ level: 1, name: 'War Priest', desc_tr: 'Saldırı yaptıktan sonra bonus action ile 1 silah saldırısı yapabilirsin (WIS mod kadar / gün).' }] },
            { name: 'Light Domain', description_tr: 'Güneş ve ışığın tanrılarına tapan, alev topları yağdıran ve kötülüğü yakanlar.', features: [{ level: 1, name: 'Warding Flare', desc_tr: 'Sana vuracak bir düşmanın saldırısına dezavantaj verirsin (WIS mod kadar / gün).' }] },
            { name: 'Knowledge Domain', description_tr: 'Bilgeliğin ve bilginin tanrısına tapan, tarihi, dilleri ve sırları bilen rahipler.', features: [{ level: 1, name: 'Blessings of Knowledge', desc_tr: '2 dil ve 2 yetenekte uzmanlık kazanırsın.' }] },
            { name: 'Nature Domain', description_tr: 'Doğa ve vahşi yaşamın ilahilerine hizmet eden, bitki ve hayvanları yönlendiren doğacı rahipler.', features: [{ level: 1, name: 'Acolyte of Nature', desc_tr: '1 druid cantripi ve 1 yetenekte uzmanlık kazanırsın.' }] },
            { name: 'Tempest Domain', description_tr: 'Fırtına ve şimşek tanrılarının gücüyle savaşa atılan, göğü donatan savaşçı rahipler.', features: [{ level: 1, name: 'Wrath of the Storm', desc_tr: 'Sana çarpan düşmana reaksiyon olarak şimşek veya gök gürültüsü hasarı verirsin.' }] },
            { name: 'Trickery Domain', description_tr: 'Hile ve hilekarlık tanrılarına tapan, illüzyonlar ve şekil değiştirmeyle savaşan kurnaz rahipler.', features: [{ level: 1, name: 'Blessing of the Trickster', desc_tr: 'Bir dosta Stealth zarlarında avantaj verebilirsin.' }] },
            { name: 'Death Domain', description_tr: 'Ölüm tanrısının gücüyle nekrotik enerji akıtan genellikle kötü hizalamalı rahipler.', features: [{ level: 1, name: 'Reaper', desc_tr: 'Tek hedefli nekrotik cantrip\'ler iki hedefe kadar etki edebilir.' }] },
            { name: 'Arcana Domain', description_tr: 'Büyünün kendisini kutsal sayan, Wizard büyülerine erişen büyücü rahipler.', features: [{ level: 1, name: 'Arcane Initiate', desc_tr: 'İstediğin 2 Wizard cantripi öğrenirsin.' }] },
            { name: 'Forge Domain', description_tr: 'Demircilik ve yaratıcılık tanrısına tapan, silah ve zırhları kutsal enerjiyle güçlendiren rahipler.', features: [{ level: 1, name: 'Blessing of the Forge', desc_tr: 'Uzun dinlenmede bir silah veya zırha +1 büyüsel bonus verirsin.' }] },
            { name: 'Grave Domain', description_tr: 'Ölüm ve yasın doğal döngüsüne saygı duyan, ölümsüzlere düşman olan rahipler.', features: [{ level: 1, name: 'Circle of Mortality', desc_tr: 'HP\'si 0 olan canlıları iyileştiren büyülerde zarları maksimum al.' }] },
            { name: 'Order Domain', description_tr: 'Düzen ve yasa tanrısına bağlı, müttefiklerini komuta eden kanun rahipleri.', features: [{ level: 1, name: 'Voice of Authority', desc_tr: 'Bir müttefikin üstüne büyü atınca o müttefik bonus action ile saldırabilir.' }] },
            { name: 'Peace Domain', description_tr: 'Barış, uyum ve anlayışın kutsal yolu; müttefikler arasında güçlü bağlar kuran destek rahipler.', features: [{ level: 1, name: 'Emboldening Bond', desc_tr: 'Birden fazla dost arasında kutsal bir bağ kurarak onlara zar bonusu verebilirsin.' }] },
            { name: 'Twilight Domain', description_tr: 'Gün batımı, karanlık öncesi ve uykunun ilahisine tapan, geceyi koruyan rahipler.', features: [{ level: 1, name: 'Eyes of Night', desc_tr: 'Gelişmiş karanlık görüş kazanır ve bunu müttefiklerle paylaşabilirsin.' }, { level: 1, name: 'Vigilant Blessing', desc_tr: 'Bir müttefikin initiative zarına avantaj verirsin.' }] }
        ]
    },
    Druid: {
        subclass_unlock_level: 2,
        subclasses: [
            { name: 'Circle of the Land', description_tr: 'Belirli bir coğrafyayla bağ kuran ve o bölgenin büyülerini doğuştan bilen büyücü druidler.', features: [{ level: 2, name: 'Natural Recovery', desc_tr: 'Kısa dinlenmede büyü slotlarının bir kısmını yenileyebilirsin.' }] },
            { name: 'Circle of the Moon', description_tr: 'Wild Shape dönüşümlerini savaş için mükemmelleştirmiş güçlü form değiştiriciler.', features: [{ level: 2, name: 'Combat Wild Shape', desc_tr: 'Wild Shape\'e Bonus Action ile girer; formdayken slotları kullanarak can iyileştirirsin.' }] },
            { name: 'Circle of Dreams', description_tr: 'Feywild\'ın iyimser enerjisinden güç alan, rüyalar ve uykuyla bağlantılı iyileştirici druidler.', features: [{ level: 2, name: 'Balm of the Summer Court', desc_tr: 'Her gün Druid seviyene eşit dice pool kazanırsın; bunları müttefikleri iyileştirmek için kullanırsın.' }] },
            { name: 'Circle of the Shepherd', description_tr: 'Doğanın duhaları ile anlaşarak müttefiklerine aura koruması sağlayan çağırma uzmanları.', features: [{ level: 2, name: 'Spirit Totem', desc_tr: 'Bonus action ile Bear, Hawk veya Unicorn ruhunu çağırırsın; her biri farklı bonus sağlar.' }] },
            { name: 'Circle of Spores', description_tr: 'Çürüme ve yeniden doğuşu kutsal sayan, zehirli mantarlarla savaşan karanlık druidler.', features: [{ level: 2, name: 'Halo of Spores', desc_tr: 'Sana yaklaşan canlılara nekrotik hasar veren mantar bulutu oluşturursun.' }] },
            { name: 'Circle of Stars', description_tr: 'Yıldız yollarını harita olarak kullanan, kehanet güçleri olan kadim gök bilgini druidler.', features: [{ level: 2, name: 'Starry Form', desc_tr: 'Wild Shape slotunu kullanarak Archer (ışık saldırısı), Chalice (iyileştirme) veya Dragon (konsantrasyon) yıldız formuna girersin.' }] },
            { name: 'Circle of Wildfire', description_tr: 'Yangının yeniden büyüme döngüsünü kutsal sayan, alev ile hem iyileştiren hem yakan druidler.', features: [{ level: 2, name: 'Summon Wildfire Spirit', desc_tr: 'Wild Shape slotunu kullanarak savaşta alev ruhu çağırırsın.' }] }
        ]
    },
    Fighter: {
        subclass_unlock_level: 3,
        subclasses: [
            { name: 'Champion', description_tr: 'Ham fiziksel mükemmeliyeti hedefleyen, kritik vuruşlarını sıklaştıran klasik savaşçılar.', features: [{ level: 3, name: 'Improved Critical', desc_tr: '20 yerine 19-20 zarında kritik vuruş yaparsın.' }] },
            { name: 'Battle Master', description_tr: 'Superiority Dice ile taktiksel manevralar kullanan komutan savaşçılar.', features: [{ level: 3, name: 'Combat Superiority', desc_tr: '4 adet d8 Superiority Dice ve 3 manevra kazanırsın (itme, silahsızlandırma, yere serme vb.).' }] },
            { name: 'Eldritch Knight', description_tr: 'Hem zırh-silah hem de Wizard büyüleriyle savaşan sihirli şövalyeler.', features: [{ level: 3, name: 'Spellcasting', desc_tr: 'Abjuration ve Evocation ağırlıklı Wizard büyüleri öğrenirsin.' }, { level: 3, name: 'Weapon Bond', desc_tr: 'Silahını bedenine mühürlersin; geri çağırabilir ve düşürülmesini önlersin.' }] },
            { name: 'Arcane Archer', description_tr: 'Okları büyüyle doluşturan, düşmanları kontrol eden gizem okçuları.', features: [{ level: 3, name: 'Arcane Shot', desc_tr: 'Banishing, Bursting veya Seeking gibi büyüsel ok efektleri kullanırsın (long rest başına 2 kez).' }] },
            { name: 'Cavalier', description_tr: 'Binitten savaşmayı ve müttefikleri korumayı mükemmelleştirmiş şövalyeler.', features: [{ level: 3, name: 'Born to the Saddle', desc_tr: 'Biniten düşmek zor, atlamak kolay; mount\'a binmek bonus action sayılır.' }] },
            { name: 'Samurai', description_tr: 'Azimli kararlılık ve güçlü savaş ruhuyla hareket eden, hızlı ve kesin savaşçılar.', features: [{ level: 3, name: 'Fighting Spirit', desc_tr: 'Bonus action ile geçici can ve sonraki saldırılara avantaj kazandırırsın.' }] },
            { name: 'Psi Warrior', description_tr: 'Psiyonik enerjiyle silahlarını güçlendiren ve zihinsel kalkanlara sahip savaşçılar.', features: [{ level: 3, name: 'Psionic Power', desc_tr: 'Psionic Energy Dice ile saldırı zarına bonus ekler, hasar dönüştürür veya zihin kalkanı kurarsın.' }] },
            { name: 'Echo Knight', description_tr: 'Alternatif bir boyuttan Yankı kopya çağırarak hem hücum hem kaçış yapan savaşçılar.', features: [{ level: 3, name: 'Manifest Echo', desc_tr: 'Savaşta sana bağlı hayalet bir kopyayı çağırır; onun konumundan saldırabilirsin.' }] },
            { name: 'Rune Knight', description_tr: 'Dev medeniyetinin rünlerini silah ve zırhlarına işleyen, dev boyutuna büyüyebilen savaşçılar.', features: [{ level: 3, name: 'Rune Carver', desc_tr: 'Cloud, Stone, Hill veya Frost gibi runlar öğrenirsin; her biri pasif ve aktif güç verir.' }] },
            { name: 'Purple Dragon Knight (Banneret)', description_tr: 'Liderlik ve ilham yeteneğiyle müttefiklerini destekleyen komutan savaşçılar.', features: [{ level: 3, name: 'Rallying Cry', desc_tr: 'Second Wind kullandığında etrafındaki 3 müttefikin de can kazanmasını sağlarsın.' }] }
        ]
    },
    Monk: {
        subclass_unlock_level: 3,
        subclasses: [
            { name: 'Way of the Open Hand', description_tr: 'Silahsız dövüşü kemale erdiren, rakiplerini zemine seren kaid ustalar.', features: [{ level: 3, name: 'Open Hand Technique', desc_tr: 'Flurry of Blows saldırılarında düşmanı yere sere, ite veya reaksiyonunu iptal edebilirsin.' }] },
            { name: 'Way of Shadow', description_tr: 'Karanlıkta saklanmayı ve suikastı mükemmelleştiren ninja benzeri gölge ustalar.', features: [{ level: 3, name: 'Shadow Arts', desc_tr: 'Ki ile Darkness, Darkvision, Pass Without Trace ve Silence büyülerini atabilirsin.' }] },
            { name: 'Way of the Four Elements', description_tr: 'Ateş, su, hava ve toprağı Ki yoluyla manipüle ederek savaşan elementalist keşişler.', features: [{ level: 3, name: 'Disciple of the Elements', desc_tr: 'Fireball ve Thunderwave benzeri element büyülerini Ki harcayarak atarsın.' }] },
            { name: 'Way of the Sun Soul', description_tr: 'Ki enerjisini güneş ışığına ve alev toplarına dönüştürebilen güneş keşişleri.', features: [{ level: 3, name: 'Radiant Sun Bolt', desc_tr: 'Işınsaldırı olarak güneş ışınsal hasar vurursun; Flurry of Blows ile birleştirebilirsin.' }] },
            { name: 'Way of the Drunken Master', description_tr: 'Sarhoş görünerek tahmin edilemez, kaotik dövüş hareketleriyle düşmanını yanıltan keşişler.', features: [{ level: 3, name: 'Drunken Technique', desc_tr: 'Flurry of Blows kullandığında Disengage ve ekstra hareket bonusu kazanırsın.' }] },
            { name: 'Way of the Kensei', description_tr: 'Belirli silahları ki enerjisiyle uzantı olarak kullanan silah sanatı ustaları.', features: [{ level: 3, name: 'Path of the Kensei', desc_tr: 'Belirli silahları Monk silahı olarak belirler ve onlara ekstra saldırı veya hasar kazandırırsın.' }] },
            { name: 'Way of the Long Death', description_tr: 'Ölümün gizemini çalışarak güç kazanan ve ölümsüzlüğü araştıran karanlık keşişler.', features: [{ level: 3, name: 'Touch of Death', desc_tr: 'Düşmanı öldürdüğünde seviyene eşit geçici can kazanırsın.' }] },
            { name: 'Way of the Astral Self', description_tr: 'Ruhsal astral bedenini dışa yansıtarak dev kollar ve gözlerle savaşan aydınlanmış keşişler.', features: [{ level: 3, name: 'Arms of the Astral Self', desc_tr: 'Ki harcayarak astral kollar çıkarırsın; Wisdom ile saldırırsın ve menzil uzar.' }] },
            { name: 'Way of Mercy', description_tr: 'Hem iyileştirici hem de ölümcül dokunuşlara sahip, maskeli tabip keşişler.', features: [{ level: 3, name: 'Hand of Healing/Harm', desc_tr: 'Ki harcayarak birini iyileştirir veya nekrotik hasar vererek hastalık yayarsın.' }] },
            { name: 'Way of the Ascendant Dragon', description_tr: 'Ejderha soyundan güç alarak nefes saldırısı kazanan keşişler.', features: [{ level: 3, name: 'Draconic Disciple', desc_tr: 'Ejderha dilini öğrenirsin; silahsız saldırıların element hasarına dönüşebilir.' }, { level: 3, name: 'Breath of the Dragon', desc_tr: 'Ki harcayarak ejderha nefesi saldırısı yaparsın.' }] }
        ]
    },
    Paladin: {
        subclass_unlock_level: 3,
        subclasses: [
            { name: 'Oath of Devotion', description_tr: 'Dürüstlüğe, cesarete ve korumaya adanmış, kutsal enerjiyle dolu klasik iyi şövalyeler.', features: [{ level: 3, name: 'Sacred Weapon', desc_tr: 'Silahına kutsal güç yüklersin; Charisma modifier kadar saldırı bonusu ve ışık efekti kazandırırsın.' }] },
            { name: 'Oath of the Ancients', description_tr: 'Işığı, yaşamı ve doğayı korumayı yemin eden eski ritüel şövalyeler.', features: [{ level: 3, name: 'Nature\'s Wrath', desc_tr: 'Bitki kökleriyle bir düşmanı yakalayarak Restrained yaparsın.' }] },
            { name: 'Oath of Vengeance', description_tr: 'Büyük kötülüklere karşı amansız ceza vermeye yemin eden intikamcı şövalyeler.', features: [{ level: 3, name: 'Vow of Enmity', desc_tr: 'Bir hedefe düşmanlık yemini et; 1 dakika boyunca avantajlı saldırırsın.' }] },
            { name: 'Oath of Conquest', description_tr: 'Zaferi ve kontrolü korku yoluyla sağlayan despotik şövalyeler.', features: [{ level: 3, name: 'Conquering Presence', desc_tr: 'Etrafındaki düşmanlara korku salarsın.' }] },
            { name: 'Oath of Redemption', description_tr: 'Şiddetten kaçınan, her düşmanı ıslah etmeye çalışan ve hasar emerek dostları koruyan şövalyeler.', features: [{ level: 3, name: 'Rebuke the Violent', desc_tr: 'Bir müttefikin zarar görmesine tepki olarak saldırgana aynı hasarı yansıtırsın.' }] },
            { name: 'Oath of Glory', description_tr: 'Destansı kahramanlığı hedefleyen, müttefiklerini ilham vererek destekleyen yarı-tanrı şövalyeler.', features: [{ level: 3, name: 'Inspiring Smite', desc_tr: 'Divine Smite kullandıktan sonra başkalarına geçici can dağıtabilirsin.' }] },
            { name: 'Oath of the Watchers', description_tr: 'Uzay-ötesi tehditlere (aberration, celestial, fey, fiend) karşı Mortaller\'ı koruyan nöbetçi şövalyeler.', features: [{ level: 3, name: 'Watcher\'s Will', desc_tr: 'Müttefiklerine zihne etki eden büyülere karşı avantaj verirsin.' }] },
            { name: 'Oathbreaker', description_tr: 'Andını çiğneyerek karanlığa düşmüş, ölümsüzleri emreden ve nekrotik güç kullanan şövalyeler.', features: [{ level: 3, name: 'Dreadful Aspect', desc_tr: 'Karanlık korku aurası yayarak etraftakileri korkutur.' }] },
            { name: 'Oath of the Crown', description_tr: 'Medeniyete ve yasasına bağlı, müttefiklerini asla terk etmeyen kahraman şövalyeler.', features: [{ level: 3, name: 'Champion Challenge', desc_tr: 'Etrafındaki düşmanları senden uzaklaşmamaya zorlarsın.' }] }
        ]
    },
    Ranger: {
        subclass_unlock_level: 3,
        subclasses: [
            { name: 'Hunter', description_tr: 'Sürülere, devlere veya hızlı hedeflere karşı ölümcül avcılık tekniklerini kullanan klassik korucular.', features: [{ level: 3, name: "Hunter's Prey", desc_tr: 'Colossus Slayer, Horde Breaker veya Giant Killer seçeneklerinden birini al.' }] },
            { name: 'Beast Master', description_tr: 'Vahşi bir hayvan dostla birlikte avlanan, hayvanını büyük güce ulaştıran orman koruyucuları.', features: [{ level: 3, name: "Ranger's Companion", desc_tr: 'Savaşta birlikte hareket eden sadık bir vahşi hayvan edin.' }] },
            { name: 'Gloom Stalker', description_tr: 'Yeraltı ve karanlıklarda faaliyet gösteren, ilk turda patlama gücüne sahip gölge avcıları.', features: [{ level: 3, name: 'Dread Ambusher', desc_tr: 'İlk combat turunda ekstra hareket ve ekstra saldırı ile büyük avantaj sağlarsın.' }] },
            { name: 'Horizon Walker', description_tr: 'Farklı düzlemler arasında kapı açan, kötülerin planar seferlerini durduran sınır korucuları.', features: [{ level: 3, name: 'Planar Warrior', desc_tr: 'Saldırılarını güçlü kuvvet (force) hasarına dönüştürebilirsin.' }] },
            { name: 'Monster Slayer', description_tr: 'Güçlü büyülü canavarları ve iblisleri hedefleyen, onları zayıflatmayı uzmanlaştıran avcılar.', features: [{ level: 3, name: 'Slayer\'s Prey', desc_tr: 'Bir hedefe hasar ekleyen özel bir işaret yaparsın.' }] },
            { name: 'Fey Wanderer', description_tr: 'Feywild\'ın büyüsünü içinde taşıyan, büyüleyici aurayla savaşan doğa gezginleri.', features: [{ level: 3, name: 'Dreadful Strikes', desc_tr: 'Silah saldırılarında ekstra psişik hasar eklersin.' }] },
            { name: 'Swarmkeeper', description_tr: 'Etrafında küçük varlıklar bulutu taşıyan ve bunu silah olarak kullanan doğa korucuları.', features: [{ level: 3, name: 'Gathered Swarm', desc_tr: 'Saldırı sonucunda sürü bir düşmanı iter, seni taşır veya ekstra hasar ekler.' }] }
        ]
    },
    Rogue: {
        subclass_unlock_level: 3,
        subclasses: [
            { name: 'Thief', description_tr: 'Hırsızlık, akrobasi ve hız konusunda mükemmelleşmiş klasik soyguncular.', features: [{ level: 3, name: 'Fast Hands', desc_tr: 'Bonus action ile kilit kır, tuzak söndür, eşya kullan veya cep hırsızlığı yap.' }] },
            { name: 'Assassin', description_tr: 'Sürprizi avantaja çeviren, ilk turda yıkıcı hasar veren suikastçılar.', features: [{ level: 3, name: 'Assassinate', desc_tr: 'Rakip saldırmadan önce avantajlı vur ve otomatik kritik al.' }] },
            { name: 'Arcane Trickster', description_tr: 'Illüzyonlar ve büyülerle aldatmayı harmanlayan büyücü hırsızlar.', features: [{ level: 3, name: 'Spellcasting', desc_tr: 'Enchantment ve Illusion ağırlıklı Wizard büyüleri öğrenirsin.' }] },
            { name: 'Inquisitive', description_tr: 'Her ayrıntıyı fark eden, yalanı sezebilen ve düşmanı istismar eden dedektif savaşçılar.', features: [{ level: 3, name: 'Insightful Fighting', desc_tr: 'Bonus action ile düşmanı analiz edip zırh bağımsız Sneak Attack uygularsın.' }] },
            { name: 'Mastermind', description_tr: 'Sosyal manipülasyonu silah olarak kullanan, müttefiklerine taktiksel avantaj kazandıran strateji uzmanları.', features: [{ level: 3, name: 'Master of Tactics', desc_tr: 'Help aksiyonunu Bonus Action ile kullanabilirsin ve menzili 30 ft olur.' }] },
            { name: 'Scout', description_tr: 'Ön keşif ve doğada hayatta kalmayı mükemmelleştirmiş, ilk turda yıldırım hızıyla hareket eden izciler.', features: [{ level: 3, name: 'Skirmisher', desc_tr: 'Bitişik düşman varken reaksiyon ile 5 ft çekilebilirsin (fırsat saldırısı olmadan).' }] },
            { name: 'Swashbuckler', description_tr: 'Düelloda rakibini dans ettiren, tek başına çalışmayı seven teatral kılıç ustaları.', features: [{ level: 3, name: 'Rakish Audacity', desc_tr: 'Yanında dostun olmasa da 1v1 durumlarda Sneak Attack uygulayabilirsin.' }] },
            { name: 'Phantom', description_tr: 'Ölümle yakın bağı kullanan, hayaletlerin güçlerine dokunan ölüm hırsızları.', features: [{ level: 3, name: 'Wails from the Grave', desc_tr: 'Sneak Attack aynı anda ikinci bir düşmana da nekrotik hasar verir.' }] },
            { name: 'Soulknife', description_tr: 'Psiyonik enerjiyle oluşturduğu zihinsel bıçaklarla savaşan psi hırsızları.', features: [{ level: 3, name: 'Psychic Blades', desc_tr: 'Maddesel olmayan psiyonik bıçaklar oluşturursun; direnç uygulanamaz.' }] }
        ]
    },
    Sorcerer: {
        subclass_unlock_level: 1,
        subclasses: [
            { name: 'Draconic Bloodline', description_tr: 'Soyunda ejderha kanı taşıyan, doğuştan element büyüsüyle zırhsız dirençli sihirbazlar.', features: [{ level: 1, name: 'Draconic Resilience', desc_tr: 'Zırhsız AC\'n 13 + DEX olur; ekstra can kazanırsın.' }] },
            { name: 'Wild Magic', description_tr: 'Kontrol edilemez kaotik büyü enerjisi barındıran tahmin edilemez sihirbazlar.', features: [{ level: 1, name: 'Wild Magic Surge', desc_tr: 'Büyü attıktan sonra DM on 1 üzerinde d20 atarsa rastgele kaotik bir etki patlak verir.' }] },
            { name: 'Divine Soul', description_tr: 'Soyunda ilahi dokunuş barındıran, hem Sorcerer hem Cleric listesinden büyü kullananlar.', features: [{ level: 1, name: 'Divine Magic', desc_tr: 'Cleric büyü listesine erişim; favori büyün her zaman Bless veya Bane\'dir.' }] },
            { name: 'Shadow Magic', description_tr: 'Shadowfell\'in karanlığından güç devşiren, gölge köpekleri çağıran sihirbazlar.', features: [{ level: 1, name: 'Strength of the Grave', desc_tr: 'HP\'n 0\'a düşünce Charisma kurtarma atışıyla ayakta kalabilirsin.' }] },
            { name: 'Storm Sorcery', description_tr: 'Fırtına ve yıldırımın kudretini soyundan getiren, elektrikli sihirbazlar.', features: [{ level: 1, name: 'Tempestuous Magic', desc_tr: 'Büyü attıktan sonra Bonus Action ile 10 ft uçarak hareket edebilirsin.' }] },
            { name: 'Aberrant Mind', description_tr: 'Uzay ötesi varlıklarla zihinsel temas kuran, psişik güçlere sahip sihirbazlar.', features: [{ level: 1, name: 'Telepathic Speech', desc_tr: 'Gördüğün bir canlıyla telepatik konuşma kurabilirsin.' }] },
            { name: 'Clockwork Soul', description_tr: 'Evrenin düzenini temsil eden, kaos ve şansı düzelten mekanik güzellikteki sihirbazlar.', features: [{ level: 1, name: 'Restore Balance', desc_tr: 'Avantaj veya dezavantaj zarını iptal ederek sıradan zar atmalarını sağlarsın.' }] },
            { name: 'Lunar Sorcery', description_tr: 'Ayın büyüsel döngüsünden (yeni ay, dolunay, hilal) güç kazanan sihirbazlar.', features: [{ level: 1, name: 'Lunar Embodiment', desc_tr: 'Yeni Ay (illusion), Dolunay (saldırı) ve Hilal (abjuration) aşamasında farklı büyülere erişirsin.' }] }
        ]
    },
    Warlock: {
        subclass_unlock_level: 1,
        subclasses: [
            { name: 'The Archfey', description_tr: 'Feywild\'ın güçlü bir peri varlığıyla anlaşan, büyüleyici cazibe ve illüzyon güçleri taşıyan sihirbazlar.', features: [{ level: 1, name: 'Fey Presence', desc_tr: 'Etrafındaki peri aurası canlıları büyüler veya korkutur.' }] },
            { name: 'The Fiend', description_tr: 'Cehennemden bir şeytanla anlaşan, ateş ve patlama büyüleri kullanan karanlık güç sihirbazları.', features: [{ level: 1, name: "Dark One's Blessing", desc_tr: 'Düşmanı öldürünce Charisma + Warlock seviyesi kadar geçici can kazanırsın.' }] },
            { name: 'The Great Old One', description_tr: 'Uzay ötesi, anlaşılmaz varlıklarla pakt yapan psişik ve zihin okuyan büyücüler.', features: [{ level: 1, name: 'Awakened Mind', desc_tr: '30 ft içindeki canlıyla dil engeli olmaksızın telepatik konuşabilirsin.' }] },
            { name: 'The Celestial', description_tr: 'Cennet bağlantılı bir varlıkla anlaşan, hem hasar hem iyileştirme yapan ışıklı sihirbazlar.', features: [{ level: 1, name: 'Healing Light', desc_tr: 'Bonus action ile can iyileştirebilirsin (1d6 x Warlock seviyesi pool).' }] },
            { name: 'The Hexblade', description_tr: 'Gölge alanından kaynaklanan büyülü silahla anlaşan, yakın dövüşte de güçlü sihirbazlar.', features: [{ level: 1, name: "Hexblade's Curse", desc_tr: 'Hedefe lanet at; kritik zarı genişler ve vurursan can kazanırsın.' }, { level: 1, name: 'Hex Warrior', desc_tr: 'Martial silah uzmanlığı ve bir silahta Charisma ile saldırı kazanırsın.' }] },
            { name: 'The Fathomless', description_tr: 'Okyanusun derinliklerindeki bilinmez varlıkla pakt yapan derin deniz büyücüleri.', features: [{ level: 1, name: 'Tentacle of the Deeps', desc_tr: 'Bonus action ile büyülü tentakel çağırırsın; düşmanları yavaşlatır ve kışkırtır.' }] },
            { name: 'The Undying', description_tr: 'Ölümü yenmiş ölümsüz bir varlıkla anlaşan ve neredeyse ölümsüz sihirbazlar.', features: [{ level: 1, name: 'Among the Dead', desc_tr: 'Spare the Dying cantrip\'ini öğrenirsin; ölümsüzler seni bariz neden olmaksızın saldırmaz.' }] },
            { name: 'The Genie', description_tr: 'Dao, Djinn, Efreeti veya Marid gibi güçlü bir cinle anlaşan, cin türüne göre element güçleri kazanan sihirbazlar.', features: [{ level: 1, name: "Genie's Vessel", desc_tr: 'Cin türüne özel bir şişe kazanırsın; Long Rest\'te o kaba girebilirsin.' }] },
            { name: 'The Undead', description_tr: 'Lich veya vampir benzeri güçlü ölümsüz bir varlıkla pakt yapan karanlık büyücüler.', features: [{ level: 1, name: 'Form of Dread', desc_tr: 'Ölüm görünümüne bürünerek geçici can, Fright bağışıklığı ve düşman korkutma kazanırsın.' }] }
        ]
    },
    Wizard: {
        subclass_unlock_level: 2,
        subclasses: [
            { name: 'School of Abjuration', description_tr: 'Savunma ve nötralize etme büyülerinde uzmanlaşmış koruma büyücüleri.', features: [{ level: 2, name: 'Arcane Ward', desc_tr: 'Koruma büyüsü okuyunca bir can kalkanı oluşur; hasar önce bunu harcar.' }] },
            { name: 'School of Conjuration', description_tr: 'Varlıkları ve nesneleri çağırma büyülerinde uzmanlaşmış çağırma büyücüleri.', features: [{ level: 2, name: 'Minor Conjuration', desc_tr: 'Küçük, gerçekçi olmayan nesneler yaratabilirsin.' }] },
            { name: 'School of Divination', description_tr: 'Geleceği gören, zarları manipüle eden kehanet büyücüleri.', features: [{ level: 2, name: 'Portent', desc_tr: 'Her long rest sonrası 2 portent zarı at; bunları herhangi bir zarın yerine kullanabilirsin.' }] },
            { name: 'School of Enchantment', description_tr: 'Zihinleri kontrol ederek düşmanları büyüleyen büyüleme ustaları.', features: [{ level: 2, name: 'Hypnotic Gaze', desc_tr: 'Bonus action ile bir düşmanı gözünle büyülersin; hareket edemez ve saldıramaz.' }] },
            { name: 'School of Evocation', description_tr: 'Alan vurucu element büyülerini mükemmelleştiren, dostları hasardan koruyabilen yıkım büyücüleri.', features: [{ level: 2, name: 'Sculpt Spells', desc_tr: 'Alan büyüleri atarken içindeki dostların hasar almadan kurtarma atışı yapmasını sağlarsın.' }] },
            { name: 'School of Illusion', description_tr: 'Yanılsamaları gerçekmiş gibi kullanan, savaş alanını görsel karmaşaya boğan psiko-büyücüler.', features: [{ level: 2, name: 'Improved Minor Illusion', desc_tr: 'Minor Illusion cantrip\'i aynı anda hem ses hem görüntü oluşturabilir.' }] },
            { name: 'School of Necromancy', description_tr: 'Ölüleri yönlendiren ve hayat enerjisini toplayan karanlık nekromantlar.', features: [{ level: 2, name: 'Grim Harvest', desc_tr: 'Büyünle birini öldürdüğünde büyü seviyesi x 2 kadar can kazanırsın.' }] },
            { name: 'School of Transmutation', description_tr: 'Maddeyi ve canlıları dönüştüren, bazen iyileştiren simyacı büyücüler.', features: [{ level: 2, name: 'Minor Alchemy', desc_tr: 'Kısa süreliğine bir maddeyi başkasına dönüştürebilirsin (ahşap → taş vb.).' }] },
            { name: 'Bladesinging', description_tr: 'Kılıç ve büyüyü zarif bir dansla birleştiren, AC\'yi büyü kanalıyla artıran Elf büyücüler.', features: [{ level: 2, name: 'Bladesong', desc_tr: 'Bonus action ile Bladesong aktive edersin; hız, AC, konsantrasyon ve Acrobatics\'e Intelligence modifier kadar bonus kazanırsın.' }] },
            { name: 'War Magic', description_tr: 'Savunma ve saldırıyı eş zamanlı yürüten, büyü-zırh uyumunda mükemmelleşmiş savaş büyücüleri.', features: [{ level: 2, name: 'Arcane Deflection', desc_tr: 'Saldırı veya kurtarma atışı için reaksiyon olarak +2/+4 bonus kazanırsın.' }] },
            { name: 'Order of Scribes', description_tr: 'Büyü kitabını canlı bir varlık olarak uyandıran, büyülerini anlık değiştirebilen akademisyen büyücüler.', features: [{ level: 2, name: 'Awakened Spellbook', desc_tr: 'Büyü kitabın sihirli bir varlık kazanır; her uzun dinlenmede serbest Wizard cantripi öğrenebilirsin.' }] },
            { name: 'Graviturgy Magic', description_tr: 'Yerçekimini manipüle ederek düşmanları iter, çeker veya ağırlaştıran Exandria büyücüleri.', features: [{ level: 2, name: 'Adjust Density', desc_tr: 'Bir nesneyi ağırlaştırıp yavaşlatırsın ya da hafifleştirip yükseltirsin.' }] },
            { name: 'Chronurgy Magic', description_tr: 'Zamanın akışını manipüle eden, zarları geri alan ve hasımları zamana sabitleyen Exandria büyücüleri.', features: [{ level: 2, name: 'Chronal Shift', desc_tr: 'Bir saldırı, yetenek veya kurtarma zarını yeniden attırabilirsin.' }] }
        ]
    }
};

classes = classes.map(c => {
    if (allSubclasses[c.name]) {
        return { ...c, ...allSubclasses[c.name] };
    }
    return c;
});

fs.writeFileSync(filePath, JSON.stringify(classes, null, 4), { encoding: 'utf8' });
const total = Object.values(allSubclasses).reduce((sum, v) => sum + v.subclasses.length, 0);
console.log('Tamamlandi! Toplam ' + total + ' alt sinif eklendi:');
Object.entries(allSubclasses).forEach(([k, v]) => console.log('  ' + k + ': ' + v.subclasses.length));
