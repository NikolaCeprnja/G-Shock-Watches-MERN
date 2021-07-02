const router = require('express').Router()

const {
  getProducts,
  getLatestProducts,
  getTopRatedProducts,
  getProductById,
  createProduct,
  deleteProduct,
} = require('../controllers/products-controller')
const { authJwt } = require('../controllers/auth-controller')
const {
  productValidation,
} = require('../controllers/req-validation-controller')

const { isAdmin } = require('../middlewares/auth-middleware')
const { checkReqParamValidity } = require('../middlewares/req-param-middleware')

// GET ROUTES
router.get('/', getProducts)

router.get('/latest', getLatestProducts)

router.get('/top-rated', getTopRatedProducts)

router.get('/:pid', checkReqParamValidity('pid'), getProductById)

// POST ROUTES
router.post(
  '/create',
  authJwt,
  isAdmin,
  productValidation('createProduct'),
  createProduct
)

// DELETE ROUTES
router.delete(
  '/:pid',
  authJwt,
  checkReqParamValidity('pid'),
  isAdmin,
  deleteProduct
)

module.exports = router
