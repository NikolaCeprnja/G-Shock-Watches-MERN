const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
	userName: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	isAdmin: { type: Boolean, default: false },
	purchasedProducts: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
	reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
});

module.exports = mongoose.model('Users', userSchema);
