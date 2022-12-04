const mongoose = require('mongoose')
const Product = require('../models/product-model')
const ErrorHandler = require('../models/error-handler')

const checkProductsStockAvailability = async (req, res, next) => {
  let product
  let unavailableProducts
  const { items } = req.body
  const orderedProducts = []

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const { id: productId, quantity } of items) {
      product = Product.findById(productId)
        .where('inStock')
        .lt(quantity)
        .select('_id, inStock')

      orderedProducts.push(product)
    }

    unavailableProducts = await Promise.all(orderedProducts).then(products =>
      products.filter(Boolean)
    )
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (unavailableProducts.length > 0) {
    return res.status(403).json({
      message: 'List of currently unavailable products',
      unavailableProducts,
    })
  }

  return next()
}

const calculateTotalOrderAmount = async (req, res, next) => {
  let product
  let totalAmount
  const { items } = req.body
  const calculatedProductsPrice = []

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const { id: productId, quantity } of items) {
      product = Product.aggregate([
        {
          $match: {
            $expr: { $eq: ['$_id', mongoose.Types.ObjectId(productId)] },
          },
        },
        {
          $project: {
            id: 1,
            currentPrice: {
              $cond: {
                if: { $ne: ['$discount', 0] },
                then: {
                  $toDouble: {
                    $multiply: [
                      {
                        $subtract: [
                          '$price',
                          {
                            $multiply: [
                              { $divide: ['$discount', 100] },
                              '$price',
                            ],
                          },
                        ],
                      },
                      quantity,
                    ],
                  },
                },
                else: { $toDouble: { $multiply: ['$price', quantity] } },
              },
            },
          },
        },
      ])

      calculatedProductsPrice.push(product)
    }

    totalAmount = await Promise.all(calculatedProductsPrice).then(value =>
      [].concat(...value).reduce((acc, prod) => acc + prod.currentPrice, 0)
    )

    req.totalAmount = totalAmount
    return next()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }
}

module.exports = { checkProductsStockAvailability, calculateTotalOrderAmount }
