const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/spells_hybrid.json', 'utf8'));
const spells = Object.values(data);
const out = [];

out.push('Toplam spell: ' + spells.length);

const classCounts = {};
for (const sp of spells) {
    for (const cls of (sp.classes || [])) {
        classCounts[cls] = (classCounts[cls] || 0) + 1;
    }
}
out.push('\nClass bazli sayim:');
Object.entries(classCounts).sort((a, b) => b[1] - a[1]).forEach(([cls, n]) => out.push('  ' + cls + ': ' + n));

const wizLv0 = spells.filter(s => s.classes && s.classes.includes('Wizard') && s.level_int === 0);
const wizLv1 = spells.filter(s => s.classes && s.classes.includes('Wizard') && s.level_int === 1);

out.push('\nWizard cantrips: ' + wizLv0.length);
out.push('Wizard Lv1: ' + wizLv1.length);
out.push('\nWizard Lv1 ornek (ilk 15):');
wizLv1.slice(0, 15).forEach(s => out.push('  - ' + s.name));

fs.writeFileSync('./spell_audit_result.txt', out.join('\n'), 'utf8');
console.log('Yazildi: spell_audit_result.txt');
