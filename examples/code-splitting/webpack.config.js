const webpack = require('webpack')
const {
  createConfig, defineConstants, env, addPlugins,
  entryPoint, setOutput, sourceMaps,
  customConfig, css, uglify
} = require('webpack-blocks')
const typescript = require('@webpack-blocks/typescript')
const devServer = require('@webpack-blocks/dev-server')
const Clean = require('clean-webpack-plugin')
// const cssModules = require('./tools/webpack-blocks/css-loader')
const path = require('path')

const IS_DEV = process.env.NODE_ENV === 'development'

const DIST = `${__dirname}/static/dist/`

module.exports = createConfig([
  entryPoint({
    bundle: [
      './src/index.js',
    ].filter(Boolean),
  }),
  setOutput({
    filename: '[name].js',
    path: DIST,
    publicPath: '/static/dist/',
  }),
  css(),
  typescript(),
  defineConstants({
    'process.env.NODE_ENV': process.env.NODE_ENV,
    __DEV__: process.env.NODE_ENV === 'development',
  }),
  customConfig({
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      // baseUrl in tsconfig.json is a runtime resolver, so webpack need add resolver.modules too.
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
    node: {
      __filename: true,
      __dirname: true,
    },
  }),
  addPlugins([
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(`${DIST}/vendor-manifest.json`),
    }),
  ]),
  env('development', [
    devServer({
      clientLogLevel: 'info',
      stats: {
        assets: false,
        colors: true,
        chunks: false,
        children: false,
      },
    }),
    devServer.proxy({
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
        changeOrigin: true,
      },
    }),
    sourceMaps(),
  ]),
  env('production', [
    addPlugins([
      new Clean(['dist'], {exclude: ['vendor.dll.js', 'vendor-manifest.json']}),
      uglify(),
    ]),
    sourceMaps(),
  ]),
])
