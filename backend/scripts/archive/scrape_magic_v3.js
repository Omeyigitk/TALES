const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'magic_source_urls.json');
const allLinks = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

// Filter for source/category links (short codes or special category names)
const categories = allLinks.filter(l => {
    const part = l.split(':').pop();
    return part.length <= 5 || ['armor', 'potion', 'ring', 'rod', 'scroll', 'staff', 'wand', 'weapon', 'wondrous-items'].includes(part);
});

// Always include the main page
if (!categories.includes('https://dnd5e.wikidot.com/wondrous-items')) {
    categories.push('https://dnd5e.wikidot.com/wondrous-items');
}

async function scrapePage(url) {
    console.log(`Scraping: ${url}`);
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const items = [];

        $('table').each((ti, table) => {
            $(table).find('tr').each((ri, row) => {
                const td = $(row).find('td');
                if (td.length >= 3) {
                    const nameEl = $(td[0]).find('a').first();
                    const name = nameEl.text().trim() || $(td[0]).text().trim();
                    const link = nameEl.attr('href');
                    const rarity = $(td[1]).text().trim();
                    const type = $(td[2]).text().trim();

                    if (name.toLowerCase().includes('item') || rarity.toLowerCase().includes('rarity') || name.toLowerCase() === 'name' || name === '') return;

                    items.push({
                        name,
                        link: link ? (link.startsWith('http') ? link : `https://dnd5e.wikidot.com${link}`) : null,
                        category: 'Magic Item',
                        rarity_raw: rarity,
                        type_raw: type,
                        source: `Wikidot/${url.split(':').pop()}`
                    });
                }
            });
        });
        return items;
    } catch (err) {
        console.error(`Error scraping ${url}:`, err.message);
        return [];
    }
}

async function run() {
    let allItems = [];
    for (const url of categories) {
        const items = await scrapePage(url);
        allItems = allItems.concat(items);
        await new Promise(r => setTimeout(r, 500));
    }

    const uniqueMap = new Map();
    allItems.forEach(item => {
        const key = item.name.toLowerCase().trim();
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        }
    });

    const finalItems = Array.from(uniqueMap.values());
    fs.writeFileSync(path.join(__dirname, 'magic_items_mega_raw.json'), JSON.stringify(finalItems, null, 2));
    console.log(`Mega scrape complete. Total unique magic items: ${finalItems.length}`);
}

run();
