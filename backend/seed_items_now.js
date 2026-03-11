const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Item = require('./models/Item');

mongoose.connect('mongodb://localhost:27017/dnd_app')
    .then(async () => {
        console.log('Connected to DB');
        const dataPath = path.join(__dirname, 'data');
        const itemMap = new Map();

        const validEnums = ['Weapon', 'Armor', 'Adventuring Gear', 'Tools', 'Mounts and Vehicles', 'Magic Item', 'Ammunition', 'Equipment', 'Staff', 'Wondrous Item', 'Holy Symbol', 'Silah', 'Zırh', 'Eşya', 'Büyülü Eşya', 'Araçlar', 'Binek ve Araçlar'];
        const safeTranslateCategory = (cat) => {
            if (!cat) return 'Eşya';
            const map = {
                'Weapon': 'Silah',
                'Armor': 'Zırh',
                'Adventuring Gear': 'Eşya',
                'Tools': 'Araçlar',
                'Mounts and Vehicles': 'Binek ve Araçlar',
                'Magic Item': 'Büyülü Eşya'
            };
            const translated = map[cat] || cat;
            if (validEnums.includes(translated)) return translated;
            // Also try original
            if (validEnums.includes(cat)) return cat;
            return 'Eşya'; // Fallback
        };

        const validRarities = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Varies', 'Unique', 'None'];
        const safeRarity = (r) => validRarities.includes(r) ? r : 'Uncommon';

        if (fs.existsSync(path.join(dataPath, 'items.json'))) {
            const srdItems = JSON.parse(fs.readFileSync(path.join(dataPath, 'items.json'), 'utf8'));
            for (const item of srdItems) {
                itemMap.set(item.name, {
                    ...item,
                    name_tr: item.name_tr || item.name,
                    category: safeTranslateCategory(item.equipment_category ? (item.equipment_category.name || item.equipment_category) : 'Adventuring Gear'),
                    rarity: safeRarity(item.rarity),
                    type: item.subcategory || item.equipment_category || 'Wondrous Item'
                });
            }
        }

        const batchFiles = fs.readdirSync(dataPath).filter(f => f.startsWith('wondrous_details_batch_') && (f.endsWith('_tr.json') || f.endsWith('.json')));
        for (const file of batchFiles) {
            if (file.startsWith('enriched_')) continue;
            const items = JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
            for (const itemData of items) {
                const existing = itemMap.get(itemData.name) || {};
                itemMap.set(itemData.name, {
                    ...existing,
                    ...itemData,
                    category: 'Büyülü Eşya',
                    rarity: safeRarity(itemData.rarity || existing.rarity),
                    type: itemData.type || existing.type || 'Wondrous Item'
                });
            }
        }

        const enrichedFiles = fs.readdirSync(dataPath).filter(f => f.startsWith('enriched_items_batch_') && f.endsWith('.json'));
        for (const file of enrichedFiles) {
            const items = JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
            for (const [name, itemData] of Object.entries(items)) {
                const existing = itemMap.get(name) || {};
                const safeCat = itemData.equipment_category || existing.category || 'Adventuring Gear';
                itemMap.set(name, {
                    ...existing,
                    ...itemData,
                    name: name,
                    name_tr: itemData.name_tr || existing.name_tr || name,
                    description: itemData.original_desc || existing.description || '',
                    description_tr: itemData.desc_tr || existing.description_tr || '',
                    category: safeTranslateCategory(safeCat),
                    cost: itemData.cost || existing.cost || { quantity: 0, unit: 'gp' },
                    weight: itemData.weight !== undefined ? itemData.weight : existing.weight,
                    rarity: safeRarity(itemData.rarity || existing.rarity),
                    type: itemData.type || existing.type || 'Wondrous Item',
                    effects: itemData.effects || existing.effects || []
                });
            }
        }

        const finalItems = Array.from(itemMap.values());
        await Item.deleteMany({});
        try {
            await Item.insertMany(finalItems);
            console.log('Items seeded. Total:', finalItems.length);
            process.exit(0);
        } catch (e) {
            if (e.errors) {
                Object.keys(e.errors).forEach(key => {
                    console.error(e.errors[key].message);
                });
            } else {
                console.error(e);
            }
            process.exit(1);
        }
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
