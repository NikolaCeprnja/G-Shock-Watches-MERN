const router = require('express').Router()

const {
  getReviewsByUserId,
  getReviewsByProductId,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews-controller')
const { authJwt } = require('../controllers/auth-controller')

const { checkUserPrivileges } = require('../middlewares/auth-middleware')
const { checkReqParamValidity } = require('../middlewares/req-param-middleware')
const { checkPurchasedProducts } = require('../middlewares/users-middleware')
const {
  checkReviewOvnership,
  checkReviewExistence,
} = require('../middlewares/reviews-middleware')

const { reviewValidation } = require('../validation/review-validation')

// GET ROUTES
/** @method GET @access PRIVATE @desc Get all reviews for specific user by its uid. */
router.get(
  '/users/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  getReviewsByUserId
)

/** @method GET @access PUBLIC @desc Get all reviews for specific product by its pid.  */
router.get(
  '/products/:pid',
  checkReqParamValidity('pid'),
  getReviewsByProductId
)

// POST ROUTES
/** @method POST @access PRIVATE @desc Create review for purchased product with its pid by currently logged in user. */
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
/** @method PUT @access PRIVATE @desc Update review with provided rid. */
router.put(
  '/:rid',
  authJwt,
  checkReqParamValidity('rid'),
  checkReviewOvnership,
  reviewValidation('updateReview'),
  updateReview
)

// DELETE ROUTES
/** @method DELETE @access PRIVATE @desc Delete review with provided rid. */
router.delete(
  '/:rid',
  authJwt,
  checkReqParamValidity('rid'),
  checkReviewOvnership,
  deleteReview
)

module.exports = router
