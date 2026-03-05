const mongoose = require('mongoose');
const Spell = require('./models/Spell');

mongoose.connect('mongodb://localhost:27017/dnd_app').then(async () => {
    const distinct = await Spell.distinct('classes');
    console.log('DB\'deki tum class degerleri:', distinct.sort());

    const total = await Spell.countDocuments({});
    const wizardAll = await Spell.countDocuments({ classes: 'Wizard' });
    const wizardLv1 = await Spell.countDocuments({ classes: 'Wizard', level_int: { $lte: 1 } });
    const wizardLv0 = await Spell.countDocuments({ classes: 'Wizard', level_int: 0 });
    const noClass = await Spell.countDocuments({ classes: { $size: 0 } });
    const noClassField = await Spell.countDocuments({ classes: { $exists: false } });

    console.log('\n--- ISTATISTIK ---');
    console.log('Toplam spell:', total);
    console.log('classes field yok:', noClassField);
    console.log('classes bos array:', noClass);
    console.log('Wizard (toplam):', wizardAll);
    console.log('Wizard (level<=1):', wizardLv1);
    console.log('Wizard cantrip (level 0):', wizardLv0);

    // Frontend'in gonderdigi class adi ne oluyor? Ornek Wizard spell goster
    const sample = await Spell.findOne({ classes: 'Wizard', level_int: 1 });
    if (sample) {
        console.log('\nOrnek Wizard Lv1 spell:', sample.name, '| classes:', sample.classes);
    }

    // Classsiz speller var mi?
    const noClassSpells = await Spell.find({ $or: [{ classes: { $size: 0 } }, { classes: { $exists: false } }] }).limit(5);
    if (noClassSpells.length > 0) {
        console.log('\nClass bilgisi olmayan spell ornekleri:');
        noClassSpells.forEach(s => console.log(' -', s.name, '| classes:', s.classes));
    }

    mongoose.disconnect();
});
