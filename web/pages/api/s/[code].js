import Server from "../../../lib/server";

const svr = new Server();

export default async function handler(req, res) {
    const { code } = req.query
    if (req.method === 'GET') {
        const [channel, url, channels, err] = await svr.getItem(code, req.headers['user-agent'])
        if (req.query.type === "json") {
            if (err) {
                res.status(200).json({error: err});
                return;
            }

            // return json data
            res.status(200).json({key: code, channel, url, channels});
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