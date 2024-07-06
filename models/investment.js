const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    amount: { type: Number, required: true },
    profit: { type: Number, default: 0 },
    type: { type: String, enum: ['stock', 'bond', 'real estate'], required: true }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Investment', investmentSchema);
