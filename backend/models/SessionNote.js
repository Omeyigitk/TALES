const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    authorName: { type: String, required: true }, // Name of the user/character who wrote it
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
