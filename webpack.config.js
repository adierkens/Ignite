const path = require('path');
const globby = require('globby');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MarkdownRenderer = require('marked').Renderer;
const highlightjs = require('highlight.js');

const renderer = new MarkdownRenderer();
renderer.code = (code, language) => {
  const validLang = Boolean(language && highlightjs.getLanguage(language));
  const highlighted = validLang
    ? highlightjs.highlight(language, code).value
    : code;
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
};

function BundleDocs(options) {
  // Setup the plugin instance with options...
  console.log(options, this);
}

BundleDocs.prototype.apply = function(compiler) {
  compiler.plugin('done', function() {
    console.log('Hello World!');
    console.log(global.docs);
  });
};

module.exports = function(options = {}) {
  const docs = globby.sync([path.join(options.src, '**/*.md')]);
  const docHTML = docs.map(doc => {
    return new HtmlWebPackPlugin({
      template: doc,
      filename: doc.replace('.md', '.html')
    });
  });

  return {
    mode: 'development',
    entry: [...docs.map(doc => path.resolve(doc)), './src/index.js'],

    output: {
      path: options.dst ? path.resolve(options.dst) : null,
      filename: 'bundle.js'
    },

    // devServer: {
    //   contentBase: path.join(__dirname, 'dist')
    // },

    module: {
      rules: [
        {
          test: /\.md$/,
          use: [
            {
              loader: 'html-loader'
            },
            {
              loader: path.resolve('./dist/markdown-to-react.js')
            },
            // {
            //   loader: (arg) => {
            //     console.log('here')
            //     return arg
            //   }
            // },
            // Create loader to Render parsed markdown html as React Component and change above html-loader to babel-loader
            // Create loader to transform .md links to .html
            {
              loader: 'markdown-loader',
              options: {
                pedantic: true,
                renderer
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]_[local]_[hash:base64]',
                sourceMap: true,
                minimize: true
              }
            }
          ]
        }
      ]
    },

    plugins: [
      ...docHTML,
      new BundleDocs({ options: true }),
      new HtmlWebPackPlugin({
        template: './src/index.html',
        filename: './index.html'
      })
    ]
  };
};