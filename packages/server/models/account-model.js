const { Schema } = require('mongoose')

const accountSchema = new Schema(
  {
    _id: { type: String, required: true },
    provider: { type: String, required: true },
    name: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    displayName: { type: String, required: true },
    emails: [
      { value: { type: String, required: true }, verified: { type: Boolean } },
    ],
    photos: [{ value: { type: String, required: true } }],
  },
  { _id: false, toObject: { getters: true } }
)

module.exports = accountSchema
