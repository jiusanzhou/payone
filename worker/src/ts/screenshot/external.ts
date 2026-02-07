import type { ScreenshotProvider, ScreenshotData, ScreenshotOptions, ScreenshotResult } from './types'

export class ExternalProvider implements ScreenshotProvider {
    readonly name: string
    private endpoint: string
    private targetUrlKey: string
    private defaultOptions: Record<string, string>
    private mapKeys: Record<string, string>

    constructor(config: {
        name: string
        endpoint: string
        targetUrlKey?: string
        defaultOptions?: Record<string, string>
        mapKeys?: Record<string, string>
    }) {
        this.name = config.name
        this.endpoint = config.endpoint
        this.targetUrlKey = config.targetUrlKey || 'url'
        this.defaultOptions = config.defaultOptions || {}
        this.mapKeys = config.mapKeys || {}
    }

    async render(data: ScreenshotData, options: ScreenshotOptions): Promise<ScreenshotResult> {
        const opts: Record<string, string> = { ...this.defaultOptions }

        opts[this.mapKeys['width'] || 'width'] = String(options.width)
        opts[this.mapKeys['height'] || 'height'] = String(options.height)

        const pageUrl = data.isBanner
            ? `https://payone.wencai.app/s/${data.code}/banner`
            : `https://payone.wencai.app/s/${data.code}`

        opts[this.targetUrlKey] = pageUrl

        const query = Object.entries(opts)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&')

        const screenshotUrl = `${this.endpoint}?${query}`

        const response = await fetch(screenshotUrl, { redirect: 'follow' })

        if (!response.ok) {
            throw new Error(`External screenshot failed: ${response.status}`)
        }

        const contentType = response.headers.get('content-type') || 'image/png'
        const data_buffer = await response.arrayBuffer()

        return { data: data_buffer, contentType }
    }
}

export const MicrolinkProvider = new ExternalProvider({
    name: 'microlink',
    endpoint: 'https://api.microlink.io/',
    targetUrlKey: 'url',
    defaultOptions: {
        waitUntil: 'networkidle2',
        waitForTimeout: '500',
        fullPage: 'true',
        screenshot: 'true',
        embed: 'screenshot.url',
    },
    mapKeys: {
        width: 'viewport.width',
        height: 'viewport.height',
    },
})

export const ShotsapiProvider = new ExternalProvider({
    name: 'shotsapi',
    endpoint: 'https://shot.screenshotapi.net/screenshot',
    targetUrlKey: 'url',
    defaultOptions: {
        full_page: 'true',
        output: 'image',
        file_type: 'png',
    },
})
