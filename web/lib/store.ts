export interface PaymentData {
    [key: string]: string;
}

export interface StoreOptions {
    host?: string;
    basicUrl?: string;
    keyPrefix?: string;
    apiToken?: string;
    kvNamespace?: KVNamespace;
}

export interface KVNamespace {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

export abstract class Store {
    abstract readonly name: string;
    
    abstract put(key: string, data: PaymentData): Promise<boolean>;
    abstract get(key: string): Promise<PaymentData>;
    
    async count(): Promise<number | null> {
        return null;
    }

    static create(options: StoreOptions): Store {
        throw new Error("Subclass must implement static create method");
    }
}

export class GitioStore extends Store {
    readonly name = "gitio";
    private _host: string;
    private _basicUrl: string;
    private _keyPrefix: string;
    
    constructor(options: StoreOptions = {}) {
        super();
        this._host = options.host || "https://git.io";
        this._basicUrl = options.basicUrl || "https://jiusanzhou.github.io/payone/s";
        this._keyPrefix = options.keyPrefix || "payone-";
    }

    static create(options: StoreOptions = {}): GitioStore {
        return new GitioStore(options);
    }

    private _buildTargetUrl(data: PaymentData): string {
        const query = Object.keys(data)
            .map((i) => `${encodeURIComponent(i)}=${encodeURIComponent(data[i])}`)
            .join("&");
        return `${this._basicUrl}${this._basicUrl.indexOf("?") > 0 ? "&" : "?"}${query}`;
    }

