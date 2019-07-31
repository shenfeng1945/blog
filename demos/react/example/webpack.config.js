const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devServer = {
  hot: true,
    noInfo: false,
    quiet: false,
    port: 8000,
    // #https://github.com/webpack/webpack-dev-server/issues/882
    disableHostCheck: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    inline: true,
    historyApiFallback: {
        index: '/'
    },
    stats: {
        colors: true,
        modules: false
    },
    contentBase: path.resolve(__dirname, './dist'),
    publicPath: '/'
}

module.exports = {
  context: path.resolve(__dirname, '.'),
  entry: {
    app: [
            'webpack/hot/dev-server',
            `webpack-dev-server/client?http://localhost:8000/`,
            path.resolve(__dirname, './main.js')
        ]
  },
  output: {
    filename: '[name].js',
    path: devServer.contentBase,
    publicPath: devServer.publicPath,
    sourceMapFilename: '[file].map',
    chunkFilename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: false
            }
    }),
  ]
}
