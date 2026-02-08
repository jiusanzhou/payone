const isDev = process.env.NODE_ENV === 'development'

const config = {
    workerApiUrl: process.env.WORKER_API_URL || (isDev 
        ? 'http://127.0.0.1:8787' 
        : 'https://payone.wuma.workers.dev'),
    
    baseUrl: process.env.BASE_URL || (isDev 
        ? 'http://localhost:3000' 
        : 'https://payone.wencai.app'),
    
    screenshotProvider: process.env.SCREENSHOT_PROVIDER || 'microlink',
    
    isDev,
}

export default config
