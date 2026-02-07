import satori, { init as initSatori } from 'satori/wasm'
import initYoga from 'yoga-wasm-web'
import { initWasm as initResvgWasm, Resvg } from '@resvg/resvg-wasm'
import type { ScreenshotProvider, ScreenshotData, ScreenshotOptions, ScreenshotResult, LayoutType, ColorTheme } from './types'

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
        const layout: LayoutType = options.layout || (data.isBanner ? 'banner' : 'default')
        const colorTheme: ColorTheme = options.theme || 'default'
        const element = this.renderLayout(data, layout, colorTheme)

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

    private renderLayout(data: ScreenshotData, layout: LayoutType, colorTheme: ColorTheme): any {
        if (layout === 'banner') {
            return this.renderBanner(data, colorTheme)
        }
        return this.renderVertical(data, colorTheme)
    }

    private renderVertical(data: ScreenshotData, colorTheme: ColorTheme): any {
        switch (colorTheme) {
            case 'minimal': return this.renderMinimal(data)
            case 'gradient': return this.renderGradient(data)
            case 'dark': return this.renderDark(data)
            case 'neon': return this.renderNeon(data)
            default: return this.renderDefault(data)
        }
    }

    private renderDefault(data: ScreenshotData): any {
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

    private renderBanner(data: ScreenshotData, colorTheme: string = 'default'): any {
        const themes: Record<string, { 
            bg: string; 
            cardBg: string; 
            titleColor: string; 
            textColor: string; 
            subtitleColor: string; 
            footerColor: string; 
            channelBg: (color: string) => string; 
            channelText: string;
            cardBorder?: string;
            cardShadow?: string;
            qrRing?: string;
        }> = {
            default: {
                bg: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #fdf2f8 100%)',
                cardBg: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                textColor: '#6b7280',
                subtitleColor: '#9ca3af',
                footerColor: '#9ca3af',
                channelBg: (color: string) => `${color}20`,
                channelText: '#374151',
                cardShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                qrRing: '1px solid #f3f4f6',
            },
            minimal: {
                bg: '#fafafa',
                cardBg: '#ffffff',
                titleColor: '#1f2937',
                textColor: '#6b7280',
                subtitleColor: '#9ca3af',
                footerColor: '#9ca3af',
                channelBg: () => '#f5f5f5',
                channelText: '#374151',
                cardBorder: '1px solid #e5e7eb',
                cardShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                qrRing: '1px solid #f3f4f6',
            },
            gradient: {
                bg: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
                cardBg: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                textColor: '#4b5563',
                subtitleColor: '#9ca3af',
                footerColor: 'rgba(255,255,255,0.7)',
                channelBg: (color: string) => `${color}20`,
                channelText: '#374151',
                cardShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                qrRing: '1px solid #f3f4f6',
            },
            dark: {
                bg: '#111827',
                cardBg: '#1f2937',
                titleColor: '#ffffff',
                textColor: '#d1d5db',
                subtitleColor: '#6b7280',
                footerColor: '#4b5563',
                channelBg: (color: string) => `${color}30`,
                channelText: '#e5e7eb',
                cardShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                qrRing: '1px solid #374151',
            },
            neon: {
                bg: '#000000',
                cardBg: '#000000',
                titleColor: '#4ade80',
                textColor: '#9ca3af',
                subtitleColor: 'rgba(74, 222, 128, 0.7)',
                footerColor: '#4ade80',
                channelBg: () => 'rgba(74, 222, 128, 0.1)',
                channelText: '#4ade80',
                cardBorder: '1px solid rgba(74, 222, 128, 0.5)',
                cardShadow: '0 0 30px rgba(74, 222, 128, 0.2)',
                qrRing: '1px solid #374151',
            },
        }
        const t = themes[colorTheme] || themes.default
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pageUrl)}`

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
                    background: t.bg,
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
                                padding: 32,
                            },
                            children: {
                                type: 'div',
                                props: {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 32,
                                        backgroundColor: t.cardBg,
                                        borderRadius: 24,
                                        padding: '32px 40px',
                                        boxShadow: t.cardShadow || '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        border: t.cardBorder || 'none',
                                    },
                                    children: [
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    display: 'flex',
                                                    backgroundColor: 'white',
                                                    borderRadius: 16,
                                                    padding: 12,
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    border: t.qrRing || '1px solid #f3f4f6',
                                                },
                                                children: {
                                                    type: 'img',
                                                    props: { src: qrUrl, width: 192, height: 192 },
                                                },
                                            },
                                        },
                                        {
                                            type: 'div',
                                            props: {
                                                style: { display: 'flex', flexDirection: 'column' },
                                                children: [
                                                    {
                                                        type: 'div',
                                                        props: {
                                                            style: { display: 'flex', fontSize: 30, fontWeight: 'bold', color: t.titleColor, marginBottom: 8 },
                                                            children: data.title || '支持我们',
                                                        },
                                                    },
                                                    data.excerpt ? {
                                                        type: 'div',
                                                        props: {
                                                            style: { display: 'flex', fontSize: 16, color: t.textColor, marginBottom: 16 },
                                                            children: data.excerpt,
                                                        },
                                                    } : null,
                                                    {
                                                        type: 'div',
                                                        props: {
                                                            style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 },
                                                            children: data.channels.map(channel => ({
                                                                type: 'div',
                                                                props: {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 8,
                                                                        padding: '8px 16px',
                                                                        borderRadius: 9999,
                                                                        backgroundColor: t.channelBg(channel.color),
                                                                    },
                                                                    children: [
                                                                        { type: 'img', props: { src: channel.logo, width: 20, height: 20 } },
                                                                        {
                                                                            type: 'div',
                                                                            props: {
                                                                                style: { display: 'flex', fontSize: 14, fontWeight: 500, color: t.channelText },
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
                                                            style: { display: 'flex', fontSize: 14, color: t.subtitleColor, marginTop: 16 },
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
                    this.renderFooter(t.footerColor),
                ],
            },
        }
    }

    private renderMinimal(data: ScreenshotData): any {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pageUrl)}`
        return {
            type: 'div',
            props: {
                style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: 40 },
                children: [
                    { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }, children: [
                        { type: 'div', props: { style: { display: 'flex', gap: 16, marginBottom: 8 }, children: data.channels.map(ch => ({ type: 'img', props: { src: ch.logo, width: 40, height: 40 } })) } },
                        data.excerpt ? { type: 'div', props: { style: { display: 'flex', fontSize: 16, color: '#6b7280', marginTop: 16, marginBottom: 20 }, children: data.excerpt } } : null,
                        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 16, padding: 24, border: '1px solid #e5e5e5' }, children: [
                            data.subtitle ? { type: 'div', props: { style: { display: 'flex', fontSize: 20, fontWeight: 'bold', color: '#374151', marginBottom: 16 }, children: data.subtitle } } : null,
                            { type: 'div', props: { style: { display: 'flex', backgroundColor: 'white', borderRadius: 12, padding: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }, children: { type: 'img', props: { src: qrUrl, width: 180, height: 180 } } } },
                            { type: 'div', props: { style: { display: 'flex', fontSize: 14, color: '#6b7280', marginTop: 16 }, children: '请打开支持的付款软件并扫一扫' } }
                        ].filter(Boolean) } }
                    ].filter(Boolean) } },
                    this.renderFooter('#9ca3af')
                ]
            }
        }
    }

    private renderGradient(data: ScreenshotData): any {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pageUrl)}`
        return {
            type: 'div',
            props: {
                style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: 40 },
                children: [
                    { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }, children: [
                        { type: 'div', props: { style: { display: 'flex', gap: 16, marginBottom: 8 }, children: data.channels.map(ch => ({ type: 'img', props: { src: ch.logo, width: 40, height: 40 } })) } },
                        data.excerpt ? { type: 'div', props: { style: { display: 'flex', fontSize: 16, color: '#6b7280', marginTop: 16, marginBottom: 20 }, children: data.excerpt } } : null,
                        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)', borderRadius: 16, padding: 24, color: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }, children: [
                            data.subtitle ? { type: 'div', props: { style: { display: 'flex', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }, children: data.subtitle } } : null,
                            { type: 'div', props: { style: { display: 'flex', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 12, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }, children: { type: 'img', props: { src: qrUrl, width: 180, height: 180 } } } },
                            { type: 'div', props: { style: { display: 'flex', fontSize: 14, opacity: 0.9, marginTop: 16 }, children: '请打开支持的付款软件并扫一扫' } }
                        ].filter(Boolean) } }
                    ].filter(Boolean) } },
                    this.renderFooter('#6b7280')
                ]
            }
        }
    }

    private renderDark(data: ScreenshotData): any {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pageUrl)}`
        return {
            type: 'div',
            props: {
                style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: 40 },
                children: [
                    { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }, children: [
                        { type: 'div', props: { style: { display: 'flex', gap: 16, marginBottom: 8 }, children: data.channels.map(ch => ({ type: 'img', props: { src: ch.logo, width: 40, height: 40 } })) } },
                        data.excerpt ? { type: 'div', props: { style: { display: 'flex', fontSize: 16, color: '#6b7280', marginTop: 16, marginBottom: 20 }, children: data.excerpt } } : null,
                        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1f2937', borderRadius: 16, padding: 24, color: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }, children: [
                            data.subtitle ? { type: 'div', props: { style: { display: 'flex', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }, children: data.subtitle } } : null,
                            { type: 'div', props: { style: { display: 'flex', backgroundColor: 'white', borderRadius: 12, padding: 12, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }, children: { type: 'img', props: { src: qrUrl, width: 180, height: 180 } } } },
                            { type: 'div', props: { style: { display: 'flex', fontSize: 14, color: '#9ca3af', marginTop: 16 }, children: '请打开支持的付款软件并扫一扫' } }
                        ].filter(Boolean) } }
                    ].filter(Boolean) } },
                    this.renderFooter('#6b7280')
                ]
            }
        }
    }

    private renderNeon(data: ScreenshotData): any {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pageUrl)}`
        return {
            type: 'div',
            props: {
                style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: 40 },
                children: [
                    { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }, children: [
                        { type: 'div', props: { style: { display: 'flex', gap: 16, marginBottom: 8 }, children: data.channels.map(ch => ({ type: 'img', props: { src: ch.logo, width: 40, height: 40 } })) } },
                        data.excerpt ? { type: 'div', props: { style: { display: 'flex', fontSize: 16, color: '#6b7280', marginTop: 16, marginBottom: 20 }, children: data.excerpt } } : null,
                        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0a0a0a', borderRadius: 16, padding: 24, boxShadow: '0 0 30px rgba(74, 222, 128, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(74, 222, 128, 0.5)' }, children: [
                            data.subtitle ? { type: 'div', props: { style: { display: 'flex', fontSize: 20, fontWeight: 'bold', color: '#4ade80', marginBottom: 16, textShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }, children: data.subtitle } } : null,
                            { type: 'div', props: { style: { display: 'flex', borderRadius: 14, padding: 3, background: 'linear-gradient(135deg, #4ade80, #22d3ee, #a855f7)' }, children: { type: 'div', props: { style: { display: 'flex', backgroundColor: 'white', borderRadius: 11, padding: 12 }, children: { type: 'img', props: { src: qrUrl, width: 180, height: 180 } } } } } },
                            { type: 'div', props: { style: { display: 'flex', fontSize: 14, color: '#4ade80', marginTop: 16 }, children: '请打开支持的付款软件并扫一扫' } }
                        ].filter(Boolean) } }
                    ].filter(Boolean) } },
                    this.renderFooter('#4ade80')
                ]
            }
        }
    }

    private renderFooter(color = '#6b7280'): any {
        return {
            type: 'div',
            props: {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, width: '100%' },
                children: [
                    { type: 'div', props: { style: { fontSize: 14, color }, children: 'Powered by ' } },
                    { type: 'div', props: { style: { fontSize: 14, fontWeight: 'bold', background: 'linear-gradient(to right, #a855f7, #ef4444)', backgroundClip: 'text', color: 'transparent' }, children: 'PayOne' } }
                ]
            }
        }
    }
}
