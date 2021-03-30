const { isValidObjectId } = require('mongoose')

const checkReqParamValidity = param => (req, res, next) => {
  const reqParam = req.params[param]

  if (!isValidObjectId(reqParam)) {
    return res
      .status(400)
      .json({ message: `Invalid param passed for ${param}.` })
  }

  return next()
}

module.exports = {
  checkReqParamValidity,
}
