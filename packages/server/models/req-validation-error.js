const errorFormater = ({ msg, value, nestedErrors }) => ({
  message: msg,
  value,
  nestedErrors,
})

module.exports = errorFormater
