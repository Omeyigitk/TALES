const mongoose = require('mongoose');

const sharedMediaSchema = new mongoose.Schema({
    campaignId: { type: String, required: true, index: true },
    url: { type: String, required: true }, // Local path for file, HTTP for link
    type: { type: String, enum: ['image', 'link'], default: 'image' },
    name: { type: String, default: 'Media' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SharedMedia', sharedMediaSchema);
