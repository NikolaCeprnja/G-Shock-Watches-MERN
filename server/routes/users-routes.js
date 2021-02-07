const router = require('express').Router()

const {
  getUsers,
  getUserById,
  deleteUser,
} = require('../controllers/users-controller')
const {
  auth,
  authJwt,
  isAdmin,
  checkUserPrivileges,
} = require('../controllers/auth-controller')
const { userValidation } = require('../controllers/req-validation-controller')

// GET ROUTES
router.get('/', authJwt, isAdmin, getUsers)

router.get('/:uid', authJwt, checkUserPrivileges, getUserById)

// POST ROUTES
router.post(
  '/signup',
  userValidation('userSignup'),
  auth('signup'),
  (req, res) => {
    return res
      .status(201)
      .cookie('token', req.token, { httpOnly: true })
      .json({
        signedUpUser: req.user,
        message: `Hello ${req.user.userName}, you are successfully logged in!`,
      })
  }
)

router.post(
  '/signin',
  userValidation('userSignin'),
  auth('signin'),
  (req, res) => {
    return res
      .status(200)
      .cookie('token', req.token, { httpOnly: true })
      .json({
        loggedInUser: req.user,
        message: `Hello ${req.user.userName}, you are successfully logged in!`,
      })
  }
)

// DELETE ROUTES
router.delete('/:uid', authJwt, checkUserPrivileges, deleteUser)

module.exports = router
