

class Provider {

    endpoint = null
    targetUrlKey = "url"
    defaultOptions = {}
    mapKeys = {}

    optionsTransformer(options) {
        console.log("===> original")
        return options
    }

    _transformer = (options) => {
        const opts = {}
        const x = this.optionsTransformer(options)
        Object.keys(x).forEach((k) => {
            opts[this.mapKeys[k]||k] = x[k]
        })
        return {...this.defaultOptions, ...opts}
    }

    gen(url, options = {}) {
        if (!this.endpoint) {
            throw new Error("endpoint is required")
        }

        // { app, match, ext }

        const opts = this._transformer(options)
        opts[this.targetUrlKey] = url

        const query = Object.keys(opts).map((k) => `${k}=${encodeURIComponent(opts[k])}`).join("&")

        return `${this.endpoint}?${query}`
    }

}

class ScreenshotapiNet extends Provider {
    constructor(endpoint) {
        super()
        this.endpoint = endpoint || 'https://shot.screenshotapi.net/screenshot'
    }

    defaultOptions = {
        full_page: true,
        output: 'image',
        file_type: 'png',
    }

    mapKeys = {
        waitUntil: 'wait_for_event',
        ext: 'file_type',
    }


    optionsTransformer(options) {
        const { device, isMobile, ...opts } = options
        return opts
    }
}

class Microlink extends Provider {
    constructor(endpoint) {
        super()
        this.endpoint = endpoint || 'https://api.microlink.io/'
    }

    defaultOptions = {
        waitUntil: 'networkidle2',
        waitForTimeout: '500',
        fullPage: true,
        screenshot: true,
        meta: false,
        embed: 'screenshot.url'
    }

    mapKeys = {
        width: 'viewport.width',
        height: 'viewport.height',
        isMobile: 'viewport.isMobile'
    }

    optionsTransformer(options) {
        const { ext, ...opts } = options
        if (opts.device) {
            // unset width and height
            delete opts.width
            delete opts.height
        }

        return opts
    }
}

// export default providers
export default {
    shotnet: new ScreenshotapiNet(),
    microlink: new Microlink(),
}