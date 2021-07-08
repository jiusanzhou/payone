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

import Server from "./service";

// init the evail proxy
let svr = new Server();

// Register the event handle for `fetch`
addEventListener("fetch", (event) => {
  try {
    return event.respondWith(svr.handle(event.request));
  } catch (e) {
    return new Response(`system error: ${e}`, {
      status: 500,
    });
  }
});
