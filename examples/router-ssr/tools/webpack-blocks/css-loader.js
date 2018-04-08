module.exports = function cssLoader (include) {
  return (context) => ({
    module: {
      loaders: [
        {
          test: context.fileType('text/css'),
          loaders: [ 'style-loader', 'css-loader' ],
          include
        }
      ]
    }
  })
}
