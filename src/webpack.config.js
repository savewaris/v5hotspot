const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: 'C:/Users/gistda/Desktop/save/v5hotspot/src/server.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  resolve: {
    fallback: {
      "assert": require.resolve("assert/"),
      "buffer": require.resolve("buffer/"),
      "fs": false,
      "os": require.resolve("os-browserify/browser"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "crypto": require.resolve("crypto-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "path": require.resolve("path-browserify"),
      "querystring": require.resolve("querystring-es3"),
      "dns": require.resolve("dns"),
      "net": require.resolve("net"),
      "tls": require.resolve("tls"),
      "vm": require.resolve("vm-browserify"),
      "dgram": false,
      "async_hooks": require.resolve("node-libs-browser/mock/empty"), // Use node-libs-browser for async_hooks
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new NodePolyfillPlugin()
  ],
  node: {
    global: true,
    __filename: true,
    __dirname: true,
  },
  externals: {
    'pg-native': 'commonjs pg-native'
  }
};
