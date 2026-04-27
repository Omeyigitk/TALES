const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Item = require('./models/Item');
const Feat = require('./models/Feat');
const Monster = require('./models/Monster');
const Spell = require('./models/Spell');
const Race = require('./models/Race');
const Class = require('./models/Class');

async function testSeed() {
  await mongoose.connect('mongodb://localhost:27017/dnd_app');
  try {
    const dataPath = path.join(__dirname, 'data');
    console.log('Seeding process started...');

    console.log('Seeding Items...');
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
      if (validEnums.includes(cat)) return cat;
      return 'Eşya';
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
        const name = itemData.name;
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

    const enrichedFiles = fs.readdirSync(dataPath).filter(f => f.startsWith('enriched_items_batch_') && f.endsWith('.json'));
    for (const file of enrichedFiles) {
      const items = JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
      for (const itemData of items) {
        const existing = itemMap.get(itemData.name) || {};
        
        let newDesc = itemData.description || existing.description;
        let newDescTr = itemData.description_tr || existing.description_tr;
        
        if (itemData.description && (itemData.description.includes('**[') || itemData.description.includes('Mekanik Bilgiler') || itemData.description.includes('Atmosfer'))) {
            newDescTr = itemData.description;
        }

        itemMap.set(itemData.name, {
          ...existing,
          ...itemData,
          name_tr: itemData.name_tr || existing.name_tr || itemData.name,
          description: newDesc,
          description_tr: newDescTr,
          category: itemData.category || existing.category || 'Büyülü Eşya'
        });
      }
    }

    const finalItems = Array.from(itemMap.values());
    console.log(`Prepared ${finalItems.length} items. Deleting old records...`);
    await Item.deleteMany({});

    if (finalItems.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < finalItems.length; i += chunkSize) {
        const chunk = finalItems.slice(i, i + chunkSize);
        await Item.insertMany(chunk, { ordered: false }).catch(e => {
            console.error('Partial item insert error:', e.message);
            throw e;
        });
        console.log(`Seeded items ${i + chunk.length}/${finalItems.length}`);
      }
    }

    console.log('Seed success.');
  } catch (err) {
    console.error('CRITICAL Seeding error:', err);
  } finally {
    await mongoose.connection.close();
  }
}
testSeed();
