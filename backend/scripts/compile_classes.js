const fs = require('fs');
const path = require('path');

const rawDataPath = path.join(__dirname, '../data/classes_raw');
const outputPath = path.join(__dirname, '../data/classes.json');

const classes = [
    'barbarian', 'bard', 'cleric', 'druid',
    'fighter', 'monk', 'paladin', 'ranger',
    'rogue', 'sorcerer', 'warlock', 'wizard'
];

async function compile() {
    console.log('--- D&D 5e Class Compiler ---');
    const finalData = [];

    for (const className of classes) {
        const filePath = path.join(rawDataPath, `${className}.js`);
        if (fs.existsSync(filePath)) {
            try {
                const classData = require(filePath);
                finalData.push(classData);
                console.log(`[OK] Compiled ${classData.name} - ${classData.subclasses?.length || 0} Subclasses.`);
            } catch (err) {
                console.error(`[ERR] Failed to parse ${className}.js:`, err.message);
            }
        } else {
            console.warn(`[WARN] Skipping ${className}.js (Not found)`);
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 4), 'utf-8');
    console.log(`\nSuccessfully compiled ${finalData.length} classes into data/classes.json!`);
}

compile();
