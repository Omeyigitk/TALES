const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    hit_die: String,
    primary_ability: String,
    saves: [String],
    armor_proficiencies: [String],
    weapon_proficiencies: [String],
    description_tr: String,
    features: [{
        level: Number,
        name: String,
        desc_tr: String
    }],
    subclass_unlock_level: Number,
    subclasses: [{
        name: String,
        description_tr: String,
        features: [{
            level: Number,
            name: String,
            desc_tr: String
        }]
    }]
}, { strict: false });

module.exports = mongoose.model('Class', classSchema);
