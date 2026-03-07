require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_app';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const dataDir = path.join(__dirname, 'data');
        const files = fs.readdirSync(dataDir).filter(f => f.startsWith('wondrous_details_batch_') && f.endsWith('_tr.json'));

        for (const file of files) {
            console.log(`Processing file: ${file}`);
            const items = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));

            for (const itemData of items) {
                const updateDoc = {
                    description: itemData.description,
                    description_tr: itemData.description_tr,
                    name_tr: itemData.name_tr || itemData.name,
                    rarity: itemData.rarity,
                    type: itemData.type,
                    category: 'Magic Item' // Ensure required field for upserts o7
                };

                try {
                    const result = await Item.findOneAndUpdate(
                        { name: itemData.name },
                        { $set: updateDoc },
                        { upsert: true, new: true, runValidators: true }
                    );
                    // console.log(`Updated/Inserted: ${result.name}`);
                } catch (itemErr) {
                    console.error(`Error processing item ${itemData.name}:`, itemErr.message);
                }
            }
            console.log(`Finished processing ${file}`);
        }

        console.log('Batch 0 seeding complete o7');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
