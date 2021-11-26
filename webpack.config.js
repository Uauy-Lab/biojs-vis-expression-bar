var path = require('path');
  
module.exports = {
  entry: './lib/biovisexpressionbar.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development'
};