const mongoose = require('mongoose');
const Race = require('./models/Race');

mongoose.connect('mongodb://localhost:27017/dnd_app').then(async () => {
    const fs = require('fs');
    const out = [];

    const elf = await Race.findOne({ name: /elf/i });
    const genasi = await Race.findOne({ name: /genasi/i });
    const human = await Race.findOne({ name: /human/i });

    if (elf) {
        out.push('=== ELF ===');
        out.push('Name: ' + elf.name);
        out.push('Subraces count: ' + (elf.subraces?.length || 0));
        if (elf.subraces) elf.subraces.forEach(s => out.push('  - ' + s.name + ' | ability_bonus: ' + JSON.stringify(s.ability_bonus) + ' | traits count: ' + (s.traits?.length || 0)));
    } else {
        out.push('ELF NOT FOUND');
    }

    if (genasi) {
        out.push('\n=== GENASI ===');
        out.push('Name: ' + genasi.name);
        out.push('Subraces count: ' + (genasi.subraces?.length || 0));
        if (genasi.subraces) genasi.subraces.forEach(s => out.push('  - ' + s.name + ' | traits: ' + (s.traits?.length || 0)));
    } else {
        out.push('\nGENASI NOT FOUND');
    }

    // List all races
    const all = await Race.find({}, { name: 1, 'subraces': 1 });
    out.push('\n=== ALL RACES ===');
    all.forEach(r => out.push('  ' + r.name + ' => subraces: ' + (r.subraces?.length || 0)));

    fs.writeFileSync('./subrace_check.txt', out.join('\n'), 'utf8');
    console.log('Done: subrace_check.txt');
    mongoose.disconnect();
});
