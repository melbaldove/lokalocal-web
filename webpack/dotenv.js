const DotenvWebpackPlugin = require('dotenv-webpack');

function DotenvWebpackConfig({ path }) {
  this.plugins = [
    new DotenvWebpackPlugin({ path })
  ];
}

module.exports = DotenvWebpackConfig;
