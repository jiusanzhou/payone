export * from './types'
export { SatoriProvider } from './satori'
export { ExternalProvider, MicrolinkProvider, ShotsapiProvider } from './external'

import type { ScreenshotProvider } from './types'
import { SatoriProvider } from './satori'
import { MicrolinkProvider, ShotsapiProvider } from './external'

const providers: Record<string, ScreenshotProvider> = {
    satori: new SatoriProvider(),
    microlink: MicrolinkProvider,
    shotsapi: ShotsapiProvider,
}

export function getProvider(name: string): ScreenshotProvider {
    const provider = providers[name]
    if (!provider) {
        throw new Error(`Unknown screenshot provider: ${name}. Available: ${Object.keys(providers).join(', ')}`)
    }
    return provider
}

export function getDefaultProvider(): ScreenshotProvider {
    return providers.satori
}
