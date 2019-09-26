const path = require ('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    filename: process.env.NODE_ENV === 'production'  ? 'request-monitor.min.js' : 'request-monitor.js',
    path: path.resolve (__dirname, 'dist'),
    libraryTarget: "umd",
    library: ['requestMonitor'],
  },
  module:{
    rules:[{
      test: /\.js$/,
      exclude: /node_modules|__lib/,
      use: {
        loader: 'babel-loader',
      },
    }]
  },
  devtool: process.env.NODE_ENV === 'production' ? false: 'inline-source-map',
  devServer: {
    contentBase: './',
    headers: {
      'test': '1111aaa'
    }
  },
};
