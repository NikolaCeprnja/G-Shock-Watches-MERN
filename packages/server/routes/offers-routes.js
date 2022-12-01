const router = require('express').Router()

const { getOffers } = require('../controllers/offers-contoller')

// GET ROUTES
/** @method GET @access PUBLIC @desc Get all offers. */
router.get('/', getOffers)

module.exports = router
