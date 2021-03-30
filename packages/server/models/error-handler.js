class ErrorHandler extends Error {
  constructor(
    message = 'Server error, something went wrong, please try again later.',
    errorCode = 500,
    errors = undefined
  ) {
    super(message)
    this.statusCode = errorCode
    this.errors = errors
  }
}

module.exports = ErrorHandler
