var gulp = require('gulp')
var stylus = require('gulp-stylus')
var util = require('gulp-util')
var browserSync = require('browser-sync')
var autoprefixer = require("gulp-autoprefixer")
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var notify = require("gulp-notify")
var uglify = require('gulp-uglify');
var babel = require('gulp-babel')
var filter = require('gulp-filter')

gulp.task('server', function () {
  browserSync.init({
    proxy: "localhost:9000",
    ghostMode: false,
    open: false,
    notify: true,
    reloadOnRestart: false,
    injectChanges: true,
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: function (snippet, match) {
          return snippet + match;
        }
      }
    },
    // files: ["./public/styles/*.css"]
  })
})

.task('js', function () {
  gulp.src('scripts/script.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .on('error', swallowError)
    .pipe(uglify())
    .on('error', swallowError)
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest('./scripts/'))
})

.task('css', function () {
  gulp.src('styles/style.styl')
    .pipe(sourcemaps.init())
    .pipe(
      stylus({
        compress: true
      })
    )
    .on('error', swallowError)
    .pipe(autoprefixer({
      browsers: ['last 10 versions', 'safari 5', 'ie 6', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
    }))
    // .pipe(sourcemaps.write('./styles'))
    // .pipe(concat('style.min.css'))
    .pipe(gulp.dest('./styles'))
    // .pipe(filter(['*.css', '*/*/*.css', '*/*.css']))
    .pipe(browserSync.stream())
    .pipe(browserSync.reload({stream:true}));
})
// .task('css2', function () {
//   gulp.src('./public/styles/style.min.css')
//     .pipe(browserSync.stream())
//     console.log('haha')
// })

.task('default', ['css', 'server',], function () {
  gulp.watch(['scripts/script.js'], ['js']).on('change', browserSync.reload)
  gulp.watch(['styles/*.styl'], ['css'])
  // gulp.watch(['./public/styles/*.css'], ['css2'])
  // gulp.watch(['./public/styles/style.min.css']).on('change', browserSync.reload)
})

function swallowError(error) {
  notify(error.message)
  console.log(error.toString());
  this.emit('end');
}
