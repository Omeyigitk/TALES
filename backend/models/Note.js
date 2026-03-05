const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    campaignId: { type: String, required: true },
    title: { type: String, default: "Yeni Not" },
    content: { type: String, default: "" },
    color: { type: String, default: "yellow" }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
