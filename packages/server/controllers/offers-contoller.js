const Offer = require('../models/offer-model')
const ErrorHandler = require('../models/error-handler')

// GET CONTOLLERS
const getOffers = async (req, res, next) => {
  let offers

  try {
    offers = await Offer.find()
  } catch (err) {
    return next(
      new ErrorHandler('Something went wrong, please try again later.', 500)
    )
  }

  if (offers.length) {
    return res.status(200).json({ message: 'List of all offers', offers })
  }

  return res
    .status(404)
    .json({ message: 'There is no new offers at the moment.' })
}

module.exports = { getOffers }
