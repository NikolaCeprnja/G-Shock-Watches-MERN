const { check, body, oneOf } = require('express-validator')

const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')
const {
  reqValidationResult,
} = require('../controllers/req-validation-controller')

const avatarValidation = check('avatar')
  .if((value, { req: { file } }) => file)
  .custom((value, { req: { file } }) => {
    if (!['image/png', 'image/jpeg'].includes(file.detectedMimeType)) {
      return Promise.reject(
        new ErrorHandler(
          'Unsuported file selected.\nOnly .PNG or .JPEG (JPG) files are allowed.',
          409
        )
      )
    }

    if (file.size > 1000000) {
      return Promise.reject(
        new ErrorHandler('Chosen file needs to be less then 1MB.', 409)
      )
    }

    return true
  })

const userNameValidation = (updateUser = false) =>
  (value => (updateUser ? value.optional() : value))(body('userName'))
    .trim()
    .notEmpty()
    .withMessage('Please input your username.')
    .isLength({ min: 6 })
    .withMessage('Username needs to be at least 6 characters long.')
    .custom((userName, { req: { params: { uid = undefined } } }) =>
      User.findOne({
        ...(updateUser && { _id: { $ne: uid } }),
        $or: [
          { userName },
          { accounts: { $elemMatch: { displayName: userName } } },
        ],
      }).then(existingUser => {
        if (existingUser) {
          return Promise.reject(
            new ErrorHandler(
              'Username already taken, please try another one.',
              409
            )
          )
        }
      })
    )

const userNameOrEmailValidation = oneOf(
  [
    body('userNameOrEmail').trim().notEmpty().isEmail(),
    body('userNameOrEmail').trim().isLength({ min: 6 }),
  ],
  'Invalid email or username passed, please check your data and try again.'
)

const emailValidation = (updateUser = false) =>
  (value => (updateUser ? value.optional() : value))(body('email'))
    .trim()
    .notEmpty()
    .withMessage('Please input your email address.')
    .isEmail()
    .withMessage('Invalid email address.')
    .custom((email, { req: { params: { uid = undefined } } }) =>
      User.findOne({
        ...(updateUser && { _id: { $ne: uid } }),
        $or: [
          { email },
          {
            'accounts.emails': { $elemMatch: { value: email } },
          },
        ],
      }).then(existingUser => {
        if (existingUser) {
          return Promise.reject(
            new ErrorHandler(
              'Email already taken, please try another one.',
              409
            )
          )
        }
      })
    )

const passwordValidation = (
  fields = ['password', 'confirmPassword'],
  optional = false
) => [
  (value => (optional ? value.optional() : value))(body(fields[0]))
    .notEmpty()
    .withMessage('Please input your password.')
    .isLength({ min: 6 })
    .withMessage('Passowrd needs to be at least 6 characters long.'),
  (value => (optional ? value.optional() : value))(body(fields[1]))
    .notEmpty()
    .withMessage('Please confirm your password.')
    .isLength({ min: 6 })
    .withMessage('Passowrd needs to be at least 6 characters long.')
    .custom((value, { req }) => value === req.body[fields[0]])
    .withMessage(
      "Passwords don't match, please check your data and try again."
    ),
]

const adminValidation = body('isAdmin').optional().isBoolean()

const purchasedProductsValidation = [
  body('purchasedProducts').optional().isArray({ min: 1 }),
  body('purchasedProducts.*').isMongoId(),
]

const reviewsValidation = [
  body('reviews').optional().isArray({ min: 1 }),
  body('reviews.*').isMongoId(),
]

// USER VALIDATION
const userValidation = method => {
  switch (method) {
    case 'signup': {
      return [
        avatarValidation,
        userNameValidation(),
        emailValidation(),
        ...passwordValidation(),
        adminValidation,
        ...purchasedProductsValidation,
        ...reviewsValidation,
        reqValidationResult,
      ]
    }
    case 'signin': {
      return [
        userNameOrEmailValidation,
        passwordValidation()[0],
        reqValidationResult,
      ]
    }
    case 'forgotPassword': {
      return [userNameOrEmailValidation, reqValidationResult]
    }
    case 'resetPassword': {
      return [
        ...passwordValidation(['newPassword', 'confirmNewPassword']),
        reqValidationResult,
      ]
    }
    case 'updateUser': {
      return [
        avatarValidation,
        userNameValidation(true),
        emailValidation(true),
        ...passwordValidation(undefined, true),
        adminValidation,
        reqValidationResult,
      ]
    }
  }
}

module.exports = { userValidation }
