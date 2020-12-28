const router = require('express').Router()
const { check, oneOf } = require('express-validator')

const {
  getUsers,
  getUserById,
  userSignup,
  userSignin,
} = require('../controllers/users-controller')
const { authJwt } = require('../auth/auth')

// GET ROUTES
router.get('/', authJwt, getUsers)

router.get('/:uid', getUserById)

// POST ROUTES
router.post(
  '/signup',
  [
    check('userName').trim().isLength({ min: 6 }),
    check('email').trim().notEmpty().normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  userSignup,
  (req, res) => {
    res.cookie('token', req.token, { httpOnly: true })
    return res.status(201).json({
      signedUpUser: req.user,
      message: `Hello ${req.user.userName}, you are successfully logged in!`,
    })
  }
)

router.post(
  '/signin',
  [
    oneOf([
      check('userNameOrEmail').trim().notEmpty().normalizeEmail().isEmail(),
      check('userNameOrEmail').trim().isLength({ min: 6 }),
    ]),
    check('password').isLength({ min: 6 }),
  ],
  userSignin,
  (req, res) => {
    res.cookie('token', req.token, { httpOnly: true })
    return res.status(200).json({
      loggedInUser: req.user,
      message: `Hello ${req.user.userName}, you are successfully logged in!`,
    })
  }
)

module.exports = router
