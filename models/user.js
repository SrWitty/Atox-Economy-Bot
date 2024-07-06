const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    lastDaily: { type: Date },
    lastWeekly: { type: Date },
    lastWork: { type: Date },
    lastJob: { type: String },
    roleExpiration: { type: Date, default: null },
    inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    role: { type: String, default: 'regular' },
    badges: [{ type: String }] ,
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});

module.exports = mongoose.model('User', userSchema);
