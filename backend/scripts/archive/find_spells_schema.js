const fs = require('fs');
const classesRaw = fs.readFileSync('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/classes.json', 'utf8');
const classes = JSON.parse(classesRaw);

function exploreSpells(obj, classSpells, path) {
    if (Array.isArray(obj)) {
        obj.forEach((val, i) => exploreSpells(val, classSpells, `${path}[${i}]`));
    } else if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            if (key.toLowerCase().includes('spell') && Array.isArray(obj[key])) {
                 console.log(`Found typical spell array at ${path}.${key} :`, obj[key].slice(0,3));
            }
            exploreSpells(obj[key], classSpells, `${path}.${key}`);
        }
    }
}

exploreSpells(classes, new Set(), 'classes');
