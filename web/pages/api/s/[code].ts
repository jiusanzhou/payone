import { getProvider, ScreenshotContext, ScreenshotOptions } from "../../../lib/screenshot"
import type { NextApiRequest, NextApiResponse } from 'next'

const WORKER_API = process.env.WORKER_API_URL || 'http://localhost:8787'

async function handleScreenshot(
    req: NextApiRequest,
    res: NextApiResponse,
    isBanner: boolean
): Promise<void> {
    const { code, app, provider: providerName, ...args } = req.query as Record<string, string>
    const parts = code.split('.')
    
    let ext: string | undefined
    if (code.indexOf('.') > 0) {
        ext = parts.pop()
    }
    const cleanCode = parts.join('.')

    const ctx: ScreenshotContext = {
        code: cleanCode,
        host: req.headers.host || 'payone.wencai.app',
        isBanner,
        app,
    }

    const options: ScreenshotOptions = {
        ...args,
        ext,
        width: isBanner ? 1200 : 640,
        height: isBanner ? 630 : 960,
        type: 'image',
        device: isBanner ? undefined : 'iphone',
    }

    if (args.width) options.width = parseInt(args.width)
    if (args.height) options.height = parseInt(args.height)

    const provider = getProvider(providerName)
    const result = await provider.generate(ctx, options)

    if (result.redirect && result.url) {
        res.redirect(302, result.url)
        return
    }

    if (result.data) {
        res.setHeader('Content-Type', result.contentType || 'image/png')
        res.send(Buffer.from(result.data))
        return
    }

    res.status(500).send('Screenshot generation failed')
}

async function handleGet(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { code, type } = req.query as { code: string; type?: string }
    
    const isBanner = code.includes('-banner.') || code.endsWith('-banner')
    const isImage = code.indexOf('.') !== -1 || type === 'image'

    if (isImage) {
        const actualCode = code.replace('-banner', '').split('.')[0]
        req.query.code = isBanner ? `${actualCode}.png` : code
        await handleScreenshot(req, res, isBanner)
        return
    }

    const workerUrl = `${WORKER_API}/api/s/${code}?type=json`
    const response = await fetch(workerUrl, {
        headers: { 'User-Agent': req.headers['user-agent'] || '' }
    })
    const data = await response.json()

    if (type === 'json') {
        res.status(200).json(data)
        return
    }

    if (data.error) {
        res.status(500).send(`system error: ${data.error}`)
    } else {
        res.redirect(302, data.url)
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { code } = req.query as { code: string }
    const workerUrl = `${WORKER_API}/api/s/${code}`
    
    const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    })
    const data = await response.json()
    res.status(200).json(data)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    switch (req.method) {
        case 'GET':
            await handleGet(req, res)
            break
        case 'POST':
            await handlePost(req, res)
            break
        default:
            res.status(405).end()
    }
}
