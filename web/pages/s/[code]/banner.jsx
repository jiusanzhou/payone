import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import QRCode from 'qrcode';

import channels from "../../../../channels.json";
import apis from "../../../lib/api";
import { getBasePath } from '../../../lib/utils';

const _emptyObject = {}

const BannerPage = ({ isPreview, xdata }) => {
    const router = useRouter()
    const { code, ...args } = router.query

    const [waiting, setWaiting] = useState(true)
    const [data, setData] = useState({})
    const [qrcode, setQrcode] = useState(null)
    const [isExists, setIsExists] = useState(true)
    const [loaded, setLoaded] = useState(false)

    const xdataStable = xdata || _emptyObject

    useEffect(() => {
        if (loaded) return;
        
        const loadData = async () => {
            if (!router.isReady && !isPreview) return;

            let channelsData = {}

            if (code) {
                const item = await apis.getItem(code);
                channelsData = item.channels || {};
            }

            const mergedData = { ...xdataStable, ...channelsData, ...args }
            setData(mergedData)

            const activeChannels = channels.filter(c => !c.disable && mergedData[c.name])
            setIsExists(activeChannels.length > 0)

            const basePath = getBasePath()
            const pageUrl = code ? `${basePath}/s/${code}` : basePath
            const qr = await QRCode.toDataURL(pageUrl, { width: 256, margin: 2 })
            setQrcode(qr)
            setWaiting(false)
            setLoaded(true)
        }
        loadData()
    }, [code, router.isReady, isPreview, loaded, xdataStable])

    if (waiting) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 md:p-10 max-w-3xl w-full">
                    <div className="flex flex-col md:flex-row items-center gap-8 animate-pulse">
                        <div className="flex-shrink-0">
                            <div className="bg-gray-200 rounded-2xl w-40 h-40 md:w-48 md:h-48"></div>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="flex gap-3 mt-4">
                                <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                                <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!isExists) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Head>
                    <title>收款码不存在 | PayOne</title>
                </Head>
                <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">收款码不存在</h2>
                    <p className="text-gray-500 mb-6">该收款码可能已过期或从未创建</p>
                    <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        创建收款码
                    </a>
                </div>
            </div>
        )
    }

    const activeChannels = channels.filter(c => !c.disable && data[c.name])

    return (
        <>
            <Head>
                <title>{data._title || '支持我们'} | PayOne</title>
            </Head>
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 md:p-10 max-w-3xl w-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                            <div className="bg-white rounded-2xl p-3 shadow-lg ring-1 ring-gray-100">
                                {qrcode && (
                                    <img 
                                        src={qrcode} 
                                        alt="收款二维码"
                                        className="w-40 h-40 md:w-48 md:h-48"
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                {data._title || '支持我们'}
                            </h1>
                            {data._excerpt && (
                                <p className="text-gray-500 mb-4">{data._excerpt}</p>
                            )}
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                {activeChannels.map(({ name, title, logo, color }) => (
                                    <div 
                                        key={name}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full"
                                        style={{ backgroundColor: `${color}20` }}
                                    >
                                        <img src={logo} alt={title} className="w-5 h-5" />
                                        <span className="text-sm font-medium text-gray-700">{title}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {data._subtitle && (
                                <p className="text-gray-400 mt-4 text-sm">{data._subtitle}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

BannerPage.noHeader = true
BannerPage.fullBackground = 'bg-gradient-to-br from-white via-purple-50 to-pink-50'
BannerPage.powered = true

export default BannerPage
