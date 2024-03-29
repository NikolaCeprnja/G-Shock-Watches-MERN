const config = require('config')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy

const User = require('./user-model')
const ErrorHandler = require('./error-handler')
const { saveFile } = require('../utils/fileUpload')
const { uploadFile } = require('../utils/cloudinary')

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
      const {
        file,
        body: { email, isAdmin },
      } = req

      const password = await bcrypt.hash(unhashedPassword, 12)

      const user = new User({
        userName,
        email,
        password,
        isAdmin,
      })

      if (file) {
        const fileName = `${user.id}-${file.fieldName}${file.detectedFileExtension}`

        try {
          if (process.env.NODE_ENV === 'development') {
            const filePath = `${__dirname}/../public/images/avatars/${fileName}`
            await saveFile(file, filePath)
            user.avatarUrl = `/images/avatars/${fileName}`
          } else {
            // cloudinary file upload
            const response = await uploadFile(file.stream, {
              public_id: fileName.slice(0, -4),
              folder: '/images/avatars',
              format: file.detectedFileExtension.slice(1),
            })

            user.cloudinaryId = response.public_id
            user.cloudinaryUrl = response.secure_url
          }
        } catch (err) {
          return done(err)
        }
      }

      try {
        await user.save()
      } catch (err) {
        return done(err)
      }

      return done(null, user.toObject({ localStrategy: true }), {
        localStrategy: true,
      })
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
        user = await User.findOne(
          {
            $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
          },
          'userName email password isAdmin avatarUrl cloudinaryId cloudinaryUrl'
        )
      } catch (err) {
        // TODO: change returned error with custom message
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
        return done(
          new ErrorHandler(
            'Something went wrong while authenticating, please try again later.',
            500
          )
        )
      }

      if (!passValidity) {
        return done(null, false, {
          errors: {
            password: {
              message:
                'Wrong password. Try again or click forgot password to reset it.',
            },
          },
          statusCode: 401,
        })
      }

      return done(null, user.toObject({ localStrategy: true }), {
        localStrategy: true,
      })
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

        const options = jwtPayload.auth ? { ...jwtPayload.auth } : undefined

        return done(null, user.toObject(options))
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

          return done(null, user, {
            googleStrategy: true,
          })
        }

        return done(null, existingUser, { googleStrategy: true })
      } catch (err) {
        return done(err)
      }
    }
  )
)
