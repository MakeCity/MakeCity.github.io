const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ejs = require('ejs');
const HtmlWebpackProcessingPlugin = require('./HtmlWebpackProcessingPlugin');

const paths = require('../paths')
const readContent = require('../readContent')

const content = readContent();

const createPluginsConfig = (content) => {
  return content.languages.items.map((language) => {
    const currentLang = language.code;
    const isDefaultLanguage = currentLang === content.languages.default;

    // content.appConfig.fields.data.isDonateSectionVisible = true;

    return new HtmlWebpackPlugin({
      favicon: paths.src + '/images/favicon.ico',
      template: paths.src + '/template.html', // template file
      filename: `${isDefaultLanguage ? 'index' : currentLang}.html`, // output file
      preProcessing: (originalHTML) => {
        const html = ejs.render(originalHTML, {
          appConfig: content.appConfig.fields.data,
          content: content.content[currentLang],
          languages: {
            ...content.languages,
            current: currentLang,
          },
        });
        return html;
      },
    });
  });
};

const htmlFilesPlugins = createPluginsConfig(content);

module.exports = {
  // Where webpack looks to start building the bundle
  entry: [paths.src + '/index.js'],

  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.public,
          to: 'assets',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),

    ...htmlFilesPlugins,
    new HtmlWebpackProcessingPlugin(),
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },

      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.js$/, use: ['babel-loader'] },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ],
  },

  resolve: {
    modules: [paths.src, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': paths.src,
      assets: paths.public,
    },
  },
}
