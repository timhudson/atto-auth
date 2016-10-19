const defaultMessage = `
Hi!

Please follow this link to verify your email address:
`

const {
  APP_NAME = 'Atto',
  SECRET,
  SMTP_URL,
  FROM,
  SUBJECT = `Verify your email address to use ${APP_NAME}`,
  MESSAGE = defaultMessage
} = process.env

module.exports = {
  APP_NAME,
  SECRET,
  SMTP_URL,
  FROM,
  SUBJECT,
  MESSAGE
}
