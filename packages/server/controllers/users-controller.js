const path = require('path')
const mongoose = require('mongoose')
const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')
const { removeFile } = require('../utils/fileUpload')

// GET CONTROLLERS
const getUsers = async (req, res, next) => {
  let users
  const showPerPage = Number(req.query.pageSize) || 8
  if (req.query.pageSize) delete req.query.pageSize
  const curPage = (({ page }) => Number(page))(req.query) || 1
  if (req.query.page) delete req.query.page
  const skipNext = showPerPage * (curPage - 1)
  const userQuery = { _id: { $ne: mongoose.Types.ObjectId(req.user.id) } }
  if (Object.keys(req.query).includes('isAdmin')) {
    userQuery.isAdmin = req.query.isAdmin
  }
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
  let sortBy

  if (req.query.sortBy) {
    sortBy = JSON.parse(req.query.sortBy)

    if (Object.keys(sortBy)[0] === 'numReviews') {
      sortBy = {
        avgRating: Object.values(sortBy)[0] === 'ascend' ? 1 : -1,
        [Object.keys(sortBy)[0]]:
          Object.values(sortBy)[0] === 'ascend' ? 1 : -1,
      }
    } else {
      sortBy = {
        [Object.keys(sortBy)[0]]:
          Object.values(sortBy)[0] === 'ascend' ? 1 : -1,
      }
    }
    delete req.query.sortBy
  }

  let totalUsers

  try {
    totalUsers = await User.find({
      ...userQuery,
      ...searchQuery,
    }).countDocuments()
  } catch (err) {
    console.log(err)
  }

  try {
    users = await User.aggregate([
      {
        $match: {
          ...userQuery,
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
          userName: 1,
          email: 1,
          isAdmin: 1,
          avatarUrl: 1,
          cloudinaryUrl: 1,
          numPurchasedProducts: {
            $cond: {
              if: { $ne: [{ $size: '$purchasedProducts' }, 0] },
              then: { $size: '$purchasedProducts' },
              else: '$$REMOVE',
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
          accounts: 1,
          createdAt: {
            $dateToString: {
              format: '%d/%m/%Y',
              date: '$createdAt',
            },
          },
        },
      },
      { $skip: skipNext },
      { $limit: showPerPage },
      {
        $sort: sortBy || { 'data.createdAt': -1, 'data.id': -1 },
      },
    ])
  } catch (error) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (users.length > 0) {
    return res.status(200).json({
      message: 'List of all users',
      users,
      curPage,
      pageSize: showPerPage,
      totalUsers,
    })
  }

  return res.status(404).json({ message: 'Currently there is no users yet.' })
}

const getUserById = async (req, res, next) => {
  const { uid } = req.params
  let user

  try {
    user = await User.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(uid) },
      },
      {
        $lookup: {
          from: 'products',
          let: { creator: '$_id', purchasedProducts: '$purchasedProducts' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$purchasedProducts'] },
              },
            },
            {
              $lookup: {
                from: 'reviews',
                let: { pid: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$product', '$$pid'] },
                          { $eq: ['$creator', '$$creator'] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      id: '$_id',
                      title: 1,
                      desc: '$description',
                      score: 1,
                      createdAt: {
                        $dateToString: {
                          format: '%d/%m/%Y',
                          date: '$createdAt',
                        },
                      },
                    },
                  },
                ],
                as: 'reviews',
              },
            },
            {
              $project: {
                _id: 0,
                id: '$_id',
                name: 1,
                model: 1,
                // gender: 1,
                collectionName: 1,
                previewImg: 1,
                reviews: 1,
              },
            },
          ],
          as: 'purchasedProducts',
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          userName: 1,
          email: 1,
          isAdmin: 1,
          avatarUrl: 1,
          cloudinaryId: 1,
          cloudinaryUrl: 1,
          purchasedProducts: 1,
          accounts: 1,
        },
      },
    ])
  } catch (error) {
    return next(
      new ErrorHandler('Something went wrong, please try again later!', 500)
    )
  }

  if (user[0]) {
    return res.status(200).json({ user: user[0] })
  }

  return res
    .status(404)
    .json({ message: 'User with provided uid does not exists.' })
}

// DELETE CONTROLLERS
const deleteUser = async (req, res, next) => {
  const { uid } = req.params
  let user

  try {
    user = await User.findById(uid)
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (user) {
    try {
      await user.deleteOne()
      if (user.avatarUrl) {
        await removeFile(path.join(__dirname, '/../public', user.avatarUrl))
      }
    } catch (err) {
      return next(
        new ErrorHandler('Something went wrong, please try again later.', 500)
      )
    }

    if (req.user.id === uid) {
      req.logout()
      res.clearCookie('token', { sameSite: 'strict', httpOnly: true })
    }

    return res.status(200).json({
      message: 'User is successfully deleted!',
      deletedUser: user.toObject(),
    })
  }

  return res
    .status(404)
    .json({ message: 'User with provided uid does not exists.' })
}

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
}
