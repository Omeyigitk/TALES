const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeWondrous() {
    try {
        const { data } = await axios.get('https://dnd5e.wikidot.com/wondrous-items', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const items = [];

        const tables = $('table');
        console.log(`Found ${tables.length} tables`);

        tables.each((ti, table) => {
            $(table).find('tr').each((ri, row) => {
                const td = $(row).find('td');
                if (td.length >= 3) {
                    const nameEl = $(td[0]).find('a');
                    const name = nameEl.text().trim() || $(td[0]).text().trim();
                    const link = nameEl.attr('href');
                    const rarity = $(td[1]).text().trim();
                    const type = $(td[2]).text().trim();

                    if (name.toLowerCase().includes('item') || rarity.toLowerCase().includes('rarity')) return;

                    items.push({
                        name,
                        link: link ? (link.startsWith('http') ? link : `https://dnd5e.wikidot.com${link}`) : null,
                        category: 'Magic Item',
                        subcategory: 'Wondrous Item',
                        rarity_raw: rarity,
                        type_raw: type,
                        source: 'Wikidot/Wondrous'
                    });
                }
            });
        });
        return items;
    } catch (err) {
        console.error('Error:', err.message);
        return [];
    }
}

async function run() {
    const items = await scrapeWondrous();
    fs.writeFileSync('wondrous_raw.json', JSON.stringify(items, null, 2));
    console.log(`Saved ${items.length} magic items to wondrous_raw.json`);
}

run();
