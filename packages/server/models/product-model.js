/* eslint-disable global-require */
const mongoose = require('mongoose')
const Double = require('@mongoosejs/double/lib')

const ErrorHandler = require('./error-handler')

const { Schema } = mongoose

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    model: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    color: { type: String, required: true },
    types: [{ type: String, required: true }],
    collectionName: { type: String, required: true },
    materials: [{ type: String, required: true }],
    mainFeatures: [{ type: String, required: true }],
    previewImg: { type: String, default: '' },
    images: [{ type: String, default: '' }],
    discount: { type: Number, default: 0 },
    inStock: { type: Number, required: true },
    reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
    specifications: [{ type: String, required: true }],
    price: { type: Double, required: true },
  },
  { timestamps: true, toObject: { getters: true } }
)

productSchema.index(
  { name: 'text', model: 'text', collectionName: 'text' },
  { weights: { name: 1, model: 1, collectionName: 1 } }
)

productSchema.options.toObject.transform = function (doc, ret, options) {
  delete ret._id
}

productSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const User = require('./user-model')
    const Review = require('./review-model')
    const Collection = require('./collection-model')
    const product = this

    try {
      const session = await mongoose.startSession()
      session.startTransaction()
      await User.updateMany(
        { purchasedProducts: product._id },
        {
          $pull: {
            purchasedProducts: product._id,
            reviews: { $in: product.reviews },
          },
        }
      ).session(session)
      await Review.deleteMany({ _id: { $in: product.reviews } }).session(
        session
      )
      await Collection.updateOne(
        { name: product.collectionName },
        { $pull: { products: product._id } }
      )
      await session.commitTransaction()
      session.endSession()
    } catch (err) {
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }
  }
)

module.exports = mongoose.model('Product', productSchema)
