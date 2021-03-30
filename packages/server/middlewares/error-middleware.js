const errorPageHandler = (req, res) => {
  res.status(404).json({ message: 'Error, this page does not exists.' })
}

const defaultErrorHandler = (err, req, res, next) => {
  console.error(err)

  if (res.headersSent) {
    return next(err)
  }

  if (err.errors) {
    return res.status(err.statusCode).json({
      errors: { ...err.errors },
    })
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong, please try again later.',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  })
}

module.exports = {
  errorPageHandler,
  defaultErrorHandler,
}
