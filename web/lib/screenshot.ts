export type LayoutType = 'default' | 'banner'
export type ColorTheme = 'default' | 'minimal' | 'gradient' | 'dark' | 'neon'

export interface ScreenshotOptions {
    width?: number
    height?: number
    ext?: string
    type?: string
    device?: string
    isMobile?: boolean
    layout?: LayoutType
    theme?: ColorTheme
    [key: string]: string | number | boolean | undefined
}

export interface ScreenshotResult {
    url?: string
    redirect?: boolean
    data?: ArrayBuffer
    contentType?: string
}

export interface ScreenshotContext {
    code: string
    host: string
    layout: LayoutType
    app?: string
}

export interface ScreenshotProvider {
    readonly name: string
    generate(ctx: ScreenshotContext, options: ScreenshotOptions): Promise<ScreenshotResult>
}

export interface ProviderConfig {
    endpoint?: string
    targetUrlKey?: string
    defaultOptions?: Record<string, string | boolean | number>
    mapKeys?: Record<string, string>
}

class ProviderRegistry {
    private providers: Map<string, ScreenshotProvider> = new Map()
    private defaultProviderName: string = 'microlink'

    register(provider: ScreenshotProvider): void {
        this.providers.set(provider.name, provider)
    }

    get(name: string): ScreenshotProvider {
        const provider = this.providers.get(name)
        if (!provider) {
            const available = Array.from(this.providers.keys()).join(', ')
            throw new Error(`Unknown screenshot provider: ${name}. Available: ${available}`)
        }
        return provider
    }

    getDefault(): ScreenshotProvider {
        return this.get(this.defaultProviderName)
    }

    setDefault(name: string): void {
        if (!this.providers.has(name)) {
            throw new Error(`Cannot set default: provider '${name}' not registered`)
        }
        this.defaultProviderName = name
    }

    list(): string[] {
        return Array.from(this.providers.keys())
    }

    has(name: string): boolean {
        return this.providers.has(name)
    }
}

export const registry = new ProviderRegistry()

export class ExternalProvider implements ScreenshotProvider {
    readonly name: string
    protected endpoint: string
    protected targetUrlKey: string
    protected defaultOptions: Record<string, string | boolean | number>
    protected mapKeys: Record<string, string>

    constructor(name: string, config: ProviderConfig) {
        this.name = name
        this.endpoint = config.endpoint || ''
        this.targetUrlKey = config.targetUrlKey || 'url'
        this.defaultOptions = config.defaultOptions || {}
        this.mapKeys = config.mapKeys || {}
    }

    protected transformOptions(options: ScreenshotOptions): Record<string, string> {
        const result: Record<string, string> = {}
        
        for (const [key, value] of Object.entries(this.defaultOptions)) {
            const mappedKey = this.mapKeys[key] || key
            result[mappedKey] = String(value)
        }

        for (const [key, value] of Object.entries(options)) {
            if (value !== undefined) {
                const mappedKey = this.mapKeys[key] || key
                result[mappedKey] = String(value)
            }
        }

        return result
    }

    protected buildPageUrl(ctx: ScreenshotContext, options: ScreenshotOptions): string {
        let host = ctx.host
        if (/localhost|127.0.0.1/.test(host)) {
            host = 'payone.wencai.app'
        }

        const params: string[] = []
        if (ctx.layout === 'banner') {
            params.push('layout=banner')
        }
        if (options.theme && options.theme !== 'default') {
            params.push(`theme=${options.theme}`)
        }
        if (ctx.app) {
            params.push(`type=${ctx.app}`)
        }
        
        const queryString = params.length > 0 ? `?${params.join('&')}` : ''
        return `https://${host}/s/${ctx.code}${queryString}`
    }

    async generate(ctx: ScreenshotContext, options: ScreenshotOptions): Promise<ScreenshotResult> {
        if (!this.endpoint) {
            throw new Error(`Provider '${this.name}' has no endpoint configured`)
        }

        const opts = this.transformOptions(options)
        opts[this.targetUrlKey] = this.buildPageUrl(ctx, options)

        const query = Object.entries(opts)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&')

        return {
            url: `${this.endpoint}?${query}`,
            redirect: true,
        }
    }
}

export class WorkerProvider implements ScreenshotProvider {
    readonly name = 'worker'
    private apiUrl: string

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl.replace(/\/$/, '')
    }

    async generate(ctx: ScreenshotContext, options: ScreenshotOptions): Promise<ScreenshotResult> {
        const workerUrl = new URL(`${this.apiUrl}/api/screenshot/${ctx.code}`)
        const isBanner = ctx.layout === 'banner'
        
        if (isBanner) {
            workerUrl.searchParams.set('layout', 'banner')
            workerUrl.searchParams.set('width', String(options.width || 1200))
            workerUrl.searchParams.set('height', String(options.height || 630))
        } else {
            workerUrl.searchParams.set('width', String(options.width || 640))
            workerUrl.searchParams.set('height', String(options.height || 960))
        }

        if (options.ext) {
            workerUrl.searchParams.set('format', options.ext)
        }

        if (options.theme && options.theme !== 'default') {
            workerUrl.searchParams.set('theme', options.theme)
        }

        return {
            url: workerUrl.toString(),
            redirect: true,
        }
    }
}

