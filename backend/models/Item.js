const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: {
        type: String,
        required: true,
        enum: ['Weapon', 'Armor', 'Adventuring Gear', 'Tools', 'Mounts and Vehicles', 'Magic Item']
    },
    subcategory: String, // e.g. 'Martial Melee Weapons', 'Heavy Armor', 'Artisan\'s Tools'
    cost: {
        quantity: Number,
        unit: { type: String, enum: ['cp', 'sp', 'ep', 'gp', 'pp'] }
    },
    weight: Number, // in lbs
    description: String,

    // Weapon specific
    damage: {
        dice: { type: String },
        type: { type: String }
    },
    properties: [String],
    range: {
        normal: { type: Number },
        long: { type: Number }
    },

    // Armor specific
    armor_class: {
        base: { type: Number },
        dex_bonus: { type: Boolean },
        max_bonus: { type: Number }
    },
    str_minimum: Number,
    stealth_disadvantage: Boolean,

    // Magic Item specific
    rarity: {
        type: String,
        enum: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Varies']
    },
    attunement: Boolean,

    source: String
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
