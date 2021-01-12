const mongoose = require('mongoose')

const { Schema } = mongoose

const reviewSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  score: { type: Number, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  product: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
})

module.exports = mongoose.model('Review', reviewSchema)
