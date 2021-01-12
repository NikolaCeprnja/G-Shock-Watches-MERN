const mongoose = require('mongoose')
const Double = require('@mongoosejs/double/lib')

const { Schema } = mongoose

const productSchema = new Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  color: { type: String, required: true },
  types: [{ type: String, required: true }],
  collectionName: { type: String, required: true },
  materials: [{ type: String, required: true }],
  functions: [{ type: String, required: true }],
  images: [{ type: String, required: true }],
  discount: { type: Number, default: 0 },
  inStock: { type: Number, required: true },
  reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
  specifications: [{ type: String, required: true }],
  price: { type: Double, required: true },
  created: { type: Date, required: true },
})

module.exports = mongoose.model('Product', productSchema)
