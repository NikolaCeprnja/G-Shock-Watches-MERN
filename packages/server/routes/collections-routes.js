const router = require('express').Router()

const {
  getCollectionsByGender,
} = require('../controllers/collections-controller')

router.get('/:gender', getCollectionsByGender)

module.exports = router
