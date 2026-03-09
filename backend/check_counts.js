const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

const Monster = require('./models/Monster');
const Item = require('./models/Item');

async function checkCounts() {
    try {
        await mongoose.connect(MONGODB_URI);
        const monsterCount = await Monster.countDocuments();
        const itemCount = await Item.countDocuments();
        console.log(`Monsters: ${monsterCount}`);
        console.log(`Items: ${itemCount}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCounts();
