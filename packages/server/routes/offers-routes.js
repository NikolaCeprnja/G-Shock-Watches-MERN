const router = require('express').Router()

const { getOffers } = require('../controllers/offers-contoller')

router.get('/', getOffers)

module.exports = router
