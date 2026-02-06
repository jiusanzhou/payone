import satori, { init as initSatori } from 'satori/wasm'
import initYoga from 'yoga-wasm-web'
import { initWasm as initResvgWasm, Resvg } from '@resvg/resvg-wasm'
import type { ScreenshotProvider, ScreenshotData, ScreenshotOptions, ScreenshotResult } from './types'

// @ts-ignore - wasm import (esbuild bundles as binary)
import yogaWasmBinary from '../../wasm/yoga.wasm'
// @ts-ignore - wasm import (esbuild bundles as binary)
import resvgWasmBinary from '../../wasm/resvg.wasm'

const NOTO_SANS_SC_URL = 'https://fonts.gstatic.com/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYw.ttf'

let initialized = false
let fontCache: ArrayBuffer | null = null

async function ensureInitialized() {
    if (initialized) return

    // wrangler's CompiledWasm rule pre-compiles .wasm imports to WebAssembly.Module
    const yoga = await initYoga(yogaWasmBinary as WebAssembly.Module)
    await initSatori(yoga)
    await initResvgWasm(resvgWasmBinary as WebAssembly.Module)
    
    initialized = true
}

async function loadFont(): Promise<ArrayBuffer> {
    if (fontCache) return fontCache
    const res = await fetch(NOTO_SANS_SC_URL)
    fontCache = await res.arrayBuffer()
    return fontCache
}

export class SatoriProvider implements ScreenshotProvider {
    readonly name = 'satori'

    async render(data: ScreenshotData, options: ScreenshotOptions): Promise<ScreenshotResult> {
        await ensureInitialized()
        const font = await loadFont()
        const element = data.isBanner ? this.renderBanner(data) : this.renderQRCode(data)

        const svg = await satori(element, {
            width: options.width,
            height: options.height,
            fonts: [{
                name: 'Noto Sans SC',
                data: font,
                weight: 400,
                style: 'normal',
            }],
        })

        if (options.type === 'svg') {
            return { data: svg, contentType: 'image/svg+xml' }
        }

        const resvg = new Resvg(svg, {
            fitTo: { mode: 'width', value: options.width },
        })
        const pngData = resvg.render()
        const pngBuffer = pngData.asPng()

        return { data: new Uint8Array(pngBuffer).buffer, contentType: 'image/png' }
    }

    private renderQRCode(data: ScreenshotData): any {
        const cardColor = '#a855f7'

        return {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    padding: 40,
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                                justifyContent: 'center',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            gap: 16,
                                            marginBottom: 8,
                                        },
                                        children: data.channels.map(channel => ({
                                            type: 'img',
                                            props: { src: channel.logo, width: 40, height: 40 },
                                        })),
                                    },
                                },
                                data.excerpt ? {
                                    type: 'div',
                                    props: {
                                        style: { 
                                            fontSize: 16, 
                                            color: '#6b7280', 
                                            marginTop: 16,
                                            marginBottom: 20,
                                        },
                                        children: data.excerpt,
                                    },
                                } : null,
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            backgroundColor: cardColor,
                                            borderRadius: 16,
                                            padding: 24,
                                            color: 'white',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        },
                                        children: [
                                            data.subtitle ? {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
                                                    children: data.subtitle,
                                                },
                                            } : null,
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                                        borderRadius: 12,
                                                        padding: 12,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    },
                                                    children: {
                                                        type: 'img',
                                                        props: {
                                                            src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pageUrl)}`,
                                                            width: 180,
                                                            height: 180,
                                                            style: { borderRadius: 8 },
                                                        },
                                                    },
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { 
                                                        fontSize: 14, 
                                                        opacity: 0.9, 
                                                        marginTop: 16, 
                                                        textAlign: 'center',
                                                    },
                                                    children: '请打开支持的付款软件并扫一扫',
                                                },
                                            },
                                        ].filter(Boolean),
                                    },
                                },
                            ].filter(Boolean),
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 48,
                                borderTop: '1px solid #e5e7eb',
                                width: '100%',
                                marginTop: 20,
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: { fontSize: 14, color: '#6b7280' },
                                        children: 'Powered by ',
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: { 
                                            fontSize: 14, 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(to right, #a855f7, #ef4444)',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                        },
                                        children: 'PayOne',
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        }
    }

    private renderBanner(data: ScreenshotData): any {
        return {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #fdf2f8 100%)',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 40,
                            },
                            children: {
                                type: 'div',
                                props: {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 48,
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: 32,
                                        padding: 48,
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                                    },
                                    children: [
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    display: 'flex',
                                                    backgroundColor: 'white',
                                                    borderRadius: 16,
                                                    padding: 16,
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                },
                                                children: {
                                                    type: 'img',
                                                    props: {
                                                        src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pageUrl)}`,
                                                        width: 192,
                                                        height: 192,
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            type: 'div',
                                            props: {
                                                style: { display: 'flex', flexDirection: 'column', gap: 16 },
                                                children: [
                                                    {
                                                        type: 'div',
                                                        props: {
                                                            style: { fontSize: 36, fontWeight: 'bold', color: '#1f2937' },
                                                            children: data.title || '支持我们',
                                                        },
                                                    },
                                                    data.excerpt ? {
                                                        type: 'div',
                                                        props: {
                                                            style: { fontSize: 18, color: '#6b7280' },
                                                            children: data.excerpt,
                                                        },
                                                    } : null,
                                                    {
                                                        type: 'div',
                                                        props: {
                                                            style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 },
                                                            children: data.channels.map(channel => ({
                                                                type: 'div',
                                                                props: {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 8,
                                                                        padding: '8px 16px',
                                                                        borderRadius: 24,
                                                                        backgroundColor: `${channel.color}20`,
                                                                    },
                                                                    children: [
                                                                        { type: 'img', props: { src: channel.logo, width: 20, height: 20 } },
                                                                        {
                                                                            type: 'div',
                                                                            props: {
                                                                                style: { fontSize: 14, fontWeight: 500, color: '#374151' },
                                                                                children: channel.title,
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                            })),
                                                        },
                                                    },
                                                    data.subtitle ? {
                                                        type: 'div',
                                                        props: {
                                                            style: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
                                                            children: data.subtitle,
                                                        },
                                                    } : null,
                                                ].filter(Boolean),
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 48,
                                width: '100%',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: { fontSize: 14, color: '#9ca3af' },
                                        children: 'Powered by ',
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: { 
                                            fontSize: 14, 
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(to right, #a855f7, #ef4444)',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                        },
                                        children: 'PayOne',
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        }
    }
}
