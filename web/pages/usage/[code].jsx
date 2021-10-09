import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import Section from "../../components/section"
import { getBasePath } from "../../lib/utils"


// landing page for qrcode
const UsagePage = () => {
    const router = useRouter()
    const { code, isnew, _type, ...args } = router.query

    const [basePath, setBasePath] = useState("")
    useEffect(() => {
        setBasePath(getBasePath())
    }, [])

    const { width, height } = useWindowSize()
    console.log(`${width} ${height}`)
    
    return <Section
    title={<>{isnew?'🎉 恭喜创建成功，':null}二维码ID: <code className="rounded px-2 bg-purple-200 text-purple-500 text-md">{code}</code></>}
    description={null}>
        {isnew&&<Confetti style={{position: "fixed"}}
            width={width} height={height}
            run={isnew} recycle={false} />}
        <div className="w-full text-left">
            <h3 className="text-xl font-bold mb-2">二维码页面</h3>
            <pre className="bg-gray-100 p-3 rounded">{basePath}/s/{code}</pre>
        
            <div className="my-10" />
            
            <h3 className="text-xl font-bold mb-2">二维码图片</h3>
            <pre className="bg-gray-100 p-3 rounded">{basePath}/s/{code}.png</pre>
            <div className="mt-4">
                <img className="rounded-xl ring-4 ring-purple-200" label={`${code}.png`} src={`${basePath}/s/${code}.png`} />
            </div>
            {/* <h3 className="text-xl font-bold mb-2">页面预览</h3> */}
        </div>

    </Section>
}

export default UsagePage