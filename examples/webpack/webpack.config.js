/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const {HtmlModulesPlugin} =
    require('../../lib/html-module-transform/webpack-plugin.js');
const {resolve} = require('path');

module.exports = {
  entry: {
    index: './src/modules/entrypoint-one.html',
    about: './src/modules/entrypoint-two.js'
  },
  output: {path: resolve('./dist')},
  plugins: [new HtmlWebpackPlugin(), new HtmlModulesPlugin()]
};
