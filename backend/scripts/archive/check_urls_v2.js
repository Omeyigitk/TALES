const axios = require('axios');
const fs = require('fs');

const categories = [
    'magic-items',
    'wondrous-items',
    'potions',
    'rings',
    'rods',
    'scrolls',
    'staves',
    'wands',
    'magic-armor',
    'magic-weapons',
    'magic-items-common',
    'magic-items-uncommon',
    'magic-items-rare',
    'magic-items-very-rare',
    'magic-items-legendary'
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
    fs.writeFileSync('backend/check_urls_clean.txt', output);
    console.log('Results saved to backend/check_urls_clean.txt');
}

check();
