const mongoose = require('mongoose');
const Spell = require('./models/Spell');

async function checkSpells() {
    try {
        await mongoose.connect('mongodb://localhost:27017/dnd_app');

        console.log("--- BARD SPELLS CHECK ---");

        const count = await Spell.countDocuments({ classes: 'Bard' });
        console.log(`Total Bard spells in DB: ${count}`);

        const command = await Spell.findOne({ name: { $regex: /^command$/i } });
        if (command) {
            console.log("Spell 'Command' FOUND:");
            console.log("- Name:", command.name);
            console.log("- Classes:", command.classes);
            console.log("- Level:", command.level);
            console.log("- Level Int:", command.level_int);
        } else {
            console.log("Spell 'Command' NOT FOUND in database!");
        }

        const level1Bard = await Spell.find({ classes: 'Bard', level_int: 1 }).select('name').lean();
        console.log(`Level 1 Bard Spells (${level1Bard.length}):`);
        level1Bard.forEach(s => console.log(`- ${s.name}`));

        // Check if classes is an array or string
        const sample = await Spell.findOne({ classes: { $exists: true } });
        if (sample) {
            console.log("\nData structure check:");
            console.log("- classes type:", typeof sample.classes);
            console.log("- classes actual value:", sample.classes);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.connection.close();
    }
}

checkSpells();
