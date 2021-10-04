/*
 * Copyright (c) 2020 wellwell.work, LLC by Zoe
 *
 * Licensed under the Apache License 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GitioStore } from "./store";

import channels from "../../channels.json";

class Q {
    config = {};

    // regex to detect the ua
    _regexua;

    // try not to be awesome, make it work first!!!
    constructor(config) {
        this.config = config;

        this.name = config.name;

        // build regex for ua
        this._regexua = new RegExp(this.config.ua);
    }

    // TODO: add more matcher with request
    match(ua) {
        if (this.config.ua === ua) return true;
        if (this._regexua === null) return false;
        return this._regexua.test(ua);
    }

    gen(params) {
        // { code: "xxxx" }
        // for minimalism, only `code` in params,  and just replace with
        // generate url with url template and params from config
        let url = this.config.url;
        return url.indexOf("{}") < 0
            ? url + params.code
            : url.replace("{}", params.code);
    }
}

class Server {
    version = "v0.0.1";

    qs = [];

    constructor({ basicUrl } = {}) {
      this.basicUrl = basicUrl || 'https://labs.zoe.im/payone/s/'

      // load from remote provider
      this.qs = channels.map((q) => new Q(q));

      this.store = new GitioStore();
    }

    // 1. load all data from database provider: gh
    //   1. codes
    //   2. qrcode layout
    //   3. html page template
    // 2. detector: alipay, wechat, ...
    // 3. handle core /s/xxx return qrcode of platform, redirect url of special platform
    // 4. with type param: img, and format: svg or png, tpl: default, returns code
    // 5. with type param: html, and tpl: default return html

    // 6. use git.io as store provider

    // Routers:
    // - /redirect?wechat=xxx&alipay=xxx => directly url to handle scan
    // - /s/xxx => load data from store and handle scan, POST to create
    // - add more generate image and html api

    // get item with code
    // return result: (key, url, data, error)
    getItem = async (code, ua="") => {

        if (!code) {
            return [null, null, null, "code cannot be empty"];
        }

        // get data from store
        let data = null;
        try {
            data = await this.store.get(code);
        } catch (e) {
            console.log(`[payone] get ${code} failed: ${e.message}`)
            return [null, null, null, e.message];
        }

        // match with the user-agent
        let q = null;
        let _ua = ua;
        console.log("[payone] match with the user-agent", _ua);
    
        for (let i = 0; i < this.qs.length; i++) {
            q = this.qs[i];
            if (q.match(_ua)) break;
            q = null
        }

        if (q) {
            console.log("[payone] match the channel", q.name)
        }

        let url;
        let key;

        if (q) key = q.name

        if (q && q.config.redirect && data[key]) {
            url = q.gen({ code: data[key] })
        } else {
            let query = Object.keys(data).map(i => `${encodeURIComponent(i)}=${encodeURIComponent(data[i])}`).join("&")
            url = `${this.basicUrl}${this.basicUrl.indexOf('?')>0?'&':'?'}${query}`
        }

        return [key, url, data, null]
    };

    // create a item with:
    // code, data
    // return result: (flag, error)
    createItem = async (code, data = {}) => {

        if (!code) {
            return [false, "code can't be empty"];
        }

        console.log(`[payone] create ${code}: ${JSON.stringify(data)}`);

        try {
            await this.store.put(code, data)
        } catch (e) {
            console.log("[payone] create error:", e.message)
            return [false, e.message];
        }

        return [true, null];
    };

    // list all supported channels
    listSupported = () => {
        return this.qs.map(q => q.config)
    }
}

export { Q }

export default Server;