export class ThumioProvider implements ScreenshotProvider {
    readonly name = 'thumio'

    protected buildPageUrl(ctx: ScreenshotContext, options: ScreenshotOptions): string {
        let host = ctx.host
        if (/localhost|127.0.0.1/.test(host)) {
            host = 'payone.wencai.app'
        }

        const params: string[] = []
        if (ctx.layout === 'banner') {
            params.push('layout=banner')
        }
        if (options.theme && options.theme !== 'default') {
            params.push(`theme=${options.theme}`)
        }
        if (ctx.app) {
            params.push(`type=${ctx.app}`)
        }
        
        const queryString = params.length > 0 ? `?${params.join('&')}` : ''
        return `https://${host}/s/${ctx.code}${queryString}`
    }

    async generate(ctx: ScreenshotContext, options: ScreenshotOptions): Promise<ScreenshotResult> {
        const pageUrl = this.buildPageUrl(ctx, options)
        const isBanner = ctx.layout === 'banner'
        const width = options.width || (isBanner ? 1200 : 640)
        const crop = options.height || (isBanner ? 630 : 960)
        
        const url = `https://image.thum.io/get/width/${width}/crop/${crop}/png/noanimate/${encodeURIComponent(pageUrl)}`

        return {
            url,
            redirect: true,
        }
    }
}

export class ApiFlashProvider implements ScreenshotProvider {
    readonly name = 'apiflash'
    private accessKey: string

    constructor(accessKey?: string) {
        this.accessKey = accessKey || ''
    }

    protected buildPageUrl(ctx: ScreenshotContext, options: ScreenshotOptions): string {
        let host = ctx.host
        if (/localhost|127.0.0.1/.test(host)) {
            host = 'payone.wencai.app'
        }

        const params: string[] = []
        if (ctx.layout === 'banner') {
            params.push('layout=banner')
        }
        if (options.theme && options.theme !== 'default') {
            params.push(`theme=${options.theme}`)
        }
        if (ctx.app) {
            params.push(`type=${ctx.app}`)
        }
        
        const queryString = params.length > 0 ? `?${params.join('&')}` : ''
        return `https://${host}/s/${ctx.code}${queryString}`
    }

    async generate(ctx: ScreenshotContext, options: ScreenshotOptions): Promise<ScreenshotResult> {
        if (!this.accessKey) {
            throw new Error('ApiFlash requires an access key (APIFLASH_ACCESS_KEY)')
        }

        const pageUrl = this.buildPageUrl(ctx, options)
        const isBanner = ctx.layout === 'banner'
        const width = options.width || (isBanner ? 1200 : 640)
        const height = options.height || (isBanner ? 630 : 960)
        
        const params = new URLSearchParams({
            access_key: this.accessKey,
            url: pageUrl,
            width: String(width),
            height: String(height),
            format: 'png',
            fresh: 'true',
        })

        return {
            url: `https://api.apiflash.com/v1/urltoimage?${params.toString()}`,
            redirect: true,
        }
    }
}

registry.register(new ExternalProvider('microlink', {
    endpoint: 'https://api.microlink.io/',
    targetUrlKey: 'url',
    defaultOptions: {
        waitUntil: 'networkidle2',
        waitForTimeout: '500',
        fullPage: true,
        screenshot: true,
        embed: 'screenshot.url',
    },
    mapKeys: {
        width: 'viewport.width',
        height: 'viewport.height',
        isMobile: 'viewport.isMobile',
    },
}))

registry.register(new ExternalProvider('shotsapi', {
    endpoint: 'https://shot.screenshotapi.net/screenshot',
    targetUrlKey: 'url',
    defaultOptions: {
        full_page: true,
        output: 'image',
        file_type: 'png',
    },
    mapKeys: {
        waitUntil: 'wait_for_event',
        ext: 'file_type',
    },
}))

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8787'
registry.register(new WorkerProvider(WORKER_API_URL))

registry.register(new ThumioProvider())

const APIFLASH_ACCESS_KEY = process.env.APIFLASH_ACCESS_KEY || ''
if (APIFLASH_ACCESS_KEY) {
    registry.register(new ApiFlashProvider(APIFLASH_ACCESS_KEY))
}

const DEFAULT_PROVIDER = process.env.SCREENSHOT_PROVIDER || 'worker'
if (registry.has(DEFAULT_PROVIDER)) {
    registry.setDefault(DEFAULT_PROVIDER)
}

export function getProvider(name?: string): ScreenshotProvider {
    return name ? registry.get(name) : registry.getDefault()
}

export function registerProvider(provider: ScreenshotProvider): void {
    registry.register(provider)
}

export default registry
