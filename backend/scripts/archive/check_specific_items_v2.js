require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

async function check() {
    await mongoose.connect(MONGODB_URI);
    const names = ['Plate', 'Shield', 'Cloak of Protection', 'Gauntlets of Ogre Power', 'Belt of Hill Giant Strength', 'Staff of Power'];
    const results = [];
    for (const name of names) {
        const item = await Item.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (item) {
            results.push({
                name: item.name,
                effects: item.effects,
                armor_class: item.armor_class
            });
        } else {
            // Try partial match if exact failed
            const partial = await Item.findOne({ name: { $regex: new RegExp(name, 'i') } });
            if (partial) {
                results.push({
                    name: `PARTIAL: ${partial.name}`,
                    effects: partial.effects,
                    armor_class: partial.armor_class
                });
            } else {
                results.push({ name: name, status: 'NOT FOUND' });
            }
        }
    }
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}
check();
