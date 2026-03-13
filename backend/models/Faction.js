const mongoose = require('mongoose');

const factionSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    reputations: [{
        characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
        characterName: String,
        score: { type: Number, default: 0 } // e.g., -10 to 10 or 0 to 100
    }]
});

module.exports = mongoose.model('Faction', factionSchema);
