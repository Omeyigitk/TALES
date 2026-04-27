const fs = require('fs');

async function auditSubclassSpells() {
    const classesRaw = fs.readFileSync('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/classes.json', 'utf8');
    const classData = JSON.parse(classesRaw);

    const spellsRaw = fs.readFileSync('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json', 'utf8');
    const spellsObj = JSON.parse(spellsRaw);
    const localSpells = Array.isArray(spellsObj) ? spellsObj : Object.values(spellsObj);

    // Collect all subclass names from spells
    const spellSubclasses = new Set();
    localSpells.forEach(s => {
        if (s.subclasses) {
            s.subclasses.forEach(sc => spellSubclasses.add((typeof sc === 'string' ? sc : sc.name).toLowerCase()));
        }
    });

    // Subclasses that inherently grant domain/oath/expanded spells in 5e
    const grantSpellClasses = ['Cleric', 'Paladin', 'Ranger', 'Warlock', 'Druid', 'Sorcerer']; 
    // Note: Druid and Sorcerer also do sometimes, but it varies by subclass. We'll check Cleric, Paladin, Ranger, Warlock first.

    const issues = [];

    for (const c of classData) {
        if (grantSpellClasses.includes(c.name)) {
            const subclasses = c.subclasses || [];
            for (const sc of subclasses) {
                const scName = sc.name;
                // e.g. "Oath of Devotion", "Life Domain"
                if (!spellSubclasses.has(scName.toLowerCase())) {
                    issues.push(`${c.name} - ${scName} has NO spells assigned in spells_hybrid.json!`);
                }
            }
        }
    }

    console.log("Subclass Spell Audit Results:");
    console.log(issues.length > 0 ? issues.join('\n') : "All expected subclasses have spells mapped.");
}

auditSubclassSpells();
