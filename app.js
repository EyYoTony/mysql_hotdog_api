require('dotenv').config()
const express = require('express')
const app = express()
const dal = require('./dal.js')
const port = process.env.PORT || 4000
const HTTPError = require('node-http-error')
const bodyParser = require('body-parser')
const { pathOr, keys, difference } = require('ramda')

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  res.send('Welcome to the Hotdogs API.')
})

// CREATE  - POST /hotdogs
app.post('/hotdogs', function(req, res, next) {
  dal.addHotdog(req.body, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(201).send(data)
  })
})

// READ - GET /hotdogs/:id
app.get('/hotdogs/:id', function(req, res, next) {
  dal.getHotdog(req.params.id, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    if (data) {
      res.status(200).send(data)
    } else {
      next(new HTTPError(404, 'Not Found', { path: req.path }))
    }
  })
})

// UPDATE -  PUT /hotdogs/:id
// DELETE -  DELETE /hotdogs/:id
// LIST - GET /hotdogs

app.use(function(err, req, res, next) {
  console.log(req.method, ' ', req.path, ' ', 'error: ', err)
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('Hotdog API Running on port:', port))
