const { validationResult } = require('express-validator')

const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')
const { auth } = require('../auth/auth')

// GET CONTROLLERS
const getUsers = async (req, res, next) => {
  let users

  if (!req.user.isAdmin)
    return next(new ErrorHandler("You don't have permission to do that.", 403))

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

  if (req.user.id !== uid && !req.user.isAdmin) {
    return next(new ErrorHandler("You don't have permission to do that.", 403))
  }

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

// POST CONTROLLERS
const userSignup = async (req, res, next) => {
  const valErr = validationResult(req)

  if (!valErr.isEmpty()) {
    console.error(valErr)
    return next(
      new ErrorHandler('Invalid inputs passed, please check your data.', 422)
    )
  }

  auth('signup', req, res, next)
}

const userSignin = async (req, res, next) => {
  const valErr = validationResult(req)

  if (!valErr.isEmpty()) {
    console.error(valErr)
    return next(
      new ErrorHandler('Invalid inputs passed, please check your data.', 422)
    )
  }

  auth('signin', req, res, next)
}

module.exports = {
  getUsers,
  getUserById,
  userSignup,
  userSignin,
}
