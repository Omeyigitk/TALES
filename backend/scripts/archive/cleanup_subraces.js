// Subrace olarak taşınan ırkları ana listeden kaldır
const mongoose = require('mongoose');
const Race = require('./models/Race');

mongoose.connect('mongodb://localhost:27017/dnd_app').then(async () => {
    // Bunlar artık Elf ve Genasi'nin subraceları — ayrı race kayıtları olmamalı
    const toDelete = [
        'High Elf',
        'Wood Elf',
        'Drow (Dark Elf)',
        'Air Genasi',
        'Earth Genasi',
        'Fire Genasi',
        'Water Genasi',
    ];

    for (const name of toDelete) {
        const result = await Race.deleteOne({ name });
        if (result.deletedCount > 0) {
            console.log(`✅ Silindi: ${name}`);
        } else {
            console.log(`⚠️  Bulunamadı: ${name}`);
        }
    }

    // Kalan race listesi
    const remaining = await Race.find({}, { name: 1 }).sort({ name: 1 });
    console.log('\n📋 Kalan ırklar:', remaining.map(r => r.name).join(', '));

    mongoose.disconnect();
});
