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

class Q {
  name;
  icon;
  ua;
  url;

  // regex to detect the ua
  _regex;

  // try not to be awesome, make it work first!!!
  constructor(config = {}) {
    // build from json configuration
    this.name = config.name;
    this.icon = config.icon;
    this.ua = config.ua;
    this.url = config.url;

    // build regex for ua
    this._regex = new RegExp(ua);
  }

  // TODO: add more matcher with request
  match(ua) {
    if (this.ua === ua ) return true;
    if (this._regex === null) return false;
    return this._regex.test(ua);
  }

  gen(params) {
    // { code: "xxxx" }
    // for minimalism, only `code` in params,  and just replace with
    // generate url with url template and params from config
    return this.url.replace("{}", params.code);
  }
}

class Server {
  version = "v0.0.1";

  qs = [];

  constructor() {
    // load from remote provider
    qs = [
      { name: "Alipay", ua: "", url: "" },
      { name: "WeChat", ua: "", url: "" },
    ];
  }

  // 1. load all data from database provider: gh
  //   1. codes
  //   2. qrcode layout
  //   3. html page template
  // 2. detector: alipay, wechat, ...
  // 3. handle core /s/xxx return qrcode of platform, redirect url of special platform
  // 4. with type param: img, and format: svg or png, tpl: default, returns code
  // 5. with type param: html, and tpl: default return html

  // 6. handle github webhook, handle the issues and check if vanity code can be set

  // handle is the main method to process the request
  async handle(request) {
    this.count++;
    return new Response(`Hello worker! We have handled ${this.count} times`, {
      status: 200,
    });
  }
}

export default Server;
