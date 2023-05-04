const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

const pwa = withPWA({
  dest: 'public',
})

module.exports = {
  ...pwa,
  webpack: (config, options) => {
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/s/:code(.+?)\\.:ext(.+)",
        destination: "/api/s/:code*?type=image&ext=:ext*",
      }
    ];
  }
}