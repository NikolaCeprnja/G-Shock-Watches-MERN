const Collection = require('../models/collection-model')
const ErrorHandler = require('../models/error-handler')

// GET CONTROLLERS
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

  return res.json({ collections })
}

module.exports = { getCollectionsByGender }
