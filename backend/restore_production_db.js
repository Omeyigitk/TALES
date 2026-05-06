const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models (Simplified for restore)
const Spell = mongoose.model('Spell', new mongoose.Schema({}, { strict: false }));
const Monster = mongoose.model('Monster', new mongoose.Schema({}, { strict: false }));
const Item = mongoose.model('Item', new mongoose.Schema({}, { strict: false }));
const Class = mongoose.model('Class', new mongoose.Schema({}, { strict: false }));
const Race = mongoose.model('Race', new mongoose.Schema({}, { strict: false }));
const Feat = mongoose.model('Feat', new mongoose.Schema({}, { strict: false }));

const MONGODB_URI = 'mongodb://omeryigitasg_db_user:tales1234@ac-qbowttp-shard-00-00.jtpii0g.mongodb.net:27017,ac-qbowttp-shard-00-01.jtpii0g.mongodb.net:27017,ac-qbowttp-shard-00-02.jtpii0g.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function restore() {
    try {
        console.log('Connecting to new database...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const dataDir = path.join(__dirname, 'data');

        const ensureArray = (data) => Array.isArray(data) ? data : Object.values(data);

        // 1. Spells
        console.log('Importing Spells...');
        const spellsData = ensureArray(JSON.parse(fs.readFileSync(path.join(dataDir, 'spells_hybrid.json'), 'utf8')));
        await Spell.deleteMany({});
        await Spell.insertMany(spellsData, { ordered: false });
        console.log(`✅ ${spellsData.length} spells imported.`);

        // 2. Monsters
        console.log('Importing Monsters...');
        const monstersRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'monster_data_clean.json'), 'utf8'));
        const monstersData = Object.entries(monstersRaw).map(([name, data]) => ({ name, ...data }));
        await Monster.deleteMany({});
        await Monster.insertMany(monstersData, { ordered: false });
        console.log(`✅ ${monstersData.length} monsters imported.`);

        // 3. Items
        console.log('Importing Items (Batches)...');
        await Item.deleteMany({});
        let totalItems = 0;
        const files = fs.readdirSync(dataDir);
        for (const file of files) {
            if (file.startsWith('enriched_items_batch_') && file.endsWith('.json')) {
                const itemsBatch = ensureArray(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')));
                if (itemsBatch.length > 0) {
                    try {
                        await Item.insertMany(itemsBatch, { ordered: false });
                        totalItems += itemsBatch.length;
                    } catch (e) {
                        totalItems += (e.result?.nInserted || 0);
                    }
                    console.log(`   - Processed ${itemsBatch.length} items from ${file}`);
                }
            }
        }
        console.log(`✅ Total items in DB: ${totalItems}`);

        // 4. Classes
        console.log('Importing Classes...');
        const classesData = ensureArray(JSON.parse(fs.readFileSync(path.join(dataDir, 'classes.json'), 'utf8')));
        await Class.deleteMany({});
        await Class.insertMany(classesData, { ordered: false });
        console.log(`✅ ${classesData.length} classes imported.`);

        // 5. Races
        console.log('Importing Races...');
        const racesData = ensureArray(JSON.parse(fs.readFileSync(path.join(dataDir, 'races.json'), 'utf8')));
        await Race.deleteMany({});
        await Race.insertMany(racesData, { ordered: false });
        console.log(`✅ ${racesData.length} races imported.`);

        // 6. Feats
        console.log('Importing Feats...');
        const featsData = ensureArray(JSON.parse(fs.readFileSync(path.join(dataDir, 'feats.json'), 'utf8')));
        await Feat.deleteMany({});
        await Feat.insertMany(featsData, { ordered: false });
        console.log(`✅ ${featsData.length} feats imported.`);

        console.log('\n🚀 ALL DATA RESTORED SUCCESSFULLY!');
        process.exit(0);
    } catch (error) {
        console.error('RESTORE FAILED:', error);
        process.exit(1);
    }
}

restore();
