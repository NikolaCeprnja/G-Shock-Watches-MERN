const { body, check, oneOf, validationResult } = require('express-validator')

const {
  PRODUCT_TYPES,
  PRODUCT_COLLECTION_NAME,
  PRODUCT_MATERIALS,
  PRODUCT_MAIN_FEATURES,
  REVIEW_KEYS,
} = require('../models/req-validation-types')
const errorFormater = require('../models/req-validation-error')
const ErrorHandler = require('../models/error-handler')

const reqValidationResult = (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0 && !req.file) {
      return next(
        new ErrorHandler('Invalid inputs passed, please check your data.', 400)
      )
    }

    validationResult(req).formatWith(errorFormater).throw()

    return next()
  } catch (err) {
    const errors = err.mapped()
    console.log(errors)

    return res.status(422).json({ errors })
  }
}

// TODO: add validation to entire body() for each req param

// USER VALIDATION
const userValidation = method => {
  switch (method) {
    case 'signup': {
      return [
        body('userName')
          .trim()
          .notEmpty()
          .withMessage('Please input your username.')
          .isLength({ min: 6 })
          .withMessage('Username needs to be at least 6 characters long.'),
        body('email')
          .trim()
          .notEmpty()
          .withMessage('Please input your email address.')
          .isEmail()
          .withMessage('Invalid email address.'),
        body('password')
          .notEmpty()
          .withMessage('Please input your password.')
          .isLength({ min: 6 })
          .withMessage('Passowrd needs to be at least 6 characters long.'),
        body('confirmPassword')
          .notEmpty()
          .withMessage('Please confirm your password.')
          .isLength({ min: 6 })
          .withMessage('Passowrd needs to be at least 6 characters long.')
          .custom((value, { req }) => value === req.body.password)
          .withMessage(
            "Passwords don't match, please check your data and try again."
          ),
        body('isAdmin').optional().isBoolean(),
        body('purchasedProducts').optional().isArray({ min: 1 }),
        body('purchasedProducts.*').isMongoId(),
        body('reviews').optional().isArray({ min: 1 }),
        body('reviews.*').isMongoId(),
        reqValidationResult,
      ]
    }
    case 'signin': {
      return [
        oneOf(
          [
            body('userNameOrEmail').trim().notEmpty().isEmail(),
            body('userNameOrEmail').trim().isLength({ min: 6 }),
          ],
          'Invalid email or username passed, please check your data and try again.'
        ),
        body('password')
          .isLength({ min: 6 })
          .withMessage('Passowrd needs to be at least 6 characters long.'),
        reqValidationResult,
      ]
    }
    case 'forgotPassword': {
      return [
        oneOf(
          [
            body('userNameOrEmail').trim().notEmpty().isEmail(),
            body('userNameOrEmail').trim().isLength({ min: 6 }),
          ],
          'Invalid email or username passed, please check your data and try again.'
        ),
        reqValidationResult,
      ]
    }
    case 'resetPassword': {
      return [
        body('newPassword')
          .isLength({ min: 6 })
          .withMessage('Passowrd needs to be at least 6 characters long.'),
        body('confirmNewPassword')
          .isLength({ min: 6 })
          .withMessage('Passowrd needs to be at least 6 characters long.')
          .custom((value, { req }) => value === req.body.newPassword)
          .withMessage(
            "Passwords don't match, please check your data and try again."
          ),
        reqValidationResult,
      ]
    }
    case 'updateUser': {
      // eslint-disable-next-line global-require
      const User = require('../models/user-model')

      return [
        check('avatar')
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
          }),
        body('userName')
          .optional()
          .trim()
          .notEmpty()
          .withMessage('Please input your username.')
          .isLength({ min: 6 })
          .withMessage('Username needs to be at least 6 characters long.')
          .custom((value, { req: { params: { uid } } }) =>
            User.findOne({
              _id: { $ne: uid },
              $or: [
                { userName: value },
                { accounts: { $elemMatch: { displayName: value } } },
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
          ),
        body('email')
          .optional()
          .trim()
          .notEmpty()
          .withMessage('Please input your email address.')
          .isEmail()
          .withMessage('Invalid email address.')
          .custom((value, { req: { params: { uid } } }) =>
            User.findOne({
              _id: { $ne: uid },
              $or: [
                { email: value },
                { 'accounts.emails': { $elemMatch: { value } } },
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
          ),
        body('password')
          .optional()
          .notEmpty()
          .withMessage('Please input your password.')
          .isLength({ min: 6 })
          .withMessage('Passowrd needs to be at least 6 characters long.'),
        body('confirmPassword')
          .optional()
          .notEmpty()
          .withMessage('Please confirm your password.')
          .isLength({ min: 6 })
          .withMessage('Passowrd needs to be at least 6 characters long.')
          .custom((value, { req }) => value === req.body.password)
          .withMessage(
            "Passwords don't match, please check your data and try again."
          ),
        body('isAdmin').optional().isBoolean(),
        reqValidationResult,
      ]
    }
  }
}

// PRODUCT VALIDATION
const productValidation = method => {
  // eslint-disable-next-line global-require
  const Product = require('../models/product-model')

  switch (method) {
    case 'createProduct': {
      return [
        body('name')
          .isLength({ min: 5 })
          .withMessage('Name needs to be at least 5 characters long.'),
        body('model')
          .isLength({ min: 2 })
          .withMessage('Model needs to be at least 2 characters long.')
          .custom((value, { req: { body: { name } } }) =>
            Product.findOne({ name, model: value }).then(existingProduct => {
              if (existingProduct) {
                return Promise.reject(
                  new ErrorHandler(
                    'Product with provided model already exists.',
                    409
                  )
                )
              }
            })
          ),
        body('color').notEmpty(),
        body('types').isArray({ min: 1 }),
        body('types.*').isIn(PRODUCT_TYPES),
        body('collectionName').isIn(PRODUCT_COLLECTION_NAME),
        body('materials').isArray({ min: 1 }),
        body('materials.*').isIn(PRODUCT_MATERIALS),
        body('mainFeatures').isArray({ min: 1 }),
        // body('mainFeatures.*').isIn(PRODUCT_MAIN_FEATURES),
        body('discount')
          .optional()
          .isInt({ min: 0, max: 100 })
          .withMessage('Discount must be a number between 1 and 100.'),
        body('inStock')
          .isInt({ min: 0 })
          .withMessage('InStock must be a positive number.'),
        body('reviews').optional().isArray({ min: 1 }),
        body('reviews.*').isMongoId(),
        body('specifications').isString(),
        body('price').isFloat({ min: 99.99 }),
        reqValidationResult,
      ]
    }
    case 'updateProduct': {
      return [
        body('name')
          .optional()
          .isLength({ min: 5 })
          .withMessage('Name needs to be at least 5 characters long.'),
        body('model')
          .optional()
          .isLength({ min: 2 })
          .withMessage('Model needs to be at least 2 characters long.')
          .custom((value, { req: { params: { pid }, body: { name } } }) =>
            Product.findOne({ _id: { $ne: pid }, name, model: value }).then(
              existingProduct => {
                if (existingProduct) {
                  return Promise.reject(
                    new ErrorHandler(
                      'Product with provided model already exists.',
                      409
                    )
                  )
                }
              }
            )
          ),
        body('color').optional().notEmpty(),
        body('types').optional().isArray({ min: 1 }),
        body('types.*').isIn(PRODUCT_TYPES),
        body('collectionName').optional().isIn(PRODUCT_COLLECTION_NAME),
        body('materials').optional().isArray({ min: 1 }),
        body('materials.*').isIn(PRODUCT_MATERIALS),
        body('mainFeatures').optional().isArray({ min: 1 }),
        // body('mainFeatures.*').isIn(PRODUCT_MAIN_FEATURES),
        body('discount')
          .optional({ checkFalsy: true })
          .isInt({ min: 0, max: 100 })
          .withMessage('Discount must be a number between 0 and 100.'),
        body('inStock')
          .optional()
          .isInt({ min: 0 })
          .withMessage('InStock must be a positive number.'),
        body('reviews').optional().isArray({ min: 1 }),
        body('reviews.*').isMongoId(),
        body('specifications').optional().isString(),
        body('price').optional().isFloat({ min: 99.99 }),
        reqValidationResult,
      ]
    }
  }
}

// REVIEW VALIDATION
const reviewValidation = method => {
  switch (method) {
    case 'createReview': {
      return [
        body('title').notEmpty().withMessage("Title can't be empty"),
        body('description')
          .isLength({ min: 10, max: 600 })
          .withMessage(
            'Description needs to be between 10 and 600 characters long.'
          ),
        body('score')
          .isFloat({ min: 1, max: 5 })
          .withMessage('Score needs to be a number between 1 and 5.'),
        reqValidationResult,
      ]
    }
    case 'updateReview': {
      return [
        body()
          .custom(value =>
            Object.keys(value).every(key => REVIEW_KEYS.includes(key))
          )
          .withMessage(
            'Unexpected parameters passed, please check your data and try again.'
          ),
        reqValidationResult,
        oneOf(
          [
            body('title')
              .exists()
              .bail()
              .custom((value, { req }) => value !== req.review.title),
            body('description')
              .exists()
              .bail()
              .custom((value, { req }) => value !== req.review.description),
            body('score')
              .exists()
              .bail()
              .custom((value, { req }) => value !== req.review.score),
          ],
          'At least one field needs to be different in order to update existing review.'
        ),
        reqValidationResult,
        body('title').optional().notEmpty().withMessage("Title can't be empty"),
        body('description')
          .optional()
          .isLength({ min: 10, max: 600 })
          .withMessage(
            'Description needs to be between 10 and 600 characters long.'
          ),
        body('score')
          .optional()
          .isFloat({ min: 1, max: 5 })
          .withMessage('Score needs to be a number between 1 and 5.'),
        reqValidationResult,
      ]
    }
  }
}

// ORDER VALIDATION
const orderValidation = method => {
  switch (method) {
    case 'createOrder': {
      return [
        body('items')
          .isArray({ min: 1 })
          .withMessage(
            'Please add one or more products to the cart before you can create an order.'
          ),
        body('address.shipping')
          .notEmpty()
          .withMessage('Please input your shipping address.'),
        body('address.billing')
          .notEmpty()
          .withMessage('Please input your billing address.'),
        reqValidationResult,
      ]
    }
  }
}

module.exports = {
  userValidation,
  productValidation,
  reviewValidation,
  orderValidation,
}
