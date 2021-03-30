const Review = require('../models/review-model')
const ErrorHandler = require('../models/error-handler')

const checkReviewOvnership = async (req, res, next) => {
  const { rid } = req.params
  let review

  try {
    review = await Review.findById(rid)
  } catch (err) {
    return next(
      new ErrorHandler('Somthing went wrong, please try again later.', 500)
    )
  }

  if (review) {
    if (req.user.isAdmin || req.user.id === review.creator.toString()) {
      req.review = review
      return next()
    }

    return res
      .status(403)
      .json({ message: "You don't have permission to do that." })
  }

  return res
    .status(404)
    .json({ message: 'Review with provided rid does not exists.' })
}

const checkReviewExistence = async (req, res, next) => {
  const { pid } = req.params
  let reviewExists

  try {
    reviewExists = await Review.exists({ creator: req.user.id, product: pid })
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later', 500)
    )
  }

  if (req.user.isAdmin || !reviewExists) {
    return next()
  }

  return res
    .status(422)
    .json({ message: 'Review for product with provided pid already exists.' })
}

module.exports = {
  checkReviewOvnership,
  checkReviewExistence,
}
