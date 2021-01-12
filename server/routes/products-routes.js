const router = require('express').Router()

const {
  getProducts,
  getProductById,
  createProduct,
} = require('../controllers/products-controller')
const { authJwt } = require('../auth/auth')
const {
  productValidation,
} = require('../controllers/req-validation-controller')

// GET ROUTES
router.get('/', getProducts)
router.get('/:pid', getProductById)

// POST ROUTES
router.post(
  '/create',
  authJwt,
  productValidation('createProduct'),
  createProduct
)

module.exports = router
