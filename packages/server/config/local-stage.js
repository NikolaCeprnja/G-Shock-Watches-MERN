module.exports = {
  SERVER: {
    PORT: process.env.PORT,
    HOST: process.env.HOST_LOCAL,
  },
  CLIENT: {
    BASE_URL: process.env.CLIENT_BASE_URL_LOCAL,
  },
  DB: {
    URI: process.env.DB_URI_LOCAL,
  },
  PASSWORD_RESET: {
    URL: process.env.PASSWORD_RESET_URL_LOCAL,
  },
}
