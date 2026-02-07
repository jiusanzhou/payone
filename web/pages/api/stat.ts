import type { NextApiRequest, NextApiResponse } from 'next'
import config from '../../lib/config'

const WORKER_API = config.workerApiUrl

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const response = await fetch(`${WORKER_API}/api/stat`)
    const data = await response.json()
    res.status(200).json(data)
}
