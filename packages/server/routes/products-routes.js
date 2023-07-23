const router = require('express').Router()
const multer = require('multer')

const upload = multer()

const {
  getProducts,
  getTotalProductsCount,
  getLatestProducts,
  getTopRatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products-controller')
const { authJwt } = require('../controllers/auth-controller')

const { isAdmin } = require('../middlewares/auth-middleware')
const { checkReqParamValidity } = require('../middlewares/req-param-middleware')

const { productValidation } = require('../validation/product-validation')

// GET ROUTES
/** @method GET @access PUBLIC @desc Get all products. */
router.get('/', getProducts)

/** @method GET @access PRIVATE @desc Get total product documents count */
router.get('/count', authJwt, isAdmin, getTotalProductsCount)

/** @method GET @access PUBLIC @desc Get latest products. */
router.get('/latest', getLatestProducts)

/** @method GET @access PUBLIC @desc Get top rated products. */
router.get('/top-rated', getTopRatedProducts)

/** @method GET @access PUBLIC @desc Get product by its pid. */
router.get('/:pid', checkReqParamValidity('pid'), getProductById)

// POST ROUTES
/** @method POST @access PRIVATE @desc Create new product. */
router.post(
  '/create',
  authJwt,
  isAdmin,
  upload.fields([
    { name: 'images[]', maxCount: 5 },
    { name: 'previewImg', maxCount: 1 },
  ]),
  productValidation('createProduct'),
  createProduct
)

// PUT ROUTES
/** @method PUT @access PRIVATE @desc Update existing product by its pid. */
router.put(
  '/:pid',
  authJwt,
  isAdmin,
  checkReqParamValidity('pid'),
  upload.fields([
    { name: 'images[]', maxCount: 5 },
    { name: 'previewImg', maxCount: 1 },
  ]),
  productValidation('updateProduct'),
  updateProduct
)

// DELETE ROUTES
/** @method DELETE @access PRIVATE @desc Delete product by its pid. */
router.delete(
  '/:pid',
  authJwt,
  isAdmin,
  checkReqParamValidity('pid'),
  deleteProduct
)

module.exports = router
