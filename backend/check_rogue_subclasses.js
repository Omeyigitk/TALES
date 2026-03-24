const mongoose = require('mongoose');
const Class = require('./models/Class');

async function checkRogue() {
    await mongoose.connect('mongodb://localhost:27017/dnd-app');
    const rogue = await Class.findOne({ name: 'Rogue' });
    if (rogue) {
        console.log(`Rogue Subclasses (${rogue.subclasses?.length || 0}):`);
        rogue.subclasses?.forEach(s => console.log(` - ${s.name}`));
    } else {
        console.log('Rogue not found!');
    }
    await mongoose.disconnect();
}
checkRogue();
