const passport = require('passport')
const config = require('config')
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
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
      let existingUsers

      try {
        existingUsers = await User.find({
          $or: [
            { userName },
            { email },
            { accounts: { $elemMatch: { displayName: userName } } },
          ],
        })
      } catch (err) {
        return done(err)
      }

      // FIXME: modify all error messages to be in the same format like errorFormatter
      if (existingUsers) {
        const errors = {}

        existingUsers.forEach(existingUser => {
          if (
            existingUser.userName === userName ||
            existingUser.accounts.some(acc => acc.displayName === userName)
          ) {
            errors.userName = {
              message: 'Username already taken, please try another one.',
              value: userName,
            }
          }

          if (existingUser.email === email) {
            errors.email = {
              message:
                'Email already taken, please try another one, or go to signin now.',
              value: email,
            }
          }
        })

        if (Object.keys(errors).length > 0) {
          return done(null, false, {
            message: 'Conflict while creating user account.',
            statusCode: 409,
            errors: { ...errors },
          })
        }
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
          errors: {
            userNameOrEmail: {
              message:
                'User with provided email / username does not exists. Check your data and try again, or go to register now.',
              value: userNameOrEmail,
            },
          },
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
          errors: {
            password: {
              message:
                'Wrong password. Try again or click Forgot password to reset it.',
            },
          },
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
      secretOrKey: config.get('JWT.SECRET'),
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id)

        // TODO: on the client side add axios interceptor to logout the user if jwt is invalid
        if (!user) {
          return done(null, false, {
            message: 'Invalid token.',
            statusCode: 401,
          })
        }

        return done(null, user.toObject({ getters: true }))
      } catch (err) {
        return done(err, false)
      }
    }
  )
)

// Google OAuth2.0 strategy
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: config.get('GOOGLE_OAUTH2.CLIENT_ID'),
      clientSecret: config.get('GOOGLE_OAUTH2.CLIENT_SECRET'),
      callbackURL: '/api/users/auth/google/callback',
    },
    async (accsessToken, refreshToken, profile, done) => {
      const { id, provider, name, displayName, emails, photos } = profile
      try {
        const existingUser = await User.findOne({
          accounts: { $elemMatch: { _id: id } },
        })

        if (!existingUser) {
          const user = new User()

          user.accounts.push({
            _id: id,
            provider,
            name: {
              firstName: name.givenName,
              lastName: name.familyName,
            },
            displayName,
            emails: [...emails],
            photos: [...photos],
          })

          await user.save()

          return done(null, user)
        }

        return done(null, existingUser)
      } catch (err) {
        return done(err)
      }
    }
  )
)
