const passport = require('passport')
const jwt = require('jsonwebtoken')

const ErrorHandler = require('../models/error-handler')

const authenticate = (strategy, req, res, next) =>
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
                email: req.user.email,
                isAdmin: req.user.isAdmin,
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

module.exports = authenticate
