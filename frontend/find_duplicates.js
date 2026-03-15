const fs = require('fs');
const content = fs.readFileSync('src/app/player/[campaignId]/sheet/page.tsx', 'utf8');
const lines = content.split('\n');
const declarations = {};

lines.forEach((line, index) => {
    const match = line.match(/^\s*const\s+([a-zA-Z0-9_]+)\s*=/);
    if (match) {
        const name = match[1];
        if (!declarations[name]) declarations[name] = [];
        declarations[name].push(index + 1);
    }
});

for (const name in declarations) {
    if (declarations[name].length > 1) {
        console.log(`Duplicate found: ${name} at lines ${declarations[name].join(', ')}`);
    }
}
