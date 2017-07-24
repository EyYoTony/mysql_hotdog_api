const mysql = require('mysql')
const HTTPError = require('node-http-error')
const { assoc, propOr } = require('ramda')

const addHotdog = (hotdog, callback) => {
  createHotdog(hotdog, callback)
}

const getHotdog = (hotdogId, callback) => {
  read('hotdog', hotdogId, callback)
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

const read = (tableName, id, callback) => {
  if (id && tableName) {
    const connection = createConnection()

    connection.query(
      'SELECT * FROM ' + connection.escapeId(tableName) + 'WHERE ID = ? ',
      [id],
      function(err, result) {
        if (err) return callback(err)
        if (propOr(0, ['length'], result) > 0) {
          return callback(null, result)
        } else {
          return callback(
            new HTTPError(404, 'not foud', {
              name: 'not_found',
              error: 'not found',
              reason: 'missing'
            })
          )
        }
      }
    )

    connection.end(err => err)
  } else {
    return callback(new HTTPError(400, 'Missing information'))
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

const dal = { addHotdog, getHotdog }
module.exports = dal
