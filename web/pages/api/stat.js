const WORKER_API = process.env.WORKER_API_URL || 'http://localhost:8787';

export default async function handler(req, res) {
    const response = await fetch(`${WORKER_API}/api/stat`)
    const data = await response.json()
    res.status(200).json(data);
}
