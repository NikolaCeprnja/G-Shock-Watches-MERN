/* eslint-disable no-loop-func */
const mongoose = require('mongoose')
const Order = require('../models/order-model')
const User = require('../models/user-model')
const Product = require('../models/product-model')
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

const getTotalOrdersCount = async (req, res, next) => {
  let totalOrders

  try {
    totalOrders = await Order.find({}).countDocuments()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  return res
    .status(200)
    .json({ message: 'Total order documents count', totalOrders })
}

const getTotalOrdersSales = async (req, res, next) => {
  let totalSales
  let totalOrdersCount
  let totalSalesPeriod
  const MONTHS_ARRAY = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const TODAY = new Date()
  const { period } = req.query

  switch (period) {
    case 'today': {
      totalSalesPeriod = {
        $expr: {
          $eq: [{ $dayOfMonth: '$status.date' }, { $dayOfMonth: TODAY }],
        },
      }
      break
    }
    case 'last-week': {
      totalSalesPeriod = {
        $expr: {
          $gte: [
            '$status.date',
            {
              $dateFromString: {
                dateString: new Date(
                  TODAY.getTime() - 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
              },
            },
          ],
        },
      }
      break
    }
    case 'last-month': {
      totalSalesPeriod = {
        $expr: {
          $eq: [
            { $month: '$status.date' },
            { $subtract: [{ $month: TODAY }, 1] },
          ],
        },
      }
      break
    }
    case 'last-six-months': {
      totalSalesPeriod = {
        $expr: {
          $gte: [
            { $month: '$status.date' },
            { $subtract: [{ $month: TODAY }, 6] },
          ],
        },
      }
    }
  }

  try {
    totalOrdersCount = await Order.aggregate([
      {
        $match: { 'status.info': { $nin: ['canceled', 'returned'] } },
      },
      { $unwind: '$status' },
      {
        $match: { ...totalSalesPeriod },
      },
      {
        $group: {
          _id: '$_id',
          data: { $mergeObjects: '$$ROOT' },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          value: '$count',
        },
      },
    ])
    totalSales = await Order.aggregate([
      {
        $match: {
          'status.info': {
            $not: {
              $in: ['canceled', 'returned'],
            },
            $in: ['paid'],
          },
        },
      },
      { $unwind: '$status' },
      {
        $match: {
          $and: [
            { $expr: { $eq: ['$status.info', 'paid'] } },
            { ...totalSalesPeriod },
          ],
        },
      },
      ...(period === 'last-six-months'
        ? [
            {
              $group: {
                _id: { yearMonth: { $substrCP: ['$status.date', 0, 7] } },
                count: { $sum: '$totalAmount' },
                totalPaidOrders: { $sum: 1 },
              },
            },
            {
              $sort: {
                '_id.yearMonth': 1,
              },
            },
            {
              $project: {
                _id: 0,
                totalAmount: '$count',
                totalPaidOrders: '$totalPaidOrders',
                monthYear: {
                  $concat: [
                    {
                      $arrayElemAt: [
                        MONTHS_ARRAY,
                        {
                          $subtract: [
                            { $toInt: { $substrCP: ['$_id.yearMonth', 5, 2] } },
                            1,
                          ],
                        },
                      ],
                    },
                    '-',
                    {
                      $substrCP: ['$_id.yearMonth', 0, 4],
                    },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                data: {
                  $push: {
                    label: '$monthYear',
                    total: {
                      amount: '$totalAmount',
                      paidOrders: '$totalPaidOrders',
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                lastSixMonths: {
                  $range: [
                    { $add: [{ $subtract: [{ $month: TODAY }, 6] }, 1] },
                    { $add: [{ $month: TODAY }, 1] },
                  ],
                },
              },
            },
            {
              $addFields: {
                templateData: {
                  $map: {
                    input: '$lastSixMonths',
                    as: 'm',
                    in: {
                      month_year: {
                        $concat: [
                          {
                            $arrayElemAt: [
                              MONTHS_ARRAY,
                              {
                                $subtract: ['$$m', 1],
                              },
                            ],
                          },
                          '-',
                          {
                            $toString: { $year: TODAY },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                data: {
                  $map: {
                    input: '$templateData',
                    as: 't',
                    in: {
                      label: '$$t.month_year',
                      total: {
                        $reduce: {
                          input: '$data',
                          initialValue: { amount: 0, paidOrders: 0 },
                          in: {
                            amount: {
                              $cond: {
                                if: { $eq: ['$$t.month_year', '$$this.label'] },
                                then: {
                                  $add: [
                                    '$$this.total.amount',
                                    '$$value.amount',
                                  ],
                                },
                                else: { $add: [0, '$$value.amount'] },
                              },
                            },
                            paidOrders: {
                              $cond: {
                                if: { $eq: ['$$t.month_year', '$$this.label'] },
                                then: {
                                  $add: [
                                    '$$this.total.paidOrders',
                                    '$$value.paidOrders',
                                  ],
                                },
                                else: { $add: [0, '$$value.paidOrders'] },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                data: '$data',
              },
            },
          ]
        : [
            {
              $group: {
                _id: '$_id',
                orderInfo: { $mergeObjects: '$$ROOT' },
                orderStatus: { $push: '$status' },
              },
            },
            {
              $project: {
                _id: 0,
                data: {
                  $mergeObjects: ['$orderInfo', { status: '$orderStatus' }],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: '$data.totalAmount' },
                totalPaidOrders: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                ...(totalOrdersCount.length > 0 && {
                  percent: {
                    $multiply: [
                      {
                        $divide: [
                          '$totalPaidOrders',
                          totalOrdersCount[0].value,
                        ],
                      },
                      100,
                    ],
                  },
                }),
                amount: '$count',
              },
            },
          ]),
    ])
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  return res.status(200).json({
    message: `Total orders sales for ${period.split('-').join(' ')}`,
    totalSales: period !== 'last-six-months' ? totalSales[0] : totalSales,
  })
}

const getOrderById = async (req, res, next) => {
  let order
  const { oid } = req.params

  try {
    order = await Order.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(oid) } },
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
                email: 1,
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
                name: 1,
                model: 1,
                collectionName: 1,
                previewImg: 1,
                orderedPrice: '$$orderedProduct.price',
                orderedDiscount: '$$orderedProduct.discount',
                orderedQuantity: '$$orderedProduct.quantity',
                totalPrice: {
                  $cond: {
                    if: { $ne: ['$$orderedProduct.discount', 0] },
                    then: {
                      $toDouble: {
                        $multiply: [
                          {
                            $subtract: [
                              '$$orderedProduct.price',
                              {
                                $multiply: [
                                  {
                                    $divide: ['$$orderedProduct.discount', 100],
                                  },
                                  '$$orderedProduct.price',
                                ],
                              },
                            ],
                          },
                          '$$orderedProduct.quantity',
                        ],
                      },
                    },
                    else: {
                      $toDouble: {
                        $multiply: [
                          '$$orderedProduct.price',
                          '$$orderedProduct.quantity',
                        ],
                      },
                    },
                  },
                },
                currentlyInStock: '$inStock',
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
          status: { $first: '$status' },
          email: { $first: '$email' },
          customer: { $first: '$customer' },
          currency: { $first: '$currency' },
          totalAmount: { $first: '$totalAmount' },
          orderedProducts: { $push: '$orderedProducts' },
          shippingAddr: { $first: '$shippingAddr' },
          billingAddr: { $first: '$billingAddr' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          status: {
            $map: {
              input: '$status',
              as: 'status',
              in: {
                info: '$$status.info',
                date: {
                  $dateToString: {
                    format: '%d/%m/%Y - %H:%M:%S',
                    date: '$$status.date',
                  },
                },
              },
            },
          },
          email: 1,
          customer: 1,
          currency: 1,
          totalAmount: 1,
          orderedProducts: 1,
          shippingAddr: 1,
          billingAddr: 1,
          createdAt: {
            $dateToString: {
              format: '%d/%m/%Y - %H:%M:%S',
              date: '$createdAt',
            },
          },
          updatedAt: {
            $dateToString: {
              format: '%d/%m/%Y - %H:%M:%S',
              date: '$updatedAt',
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

  if (order[0]) {
    return res.status(200).json({ order: order[0] })
  }

  return res
    .status(404)
    .json({ message: 'Order with provided oid does not exists.' })
}

const getOrdersByUserId = async (req, res, next) => {
  let orders
  const { uid } = req.params

  try {
    orders = await Order.aggregate([
      {
        $match: { $expr: { $eq: ['$customer', { $toObjectId: uid }] } },
      },
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
                name: 1,
                model: 1,
                collectionName: 1,
                previewImg: 1,
                orderedPrice: '$$orderedProduct.price',
                orderedDiscount: '$$orderedProduct.discount',
                orderedQuantity: '$$orderedProduct.quantity',
                totalPrice: {
                  $cond: {
                    if: { $ne: ['$$orderedProduct.discount', 0] },
                    then: {
                      $toDouble: {
                        $multiply: [
                          {
                            $subtract: [
                              '$$orderedProduct.price',
                              {
                                $multiply: [
                                  {
                                    $divide: ['$$orderedProduct.discount', 100],
                                  },
                                  '$$orderedProduct.price',
                                ],
                              },
                            ],
                          },
                          '$$orderedProduct.quantity',
                        ],
                      },
                    },
                    else: {
                      $toDouble: {
                        $multiply: [
                          '$$orderedProduct.price',
                          '$$orderedProduct.quantity',
                        ],
                      },
                    },
                  },
                },
                currentlyInStock: '$inStock',
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
          status: { $first: '$status' },
          currentStatus: { $first: { $last: '$status' } },
          email: { $first: '$email' },
          currency: { $first: '$currency' },
          totalAmount: { $first: '$totalAmount' },
          orderedProducts: { $push: '$orderedProducts' },
          shippingAddr: { $first: '$shippingAddr' },
          billingAddr: { $first: '$billingAddr' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
        },
      },
      {
        $addFields: {
          totalProducts: { $sum: '$orderedProducts.orderedQuantity' },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          currentStatus: 1,
          status: {
            $map: {
              input: '$status',
              as: 'status',
              in: {
                info: '$$status.info',
                date: {
                  $dateToString: {
                    format: '%d/%m/%Y - %H:%M:%S',
                    date: '$$status.date',
                  },
                },
              },
            },
          },
          email: 1,
          currency: 1,
          totalAmount: 1,
          orderedProducts: 1,
          totalProducts: 1,
          shippingAddr: 1,
          billingAddr: 1,
          createdAt: {
            $dateToString: {
              format: '%d/%m/%Y - %H:%M:%S',
              date: '$createdAt',
            },
          },
          updatedAt: {
            $dateToString: {
              format: '%d/%m/%Y - %H:%M:%S',
              date: '$updatedAt',
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
    return res.status(200).json({ orders })
  }

  return res.status(404).json({
    message:
      req.user.id !== uid
        ? "This user doesn't have any orders yet."
        : 'There is no orders yet.',
  })
}

const getOrdersByProductId = async (req, res, next) => {
  let orders
  const { pid } = req.params

  try {
    orders = await Order.aggregate([
      {
        $match: {
          $expr: {
            $in: [{ $toObjectId: pid }, '$orderedProducts.id'],
          },
        },
      },
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
                email: 1,
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
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: pid }] },
              },
            },
            {
              $project: {
                _id: 0,
                orderedPrice: '$$orderedProduct.price',
                orderedDiscount: '$$orderedProduct.discount',
                orderedQuantity: '$$orderedProduct.quantity',
              },
            },
          ],
          as: 'orderInfo',
        },
      },
      { $unwind: '$orderInfo' },
      {
        $project: {
          _id: 0,
          id: '$_id',
          status: 1,
          email: 1,
          customer: 1,
          currency: 1,
          totalAmount: 1,
          orderInfo: 1,
          shippingAddr: 1,
          billingAddr: 1,
          createdAt: {
            $dateToString: {
              format: '%d/%m/%Y - %H:%M:%S',
              date: '$createdAt',
            },
          },
          updatedAt: {
            $dateToString: {
              format: '%d/%m/%Y - %H:%M:%S',
              date: '$updatedAt',
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
      message: `List of all orders for product with pid:${pid}`,
      orders,
    })
  }

  return res.status(404).json({
    message:
      'No items were found matching this combination of selected filters.',
  })
}

// POST CONTROLLERS
const createOrder = async (req, res, next) => {
  let createdOrder
  const customer = req.user
  const { totalAmount } = req
  const {
    items,
    email,
    address: { shipping: shippingAddr, billing: billingAddr },
  } = req.body
  const productIds = items.map(item => mongoose.Types.ObjectId(item.id))

  try {
    const session = await mongoose.startSession()
    const orderedProducts = await Product.find({ _id: { $in: productIds } })
      .select('_id inStock discount price')
      .session(session)

    session.startTransaction()
    const updatedProducts = []
    // eslint-disable-next-line no-restricted-syntax
    for (const product of orderedProducts) {
      const foundItem = items.find(item => item.id === product.id)
      foundItem.price = product.price
      foundItem.discount = product.discount
      product.inStock -= foundItem.quantity
      updatedProducts.push(product.save())
    }

    // update all orderedProducts quantity values.
    await Promise.all(updatedProducts)

    const newOrder = new Order({
      totalAmount,
      email,
      customer: customer.id,
      orderedProducts: items,
      shippingAddr,
      billingAddr,
      status: [{}],
    })

    createdOrder = await newOrder.save({ session })
    await session.commitTransaction()
    session.endSession()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  return res.status(201).json({
    createdOrder: createdOrder.toObject({ newOrderCreated: true }),
    message: 'New order is successfully created!',
  })
}

// PUT CONTROLLERS
const updateOrder = async (req, res, next) => {
  const { oid } = req.params
  const { status } = req.body
  const options = {
    new: true,
    lean: true,
    useFindAndModify: false,
    populate: 'customer orderedProducts.id',
    projection: {
      _id: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    },
  }
  let updatedOrder

  try {
    if (status === 'fulfilled') {
      const session = await mongoose.startSession()
      session.startTransaction()
      const orderForUpdate = await Order.findById(
        oid,
        'customer orderedProducts.id'
      )
      const customerPurchasedProducts = orderForUpdate.orderedProducts.map(
        product => mongoose.Types.ObjectId(product.id)
      )
      await User.updateOne(
        { _id: orderForUpdate.customer },
        {
          $addToSet: {
            purchasedProducts: { $each: customerPurchasedProducts },
          },
        }
      ).session(session)
      updatedOrder = await Order.findByIdAndUpdate(
        oid,
        {
          $push: { status: { info: status } },
        },
        { ...options, session }
      )
      await session.commitTransaction()
      session.endSession()
    } else {
      updatedOrder = await Order.findByIdAndUpdate(
        oid,
        {
          $push: { status: { info: status } },
        },
        options
      )
    }
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (updatedOrder) {
    return res.status(200).json({
      message: 'Order is successfully updated!',
      updatedOrder,
    })
  }

  return res
    .status(404)
    .json({ message: 'Order with provided oid does not exists' })
}

module.exports = {
  getOrders,
  getTotalOrdersCount,
  getTotalOrdersSales,
  getOrderById,
  getOrdersByUserId,
  getOrdersByProductId,
  createOrder,
  updateOrder,
}
