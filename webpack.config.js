var path = require('path');
var webpack = require('webpack');

// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  target: 'web',
  entry: './lib/biovisexpressionbar.js',
  output: {
    filename: 'bio-vis-expression-bar.js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'window',
    library: 'biovisexpressionbar'

  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  externals: {
    jquery: 'jQuery',
    jqueryui: 'jquery-ui'
  },
  module: {
		rules: [
			{
				test: /\.css$/,
				loader: 'css-loader',
        options: {
          modules: {
            mode: "global"
          }
        }
      },
			{
				test: /\.(jpg|png)$/,
				use: 'file-loader'
			},
		]
	}

};