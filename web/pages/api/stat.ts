import type { NextApiRequest, NextApiResponse } from 'next'
import Server from '../../lib/server'
import { CloudflareKVStore } from '../../lib/store'
import { createRestKVFromEnv } from '../../lib/cf-kv'
import config from '../../lib/config'

let svr: Server | null = null
function getServer(): Server {
    if (svr) return svr
    svr = new Server({ basicUrl: `${config.baseUrl}/s/` })
    try {
        svr.setStore(new CloudflareKVStore({
            kvNamespace: createRestKVFromEnv(),
            basicUrl: `${config.baseUrl}/s`,
        }))
    } catch (e) {
        console.error('[api/stat] init KV failed:', (e as Error).message)
    }
    return svr
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    try {
        const server = getServer()
        const stat = await server.stat()
        res.status(200).json(stat)
    } catch (e) {
        res.status(500).json({ error: (e as Error).message })
    }
}
