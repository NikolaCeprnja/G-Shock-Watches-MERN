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
  forgotPassword,
  resetPassword,
} = require('../controllers/auth-controller')
const { userValidation } = require('../controllers/req-validation-controller')

const {
  isAdmin,
  checkUserPrivileges,
  checkResetPassToken,
} = require('../middlewares/auth-middleware')
const { checkReqParamValidity } = require('../middlewares/req-param-middleware')

// GET ROUTES
router.get('/', authJwt, isAdmin, getUsers)

router.get(
  '/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  getUserById
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
    return res.redirect('http://localhost:3000/users/admin')
  }

  return res.redirect(`http://localhost:3000/users/${req.user.id}/profile`)
})

// POST ROUTES
router.post(
  '/auth/signup',
  userValidation('signup'),
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
  '/auth/signin',
  userValidation('signin'),
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

router.post(
  '/auth/forgotpassword',
  userValidation('forgotPassword'),
  checkResetPassToken,
  forgotPassword
)

// PUT ROUTES
router.put(
  '/auth/resetpassword/:resetPasswordToken',
  userValidation('resetPassword'),
  resetPassword
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
