function FileWebpackConfig(test, options) {
  this.module = {
    rules: [
      {
        test,
        loaders: [
          { loader: 'url-loader' }
        ]
      }
    ]
  };
}

module.exports = FileWebpackConfig;
