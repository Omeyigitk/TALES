require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

async function check() {
    await mongoose.connect(MONGODB_URI);
    const names = ['Plate', 'Shield', 'Cloak of Protection', 'Gauntlets of Ogre Power'];
    for (const name of names) {
        const item = await Item.findOne({ name: { $regex: new RegExp(name, 'i') } });
        console.log(`--- ${name} ---`);
        if (item) {
            console.log("Effects:", JSON.stringify(item.effects, null, 2));
            console.log("Armor Class:", JSON.stringify(item.armor_class, null, 2));
        } else {
            console.log("Not found");
        }
    }
    process.exit(0);
}
check();
