const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy
const bcrypt = require('bcryptjs')

const User = require('./user-model')

// Local strategy for user signup
passport.use(
  'signup',
  new LocalStrategy(
    {
      usernameField: 'userName',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, userName, unhashedPassword, done) => {
      const { email, isAdmin } = req.body
      let existingUser

      try {
        existingUser = await User.exists({
          $or: [{ userName }, { email }],
        })
      } catch (err) {
        return done(err)
      }

      if (existingUser) {
        return done(null, false, {
          message:
            'User with provided email and / or username already exists, please try again with different values.',
          statusCode: 409,
        })
      }

      const password = await bcrypt.hash(unhashedPassword, 12)

      const user = new User({
        userName,
        email,
        password,
        isAdmin,
      })

      try {
        await user.save()
      } catch (err) {
        return done(err)
      }

      return done(null, user)
    }
  )
)

// Local strategy for user signin
passport.use(
  'signin',
  new LocalStrategy(
    {
      usernameField: 'userNameOrEmail',
      passwordField: 'password',
    },
    async (userNameOrEmail, password, done) => {
      let user

      try {
        user = await User.findOne({
          $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
        })
      } catch (err) {
        return done(err)
      }

      if (!user) {
        return done(null, false, {
          message:
            'User with provided email / username does not exists, please check your data and try again.',
          statusCode: 404,
        })
      }

      let passValidity

      try {
        passValidity = await user.isValidPassword(password)
      } catch (err) {
        return done(err)
      }

      if (!passValidity) {
        return done(null, false, {
          message: 'Incorrect password, please try again.',
          statusCode: 401,
        })
      }

      return done(null, user)
    }
  )
)

const cookieExtractor = req => {
  let token = null

  if (req && req.cookies) {
    token = req.cookies.token
  }

  return token
}

// JWT strategy for token verification of the logged in user
passport.use(
  'jwt',
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      return done(null, jwtPayload)
    }
  )
)
