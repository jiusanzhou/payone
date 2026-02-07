import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import Link from "../../components/link"
import { getBasePath } from "../../lib/utils"
import { showToast } from "../../components/toast"

const PROVIDERS = [
    { id: 'worker', name: 'Worker', icon: '🖥️', description: 'Satori 渲染' },
    { id: 'thumio', name: 'Thum.io', icon: '📷', description: '免费' },
    { id: 'microlink', name: 'Microlink', icon: '🔗', description: '浏览器截图' },
    { id: 'shotsapi', name: 'ShotsAPI', icon: '📸', description: '第三方' },
]

const UsagePage = () => {
    const router = useRouter()
    const { code, isnew } = router.query

    const [basePath, setBasePath] = useState("")
    const [copied, setCopied] = useState(null)
    const [provider, setProvider] = useState('worker')
    const [imageKey, setImageKey] = useState(0)
    
    useEffect(() => {
        setBasePath(getBasePath())
    }, [])

    const { width, height } = useWindowSize()
    
    const pageUrl = `${basePath}/s/${code}`
    const providerParam = provider !== 'worker' ? `?provider=${provider}` : ''
    const imageUrl = `${basePath}/s/${code}.png${providerParam}`
    const bannerUrl = `${basePath}/s/${code}/banner`
    const bannerImageUrl = `${basePath}/s/${code}-banner.png${providerParam}`

    const handleProviderChange = (newProvider) => {
        setProvider(newProvider)
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
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-700">二维码图片</h3>
                        <button
                            onClick={() => copyToClipboard(imageUrl, 'image')}
                            className={`text-sm px-3 py-1 rounded-full transition-colors ${
                                copied === 'image' 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                            }`}
                        >
                            {copied === 'image' ? '已复制 ✓' : '复制链接'}
                        </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-600 break-all mb-4">
                        {imageUrl}
                    </div>
                    <div className="relative p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <div className="absolute top-3 right-3 flex gap-1">
                            {PROVIDERS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProviderChange(p.id)}
                                    title={`${p.name} - ${p.description}`}
                                    className={`px-2 py-1 rounded-lg text-xs transition-all ${
                                        provider === p.id
                                            ? 'bg-purple-500 text-white shadow-sm'
                                            : 'bg-white/80 text-gray-500 hover:bg-white hover:text-purple-600'
                                    }`}
                                >
                                    {p.icon}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center">
                            <img
                                key={`qr-${imageKey}`}
                                className="rounded-xl shadow-lg max-w-[280px]"
                                alt={`${code} 收款码`}
                                src={imageUrl}
                            />
                        </div>
                        <div className="text-center mt-3 text-xs text-gray-400">
                            当前: {PROVIDERS.find(p => p.id === provider)?.name}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-gray-700">横幅 Banner</h3>
                            <p className="text-xs text-gray-400 mt-1">适用于 GitHub README 等场景</p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(bannerImageUrl, 'banner')}
                            className={`text-sm px-3 py-1 rounded-full transition-colors ${
                                copied === 'banner' 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                            }`}
                        >
                            {copied === 'banner' ? '已复制 ✓' : '复制链接'}
                        </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-600 break-all mb-4">
                        {bannerImageUrl}
                    </div>
                    <div className="relative p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <div className="absolute top-3 right-3 flex gap-1">
                            {PROVIDERS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProviderChange(p.id)}
                                    title={`${p.name} - ${p.description}`}
                                    className={`px-2 py-1 rounded-lg text-xs transition-all ${
                                        provider === p.id
                                            ? 'bg-purple-500 text-white shadow-sm'
                                            : 'bg-white/80 text-gray-500 hover:bg-white hover:text-purple-600'
                                    }`}
                                >
                                    {p.icon}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center pt-6">
                            <img
                                key={`banner-${imageKey}`}
                                className="rounded-lg shadow-lg w-full max-w-xl"
                                alt={`${code} banner`}
                                src={bannerImageUrl}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <Link
                            href={`/s/${code}/banner`}
                            className="flex-1 py-3 text-center text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                        >
                            打开横幅页面
                        </Link>
                        <a
                            href={`/s/${code}/banner`}
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
