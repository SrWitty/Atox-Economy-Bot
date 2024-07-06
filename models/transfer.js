// Import Mongoose
const mongoose = require('mongoose');

// Define the schema for the Transfer model
const transferSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true
    },
    recipientId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Transfer model
const Transfer = mongoose.model('Transfer', transferSchema);

// Export the Transfer model
module.exports = Transfer;
