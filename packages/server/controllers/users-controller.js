const path = require('path')
const mongoose = require('mongoose')
const User = require('../models/user-model')
const ErrorHandler = require('../models/error-handler')
const { saveFile, removeFile } = require('../utils/fileUpload')
const {
  uploadFile: upFileToCloudinary,
  removeFile: rmFileFromCloudinary,
} = require('../utils/cloudinary')

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

const getTotalUsersCount = async (req, res, next) => {
  let totalUsers

  try {
    totalUsers = await User.find({}).countDocuments()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  return res
    .status(200)
    .json({ message: 'Total user documents count', totalUsers })
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

const getPurchasedProductsAndReviews = async (req, res, next) => {
  const { uid } = req.params
  let user

  try {
    user = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(uid) } },
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
          purchasedProducts: 1,
        },
      },
    ])
  } catch (error) {
    return next(
      new ErrorHandler('Something went wrong, please try again later!', 500)
    )
  }

  if (user[0]) {
    if (user[0].purchasedProducts.length > 0) {
      return res.status(200).json(user[0])
    }

    return res
      .status(404)
      .json({ message: 'There is no purchased products yet.' })
  }

  return res
    .status(404)
    .json({ message: 'User with provided uid does not exists.' })
}

// PUT CONTROLLERS
const updateUser = async (req, res, next) => {
  const { uid } = req.params
  const {
    file,
    body: { avatar, ...restBodyParams },
  } = req
  let updatedUser
  let userToUpdate

  try {
    userToUpdate = await User.findById(uid, 'avatarUrl')

    if (!userToUpdate) {
      throw new ErrorHandler('User with provided uid does not exists.', 404)
    }

    // * File exists, replace existing one or just insert new avatar
    if (file) {
      const fileName = `${userToUpdate.id}-${file.fieldName}${file.detectedFileExtension}`

      if (process.env.NODE_ENV === 'development') {
        if (userToUpdate.avatarUrl) {
          await removeFile(
            path.join(__dirname, '/../public', userToUpdate.avatarUrl)
          )
        }

        const filePath = `${__dirname}/../public/images/avatars/${fileName}`

        await saveFile(file, filePath)
        restBodyParams.avatarUrl = `/images/avatars/${fileName}`
      } else {
        if (userToUpdate.cloudinaryId) {
          await rmFileFromCloudinary(userToUpdate.cloudinaryId)
        }

        const response = await upFileToCloudinary(file.stream, {
          public_id: fileName.slice(0, -4),
          folder: '/images/avatars',
          format: file.detectedFileExtension.slice(1),
        })

        restBodyParams.cloudinaryId = response.public_id
        restBodyParams.cloudinaryUrl = response.secure_url
      }
    }
    // * File doesn't exists, it's removed
    else if (userToUpdate.avatarUrl && avatar === 'undefined') {
      try {
        if (process.env.NODE_ENV === 'development') {
          await removeFile(
            path.join(__dirname, '/../public', userToUpdate.avatarUrl)
          )
          restBodyParams.avatarUrl = undefined
        } else {
          await rmFileFromCloudinary(userToUpdate.cloudinaryId)
          restBodyParams.cloudinaryId = undefined
          restBodyParams.cloudinaryUrl = undefined
        }
      } catch (err) {
        console.log(err)
      }
    }

    updatedUser = await User.findByIdAndUpdate(
      uid,
      { $set: restBodyParams },
      {
        // lean: true,
        returnOriginal: false,
        useFindAndModify: false,
        projection: {
          _id: 0,
          id: '$_id',
          userName: 1,
          email: 1,
          avatarUrl: 1,
          cloudinaryId: 1,
          cloudinaryUrl: 1,
          // purchasedProducts: 1,
          // FIXME: handle getUserById accounts photo to match user-model obj when user login with oauth2.0 strategy
          // FIXME: handle purchasedProducts and reviews when navigating to profile page...
          /* _id: 0,
          __v: 0,
          reviews: 0,
          password: 0,
          createdAt: 0,
          updatedAt: 0,
          purchasedProducts: 0, */
        },
      }
    )
  } catch (error) {
    if (error instanceof ErrorHandler) {
      return next(error)
    }

    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (updatedUser) {
    return res.status(200).json({
      message: `User ${updatedUser.userName} is successfully updated!`,
      updatedUser,
    })
  }
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

      if (user.cloudinaryId) {
        await rmFileFromCloudinary(user.cloudinaryId)
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
  getTotalUsersCount,
  getUserById,
  getPurchasedProductsAndReviews,
  updateUser,
  deleteUser,
}
