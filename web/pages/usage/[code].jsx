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

const THEMES = [
    { id: 'default', name: '默认', description: '竖版二维码' },
    { id: 'banner', name: 'Banner', description: '横幅样式' },
]

const UsagePage = () => {
    const router = useRouter()
    const { code, isnew } = router.query

    const [basePath, setBasePath] = useState("")
    const [copied, setCopied] = useState(null)
    const [provider, setProvider] = useState('worker')
    const [theme, setTheme] = useState('default')
    const [imageKey, setImageKey] = useState(0)
    
    useEffect(() => {
        setBasePath(getBasePath())
    }, [])

    const { width, height } = useWindowSize()
    
    const pageUrl = `${basePath}/s/${code}`
    const providerParam = provider !== 'worker' ? `?provider=${provider}` : ''
    
    const isBanner = theme === 'banner'
    const currentImageUrl = isBanner 
        ? `${basePath}/s/${code}-banner.png${providerParam}`
        : `${basePath}/s/${code}.png${providerParam}`
    const currentPageUrl = isBanner ? `${basePath}/s/${code}/banner` : pageUrl

    const handleProviderChange = (newProvider) => {
        setProvider(newProvider)
        setImageKey(prev => prev + 1)
    }

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme)
        setImageKey(prev => prev + 1)
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
                        <h3 className="font-semibold text-gray-700">收款页面链接</h3>
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
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-600 break-all">
                        {pageUrl}
                    </div>
                    <div className="mt-4 flex gap-3">
                        <Link
                            href={`/s/${code}`}
                            className="flex-1 py-3 text-center text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                        >
                            打开页面
                        </Link>
                        <a
                            href={`/s/${code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            ↗
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">分享图片</h3>
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
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-2 block">样式</label>
                            <div className="flex gap-2">
                                {THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleThemeChange(t.id)}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                                            theme === t.id
                                                ? 'bg-purple-500 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
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
                        <img
                            key={`img-${imageKey}-${theme}`}
                            className={`rounded-xl shadow-lg ${isBanner ? 'w-full' : 'max-w-[280px]'}`}
                            alt={`${code} ${theme}`}
                            src={currentImageUrl}
                        />
                    </div>

                    {isBanner && (
                        <p className="text-xs text-gray-400 mt-3 text-center">
                            适用于 GitHub README 等场景
                        </p>
                    )}

                    <div className="mt-4 flex gap-3">
                        <Link
                            href={currentPageUrl.replace(basePath, '')}
                            className="flex-1 py-3 text-center text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                        >
                            打开{isBanner ? '横幅' : ''}页面
                        </Link>
                        <a
                            href={currentPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            ↗
                        </a>
                    </div>
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
