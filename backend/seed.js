const fs = require('fs');
const mongoose = require('mongoose');

// Import Models
const Monster = require('./models/Monster');
const Spell = require('./models/Spell');
const Race = require('./models/Race');
const Class = require('./models/Class');

async function importData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/dnd_app');
        console.log('MongoDB connected for seeding.');

        // 1. Seed Monsters
        const monstersDataRaw = fs.readFileSync('./data/monster_data_clean.json', 'utf-8');
        const monstersJson = JSON.parse(monstersDataRaw);
        const monstersList = Object.entries(monstersJson).map(([name, data]) => ({ name, ...data }));

        await Monster.bulkWrite(monstersList.map(m => ({
            updateOne: { filter: { name: m.name }, update: { $set: m }, upsert: true }
        })));
        console.log(`Successfully seeded ${monstersList.length} monsters via Upsert.`);

        // 2. Seed Spells
        const spellsDataRaw = fs.readFileSync('./data/spells_hybrid.json', 'utf-8');
        const spellsJson = JSON.parse(spellsDataRaw);
        const spellsList = Object.values(spellsJson);

        await Spell.bulkWrite(spellsList.map(s => ({
            updateOne: { filter: { name: s.name }, update: { $set: s }, upsert: true }
        })));
        console.log(`Successfully seeded ${spellsList.length} spells via Upsert.`);

        // 3. Seed Races
        const racesDataRaw = fs.readFileSync('./data/races.json', 'utf-8');
        const racesList = JSON.parse(racesDataRaw);

        await Race.bulkWrite(racesList.map(r => ({
            updateOne: { filter: { name: r.name }, update: { $set: r }, upsert: true }
        })));
        console.log(`Successfully seeded ${racesList.length} races via Upsert.`);

        // 4. Seed Classes
        const classesDataRaw = fs.readFileSync('./data/classes.json', 'utf-8');
        const classesList = JSON.parse(classesDataRaw);

        await Class.bulkWrite(classesList.map(c => ({
            updateOne: { filter: { name: c.name }, update: { $set: c }, upsert: true }
        })));
        console.log(`Successfully seeded ${classesList.length} classes via Upsert.`);

        console.log('All reference data seeded correctly!');
        process.exit();

    } catch (err) {
        console.error('Error during data seed:', err);
        process.exit(1);
    }
}

importData();
