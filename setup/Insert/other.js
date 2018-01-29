/*
node setup/Insert/other.js
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
// TODO
// connection.query(`TRUNCATE TABLE rhyme_words`)

const sérhljóðar = /(ei|au|a|e|i|o|u|y|á|é|í|ó|ú|ý|ö|æ)/g
const ipa_sérhljóðar = /(ai:?|au:?|ei:?|ou:?|œi:?|i:?|u:?|a:?|u:?|e:?|o:?|œ:?|ɪ:?|ɔ:?|ʏ:?|ɛ:?)/g

const run = (callback) => {
  var lr = new LineByLineReader('setup/Data/ordmyndalisti.txt')
  lr.on('error', function(err) {
    console.log(err)
  });
  var count = 0

  lr.on('line', function(line) {
    lr.pause()

    var word = line.trim()

    if (/[^A-zÀ-ÿ]/.test(word)) { // Rusl-línur
      lr.resume()
    } else {
      connection.query(
        `SELECT * FROM rhyme_words WHERE lowercase_word = ?`, [word.toLowerCase()],
        function(error, results, fields) {
          if (error) throw error;
          if (results.length > 0) {
            lr.resume()
          } else {
            if(!word.toLowerCase().match(sérhljóðar)){
              console.log(word)
              process.exit()
            }
            const syllables = word.toLowerCase().match(sérhljóðar).length
            const word_split = word.toLowerCase().split(sérhljóðar)
            const last_syllables = word_split.slice(-4).join('')
            const last_syllable = word_split.slice(-2).join('')

            connection.query(
              `INSERT INTO rhyme_words SET
                word = ?,
                lowercase_word = ?,
                last_syllables = ?,
                last_syllable = ?,
                syllables = ?
              `, [
                word,
                word.toLowerCase(),
                last_syllables,
                last_syllable,
                //rhyme_ending_id,
                syllables
              ],
              function(error, results, fields) {
                if (error) throw error;
                lr.resume()
              }
            )
          }
        }
      )
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
