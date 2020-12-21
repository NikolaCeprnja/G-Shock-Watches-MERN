const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const mongooseUniqueValidator = require('mongoose-unique-validator')

const { Schema } = mongoose

const userSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  purchasedProducts: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
  reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
})

// pre-save hook for hasing password with bcryptjs
userSchema.pre('save', async function (next) {
  const user = this
  const hashPassword = await bcrypt.hash(user.password, 12)

  user.password = hashPassword
  return next()
})

// custom method for validating hashed password
userSchema.methods.isValidPassword = async function (password) {
  const user = this
  const compare = await bcrypt.compare(password, user.password)

  return compare
}

// plugin which adds pre-save validation for unique fields in userSchema
userSchema.plugin(mongooseUniqueValidator)

module.exports = mongoose.model('Users', userSchema)
