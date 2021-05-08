const config = require('config')
const mongoose = require('mongoose')

// TODO: add auto reconnect and events for on disconnect, on error
const connectDB = async () => {
  try {
    await mongoose.connect(config.get('DB.URI'), {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      poolSize: 10,
    })

    console.log('Successfully connected to the mongodb.')
  } catch (error) {
    console.error(error)
  }
}

module.exports = connectDB
