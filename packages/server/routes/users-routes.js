const router = require('express').Router()
const passport = require('passport')

const {
  getUsers,
  getUserById,
  deleteUser,
} = require('../controllers/users-controller')
const {
  auth,
  authJwt,
  isAdmin,
  checkReqParamValidity,
  checkUserPrivileges,
} = require('../controllers/auth-controller')
const { userValidation } = require('../controllers/req-validation-controller')

// GET ROUTES
router.get('/', authJwt, isAdmin, getUsers)

router.get('/admin', authJwt, isAdmin, (req, res, next) =>
  res.send({ admin: req.user })
)

router.get(
  '/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  getUserById
)

router.get(
  '/:uid/profile',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  (req, res, next) => res.send({ loggedinUser: req.user })
)

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
)

router.get('/auth/google/callback', auth('google'), (req, res) => {
  res.cookie('token', req.token, { httpOnly: true })

  if (req.user.isAdmin) {
    return res.redirect('../../admin')
  }

  return res.redirect(`../../${req.user.id}/profile`)
})

// POST ROUTES
router.post(
  '/signup',
  userValidation('userSignup'),
  auth('signup'),
  (req, res) =>
    res
      .status(201)
      .cookie('token', req.token, { httpOnly: true })
      .json({
        signedUpUser: req.user,
        message: `Hello ${req.user.userName}, you are successfully logged in!`,
      })
)

router.post(
  '/signin',
  userValidation('userSignin'),
  auth('signin'),
  (req, res) =>
    res
      .status(200)
      .cookie('token', req.token, { httpOnly: true })
      .json({
        loggedInUser: req.user,
        message: `Hello ${req.user.userName}, you are successfully logged in!`,
      })
)

// DELETE ROUTES
router.delete(
  '/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  deleteUser
)

module.exports = router
