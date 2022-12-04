const mongoose = require('mongoose')
const Double = require('@mongoosejs/double/lib')

const { Schema } = mongoose

const orderSchema = new Schema(
  {
    totalAmount: { type: Double, required: true },
    currency: { type: String, required: true, default: 'USD' },
    email: { type: String, default: '' },
    customer: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    orderedProducts: [
      {
        _id: false,
        id: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        price: { type: Double, required: true },
        discount: { type: Number, required: true, default: 0 },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    shippingAddr: { type: String, required: true },
    billingAddr: { type: String, required: true },
    status: [
      {
        _id: false,
        info: {
          type: String,
          required: true,
          enum: ['created', 'paid', 'canceled', 'fulfilled', 'returned'],
          default: 'created',
        },
        date: {
          type: Date,
          required: true,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true, toObject: { getters: true } }
)

orderSchema.options.toObject.transform = function (doc, ret, options) {
  delete ret._id

  if (options.newOrderCreated) {
    const { id, status } = ret

    return { id, status: status[0] }
  }

  return ret
}

module.exports = mongoose.model('Order', orderSchema)
