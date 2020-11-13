const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
	name: { type: String, required: true },
	model: { type: String, required: true },
	color: { type: String, required: true },
	type: [{ type: String, required: true }],
	collection: { type: String, required: true },
	material: [{ type: String, required: true }],
	function: [{ type: String, required: true }],
	images: [{ type: String, required: true }],
	discount: Number,
	inStock: Number,
	reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
	mainFeatures: [{ type: String, required: true }],
	specifications: [{ type: String, required: true }],
	price: { type: mongoose.Types.Decimal128, required: true },
	created: { type: Date, required: true },
});

module.exports = mongoose.model('Product', productSchema);
