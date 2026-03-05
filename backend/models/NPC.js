const mongoose = require('mongoose');

const npcSchema = new mongoose.Schema({
    campaignId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: "Tüccar" },
    relationship: { type: String, enum: ['Dost', 'Nötr', 'Düşman'], default: 'Nötr' },
    details: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('NPC', npcSchema);
