import Code from "../pages/s/[code]";
import channels from "../../channels.json";
import { useEffect, useState } from "react";

const Preview = ({className, ...props}) => {
    let [curApp, setCurApp] = useState(null)
    // let [ua, setUA] = useState(null)
    let [qrcodeUrl, setQrcodeUrl] = useState(null)

    // useEffect(() => {
    //     let x = channels.filter(({ name }) => name===curApp)
    //     setUA(x.length > 0?x[0].ua:null)
    // }, [curApp])

    // iphone frame, and user-agent change
    return <div className={`${className} flex flex-col md:flex-col-reverse`}>
        <div className="select-none mb-5 mt-0 md:mb-0 md:mt-5">
            <p className="text-md text-gray-500 text-left mb-4">选择预览应用:</p>
            {/* app selector */}
            <div className="flex space-x-4 p-4 rounded-2xl bg-gray-100 backdrop-opacity-70">
                {channels.map(({ name, logo, title }) => <div className={`h-10 w-10 cursor-pointer
                    relative
                    transform-gpu hover:scale-110 ${name===curApp?"scale-110":""}
                    transition duration-150 ease-in-out`}
                    key={name}
                    onClick={() => setCurApp(name===curApp?null:name)}>
                    {name===curApp&&<span className="absolute -top-1.5 -right-1.5 inline-flex rounded-full h-3 w-3 bg-purple-500"></span>}
                    {logo?<img className="h-10" src={logo} />:
                    <div className="flex items-center backdrop-opacity-30 w-full h-full text-sm">
                        <span>{title}</span>
                    </div>}
                </div>)}
            </div>
        </div>

        {/* border-1 shadow */}
        <div className={`ring-4 ring-gray-100 ring-opacity-50 rounded-xl overflow-hidden`}>
            <div className="flex justify-between items-center p-4 bg-gray-100 font-bold">
                <span className="font-md select-none cursor-pointer">✕</span>
                <span>{props._title||"付款码"}</span>
                <span onClick={() => qrcodeUrl && open(qrcodeUrl)} className="font-md select-none cursor-pointer">…</span>
            </div>
            <Code isPreview onQrcode={(v) => setQrcodeUrl(v)} type={curApp} xdata={props}
                sectionProps={{full: true}}  className="md:my-5 md:py-5 px-5 md:px-5" />
        </div>
    </div>
}

export default Preview