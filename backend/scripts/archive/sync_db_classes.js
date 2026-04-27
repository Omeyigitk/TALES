const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Class = require('./models/Class');

async function syncClasses() {
    try {
        await mongoose.connect('mongodb://localhost:27017/dnd_app');
        console.log('Connected to MongoDB.');

        const filePath = path.join(__dirname, 'data', 'classes.json');
        const classesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`Found ${classesData.length} classes in classes.json. Replacing DB content...`);

        await Class.deleteMany({});
        await Class.insertMany(classesData);

        const rogue = await Class.findOne({ name: 'Rogue' });
        if (rogue) {
            console.log(`Sync Complete! Rogue now has ${rogue.subclasses?.length || 0} subclasses:`);
            rogue.subclasses?.forEach(s => console.log(` - ${s.name}`));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Sync failed:', err);
    }
}

syncClasses();
