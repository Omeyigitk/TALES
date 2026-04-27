const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeTaggedItems() {
    console.log('Scraping items by tag...');
    try {
        // Wikidot tag search page for 'item'
        const url = 'https://dnd5e.wikidot.com/system:page-tags/tag/item';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const items = [];

        $('.pages-list-item a').each((i, el) => {
            const name = $(el).text().trim();
            const href = $(el).attr('href');
            if (name && href) {
                items.push({
                    name,
                    link: href.startsWith('http') ? href : `https://dnd5e.wikidot.com${href}`
                });
            }
        });

        fs.writeFileSync('backend/tagged_items_raw.json', JSON.stringify(items, null, 2));
        console.log(`Found ${items.length} tagged items`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

scrapeTaggedItems();
