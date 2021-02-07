const router = require('express').Router()

const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
} = require('../controllers/products-controller')
const { authJwt, isAdmin } = require('../controllers/auth-controller')
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
  isAdmin,
  productValidation('createProduct'),
  createProduct
)

// DELETE ROUTES
router.delete('/:pid', authJwt, isAdmin, deleteProduct)

module.exports = router
