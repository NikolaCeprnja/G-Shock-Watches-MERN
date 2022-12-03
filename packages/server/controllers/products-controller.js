const mongoose = require('mongoose')
const path = require('path')

const Product = require('../models/product-model')
const Collection = require('../models/collection-model')
const ErrorHandler = require('../models/error-handler')
const { saveFile, removeFile } = require('../utils/fileUpload')

// GET CONTROLLERS
const getProducts = async (req, res, next) => {
  let products
  const showPerPage = Number(req.query.pageSize) || 8
  if (req.query.pageSize) delete req.query.pageSize
  const curPage = (({ page }) => Number(page))(req.query) || 1
  if (req.query.page) delete req.query.page
  const skipNext = showPerPage * (curPage - 1)
  let searchQuery
  if (Object.keys(req.query).includes('searchTerm')) {
    searchQuery = {
      $text: {
        $search: req.query.searchTerm,
        $language: 'none',
        $diacriticSensitive: true,
      },
    }
  }
  const collectionQuery = {}
  if (req.query.collectionName) {
    collectionQuery.name = {
      $in: Array.isArray(req.query.collectionName)
        ? req.query.collectionName
        : [req.query.collectionName],
    }
  }
  if (req.query.gender) {
    collectionQuery.gender = req.query.gender
  }
  const totalProducts = await Collection.aggregate([
    { $match: { ...collectionQuery } },
    {
      $lookup: {
        from: 'products',
        let: { products: '$products' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$_id', '$$products'] },
              ...searchQuery,
            },
          },
          { $count: 'count' },
        ],
        as: 'products',
      },
    },
    { $unwind: '$products' },
    { $group: { _id: null, count: { $sum: '$products.count' } } },
  ])
  let sortBy

  if (req.query.sortBy) {
    sortBy = JSON.parse(req.query.sortBy)

    if (Object.keys(sortBy)[0] === 'numReviews') {
      sortBy = {
        'data.avgRating': Object.values(sortBy)[0] === 'ascend' ? 1 : -1,
        [`data.${Object.keys(sortBy)[0]}`]:
          Object.values(sortBy)[0] === 'ascend' ? 1 : -1,
      }
    } else {
      sortBy = {
        [`data.${Object.keys(sortBy)[0]}`]:
          Object.values(sortBy)[0] === 'ascend' ? 1 : -1,
      }
    }
  }

  try {
    products = await Collection.aggregate([
      { $match: { ...collectionQuery } },
      {
        $lookup: {
          from: 'products',
          let: { products: '$products', gender: '$gender' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$products'] },
                ...searchQuery,
              },
            },
            {
              $lookup: {
                from: 'reviews',
                localField: 'reviews',
                foreignField: '_id',
                as: 'reviews',
              },
            },
            {
              $project: {
                _id: 0,
                id: '$_id',
                name: 1,
                model: 1,
                gender: '$$gender',
                collectionName: 1,
                previewImg: 1,
                discount: {
                  $cond: {
                    if: { $ne: ['$discount', 0] },
                    then: '$discount',
                    else: '$$REMOVE',
                  },
                },
                inStock: 1,
                price: 1,
                numReviews: {
                  $cond: {
                    if: { $ne: [{ $size: '$reviews' }, 0] },
                    then: { $size: '$reviews' },
                    else: '$$REMOVE',
                  },
                },
                avgRating: {
                  $cond: {
                    if: { $eq: ['$reviews', []] },
                    then: '$$REMOVE',
                    else: { $avg: '$reviews.score' },
                  },
                },
                createdAt: {
                  $dateToString: {
                    format: '%d/%m/%Y',
                    date: '$createdAt',
                  },
                },
              },
            },
          ],
          as: 'data',
        },
      },
      { $unwind: '$data' },
      { $skip: skipNext },
      { $limit: showPerPage },
      {
        $sort: sortBy || { 'data.createdAt': -1, 'data.id': -1 },
      },
      {
        $group: {
          _id: null,
          data: { $push: '$data' },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ])
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (products.length > 0) {
    return res.status(200).json({
      message: 'List of all products',
      curPage,
      pageSize: showPerPage,
      products: products[0].data,
      totalProducts: totalProducts[0].count,
    })
  }

  return res.status(404).json({
    message:
      'No items were found matching this combination of selected filters.',
  })
}

