import channels from "../../channels.json";
import settings from "../config/settings";
import { Q } from "./server";

const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 5000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
}

const getChannelByUA = (ua) => {
  for (let i=0; i < channels.length; i++) {
    let q = channels[i];
    if (q.ua===ua || (new RegExp(q.ua)).test(ua||navigator.userAgent)) {
      // return the channel
      return new Q(q);
    }
  }
  return null;
}

const getChannelByName = (name) => {
  for (let i=0; i < channels.length; i++) {
    let q = channels[i];
    if (q.name === name) {
      // return the channel
      return new Q(q);
    }
  }
  return null;
}

const getCodeUrl = (code) => {
  return settings.endpoint.startsWith("http")?
    `${settings.endpoint}/api/s/${code}`:
    `${location.origin}/api/s/${code}`
}

const getBasePath = () => {
  return [
    location.origin,
    settings.basePath,
  ].filter(i => i && i!=="/").join("/")
}

const matchChannel = (data) => {
  const x = channels.filter(({ url }) => data.startsWith(url.split('{}')[0]))
  return x.length === 1 ? x[0] : null
}

export {
  getChannelByUA, getChannelByName,
  getCodeUrl,
  matchChannel,
  getBasePath,
  fetchWithTimeout,
}