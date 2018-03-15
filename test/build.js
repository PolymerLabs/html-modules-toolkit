const {
  htmlModuleSpecifierTransform,
  htmlModuleTransform
} = require('../lib/index');

const vfs = require('vinyl-fs');

const build = (inputFiles, destination) => new Promise((resolve, reject) => {
  vfs.src(inputFiles)
      .pipe(htmlModuleTransform(file => {
        return /\.html$/.test(file.path) && !/index\.html$/.test(file.path);
      }))
      .on('error', error => reject(error))
      .pipe(htmlModuleSpecifierTransform())
      .on('error', error => reject(error))
      .pipe(vfs.dest(destination))
      .on('error', error => reject(error))
      .on('finish', () => resolve());
});

build(['./src/*'], './dist')
    .catch(error => console.error(error))
    .then(() => console.log('Done!'));
