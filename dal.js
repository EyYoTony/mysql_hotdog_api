const mysql = require('mysql')
const HTTPError = require('node-http-error')
const { assoc, path, omit, compose, propOr, head, prop } = require('ramda')

const addHotdog = (hotdog, callback) => {
  createHotdog(hotdog, callback)
}

const getHotdog = (hotdogId, callback) => {
  read('hotdog', hotdogId, callback)
}

const updateHotdog = (hotdog, callback) => {
  update(hotdog, callback)
}

const deleteHotdog = (hotdogId, callback) => {
  deleteRow('hotdog', hotdogId, callback)
}
///////////////////
/// Helper FN's ///
///////////////////

const createHotdog = (hotdog, callback) => {
  if (hotdog) {
    const connection = createConnection()
    connection.query(
      'INSERT INTO hotdog SET ? ',
      prepHotdogsForInsert(hotdog),
      function(err, result) {
        if (err) return callback(err)
        if (propOr(null, 'insertId', result)) {
          callback(null, { ok: true, id: result.insertId })
        } else {
          callback(null, { ok: false, id: null })
        }
      }
    )

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
          const formattedResults = formatHotdog(head(result))
          return callback(null, formattedResults)
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

function update(hotdog, callback) {
  if (hotdog) {
    var connection = createConnection()
    hotdog = prepHotdogsForUpdate(hotdog)
    connection.query(
      'UPDATE hotdog SET ? WHERE ID = ' + hotdog.ID,
      hotdog,
      function(err, result) {
        if (err) return callback(err)
        if (typeof result !== 'undefined' && result.affectedRows === 0) {
          return callback({
            error: 'not_found',
            reason: 'missing',
            name: 'not_found',
            status: 404,
            message: 'missing'
          })
        } else if (typeof result !== 'undefined' && result.affectedRows === 1) {
          return callback(null, {
            ok: true,
            id: hotdog.ID
          })
        }
      }
    )
    connection.end(function(err) {
      if (err) return err
    })
  } else {
    return callback(new HTTPError(400, 'Missing hotdog'))
  }
}

function deleteRow(tablename, id, callback) {
  if (id) {
    var connection = createConnection()
    connection.query(
      'DELETE FROM ' + connection.escapeId(tablename) + ' WHERE id = ?',
      [id],
      function(err, result) {
        if (err) return callback(err)
        if (result && result.affectedRows === 0) {
          return callback({
            error: 'not_found',
            reason: 'missing',
            name: 'not_found',
            status: 404,
            message: 'missing'
          })
        } else if (result && result.affectedRows === 1) {
          return callback(null, {
            ok: true,
            id: id
          })
        }
      }
    )
    connection.end(function(err) {
      if (err) return err
    })
  } else {
    return callback(new HTTPError(400, 'Missing id parameter'))
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

const prepHotdogsForInsert = hotdog => {
  return compose(omit('_rev'), omit('_id'), omit('type'))(hotdog)
}

const prepHotdogsForUpdate = hotdog => {
  hotdog = assoc('ID', path(['_id'], hotdog), hotdog)
  return compose(omit('_rev'), omit('_id'), omit('type'))(hotdog)
}

const formatHotdog = hotdog => {
  hotdog = assoc('_id', path(['ID'], hotdog), hotdog)
  return compose(omit('ID'), assoc('_rev', null), assoc('type', 'hotdog'))(
    hotdog
  )
}

const dal = { addHotdog, getHotdog, updateHotdog, deleteHotdog }
module.exports = dal
