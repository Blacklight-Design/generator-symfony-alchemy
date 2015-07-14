'use strict';

// Load all required plugins.
var gulp = require('gulp');
var loadPlugins = require('gulp-load-plugins');
var $ = loadPlugins();
var config = require('./assets.json');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var mergeStream = require('merge-stream');

// Setup.
var srcDir = 'src';
var appDir = 'app';
var resourcePublicDir = appDir + '/Resources/public';
var destDir = 'web';
var minify = false;
var proxyDomain = '<%= proxy_domain %>';

// JS task.
gulp.task('js', function () {
  var merge = mergeStream();
  var jsDestDir = destDir + '/js';

  for (var i in config.js) {
    var stream = gulp.src(config.js[i])
      .pipe($.plumber({
        handleError: function (err) {
          $.util.log($.util.colors.red('Error (' + err.plugin + '): ' + err.message));

          this.emit('end');
        }
      }))
      .pipe($.cached('js'))
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.remember('js'))
      .pipe($.newer(jsDestDir + '/' + i))
      .pipe($.concat(i))<% if(use_es6){ %>
      .pipe($.babel())<% } %>
      .pipe($.if(minify, $.uglify()))
      .pipe(gulp.dest(jsDestDir));

    merge.add(stream);
  }

  return merge;
});

// CSS task.
gulp.task('css', function () {
  var merge = mergeStream();
  var cssDestDir = destDir + '/css';

  for (var i in config.css) {
    var stream = gulp.src(config.css[i])
      .pipe($.plumber({
        handleError: function (err) {
          $.util.log($.util.colors.red('Error (' + err.plugin + '): ' + err.message));

          this.emit('end');
        }
      }))
      .pipe($.cached('css'))<% if(css_preprocessor == 'SASS'){ %>
      .pipe($.sass())<% } %><% if(css_preprocessor == 'Less'){ %>
      .pipe($.less())<% } %>
      .pipe($.remember('css'))
      .pipe($.newer(cssDestDir + '/' + i))
      .pipe($.concat(i))
      .pipe($.if(minify, $.csso()))
      .pipe(gulp.dest(cssDestDir));

    // Search and replace.
    for (var j in config.replace) {
      stream.pipe($.replace(j, config.replace[j]));
    }

    merge.add(stream);
  }

  return merge;
});

// Images task.
gulp.task('images', function () {
  var sources = [
    resourcePublicDir + '/img/**/*.{png,jpg,gif}',
    resourcePublicDir + '/vendor/**/*.{png,jpg,gif}'
  ];

  return gulp.src(sources)
    .pipe($.plumber({
      handleError: function (err) {
        $.util.log($.util.colors.red('Error (' + err.plugin + '): ' + err.message));

        this.emit('end');
      }
    }))
    .pipe($.cached('images'))
    .pipe($.if(minify, $.imagemin({
      optimizationLevel: 3,
      interlaced: true
    })))
    .pipe($.flatten())
    .pipe(gulp.dest(destDir + '/img'));
});

// Fonts task.
gulp.task('fonts', function () {
  var sources = [
    resourcePublicDir + '/fonts/**/*{eot,svg,ttf,woff}',
    resourcePublicDir + '/vendor/**/*{eot,svg,ttf,woff}'
  ];

  return gulp.src(sources)
    .pipe($.plumber({
      handleError: function (err) {
        $.util.log($.util.colors.red('Error (' + err.plugin + '): ' + err.message));

        this.emit('end');
      }
    }))
    .pipe($.cached('fonts'))
    .pipe($.flatten())
    .pipe(gulp.dest(destDir + '/fonts'));
});

// Clean task.
gulp.task('clean', function () {
  del.sync([
    resourcePublicDir + '/.styles',
    destDir + '/css/**/*',
    destDir + '/js/**/*',
    destDir + '/fonts/**/*',
    destDir + '/img/**/*'
  ]);
});

// Build task.
gulp.task('build', function (cb) {
  minify = true;
  runSequence('clean', 'css', 'js', 'fonts', 'images', cb);
});

// Default task.
gulp.task('default', function (cb) {
  runSequence('clean', 'css', 'js', 'fonts', 'images', cb);
});

// Watch task.
gulp.task('watch', ['default'], function () {
  browserSync({
    files: [
      appDir + '/**/*.twig',
      srcDir + '/**/*.twig',
      destDir + '/**/*'
    ],
    proxy: proxyDomain
  });

  // Watch for CSS changes.
  var cssWatcher = gulp.watch(resourcePublicDir + '/css/**/*', ['css']);
  cssWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      delete $.cached.caches['css'][event.path];
      $.remember.forget('css', event.path);
    }
  });

  // Watch for JS changes.
  var jsWatcher = gulp.watch(resourcePublicDir + '/js/**/*', ['js']);
  jsWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      delete $.cached.caches['js'][event.path];
      $.remember.forget('js', event.path);
    }
  });

  // Watch for font changes.
  var fontsWatcher = gulp.watch(resourcePublicDir + '/fonts/**/*', ['fonts']);
  fontsWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      delete $.cached.caches.fonts[event.path];
    }
  });

  // Watch for images changes.
  var imagesWatcher = gulp.watch(resourcePublicDir + '/img/**/*', ['images']);
  imagesWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      delete $.cached.caches.images[event.path];
    }
  });

  // Watch for asset changes.
  var assetsWatcher = gulp.watch('assets.json', ['reload-config']);
  assetsWatcher.on('change', function () {
    $.remember.forgetAll('js');
    $.remember.forgetAll('css');
  });

  // Watch for bower changes.
  gulp.watch('bower.json', ['fonts', 'images']);
});

// Reloads the config and runs some default tasks.
gulp.task('reload-config', function(cb) {
  config = require('./assets.json');

  runSequence('default', cb);
});
