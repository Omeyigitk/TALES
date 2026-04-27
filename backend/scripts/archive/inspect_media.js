const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/dnd_realtime';

async function inspect() {
    try {
        await mongoose.connect(mongoURI);
        const db = mongoose.connection.db;
        const media = await db.collection('sharedmedias').find({}).toArray();
        console.log('--- MEDIA ITEMS ---');
        console.log(JSON.stringify(media, null, 2));
        console.log('-------------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
inspect();
