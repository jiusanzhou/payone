import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import Link from "../../components/link"
import { getBasePath } from "../../lib/utils"
import { showToast } from "../../components/toast"

const PROVIDERS = [
    { id: 'worker', name: 'Worker' },
    { id: 'thumio', name: 'Thum.io' },
    { id: 'microlink', name: 'Microlink' },
    { id: 'shotsapi', name: 'ShotsAPI' },
]

const LAYOUTS = [
    { id: 'default', name: '竖版' },
    { id: 'banner', name: '横幅' },
]

const COLOR_THEMES = [
    { id: 'default', name: '默认' },
    { id: 'minimal', name: '极简' },
    { id: 'gradient', name: '渐变' },
    { id: 'dark', name: '暗色' },
    { id: 'neon', name: '霓虹' },
]

const UsagePage = () => {
    const router = useRouter()
    const { code, isnew } = router.query

    const [basePath, setBasePath] = useState("")
    const [copied, setCopied] = useState(null)
    const [provider, setProvider] = useState('worker')
    const [layout, setLayout] = useState('default')
    const [colorTheme, setColorTheme] = useState('default')
    const [imageKey, setImageKey] = useState(0)
    const [imageLoading, setImageLoading] = useState(true)
    
    useEffect(() => {
        setBasePath(getBasePath())
    }, [])

    const { width, height } = useWindowSize()
    
    const isBanner = layout === 'banner'
    const layoutParam = isBanner ? 'layout=banner' : ''
    const themeParam = colorTheme !== 'default' ? `theme=${colorTheme}` : ''
    
    const pageQueryParams = [layoutParam, themeParam].filter(Boolean).join('&')
    const pageQueryString = pageQueryParams ? `?${pageQueryParams}` : ''
    const pageUrl = `${basePath}/s/${code}${pageQueryString}`
    
    const providerParam = provider !== 'worker' ? `provider=${provider}` : ''
    const imageQueryParams = [layoutParam, themeParam, providerParam].filter(Boolean).join('&')
    const imageQueryString = imageQueryParams ? `?${imageQueryParams}` : ''
    
    const currentImageUrl = `${basePath}/s/${code}.png${imageQueryString}`

    const handleProviderChange = (newProvider) => {
        setProvider(newProvider)
        setImageKey(prev => prev + 1)
        setImageLoading(true)
    }

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout)
        setImageKey(prev => prev + 1)
        setImageLoading(true)
    }

    const handleColorThemeChange = (newColorTheme) => {
        setColorTheme(newColorTheme)
        setImageKey(prev => prev + 1)
        setImageLoading(true)
    }

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(type)
            showToast('已复制到剪贴板', 'success')
            setTimeout(() => setCopied(null), 2000)
        })
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-6 py-12">
            {isnew && (
                <Confetti
                    style={{ position: "fixed" }}
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={200}
                />
            )}

            <div className="text-center mb-10">
                {isnew && <div className="text-5xl mb-4">🎉</div>}
                <h1 className="text-3xl font-bold mb-3">
                    {isnew ? '创建成功！' : '收款码详情'}
                </h1>
                <p className="text-gray-500">
                    你的专属ID: <code className="px-2 py-1 bg-purple-100 text-purple-600 rounded font-mono">{code}</code>
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-700">页面链接</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyToClipboard(pageUrl, 'page')}
                                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                                    copied === 'page' 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                                }`}
                            >
                                {copied === 'page' ? '已复制 ✓' : '复制链接'}
                            </button>
                            <a
                                href={pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors inline-flex items-center gap-1"
                            >
                                打开链接 ↗
                            </a>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-600 break-all">
                        {pageUrl}
                    </div>

                    <hr className="my-6 border-gray-100" />

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">分享图片</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyToClipboard(currentImageUrl, 'image')}
                                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                                    copied === 'image' 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                                }`}
                            >
                                {copied === 'image' ? '已复制 ✓' : '复制链接'}
                            </button>
                            <a
                                href={currentImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors inline-flex items-center gap-1"
                            >
                                打开图片 ↗
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-2 block">布局</label>
                                <div className="flex gap-2">
                                    {LAYOUTS.map((l) => (
                                        <button
                                            key={l.id}
                                            onClick={() => handleLayoutChange(l.id)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                                                layout === l.id
                                                    ? 'bg-purple-500 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {l.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-[2]">
                                <label className="text-xs text-gray-500 mb-2 block">颜色主题</label>
                                <div className="flex gap-1">
                                    {COLOR_THEMES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleColorThemeChange(t.id)}
                                            className={`flex-1 px-2 py-2 rounded-lg text-sm transition-all ${
                                                colorTheme === t.id
                                                    ? 'bg-purple-500 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                  <div>
                            <label className="text-xs text-gray-500 mb-2 block">截图服务</label>
                            <div className="flex gap-1">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleProviderChange(p.id)}
                                        className={`flex-1 px-2 py-2 rounded-lg text-xs transition-all ${
                                            provider === p.id
                                                ? 'bg-purple-500 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-600 break-all mb-4">
                        {currentImageUrl}
                    </div>

                    <div className={`p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl ${isBanner ? '' : 'flex justify-center'}`}>
                        <div className={`relative ${isBanner ? 'w-full' : 'w-[280px]'}`} style={{ aspectRatio: isBanner ? '1200/630' : '640/960' }}>
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                                        <span className="text-sm text-gray-400">加载中...</span>
                                    </div>
                                </div>
                            )}
                            <img
                                key={`img-${imageKey}-${layout}-${colorTheme}`}
                                className={`w-full h-full object-contain rounded-xl shadow-lg transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                alt={`${code} ${layout} ${colorTheme}`}
                                src={currentImageUrl}
                                onLoad={() => setImageLoading(false)}
                                onError={() => setImageLoading(false)}
                            />
                        </div>
                    </div>

                    {isBanner && (
                        <p className="text-xs text-gray-400 mt-3 text-center">
                            适用于 GitHub README 等场景
                        </p>
                    )}
                </div>

                <div className="text-center pt-4">
                    <Link
                        href="/editor"
                        className="text-gray-400 hover:text-purple-500 text-sm"
                    >
                        ← 创建新的收款码
                    </Link>
                </div>
            </div>
        </div>
    )
}

UsagePage.title = "收款码详情 | PayOne"

export default UsagePage
