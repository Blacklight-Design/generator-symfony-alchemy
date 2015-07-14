# Symfony Alchemy

Gulp recipes for asset management in Symfony applications.

## About

Symfony Alchemy comes in the form of a [Yeoman](http://yeoman.io/) generator. If all the dependencies are installed you
can get up and running with some sleek asset management with one simple command.

Check the documentation below for more information.

### Features

- Concatenates JS and CSS
- Minifies JS and CSS
- Optimizes images
- Bower compatible
- Watches files and live reloads via BrowserSync

## Installation

First install all the dependencies:

- Install Node: https://nodejs.org/
- Install Gulp: `npm install -g gulp`
- Install Yeoman: `npm install -g yeoman`
- Install Symfony Alchemy: `npm install -g generator-symfony-alchemy`

Now that all the dependencies are in place you can install Symfony Alchemy. Ensure that you are in the root of your
Symfony2 application and run the following command:

```
yo symfony-alchemy
```

## Usage

To watch for file changes simply run `gulp watch`.

The following commands are also available:

```
gulp js
gulp css
gulp fonts
gulp images
gulp clean
gulp build
```

The difference between `build` and the `default` task is that the build task will minify all assets.

### assets.json

In this file you can specify all the main CSS and JS files you require. You can also specify all the files that should
be included in the making of that file. The structure is as follows:

```
{
  "css": {
    "main.css": [
      "app/Resources/public/css/app.css"
    ]
  },
  "js": {
    "main.js": [
      "app/Resources/public/js/app.js"
    ]
  },
  "replace": {
    "images/": "img/"
  }
}
```

See the included `assets.json` file for more information.

#### replace

Some libraries installed via bower might be looking for files in directories different from Symfony Alchemy's output
directory. The replace section allows you to define simple search and replace strings to try and resolve this during
the build. The format is as follows:

```
<search string>: <replace string>
```

## Changelog

### 1.0.0 (2015-07-14)

Initial Commit

## License

MIT
