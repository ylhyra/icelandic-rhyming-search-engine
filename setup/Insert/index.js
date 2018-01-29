/*
node setup/Insert/index.js
*/

var pronunciation = require('./pronunciation');
var other = require('./other');
var frequency = require('./frequency');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  database: 'rhyme',
  user: 'egill',
  password: 'egillegillegill',
  multipleStatements: true,
});

connection.connect();
connection.query(`
  TRUNCATE TABLE rhyme_words;
	TRUNCATE TABLE rhyme_endings;
  TRUNCATE TABLE rhyme_ending_sounds`,
  (err) => {
    pronunciation(() => {
      // process.exit()
      other(() => {
        frequency(() => {
          process.exit()
        })
      })
    })
  })
