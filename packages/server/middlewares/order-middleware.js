const Order = require('../models/order-model')
const ErrorHandler = require('../models/error-handler')

const checkOrderOvnership = async (req, res, next) => {
  const { oid } = req.params
  let order

  try {
    order = await Order.findById(oid)
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (order) {
    if (req.user.isAdmin || req.user.id === order.customer.toString()) {
      return next()
    }

    return res
      .status(403)
      .json({ message: "You don't have permission to do that." })
  }

  return res
    .status(404)
    .json({ message: 'Order with provided oid does not exists.' })
}

module.exports = { checkOrderOvnership }
