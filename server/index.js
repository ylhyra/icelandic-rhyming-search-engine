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
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'dot')
app.use('/robots.txt', express.static(path.join(__dirname, './../public/robots.txt')))
app.use('/~', express.static(path.join(__dirname, './../public')))
app.use('/style.css', express.static(path.join(__dirname, './../public/styles/style.css')))

app.get('/um', function(req, res) {
  res.render('about', {
    layout: false, 
    about: true,
  })
})

app.get(['/', '/:string'], function(req, res) {
  let string = req.query['q'] || req.params.string
  if (string && string.trim().length > 0) {
    string = (req.query['q'] || req.params.string).replace(/[^A-zÀ-ÿ ]/g, '').slice(-200)
    rhyme(string.slice(-50), (results, error) => {
      if (error) {
        res.send(error)
      } else if (results === null) {
        res.render('index', {
          layout: false,
          string: string,
          no_results: true,
        })
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