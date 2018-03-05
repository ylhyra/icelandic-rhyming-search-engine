var LineByLineReader = require('line-by-line')
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  database: 'rhyme',
  user: 'egill',
  password: 'egillegillegill',
  multipleStatements: true,
});

// connection.connect();
// connection.query(`TRUNCATE TABLE rhyme_words`)
// connection.query(`TRUNCATE TABLE rhyme_endings`)
// connection.query(`TRUNCATE TABLE rhyme_ending_sounds`)



// TRUNCATE TABLE rhyme_words;
// TRUNCATE TABLE rhyme_endings;
// TRUNCATE TABLE rhyme_ending_sounds;


const sérhljóðar = /(ei|au|a|e|i|o|u|y|á|é|í|ó|ú|ý|ö|æ)/g
const ipa_sérhljóðar = /(ai:?|au:?|ei:?|ou:?|œi:?|i:?|u:?|a:?|u:?|e:?|o:?|œ:?|ɪ:?|ɔ:?|ʏ:?|ɛ:?)/g

const run = (callback) => {

  var lr = new LineByLineReader('setup/Data/pronunciation.csv')
  lr.on('error', function(err) {
    console.log(err)
  });
  var count = 0

  lr.on('line', function(line) {
    lr.pause()
    var split = line.split(';;')
    var word = split[0]

    if (count % 100 === 0) {
      console.log(word)
    }

    var pronunciation = split[1].replace(/ /g, '')
      .replace(/(m̥|n̥|ɲ̊|ɲ|ŋ̊|ŋ̥|ŋ)/g, 'N') // Nefhljóð
      .replace(/ʰ/g, '') // Fráblástur óþarfur

    if (/[^A-zÀ-ÿ]/.test(word)) { // Rusl-línur
      lr.resume()
    } else {


      // if(word == 'kona') {
      //   console.log(line)
      //   console.log(word)
      //   console.log(/[^A-zÀ-ÿ]/.test(word))
      // } else {
      //   lr.resume()
      //
      // }
      if(pronunciation && !pronunciation.match(ipa_sérhljóðar)) {
        lr.resume()
        return
      }
      const syllables = pronunciation ?
        pronunciation.match(ipa_sérhljóðar).length :
        word.match(sérhljóðar).length

      const word_split = word.toLowerCase().split(sérhljóðar)
      const last_syllables = word_split.slice(-4).join('')
      const last_syllable = word_split.slice(-2).join('')

      const ipa_split = pronunciation.split(ipa_sérhljóðar)
      const last_ipa_syllables = ipa_split.slice(-4).join('')
      const last_ipa_syllable = ipa_split.slice(-2).join('')

      count++
      // if (count > 10) {
      //   process.exit()
      // }

      get_rhyme_ending_id(last_syllables, last_ipa_syllables, (id, already_exists) => {
        if (!already_exists) {
          save_sounds(ipa_split, id, () => {
            save_word(
              word,
              last_syllables,
              last_syllable,
              id,
              syllables,
              () => {
                lr.resume()
                // if (count > 10000000) {
                //   process.exit()
                // } else {
                //   lr.resume()
                // }
              })
          })
        } else {
          save_word(
            word,
            last_syllables,
            last_syllable,
            id,
            syllables, () => {
              lr.resume()
              // if (count > 10000000) {
              //   process.exit()
              // } else {
              //   lr.resume()
              // }
            })
        }
      })
    }
  });
  lr.on('end', function() {
    connection.end();
    callback()
  });
}

module.exports = run

const get_rhyme_ending_id = (last_syllables, last_ipa_syllables, callback) => {
  connection.query(
    `SELECT id FROM rhyme_endings WHERE
      ending = ? AND
      ending_pronunciation = ? LIMIT 1`, [last_syllables, last_ipa_syllables],
    (error, results, fields) => {
      if (error) throw error
      if (results.length > 0) {
        callback(results[0].id, true)
      } else {
        connection.query(
          `INSERT INTO rhyme_endings SET
            ending = ?,
            ending_pronunciation = ?;
            SELECT LAST_INSERT_ID() as id;`, [last_syllables, last_ipa_syllables],
          function(error, results, fields) {
            if (error) throw error;
            callback(results[1][0].id, false)
          });
      }
    });
}

