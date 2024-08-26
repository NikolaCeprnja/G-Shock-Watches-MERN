const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const passport = require('passport')

const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')

const sendEmail = require('../utils/sendgrid')

const auth = strategy => (req, res, next) => {
  // Authenticate user with provided strategy
  passport.authenticate(
    strategy,
    { session: false },
    async (error, user, info) => {
      try {
        if (error) return next(error)
        if (!user) {
          const { message, statusCode, errors } = info
          return next(new ErrorHandler(message, statusCode, errors))
        }

        if (req.path === '/auth/createNewUser') {
          return res.status(201).json({
            message: `Account for user ${user.userName} is successfully created!`,
          })
        }

        // Login currently authenticated user
        req.login(user, { session: false }, async err => {
          if (err) return next(err)

          // Generate jwt for currently logged in user
          jwt.sign(
            {
              id: req.user.id,
              auth: info ? { ...info } : undefined,
            },
            config.get('JWT.SECRET'),
            { expiresIn: config.get('JWT.EXPIRES_IN') },
            (_err, token) => {
              if (_err) return next(_err)
              req.token = token
              return next()
            }
          )
        })
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
      return next(new ErrorHandler(info.message, info.statusCode || 401))
    }

    req.user = user
    return next()
  })(req, res, next)
}

const forgotPassword = async (req, res, next) => {
  const { userNameOrEmail } = req.body

  try {
    const existingUser = await User.findOne({
      $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
    })

    if (!existingUser) {
      return next({
        errors: {
          userNameOrEmail: {
            message:
              'User with provided email / username does not exists. Check your data and try again.',
            value: userNameOrEmail,
          },
        },
        statusCode: 404,
      })
    }

    const resetPasswordToken = existingUser.getResetPasswordToken()

    await existingUser.save()

    const passwordResetUrl = `${config.get(
      'PASSWORD_RESET.URL'
    )}/${resetPasswordToken}`

    const message = `<h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password</p>
      <a href=${passwordResetUrl} clicktracking=off>${passwordResetUrl}<a/>
    `
    try {
      await sendEmail({
        to: existingUser.email,
        subject: 'Password Reset Request',
        html: message,
      })

      res.status(200).json({
        message:
          'Request for password reset is successfully sent. Go check your email and follow the further instructions.',
      })
    } catch (err) {
      existingUser.resetPasswordToken = undefined
      existingUser.resetPasswordExpire = undefined

      await existingUser.save()

      return next(
        new ErrorHandler(
          'Something went wrong while sending a request for your password reset, please try again later.',
          500
        )
      )
    }
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later', 500)
    )
  }
}

const resetPassword = async (req, res, next) => {
  const { newPassword } = req.body

  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetPasswordToken)
    .digest('hex')

  try {
    const existingUser = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!existingUser) {
      return next(
        new ErrorHandler(
          'Invalid password reset token, please send a new email request and then try again.',
          400
        )
      )
    }

    const password = await bcrypt.hash(newPassword, 12)

    existingUser.password = password
    existingUser.resetPasswordToken = undefined
    existingUser.resetPasswordExpire = undefined

    await existingUser.save()

    return res.status(200).json({
      message:
        'Your password is successfully reseted! You can close this window now and go to sign in.',
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  auth,
  authJwt,
  forgotPassword,
  resetPassword,
}
