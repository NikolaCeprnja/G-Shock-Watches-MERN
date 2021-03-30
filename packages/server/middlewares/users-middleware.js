const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')

const checkPurchasedProducts = async (req, res, next) => {
  const { pid } = req.params
  let user

  if (req.user.isAdmin) {
    return next()
  }

  try {
    user = await User.findById(req.user.id)
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later', 500)
    )
  }

  if (user.purchasedProducts.length) {
    if (user.purchasedProducts.includes(pid)) {
      return next()
    }

    return res
      .status(403)
      .json({ message: "You don't have permission to do that." })
  }

  return res.status(404).json({
    message: 'User with provided uid does not have any purchased products jet.',
  })
}

module.exports = {
  checkPurchasedProducts,
}
