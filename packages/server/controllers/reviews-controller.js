const mongoose = require('mongoose')

const User = require('../models/user-model')
const Review = require('../models/review-model')
const Product = require('../models/product-model')
const ErrorHandler = require('../models/error-handler')

// GET CONTROLLERS
const getReviewsByUserId = async (req, res, next) => {
  const { uid } = req.params
  let userReviews

  try {
    userReviews = await User.findById(uid).populate('reviews')
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (!userReviews) {
    return next(
      new ErrorHandler('User with provided uid does not exists.', 404)
    )
  }

  if (!userReviews.reviews.length) {
    return next(new ErrorHandler('User has no reviews yet.', 404))
  }

  return res.status(200).json({
    message: `List of all ${userReviews.userName} reviews`,
    reviews: userReviews.reviews,
  })
}

const getReviewsByProductId = async (req, res, next) => {
  const { pid } = req.params
  let productReviews

  try {
    productReviews = await Product.findById(pid).populate('reviews')
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (!productReviews) {
    return next(
      new ErrorHandler('Product with provided pid does not exists.', 404)
    )
  }

  if (!productReviews.reviews.length) {
    return next(new ErrorHandler('Product has no reviews yet.', 404))
  }

  return res.status(200).json({
    message: `List of all reviews for ${productReviews.name}-${productReviews.model}`,
    reviews: productReviews.reviews,
  })
}

// POST CONTROLLERS
const createReview = async (req, res, next) => {
  const { pid } = req.params
  const uid = req.user.id
  const reviewData = req.body

  let newReview
  const review = new Review({ ...reviewData, creator: uid, product: pid })

  try {
    const session = await mongoose.startSession()
    session.startTransaction()
    newReview = await review.save({ session })
    const creator = await User.findById(uid).session(session)
    creator.reviews.push(review)
    await creator.save()
    const product = await Product.findById(pid).session(session)
    product.reviews.push(review)
    await product.save()
    await session.commitTransaction()
    session.endSession()
  } catch (err) {
    return next(
      new ErrorHandler('Smething went wrong, please try again later', 500)
    )
  }

  return res.status(201).json({
    message: 'Review is successfully created.',
    createdReview: newReview,
  })
}

// PUT CONTROLLERS
const updateReview = async (req, res, next) => {
  const { rid } = req.params

  let updatedReview

  try {
    updatedReview = await Review.findByIdAndUpdate(
      rid,
      { $set: req.body },
      {
        lean: true,
        returnOriginal: false,
        useFindAndModify: false,
        // populate: 'creator',
        projection: {
          _id: 0,
          id: '$_id',
          productId: '$product',
          title: 1,
          desc: '$description',
          score: 1,
          createdAt: {
            $dateToString: {
              format: '%d/%m/%Y',
              date: '$createdAt',
            },
          },
        },
      }
    )
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (updatedReview) {
    return res.status(200).json({
      message: 'Review is successfully updated.',
      updatedReview,
    })
  }

  return res
    .status(404)
    .json({ message: 'Review with provided rid does not exists.' })
}

// DELETE CONTROLLERS
const deleteReview = async (req, res, next) => {
  const { rid } = req.params
  let review

  try {
    review = await Review.findById(rid)
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (review) {
    try {
      await review.deleteOne()
    } catch (err) {
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }

    return res.status(200).json({
      message: 'Review is successfully deleted!',
      deletedReview: review.toObject(),
    })
  }

  return res
    .status(404)
    .json({ message: 'Review with provided rid does not exists.' })
}

module.exports = {
  getReviewsByUserId,
  getReviewsByProductId,
  createReview,
  updateReview,
  deleteReview,
}
