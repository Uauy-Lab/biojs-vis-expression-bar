var path = require('path');
var webpack = require('webpack');
module.exports = {
  entry: './lib/biovisexpressionbar.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development'
};