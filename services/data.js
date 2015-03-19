/*
 * Data service. Used for performing queries agaisnt
 * DS data.
 */

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD
});

/*
 * Performs the query given and sends the rows back to the callback.
 */
this.performQuery = function(query, callback) {
  connection.query(query, function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    callback(rows);
  });
}
