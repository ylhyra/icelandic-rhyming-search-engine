/*
node data/Rím/rím.js

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

  Ýmsar orðmyndir vantar:
  nörtum

*/

/*

2 sérhljóð       2 samhljóði      1 sérhljóð    1 samhljóð
í                ngd              a             r
ei               nd               a             r

*/

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  database: 'ylhyra',
  user: 'egill',
  password: 'egillegillegill',
  multipleStatements: true,
});
connection.connect();
connection.query(`SET sql_mode = ''`)

const ríma = (input, callback) => {
  const word = input.replace(/[^A-zÀ-ÿ]/g, '')
  find_word(input, pronounciation => {
    callback(pronounciation)
    // find_rhymes(pronounciation, callback)
  })
}

const find_word = (input, callback) => {
  connection.query(
    `
      SELECT
        words_2.word,
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
          LIMIT 10
        ) AS endings

        JOIN rhyme_words
          AS words_2
          ON words_2.rhyme_ending_id = endings.id

        ORDER BY score DESC
        LIMIT 6
    `, [input], function(error, results, fields) {
    if (error) throw error;

    console.log(JSON.stringify(results,null,2).replace(/"/g,''))
    process.exit()

  });
}

ríma('aðfsrðinni', output => {
  console.log(output)
  process.exit()
})



  // SELECT type, sound FROM rhyme_words
  // JOIN rhyme_endings ON rhyme_endings.id = rhyme_words.rhyme_ending_id
  // JOIN rhyme_ending_sounds ON rhyme_endings.id = rhyme_ending_sounds.rhyme_ending_id
  // WHERE word = ?
  //
  // SELECT * #w_2.word, COUNT(s_2.id) as count
  // FROM rhyme_words         w_1
  // JOIN rhyme_endings       e_1 ON e_1.id   = w_1.rhyme_ending_id
  // JOIN rhyme_ending_sounds s_1 ON e_1.id   = s_1.rhyme_ending_id
  // #JOIN rhyme_ending_sounds s_2 ON s_1.type = s_2.type AND s_1.sound = s_2.sound
  // #JOIN rhyme_endings       e_2 ON e_2.id   = s_2.rhyme_ending_id
  // #JOIN rhyme_words         w_2 ON e_2.id   = w_2.rhyme_ending_id
  // WHERE w_1.word = ?
  // #GROUP BY s_2.rhyme_ending_id
  // #ORDER BY count DESC
  // LIMIT 10


  // SELECT
  //   endings_2.*,
  //   COUNT(sounds_2.id) as total_matches,
  //   SUM(CASE WHEN sounds_2.position = 1 then sounds_2.score else 0 end) pos1,
  //   SUM(CASE WHEN sounds_2.position = 2 then sounds_2.score else 0 end) pos2,
  //   SUM(CASE WHEN sounds_2.position = 3 then sounds_2.score else 0 end) pos3,
  //   SUM(CASE WHEN sounds_2.position = 4 then sounds_2.score else 0 end) pos4
  // FROM rhyme_words
  //   AS words_1
  // JOIN rhyme_endings
  //   AS endings_1
  //   ON endings_1.id = words_1.rhyme_ending_id
  // JOIN rhyme_ending_sounds
  //   AS sounds_1
  //   ON endings_1.id = sounds_1.rhyme_ending_id
  // JOIN rhyme_ending_sounds
  //   AS sounds_2
  //   ON sounds_1.ends_in_a_consonant = sounds_2.ends_in_a_consonant
  //  AND sounds_1.position = sounds_2.position
  //  AND sounds_1.sound = sounds_2.sound
  // JOIN rhyme_endings
  //   AS endings_2
  //   ON endings_2.id = sounds_2.rhyme_ending_id
  // WHERE words_1.word = ?
  // GROUP BY sounds_2.rhyme_ending_id
  //   HAVING pos1 != 0
  //   AND pos2 != 0
  // ORDER BY total_matches DESC
  // LIMIT 5
