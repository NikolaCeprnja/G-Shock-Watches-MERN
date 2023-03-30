const { body } = require('express-validator')
const {
  reqValidationResult,
} = require('../controllers/req-validation-controller')

const itemsValidation = body('items')
  .isArray({ min: 1 })
  .withMessage(
    'Please add one or more products to the cart before you can create an order.'
  )

const additionalEmailValidation = body('email')
  .optional()
  .if(value => value)
  .trim()
  .notEmpty()
  .withMessage("Email can't be empty")
  .isEmail()
  .withMessage('Invalid email address.')

const addressValidation = [
  body('address.shipping')
    .notEmpty()
    .withMessage('Please input your shipping address.'),
  body('address.billing')
    .notEmpty()
    .withMessage('Please input your billing address.'),
]

// ORDER VALIDATION
const orderValidation = method => {
  switch (method) {
    case 'createOrder': {
      return [
        itemsValidation,
        additionalEmailValidation,
        ...addressValidation,
        reqValidationResult,
      ]
    }
  }
}

module.exports = { orderValidation }
