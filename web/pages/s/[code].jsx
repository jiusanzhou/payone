import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

// import QRCode from 'react-qr-code';
import QRCode from 'qrcode'

import Section from "../../components/section";
import channels from "../../../channels.json";
import apis from "../../lib/api";
import { getChannelByUA, getChannelByName, getCodeUrl, getBasePath } from '../../lib/utils';

const _emptyObject = {};

// landing page for qrcode
const CodePage = ({ isPreview, type, sectionProps={}, className="", onQrcode, xdata=_emptyObject, ...props }) => {
    const router = useRouter()
    const { code, _type, ...args } = router.query

    let [waiting, setWaiting] = useState(true)
    let [channel, setChannel] = useState(null)
    let [qrcode, setQrcode] = useState(null)
    let [data, setData] = useState(_emptyObject)
    let [isExits, setIsExits] = useState(true)

    useEffect(() => {
        // get ua from _type
        let channel = (type||_type) ?
            getChannelByName(type||_type) :
            getChannelByUA(); // use match, ua for preview mode
        setChannel(channel);
    }, [type, _type])

    useEffect(() => {
        const loadData = async () => {
            if (!router.isReady) return;

            let channels = {}

            if (code) {
                const item = await apis.getItem(code);
                channels = item.channels || {};
            }

            const data = {...xdata, ...channels, ...args}

            setData(data)

            if (!isPreview && channel && data[channel.name] && channel.config.redirect) {
                location.href = channel.gen({ code: data[channel.name] })
            }

            setIsExits(Object.keys(data).filter(key => !key.startsWith("_") && data[key]).length !== 0);

            const url = channel&&data[channel.name] ?
                channel.gen({ code: data[channel.name] }) :
                code ? location.href :
                getBasePath() + "/s?" + Object.keys(xdata).map((k) => `${k}=${encodeURIComponent(xdata[k])}`).join('&');

            onQrcode && onQrcode(url);
            QRCode.toDataURL(url).then((r) => {
                setQrcode(r)
                setWaiting(false)
            })
        }
        loadData()
    }, [code, xdata, router.isReady])

    if (waiting) return <Section className="justify-center" {...sectionProps}>
        <span className="flex h-10 w-10 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-10 w-10 bg-purple-500"></span>
        </span>
    </Section>

    if (!isExits) return (
        <Section className="justify-center" {...sectionProps}>
            <div className="flex flex-col items-center text-center px-6">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">收款码不存在</h2>
                <p className="text-gray-500 mb-6 max-w-xs">该收款码可能已过期或从未创建，请检查链接是否正确</p>
                <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all">
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

    return <Section className={`justify-center select-none ${className}`} {...sectionProps}
        description={(!channel||data[channel.name])?data._excerpt:"仅支持以上付款方式 ☝️"}
        title={<div className="flex text-xl space-x-4">
        {channels.filter(({ disable, name }) => !disable &&
            (!channel || (data[channel.name]?name===channel.name:data[name]))) // all or matched one
            .map(({ name, title, logo, logoFull }) => <div key={name}
                className="flex items-center">
                <img className="h-10" src={channel&&data[channel.name]?logoFull||logo:logo} alt={title} />
                {channel&&data[channel.name]&&!logoFull&&<p className="ml-2 text-md">{title}</p>}
            </div>)}
        </div>}>
        <div style={{backgroundColor: channel&&channel.config.color}}
            className="flex flex-col items-center w-full max-w-xs p-6 bg-purple-400 text-white rounded-2xl backdrop-blur-xl bg-opacity-80 shadow-xl">
            {/* subtitle */}
            <p className="font-bold text-xl must-line-height">{data._subtitle||''}</p>
            {/* qrcode */}
            <div className="w-2/3 max-w-60 max-h-60 bg-white/95 backdrop-blur-sm my-5 md:my-8 rounded-xl p-3 shadow-lg">
                <img className="w-full h-full rounded-lg" src={qrcode} alt="QR Code" />
            </div>
            {/* footer */}
            <p className="w-48 must-line-height text-white/90">{(channel?
                data[channel.name]?
                    data._tip||channel.config.tip:
                    `暂不支持「${channel.config.title}」付款`:
                "☝️ 请打开支持的付款软件并扫一扫")}</p>
        </div>
        <Head>
            <title>{data._title || '付款码'}</title>
        </Head>
    </Section>
}

CodePage.noHeader = true
CodePage.powered = true

export default CodePage