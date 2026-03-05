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
    fightingStyle: { type: String, default: "" },

    expertise: [String],
    stats: {
        STR: Number, DEX: Number, CON: Number, INT: Number, WIS: Number, CHA: Number
    },
    maxHp: Number,
    currentHp: Number,
    ac: Number,
    spells: [String],
    feats: [String],
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
        hp: Number,
        maxHp: Number,
        ac: Number,
        type: String,
        note: String
    }]
}, { strict: false });

module.exports = mongoose.model('Character', characterSchema);
