const mongoose = require('mongoose')

const { Schema } = mongoose

const collectionSchema = new Schema(
  {
    name: { type: String, required: true },
    imgUrl: { type: String, required: true },
    gender: { type: String, required: true },
    products: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true, toObject: { getters: true, useProjection: true } }
)

collectionSchema.options.toObject.transform = function (doc, ret, options) {
  delete ret._id

  const { id, name, imgUrl, gender } = ret
  return {
    id,
    name,
    imgUrl,
    gender,
  }
}

module.exports = mongoose.model('Collection', collectionSchema)
