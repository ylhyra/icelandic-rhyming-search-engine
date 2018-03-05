/*
node server/rhyme.js

Keppinautar:
http://heimskringla.net/
http://elias.rhi.hi.is/rimord/
http://islenska.org/rima/
*/

/*

  Hlutir sem þurfa að ríma:

  reiður - feigur                          Önghljóð að ríma
  reyrt - breytt
  sinn - fimm                              Nefhljóð
  svör - gröf
  kotungi - almúgi - héraði - Alþingi      Áherslurím
  hryssan - kyss'ann
  Búðardal - brúðaval
  Sigöldu - mig völdu
  lands - manns - stans
  hringt - sýnt - týnt
  hringt - hreint - beint
  þyngdar - týndar - reyndar
  heilt - hálft
  þangað - þyngdar - reyndar               ?
  sést - veist
  óvíst - vafðist
  stelpurnar - guggnar
  vafði - sagði
  svörtum - vöktum
  þyrstur - fastur
  sverta - hefta
  þunnt - aumt
  vals - uppáhalds
  seytla - betla

  Ýmsar orðmyndir vantar:
  nörtum (er þetta ekki komið í skjalið?)

  Næst á dagskrá: Áhersla!!
  kjúklingabringur vs. níðingur

*/

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  database: 'rhyme2',
  user: 'ylhyra_dev',
  password: 'ylhyra_dev',
  multipleStatements: true,
});
connection.connect();
connection.query(`SET sql_mode = ''`)
const fs = require('fs')
const path = require('path')
const rhyme_on_word   = fs.readFileSync(path.join(__dirname, './sql/rhyme_on_word.sql'), 'utf8')
const rhyme_on_ending = fs.readFileSync(path.join(__dirname, './sql/rhyme_on_ending.sql'), 'utf8')
const sérhljóðar = /(ei|au|a|e|i|o|u|y|á|é|í|ó|ú|ý|ö|æ)/g

const rhyme = (input, callback) => {
  const word = input.replace(/[^A-zÀ-ÿ]/g, '').toLowerCase()
  const word_split = word.split(sérhljóðar)
  const last_syllables = word_split.slice(-4).join('')
  const last_syllable = word_split.slice(-2).join('')

  /*
    Does this word exists or do we need to only check the word ending?
  */
  connection.query(`
    SELECT * FROM rhyme_words WHERE lowercase_word = ? LIMIT 1;
    SELECT * FROM rhyme_endings WHERE ending = ? LIMIT 1;
    SELECT * FROM rhyme_endings WHERE ending = ? LIMIT 1;
  `, [
    word,
    last_syllables,
    last_syllable,
  ], function(error, results) {
    let sql, parameter
    if (error) {
      console.error(error)
      callback(null)
      return
    }

    // Word exists
    if (results[0].length > 0) {
      console.log('~~ word')
      sql = rhyme_on_word
      parameter = word
    }
    // Syllables exist
    else if (results[1].length > 0) {
      console.log('~~ syllables')
      sql = rhyme_on_ending
      parameter = last_syllables
    }
    // Syllable exist
    else if (results[2].length > 0) {
      console.log('~~ syllable')
      sql = rhyme_on_ending
      parameter = last_syllable
    } else {
      callback(null)
      return
    }

    /*
      Find rhyme
    */
    console.time('Tók');
    connection.query(sql, [parameter], function(error, results, fields) {
      if (error) {
        console.error(error)
        callback(null)
        return
      }
      console.timeEnd('Tók');

      if (results.length == 0) {
        console.log('~~ No results')
        callback(null)
        return
      }

      /*
        output
          syllables
            rhymes
              words
                word
      */
      // console.log(JSON.stringify(results,null,2))

      /*
        Finna góða liti og stærðir, byggist á Score og Popularity
      */
      results = results.map(item => {
        let opacity = (minMax(item.score, 100, 190) / 190) ** 1.6 + 0.1
        opacity = minMax(opacity, 0.45, 1)
        if (!item.popularity) {
          opacity = minMax(opacity, 0.45, 0.7)
        }
        const color = (item.popularity ? (minMax(item.popularity, 1, 50) + 7) / 50 * 40 : 1) /* 0: Black, 40: Blue */
        let font_weight = 400
        // Óvinsæl BÍN orð
        if (item.popularity === null && item.id > 60700) {
          opacity = minMax(opacity, 0.4, 0.5)
        }
        if (opacity > .75 && color > 15) {
          font_weight = 500
        }
        if (opacity > .95 && color > 30) {
          font_weight = 600
        }
        return {
          ...item,
          style: `color:hsla(209, 100%, ${Math.round(color)}%, ${opacity.toFixed(2)});` +
            `font-weight:${font_weight}`,
        }
      })

      let aggregated = []
      results.forEach((item, index) => {
        let syllables = aggregated[aggregated.length - 1]

        if (index == 0 || syllables.syllables != item.syllables) {
          aggregated.push({
            syllables: item.syllables,
            rhymes: []
          })
          syllables = aggregated[aggregated.length - 1]
        }
        let rhyme_index = syllables.rhymes.findIndex(element =>
          element.rhyme === item.ending_pronunciation
        )
        if (rhyme_index === -1) {
          syllables.rhymes.push({
            rhyme: item.ending_pronunciation, 
            words: []
          })
          rhyme_index = syllables.rhymes.length - 1
        }
        syllables.rhymes[rhyme_index].words.push({
          word: item.word,
          style: item.style,
          // score: Math.floor(item.score),
          // popularity: item.popularity,
        })
      })

      // console.log(JSON.stringify(results,null,2).replace(/"/g,''))
      // console.log(JSON.stringify(aggregated,null,2).replace(/"/g,''))
      callback(aggregated)
      // process.exit()
    })
  })

}

// rhyme('aðalfundi', output => {
//   console.log(output)
//   process.exit()
// })

module.exports = rhyme


const minMax = (val, min, max) => {
  return val > max ? max : val < min ? min : val
}