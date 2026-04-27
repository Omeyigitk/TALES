const f = require('fs');
const m = JSON.parse(f.readFileSync('/tmp/missing_necro.json','utf8'));

// Deduplicate by name and filter primarily to non-XPHB if there are duplicates
const unique = new Map();
for (const s of m.filter(x => x.school === 'N')) {
    if (!unique.has(s.name) || s.source !== 'XPHB') {
        unique.set(s.name, {
            name: s.name,
            level: s.level,
            school: s.school,
            time: s.time,
            range: s.range,
            components: s.components,
            duration: s.duration,
            entries: s.entries,
            classes: s.classes
        });
    }
}

const list = Array.from(unique.values());
f.writeFileSync('/tmp/necro_to_translate.json', JSON.stringify(list, null, 2));
console.log(`Saved ${list.length} spells.`);
