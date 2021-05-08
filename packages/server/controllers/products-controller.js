const Product = require('../models/product-model')
const ErrorHandler = require('../models/error-handler')

// GET CONTROLLERS
const getProducts = async (req, res, next) => {
  let products

  try {
    products = await Product.find()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (products.length) {
    return res.status(200).json({ message: 'List of all products', products })
  }

  return res
    .status(404)
    .json({ message: 'Currently there is no products yet.' })
}

const getProductById = async (req, res, next) => {
  const { pid } = req.params
  let product

  try {
    product = await Product.findById(pid)
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (product) {
    return res
      .status(200)
      .json({ product: product.toObject({ getters: true }) })
  }

  return res
    .status(404)
    .json({ message: 'Product with provided pid does not exists' })
}

// POST CONTROLLERS
const createProduct = async (req, res, next) => {
  const productData = req.body

  let newProduct
  const product = new Product({
    ...productData,
  })

  try {
    newProduct = await product.save()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  return res.status(201).json({
    createdProduct: newProduct,
    message: 'New product is successfully created!',
  })
}

// DELETE CONTROLLERS
const deleteProduct = async (req, res, next) => {
  const { pid } = req.params
  let product

  try {
    product = await Product.findById(pid)
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (product) {
    try {
      await product.deleteOne()
    } catch (err) {
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }

    return res.status(200).json({
      message: 'Product is successfully deleted!',
      deletedProduct: product.toObject({ getters: true }),
    })
  }

  return res
    .status(404)
    .json({ message: 'Product with provided pid does not exists.' })
}

module.exports = { getProducts, getProductById, createProduct, deleteProduct }
