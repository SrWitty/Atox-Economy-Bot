const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    emoji: { type: String, required: true }
});

module.exports = mongoose.model('Badge', badgeSchema);
