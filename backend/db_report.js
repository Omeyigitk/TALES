const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

const itemSchema = new mongoose.Schema({
    name: String,
    category: String,
    rarity: String
}, { strict: false });

const Item = mongoose.model('Item', itemSchema);

async function report() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const total = await Item.countDocuments();

        const categories = await Item.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const rarities = await Item.aggregate([
            { $group: { _id: '$rarity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('--- Database Report ---');
        console.log(`Total Items: ${total}`);
        console.log('\nCategories:');
        categories.forEach(c => console.log(`- ${c._id || 'Unknown'}: ${c.count}`));
        console.log('\nRarities:');
        rarities.forEach(r => console.log(`- ${r._id || 'Unknown'}: ${r.count}`));

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

report();
