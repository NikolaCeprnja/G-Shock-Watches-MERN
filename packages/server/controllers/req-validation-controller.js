const { validationResult } = require('express-validator')

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

module.exports = {
  reqValidationResult,
}
