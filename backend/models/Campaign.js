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
        participants: [{
            characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
            name: String,
            initiative: { type: Number, default: 0 },
            ac: Number,
            currentHp: Number,
            maxHp: Number,
            isPlayer: { type: Boolean, default: false }
        }]
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
    },
    activeEnvironment: {
        type: { type: String, default: 'clear' }, // clear, rain, snow, fog, sandstorm
        severity: { type: String, default: 'medium' }, // light, medium, heavy
        backgroundUrl: { type: String, default: '' }
    }
});

module.exports = mongoose.model('Campaign', campaignSchema);
