const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: String,
    dmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    activeEncounter: {
        isActive: { type: Boolean, default: false },
        monsters: [{
            monsterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Monster' },
            currentHp: Number,
            initiative: Number
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
    }
});

module.exports = mongoose.model('Campaign', campaignSchema);
