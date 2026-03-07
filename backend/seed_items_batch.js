require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_app';

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        const batchFile = process.argv[2];
        if (!batchFile) {
            console.error('❌ Please provide a batch file path (e.g., data/items_batch_1.json)');
            process.exit(1);
        }

        const itemsData = JSON.parse(fs.readFileSync(path.join(__dirname, batchFile), 'utf8'));

        console.log(`Processing ${itemsData.length} items from ${batchFile}...`);

        for (const item of itemsData) {
            // Use upsert to avoid duplicates and update existing ones
            await Item.findOneAndUpdate(
                { name: item.name },
                item,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Batch seeded successfully.');

        // Verification
        const count = await Item.countDocuments({});
        console.log(`Total items in database: ${count}`);

        const sample = await Item.findOne({ name: 'Greatsword' });
        if (sample) {
            console.log(`Verification: Greatsword -> ${sample.name_tr} (${sample.cost.quantity} ${sample.cost.unit})`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
