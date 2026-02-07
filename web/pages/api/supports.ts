import type { NextApiRequest, NextApiResponse } from 'next'
import Server from '../../lib/server'

const svr = new Server()

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json(svr.listSupported())
}
