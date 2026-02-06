import screenshotProviders from "../../../lib/screenshot";

const WORKER_API = process.env.WORKER_API_URL || 'http://localhost:8787';
const USE_WORKER_SCREENSHOT = process.env.USE_WORKER_SCREENSHOT === 'true';

const makeScreenshot = (req, res, isBanner = false) => {
    let { code, app, provider = 'microlink', ...args } = req.query
    const parts = code.split('.')

    if (code.indexOf(".") > 0) args.ext = parts.pop() 
    code = parts.join('.')

    if (USE_WORKER_SCREENSHOT) {
        const workerUrl = new URL(`${WORKER_API}/api/screenshot/${code}`)
        if (isBanner) {
            workerUrl.searchParams.set('banner', 'true')
            workerUrl.searchParams.set('width', args.width || '1200')
            workerUrl.searchParams.set('height', args.height || '630')
        } else {
            workerUrl.searchParams.set('width', args.width || '640')
            workerUrl.searchParams.set('height', args.height || '960')
        }
        res.redirect(302, workerUrl.toString())
        return
    }

    const p = screenshotProviders[provider]
    if (!p) res.status(500).send('unknown screenshot provider:', provider)

    let host = req.headers.host
    if (/localhost|127.0.0.1/.test(host)) host = "payone.wencai.app"
    
    let url
    if (isBanner) {
        url = `https://${host}/s/${code}/banner`
        args.width = args.width || '1200'
        args.height = args.height || '630'
    } else {
        url = `https://${host}/s/${code}?type=${app||''}`
        args.width = args.width || '640'
        args.height = args.height || '960'
        args.device = 'iphone'
    }
    args.type = 'image'

    res.redirect(302, p.gen(url, args))
}

export default async function handler(req, res) {
    const { code, type } = req.query
    
    if (req.method === 'GET') {
        const isBanner = code.includes('-banner.') || code.endsWith('-banner')
        const isImage = code.indexOf('.') !== -1 || type === "image"
        
        if (isImage) {
            const actualCode = code.replace('-banner', '').split('.')[0]
            req.query.code = isBanner ? `${actualCode}.png` : code
            makeScreenshot(req, res, isBanner)
            return;
        }

        const workerUrl = `${WORKER_API}/api/s/${code}?type=json`
        const response = await fetch(workerUrl, {
            headers: { 'User-Agent': req.headers['user-agent'] || '' }
        })
        const data = await response.json()

        if (type === "json") {
            res.status(200).json(data);
            return;
        }

        if (data.error) {
            res.status(500).send(`system error: ${data.error}`)
        } else {
            res.redirect(302, data.url)
        }
        return;
    }

    if (req.method === 'POST') {
        const workerUrl = `${WORKER_API}/api/s/${code}`
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        })
        const data = await response.json()
        res.status(200).json(data);
        return;
    }
}
