'use client'

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import QrScanner from 'qr-scanner';

import { showToast } from "../components/toast";
import apis from "../lib/api";
import { matchChannel } from "../lib/utils";
import channels from "../../channels.json";
import CodePage from "./s/[code]";

const CODE_REGEX = /^[0-9A-Za-z_-]{3,20}$/;

const Editor = () => {
    const router = useRouter()
    const [data, setData] = useState({
        _title: '付款码',
        _excerpt: '你的支持是我最大的动力',
        _subtitle: '感谢支持~',
        _tip: '',
    })
    const [code, setCode] = useState('')
    const [codeError, setCodeError] = useState(null)
    const [codeChecking, setCodeChecking] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [previewApp, setPreviewApp] = useState(null)
    const fileInputRef = useRef(null)
    const checkTimeoutRef = useRef(null)

    const validateAndCheckCode = useCallback((value) => {
        setCodeError(null)
        
        if (!value) {
            return
        }
        
        if (!CODE_REGEX.test(value)) {
            setCodeError('只能包含字母、数字、下划线和连字符，长度3-20位')
            return
        }

        if (checkTimeoutRef.current) {
            clearTimeout(checkTimeoutRef.current)
        }

        checkTimeoutRef.current = setTimeout(async () => {
            setCodeChecking(true)
            try {
                const result = await apis.getItem(value)
                if (result && !result.error) {
                    setCodeError('该ID已被使用')
                }
            } catch (e) {
            } finally {
                setCodeChecking(false)
            }
        }, 500)
    }, [])

    useEffect(() => {
        return () => {
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current)
            }
        }
    }, [])

    const parseUrl = useCallback((v) => {
        if (!v) return
        const c = matchChannel(v)
        if (!c) {
            showToast('不支持的收款码', 'error')
            return
        }
        if (c.disable) {
            showToast(`暂不支持 ${c.title}`, 'error')
            return
        }
        setData(prev => ({...prev, [c.name]: v.replace(c.url.replace('{}', ''), '')}))
        showToast(`已添加 ${c.title}`, 'success')
    }, [])

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    QrScanner.scanImage(file)
                        .then(parseUrl)
                        .catch(() => showToast('无法识别二维码', 'error'));
                }
                return;
            }
            if (item.type === 'text/plain') {
                item.getAsString((text) => text.trim() && parseUrl(text.trim()));
                return;
            }
        }
    }

    const handleFile = (file) => {
        if (file) {
            QrScanner.scanImage(file)
                .then(parseUrl)
                .catch(() => showToast('无法识别二维码', 'error'));
        }
    }

    const handleSubmit = async () => {
        const hasChannel = Object.keys(data).some(key => !key.startsWith("_") && data[key])
        if (!hasChannel) {
            showToast("请至少添加一个收款码", 'error')
            return
        }
        if (!CODE_REGEX.test(code)) {
            showToast('ID只能包含字母、数字、下划线和连字符，长度3-20位', 'error')
            return
        }
        if (codeError) {
            showToast(codeError, 'error')
            return
        }

        setLoading(true)
        
        try {
            const r = await apis.createItem(code, data)
            if (r.success) {
                showToast('创建成功！', 'success')
                router.push(`/usage/${code}?isnew=true`)
            } else {
                showToast(r.error || '创建失败', 'error')
            }
        } catch (e) {
            showToast(`${e}`, 'error')
        } finally {
            setLoading(false)
        }
    }

    const channelCount = Object.keys(data).filter(k => !k.startsWith('_') && data[k]).length

    return (
        <>
            <div className="w-full max-w-2xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-center mb-8">创建收款码</h1>

                <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
                    onPaste={handlePaste}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer?.files?.[0];
                        if (file?.type.startsWith('image/')) handleFile(file);
                    }}
                    tabIndex={0}
                >
                    <div className="text-4xl mb-3">📷</div>
                    <p className="text-gray-500 mb-2">粘贴或拖放二维码图片</p>
                    <p className="text-gray-400 text-sm">也可以直接粘贴收款链接</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            handleFile(e.target.files?.[0]);
                            e.target.value = '';
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 px-4 py-2 text-sm text-purple-500 border border-purple-500 rounded-full hover:bg-purple-500 hover:text-white transition-colors"
                    >
                        选择图片
                    </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">已添加的渠道</span>
                        <span className="text-xs text-gray-400">{channelCount}/3</span>
                    </div>
                    <div className="space-y-2">
                        {channels.map(({ name, logo, title, disable }) => (
                            <div key={name} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <img src={logo} alt={title} className={`w-8 h-8 flex-shrink-0 ${disable ? 'grayscale opacity-50' : ''}`} />
                                    <div className="min-w-0 flex-1">
                                        <span className={disable ? 'text-gray-400' : ''}>{title}</span>
                                        {data[name] && (
                                            <p className="text-xs text-gray-400 truncate" title={data[name]}>{data[name]}</p>
                                        )}
                                    </div>
                                </div>
                                {disable ? (
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">暂不支持</span>
                                ) : data[name] ? (
                                    <button
                                        onClick={() => setData(prev => ({...prev, [name]: null}))}
                                        className="text-xs text-red-400 hover:text-red-500 flex-shrink-0 ml-2"
                                    >
                                        移除
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">未添加</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-2">你的专属ID</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                const v = e.target.value
                                setCode(v)
                                validateAndCheckCode(v)
                            }}
                            placeholder="例如: zhangsan"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                                codeError 
                                    ? 'border-red-400 focus:border-red-500' 
                                    : code && !codeChecking && CODE_REGEX.test(code)
                                        ? 'border-green-400 focus:border-green-500'
                                        : 'border-gray-200 focus:border-purple-500'
                            }`}
                        />
                        {codeChecking && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">检查中...</span>
                        )}
                    </div>
                    {codeError ? (
                        <p className="text-xs text-red-500 mt-2">{codeError}</p>
                    ) : (
                        <p className="text-xs text-gray-400 mt-2">访问地址将是 payone.wencai.app/s/{code || 'xxx'}</p>
                    )}
                </div>

                <details className="mb-6">
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">高级设置</summary>
                    <div className="mt-4 space-y-4 pl-4">
                        <Field label="页面标题" value={data._title} onChange={(v) => setData({...data, _title: v})} placeholder="付款码" />
                        <Field label="说明文本" value={data._excerpt} onChange={(v) => setData({...data, _excerpt: v})} placeholder="你的支持是我最大动力" />
                        <Field label="二维码标题" value={data._subtitle} onChange={(v) => setData({...data, _subtitle: v})} placeholder="感谢支持~" />
                    </div>
                </details>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPreview(true)}
                        disabled={channelCount === 0}
                        className="flex-1 py-4 border-2 border-purple-500 text-purple-500 font-medium rounded-xl hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        预览效果
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? '创建中...' : '立即创建'}
                    </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                    创建后无法修改，请确认信息无误
                </p>
            </div>

            {showPreview && (
                <PhonePreview
                    data={data}
                    previewApp={previewApp}
                    setPreviewApp={setPreviewApp}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </>
    )
}

const PhonePreview = ({ data, previewApp, setPreviewApp, onClose }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden ring-4 ring-gray-100">
                <div className="flex justify-between items-center px-4 py-3 bg-gray-100">
                    <span className="text-gray-400 cursor-pointer hover:text-gray-600">↓</span>
                    <span className="font-medium text-gray-700">{data._title || '付款码'}</span>
                    <span 
                        onClick={onClose}
                        className="text-gray-400 cursor-pointer hover:text-gray-600"
                    >✕</span>
                </div>
                
                <div className="w-[320px] h-[520px] overflow-auto bg-white">
                    <CodePage
                        isPreview
                        type={previewApp}
                        xdata={data}
                        sectionProps={{ full: true }}
                        className="!my-0 !py-6 px-4"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 mt-5 p-3 bg-white rounded-2xl shadow-lg ring-4 ring-gray-100">
                <span className="text-xs text-gray-400 px-2">预览</span>
                {channels.filter(c => !c.disable).map(({ name, logo, title }) => (
                    <button
                        key={name}
                        onClick={() => setPreviewApp(previewApp === name ? null : name)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            previewApp === name 
                                ? 'bg-purple-100 scale-110 ring-2 ring-purple-400' 
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        <img src={logo} alt={title} className="w-6 h-6" />
                    </button>
                ))}
            </div>
        </div>
    </div>
)

const Field = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
        <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
        />
    </div>
)

Editor.title = "创建收款码 | PayOne"

export default Editor
