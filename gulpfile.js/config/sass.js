var config = require('./')

module.exports = {
  autoprefixer: { browsers: ['last 2 version'] },
  src: config.sourceAssets + "/stylesheets/**/*.scss",
  dest: config.publicAssets + '/stylesheets',
  settings: {
    imagePath: 'assets/images' // Used by the image-url helper
  }
}
