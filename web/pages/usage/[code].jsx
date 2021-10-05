import { useRouter } from "next/router"
import { useEffect } from "react"
import Section from "../../components/section"


// landing page for qrcode
const UsagePage = () => {
    const router = useRouter()
    const { code, isnew, _type, ...args } = router.query
    
    return <Section
    title={<>{isnew?'🎉 恭喜创建成功，':null}二维码ID: <code className="rounded px-2 bg-purple-200 text-purple-500 text-md">{code}</code></>}
    description={null}>

    <div className="w-full text-left">
        <h3 className="text-xl font-bold mb-2">二维码页面</h3>
        <pre className="bg-gray-100 p-3 rounded">{location.origin}/s/{code}</pre>
    
        <div className="my-10" />
        
        {/* <h3 className="text-xl font-bold mb-2">二维码图片</h3> */}
        {/* <h3 className="text-xl font-bold mb-2">页面预览</h3> */}
    </div>

    </Section>
}

export default UsagePage