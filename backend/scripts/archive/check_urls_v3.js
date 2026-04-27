const axios = require('axios');
const fs = require('fs');

const categories = [
    'magic-items:armor',
    'magic-items:weapon',
    'magic-items:staff',
    'magic-items:wand',
    'magic-items:ring',
    'magic-items:potion',
    'magic-items:rod',
    'magic-items:scroll'
];

async function check() {
    let output = '';
    for (const cat of categories) {
        const url = `https://dnd5e.wikidot.com/${cat}`;
        try {
            await axios.get(url, { timeout: 10000 });
            output += `EXISTS: ${url}\n`;
        } catch (err) {
            output += `404: ${url}\n`;
        }
    }
    fs.writeFileSync('backend/check_urls_v3.txt', output);
    console.log('Results saved to backend/check_urls_v3.txt');
}

check();
