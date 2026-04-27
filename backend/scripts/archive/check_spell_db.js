const fs = require('fs');
const spellsRaw = fs.readFileSync('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json', 'utf8');
const spellsObj = JSON.parse(spellsRaw);
const spells = Array.isArray(spellsObj) ? spellsObj : Object.values(spellsObj);

console.log(JSON.stringify(spells.slice(0, 2), null, 2));

const allClasses = new Set();
const allSubclasses = new Set();
spells.forEach(s => {
    if (s.classes) s.classes.forEach(c => allClasses.add(typeof c === 'string' ? c : c.name));
    if (s.subclasses) s.subclasses.forEach(sc => allSubclasses.add(typeof sc === 'string' ? sc : sc.name));
});

console.log("Classes:", Array.from(allClasses));
console.log("Subclasses:", Array.from(allSubclasses));
