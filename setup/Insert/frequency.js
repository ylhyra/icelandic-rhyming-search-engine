/*
node setup/Insert/frequency.js
*/
var LineByLineReader = require('line-by-line')
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  database: 'rhyme',
  user: 'egill',
  password: 'egillegillegill',
  multipleStatements: true,
});

connection.connect();

const sérhljóðar = /(ei|au|a|e|i|o|u|y|á|é|í|ó|ú|y|ö)/g
const ipa_sérhljóðar = /(ai:?|au:?|ei:?|ou:?|œi:?|i:?|u:?|a:?|u:?|e:?|o:?|œ:?|ɪ:?|ɔ:?|ʏ:?|ɛ:?)/g

const run = (callback) => {
  var lr = new LineByLineReader('setup/Data/Máltíðni.txt')
  lr.on('error', function(err) {
    console.log(err)
  });
  var count = 0

  lr.on('line', function(line) {
    lr.pause()

    var match = line.match(/(\d+) (.+)/)
    var frequency = match[1] / 10
    var word = match[2].trim()

    if (/[^A-zÀ-ÿ]/.test(word)) { // Rusl-línur
      lr.resume()
    } else {
      const popularity = Math.round(1 + Math.log(frequency) / Math.log(1.1))
      connection.query(
        `UPDATE rhyme_words SET popularity = ?
           WHERE lowercase_word = ?`, [popularity, word],
        function(error, results, fields) {
          if (error) throw error;
          lr.resume()
        });
    }
    // process.exit()
  });
  lr.on('end', function() {
    connection.end();
    callback()
  });
}

module.exports = run

run(()=>{
  process.exit()
})
