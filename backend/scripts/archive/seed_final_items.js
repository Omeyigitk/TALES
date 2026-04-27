const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Item = require('./models/Item');

const MONGODB_URI = "mongodb://localhost:27017/dnd_realtime";

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const dataDir = path.join(__dirname, 'data');

        // 1. Seed SRD Items
        console.log('Seeding SRD items...');
        const srdPath = path.join(dataDir, 'items.json');
        if (fs.existsSync(srdPath)) {
            const srdItems = JSON.parse(fs.readFileSync(srdPath, 'utf8'));
            for (const item of srdItems) {
                const trName = translateName(item.name);
                const trCat = translateCategory(item.category);

                await Item.findOneAndUpdate(
                    { name: item.name },
                    {
                        $set: {
                            name_tr: trName,
                            category: trCat,
                            rarity: item.rarity || 'Common',
                            type: item.subcategory || item.category,
                            weight: item.weight,
                            cost: item.cost,
                            damage: item.damage,
                            properties: item.properties
                        }
                    },
                    { upsert: true }
                );
            }
            console.log(`SRD items processed: ${srdItems.length}`);
        }

        // 2. Seed Magic Items (with descriptions)
        console.log('Seeding Magic Items with descriptions...');
        const files = fs.readdirSync(dataDir).filter(f => f.startsWith('wondrous_details_batch_') && f.endsWith('_tr.json'));
        let magicCount = 0;
        for (const file of files) {
            const items = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
            for (const itemData of items) {
                await Item.findOneAndUpdate(
                    { name: itemData.name },
                    {
                        $set: {
                            name_tr: itemData.name_tr || itemData.name,
                            description: itemData.description,
                            description_tr: itemData.description_tr,
                            category: 'Magic Item',
                            rarity: itemData.rarity,
                            type: itemData.type
                        }
                    },
                    { upsert: true }
                );
                magicCount++;
            }
        }
        console.log(`Magic items processed from batches: ${magicCount}`);

        const total = await Item.countDocuments();
        console.log(`Final Database Total: ${total}`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

function translateName(name) {
    const map = {
        'Club': 'Sopa',
        'Dagger': 'Hançer',
        'Greatclub': 'Büyük Sopa',
        'Handaxe': 'El Baltası',
        'Javelin': 'Cirit',
        'Light Hammer': 'Hafif Çekiç',
        'Mace': 'Gürz',
        'Quarterstaff': 'Asa',
        'Sickle': 'Orak',
        'Spear': 'Mızrak',
        'Crossbow, Light': 'Hafif Arbalet',
        'Shortbow': 'Kısa Yay',
        'Sling': 'Sapan',
        'Battleaxe': 'Savaş Baltası',
        'Flail': 'Topuzlu Kamçı',
        'Glaive': 'Glaive',
        'Greataxe': 'Büyük Balta',
        'Greatsword': 'Büyük Kılıç',
        'Halberd': 'Halberd',
        'Longsword': 'Uzun Kılıç',
        'Maul': 'Maul',
        'Morningstar': 'Sabah Yıldızı',
        'Pike': 'Kargı',
        'Rapier': 'Mekik Kılıç',
        'Shortsword': 'Kısa Kılıç',
        'Warhammer': 'Savaş Çekici',
        'Whip': 'Kamçı',
        'Padded': 'Dolgulu Zırh',
        'Leather': 'Deri Zırh',
        'Studded Leather': 'Çivili Deri Zırh',
        'Hide': 'Post Zırh',
        'Chain Shirt': 'Zincir Gömlek',
        'Scale Mail': 'Pullu Zırh',
        'Breastplate': 'Göğüs Zırhı',
        'Half Plate': 'Yarım Plaka',
        'Ring Mail': 'Halkalı Zırh',
        'Chain Mail': 'Zincir Zırh',
        'Splint': 'Parçalı Zırh',
        'Plate': 'Plaka Zırh',
        'Shield': 'Kalkan',
        'Backpack': 'Sırt Çantası',
        'Bedroll': 'Yatak',
        'Crowbar': 'Levye'
    };
    return map[name] || name;
}

function translateCategory(cat) {
    const map = {
        'Weapon': 'Silah',
        'Armor': 'Zırh',
        'Adventuring Gear': 'Eşya',
        'Magic Item': 'Büyülü Eşya'
    };
    return map[cat] || cat;
}

seed();
