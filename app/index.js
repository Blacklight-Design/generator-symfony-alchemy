'use strict';

var yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    yosay = require('yosay'),
    path = require('path');

module.exports = yeoman.generators.Base.extend({
  // Initialize some defaults.
  initializing: function () {
    this.pkg = require('../package.json');

    this.browserSyncDomain = 'localhost';
    this.cssPreprocessor = 'None';
    this.es6 = false;
  },

  // Prompt user for some information.
  prompting: function () {
    var done = this.async();

    // Say hello!
    this.log(yosay(
      'Welcome to ' + chalk.red.bold('Symfony Alchemy') + '!!!'
    ));

    var prompts = [
      {
        name: 'appName',
        message: 'What is your app\'s name?',
        default: path.basename(this.destinationRoot())
      },
      {
        name: 'browserSyncDomain',
        message: 'What is your app\'s local domain?',
        default: 'localhost'
      },
      {
        name: 'cssPreprocessor',
        message: 'Are you using any CSS preprocessor?',
        type: 'list',
        choices: ['SASS', 'Less', 'None'],
        default: 'SASS'
      },
      {
        name: 'es6',
        message: 'Are you going to be using any ES6 features?',
        type: 'confirm',
        default: true
      }
    ];

    this.prompt(prompts, function (props) {
      this.appName = props.appName;
      this.browserSyncDomain = props.browserSyncDomain;
      this.cssPreprocessor = props.cssPreprocessor;
      this.es6 = !props.es6 ? false : props.es6;

      done();
    }.bind(this));
  },

  // Write the files provided by Symfony Alchemy.
  writing: {
    // Copy some asset files.
    asset: function () {
      // Create some default directories.
      this.mkdir('app/Resources/public/css');
      this.mkdir('app/Resources/public/js');
      this.mkdir('app/Resources/public/fonts');
      this.mkdir('app/Resources/public/img');
      this.mkdir('app/Resources/public/vendor');

      // Copy the JS files.
      this.fs.copy(
        this.templatePath('js/_app.js'),
        this.destinationPath('app/Resources/public/js/app.js')
      );

      // Copy the CSS files based on user input.
      if (this.cssPreprocessor == 'SASS') {
        this.fs.copyTpl(
          this.templatePath('css/_app.scss'),
          this.destinationPath('app/Resources/public/css/app.scss'),
          {use_compass: this.useCompass}
        );
      } else {
        if (this.cssPreprocessor == 'Less') {
          this.fs.copy(
            this.templatePath('css/_app.less'),
            this.destinationPath('app/Resources/public/css/app.less')
          );
        } else {
          this.fs.copy(
            this.templatePath('css/_app.css'),
            this.destinationPath('app/Resources/public/css/app.css')
          );
        }
      }
    },

    // Copy some project files.
    project: function () {
      // Bower project files.
      this.fs.copyTpl(
        this.templatePath('_bower.json'),
        this.destinationPath('bower.json'),
        {
          app_name: this.appName
        }
      );
      this.fs.copyTpl(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );

      // JSHint project files.
      this.fs.copyTpl(
        this.templatePath('_jshintrc'),
        this.destinationPath('.jshintrc'),
        {
          use_es6: this.es6
        }
      );

      // NPM project files.
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          app_name: this.appName,
          use_es6: this.es6,
          css_preprocessor: this.cssPreprocessor,
        }
      );

      // Copy Gulp file.
      this.fs.copyTpl(
        this.templatePath('_gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          css_preprocessor: this.cssPreprocessor,
          proxy_domain: this.browserSyncDomain,
          use_es6: this.es6
        }
      );

      // Fix/Create .gitignore file.
      if (this.fs.exists('.gitignore')) {
        var contents = this.fs.read('.gitignore', {defaults: ''});
        contents = contents + "\n# Symfony Alchemy\n.sass-cache\nnode_modules\napp/Resources/public/.css\napp/Resources/public/vendor/";
        this.fs.write('.gitignore', contents);
      } else {
        this.fs.copy(
          this.templatePath('gitignore'),
          this.destinationPath('.gitignore')
        );
      }

      // Copy Symfony Alchemy default file.
      this.fs.copyTpl(
        this.templatePath('_assets.json'),
        this.destinationPath('assets.json'),
        {
          css_preprocessor: this.cssPreprocessor
        }
      );
    }
  },

  // Finally, install all the requirements.
  install: function () {
    this.log('Running ' + chalk.red.bold('npm install && bower install') + '. If this command fails, try running it yourself.');
    this.npmInstall();
    this.bowerInstall();
  }
});
