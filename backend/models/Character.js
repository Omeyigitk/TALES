const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    raceRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' },
    classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    background: { type: String, default: "" },
    level: { type: Number, default: 1 },
    subclass: { type: String, default: "" },
    subrace: { type: String, default: "" },
    inspiration: { type: Boolean, default: false },
    fightingStyle: { type: String, default: "" },

    expertise: [String],
    stats: {
        STR: Number, DEX: Number, CON: Number, INT: Number, WIS: Number, CHA: Number
    },
    maxHp: Number,
    currentHp: Number,
    tempHp: { type: Number, default: 0 },
    ac: Number,
    spells: [String],
    pinnedSpells: [String],
    spellSlots: { type: Map, of: Number },
    feats: [String],
    featSelections: { type: mongoose.Schema.Types.Mixed, default: {} }, // { "Fey Touched": { stat: "INT", spell: "Hex" } }
    inventory: [mongoose.Schema.Types.Mixed],
    backstory: { type: String, default: "" },
    deathSaves: {
        successes: { type: Number, default: 0 },
        failures: { type: Number, default: 0 }
    },
    conditions: [String],
    hitDiceUsed: { type: Number, default: 0 },
    languages: [String],

    // YENİ EKLENENLER: DM Notları, Kişisel Notlar, Kapsamlı NPC, Petler
    dmNotes: { type: String, default: "" },
    privateNotes: { type: String, default: "" },
    isNpc: { type: Boolean, default: false },
    alignment: { type: String, default: "True Neutral" },
    relationship: { type: String, default: "Nötr" }, // Dost | Nötr | Düşman
    companions: [{
        name: String,
        level: Number,
        hp: Number,
        maxHp: Number,
        tempHp: { type: Number, default: 0 },
        ac: Number,
        type: String,
        note: String
    }],
    customResources: [{
        id: String,
        name: String,
        max: Number,
        recharge: { type: String, enum: ['short', 'long'], default: 'long' },
        desc: String
    }],

    // MULTICLASS: Secondary classes array (primary class stays in classRef/level)
    multiclasses: [{
        classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        className: { type: String, default: '' }, // cached name for quick display
        level: { type: Number, default: 1 },
        subclass: { type: String, default: '' },
        hitDiceUsed: { type: Number, default: 0 }
    }]
}, { strict: false });

module.exports = mongoose.model('Character', characterSchema);
