const fs = require('fs');

async function checkMissingSpells() {
    console.log("Loading local database...");
    const spellsRaw = fs.readFileSync('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json', 'utf8');
    const spellsObj = JSON.parse(spellsRaw);
    const localSpells = Array.isArray(spellsObj) ? spellsObj : Object.values(spellsObj);
    
    // Normalize local spell names for comparison
    const localNames = new Set(localSpells.map(s => s.name.toLowerCase()));
    
    // Core spellcasting classes in 5e API
    const classes = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'];
    // And artificer might not be in 5eapi free SRD, but we'll try it or skip it mostly.

    const missingSpells = {};

    for (const cls of classes) {
        console.log(`Fetching spells for ${cls}...`);
        try {
            const res = await fetch(`https://www.dnd5eapi.co/api/classes/${cls}/spells`);
            const data = await res.json();
            
            if (data.results) {
                const missingForClass = [];
                for (const spell of data.results) {
                    if (!localNames.has(spell.name.toLowerCase())) {
                        missingForClass.push(spell.name);
                    }
                }
                if (missingForClass.length > 0) {
                    missingSpells[cls] = missingForClass;
                }
            }
        } catch (e) {
            console.log(`Failed to fetch for ${cls}`);
        }
    }
    
    console.log("Missing Spells by Class:", JSON.stringify(missingSpells, null, 2));
}

checkMissingSpells();
