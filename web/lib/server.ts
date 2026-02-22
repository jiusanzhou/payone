import { createStore, Store, StoreType, StoreOptions, PaymentData } from "./store";
import channels from "../../channels.json";

export interface ChannelConfig {
    name: string;
    title: string;
    ua?: string;
    url: string;
    logo?: string;
    logoFull?: string;
    redirect?: boolean;
    tip?: string;
    color?: string;
    disable?: boolean;
    limited?: boolean;
    limitedReason?: string;
    crypto?: boolean;
}

export interface ServerOptions {
    basicUrl?: string;
    storeType?: StoreType;
    storeOptions?: StoreOptions;
}

export type GetItemResult = [string | null, string | null, PaymentData | null, string | null];
export type CreateItemResult = [boolean, string | null, string | null];

class Q {
    config: ChannelConfig;
    name: string;
    private _regexua: RegExp | null;

    constructor(config: ChannelConfig) {
        this.config = config;
        this.name = config.name;
        this._regexua = config.ua ? new RegExp(config.ua) : null;
    }

    match(ua: string): boolean {
        if (!this.config.ua) return false;
        if (this.config.ua === ua) return true;
        if (this._regexua === null) return false;
        return this._regexua.test(ua);
    }

    gen(params: { code: string }): string {
        const url = this.config.url;
        return url.indexOf("{}") < 0
            ? url + params.code
            : url.replace("{}", params.code);
    }
}

class Server {
    version = "v0.0.2";
    qs: Q[] = [];
    basicUrl: string;
    store: Store | null = null;

    constructor({ basicUrl, storeType, storeOptions }: ServerOptions = {}) {
        this.basicUrl = basicUrl || 'https://payone.wencai.app/s/';
        this.qs = (channels as ChannelConfig[]).map((q) => new Q(q));

        if (storeType) {
            this.store = createStore(storeType, storeOptions || {});
        }
    }

    setStore(store: Store): void {
        this.store = store;
    }

    getItem = async (code: string, ua = ""): Promise<GetItemResult> => {
        if (!code) {
            return [null, null, null, "code cannot be empty"];
        }

        if (!this.store) {
            return [null, null, null, "storage backend not configured"];
        }

        let data: PaymentData | null = null;
        try {
            data = await this.store.get(code);
        } catch (e) {
            return [null, null, null, (e as Error).message];
        }

        let q: Q | null = null;
    
        for (let i = 0; i < this.qs.length; i++) {
            q = this.qs[i];
            if (q.match(ua)) break;
            q = null;
        }

        let url: string;
        let key: string | null = null;

        if (q) key = q.name;

        if (q && q.config.redirect && key && data[key]) {
            url = q.gen({ code: data[key] });
        } else {
            const query = Object.keys(data)
                .map(i => `${encodeURIComponent(i)}=${encodeURIComponent(data[i])}`)
                .join("&");
            url = `${this.basicUrl}${this.basicUrl.indexOf('?') > 0 ? '&' : '?'}${query}`;
        }

        return [key, url, data, null];
    };

    createItem = async (code: string, data: PaymentData = {}): Promise<CreateItemResult> => {
        if (!code) {
            return [false, "code can't be empty", null];
        }

        if (!this.store) {
            return [false, "storage backend not configured", null];
        }

        const storeName = this.store.name || "unknown";

        try {
            await this.store.put(code, data);
        } catch (e) {
            return [false, `[${storeName}] ${(e as Error).message}`, storeName];
        }

        return [true, null, storeName];
    };

    listSupported = (): ChannelConfig[] => {
        return this.qs.map(q => q.config);
    };

    stat = async (): Promise<{ backend: string | null; count: number | null }> => {
        if (!this.store) {
            return { backend: null, count: null };
        }
        const count = await this.store.count();
        return { backend: this.store.name, count };
    };
}

export { Q };
export default Server;
