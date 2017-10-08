/*
node setup/Insert/index.js
*/

var pronounciation = require('./pronounciation');
var other = require('./other');
var frequency = require('./frequency');

pronounciation(()=>{
  other(()=>{
    frequency(()=>{
      process.exit()
    })
  })
})
