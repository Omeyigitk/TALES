const mongoose = require('mongoose');
const Spell = require('./models/Spell');

async function checkSpells() {
    try {
        await mongoose.connect('mongodb://localhost:27017/dnd_app');
        const level1Bard = await Spell.find({ classes: 'Bard', level_int: 1 }).select('name').lean();
        console.log("START_LIST");
        level1Bard.forEach(s => console.log(s.name));
        console.log("END_LIST");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.connection.close();
    }
}

checkSpells();
