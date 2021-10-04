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

    </Section>
}

export default UsagePage