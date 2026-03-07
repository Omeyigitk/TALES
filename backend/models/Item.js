const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    name_tr: String,
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
    description_tr: String,

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

    // Combat Effects (NEW)
    effects: [{
        type: {
            type: String,
            enum: ['stat_bonus', 'stat_set', 'ac_bonus', 'spell_auto', 'initiative_bonus', 'speed_bonus', 'attack_bonus', 'damage_bonus', 'resistance']
        },
        value: mongoose.Schema.Types.Mixed,
        spellName: String
    }],

    source: String
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
