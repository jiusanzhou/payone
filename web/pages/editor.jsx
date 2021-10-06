import { useCallback, useEffect, useState } from "react";

import QrScanner from 'qr-scanner'; 
import qrScannerWorkerSource from '!!raw-loader!../node_modules/qr-scanner/qr-scanner-worker.min.js';

import Input from "../components/input";
import Section from "../components/section";

import Preview from "../views/preview";

import apis from "../lib/api";

import { getBasePath, matchChannel } from "../lib/utils";

import channels from "../../channels.json";
import { useRouter } from "next/router";

if (typeof window !== "undefined") QrScanner.WORKER_PATH = URL.createObjectURL(new Blob([qrScannerWorkerSource]));

const _defaultData = {
    _title: '付款码',
    _excerpt: '你的支持是我最大的动力',
    _subtitle: '感谢支持~',
    _tip: '',
}

const Editor = () => {
    const router = useRouter()

    // const [basePath, setBasePath] = useState("")
    const [data, setData] = useState(_defaultData)
    const [code, setCode] = useState('')
    const [tempUrl, setTempUrl] = useState('')
    const [tempErr, setTempErr] = useState(null)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [error, setError] = useState(null)

    // useEffect(() => {
    //     setBasePath(getBasePath())
    // }, [])

    const parseUrl = useCallback((v) => {
        if (!v) return
        const c = matchChannel(v)
        if (!c) {
            setTempErr("不支持的收款码协议")
            return
        }
        if (c.disable) {
            setTempErr(`暂不支持 ${c.title} 收款码方式`)
            return
        }
        setData({...data, [c.name]: v.replace(c.url.replace('{}', ''), '')})
        
        setTempUrl("") // clear
    }, [data])

    return <Section description="创建多合一收款码" leading="🌈">
        <div className="">
        <div className="w-full md:flex items-start justify-between">
            {/* editor main:  border-1 shadow */}
            <div className="md:w-2/3 flex flex-col mb-4 md:mb-0 md:mr-4 ring-4 ring-gray-100 ring-opacity-50 rounded-2xl p-4 md:px-8 flex-1">
                <div className="mb-6 md:flex">
                    {/* qrcode or url input area */}
                    <div className="mb-6 md:mb-0 md:w-1/2">
                        <p className="text-md text-gray-500 text-left mb-4">二维码或解析后的内容:</p>
                        {/* qrcode selector */}
                        <div className="cursor-pointer relative h-24 rounded-lg border-dashed border-4 border-purple-500 bg-gray-100 flex justify-center items-center">
                            <div className="absolute">
                                <div className="flex flex-col items-center">
                                    <span className="block text-gray-400 font-normal">选择或放置二维码图片</span>
                                </div>
                            </div>
                            <input type="file" className="cursor-pointer h-full w-full opacity-0" accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
                                onClick={() => setTempErr('')}
                                onChange={({ target: { files: [file] } }) => {
                                    file && QrScanner.scanImage(file)
                                        .then(result => parseUrl(result))
                                        .catch(error => setTempErr(error || '请选择二维码图片'));
                                }} />
                        </div>
                
                        <div className="flex mt-6 text-sm items-start">
                            <Input value={tempUrl} onChange={(v) => {
                                setTempUrl(v); setTempErr(null); setError(null);
                            }} info={tempErr} className="flex-1" placeholder="或二维码解析后内容" />
                            <button onClick={() => parseUrl(tempUrl)} className={`ml-4 p-2 ${tempUrl?"text-green-400":"text-gray-400"}`}>确认</button>
                        </div>
                    </div>

                    {/* channels show has added */}
                    <div className="md:w-1/2 md:ml-5 space-y-2">
                        <p className="text-md text-gray-500 text-left mb-4">已设置的收款渠道:</p>
                        {channels.map(({ name, logo, title, disable }) => 
                        <div className="flex items-center text-sm" key={name}>
                            <img alt={title} src={logo} className={`mr-2 w-8 h-8 ${disable?'filter grayscale':null}`} />
                            {disable?<p className="text-gray-400">暂不支持</p>:
                            <Input value={data[name]||''} className="flex-1" placeholder="未提交二维码或链接" />}
                            {!disable&&<button onClick={()=>setData({...data, [name]:null})} className={`ml-4 ${data[name]?'text-red-400':'text-gray-400'}`}>删除</button>}
                        </div>)}
                    </div>
                </div>

                {/* code input and commit button */}
                <Input validator={(v) => {
                    if (!/^[0-9A-Za-z-_]{3,20}$/.test(v)) {
                        return "不符合规则: ^[0-9A-Za-z-_]{3,20}$"
                    }
                }} value={code} onChange={setCode} className="text-sm" required
                label="你的专属二维码ID" placeholder="你的唯一ID" />

                {/* advances inputs form */}
                {/* toggle the advance */}
                <Input className="text-sm my-4" value={showAdvanced} onChange={(v) => setShowAdvanced(!showAdvanced)} label="高级设置" type="switcher" />

                <div className={`text-sm space-y-4 ${!showAdvanced?'hidden':''}`}>
                    <Input validator={(v) => v.length > 20?'长度不能超过20':null} value={data._title||''} onChange={(v) => setData({...data, _title: v})} label="页面标题" placeholder="付款码" />
                    <Input validator={(v) => v.length > 20?'长度不能超过20':null} value={data._excerpt||''} onChange={(v) => setData({...data, _excerpt: v})} label="说明文本" placeholder="你的支持是我最大动力！" />
                    <Input validator={(v) => v.length > 20?'长度不能超过20':null} value={data._subtitle||''} onChange={(v) => setData({...data, _subtitle: v})} label="二维码标题" placeholder="感谢支持~" />
                    <Input validator={(v) => v.length > 20?'长度不能超过20':null} value={data._tip||''} onChange={(v) => setData({...data, _tip: v})} label="底部提示" placeholder="" />
                </div>
            </div>

            {/* preview on phone */}
            <Preview {...data} className="max-w-xl md:w-1/3" />
        </div>
    
        <div className="my-4 w-full border-2"></div>

        <div className="text-sm text-gray-400 mb-2">由于使用的是无服务的存储，创建后所有内容均不可修改。</div>

        <div className="md:flex items-start justify-between justify-self-end">
            <div className="md:max-w-2/3 text-red-400">{error}</div>
            <button onClick={() => {
                if (Object.keys(data).filter(key => !key.startsWith("_") && data[key]).length === 0) {
                    setError("至少要提供一个收款码")
                    return
                }

                if (!/^[0-9A-Za-z-_]{3,20}$/.test(code)) {
                    setError('二维码ID不符合规则')
                    return
                }

                // TODO: call api to create a new code
                apis.createItem(code, data).then((r) => {
                    if (r.success) {
                        // route to result page
                        router.push(`/usage/${code}?isnew=true`)
                        return
                    }

                    setError((r.error))
                }).catch(e => setError((`${e}`)))
                
            }} className="py-2 px-4 bg-purple-500 text-white rounded-full ring-4 ring-purple-200 ring-inset">立即创建</button>
        </div>
        </div>
    </Section>
}

Editor.title = "创建二维码 | PayOne"

export default Editor