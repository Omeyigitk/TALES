const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function updateDescriptions() {
    try {
        await mongoose.connect('mongodb://localhost:27017/dnd_app');
        console.log('Connected to DB');
        const Item = require('./models/Item');

        const dataDir = path.join(__dirname, 'data');
        const files = fs.readdirSync(dataDir).filter(f => f.startsWith('enriched_items_batch_') && f.endsWith('.json'));

        let updatedCount = 0;
        let notFoundCount = 0;

        for (const file of files) {
            console.log(`Processing ${file}...`);
            const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));

            for (const enrichedItem of data) {
                if (!enrichedItem.description) continue;

                // Find the item in DB
                // Try matching by name or name_tr
                const dbItem = await Item.findOne({
                    $or: [
                        { name: enrichedItem.name },
                        { name_tr: enrichedItem.name_tr },
                        { name: enrichedItem.name_tr },
                        { name_tr: enrichedItem.name }
                    ]
                });

                if (dbItem) {
                    let needsUpdate = false;
                    
                    // If enriched description is longer or contains the rich formatting "**["
                    if (enrichedItem.description.includes('**[')) {
                        dbItem.description = enrichedItem.description;
                        // Determine if it's Turkish or English
                        if (enrichedItem.description.includes('Mekanik Bilgiler') || enrichedItem.description.includes('Atmosfer')) {
                            dbItem.description_tr = enrichedItem.description;
                        }
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        await dbItem.save();
                        updatedCount++;
                    }
                } else {
                    notFoundCount++;
                }
            }
        }

        console.log(`Update complete! Updated: ${updatedCount}, Not Found in DB: ${notFoundCount}`);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from DB');
    }
}

updateDescriptions();
