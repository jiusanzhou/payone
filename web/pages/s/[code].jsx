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
        console.log("=====> channel", channel)
    }, [type, _type])

    useEffect(async () => {
        if (!router.isReady) return;

        let channels = {}

        // load channels from remote
        if (code) {
            const item = await apis.getItem(code);
            channels = item.channels || {};
        }

        const data = {...xdata, ...channels, ...args}

        // set data to store
        setData(data)

        // handle redirect page, not preview (with don't have type and _type)
        if (!isPreview && channel && data[channel.name] && channel.config.redirect) {
            // reload the url
            location.href = channel.gen({ code: data[channel.name] })
        }

        // set exits or not, except start with _
        setIsExits(Object.keys(data).filter(key => !key.startsWith("_") && data[key]).length !== 0);

        // generate the qrcode and set to image
        const url = channel&&data[channel.name] ?
            channel.gen({ code: data[channel.name] }) :
            code ? location.href : // getCodeUrl(code) :
            getBasePath() + "/s?" + Object.keys(xdata).map((k) => `${k}=${encodeURIComponent(xdata[k])}`).join('&');

        onQrcode && onQrcode(url);
        QRCode.toDataURL(url).then((r) => {
            setQrcode(r)
            setWaiting(false)
        })

    }, [code, xdata, router.isReady])

    if (waiting) return <Section className="justify-center" {...sectionProps}>
        <span className="flex h-10 w-10 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-10 w-10 bg-purple-500"></span>
        </span>
    </Section>

    if (!isExits) return <Section className="justify-center" {...sectionProps} leading="😱" description="收款码不存在" />

    return <Section className={`justify-center select-none ${className}`} {...sectionProps}
        description={(!channel||data[channel.name])?data._excerpt:"仅支持以上付款方式 ☝️"}
        title={<div className="flex text-xl space-x-4">
        {channels.filter(({ disable, name }) => !disable &&
            (!channel || (data[channel.name]?name===channel.name:data[name]))) // all or matched one
            .map(({ name, title, logo, logoFull }) => <div key={name}
                className="flex items-center">
                <img className="h-10" src={channel&&data[channel.name]?logoFull||logo:logo} />
                {channel&&data[channel.name]&&!logoFull&&<p className="ml-2 text-md">{title}</p>}
            </div>)}
        </div>}>
        <div style={{backgroundColor: channel&&channel.config.color}}
            className="flex flex-col items-center w-full max-w-xs p-5 bg-purple-400 text-white rounded-md">
            {/* subtitle */}
            <p className="font-bold text-xl must-line-height">{data._subtitle||''}</p>
            {/* qrcode */}
            <div className="w-2/3 max-w-60 max-h-60 bg-white my-5 md:my-10">
                <img className="w-full h-full" src={qrcode} />
            </div>
            {/* footer */}
            <p className="w-48 must-line-height">{(channel?
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