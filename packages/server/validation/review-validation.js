const { body, oneOf } = require('express-validator')
const {
  reqValidationResult,
} = require('../controllers/req-validation-controller')
const { REVIEW_KEYS } = require('../models/req-validation-types')

const titleValidation = (updateReview = false) =>
  (value => (updateReview ? value.optional() : value))(body('title'))
    .notEmpty()
    .withMessage("Title can't be empty")

const descriptionValidation = (updateReview = false) =>
  (value => (updateReview ? value.optional() : value))(body('description'))
    .isLength({ min: 10, max: 600 })
    .withMessage('Description needs to be between 10 and 600 characters long.')

const scoreValidation = (updateReview = false) =>
  (value => (updateReview ? value.optional() : value))(body('score'))
    .isFloat({ min: 1, max: 5 })
    .withMessage('Score needs to be a number between 1 and 5.')

const checkPropDifference = propName =>
  body(propName)
    .exists()
    .bail()
    .custom(
      (value, { req }) =>
        value !==
        (propName === 'score'
          ? req.review[propName].value
          : req.review[propName])
    )

// REVIEW VALIDATION
const reviewValidation = method => {
  switch (method) {
    case 'createReview': {
      return [
        titleValidation(),
        descriptionValidation(),
        scoreValidation(),
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
            checkPropDifference('title'),
            checkPropDifference('description'),
            checkPropDifference('score'),
          ],
          'At least one field needs to be different in order to update existing review.'
        ),
        reqValidationResult,
        titleValidation(true),
        descriptionValidation(true),
        scoreValidation(true),
        reqValidationResult,
      ]
    }
  }
}

module.exports = { reviewValidation }
