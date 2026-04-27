// merge_subclasses.js — 3 parçayı birleştirir ve classes.json'a UTF-8 ile yazar
const fs = require('fs');
const path = require('path');

const part1 = require('./subclasses_part1');
const part2 = require('./subclasses_part2');
const part3 = require('./subclasses_part3');

const allSubclasses = { ...part1, ...part2, ...part3 };

const filePath = path.join(__dirname, 'data', 'classes.json');
let classes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

classes = classes.map(c => {
    if (allSubclasses[c.name]) {
        return { ...c, ...allSubclasses[c.name] };
    }
    return c;
});

fs.writeFileSync(filePath, JSON.stringify(classes, null, 4), { encoding: 'utf8' });

// Özet yaz
const total = Object.values(allSubclasses).reduce((sum, v) => sum + v.subclasses.length, 0);
console.log(`Başarıyla tamamlandı! Toplam ${total} alt sınıf eklendi:`);
Object.entries(allSubclasses).forEach(([cls, data]) => {
    console.log(`  ${cls}: ${data.subclasses.length} alt sınıf (Seviye ${data.subclass_unlock_level})`);
});
