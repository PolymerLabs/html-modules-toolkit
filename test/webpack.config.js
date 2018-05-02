const HtmlWebpackPlugin = require('html-webpack-plugin');
const {HtmlModulesPlugin} =
    require('../lib/html-module-transform/webpack-plugin.js');
const {resolve} = require('path');

module.exports = {
  entry: './src/external-js-module.js',
  output: {path: resolve('./dist')},
  plugins: [new HtmlWebpackPlugin(), new HtmlModulesPlugin()]
};