const getTotalProductsCount = async (req, res, next) => {
  let totalProducts

  try {
    totalProducts = await Product.find({}).countDocuments()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  return res
    .status(200)
    .json({ message: 'Total product documents count', totalProducts })
}

const getLatestProducts = async (req, res, next) => {
  let latestProducts

  try {
    latestProducts = await Product.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: 'collections',
          localField: 'collectionName',
          foreignField: 'name',
          as: 'collection',
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: 'reviews',
          foreignField: '_id',
          as: 'reviews',
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          model: 1,
          gender: { $arrayElemAt: ['$collection.gender', 0] },
          collectionName: 1,
          previewImg: 1,
          discount: {
            $cond: {
              if: { $ne: ['$discount', 0] },
              then: '$discount',
              else: '$$REMOVE',
            },
          },
          inStock: 1,
          price: 1,
          numReviews: {
            $cond: {
              if: { $ne: [{ $size: '$reviews' }, 0] },
              then: { $size: '$reviews' },
              else: '$$REMOVE',
            },
          },
          avgRating: {
            $cond: {
              if: { $eq: ['$reviews', []] },
              then: '$$REMOVE',
              else: { $avg: '$reviews.score' },
            },
          },
        },
      },
    ])
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (latestProducts.length) {
    return res
      .status(200)
      .json({ message: 'List of latest products', latestProducts })
  }

  return res
    .status(404)
    .json({ message: 'Currently there is no products yet.' })
}

const getTopRatedProducts = async (req, res, next) => {
  let topRatedProducts

  try {
    topRatedProducts = await Product.aggregate([
      { $limit: 8 },
      { $match: { $expr: { $ne: [{ $size: '$reviews' }, 0] } } },
      {
        $lookup: {
          from: 'collections',
          localField: 'collectionName',
          foreignField: 'name',
          as: 'collection',
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: 'reviews',
          foreignField: '_id',
          as: 'reviews',
        },
      },
      { $match: { $expr: { $gte: [{ $avg: '$reviews.score' }, 3.5] } } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          model: 1,
          gender: { $arrayElemAt: ['$collection.gender', 0] },
          collectionName: 1,
          previewImg: 1,
          discount: {
            $cond: {
              if: { $ne: ['$discount', 0] },
              then: '$discount',
              else: '$$REMOVE',
            },
          },
          inStock: 1,
          price: 1,
          numReviews: {
            $size: '$reviews',
          },
          avgRating: {
            $avg: '$reviews.score',
          },
        },
      },
      { $sort: { avgRating: -1, numReviews: -1 } },
    ])
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (topRatedProducts.length) {
    return res
      .status(200)
      .json({ message: 'List of top rated products', topRatedProducts })
  }

  return res
    .status(404)
    .json({ message: 'Currently there is no products yet.' })
}

