const mongoose = require('mongoose');
const user = require('./user');

const ClubSchema = new mongoose.Schema({
    clubName: {type: String, required: true},
    clubCategory: {type: String, required: true},
    suggestedBy: {type: String, required: true}
});

ClubSchema.index({clubName: 1, suggestedBy: 1}, { unique: true });

module.exports = mongoose.model('Club', ClubSchema);