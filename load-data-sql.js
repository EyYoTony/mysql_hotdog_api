require('dotenv').config()

const mysql = require('mysql')

const sql = `INSERT INTO hotdog
(name, cost, topping, is_chef_favorite, stock)
VALUES
('Classic Dog', 4.49, 'Ketchup', 0, 10),
('Chilli Dog', 6.99, 'BBQ', 0, 8),
('Corn Dog', 4.99, 'Ketchup', 0, 12),
('The "Homewrecker"', 7.99, 'Everything', 1, 5),
('Footlong', 5.49, 'Ketchup', 0, 9),
('Hot Dog Boi', 9.99, 'Relish', 1, 1)
`
function createConnection() {
  return mysql.createConnection({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })
}

function createHotdogs() {
  const connection = createConnection()
  connection.query(sql, function(err, result) {
    if (err) return console.log('createHotdogs() error', err)
    console.log('createHotdogs() SUCCESS!!', JSON.stringify(result, null, 2))
  })

  connection.end(function(err, result) {
    if (err) return err
    console.log('bye', result)
  })
}

createHotdogs()
