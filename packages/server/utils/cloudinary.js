const config = require('config')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: config.get('CLOUDINARY.CLOUD_NAME'),
  api_key: config.get('CLOUDINARY.API_KEY'),
  api_secret: config.get('CLOUDINARY.API_SECRET'),
})

const uploadFile = (stream, options) =>
  new Promise((resolve, reject) => {
    const cloudinaryStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }
      }
    )

    stream.pipe(cloudinaryStream)
  })

module.exports = {
  uploadFile,
}
