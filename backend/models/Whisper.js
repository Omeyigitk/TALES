const mongoose = require('mongoose');

const whisperSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    senderName: { type: String, required: true },
    targetName: { type: String, required: true }, // 'DM' or character name
    message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Whisper', whisperSchema);
