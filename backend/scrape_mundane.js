const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeArmor() {
    try {
        const { data } = await axios.get('https://dnd5e.wikidot.com/armor');
        const $ = cheerio.load(data);
        const items = [];

        $('table.wiki-content-table tr').each((i, el) => {
            if (i === 0) return; // Skip header
            const td = $(el).find('td');
            if (td.length < 3) return;

            const name = $(td[0]).text().trim();
            const cost = $(td[1]).text().trim();
            const ac = $(td[2]).text().trim();
            const strength = $(td[3]).text().trim();
            const stealth = $(td[4]).text().trim();
            const weight = $(td[5]).text().trim();

            items.push({
                name,
                category: 'Armor',
                cost_raw: cost,
                ac_raw: ac,
                strength_raw: strength,
                stealth_raw: stealth,
                weight_raw: weight,
                source: 'Wikidot'
            });
        });
        return items;
    } catch (err) {
        console.error('Error scraping armor:', err.message);
        return [];
    }
}

async function scrapeWeapons() {
    try {
        const { data } = await axios.get('https://dnd5e.wikidot.com/weapons');
        const $ = cheerio.load(data);
        const items = [];

        $('table.wiki-content-table tr').each((i, el) => {
            if (i === 0) return; // Skip header
            const td = $(el).find('td');
            if (td.length < 3) return;

            const name = $(td[0]).text().trim();
            const cost = $(td[1]).text().trim();
            const damage = $(td[2]).text().trim();
            const weight = $(td[3]).text().trim();
            const properties = $(td[4]).text().trim();

            items.push({
                name,
                category: 'Weapon',
                cost_raw: cost,
                damage_raw: damage,
                weight_raw: weight,
                properties_raw: properties,
                source: 'Wikidot'
            });
        });
        return items;
    } catch (err) {
        console.error('Error scraping weapons:', err.message);
        return [];
    }
}

async function scrapeAdventuringGear() {
    try {
        const { data } = await axios.get('https://dnd5e.wikidot.com/adventuring-gear');
        const $ = cheerio.load(data);
        const items = [];

        $('table.wiki-content-table tr').each((i, el) => {
            if (i === 0) return; // Skip header
            const td = $(el).find('td');
            if (td.length < 3) return;

            const name = $(td[0]).text().trim();
            const cost = $(td[1]).text().trim();
            const weight = $(td[2]).text().trim();

            items.push({
                name,
                category: 'Adventuring Gear',
                cost_raw: cost,
                weight_raw: weight,
                source: 'Wikidot/Adventuring-Gear'
            });
        });
        return items;
    } catch (err) {
        console.error('Error scraping gear:', err.message);
        return [];
    }
}

async function run() {
    console.log('Scraping mundane items...');
    const armor = await scrapeArmor();
    const weapons = await scrapeWeapons();
    const gear = await scrapeAdventuringGear();

    const all = [...armor, ...weapons, ...gear];
    fs.writeFileSync('mundane_raw.json', JSON.stringify(all, null, 2));
    console.log(`Saved ${all.length} mundane items to mundane_raw.json`);
}

run();