const save_word = (
  word,
  last_syllables,
  last_syllable,
  rhyme_ending_id,
  syllables,
  callback) => {
  connection.query(
    `INSERT INTO rhyme_words SET
      word = ?,
      lowercase_word = ?,
      last_syllables = ?,
      last_syllable = ?,
      rhyme_ending_id = ?,
      syllables = ?
    `, [
      word,
      word.toLowerCase(),
      last_syllables,
      last_syllable,
      rhyme_ending_id,
      syllables
    ],
    function(error, results, fields) {
      if (error) throw error;
      callback()
    });
}

const save_sounds = (ipa_split, id, callback) => {
  const næstsíðasti_samhljóði = ipa_split.length > 4 ? ipa_split[ipa_split.length - 4] : ''
  const næstsíðasti_sérhljóði = ipa_split.length > 3 ? ipa_split[ipa_split.length - 3] : ''
  const síðasti_samhljóði = ipa_split.length > 2 ? ipa_split[ipa_split.length - 2] : ''
  const síðasti_sérhljóði = ipa_split.length > 1 ? ipa_split[ipa_split.length - 1] : ''
  const ends_in_a_consonant = síðasti_sérhljóði !== ''
  let array = []
  array = array.concat(getSounds(70, 4, ends_in_a_consonant, næstsíðasti_samhljóði))
  array = array.concat(getSounds(70, 3, ends_in_a_consonant, næstsíðasti_sérhljóði))
  array = array.concat(getSounds(100, 2, ends_in_a_consonant, síðasti_samhljóði))
  array = array.concat(getSounds(100, 1, ends_in_a_consonant, síðasti_sérhljóði))
  const query = array.map(a => (
    `INSERT INTO rhyme_ending_sounds SET
      position = "${a.position}",
      sound = "${a.sound}",
      score = ${a.score},
      ends_in_a_consonant = ${ends_in_a_consonant},
      rhyme_ending_id = ${id};`
  )).join('')


  connection.query(query, function(error, results, fields) {
    if (error) throw error;
    // process.exit()
    callback()
  });
}

const getSounds = (score, position, ends_in_a_consonant, sound) => {
  if (sound === '') {
    return []
  }
  let array = [{
    sound,
    position: position - !ends_in_a_consonant,
    score: score - 1,
  }]
  similar_sounds.forEach((item, index) => {
    let newSound = sound
    item.sounds.forEach(replSounds => {
      if (replSounds == '') return
      const re = new RegExp(replSounds, 'g')
      newSound = newSound.replace(re, singleLetterReplacements[index])
    })
    if (sound !== newSound) {
      array.push({
        sound: newSound,
        position: position - !ends_in_a_consonant,
        score: Math.round(score * item.similarity * 0.1)
      })
    }
  })
  return array
}


const similar_sounds = [{
  sounds: ['r̥', 'x', 'f'], // svö(r)tum - vö(k)tum - hö(f)tum
  similarity: 0.6
}, {
  sounds: ['f', 'v', 'θ', 'ð', 's', 'ç', 'j', 'x', 'ɣ', 'h'], // Önghljóð
  similarity: 0.4
}, {
  sounds: ['v', 'ð', 'j', 'ɣ', ],
  similarity: 0.8
}, {
  sounds: ['f', 'θ', ],
  similarity: 0.9
}, {
  sounds: ['p', 't', 'c', 'k'], // Lokhljóð
  similarity: 0.5
}, {
  sounds: ['m', 'n', 'N'], // Nefhljóð
  similarity: 0.8
}, {
  sounds: ['œi', 'œ', 'ʏ'], // au, ö, u
  similarity: 0.1
}, {
  sounds: ['ei', 'i'], // ei, í
  similarity: 0.01
}, {
  sounds: ['ei', 'ɛ'], // seilur, selur
  similarity: 0.5
}, {
  sounds: ['a', 'ɛ'], // lati, leti
  similarity: 0.1
}, {
  sounds: ['ɪ', 'ɛ'], // litir, líter
  similarity: 0.2
}, {
  sounds: ['ʏi', 'oi'], // hugi, logi
  similarity: 0.4
}, {
  sounds: ['œ', 'ʏ'], // mönnum, munnum
  similarity: 0.1
}, {
  sounds: ['sc', 'st', ], // bústinn - rúskinn
  similarity: 0.5
}, {
  sounds: ['', '', '', '', ], //
  similarity: 0
}, {
  sounds: ['', '', '', '', ], //
  similarity: 0
}, {
  sounds: ['', '', '', '', ], //
  similarity: 0
}, ]

const singleLetterReplacements = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V',
  'X', 'Y', 'Z'
]
