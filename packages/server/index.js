const express = require('express')
const cors = require('cors')
const env = require('dotenv')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

// Express config
const app = express()

if (app.get('env') !== 'production') env.config()
else app.disable('x-powered-by')

app.set('port', process.env.PORT || 5000)

app.use(cors())
app.use(cookieParser())
app.use(express.json())

// Mongoose config
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Successfully connected to the mongodb atlas.'))
  .catch(error => {
    console.error(error)
  })

// Passport config
require('./models/passport-strategies')

// Routes config
const userRoutes = require('./routes/users-routes')
const productRoutes = require('./routes/products-routes')
const reviewRoutes = require('./routes/review-routes')

app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/reviews', reviewRoutes)

// 404 error page handler
app.use((req, res) => {
  res.status(404).json({ message: 'Error, this page does not exists.' })
})

// Default error handler
app.use((err, req, res, next) => {
  console.error(err)

  if (res.headersSent) {
    return next(err)
  }

  return res.status(err.statusCode || 500).json({
    message:
      err.message ||
      'Server error, something went wrong, please try again later.',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  })
})

// 🚀 Start express server
app.listen(app.get('port'), error => {
  if (error) return console.error(error)

  console.log(`Server is running on port: ${app.get('port')}.`)
})
