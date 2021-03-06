import Server from "../../../lib/server";
import screenshotProviders from "../../../lib/screenshot";

const svr = new Server();

const screenshotAPI = "https://shot.screenshotapi.net/screenshot";

const getConvertRedirectUrl = (req) => {
    let { code, app, match, ext, ...args } = req.query
    const parts = code.split('.')
    ext = code.indexOf(".") > 0 ? parts.pop() : req.query.ext
    code = parts.join('.')

    if (!args.width) args.width = 390
    if (!args.height) args.height = 844
    if (!args.wait_for_event) args.wait_for_event = "load"
    if (!args.full_page) args.full_page = true
    if (!args.output) args.output = "image"
    if (!args.file_type) args.file_type = ext || 'png'

    if (match) args.user_agent = req.headers['user-agent']

    let host = req.headers.host
    if (/localhost|127.0.0.1/.test(host)) host = "payone.wencai.app"

    args.url = `https://${host}/s/${code}?type=${app||''}` // this type is not for api

    let x = Object.keys(args).map(key => `${key}=${encodeURIComponent(args[key])}`).join('&')
    return `${screenshotAPI}?${x}`
}

const makeScreenshot = (req, res) => {
    let { code, app, provider = 'microlink', ...args } = req.query
    const parts = code.split('.')

    // set extention from code path
    if (code.indexOf(".") > 0) args.ext = parts.pop() 
    code = parts.join('.')

    const p = screenshotProviders[provider]
    if (!p) res.status(500).send('unknown screenshot provider:', provider)

    // get target url
    let host = req.headers.host
    if (/localhost|127.0.0.1/.test(host)) host = "payone.wencai.app"
    const url = `https://${host}/s/${code}?type=${app||''}` // this type is not for api

    // args.isMobile = true
    args.width = args.width || '640'
    args.height = args.height || '960'
    args.device = 'iphone'
    args.type = 'image'

    res.redirect(302, p.gen(url, args))
}

export default async function handler(req, res) {
    const { code, type } = req.query
    if (req.method === 'GET') {
        // if code has . means we a process to png
        if (code.indexOf('.') !== -1 || type === "image") {
            // res.redirect(302, getConvertRedirectUrl(req))
            makeScreenshot(req, res)
            return;
        }

        const [channel, url, channels, err] = await svr.getItem(code, req.headers['user-agent'])
        if (type === "json") {
            res.status(200).json(err ? {error: err} : {key: code, channel, url, channels});
            return;
        }

        // redirect or error
        err ? res.status(500).send(`system error: ${err}`) : res.redirect(302, url)
    }

    if (req.method === 'POST') {
        let data = req.body
        const [ok, err] = await svr.createItem(code, data)
        const r = {key: code, data, success: ok}
        if (!ok) r.error = err
        res.status(200).json(r);
        return;
    }
}