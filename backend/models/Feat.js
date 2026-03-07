const mongoose = require('mongoose');

const featSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    name_tr: String,
    category: {
        type: String,
        enum: ['General', 'Fighting Style', 'Epic Boon', 'Origin', 'Skill', 'Half Feat'],
        default: 'General'
    },
    prereq: String,
    desc_tr: String,
    effects: [{
        type: {
            type: String,
            enum: ['stat_bonus', 'stat_choice', 'hp_per_level', 'spell_auto', 'spell_choice', 'proficiency', 'expertise', 'ac_bonus', 'speed_bonus', 'initiative_bonus']
        },
        value: mongoose.Schema.Types.Mixed,
        options: [String],
        level: Number,
        schools: [String]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Feat', featSchema);
