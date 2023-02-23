module.exports = {
  CLIENT: {
    DOMAIN: process.env.CLIENT_DOMAIN_LOCAL,
    BASE_URL: process.env.CLIENT_BASE_URL_LOCAL,
  },
  SERVER: {
    PORT: process.env.PORT,
    HOST: process.env.HOST_LOCAL,
  },
  DB: {
    URI: process.env.DB_URI_LOCAL,
  },
  PASSWORD_RESET: {
    URL: process.env.PASSWORD_RESET_URL_LOCAL,
  },
}
