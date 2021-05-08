const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')

const isAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    return next()
  }

  return res
    .status(403)
    .json({ message: "You don't have permission to do that." })
}

const checkUserPrivileges = (req, res, next) => {
  const { uid } = req.params

  if (req.user.isAdmin || req.user.id === uid) {
    return next()
  }

  return res
    .status(403)
    .json({ message: "You don't have permission to do that." })
}

const checkResetPassToken = async (req, res, next) => {
  const { userNameOrEmail } = req.body

  try {
    const resetTokenExists = await User.exists({
      $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (resetTokenExists) {
      return next(
        new ErrorHandler(
          'Request for password reset has already been sent. Go check your email and follow the further instructions.',
          409
        )
      )
    }

    next()
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  isAdmin,
  checkUserPrivileges,
  checkResetPassToken,
}
