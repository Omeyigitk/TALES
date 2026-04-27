const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_realtime';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const dataDir = path.join(__dirname, 'data');
        const itemMap = new Map();

        const enrichedFiles = fs.readdirSync(dataDir)
            .filter(f => f.startsWith('enriched_items_batch_') && f.endsWith('.json'))
            .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

        for (const file of enrichedFiles) {
            const items = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
            for (const item of items) {
                if (!item.name) continue;
                const key = item.name.toLowerCase().trim();

                // Fix: category is mandatory and enum restricted
                if (!item.category) item.category = 'Eşya';
                if (item.category === 'Adventuring Gear') item.category = 'Eşya';
                if (item.category === 'Magic Item') item.category = 'Büyülü Eşya';
                if (item.category === 'Weapon') item.category = 'Silah';
                if (item.category === 'Armor') item.category = 'Zırh';

                // Fix: cost must be an object { quantity, unit } or undefined
                // If it's a string like "10 gp", parse it
                if (typeof item.cost === 'string') {
                    const match = item.cost.match(/^(\d+)\s*(gp|sp|cp|ep|pp)$/i);
                    if (match) {
                        item.cost = { quantity: parseInt(match[1]), unit: match[2].toLowerCase() };
                    } else {
                        delete item.cost;
                    }
                }

                itemMap.set(key, { ...item, source: `Enriched/${file}` });
            }
        }

        const finalItems = Array.from(itemMap.values());
        await Item.deleteMany({});

        let success = 0;
        let fail = 0;
        const errorBreakdown = new Map();

        for (const item of finalItems) {
            try {
                await Item.create(item);
                success++;
            } catch (err) {
                fail++;
                let msg = err.message;
                if (err.errors) {
                    msg = Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`).join(' | ');
                }
                errorBreakdown.set(msg, (errorBreakdown.get(msg) || 0) + 1);
            }
        }

        console.log(`Summary: Success: ${success}, Fail: ${fail}`);
        console.log('Error Breakdown:');
        for (const [msg, count] of errorBreakdown.entries()) {
            console.log(` - ${msg}: ${count}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('CRITICAL failure:', err);
        process.exit(1);
    }
}

seed();
