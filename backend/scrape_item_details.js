const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeDetails(url) {
    if (!url) return "";
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const paragraphs = $('#page-content p');
        let description = "";

        // Skip source (p1) and type/rarity (p2), take the rest
        paragraphs.each((i, el) => {
            if (i >= 2) {
                description += $(el).text().trim() + "\n\n";
            }
        });
        return description.trim();
    } catch (err) {
        console.error(`Error scraping ${url}:`, err.message);
        return "";
    }
}

async function run() {
    const filePath = path.join(__dirname, 'wondrous_raw.json');
    const rawItems = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // We'll process in batches of 50
    const startIdx = parseInt(process.argv[2]) || 0;
    const endIdx = startIdx + 50;
    const batch = rawItems.slice(startIdx, endIdx);

    console.log(`Deep scraping items ${startIdx} to ${endIdx}...`);
    for (let item of batch) {
        console.log(`Fetching ${item.name}...`);
        item.description = await scrapeDetails(item.link);
        // Small delay to avoid aggressive rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    const outputPath = path.join(__dirname, 'data', `wondrous_details_batch_${startIdx}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2));
    console.log(`Batch saved: wondrous_details_batch_${startIdx}.json`);
}

run();
