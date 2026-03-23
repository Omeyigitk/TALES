
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const ClassSchema = new mongoose.Schema({
    name: String,
    subclass_unlock_level: Number,
    subclasses: Array
}, { strict: false });

const Class = mongoose.model('Class', ClassSchema);

async function checkRogue() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const rogue = await Class.findOne({ name: 'Rogue' });
        console.log('Rogue Class:', JSON.stringify(rogue, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRogue();
