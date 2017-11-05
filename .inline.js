module.exports = {
  shortcuts: [
    {
      name: 'pkg',
      expand: function (file, ...args) {
        return `../package.json|parse:${args.join()}`
      }
    },
    {
      name: 'css',
      expand: function (file, css, indent = '0') {
        return `css/${css}.css|cssmin|indent:${indent}|trim`
      }
    },
    {
      name: 'data',
      expand: function (file, data, indent = '0') {
        return `data/${data}.json|stringify:120|indent:${indent}|trim`
      }
    },
    {
      name: 'template',
      expand: function (file, template, indent = '0') {
        return `templates/${template}.html|indent:${indent}|trim`
      }
    }
  ],

  transforms: [
    {
      name: 'indent',
      transform: function (file, content, size = '2', indent = ' ') {
        const indentString = require('indent-string')
        return indentString(content, parseInt(size, 10), { indent: indent })
      }
    },
    {
      name: 'cssmin',
      transform: function (file, content) {
        const CleanCSS = require('clean-css')
        return new CleanCSS({ keepBreaks: true }).minify(content).styles
      }
    },
    {
      name: 'stringify',
      transform: function (file, content, maxLength = '80') {
        const stringifyObject = require('stringify-object')
        return stringifyObject(JSON.parse(content), {
          indent: '  ',
          singleQuotes: true,
          inlineCharacterLimit: parseInt(maxLength, 10)
        })
      }
    }
  ]
}
