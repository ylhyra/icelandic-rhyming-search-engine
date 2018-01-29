/*
node setup/Insert/index.js
*/

var pronunciation = require('./pronunciation');
var other = require('./other');
var frequency = require('./frequency');

pronunciation(()=>{
  other(()=>{
    frequency(()=>{
      process.exit()
    })
  })
})
