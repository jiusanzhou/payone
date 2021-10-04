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

// const Server = require("./service");
import Server from "../../../web/lib/server";
import Router from "cloudworker-router";

// init the evail proxy
let svr = new Server();

let router = new Router();

router.get("/api/s/:code", async (ctx) => {
  const code = ctx.params.code;
  const [channel, url, channels, err] = await svr.getItem(code, ctx.request.headers["user-agent"])

  ctx.response.headers['Access-Control-Allow-Origin'] = "*"

  if (ctx.query.type === "json") {
    if (err) {
      ctx.body = JSON.stringify({error: err});
      ctx.status = 200;
      ctx.response.headers['Content-Type'] = 'application/json'
      return;
    }

    // return json data
    ctx.body = JSON.stringify({key: code, channel, url, channels});
    ctx.status = 200;
    ctx.response.headers['Content-Type'] = 'application/json'
    return;
  }

  // redirect or error
  if (err) {
    ctx.body = `system error: ${err}`
    ctx.status = 500;
    return;
  }

  ctx.status = 302;
  ctx.response.headers['Location'] = url
});

router.post("/api/s/:code", async (ctx) => {
  const data = await ctx.request.json();
  const code = ctx.params.code;
  const [ok, err] = await svr.createItem(code, data)
  const r = {key: code, data, success: ok}
  if (!ok) r.error = err;
  ctx.body = JSON.stringify(r);
  ctx.response.headers['Content-Type'] = 'application/json'
  ctx.response.headers['Access-Control-Allow-Origin'] = "*"
  ctx.status = 200;
});

router.get('/api/supports', async (ctx) => {
  ctx.body = JSON.stringify(svr.listSupported());
  ctx.response.headers['Content-Type'] = 'application/json'
  ctx.response.headers['Access-Control-Allow-Origin'] = "*"
  ctx.status = 200;
});

router.allowMethods();

// Register the event handle for `fetch`
addEventListener("fetch", (event) => {
  return event.respondWith(router.resolve(event));
});
