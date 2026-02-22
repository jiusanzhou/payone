import channels from "../../channels.json";
import settings from "../config/settings";
import { Q, ChannelConfig } from "./server";

interface FetchOptions extends RequestInit {
    timeout?: number;
}

export const fetchWithTimeout = async (
    resource: RequestInfo | URL, 
    options: FetchOptions = {}
): Promise<Response> => {
    const { timeout = 5000, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...fetchOptions,
        signal: controller.signal  
    });
    clearTimeout(id);
    return response;
};

export const getChannelByUA = (ua?: string): Q | null => {
    const channelsList = channels as ChannelConfig[];
    for (let i = 0; i < channelsList.length; i++) {
        const q = channelsList[i];
        if (!q.ua) continue;
        const testUA = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
        if (q.ua === testUA || new RegExp(q.ua).test(testUA)) {
            return new Q(q);
        }
    }
    return null;
};

export const getChannelByName = (name: string): Q | null => {
    const channelsList = channels as ChannelConfig[];
    for (let i = 0; i < channelsList.length; i++) {
        const q = channelsList[i];
        if (q.name === name) {
            return new Q(q);
        }
    }
    return null;
};

export const getCodeUrl = (code: string): string => {
    const endpoint = (settings as { endpoint?: string }).endpoint || '';
    return endpoint.startsWith("http")
        ? `${endpoint}/api/s/${code}`
        : `${typeof location !== 'undefined' ? location.origin : ''}/api/s/${code}`;
};

export const getBasePath = (): string => {
    const basePath = (settings as { basePath?: string }).basePath;
    return [
        typeof location !== 'undefined' ? location.origin : '',
        basePath,
    ].filter(i => i && i !== "/").join("/");
};

export const matchChannel = (data: string): ChannelConfig | null => {
    const channelsList = channels as ChannelConfig[];
    const x = channelsList.filter(({ url }) => data.startsWith(url.split('{}')[0]));
    return x.length === 1 ? x[0] : null;
};
