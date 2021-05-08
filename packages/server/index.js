const express = require('express')
const cors = require('cors')
const config = require('config')
const cookieParser = require('cookie-parser')
const path = require('path')

// Express config
const app = express()
const port = config.get('SERVER.PORT')
const host = config.get('SERVER.HOST')

if (app.get('env') === 'production') app.disable('x-powered-by')

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Mongoose config
const connectDB = require('./config/db')

connectDB()

// Passport config
require('./models/passport-strategies')

// Routes config
const userRoutes = require('./routes/users-routes')
const reviewRoutes = require('./routes/review-routes')
const collectionsRouter = require('./routes/collections-routes')
const productRoutes = require('./routes/products-routes')

app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/collections', collectionsRouter)
app.use('/api/products', productRoutes)

// Errors handler config
const {
  errorPageHandler,
  defaultErrorHandler,
} = require('./middlewares/error-middleware')

// 404 error page handler
app.use(errorPageHandler)

// Default error handler
app.use(defaultErrorHandler)

// 🚀 Start express server
app.listen(port, host, error => {
  if (error) return console.error(error)

  console.log(`Server is running on port: ${port}.`)
})
