const { body, oneOf } = require('express-validator')

const VALIDATION_TYPES = require('../models/req-validation-types')

// USER VALIDATION
const userValidation = method => {
  switch (method) {
    case 'userSignup': {
      return [
        body('userName').trim().isLength({ min: 6 }),
        body('email').trim().notEmpty().normalizeEmail().isEmail(),
        body('password').isLength({ min: 6 }),
        body('isAdmin').optional().isBoolean(),
        body('purchasedProducts').optional().isArray({ min: 1 }),
        body('purchasedProducts.*').isMongoId(),
        body('reviews').optional().isArray({ min: 1 }),
        body('reviews.*').isMongoId(),
      ]
    }
    case 'userSignin': {
      return [
        oneOf([
          body('userNameOrEmail').trim().notEmpty().normalizeEmail().isEmail(),
          body('userNameOrEmail').trim().isLength({ min: 6 }),
        ]),
        body('password').isLength({ min: 6 }),
      ]
    }
  }
}

// PRODUCT VALIDATION
const productValidation = method => {
  switch (method) {
    case 'createProduct': {
      return [
        body('name').isLength({ min: 5 }),
        body('model').isLength({ min: 2 }),
        body('color').notEmpty(),
        body('types').isArray({ min: 1 }),
        body('types.*').isIn(VALIDATION_TYPES.PRODUCT_TYPES),
        body('collectionName').isIn(VALIDATION_TYPES.PRODUCT_COLLECTION_NAME),
        body('materials').isArray({ min: 1 }),
        body('materials.*').isIn(VALIDATION_TYPES.PRODUCT_MATERIALS),
        body('functions').isArray({ min: 1 }),
        body('functions.*').isIn(VALIDATION_TYPES.PRODUCT_FUNCTIONS),
        body('images').isArray({ min: 1 }),
        body('discount').optional().isInt({ min: 1, max: 100 }),
        body('inStock').isInt({ min: 1 }),
        body('reviews').optional().isArray({ min: 1 }),
        body('reviews.*').isMongoId(),
        body('specifications').isArray({ min: 1 }),
        body('price').isFloat({ min: 99.99 }),
        body('created').optional().isDate(),
      ]
    }
  }
}

module.exports = { userValidation, productValidation }
