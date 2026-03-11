const mongoose = require('mongoose');

const diceRollSchema = new mongoose.Schema({
    campaignId: { type: String, required: true, index: true },
    playerName: { type: String, required: true },
    rollResult: { type: Number, required: true },
    type: { type: String, required: true }, // e.g., "d20", "d8", "Strength Check"
    isHidden: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true }
});

// Automatically delete rolls older than 7 days
diceRollSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('DiceRoll', diceRollSchema);
