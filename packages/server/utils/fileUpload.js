const fs = require('fs')
const { promisify } = require('util')
const pipeline = promisify(require('stream').pipeline)

const unlink = promisify(fs.unlink)

exports.saveFile = async (file, path) => {
  try {
    await pipeline(file.stream, fs.createWriteStream(path))
  } catch (error) {
    throw new Error(error.message)
  }
}

exports.removeFile = async path => {
  try {
    await unlink(path)
  } catch (error) {
    throw new Error(error.message)
  }
}
