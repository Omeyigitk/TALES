const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    name_tr: String,
    category: {
        type: String,
        required: true,
        enum: ['Weapon', 'Armor', 'Adventuring Gear', 'Tools', 'Mounts and Vehicles', 'Magic Item', 'Ammunition', 'Equipment', 'Staff', 'Wondrous Item', 'Holy Symbol', 'Silah', 'Zırh', 'Eşya', 'Büyülü Eşya', 'Araçlar', 'Binek ve Araçlar']
    },
    subcategory: String,
    cost: {
        quantity: Number,
        unit: { type: String, enum: ['cp', 'sp', 'ep', 'gp', 'pp'] }
    },
    weight: Number,
    description: String,
    description_tr: String,

    damage: {
        dice: { type: String },
        type: { type: String }
    },
    properties: [String],
    range: {
        normal: { type: Number },
        long: { type: Number }
    },

    armor_class: {
        base: { type: Number },
        dex_bonus: { type: Boolean },
        max_bonus: { type: Number }
    },
    str_minimum: Number,
    stealth_disadvantage: Boolean,

    rarity: {
        type: String,
        enum: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Varies', 'Unique', 'None']
    },
    attunement: Boolean,

    effects: [{
        type: { type: String },
        value: mongoose.Schema.Types.Mixed,
        spellName: String
    }],

    source: String
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
