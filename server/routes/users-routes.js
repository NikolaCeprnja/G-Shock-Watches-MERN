const router = require('express').Router()

const {
  getUsers,
  getUserById,
  userSignup,
  userSignin,
} = require('../controllers/users-controller')
const { authJwt } = require('../auth/auth')
const { userValidation } = require('../controllers/req-validation-controller')

// GET ROUTES
router.get('/', authJwt, getUsers)

router.get('/:uid', authJwt, getUserById)

// POST ROUTES
router.post('/signup', userValidation('userSignup'), userSignup, (req, res) => {
  res.cookie('token', req.token, { httpOnly: true })
  return res.status(201).json({
    signedUpUser: req.user,
    message: `Hello ${req.user.userName}, you are successfully logged in!`,
  })
})

router.post('/signin', userValidation('userSignin'), userSignin, (req, res) => {
  res.cookie('token', req.token, { httpOnly: true })
  return res.status(200).json({
    loggedInUser: req.user,
    message: `Hello ${req.user.userName}, you are successfully logged in!`,
  })
})

module.exports = router
