var express = require('express')
var app = express()
var fs = require('fs')
var compression = require('compression')
var doT = require('express-dot')
var path = require('path');
var morgan = require('morgan')
var FileStreamRotator = require('file-stream-rotator')
var rhyme = require('./rhyme')

doT.setGlobals({
  load: function(file) {
    return fs.readFileSync(path.join(path.dirname(process.argv[1]), file));
  }
});
// var logDirectory = path.join(__dirname, 'log')
// fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
// var accessLogStream = FileStreamRotator.getStream({
//     date_format: 'YYYYMMDD',
//     filename: path.join(logDirectory, 'access-%DATE%.log'),
//     frequency: 'daily',
//     verbose: false
//   })
// app.use(morgan('combined', {
//   stream: accessLogStream
// }))
app.enable('strict routing')
app.use(compression({}))
app.engine('dot', doT.__express)
app.set('views', './views')
app.set('view engine', 'dot')
app.use('/robots.txt', express.static('./../public/robots.txt'))
app.use('/~/dictionary.css', express.static('./../public/styles/dictionary.min.css'))
app.use('/~/:version/s.css', express.static('./../public/styles/style.min.css'))
app.use('/~/:version/s.js', express.static('./../public/scripts/script.js'))
app.use('/~', express.static('./../public'))
app.use('/style.css', express.static('./../public/styles/style.min.css'))

app.get(['/', '/:string'], function(req, res) {
  if (req.params.string || req.query['q']) {
    const string = (req.query['q'] || req.params.string).replace(/[^A-zÀ-ÿ ]/g, '')
    rhyme(string, (results, error) => {
      if(error) {
        res.send(error)
      } else {
        res.render('index', {
          layout: false,
          results: results,
          string: string,
          title: string + ' • Rímorðabók',
        })
      }
    })
  } else {
    res.render('index', {
      layout: false,
      title: 'Rímorðabók',
    })
  }
})

if (app.get('env') == 'production') {}
app.listen(9000)
