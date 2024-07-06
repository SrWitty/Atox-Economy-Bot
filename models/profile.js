const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    description: { type: String, default: '' },
    rank: { type: Number, default: 0 }
});

module.exports = mongoose.model('Profile', profileSchema);
