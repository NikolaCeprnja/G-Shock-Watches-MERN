/* eslint-disable global-require */
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const mongooseUniqueValidator = require('mongoose-unique-validator')

const ErrorHandler = require('./error-handler')

const { Schema } = mongoose

const userSchema = new Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    purchasedProducts: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
    reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
  },
  { timestamps: true }
)

// pre-deleteOne method that will delete all references for user and product reviews before deleting a user account
userSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const Review = require('./review-model')
    const Product = require('./product-model')
    const user = this

    try {
      const session = await mongoose.startSession()
      session.startTransaction()
      await Product.updateMany(
        { _id: { $in: user.purchasedProducts } },
        {
          $pullAll: { reviews: user.reviews },
        }
      ).session(session)
      await Review.deleteMany({ _id: { $in: user.reviews } }).session(session)
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

// custom method for validating hashed password
userSchema.methods.isValidPassword = async function (password) {
  const user = this
  const compare = await bcrypt.compare(password, user.password)

  return compare
}

// plugin which adds pre-save validation for unique fields in userSchema
userSchema.plugin(mongooseUniqueValidator)

module.exports = mongoose.model('User', userSchema)
