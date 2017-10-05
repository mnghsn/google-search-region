module.exports = {
  shortcuts: [
    {
      name: 'pkg',
      expand: function (file, ...args) {
        return `../package.json|parse:${args.join()}`
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
