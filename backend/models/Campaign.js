const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: String,
    dmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    partyGold: { type: Number, default: 0 },
    sharedInventory: [mongoose.Schema.Types.Mixed],
    fogOfWar: [String], // Array of "x,y" coordinates that are HIDDEN
    activeEncounter: {
        isActive: { type: Boolean, default: false },
        round: { type: Number, default: 0 },
        turnIndex: { type: Number, default: 0 },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }]
    },
    mapData: {
        bgUrl: { type: String, default: '' },
        gridSize: { type: Number, default: 50 },
        showGrid: { type: Boolean, default: true },
        tokens: [{
            id: String,
            name: String,
            x: Number,
            y: Number,
            color: String,
            type: { type: String, enum: ['player', 'npc', 'monster'] },
            entityId: String
        }]
    }
});

module.exports = mongoose.model('Campaign', campaignSchema);
