const mongoose = require('mongoose');
const Class = require('./models/Class');

async function checkClasses() {
    await mongoose.connect('mongodb://localhost:27017/dnd-app');
    const bard = await Class.findOne({ name: 'Bard' });
    const fighter = await Class.findOne({ name: 'Fighter' });

    console.log('--- BARD FEATURES ---');
    if (bard) {
        bard.features.sort((a, b) => a.level - b.level).forEach(f => {
            console.log(`Lv ${f.level}: ${f.name}`);
        });
    }

    console.log('\n--- FIGHTER FEATURES ---');
    if (fighter) {
        fighter.features.sort((a, b) => a.level - b.level).forEach(f => {
            console.log(`Lv ${f.level}: ${f.name}`);
        });
    }

    await mongoose.disconnect();
}

checkClasses();
