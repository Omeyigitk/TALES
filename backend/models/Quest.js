const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
    rewards: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quest', questSchema);
