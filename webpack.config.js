const SassWebpackConfig = require('./webpack/sass');
const FileWebpackConfig = require('./webpack/file');
const DotenvWebpackConfig = require('./webpack/dotenv');

const path = require('path');

const OPTIONS = {
  id: 'lokalocal',
  input: './client/index.js',
  output: './dist/lokalocal.js'
};


class WebpackConfig {
  constructor(options) {
    this.entry = {
      [options.id]: options.input,
    };
    this.target = 'web';
    this.output = {
      path: path.resolve(__dirname, 'assets'),
      filename: options.output
    };
    this.module = {
      rules: []
    };
    this.plugins = [];

    this.externals = {
      fs: '{}',
      tls: '{}',
      net: '{}',
      console: '{}',
      child_process: 'false'
    };
  }

  add({ module, plugins }) {
    if (module) {
      let {rules} = module;

      this.module = {
        ...this.module,
        rules: [
          ...this.module.rules,
          ...rules
        ]
      };
    }

    if (plugins) {
      this.plugins = [...this.plugins, ...plugins];
    }

    return this;
  }
}

let webpackConfig = new WebpackConfig(OPTIONS);

webpackConfig
  .add(new SassWebpackConfig(/\.scss$/, { name: 'dist/[name].css' }))
  .add(new FileWebpackConfig(/\.(png|gif|svg|woff|woff2|jpg|jpeg|ttf|otf|eot)$/))
  .add(new DotenvWebpackConfig({ path: './.env' }));

module.exports = webpackConfig;
