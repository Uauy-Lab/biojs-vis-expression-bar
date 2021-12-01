var path = require('path');
var webpack = require('webpack');

// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  target: 'web',
  entry: './index.js',
  output: {
    filename: 'bio-vis-expression-bar.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'biovisexpressionbar',
    libraryTarget: 'umd',
    globalObject: 'window'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  externals: {
    jquery: 'jQuery',
    jqueryui: 'jquery-ui',
    science: "require('science')"
  },
  module: {
		rules: [
			{
				test: /\.css$/,
				loader: 'css-loader',
        options: {
          modules: {
            mode: "web",
          }
        }
      },
			{
				test: /\.(jpg|png)$/,
				use: 'file-loader'
			},
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
		]
	},
  resolveLoader: {
    modules: [
        path.join(__dirname, 'node_modules')
    ]
},
  resolve: {
    extensions: ['.js'],
    modules: [path.resolve(__dirname, 'node_modules')],
  },

};