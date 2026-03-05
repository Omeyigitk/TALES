const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    speed: Number,
    size: String,
    ability_bonuses: [{ ability: String, bonus: Number }],
    description_tr: String,
    traits: [{
        name: String,
        desc_tr: String
    }],
    subraces: [{
        name: String,
        description_tr: String,
        ability_bonuses: [{ ability: String, bonus: Number }],
        traits: [{ name: String, desc_tr: String }]
    }]
}, { strict: false });

module.exports = mongoose.model('Race', raceSchema);
