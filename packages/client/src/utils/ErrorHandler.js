export default class ErrorHandler extends Error {
  constructor(
    message = 'Something went wrong, please try again later.',
    statusCode = 500,
    statusText = 'Server Error',
    options = undefined
  ) {
    super(message, { cause: options?.cause })
    this.status = statusCode
    this.statusText = statusText
    this.redirect = {
      ...(options?.redirect ?? { to: '/', text: 'Back to Home' }),
    }
  }
}
