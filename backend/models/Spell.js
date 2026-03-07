const mongoose = require('mongoose');

const spellSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    level: String,
    level_int: Number,
    school: String,
    time: String,
    range: String,
    components: String,
    material_desc: String,
    duration: String,
    ritual: Boolean,
    concentration: Boolean,
    classes: [String],
    subclasses: [String],
    desc: String,
    higher_level: String
}, { strict: false });

module.exports = mongoose.model('Spell', spellSchema);
