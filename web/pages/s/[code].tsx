import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import QRCode from 'qrcode'

import Section from '../../components/section'
import channels from '../../../channels.json'
import apis from '../../lib/api'
import { getChannelByUA, getChannelByName, getBasePath } from '../../lib/utils'
import type { Q, ChannelConfig } from '../../lib/server'

interface PaymentData {
    _title?: string
    _subtitle?: string
    _excerpt?: string
    _tip?: string
    [key: string]: string | undefined
}

interface ThemeStyle {
    bg: string
    text: string
    qrBg: string
    border?: string
    shadow?: string
}

interface BannerThemeStyle {
    containerBg: string
    cardBg: string
    titleColor: string
    textColor: string
    subtitleColor: string
    border?: string
    shadow?: string
    qrRing?: string
}

const _emptyObject: PaymentData = {}

const THEME_STYLES: Record<string, ThemeStyle> = {
    default: {
        bg: 'bg-purple-400',
        text: 'text-white',
        qrBg: 'bg-white/95',
    },
    minimal: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        qrBg: 'bg-white',
        border: 'border border-gray-200',
    },
    gradient: {
        bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
        text: 'text-white',
        qrBg: 'bg-white/95',
    },
    dark: {
        bg: 'bg-gray-900',
        text: 'text-white',
        qrBg: 'bg-white',
    },
    neon: {
        bg: 'bg-black',
        text: 'text-green-400',
        qrBg: 'bg-white',
        border: 'border-2 border-green-400',
        shadow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',
    },
}

const BANNER_THEME_STYLES: Record<string, BannerThemeStyle> = {
    default: {
        containerBg: 'bg-white',
        cardBg: 'bg-gradient-to-br from-white via-purple-50 to-pink-50',
        titleColor: 'text-gray-800',
        textColor: 'text-gray-500',
        subtitleColor: 'text-gray-400',
    },
    minimal: {
        containerBg: 'bg-white',
        cardBg: 'bg-gray-50',
        titleColor: 'text-gray-800',
        textColor: 'text-gray-500',
        subtitleColor: 'text-gray-400',
        border: 'border border-gray-200',
    },
    gradient: {
        containerBg: 'bg-white',
        cardBg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
        titleColor: 'text-white',
        textColor: 'text-white/90',
        subtitleColor: 'text-white/70',
        qrRing: 'ring-white/20',
    },
    dark: {
        containerBg: 'bg-white',
        cardBg: 'bg-gray-900',
        titleColor: 'text-white',
        textColor: 'text-gray-300',
        subtitleColor: 'text-gray-500',
    },
    neon: {
        containerBg: 'bg-white',
        cardBg: 'bg-black',
        titleColor: 'text-green-400',
        textColor: 'text-gray-400',
        subtitleColor: 'text-green-400/70',
        border: 'border border-green-400/50',
        shadow: 'shadow-[0_0_30px_rgba(0,255,136,0.2)]',
    },
}

interface BannerLayoutProps {
    data: PaymentData
    qrcode: string | null
    activeChannels: ChannelConfig[]
    colorTheme?: string
}

