const axios = require('axios');

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
    for (const cat of categories) {
        const url = `https://dnd5e.wikidot.com/${cat}`;
        try {
            await axios.get(url, { timeout: 5000 });
            console.log(`EXISTS: ${url}`);
        } catch (err) {
            console.log(`404: ${url} (${err.response ? err.response.status : err.message})`);
        }
    }
}

check();