const getProductById = async (req, res, next) => {
  const { pid } = req.params
  let product

  try {
    product = await Product.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(pid) } },
      {
        $lookup: {
          from: 'collections',
          localField: 'collectionName',
          foreignField: 'name',
          as: 'collection',
        },
      },
      {
        $lookup: {
          from: 'reviews',
          let: { reviews: '$reviews' },
          pipeline: [
            {
              $match: { $expr: { $in: ['$_id', '$$reviews'] } },
            },
            { $sort: { createdAt: -1 } },
            // { $limit: 1 },
            {
              $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creator',
              },
            },
          ],
          as: 'reviews',
        },
      },
      {
        $lookup: {
          from: 'products',
          let: { id: '$_id', name: '$name' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$_id', '$$id'] },
                    { $eq: ['$name', '$$name'] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: '$_id',
                name: 1,
                model: 1,
                previewImg: 1,
              },
            },
          ],
          as: 'otherColors',
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          model: 1,
          gender: { $arrayElemAt: ['$collection.gender', 0] },
          desc: 1,
          color: 1,
          types: 1,
          collectionName: 1,
          materials: 1,
          mainFeatures: 1,
          specifications: 1,
          previewImg: 1,
          images: 1,
          discount: {
            $cond: {
              if: { $ne: ['$discount', 0] },
              then: '$discount',
              else: '$$REMOVE',
            },
          },
          inStock: 1,
          reviews: {
            $map: {
              input: '$reviews',
              as: 'review',
              in: {
                id: '$$review._id',
                title: '$$review.title',
                desc: '$$review.description',
                score: '$$review.score',
                createdAt: {
                  $dateToString: {
                    format: '%d/%m/%Y',
                    date: '$$review.createdAt',
                  },
                },
                creator: {
                  id: { $arrayElemAt: ['$$review.creator._id', 0] },
                  userName: { $arrayElemAt: ['$$review.creator.userName', 0] },
                  avatarUrl: {
                    $arrayElemAt: ['$$review.creator.avatarUrl', 0],
                  },
                },
              },
            },
          },
          price: 1,
          otherColors: {
            $cond: {
              if: { $eq: ['$otherColors', []] },
              then: '$$REMOVE',
              else: '$otherColors',
            },
          },
          numReviews: {
            $cond: {
              if: { $ne: [{ $size: '$reviews' }, 0] },
              then: { $size: '$reviews' },
              else: '$$REMOVE',
            },
          },
          avgRating: {
            $cond: {
              if: { $eq: ['$reviews', []] },
              then: '$$REMOVE',
              else: { $avg: '$reviews.score' },
            },
          },
        },
      },
    ])
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (product[0]) {
    return res.status(200).json({ product: product[0] })
  }

  return res
    .status(404)
    .json({ message: 'Product with provided pid does not exists' })
}

