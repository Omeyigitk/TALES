require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

async function verify() {
    await mongoose.connect(MONGODB_URI);
    const totalMagic = await Item.countDocuments({ category: 'Magic Item' });
    const withEffects = await Item.countDocuments({ category: 'Magic Item', effects: { $exists: true, $not: { $size: 0 } } });

    console.log(`Total Magic Items: ${totalMagic}`);
    console.log(`Magic Items with Effects: ${withEffects}`);

    if (withEffects < 100) {
        console.log("Only a small portion have effects. Let's list some without effects to see if we missed patterns.");
        const without = await Item.find({ category: 'Magic Item', $or: [{ effects: { $exists: false } }, { effects: { $size: 0 } }] }).limit(10);
        console.log(JSON.stringify(without.map(i => ({ name: i.name, desc: i.description })), null, 2));
    }

    process.exit(0);
}

verify();
