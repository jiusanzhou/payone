import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '..'),
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

export default nextConfig
