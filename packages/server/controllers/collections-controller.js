const Collection = require('../models/collection-model')
const ErrorHandler = require('../models/error-handler')

// GET CONTROLLERS
const getCollections = async (req, res, next) => {
  let collections

  try {
    collections = await Collection.find({ gender: { $ne: 'all' } })
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  collections = collections.map(collection => collection.toObject())

  return res.status(200).json({ collections })
}

const getCollectionsByGender = async (req, res, next) => {
  const { gender } = req.params

  let collections
  try {
    collections = await Collection.find({ gender })
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  collections = collections.map(collection => collection.toObject())

  return res.status(200).json({ collections })
}

module.exports = { getCollections, getCollectionsByGender }
