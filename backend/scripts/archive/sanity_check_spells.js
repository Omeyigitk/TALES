const fs = require('fs');

function auditSpells() {
    const dbPath = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json';
    const dbRaw = fs.readFileSync(dbPath, 'utf8');
    const spellsObj = JSON.parse(dbRaw);
    const spellsArray = Array.isArray(spellsObj) ? spellsObj : Object.values(spellsObj);

    let missingDesc = 0;
    let missingLevel = 0;
    let missingSchool = 0;
    let missingTime = 0;
    let missingClasses = 0;
    
    const problemSpells = [];

    spellsArray.forEach(spell => {
        let hasProblem = false;
        const issues = [];
        
        // desc can be string or array
        if (!spell.desc && !spell.entries) {
            missingDesc++;
            hasProblem = true;
            issues.push("desc");
        } else if (typeof spell.desc === 'string' && spell.desc.trim() === '') {
            missingDesc++;
            hasProblem = true;
            issues.push("empty desc");
        }

        if (spell.level === undefined) {
            missingLevel++;
            hasProblem = true;
            issues.push("level");
        }
        
        if (!spell.school) {
            missingSchool++;
            hasProblem = true;
            issues.push("school");
        }

        if (!spell.time) {
            missingTime++;
            hasProblem = true;
            issues.push("time");
        }
        
        if (!spell.classes || (Array.isArray(spell.classes) && spell.classes.length === 0)) {
            // Some spells don't have classes if they only come from subclasses
            if (!spell.subclasses || (Array.isArray(spell.subclasses) && spell.subclasses.length === 0)) {
                missingClasses++;
                // Not pushing to issues because a lot of NPC/Monster spells might not have PC classes
            }
        }

        if (hasProblem) {
            problemSpells.push(`${spell.name}: missing ${issues.join(', ')}`);
        }
    });

    console.log(`Total spells: ${spellsArray.length}`);
    console.log(`Missing Descriptions: ${missingDesc}`);
    console.log(`Missing Levels: ${missingLevel}`);
    console.log(`Missing Schools: ${missingSchool}`);
    console.log(`Missing Cast Times: ${missingTime}`);
    console.log(`Missing Classes/Subclasses completely: ${missingClasses}`);
    
    if (problemSpells.length > 0) {
        console.log("\nSome problem spells:");
        console.log(problemSpells.slice(0, 10).join('\n'));
        if (problemSpells.length > 10) console.log(`...and ${problemSpells.length - 10} more`);
    } else {
        console.log("\nNo critical fields (desc, level, school, time) are missing in any spells!");
    }
}

auditSpells();
