var mysql = require('mysql');

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'opentutorials_nodejs'
  });
  db.connect();
  module.exports = db;