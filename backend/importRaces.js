const mongoose = require('mongoose');
const Race = require('./models/Race');
const fs = require('fs');

async function importRaces() {
    try {
        await mongoose.connect('mongodb://localhost:27017/dnd_app');
        console.log('Connected to DB');

        const data = fs.readFileSync('./data/races.json', 'utf8');
        const races = JSON.parse(data);

        await Race.deleteMany({});
        console.log('Deleted old races');

        await Race.insertMany(races);
        console.log('Inserted new races successfully!');
    } catch (err) {
        console.error('Import failed', err);
    } finally {
        mongoose.connection.close();
    }
}

importRaces();