const BannerLayout = ({ data, qrcode, activeChannels, colorTheme = 'default' }: BannerLayoutProps) => {
    const style = BANNER_THEME_STYLES[colorTheme] || BANNER_THEME_STYLES.default

    return (
        <div className={`flex-1 flex items-center justify-center p-6 md:p-8 ${style.containerBg}`}>
            <Head>
                <title>{data._title || '支持我们'} | PayOne</title>
            </Head>
            <div
                className={`backdrop-blur rounded-3xl shadow-2xl p-6 md:p-8 max-w-3xl w-full ${style.cardBg} ${style.border || ''} ${style.shadow || ''}`}
            >
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="flex-shrink-0">
                        <div className="bg-white rounded-2xl p-2 md:p-3 shadow-lg ring-1 ring-gray-100">
                            {qrcode && <img src={qrcode} alt="收款二维码" className="w-32 h-32 md:w-40 md:h-40" />}
                        </div>
                        <p className={`text-center text-xs mt-2 ${style.subtitleColor}`}>请打开支持的付款软件并扫一扫</p>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className={`text-xl md:text-2xl font-bold mb-1 md:mb-2 ${style.titleColor}`}>
                            {data._title || '支持我们'}
                        </h1>
                        {data._excerpt && <p className={`text-sm md:text-base mb-3 md:mb-4 ${style.textColor}`}>{data._excerpt}</p>}

                        <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mt-3 md:mt-4">
                            {activeChannels.map(({ name, title, logo, color }) => (
                                <div
                                    key={name}
                                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                                    style={{
                                        backgroundColor:
                                            colorTheme === 'dark' || colorTheme === 'neon' || colorTheme === 'gradient'
                                                ? `${color}30`
                                                : `${color}20`,
                                    }}
                                >
                                    <img src={logo} alt={title} className="w-4 h-4 md:w-5 md:h-5" />
                                    <span
                                        className={`text-xs md:text-sm font-medium ${colorTheme === 'dark' ? 'text-gray-200' : colorTheme === 'neon' ? 'text-green-400' : colorTheme === 'gradient' ? 'text-white/90' : 'text-gray-700'}`}
                                    >
                                        {title}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {data._subtitle && <p className={`mt-3 md:mt-4 text-xs md:text-sm ${style.subtitleColor}`}>{data._subtitle}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface CodePageProps {
    isPreview?: boolean
    type?: string | null
    sectionProps?: Record<string, unknown>
    className?: string
    onQrcode?: (url: string) => void
    xdata?: PaymentData
}

interface CodePageComponent extends React.FC<CodePageProps> {
    noHeader?: boolean
    powered?: boolean
}

const CodePage: CodePageComponent = ({ isPreview, type, sectionProps = {}, className = '', onQrcode, xdata = _emptyObject }) => {
    const router = useRouter()
    const { code, _type, layout, theme, ...args } = router.query as Record<string, string>

    const [waiting, setWaiting] = useState(true)
    const [channel, setChannel] = useState<Q | null>(null)
    const [qrcode, setQrcode] = useState<string | null>(null)
    const [data, setData] = useState<PaymentData>(_emptyObject)
    const [isExits, setIsExits] = useState(true)
    const [loaded, setLoaded] = useState(false)

    const currentLayout = layout || 'default'
    const currentTheme = theme || 'default'
    const isBanner = currentLayout === 'banner'
    const themeStyle = THEME_STYLES[currentTheme] || THEME_STYLES.default

    useEffect(() => {
        const ch = type || _type ? getChannelByName(type || _type) : getChannelByUA()
        setChannel(ch)
    }, [type, _type])

    useEffect(() => {
        if (loaded) return

        const loadData = async () => {
            if (!router.isReady) return

            let channelsData: PaymentData = {}

            if (code) {
                const item = await apis.getItem(code as string)
                channelsData = (item.channels as PaymentData) || {}
            }

            const mergedData = { ...xdata, ...channelsData, ...args }

            setData(mergedData)

            if (!isPreview && !isBanner && channel && mergedData[channel.name] && channel.config.redirect) {
                location.href = channel.gen({ code: mergedData[channel.name] as string })
            }

            setIsExits(Object.keys(mergedData).filter((key) => !key.startsWith('_') && mergedData[key]).length !== 0)

            const url =
                channel && mergedData[channel.name]
                    ? channel.gen({ code: mergedData[channel.name] as string })
                    : code
                    ? location.href
                    : getBasePath() +
                      '/s?' +
                      Object.keys(xdata)
                          .map((k) => `${k}=${encodeURIComponent(xdata[k] || '')}`)
                          .join('&')

            onQrcode?.(url)
            QRCode.toDataURL(url, { width: 256, margin: 2 }).then((r) => {
                setQrcode(r)
                setWaiting(false)
                setLoaded(true)
            })
        }
        loadData()
    }, [code, xdata, router.isReady, isBanner, channel, isPreview, onQrcode, loaded])

    const activeChannels = (channels as ChannelConfig[]).filter((c) => !c.disable && data[c.name])

    if (waiting)
        return (
            <Section className="justify-center" {...sectionProps}>
                <span className="flex h-10 w-10 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-10 w-10 bg-purple-500"></span>
                </span>
            </Section>
        )

    if (!isExits)
        return (
            <Section className="justify-center" {...sectionProps}>
                <div className="flex flex-col items-center text-center px-6">
                    <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">收款码不存在</h2>
                    <p className="text-gray-500 mb-6 max-w-xs">该收款码可能已过期或从未创建，请检查链接是否正确</p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        创建收款码
                    </a>
                </div>
                <Head>
                    <title>收款码不存在 | PayOne</title>
                </Head>
            </Section>
        )

    if (isBanner) {
        return <BannerLayout data={data} qrcode={qrcode} activeChannels={activeChannels} colorTheme={currentTheme} />
    }

    return (
        <Section
            className={`justify-center select-none ${className}`}
            {...sectionProps}
            description={!channel || data[channel.name] ? data._excerpt : '仅支持以上付款方式 ☝️'}
            title={
                <div className="flex flex-wrap justify-center gap-3">
                    {activeChannels.map(({ name, title, logo, logoFull }) => (
                        <div key={name} className="flex items-center">
                            <img 
                                className="h-8 w-8" 
                                src={channel && data[channel.name] && name === channel.name ? logoFull || logo : logo} 
                                alt={title} 
                                title={title}
                            />
                        </div>
                    ))}
                </div>
            }
        >
            <div
                style={{ backgroundColor: channel?.config.color }}
                className={`flex flex-col items-center w-full max-w-xs p-6 ${themeStyle.bg} ${themeStyle.text} rounded-2xl backdrop-blur-xl bg-opacity-80 shadow-xl ${themeStyle.border || ''} ${themeStyle.shadow || ''}`}
            >
                <p className="font-bold text-xl must-line-height">{data._subtitle || ''}</p>
                <div className={`w-2/3 max-w-60 max-h-60 ${themeStyle.qrBg} backdrop-blur-sm my-5 md:my-8 rounded-xl p-3 shadow-lg`}>
                    <img className="w-full h-full rounded-lg" src={qrcode || ''} alt="QR Code" />
                </div>
                <p className={`w-48 must-line-height ${themeStyle.text === 'text-white' ? 'text-white/90' : ''}`}>
                    {channel
                        ? data[channel.name]
                            ? data._tip || channel.config.tip
                            : `暂不支持「${channel.config.title}」付款`
                        : '☝️ 请打开支持的付款软件并扫一扫'}
                </p>
            </div>
            <Head>
                <title>{data._title || '付款码'}</title>
            </Head>
        </Section>
    )
}

CodePage.noHeader = true
CodePage.powered = true

export default CodePage