    async put(key: string, data: PaymentData): Promise<boolean> {
        if (!data || Object.keys(data).length === 0) {
            throw new Error("empty data object");
        }

        const url = this._buildTargetUrl(data);

        const response = await fetch(this._host, {
            method: "POST",
            body: `code=${this._keyPrefix}${key}&url=${encodeURIComponent(url)}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (response.ok) return true;
        throw new Error(await response.text());
    }

    async get(key: string): Promise<PaymentData> {
        const response = await fetch(`${this._host}/${this._keyPrefix}${key}`, {
            method: 'HEAD',
        });

        const data: PaymentData = {};
        new URL(response.url).searchParams.forEach((v, k) => {
            data[k] = v;
        });
        return data;
    }
}

export class CloudflareKVStore extends Store {
    readonly name = "cloudflare-kv";
    private _kv: KVNamespace;
    private _keyPrefix: string;
    
    constructor(options: StoreOptions) {
        super();
        if (!options.kvNamespace) {
            throw new Error("kvNamespace is required for Cloudflare KV store");
        }
        if (typeof options.kvNamespace.get !== 'function') {
            throw new Error("kvNamespace must have a get() method - ensure KV binding is properly configured");
        }
        this._kv = options.kvNamespace;
        this._keyPrefix = options.keyPrefix || "payone:";
    }

    static create(options: StoreOptions): CloudflareKVStore {
        return new CloudflareKVStore(options);
    }

    private _getKey(key: string): string {
        return `${this._keyPrefix}${key}`;
    }

    async put(key: string, data: PaymentData): Promise<boolean> {
        if (!data || Object.keys(data).length === 0) {
            throw new Error("empty data object");
        }

        const fullKey = this._getKey(key);
        
        const existing = await this._kv.get(fullKey);
        if (existing !== null) {
            throw new Error("code already exists");
        }

        await this._kv.put(fullKey, JSON.stringify(data));
        return true;
    }

    async get(key: string): Promise<PaymentData> {
        const fullKey = this._getKey(key);
        const value = await this._kv.get(fullKey);
        
        if (value === null) {
            throw new Error("code not found");
        }

        return JSON.parse(value);
    }

    async delete(key: string): Promise<boolean> {
        const fullKey = this._getKey(key);
        await this._kv.delete(fullKey);
        return true;
    }

    async list(prefix = ""): Promise<string[]> {
        const fullPrefix = this._getKey(prefix);
        const result = await this._kv.list({ prefix: fullPrefix });
        return result.keys.map(k => k.name.replace(this._keyPrefix, ""));
    }

    async count(): Promise<number> {
        const result = await this._kv.list({ prefix: this._keyPrefix });
        return result.keys.length;
    }
}

export class IsGdStore extends Store {
    readonly name = "isgd";
    private _host: string;
    private _basicUrl: string;
    private _keyPrefix: string;
    
    constructor(options: StoreOptions = {}) {
        super();
        this._host = options.host || "https://v.gd";
        this._basicUrl = options.basicUrl || "https://payone.wencai.app/s";
        this._keyPrefix = options.keyPrefix || "payone_";
    }

    static create(options: StoreOptions = {}): IsGdStore {
        return new IsGdStore(options);
    }

    private _buildTargetUrl(data: PaymentData): string {
        const query = Object.keys(data)
            .map((i) => `${encodeURIComponent(i)}=${encodeURIComponent(data[i])}`)
            .join("&");
        return `${this._basicUrl}${this._basicUrl.indexOf("?") > 0 ? "&" : "?"}${query}`;
    }

    async put(key: string, data: PaymentData): Promise<boolean> {
        if (!data || Object.keys(data).length === 0) {
            throw new Error("empty data object");
        }

        const targetUrl = this._buildTargetUrl(data);
        const shortcode = `${this._keyPrefix}${key}`;

        const apiUrl = `${this._host}/create.php?format=json&url=${encodeURIComponent(targetUrl)}&shorturl=${encodeURIComponent(shortcode)}`;

        const response = await fetch(apiUrl);
        const result = await response.json() as { errorcode?: number; errormessage?: string };

        if (result.errorcode) {
            if (result.errorcode === 2) {
                throw new Error("code already exists or is reserved");
            }
            throw new Error(result.errormessage || "is.gd API error");
        }

        return true;
    }

    async get(key: string): Promise<PaymentData> {
        const shortcode = `${this._keyPrefix}${key}`;
        const shortUrl = `${this._host}/${shortcode}`;

        const response = await fetch(shortUrl, {
            method: 'HEAD',
            redirect: 'manual',
        });

        const location = response.headers.get('location');
        if (!location) {
            const followResponse = await fetch(shortUrl, {
                redirect: 'follow',
            });
            const finalUrl = followResponse.url;
            
            if (finalUrl === shortUrl || finalUrl.includes('is.gd')) {
                throw new Error("code not found");
            }

            const data: PaymentData = {};
            new URL(finalUrl).searchParams.forEach((v, k) => {
                data[k] = v;
            });
            return data;
        }

        const data: PaymentData = {};
        new URL(location).searchParams.forEach((v, k) => {
            data[k] = v;
        });
        return data;
    }
}

export class TinyURLStore extends Store {
    readonly name = "tinyurl";
    private _host: string;
    private _basicUrl: string;
    private _keyPrefix: string;
    private _apiToken?: string;
    
    constructor(options: StoreOptions = {}) {
        super();
        this._host = "https://tinyurl.com";
        this._basicUrl = options.basicUrl || "https://payone.wencai.app/s";
        this._keyPrefix = options.keyPrefix || "payone-";
        this._apiToken = options.apiToken;
    }

    static create(options: StoreOptions = {}): TinyURLStore {
        return new TinyURLStore(options);
    }

    private _buildTargetUrl(data: PaymentData): string {
        const query = Object.keys(data)
            .map((i) => `${encodeURIComponent(i)}=${encodeURIComponent(data[i])}`)
            .join("&");
        return `${this._basicUrl}${this._basicUrl.indexOf("?") > 0 ? "&" : "?"}${query}`;
    }

    async put(key: string, data: PaymentData): Promise<boolean> {
        if (!data || Object.keys(data).length === 0) {
            throw new Error("empty data object");
        }

        const targetUrl = this._buildTargetUrl(data);
        const alias = `${this._keyPrefix}${key}`;

        if (this._apiToken) {
            const response = await fetch("https://api.tinyurl.com/create", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this._apiToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: targetUrl,
                    alias: alias,
                }),
            });

            const result = await response.json() as { errors?: string[]; data?: { tiny_url?: string } };

            if (result.errors && result.errors.length > 0) {
                throw new Error(result.errors.join(", "));
            }

            if (!result.data || !result.data.tiny_url) {
                throw new Error("TinyURL API error");
            }

            return true;
        }

        const apiUrl = `${this._host}/api-create.php?url=${encodeURIComponent(targetUrl)}&alias=${encodeURIComponent(alias)}`;
        const response = await fetch(apiUrl);
        const text = await response.text();

        if (text.startsWith("Error")) {
            throw new Error(text);
        }

        return true;
    }

    async get(key: string): Promise<PaymentData> {
        const alias = `${this._keyPrefix}${key}`;
        const shortUrl = `${this._host}/${alias}`;

        const response = await fetch(shortUrl, {
            method: 'HEAD',
            redirect: 'manual',
        });

        const location = response.headers.get('location');
        if (!location) {
            const followResponse = await fetch(shortUrl, {
                redirect: 'follow',
            });
            const finalUrl = followResponse.url;
            
            if (finalUrl === shortUrl || finalUrl.includes('tinyurl.c')) {
                throw new Error("code not found");
            }

            const data: PaymentData = {};
            new URL(finalUrl).searchParams.forEach((v, k) => {
                data[k] = v;
            });
            return data;
        }

        const data: PaymentData = {};
        new URL(location).searchParams.forEach((v, k) => {
            data[k] = v;
        });
        return data;
    }
}

export type StoreType = 'cloudflare-kv' | 'tinyurl' | 'is.gd' | 'isgd' | 'git.io' | 'gitio';

interface StoreClass {
    create(options: StoreOptions): Store;
}

const storeRegistry: Record<StoreType, StoreClass> = {
    'cloudflare-kv': CloudflareKVStore,
    'tinyurl': TinyURLStore,
    'is.gd': IsGdStore,
    'isgd': IsGdStore,
    'git.io': GitioStore,
    'gitio': GitioStore,
};

export function createStore(type: StoreType, options: StoreOptions = {}): Store {
    const StoreConstructor = storeRegistry[type];
    if (!StoreConstructor) {
        throw new Error(`Unknown store type: ${type}`);
    }
    return StoreConstructor.create(options);
}
