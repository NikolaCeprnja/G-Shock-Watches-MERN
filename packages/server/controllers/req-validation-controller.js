const { body, oneOf, validationResult } = require('express-validator')

const {
  PRODUCT_TYPES,
  PRODUCT_COLLECTION_NAME,
  PRODUCT_MATERIALS,
  PRODUCT_FUNCTIONS,
  REVIEW_KEYS,
} = require('../models/req-validation-types')
const errorFormater = require('../models/req-validation-error')
const ErrorHandler = require('../models/error-handler')

const reqValidationResult = (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return next(
        new ErrorHandler('Invalid inputs passed, please check your data.', 400)
      )
    }

    validationResult(req).formatWith(errorFormater).throw()

    return next()
  } catch (err) {
    const error = err.mapped()
    console.log(error)

    return res.status(422).json({ ...error })
  }
}

// TODO: add validation to entire body() for each req param

// USER VALIDATION
const userValidation = method => {
  switch (method) {
    case 'userSignup': {
      return [
        body('userName')
          .trim()
          .isLength({ min: 6 })
          .withMessage('username needs to be at least 6 characters long.'),
        body('email')
          .trim()
          .notEmpty()
          .normalizeEmail()
          .isEmail()
          .withMessage('Invalid email address.'),
        body('password')
          .isLength({ min: 6 })
          .withMessage('Passowrd needs to be at least 6 characters long.'),
        body('isAdmin').optional().isBoolean(),
        body('purchasedProducts').optional().isArray({ min: 1 }),
        body('purchasedProducts.*').isMongoId(),
        body('reviews').optional().isArray({ min: 1 }),
        body('reviews.*').isMongoId(),
        reqValidationResult,
      ]
    }
    case 'userSignin': {
      return [
        oneOf(
          [
            body('userNameOrEmail')
              .trim()
              .notEmpty()
              .normalizeEmail()
              .isEmail(),
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
  }
}

// PRODUCT VALIDATION
const productValidation = method => {
  switch (method) {
    case 'createProduct': {
      return [
        body('name')
          .isLength({ min: 5 })
          .withMessage('Name needs to be at least 5 characters long.'),
        body('model')
          .isLength({ min: 2 })
          .withMessage('Model needs to be at least 2 characters long.'),
        body('color').notEmpty(),
        body('types').isArray({ min: 1 }),
        body('types.*').isIn(PRODUCT_TYPES),
        body('collectionName').isIn(PRODUCT_COLLECTION_NAME),
        body('materials').isArray({ min: 1 }),
        body('materials.*').isIn(PRODUCT_MATERIALS),
        body('functions').isArray({ min: 1 }),
        body('functions.*').isIn(PRODUCT_FUNCTIONS),
        body('images').isArray({ min: 1 }),
        body('discount')
          .optional()
          .isInt({ min: 1, max: 100 })
          .withMessage('Discount must be a number between 1 and 100.'),
        body('inStock')
          .isInt({ min: 1 })
          .withMessage('InStock must be a number greater than 0.'),
        body('reviews').optional().isArray({ min: 1 }),
        body('reviews.*').isMongoId(),
        body('specifications').isArray({ min: 1 }),
        body('price').isFloat({ min: 99.99 }),
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
          .isLength({ min: 10, max: 100 })
          .withMessage(
            'Description needs to be between 10 and 100 characters long.'
          ),
        body('score')
          .isInt({ min: 1, max: 5 })
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
          .isLength({ min: 10, max: 100 })
          .withMessage(
            'Description needs to be between 10 and 100 characters long.'
          ),
        body('score')
          .optional()
          .isInt({ min: 1, max: 5 })
          .withMessage('Score needs to be a number between 1 and 5.'),
        reqValidationResult,
      ]
    }
  }
}

module.exports = {
  userValidation,
  productValidation,
  reviewValidation,
}
