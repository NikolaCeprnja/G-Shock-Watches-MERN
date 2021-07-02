/* eslint-disable global-require */
const mongoose = require('mongoose')
const Double = require('@mongoosejs/double/lib')

const ErrorHandler = require('./error-handler')

const { Schema } = mongoose

const reviewSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    score: { type: Double, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    product: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
  },
  { timestamps: true, toObject: { getters: true } }
)

// TODO: add transform function for toObject to remove _id and other stuff if needed

// Delete references for user and product review before deleting the review itself
reviewSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const User = require('./user-model')
    const Product = require('./product-model')
    const review = this

    try {
      const session = await mongoose.startSession()
      session.startTransaction()
      await User.updateOne(
        { _id: review.creator },
        { $pull: { reviews: review._id } }
      ).session(session)
      await Product.updateOne(
        { _id: review.product },
        { $pull: { reviews: review._id } }
      ).session(session)
      await session.commitTransaction()
      session.endSession()
    } catch (err) {
      console.log(err)
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }
  }
)

module.exports = mongoose.model('Review', reviewSchema)
