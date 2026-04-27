const mongoose = require('mongoose');
const Item = require('./models/Item');
const fs = require('fs');
const path = require('path');

async function importItems() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_app';
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');

        const dataPath = path.join(__dirname, 'data', 'items.json');
        const data = fs.readFileSync(dataPath, 'utf8');
        const items = JSON.parse(data);

        // Option 1: Overwrite everything
        await Item.deleteMany({});
        console.log('Deleted old items');

        const result = await Item.insertMany(items);
        console.log(`Successfully imported ${result.length} items!`);

    } catch (err) {
        console.error('Import failed:', err);
        if (err.errors) {
            console.error('Validation errors:', JSON.stringify(err.errors, null, 2));
        }
    } finally {
        mongoose.connection.close();
        console.log('DB connection closed');
    }
}

importItems();