// POST CONTROLLERS
const createProduct = async (req, res, next) => {
  // TODO: add validation for uploaded files
  const {
    files: {
      previewImg: [previewImg],
      'images[]': images,
    },
    body: { collectionName, specifications, ...productData },
  } = req

  let newProduct
  const product = new Product({
    ...productData,
    collectionName,
    specifications: specifications.split(/\n/),
  })

  try {
    const session = await mongoose.startSession()
    session.startTransaction()
    newProduct = await product.save({ session })
    const collection = await Collection.findOne({
      name: collectionName,
    }).session(session)
    collection.products.push(product)
    await collection.save()
    await session.commitTransaction()
    session.endSession()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (previewImg && images) {
    const imagesPaths = []
    const previewImgFileName = previewImg.originalName
    const previewImgFilePath = `${__dirname}/../public/images/products/${previewImgFileName}`

    try {
      await saveFile(previewImg, previewImgFilePath)

      images.forEach(async file => {
        const fileName = file.originalName
        imagesPaths.push(`/images/products/${fileName}`)
        const filePath = `${__dirname}/../public/images/products/${fileName}`
        await saveFile(file, filePath)
      })
    } catch (err) {
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }

    product.previewImg = `/images/products/${previewImgFileName}`
    product.images = imagesPaths

    try {
      // update previewImg and images path properties after saving files locally
      await Product.findByIdAndUpdate(
        newProduct.id,
        {
          $set: {
            previewImg: product.previewImg,
            images: product.images,
          },
        },
        {
          useFindAndModify: false,
        }
      )
    } catch (err) {
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }
  }

  return res.status(201).json({
    createdProduct: newProduct,
    message: 'New product is successfully created!',
  })
}

// PUT CONTROLLERS
const updateProduct = async (req, res, next) => {
  const { pid } = req.params
  const {
    files: {
      previewImg: [newUploadedPreviewImg],
      'images[]': newUploadedImages,
    },
    body: {
      previewImg: [existingPreviewImg] = '',
      images: existingImages = [],
      collectionName,
      specifications,
      removedFileList = [],
      ...productData
    },
  } = req
  const options = {
    new: true,
    lean: true,
    useFindAndModify: false,
    populate: 'reviews',
    projection: {
      _id: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    },
  }
  let productToUpdate
  let updatedProduct
  let previousCollection
  let previewImgFileName
  let updatedPreviewImg
  let updatedImagesPaths

  try {
    productToUpdate = await Product.findById(pid, 'images previewImg')
    updatedImagesPaths = productToUpdate.images

    if (newUploadedPreviewImg) {
      previewImgFileName = newUploadedPreviewImg.originalName
      const previewImgFilePath = `${__dirname}/../public/images/products/${previewImgFileName}`

      await saveFile(newUploadedPreviewImg, previewImgFilePath)

      updatedImagesPaths.unshift(productToUpdate.previewImg)
      updatedPreviewImg = `/images/products/${previewImgFileName}`
    } else if (
      existingPreviewImg &&
      existingPreviewImg !== productToUpdate.previewImg
    ) {
      updatedImagesPaths = updatedImagesPaths.filter(
        imgPath => imgPath !== existingPreviewImg
      )
      updatedImagesPaths.unshift(productToUpdate.previewImg)
    }

    if (newUploadedImages.length > 0) {
      newUploadedImages.forEach(async file => {
        const fileName = file.originalName
        updatedImagesPaths.push(`/images/products/${fileName}`)
        const filePath = `${__dirname}/../public/images/products/${fileName}`
        await saveFile(file, filePath)
      })
    }

    if (removedFileList) {
      removedFileList.forEach(async fileToRemove => {
        try {
          await removeFile(`${__dirname}/../public${fileToRemove}`)
        } catch (error) {
          console.log({ error })
        }
      })
      updatedImagesPaths = updatedImagesPaths.filter(
        imgPath => !removedFileList.includes(imgPath)
      )
    }

    previousCollection = await Collection.findOne(
      { products: pid },
      'name products'
    )

    if (previousCollection.name !== collectionName) {
      const session = await mongoose.startSession()
      session.startTransaction()
      previousCollection.products = previousCollection.products.filter(
        productId => productId.toString() !== pid
      )
      await previousCollection.save({ session })
      updatedProduct = await Product.findByIdAndUpdate(
        pid,
        {
          $set: {
            ...productData,
            collectionName,
            previewImg: updatedPreviewImg || existingPreviewImg,
            images: updatedImagesPaths,
            specifications: specifications.split(/\n/),
          },
        },
        {
          ...options,
          session,
        }
      )
      const newCollection = await Collection.findOne({
        name: collectionName,
      }).session(session)
      newCollection.products.push(pid)
      await newCollection.save()
      await session.commitTransaction()
      session.endSession()
    } else {
      updatedProduct = await Product.findByIdAndUpdate(
        pid,
        {
          $set: {
            ...productData,
            collectionName,
            previewImg: updatedPreviewImg || existingPreviewImg,
            images: updatedImagesPaths,
            specifications: specifications.split(/\n/),
          },
        },
        options
      )
    }
  } catch (err) {
    return next(
      new ErrorHandler(
        'Something went wrong while updating the product, please try again later.',
        500
      )
    )
  }

  if (updatedProduct) {
    return res.status(200).json({
      message: 'Product is successfully updated!',
      updatedProduct,
    })
  }

  return res
    .status(404)
    .json({ message: 'Product with provided pid does not exists' })
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
      await removeFile(path.join(__dirname, '/../public', product.previewImg))
      product.images.forEach(async filePath => {
        await removeFile(path.join(__dirname, '/../public', filePath))
      })
    } catch (err) {
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }

    return res.status(200).json({
      message: 'Product is successfully deleted!',
      deletedProduct: product.toObject(),
    })
  }

  return res
    .status(404)
    .json({ message: 'Product with provided pid does not exists.' })
}

module.exports = {
  getProducts,
  getTotalProductsCount,
  getLatestProducts,
  getTopRatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}
