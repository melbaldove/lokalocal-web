const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

function SassWebpackConfig(test, options) {
  let extractSass = new ExtractTextWebpackPlugin(options.name);

  this.module = {
    rules: [
      {
        test,
        use: extractSass.extract({
          fallback: 'style-loader',
          use: [
            {loader: 'css-loader'},
            {loader: 'sass-loader'}
          ]
        })
      }
    ]
  };

  this.plugins = [
    extractSass
  ];
}

module.exports = SassWebpackConfig;
