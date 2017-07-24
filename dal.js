const mysql = require('mysql')
const HTTPError = require('node-http-error')
const { assoc, propOr } = require('ramda')

const addHotdog = (hotdog, callback) => {
  createHotdog(hotdog, callback)
}

///////////////////
/// Helper FN's ///
///////////////////

const createHotdog = (hotdog, callback) => {
  if (hotdog) {
    const connection = createConnection()
    connection.query('INSERT INTO hotdog SET ? ', hotdog, function(
      err,
      result
    ) {
      if (err) return callback(err)
      if (propOr(null, 'insertId', result)) {
        callback(null, { ok: true, id: result.insertId })
      } else {
        callback(null, { ok: false, id: null })
      }
    })

    connection.end(err => err)
  } else {
    return callback(new HTTPError(400, 'Missing hotdog'))
  }
}

const createConnection = () => {
  return mysql.createConnection({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })
}

const dal = { addHotdog }
module.exports = dal
