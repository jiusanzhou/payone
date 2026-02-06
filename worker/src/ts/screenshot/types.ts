export interface ScreenshotOptions {
    width: number
    height: number
    type?: 'png' | 'jpeg' | 'svg'
    quality?: number
}

export interface ScreenshotResult {
    data: ArrayBuffer | string
    contentType: string
}

export interface PaymentChannelData {
    name: string
    title: string
    logo: string
    color: string
    value: string
}

export interface ScreenshotData {
    code: string
    title?: string
    subtitle?: string
    excerpt?: string
    channels: PaymentChannelData[]
    pageUrl: string
    isBanner?: boolean
}

export interface ScreenshotProvider {
    readonly name: string
    render(data: ScreenshotData, options: ScreenshotOptions): Promise<ScreenshotResult>
}
