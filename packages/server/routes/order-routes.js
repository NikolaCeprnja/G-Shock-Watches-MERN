const router = require('express').Router()

const {
  getOrders,
  getTotalOrdersCount,
  getTotalOrdersSales,
  getOrderById,
  getOrdersByUserId,
  getOrdersByProductId,
  createOrder,
  updateOrder,
} = require('../controllers/orders-contoller')
const { authJwt } = require('../controllers/auth-controller')

const { isAdmin } = require('../middlewares/auth-middleware')
const { checkReqParamValidity } = require('../middlewares/req-param-middleware')
const {
  checkProductsStockAvailability,
  calculateTotalOrderAmount,
} = require('../middlewares/products-middleware')
const { checkOrderOvnership } = require('../middlewares/order-middleware')

const { orderValidation } = require('../validation/order-validation')

// GET ROUTES
/** @method GET @access PRIVATE @desc Get all orders. */
router.get('/', authJwt, isAdmin, getOrders)

/** @method GET @access PRIVATE @desc Get total order doucments count */
router.get('/count', authJwt, isAdmin, getTotalOrdersCount)

/** @method GET @access PRIVATE @desc Get total orders sales */
router.get('/total-sales', authJwt, isAdmin, getTotalOrdersSales)

/** @method GET @access PRIVATE @desc Get an order by provided oid. */
router.get(
  '/:oid',
  authJwt,
  checkReqParamValidity('oid'),
  checkOrderOvnership,
  getOrderById
)

/** @method GET @access PRIVATE @desc Get all orders for user with provided uid. */
router.get(
  '/users/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  getOrdersByUserId
)

/** @method GET @access PRIVATE @desc Get all orders for product with provied pid. */
router.get(
  '/products/:pid',
  authJwt,
  isAdmin,
  checkReqParamValidity('pid'),
  getOrdersByProductId
)

// POST ROUTES
/** @method POST @access PRIVATE @desc Create new order. */
router.post(
  '/create',
  authJwt,
  orderValidation('createOrder'),
  checkProductsStockAvailability,
  calculateTotalOrderAmount,
  createOrder
)

// PUT ROUTES
/** @method PUT @access PRIVATE @desc Update order which has specific oid. */
router.put(
  '/:oid',
  authJwt,
  checkReqParamValidity('oid'),
  checkOrderOvnership,
  updateOrder
)


module.exports = router
