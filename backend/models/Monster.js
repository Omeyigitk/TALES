const mongoose = require('mongoose');

const monsterSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    type: String,
    ac: String,
    hp: String,
    speed: String,
    stats: String,
    challenge: String,
    traits: [{ name: String, desc: String }],
    actions: [{ name: String, desc: String }],
    legendary: [{ name: String, desc: String }]
}, { strict: false }); // To allow additional dynamic fields from JSON

module.exports = mongoose.model('Monster', monsterSchema);
