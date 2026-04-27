const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const categories = [
    { name: 'Potion', url: 'https://dnd5e.wikidot.com/wondrous-items:potion' },
    { name: 'Ring', url: 'https://dnd5e.wikidot.com/wondrous-items:ring' },
    { name: 'Rod', url: 'https://dnd5e.wikidot.com/wondrous-items:rod' },
    { name: 'Scroll', url: 'https://dnd5e.wikidot.com/wondrous-items:scroll' },
    { name: 'Staff', url: 'https://dnd5e.wikidot.com/wondrous-items:staff' },
    { name: 'Wand', url: 'https://dnd5e.wikidot.com/wondrous-items:wand' },
    { name: 'Weapon', url: 'https://dnd5e.wikidot.com/wondrous-items:weapon' },
    { name: 'Armor', url: 'https://dnd5e.wikidot.com/wondrous-items:armor' },
    { name: 'Wondrous Item', url: 'https://dnd5e.wikidot.com/wondrous-items' }
];

async function scrapeCategory(cat) {
    console.log(`Scraping category: ${cat.name} from ${cat.url}`);
    try {
        const { data } = await axios.get(cat.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const items = [];

        $('table.wiki-content-table tr').each((ri, row) => {
            const td = $(row).find('td');
            if (td.length >= 3) {
                const nameEl = $(td[0]).find('a').first();
                const name = nameEl.text().trim() || $(td[0]).text().trim();
                const link = nameEl.attr('href');
                const rarity = $(td[1]).text().trim();
                const type = $(td[2]).text().trim();

                if (name.toLowerCase().includes('item') || rarity.toLowerCase().includes('rarity') || name.toLowerCase() === 'name') return;

                items.push({
                    name,
                    link: link ? (link.startsWith('http') ? link : `https://dnd5e.wikidot.com${link}`) : null,
                    category: 'Magic Item',
                    subcategory: cat.name,
                    rarity_raw: rarity,
                    type_raw: type,
                    source: `Wikidot/${cat.name}`
                });
            }
        });
        console.log(`Found ${items.length} items in ${cat.name}`);
        return items;
    } catch (err) {
        console.error(`Error scraping ${cat.name}:`, err.message);
        return [];
    }
}

async function run() {
    let allItems = [];
    for (const cat of categories) {
        const items = await scrapeCategory(cat);
        allItems = allItems.concat(items);
        // Add a small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 1000));
    }

    // Deduplicate by name
    const uniqueMap = new Map();
    allItems.forEach(item => {
        const key = item.name.toLowerCase().trim();
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        }
    });

    const finalItems = Array.from(uniqueMap.values());
    fs.writeFileSync('backend/magic_items_full_raw.json', JSON.stringify(finalItems, null, 2));
    console.log(`Total unique magic items found: ${finalItems.length}`);
}

run();
