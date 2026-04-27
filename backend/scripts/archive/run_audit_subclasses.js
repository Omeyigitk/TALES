const fs = require('fs');

async function checkMissingSubclassSpells() {
    console.log("Loading local database...");
    const spellsRaw = fs.readFileSync('c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json', 'utf8');
    const spellsObj = JSON.parse(spellsRaw);
    const localSpells = Array.isArray(spellsObj) ? spellsObj : Object.values(spellsObj);
    
    // Normalize local spell names for comparison
    const localNames = new Set(localSpells.map(s => s.name.toLowerCase()));
    
    const missingSpells = {};

    try {
        const res = await fetch(`https://www.dnd5eapi.co/api/subclasses`);
        const data = await res.json();
        
        for (const subclass of data.results) {
            console.log(`Fetching spells for subclass ${subclass.index}...`);
            // not all subclasses give spells (e.g., champion) but we can check if the endpoint returns anything
            try {
                const spRes = await fetch(`https://www.dnd5eapi.co/api/subclasses/${subclass.index}/spells`);
                if (!spRes.ok) continue;
                const spData = await spRes.json();
                
                if (spData.results && spData.results.length > 0) {
                    const missing = [];
                    for (const elem of spData.results) {
                        const spellName = elem.spell ? elem.spell.name : elem.name;
                        if (spellName && !localNames.has(spellName.toLowerCase())) {
                            missing.push(spellName);
                        }
                    }
                    if (missing.length > 0) {
                        missingSpells[subclass.index] = missing;
                    }
                }
            } catch (e) {
                // Ignore API failures for subclasses without spells
            }
        }
    } catch (e) {
        console.log("Failed to fetch subclasses");
    }
    
    console.log("Missing Subclass Spells:", JSON.stringify(missingSpells, null, 2));
}

checkMissingSubclassSpells();
