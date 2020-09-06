var createError = require('http-errors')
var cookieParser = require('cookie-parser')
var express = require('express')
var path = require('path')
var logger = require('morgan')
var config = require('./config')
var sha1 = require('sha1')

var auth = require('./routes/auth')
var usersRouter = require('./routes/users')
var Wechat = require('./wechat')
const { time } = require('console')

var app = express()
var wechat = new Wechat()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
  if (req.path === '/favicon.ico') return
  next()
})
app.use('/users', usersRouter)

app.get('/search', async (req, res) => {
  const js_sdk_config = await wechat.getJsSdkConfig(config.url + req.url)
  res.render('search', { ...js_sdk_config })
})
app.get('/api/getSdk', async (req, res) => {
  const js_sdk_config = await wechat.getJsSdkConfig(config.url + req.path)
  res.json(js_sdk_config)
})

app.use(auth())

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', {
    err,
  })
})

module.exports = app
