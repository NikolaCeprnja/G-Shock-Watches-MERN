const router = require('express').Router()

const {
  getCollections,
  getCollectionsByGender,
} = require('../controllers/collections-controller')

// GET ROUTES
/** @method GET @access PUBLIC @desc Get all collections. */
router.get('/', getCollections)

/** @method GET @access PUBLIC @desc Get collections by gender type. */
router.get('/:gender', getCollectionsByGender)

module.exports = router
