const config = require('config')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(config.get('EMAIL.SENDGRID_API_KEY'))

const sendEmail = async options => {
  const { to, subject, html } = options
  const msg = {
    to,
    from: config.get('EMAIL.FROM'),
    subject,
    html,
  }

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email successfully sent.')
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = sendEmail
