DROP DATABASE IF EXISTS rhyme2;
CREATE DATABASE rhyme2
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_icelandic_ci;
USE rhyme2;

GRANT ALL ON `rhyme2`.* TO 'ylhyra_dev'@'localhost' IDENTIFIED BY 'ylhyra_dev';


DROP TABLE IF EXISTS rhyme_words;
CREATE TABLE rhyme_words (
  id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(40),
  lowercase_word VARCHAR(40),
  last_syllables VARCHAR(40),
  last_syllable VARCHAR(40),
  rhyme_ending_id INT(6) UNSIGNED,
  syllables INT(2) UNSIGNED,
  popularity INT(2) UNSIGNED
);
CREATE INDEX _id ON rhyme_words (id);
CREATE INDEX _lowercase_word ON rhyme_words (lowercase_word);
CREATE INDEX _last_syllables ON rhyme_words (last_syllables);
CREATE INDEX _last_syllable ON rhyme_words (last_syllable);
CREATE INDEX _rhyme_ending_id ON rhyme_words (rhyme_ending_id);
CREATE INDEX _syllables ON rhyme_words (syllables);

DROP TABLE IF EXISTS rhyme_endings;
CREATE TABLE rhyme_endings (
  id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ending_pronunciation VARCHAR(18),
  ending VARCHAR(15)
);
CREATE INDEX _id ON rhyme_endings (id);
CREATE INDEX _ending_pronunciation ON rhyme_endings (ending_pronunciation);
CREATE INDEX _ending ON rhyme_endings (ending);

DROP TABLE IF EXISTS rhyme_ending_sounds;
CREATE TABLE rhyme_ending_sounds (
  id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  position INT(1) UNSIGNED,
  sound VARCHAR(15),
  score INT(2) UNSIGNED,
  ends_in_a_consonant BOOL,
  rhyme_ending_id INT(6) UNSIGNED
);
CREATE INDEX _id ON rhyme_ending_sounds (id);
CREATE INDEX _position ON rhyme_ending_sounds (position);
CREATE INDEX _sound ON rhyme_ending_sounds (sound);
CREATE INDEX _score ON rhyme_ending_sounds (score);
CREATE INDEX _rhyme_ending_id ON rhyme_ending_sounds (rhyme_ending_id);
