const CracoAlias = require('craco-alias')
const CracoAntDesign = require('craco-antd')

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      debug: true,
      options: {
        source: 'jsconfig',
        baseUrl: './src',
      },
    },
    {
      plugin: CracoAntDesign,
    },
  ],
}
