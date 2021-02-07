const errorFormater = ({ msg, value, nestedErrors }) => {
  return {
    msg,
    value,
    nestedErrors,
  }
}

module.exports = errorFormater
