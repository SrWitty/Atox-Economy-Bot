const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    link: { type: String, required: true }, 
    sellerId: { type: String, required: true },
    buyerId: { type: String }
});

module.exports = mongoose.model('Product', productSchema);
