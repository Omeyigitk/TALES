const fs = require('fs');
const content = fs.readFileSync('src/app/player/[campaignId]/sheet/page.tsx', 'utf8');
const lines = content.split('\n');
const declarations = {};

lines.forEach((line, index) => {
    // Match basic const and let declarations
    const match = line.match(/^\s*(const|let)\s+([a-zA-Z0-9_]+)\s*(=|:|\()/);
    if (match) {
        const name = match[2];
        if (!declarations[name]) declarations[name] = [];
        declarations[name].push({ line: index + 1, content: line.trim() });
    }
});

for (const name in declarations) {
    if (declarations[name].length > 1) {
        console.log(`DUPE:${name}`);
        declarations[name].forEach(d => {
            console.log(`  L${d.line}: ${d.content}`);
        });
    }
}
