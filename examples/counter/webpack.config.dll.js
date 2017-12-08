const webpack = require('webpack')
const { uglify } = require('webpack-blocks')
const {
  createConfig, defineConstants, env, addPlugins,
  entryPoint, setOutput, sourceMaps,
  customConfig,
} = require('@webpack-blocks/webpack')
const path = require('path')
const devServer = require('@webpack-blocks/dev-server')
// const cssModules = require('./tools/webpack-blocks/css-loader')

const DIST = `${__dirname}/static/dist`

module.exports = createConfig([
  entryPoint({
    vendor: ['./src/vendor.ts'],
  }),
  setOutput({
    filename: '[name].dll.js',
    path: DIST,
    publicPath: '/static/dist',
    library: '[name]', // needed for dll plugin
  }),
  // cssModules(),
  defineConstants({
    'process.env.NODE_ENV': process.env.NODE_ENV,
  }),
  customConfig({
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
  }),
  uglify({
    parallel: true,
    cache: true,
    uglifyOptions: {
      minimize: true,
      output: {
        comments: false,
      },
    },
  }),
  addPlugins([
    new webpack.DllPlugin({
      path: `${DIST}/[name]-manifest.json`,
      name: '[name]',
      context: __dirname,
    }),
    // cannot live with `-p` in command line
  ]),
  sourceMaps(),
])
