process.env.CHROME_BIN = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    plugins: ['karma-jasmine', 'karma-webpack', 'karma-chrome-launcher', 'karma-coverage'],
    files: ['test/index.js'],
    preprocessors: { 'test/index.js': ['webpack'] },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            type: 'javascript/auto', // package.json es "module": permite require.context
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
              },
            },
          },
          {
            // instrumenta solo src/, sin specs, para que el reporte use nombres reales
            test: /\.jsx?$/,
            include: /[\\/]src[\\/]/,
            exclude: /\.spec\.jsx?$/,
            enforce: 'post',
            use: { loader: 'babel-loader', options: { plugins: ['istanbul'], babelrc: false, configFile: false } },
          },
        ],
      },
    },
    browsers: ['ChromeHeadless'],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [{ type: 'html', subdir: '.' }, { type: 'lcovonly', subdir: '.', file: 'lcov.info' }, { type: 'text-summary' }],
    },
  })
}
