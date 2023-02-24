const router = require('express').Router()
const jwt = require('jsonwebtoken')
const passport = require('passport')
const multer = require('multer')
const config = require('config')

const upload = multer()

const {
  getUsers,
  getTotalUsersCount,
  getUserById,
  getPurchasedProductsAndReviews,
  updateUser,
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
/** @method GET @access PRIVATE @desc Get all user. */
router.get('/', authJwt, isAdmin, getUsers)

/** @method GET @access PRIVATE @desc Get total user documents count */
router.get('/count', authJwt, isAdmin, getTotalUsersCount)

/** @method GET @access PUBLIC @desc Get an currently authenticated user. */
router.get('/auth', authJwt, (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ loggedInUser: req.user })
  }

  return res.status(401).json({ message: 'Unauthenticated.' })
})

/** @method GET @access PRIVATE @desc Get user by his uid.  */
router.get(
  '/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  getUserById
)

/** @method GET @access PRIVATE @desc Get list of user purchased products and reviews based of his uid. */
router.get(
  '/:uid/purchased-products',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  getPurchasedProductsAndReviews
)

/** @method GET @access PUBLIC @desc Signout currently logged in user.  */
router.get('/auth/signout', (req, res, next) => {
  jwt.verify(
    req.cookies.token,
    config.get('JWT.SECRET'),
    {
      ignoreExpiration: true,
    },
    (err, decodedToken) => {
      if (err) {
        return next(err)
      }

      res.clearCookie('token', {
        ...(decodedToken.auth?.googleStrategy
          ? {
              domain: config.get('CLIENT.DOMAIN'),
            }
          : { sameSite: 'strict' }),
        httpOnly: true,
      })
    }
  )

  res.json({ message: 'You are successfully signed out.' })
})

/** @method GET @access PUBLIC @desc Authenticate user using passport Google OAuth2.0 strategy. */
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

/** @method GET @access PUBLIC @desc Redirect after successful auth using passport Google OAuth2.0 strategy. */
router.get('/auth/google/callback', auth('google'), (req, res) => {
  res.status(200).cookie('token', req.token, {
    domain: config.get('CLIENT.DOMAIN'),
    httpOnly: true,
  })

  try {
    const { state } = req.query
    const { redirectTo } = JSON.parse(Buffer.from(state, 'base64').toString())
    if (typeof redirectTo === 'string' && redirectTo.startsWith('/')) {
      res.redirect(`${config.get('CLIENT.BASE_URL')}${redirectTo}`)
    }
  } catch {
    if (req.user.isAdmin) {
      return res.redirect(`${config.get('CLIENT.BASE_URL')}/admin/dashboard`)
    }

    return res.redirect(
      `${config.get('CLIENT.BASE_URL')}/users/${req.user.id}/profile`
    )
  }
})

// POST ROUTES
/** @method POST @access PUBLIC @desc Create user account using passport local strategy and sign user in. */
router.post(
  ['/auth/signup', '/auth/createNewUser'],
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

/** @method POST @access PUBLIC @desc User signin with passport local strategy. */
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

/** @method POST @access PUBLIC @desc Send an email for user password reset. */
router.post(
  '/auth/forgot-password',
  userValidation('forgotPassword'),
  checkResetPassToken,
  forgotPassword
)

// PUT ROUTES
/** @method PUT @access PUBLIC @desc Reset the forgotten user password based of provided resetPasswordToken.  */
router.put(
  '/auth/reset-password/:resetPasswordToken',
  userValidation('resetPassword'),
  resetPassword
)

/** @method PUT @access PRIVATE @desc Update user account based of his uid. */
router.put(
  '/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  upload.single('avatar'),
  userValidation('updateUser'),
  updateUser
)

// DELETE ROUTES
/** @method DELETE @access PRIVATE @desc Remove user account based of his uid. */
router.delete(
  '/:uid',
  authJwt,
  checkReqParamValidity('uid'),
  checkUserPrivileges,
  deleteUser
)

module.exports = router
