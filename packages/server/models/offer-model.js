const mongoose = require('mongoose')

const { Schema } = mongoose

const offerSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imgUrls: [{ type: String, required: true }],
  },
  { timestamps: true, toObject: { getters: true } }
)

module.exports = mongoose.model('Offer', offerSchema)
