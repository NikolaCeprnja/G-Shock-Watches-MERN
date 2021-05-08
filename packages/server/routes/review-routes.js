const router = require('express').Router()

const {
  getReviewsByUserId,
  getReviewsByProductId,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews-controller')
const { authJwt } = require('../controllers/auth-controller')
const { reviewValidation } = require('../controllers/req-validation-controller')

const { checkUserPrivileges } = require('../middlewares/auth-middleware')
const { checkReqParamValidity } = require('../middlewares/req-param-middleware')
const { checkPurchasedProducts } = require('../middlewares/users-middleware')
const {
  checkReviewOvnership,
  checkReviewExistence,
} = require('../middlewares/reviews-middleware')

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
