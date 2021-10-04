import { fetchWithTimeout } from "./utils";

class Store {
    put(key, data) {
        throw new Error("unimplement");
    }

    get(key) {
        throw new Error("unimplement");
    }
}

class GitioStore extends Store {
    constructor({ host, basicUrl, keyPrefix } = {}) {
        super();

        this._host = host || "https://git.io";

        // in query
        this._basicUrl = basicUrl || "https://jiusanzhou.github.io/payone/s";

        // TODO: check basic url should be github url

        this._keyPrefix = keyPrefix || "payone-";

        this.fetch = fetchWithTimeout; // TODO: replace the fetch
    }

    // build the target url
    _buildTargetUrl(data) {
        // only supported in search
        let query = Object.keys(data)
            .map(
                (i) => `${encodeURIComponent(i)}=${encodeURIComponent(data[i])}`
            )
            .join("&");
        return `${this._basicUrl}${
            this._basicUrl.indexOf("?") > 0 ? "&" : "?"
        }${query}`;
    }

    async put(key, data) {
        if (!data || Object.keys(data).length === 0) {
            throw new Error("empty data object");
        }

        const url = this._buildTargetUrl(data);

        console.log("[GitioStore] put", key, url);

        // post
        return this.fetch(this._host, {
            method: "POST",
            body: `code=${this._keyPrefix}${key}&url=${encodeURIComponent(
                url
            )}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }).then(async (r) => {
            if (r.ok) return true;
            console.log("[GitioStore] response", r.statusText);
            throw new Error(await r.text());
        });
    }

    async get(key) {
        // get url from
        return this.fetch(`${this._host}/${this._keyPrefix}${key}`, {
            // redirect: 'manual',
            method: 'HEAD',
            // can't get directlly 
        })
            .then((r) => {
                let url = r.url;
                console.log("[GitioStore] get", key, url);
                let data = {};
                (new URL(url)).searchParams.forEach(
                    (v, k) => (data[k] = v)
                );
                return data;
            });
    }
}

class GhIssue extends Store {}

class HttpContent extends Store {}

export { GitioStore };
