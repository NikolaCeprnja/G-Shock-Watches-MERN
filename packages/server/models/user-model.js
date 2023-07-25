/* eslint-disable global-require */
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const mongooseUniqueValidator = require('mongoose-unique-validator')

const accountSchema = require('./account-model')
const ErrorHandler = require('./error-handler')

const { Schema } = mongoose

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: () => !!this.email,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: () => !!this.password,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      required: () => !!this.email,
    },
    isAdmin: { type: Boolean, default: false },
    avatarUrl: String,
    cloudinaryId: String,
    cloudinaryUrl: String,
    orders: [{ type: mongoose.Types.ObjectId, ref: 'Order' }],
    purchasedProducts: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
    reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
    accounts: [accountSchema],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true, toObject: { getters: true } }
)

userSchema.index(
  {
    userName: 'text',
    email: 'text',
    'accounts.displayName': 'text',
    'accounts.emails.value': 'text',
  },
  {
    weights: {
      userName: 1,
      email: 1,
      'accounts.displayName': 1,
      'accounts.emails.value': 1,
    },
  }
)

userSchema.options.toObject.transform = function (doc, ret, options) {
  delete ret._id
  delete ret.password

  if (options.localStrategy) {
    const {
      id,
      userName,
      email,
      isAdmin,
      avatarUrl,
      cloudinaryId,
      cloudinaryUrl,
    } = ret
    return {
      id,
      isAdmin,
      userName,
      email,
      avatarUrl,
      cloudinaryId,
      cloudinaryUrl,
    }
  }

  if (options.googleStrategy) {
    const { id, isAdmin, accounts } = ret
    const { displayName, emails, photos } = accounts[0]
    const { value: email } = emails[0]
    const { value: photo } = photos[0]

    return {
      id,
      isAdmin,
      userName: displayName,
      email,
      photo,
    }
  }

  return ret
}

// Delete all references for user and product reviews before deleting the user account
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
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }
  }
)

// Validate the hashed password
userSchema.methods.isValidPassword = async function (password) {
  const user = this
  const compare = await bcrypt.compare(password, user.password)

  return compare
}

// Generates a password reset token and its expiration time
userSchema.methods.getResetPasswordToken = function () {
  const user = this
  const resetToken = crypto.randomBytes(20).toString('hex')

  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  user.resetPasswordExpire = Date.now() + 10 * (60 * 1000)

  return resetToken
}

// Plugin which adds pre-save validation for unique fields in userSchema
userSchema.plugin(mongooseUniqueValidator)

module.exports = mongoose.model('User', userSchema)
