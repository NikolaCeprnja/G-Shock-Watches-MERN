const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')

// GET CONTROLLERS
const getUsers = async (req, res, next) => {
  let users

  try {
    users = await User.find()
  } catch (error) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (users.length) {
    return res.status(200).json({ message: 'List of all users', users })
  }

  return res.status(404).json({ message: 'Currently there is no users yet.' })
}

const getUserById = async (req, res, next) => {
  const { uid } = req.params
  let user

  try {
    user = await User.findById(uid)
  } catch (error) {
    return next(
      new ErrorHandler('Something went wrong, please try again later!', 500)
    )
  }

  if (user) {
    return res.status(200).json({ user: user.toObject({ getters: true }) })
  }

  return res
    .status(404)
    .json({ message: 'User with provided uid does not exists.' })
}

// DELETE CONTROLLERS
const deleteUser = async (req, res, next) => {
  const { uid } = req.params
  let user

  try {
    user = await User.findById(uid)
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (user) {
    try {
      await user.deleteOne()
    } catch (err) {
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }

    if (req.user.id === uid) {
      req.logout()
      res.clearCookie('token', { httpOnly: true })
    }

    return res.json({
      message: 'User is successfully deleted!',
      deletedUser: user.toObject({ getters: true }),
    })
  }

  return res
    .status(404)
    .json({ message: 'User with provided uid does not exists.' })
}

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
}
