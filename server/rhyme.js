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

  Ýmsar orðmyndir vantar:
  nörtum

*/

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  database: 'rhyme',
  user: 'egill',
  password: 'egillegillegill',
  multipleStatements: true,
});
connection.connect();
connection.query(`SET sql_mode = ''`)

const rhyme = (input, callback) => {
  const word = input.replace(/[^A-zÀ-ÿ]/g, '')
  match(input, results => {
    callback(results)
    // find_rhymes(pronunciation, callback)
  })
}

const match = (input, callback) => {
  connection.query(
    `
      SELECT
        words_2.*,
        endings.*,
        LEAST(endings.pos1, 100)
          + LEAST(endings.pos2, 100) * 0.6
          + LEAST(endings.pos3, 100) * 0.3
          + LEAST(endings.pos4, 100) * 0.1
          AS score
      FROM
        # Finds all rhyme endings
        (
          SELECT
            endings_2.*,
            COUNT(sounds_2.id) as total_matches,
            SUM(CASE WHEN sounds_2.position = 1 then sounds_2.score else 0 end) pos1,
            SUM(CASE WHEN sounds_2.position = 2 then sounds_2.score else 0 end) pos2,
            SUM(CASE WHEN sounds_2.position = 3 then sounds_2.score else 0 end) pos3,
            SUM(CASE WHEN sounds_2.position = 4 then sounds_2.score else 0 end) pos4

          # Find word
          FROM rhyme_words
            AS words_1

          # Find the prounounciation of its ending
          JOIN rhyme_endings
            AS endings_1
            ON endings_1.id = words_1.rhyme_ending_id

          # Find the sounds
          JOIN rhyme_ending_sounds
            AS sounds_1
            ON endings_1.id = sounds_1.rhyme_ending_id

          # Find sounds in common
          JOIN rhyme_ending_sounds
            AS sounds_2
            ON sounds_1.ends_in_a_consonant = sounds_2.ends_in_a_consonant
           AND sounds_1.position = sounds_2.position
           AND sounds_1.sound = sounds_2.sound

          # Find endings with those sounds
          JOIN rhyme_endings
            AS endings_2
            ON endings_2.id = sounds_2.rhyme_ending_id

          WHERE words_1.word = ?

          GROUP BY sounds_2.rhyme_ending_id
            # Last two wounds must have a match
            HAVING pos1 != 0
               AND pos2 != 0

          ORDER BY total_matches DESC
          LIMIT 20
        ) AS endings

        JOIN rhyme_words
          AS words_2
          ON words_2.rhyme_ending_id = endings.id

        ORDER BY
          syllables ASC,
          score DESC
        LIMIT 6
    `, [input], function(error, results, fields) {
    if (error) throw error;

    /*
      output
        syllables
          rhymes
            words
              word
    */
    let aggregated = []
    results.forEach((item, index) => {
      let syllables = aggregated[aggregated.length - 1]
      if(index == 0 || syllables.syllables != item.syllables) {
        aggregated.push({
          syllables: item.syllables,
          rhymes: []
        })
        syllables = aggregated[aggregated.length - 1]
      }
      let rhymes = syllables.rhymes[syllables.rhymes.length - 1]
      if(!rhymes || rhymes.rhyme != item.ending_pronunciation) {
        syllables.rhymes.push({
          rhyme: item.ending_pronunciation,
          words: []
        })
        rhymes = syllables.rhymes[syllables.rhymes.length - 1]
      }
      rhymes.words.push({
        word: item.word,
        score: Math.floor(item.score / 10)
      })
    })


    console.log(JSON.stringify(results,null,2).replace(/"/g,''))
    console.log(JSON.stringify(aggregated,null,2).replace(/"/g,''))


    callback(aggregated)
    // process.exit()

  });
}

rhyme('aðfsrðinni', output => {
  console.log(output)
  process.exit()
})

module.exports = rhyme
