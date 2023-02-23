module.exports = {
  CLIENT: {
    DOMAIN: process.env.CLIENT_DOMAIN_DEV,
    BASE_URL: process.env.CLIENT_BASE_URL_DEV,
  },
  SERVER: {
    HOST: process.env.HOST_DEV,
  },
  DB: {
    URI: process.env.DB_URI_DEV,
  },
  PASSWORD_RESET: {
    URL: process.env.PASSWORD_RESET_URL_DEV,
  },
}
