const mongoose = require('mongoose');
const Item = require('./models/Item');
async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/dnd_realtime');
        const samples = await Item.find({ name: { $in: ['Dagger', 'Plate', 'Wand of Orcus', 'Bag of Holding'] } });
        console.log(JSON.stringify(samples, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
check();
