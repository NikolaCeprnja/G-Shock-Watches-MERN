const { validationResult } = require('express-validator')

const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')
const authenticate = require('../auth/auth')

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

  if (users) {
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
    console.error(error)

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

  authenticate('signup', req, res, next)
}

const userSignin = async (req, res, next) => {
  const valErr = validationResult(req)

  if (!valErr.isEmpty()) {
    console.error(valErr)
    return next(
      new ErrorHandler('Invalid inputs passed, please check your data.', 422)
    )
  }

  authenticate('signin', req, res, next)
}

module.exports = {
  getUsers,
  getUserById,
  userSignup,
  userSignin,
}
