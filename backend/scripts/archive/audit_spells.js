const fs = require('fs');

const spellsPath = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json';
const spells = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));

const standardPaladinSpells = [
    'Bless', 'Cure Wounds', 'Divine Favor', 'Heroism', 'Protection from Evil and Good', 'Purify Food and Drink', 'Searing Smite', 'Shield of Faith', 'Thunderous Smite', 'Wrathful Smite',
    'Aid', 'Branding Smite', 'Find Steed', 'Lesser Restoration', 'Magic Weapon', 'Protection from Poison', 'Zone of Truth',
    'Aura of Vitality', 'Blinding Smite', 'Create Food and Water', 'Daylight', 'Dispel Magic', 'Elemental Weapon', 'Magic Circle', 'Remove Curse', 'Revivify'
];

console.log('--- PALADIN SPELL AUDIT ---');

standardPaladinSpells.forEach(targetName => {
    let foundByKey = spells[targetName];
    let foundByNameField = Object.values(spells).find(s => s.name === targetName);
    
    if (foundByKey || foundByNameField) {
        const spell = foundByKey || foundByNameField;
        const classes = spell.classes || [];
        const isPaladin = classes.includes('Paladin');
        console.log(`[FOUND] ${targetName}: Key=${foundByKey ? 'Yes' : 'No'}, NameField=${foundByNameField ? 'Yes' : 'No'}, PaladinClass=${isPaladin ? 'YES' : 'NO (Has: ' + classes.join(', ') + ')'}`);
    } else {
        console.log(`[MISSING] ${targetName}`);
    }
});

// Also search for any spell containing "Smite"
console.log('\n--- SMITE SPELLS ---');
Object.entries(spells).forEach(([key, spell]) => {
    if (key.includes('Smite') || (spell.name && spell.name.includes('Smite'))) {
        const classes = spell.classes || [];
        console.log(`Key: ${key}, Name: ${spell.name}, Classes: ${classes.join(', ')}`);
    }
});
