const { parse } = require('url')
const { createError, json, send } = require('micro')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const {
  APP_NAME,
  SECRET,
  SMTP_URL,
  FROM,
  SUBJECT,
  MESSAGE
} = require('./config')

if (!SECRET) throw new Error('SECRET env variable is required')
if (!SMTP_URL) throw new Error('SMTP_URL env variable is required')

const transporter = nodemailer.createTransport(SMTP_URL)

module.exports = async function (req, res) {
  const url = parse(req.url)

  switch (url.pathname) {
    case '/generate':
      return await generate(req, res)
    case '/confirm':
      return await confirm(req, res)
    case '/verify':
      return await verify(req, res)
    default:
      send(res, 404)
  }
}

async function generate (req, res) {
  const data = await json(req)
  const { email } = data
  if (!email) throw createError(400, 'email is required')

  const token = jwt.sign({ email }, SECRET, {
    expiresIn: '10m'
  })
  const link = `http://localhost:3000/confirm?token=${token}`
  const options = {
    from: FROM,
    to: email,
    subject: SUBJECT,
    text: `${MESSAGE}\n${link}`
  }

  await sendMail(options)

  send(res, 200)
}

async function confirm (req, res) {
  const { query } = parse(req.url, true)
  const { token } = query
  if (!token) throw createError(400, 'token is required')

  const { email } = jwt.verify(token, SECRET)

  const longLivedToken = jwt.sign({ email }, SECRET, {
    expiresIn: '7d'
  })

  send(res, 200, { token: longLivedToken })
}

async function verify (req, res) {
  const data = await json(req)
  const { token } = data
  if (!token) throw createError(400, 'token is required')

  try {
    jwt.verify(token, SECRET)
    send(res, 200)
  } catch (err) {
    throw createError(401, 'Invalid token', err)
  }
}

async function sendMail (options) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (err, info) => err ? reject(err) : resolve(info))
  })
}
