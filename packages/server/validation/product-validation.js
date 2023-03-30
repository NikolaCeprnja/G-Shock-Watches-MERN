const { body } = require('express-validator')

const Product = require('../models/product-model')
const ErrorHandler = require('../models/error-handler')
const {
  reqValidationResult,
} = require('../controllers/req-validation-controller')
const {
  PRODUCT_TYPES,
  PRODUCT_COLLECTION_NAME,
  PRODUCT_MATERIALS,
  // PRODUCT_MAIN_FEATURES,
} = require('../models/req-validation-types')

const nameValidation = (updateProduct = false) =>
  (value => (updateProduct ? value.optional() : value))(body('name'))
    .isLength({ min: 5 })
    .withMessage('Name needs to be at least 5 characters long.')

const modelValidation = (updateProduct = false) =>
  (value => (updateProduct ? value.optional() : value))(body('model'))
    .isLength({ min: 2 })
    .withMessage('Model needs to be at least 2 characters long.')
    .custom((value, { req: { params: { pid = undefined }, body: { name } } }) =>
      Product.findOne({
        ...(updateProduct && { _id: { $ne: pid } }),
        name,
        model: value,
      }).then(existingProduct => {
        if (existingProduct) {
          return Promise.reject(
            new ErrorHandler('Product with provided model already exists.', 409)
          )
        }
      })
    )

const colorValidation = (updateProduct = false) =>
  (value => (updateProduct ? value.optional() : value))(
    body('color')
  ).notEmpty()

const typesValidation = (updateProduct = false) => [
  (value => (updateProduct ? value.optional() : value))(body('types')).isArray({
    min: 1,
  }),
  body('types.*').isIn(PRODUCT_TYPES),
]

const collectionNameValidation = (updateProduct = false) =>
  (value => (updateProduct ? value.optional() : value))(
    body('collectionName')
  ).isIn(PRODUCT_COLLECTION_NAME)

const materialsValidation = (updateProduct = false) => [
  (value => (updateProduct ? value.optional() : value))(
    body('materials')
  ).isArray({ min: 1 }),
  body('materials.*').isIn(PRODUCT_MATERIALS),
]

const mainFeaturesValidation = (updateProduct = false) => [
  (value => (updateProduct ? value.optional() : value))(
    body('mainFeatures')
  ).isArray({ min: 1 }),
  // body('mainFeatures.*').isIn(PRODUCT_MAIN_FEATURES),
]

const discountValidation = (updateProduct = false) =>
  body('discount')
    .optional(updateProduct && { checkFalsy: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('Discount must be a number between 0 and 100.')

const inStockValidation = (updateProduct = false) =>
  (value => (updateProduct ? value.optional() : value))(body('inStock'))
    .isInt({ min: 0 })
    .withMessage('InStock must be a positive number.')

const reviewsValidation = [
  body('reviews').optional().isArray({ min: 1 }),
  body('reviews.*').isMongoId(),
]

const specificationsValidation = (updateProduct = false) =>
  (value => (updateProduct ? value.optional() : value))(
    body('specifications')
  ).isString()

const priceValidation = (updateProduct = false) =>
  (value => (updateProduct ? value.optional() : value))(body('price')).isFloat({
    min: 99.99,
  })

// PRODUCT VALIDATION
const productValidation = method => {
  switch (method) {
    case 'createProduct': {
      return [
        nameValidation(),
        modelValidation(),
        colorValidation(),
        ...typesValidation(),
        collectionNameValidation(),
        ...materialsValidation(),
        ...mainFeaturesValidation(),
        discountValidation(),
        inStockValidation(),
        ...reviewsValidation,
        specificationsValidation(),
        priceValidation(),
        reqValidationResult,
      ]
    }
    case 'updateProduct': {
      return [
        nameValidation(true),
        modelValidation(true),
        colorValidation(true),
        ...typesValidation(true),
        collectionNameValidation(true),
        ...materialsValidation(true),
        ...mainFeaturesValidation(true),
        discountValidation(true),
        inStockValidation(true),
        ...reviewsValidation,
        specificationsValidation(true),
        priceValidation(true),
        reqValidationResult,
      ]
    }
  }
}

module.exports = { productValidation }
