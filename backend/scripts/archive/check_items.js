require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

async function check() {
    await mongoose.connect(MONGODB_URI);
    const items = await Item.find({
        category: 'Magic Item',
        $or: [
            { effects: { $exists: false } },
            { effects: { $size: 0 } }
        ]
    }).limit(10);

    console.log(JSON.stringify(items.map(i => ({ name: i.name, desc: i.description })), null, 2));
    process.exit(0);
}

check();
