require('dotenv').config()
const express = require('express')
const app = express()
const dal = require('./dal.js')
const port = process.env.PORT || 4000
const HTTPError = require('node-http-error')
const bodyParser = require('body-parser')
const { pathOr, keys, difference, path } = require('ramda')
const checkRequiredFields = require('./lib/check-required-fields')
const checkHotdogFields = checkRequiredFields(['name', 'cost', 'stock'])

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  res.send('Welcome to the Hotdogs API.')
})

// CREATE  - POST /hotdogs
app.post('/hotdogs', function(req, res, next) {
  const hotdog = pathOr(null, ['body'], req)
  const createResults = checkHotdogFields(hotdog)
  createResults.length > 0
    ? next(
        new HTTPError(400, 'missing required fields', {
          createResults
        })
      )
    : dal.addHotdog(hotdog, function(err, result) {
        if (err) return next(new HTTPError(err.status, err.message, err))
        res.status(201).send(result)
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
app.put('/hotdogs/:id', function(req, res, next) {
  const id = path(['params', 'id'], req)
  const body = pathOr(null, ['body'], req)
  const updateResults = checkHotdogFields(body)
  updateResults.length === 0
    ? dal.updateHotdog(body, function(err, result) {
        if (err) next(new HTTPError(err.status, err.message, err))
        res.status(200).send(result)
      })
    : next(
        new HTTPError(400, 'Missing Required Fields', {
          missingRequiredFields: updateResults
        })
      )
})

// DELETE -  DELETE /hotdogs/:id
app.delete('/hotdogs/:id', function(req, res, next) {
  const hotdogId = req.params.id
  dal.deleteHotdog(hotdogId, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(data)
  })
})

// LIST - GET /hotdogs

app.use(function(err, req, res, next) {
  console.log(req.method, ' ', req.path, ' ', 'error: ', err)
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('Hotdog API Running on port:', port))
