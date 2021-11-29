var path = require('path');
var webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: './lib/biovisexpressionbar.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
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