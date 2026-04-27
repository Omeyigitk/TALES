const fs = require('fs');
const path = require('path');

const spellsPath = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json';
const spells = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));

const newSpells = {
    "Searing Smite": {
        "name": "Searing Smite",
        "level": "1st-level",
        "level_int": 1,
        "school": "evocation",
        "time": "1 bonus action",
        "range": "Self",
        "components": "V",
        "material_desc": "",
        "duration": "Up to 1 minute",
        "ritual": false,
        "concentration": true,
        "classes": ["Paladin"],
        "desc": "Kılıcın alevlerle parlar. Bu büyü süresince yaptığın ilk yakın dövüş silah saldırısı isabet ederse, hedef fazladan 1d6 ateş (fire) hasarı alır ve tutuşur. Tutuşan hedef, her turunun sonunda bir Constitution saving throw yapar. Başarısız olursa 1d6 ateş hasarı alır, başarılı olursa büyü sona erer.",
        "higher_level": "Bu büyüyü 2. seviye veya daha yüksek bir slotla yaptığında, hasar her slot seviyesi için 1d6 artar.",
        "subclasses": []
    },
    "Thunderous Smite": {
        "name": "Thunderous Smite",
        "level": "1st-level",
        "level_int": 1,
        "school": "evocation",
        "time": "1 bonus action",
        "range": "Self",
        "components": "V",
        "material_desc": "",
        "duration": "Up to 1 minute",
        "ritual": false,
        "concentration": true,
        "classes": ["Paladin"],
        "desc": "Kılıcın gök gürültüsü enerjisiyle dolar. Bu büyü süresince yaptığın ilk yakın dövüş silah saldırısı isabet ederse, saldırı hedefi 300 feet mesafeden duyulabilen bir gök gürültüsü sesiyle sarsılır ve fazladan 2d6 gürültü (thunder) hasarı alır. Eğer hedef bir yaratıksa, bir Strength saving throw yapmalıdır. Başarısız olursa 10 feet geri itilir ve yere serilir (prone).",
        "higher_level": "",
        "subclasses": []
    },
    "Wrathful Smite": {
        "name": "Wrathful Smite",
        "level": "1st-level",
        "level_int": 1,
        "school": "evocation",
        "time": "1 bonus action",
        "range": "Self",
        "components": "V",
        "material_desc": "",
        "duration": "Up to 1 minute",
        "ritual": false,
        "concentration": true,
        "classes": ["Paladin"],
        "desc": "Kılıcın korkutucu bir enerjiyle dolar. Bu büyü süresince yaptığın ilk yakın dövüş silah saldırısı isabet ederse, hedef fazladan 1d6 psişik (psychic) hasar alır. Eğer hedef bir yaratıksa, bir Wisdom saving throw yapmalıdır. Başarısız olursa, büyü sona erene kadar senden korkar (frightened). Korkan hedef, bu etkiden kurtulmak için aksiyonunu kullanarak bir Wisdom check (zara karşı) yapabilir.",
        "higher_level": "",
        "subclasses": []
    },
    "Blinding Smite": {
        "name": "Blinding Smite",
        "level": "3rd-level",
        "level_int": 3,
        "school": "evocation",
        "time": "1 bonus action",
        "range": "Self",
        "components": "V",
        "material_desc": "",
        "duration": "Up to 1 minute",
        "ritual": false,
        "concentration": true,
        "classes": ["Paladin"],
        "desc": "Kılıcın kör edici bir ışıkla parlar. Bu büyü süresince yaptığın ilk yakın dövüş silah saldırısı isabet ederse, hedef fazladan 3d8 ışıyan (radiant) hasar alır. Eğer hedef bir yaratıksa, bir Constitution saving throw yapmalıdır. Başarısız olursa, büyü sona erene kadar kör olur (blinded).",
        "higher_level": "",
        "subclasses": []
    },
    "Staggering Smite": {
        "name": "Staggering Smite",
        "level": "4th-level",
        "level_int": 4,
        "school": "evocation",
        "time": "1 bonus action",
        "range": "Self",
        "components": "V",
        "material_desc": "",
        "duration": "Up to 1 minute",
        "ritual": false,
        "concentration": true,
        "classes": ["Paladin"],
        "desc": "Kılıcın sarsıcı bir enerjiyle dolar. Bu büyü süresince yaptığın ilk yakın dövüş silah saldırısı isabet ederse, hedef fazladan 4d6 psişik (psychic) hasar alır. Eğer hedef bir yaratıksa, bir Wisdom saving throw yapmalıdır. Başarısız olursa, hedef bir sonraki turunun sonuna kadar saldırı atışlarında ve yetenek kontrollerinde dezavantajlı olur ve reaksiyon kullanamaz.",
        "higher_level": "",
        "subclasses": []
    },
    "Banishing Smite": {
        "name": "Banishing Smite",
        "level": "5th-level",
        "level_int": 5,
        "school": "abjuration",
        "time": "1 bonus action",
        "range": "Self",
        "components": "V",
        "material_desc": "",
        "duration": "Up to 1 minute",
        "ritual": false,
        "concentration": true,
        "classes": ["Paladin"],
        "desc": "Kılıcın boyutlar arası bir enerjiyle dolar. Bu büyü süresince yaptığın ilk yakın dövüş silah saldırısı isabet ederse, hedef fazladan 5d10 ışıyan (radiant) hasar alır. Eğer bu saldırı hedefin canını 50 veya daha altına düşürürse, hedef ana boyutuna veya zararsız bir yarı boyuta sürülür (banished).",
        "higher_level": "",
        "subclasses": []
    },
    "Aura of Vitality": {
        "name": "Aura of Vitality",
        "level": "3rd-level",
        "level_int": 3,
        "school": "abjuration",
        "time": "1 action",
        "range": "Self (30-foot radius)",
        "components": "V",
        "material_desc": "",
        "duration": "Up to 1 minute",
        "ritual": false,
        "concentration": true,
        "classes": ["Paladin", "Cleric"],
        "desc": "Senden 30 feet yarıçapında bir iyileştirme aurası yayılır. Büyü süresince, her turunda bir bonus aksiyon kullanarak menzil içindeki bir yaratığı (kendin dahil) 2d6 can yenileyebilirsin.",
        "higher_level": "",
        "subclasses": []
    },
    "Elemental Weapon": {
        "name": "Elemental Weapon",
        "level": "3rd-level",
        "level_int": 3,
        "school": "transmutation",
        "time": "1 action",
        "range": "Touch",
        "components": "V, S",
        "material_desc": "",
        "duration": "Up to 1 hour",
        "ritual": false,
        "concentration": true,
        "classes": ["Paladin"],
        "desc": "Dokunduğun sihirli olmayan bir silah, senin seçtiğin bir elementle (asit, soğuk, ateş, yıldırım veya gürültü) büyülenir. Büyü süresince silah sihirli sayılır, saldırı atışlarına +1 bonus alır ve vurduğunda seçtiğin türden fazladan 1d4 hasar verir.",
        "higher_level": "Bu büyüyü 5. veya 6. seviye slotla yaptığında, bonus +2 ve hasar 2d4 olur. 7. seviye veya daha yüksek slotla yaptığında bonus +3 ve hasar 3d4 olur.",
        "subclasses": []
    }
};

Object.assign(spells, newSpells);

fs.writeFileSync(spellsPath, JSON.stringify(spells, null, 4));
console.log(`Successfully added ${Object.keys(newSpells).length} Paladin spells.`);
