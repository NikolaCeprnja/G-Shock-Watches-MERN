const jwt = require('jsonwebtoken')
const passport = require('passport')
const { isValidObjectId } = require('mongoose')

const User = require('../models/user-model')
const Review = require('../models/review-model')
const ErrorHandler = require('../models/error-handler')

const auth = strategy => (req, res, next) => {
  // Authenticate user with provided strategy
  passport.authenticate(
    strategy,
    { session: false },
    async (error, user, info) => {
      try {
        if (error) return next(error)
        if (!user) {
          return next(new ErrorHandler(info.message, info.statusCode))
        }

        // Login currently authenticated user
        req.login(
          user.toObject({ getters: true }),
          { session: false },
          async err => {
            if (err) return next(err)

            // Generate jwt for currently logged in user
            jwt.sign(
              {
                id: req.user.id,
              },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN },
              (_err, token) => {
                if (_err) return next(_err)
                req.token = token
                return next()
              }
            )
          }
        )
      } catch (err) {
        return next(err)
      }
    }
  )(req, res, next)
}

const authJwt = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err)

    if (!user) {
      return next(new ErrorHandler(info.message, info.statusCode))
    }

    req.user = user
    return next()
  })(req, res, next)
}

const checkReqParamValidity = param => (req, res, next) => {
  const reqParam = req.params[param]

  if (!isValidObjectId(reqParam)) {
    return res
      .status(400)
      .json({ message: `Invalid param passed for ${param}.` })
  }

  return next()
}

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

const checkReviewOvnership = async (req, res, next) => {
  const { rid } = req.params
  let review

  try {
    review = await Review.findById(rid)
  } catch (err) {
    return next(
      new ErrorHandler('Somthing went wrong, please try again later.', 500)
    )
  }

  if (review) {
    if (req.user.isAdmin || req.user.id === review.creator.toString()) {
      req.review = review
      return next()
    }

    return res
      .status(403)
      .json({ message: "You don't have permission to do that." })
  }

  return res
    .status(404)
    .json({ message: 'Review with provided rid does not exists.' })
}

const checkReviewExistence = async (req, res, next) => {
  const { pid } = req.params
  let reviewExists

  try {
    reviewExists = await Review.exists({ creator: req.user.id, product: pid })
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later', 500)
    )
  }

  if (req.user.isAdmin || !reviewExists) {
    return next()
  }

  return res
    .status(422)
    .json({ message: 'Review for product with provided pid already exists.' })
}

module.exports = {
  auth,
  authJwt,
  checkReqParamValidity,
  isAdmin,
  checkUserPrivileges,
  checkPurchasedProducts,
  checkReviewOvnership,
  checkReviewExistence,
}
