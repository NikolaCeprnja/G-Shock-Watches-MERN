const Order = require('../models/order-model')
const ErrorHandler = require('../models/error-handler')

// GET CONTOLLERS
const getOrders = async (req, res, next) => {
  let orders
  const showPerPage = Number(req.query.pageSize) || 8
  if (req.query.pageSize) delete req.query.pageSize
  const curPage = (({ page }) => Number(page))(req.query) || 1
  if (req.query.page) delete req.query.page
  const skipNext = showPerPage * (curPage - 1)

  let searchQuery
  if (Object.keys(req.query).includes('searchTerm')) {
    searchQuery = {
      $eq: ['$_id', { $toObjectId: req.query.searchTerm }],
    }
  }
  let matchQuery = {}
  if (req.query.uid) {
    matchQuery = {
      $eq: ['$customer', { $toObjectId: req.query.uid }],
    }
  }

  if (req.query.status) {
    matchQuery = {
      $in: [{ $arrayElemAt: ['$status.info', -1] }, req.query.status],
    }
  }

  const operator = matchQuery && searchQuery ? '$and' : '$or'

  let totalOrders
  try {
    totalOrders = await Order.find({
      $expr: {
        [operator]: [matchQuery, searchQuery],
      },
    }).countDocuments()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  let sortBy
  if (req.query.sortBy) {
    sortBy = JSON.parse(req.query.sortBy)
    sortBy[Object.keys(sortBy)[0]] =
      Object.values(sortBy)[0] === 'ascend' ? 1 : -1
  }

  try {
    orders = await Order.aggregate([
      {
        $match: {
          $expr: {
            [operator]: [matchQuery, searchQuery],
          },
        },
      },
      {
        $sort: sortBy || { createdAt: -1 },
      },
      { $skip: skipNext },
      { $limit: showPerPage },
      {
        $lookup: {
          from: 'users',
          let: { customer: '$customer' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$customer'] },
              },
            },
            {
              $project: {
                _id: 0,
                id: '$_id',
                userName: 1,
                avatarUrl: 1,
                cloudinaryUrl: 1,
                accounts: 1,
              },
            },
          ],
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      { $unwind: '$orderedProducts' },
      {
        $lookup: {
          from: 'products',
          let: { orderedProduct: '$orderedProducts' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$orderedProduct.id'] } } },
            {
              $project: {
                _id: 0,
                id: '$_id',
                orderedQuantity: '$$orderedProduct.quantity',
              },
            },
          ],
          as: 'orderedProducts',
        },
      },
      { $unwind: '$orderedProducts' },
      {
        $group: {
          _id: '$_id',
          status: { $first: { $last: '$status' } },
          customer: { $first: '$customer' },
          totalAmount: { $first: '$totalAmount' },
          orderedProducts: { $push: '$orderedProducts' },
          createdAt: { $first: '$createdAt' },
        },
      },
      {
        $addFields: {
          totalProducts: { $sum: '$orderedProducts.orderedQuantity' },
        },
      },
      {
        $sort: sortBy || { createdAt: -1 },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          status: 1,
          customer: 1,
          totalAmount: 1,
          totalProducts: 1,
          createdAt: {
            $dateToString: {
              format: '%d/%m/%Y - %H:%M:%S',
              date: '$createdAt',
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

  if (orders.length > 0) {
    return res.status(200).json({
      message: 'List of all orders',
      curPage,
      pageSize: showPerPage,
      orders,
      totalOrders,
    })
  }

  return res.status(404).json({
    message:
      'No items were found matching this combination of selected filters.',
  })
}

module.exports = {
  getOrders,
}
