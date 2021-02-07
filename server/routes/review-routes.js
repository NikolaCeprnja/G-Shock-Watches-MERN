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
  checkUserPrivileges,
  checkPurchasedProducts,
  checkReviewOvnership,
  checkReviewExistence,
} = require('../controllers/auth-controller')
const { reviewValidation } = require('../controllers/req-validation-controller')

// GET ROUTES
router.get('/users/:uid', authJwt, checkUserPrivileges, getReviewsByUserId)

router.get('/products/:pid', getReviewsByProductId)

// POST ROUTES
router.post(
  '/products/:pid',
  authJwt,
  checkPurchasedProducts,
  checkReviewExistence,
  reviewValidation('createReview'),
  createReview
)

// PUT ROUTES
router.put(
  '/:rid',
  authJwt,
  checkReviewOvnership,
  reviewValidation('updateReview'),
  updateReview
)

// DELETE ROUTES
router.delete('/:rid', authJwt, checkReviewOvnership, deleteReview)

module.exports = router
