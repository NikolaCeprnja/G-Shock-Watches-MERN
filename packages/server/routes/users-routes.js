const router = require('express').Router()
const passport = require('passport')
const multer = require('multer')

const upload = multer()

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

router.get('/auth', authJwt, (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ loggedInUser: req.user })
  }

  return res.status(401).json({ message: 'Unauthenticated.' })
})

router.get(
  '/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  getUserById
)

router.get('/auth/signout', (req, res) => {
  res.clearCookie('token', { sameSite: 'strict', httpOnly: true })
  res.json({ message: 'You are successfully signed out.' })
})

router.get('/auth/google', (req, res, next) => {
  const redirectTo = req.query.redirect_to
  const state = redirectTo
    ? Buffer.from(JSON.stringify({ redirectTo })).toString('base64')
    : undefined

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state,
  })(req, res, next)
})

router.get('/auth/google/callback', auth('google'), (req, res) => {
  res
    .status(200)
    .cookie('token', req.token, { sameSite: 'strict', httpOnly: true })

  try {
    const { state } = req.query
    const { redirectTo } = JSON.parse(Buffer.from(state, 'base64').toString())
    if (typeof redirectTo === 'string' && redirectTo.startsWith('/')) {
      res.redirect(`http://localhost:3000${redirectTo}`)
    }
  } catch {
    if (req.user.isAdmin) {
      return res.redirect('http://localhost:3000/admin/dashboard')
    }

    return res.redirect(
      `http://localhost:3000/users/${req.user.id}/profile/dashboard`
    )
  }
})

// POST ROUTES
router.post(
  '/auth/signup',
  upload.single('avatar'),
  userValidation('signup'),
  auth('signup'),
  (req, res) =>
    res
      .status(201)
      .cookie('token', req.token, { sameSite: 'strict', httpOnly: true })
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
      .cookie('token', req.token, { sameSite: 'strict', httpOnly: true })
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
