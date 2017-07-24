require('dotenv').config()
const express = require('express')
const app = express()
const dal = require('./dal.js')
const port = process.env.PORT || 4000
const HTTPError = require('node-http-error')
const bodyParser = require('body-parser')
const { pathOr, keys, difference, path } = require('ramda')

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  res.send('Welcome to the Hotdogs API.')
})

//   CREATE  - POST /Hotdogs
app.post('/hotdogs', function(req, res, next) {
  dal.addHotdog(req.body, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(201).send(data)
  })
})

app.use(function(err, req, res, next) {
  console.log(req.method, ' ', req.path, ' ', 'error: ', err)
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('Hotdog API Running on port:', port))
