const path = require('path');

module.exports = {
  mode: 'production',
  entry: './client/public/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    
  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use babel-loader for JavaScript files
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  externals: {
    // Add Leaflet to externals to prevent it from being bundled by webpack
    'leaflet': 'L',
  },
};
