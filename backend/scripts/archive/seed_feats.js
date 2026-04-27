require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Feat = require('./models/Feat');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_app';

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        const featsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/feats.json'), 'utf8'));

        console.log('Clearing old feats...');
        await Feat.deleteMany({});

        console.log(`Inserting ${featsData.length} structured feats...`);
        await Feat.insertMany(featsData);

        console.log('✅ Feats seeded successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
