const mongoose = require('mongoose');
const Class = require('./models/Class');

async function checkRogue() {
    // Corrected DB name to dnd_app based on server.js
    await mongoose.connect('mongodb://localhost:27017/dnd_app');
    const rogue = await Class.findOne({ name: 'Rogue' });
    if (rogue) {
        console.log(`Rogue Subclasses (${rogue.subclasses?.length || 0}):`);
        rogue.subclasses?.forEach(s => console.log(` - ${s.name}`));
    } else {
        console.log('Rogue not found!');
        const all = await Class.find({}, 'name');
        console.log('Available classes:', all.map(c => c.name).join(', '));
    }
    await mongoose.disconnect();
}
checkRogue();
