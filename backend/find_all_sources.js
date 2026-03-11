const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function findSources() {
    try {
        const { data } = await axios.get('https://dnd5e.wikidot.com/wondrous-items');
        const $ = cheerio.load(data);
        const links = new Set();

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && (href.includes('wondrous-items:') || href.includes('magic-items:'))) {
                const fullUrl = href.startsWith('http') ? href : `https://dnd5e.wikidot.com${href}`;
                links.add(fullUrl);
            }
        });

        const sortedLinks = Array.from(links).sort();
        fs.writeFileSync('backend/magic_source_urls.json', JSON.stringify(sortedLinks, null, 2));
        console.log(`Found ${sortedLinks.length} potential source URLs`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

findSources();
