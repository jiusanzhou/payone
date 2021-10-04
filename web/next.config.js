const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

const pwa = withPWA({
  pwa: {
    dest: 'public',
    runtimeCaching,
  },
})

module.exports = {
  ...pwa,
  webpack: (config, options) => {
    return config;
  }
}