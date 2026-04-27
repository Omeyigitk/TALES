const fs = require('fs');
const path = require('path');

const SPELLS_PATH = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json';
const ITEMS_DIR = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data';

function runAudit() {
    console.log("=== D&D DATABASE COMPREHENSIVE AUDIT ===\n");

    // 1. Spell Audit
    const spellsData = JSON.parse(fs.readFileSync(SPELLS_PATH, 'utf8'));
    const spells = Array.isArray(spellsData) ? spellsData : Object.values(spellsData);
    
    const classCounts = {};
    const subclassCounts = {};

    spells.forEach(s => {
        if (s.classes) {
            s.classes.forEach(c => {
                classCounts[c] = (classCounts[c] || 0) + 1;
            });
        }
        if (s.subclasses) {
            s.subclasses.forEach(sc => {
                subclassCounts[sc] = (subclassCounts[sc] || 0) + 1;
            });
        }
    });

    console.log("--- Spell Counts by Class ---");
    Object.keys(classCounts).sort().forEach(c => {
        console.log(`${c.padEnd(15)}: ${classCounts[c]} spells`);
    });

    console.log("\n--- Spell Counts by Subclass (Special Mappings) ---");
    Object.keys(subclassCounts).sort().forEach(sc => {
        console.log(`${sc.padEnd(25)}: ${subclassCounts[sc]} spells`);
    });

    // 2. Item Audit
    const itemFiles = fs.readdirSync(ITEMS_DIR).filter(f => f.startsWith('enriched_items_batch') && f.endsWith('.json'));
    let totalItems = 0;
    let itemsWithEffects = 0;
    const effectTypes = {};

    itemFiles.forEach(file => {
        const items = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, file), 'utf8'));
        items.forEach(it => {
            totalItems++;
            if (it.effects && it.effects.length > 0) {
                itemsWithEffects++;
                it.effects.forEach(e => {
                    effectTypes[e.type] = (effectTypes[e.type] || 0) + 1;
                });
            }
        });
    });

    console.log("\n--- Item Audit Summary ---");
    console.log(`Total Magic Items Processed : ${totalItems}`);
    console.log(`Items with Mechanical Effects: ${itemsWithEffects}`);
    console.log(`Coverage Rate               : ${((itemsWithEffects / totalItems) * 100).toFixed(1)}%`);

    console.log("\n--- Effect Type Distribution ---");
    Object.keys(effectTypes).sort().forEach(type => {
        console.log(`${type.padEnd(20)}: ${effectTypes[type]} occurrences`);
    });

    console.log("\n=== AUDIT COMPLETE ===");
}

runAudit();
