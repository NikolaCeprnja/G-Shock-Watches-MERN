const router = require('express').Router()

const {
  getReviewsByUserId,
  getReviewsByProductId,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews-controller')
const {
  authJwt,
  checkReqParamValidity,
  checkUserPrivileges,
  checkPurchasedProducts,
  checkReviewOvnership,
  checkReviewExistence,
} = require('../controllers/auth-controller')
const { reviewValidation } = require('../controllers/req-validation-controller')

// GET ROUTES
router.get(
  '/users/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  getReviewsByUserId
)

router.get(
  '/products/:pid',
  checkReqParamValidity('pid'),
  getReviewsByProductId
)

// POST ROUTES
router.post(
  '/products/:pid',
  authJwt,
  checkReqParamValidity('pid'),
  checkPurchasedProducts,
  checkReviewExistence,
  reviewValidation('createReview'),
  createReview
)

// PUT ROUTES
router.put(
  '/:rid',
  authJwt,
  checkReqParamValidity('rid'),
  checkReviewOvnership,
  reviewValidation('updateReview'),
  updateReview
)

// DELETE ROUTES
router.delete(
  '/:rid',
  authJwt,
  checkReqParamValidity('rid'),
  checkReviewOvnership,
  deleteReview
)

module.exports = router
