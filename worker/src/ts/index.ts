import Server from "../../../web/lib/server";
import { CloudflareKVStore, IsGdStore, TinyURLStore, KVNamespace, PaymentData } from "../../../web/lib/store";
import { Router } from "cloudworker-router";
import { getProvider, getDefaultProvider } from "./screenshot";
import type { ScreenshotData, PaymentChannelData } from "./screenshot";
import channels from "../../../channels.json";

interface Env {
    PAYONE_KV?: KVNamespace;
    STORE_TYPE?: string;
    TINYURL_API_TOKEN?: string;
    SCREENSHOT_PROVIDER?: string;
}

let svr: Server | null = null;

function getServer(env: Env): Server {
    if (svr) return svr;
    
    svr = new Server({ basicUrl: 'https://payone.wencai.app/s/' });
    
    if (env && env.PAYONE_KV) {
        svr.setStore(new CloudflareKVStore(env.PAYONE_KV));
    } else if (env && env.STORE_TYPE === 'tinyurl') {
        svr.setStore(new TinyURLStore({ 
            basicUrl: 'https://payone.wencai.app/s',
            apiToken: env.TINYURL_API_TOKEN 
        }));
    } else if (env && env.STORE_TYPE === 'isgd') {
        svr.setStore(new IsGdStore({ basicUrl: 'https://payone.wencai.app/s' }));
    }
    
    return svr;
}

const router = new Router<Env>();

router.get("/api/s/:code", async (ctx) => {
    const server = getServer(ctx.env);
    const code = ctx.params.code as string;
    const ua = ctx.request.headers.get("user-agent") || "";
    const [channel, url, channels, err] = await server.getItem(code, ua);

    const urlObj = new URL(ctx.request.url);
    if (urlObj.searchParams.get("type") === "json") {
        if (err) {
            return new Response(JSON.stringify({ error: err }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        return new Response(JSON.stringify({ key: code, channel, url, channels }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    if (err) {
        return new Response(`[${svr?.store?.name || "unknown"}] system error: ${err}`, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }

    return new Response(null, {
        status: 302,
        headers: {
            'Location': url!,
            'Access-Control-Allow-Origin': '*'
        }
    });
});

router.post("/api/s/:code", async (ctx) => {
    const server = getServer(ctx.env);
    const data = await ctx.request.json() as PaymentData;
    const code = ctx.params.code as string;
    const [ok, err, backend] = await server.createItem(code, data);
    const r: { key: string; data: PaymentData; success: boolean; backend: string | null; error?: string | null } = { 
        key: code, 
        data, 
        success: ok, 
        backend 
    };
    if (!ok) r.error = err;
    
    return new Response(JSON.stringify(r), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
});

router.get('/api/supports', async (ctx) => {
    const server = getServer(ctx.env);
    return new Response(JSON.stringify(server.listSupported()), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
});

router.get('/api/stat', async (ctx) => {
    const server = getServer(ctx.env);
    const stat = await server.stat();
    return new Response(JSON.stringify(stat), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
});

router.options('/api/s/:code', async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
});

router.get('/api/screenshot/:code', async (ctx) => {
    const server = getServer(ctx.env);
    const code = ctx.params.code as string;
    const urlObj = new URL(ctx.request.url);

    const cleanCode = code.replace(/\.(png|jpg|jpeg|svg)$/, '').replace(/-banner$/, '');
    const isBanner = code.includes('-banner') || urlObj.searchParams.get('banner') === 'true';
    const width = parseInt(urlObj.searchParams.get('width') || (isBanner ? '1200' : '640'));
    const height = parseInt(urlObj.searchParams.get('height') || (isBanner ? '630' : '960'));
    const format = (urlObj.searchParams.get('format') || 'png') as 'png' | 'svg';

    const [, , channelsData, err] = await server.getItem(cleanCode, '');

    if (err) {
        return new Response(JSON.stringify({ error: err }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const activeChannels: PaymentChannelData[] = (channels as any[])
        .filter((c: any) => !c.disable)
        .map((c: any) => ({
            name: c.name,
            title: c.title,
            logo: `https://payone.wencai.app${c.logo}`,
            color: c.color,
            value: channelsData?.[c.name] || '',
        }));

    const screenshotData: ScreenshotData = {
        code: cleanCode,
        title: channelsData?._title,
        subtitle: channelsData?._subtitle,
        excerpt: channelsData?._excerpt,
        channels: activeChannels,
        pageUrl: `https://payone.wencai.app/s/${cleanCode}`,
        isBanner,
    };

    const providerName = ctx.env.SCREENSHOT_PROVIDER || 'satori';
    const provider = providerName === 'satori' ? getDefaultProvider() : getProvider(providerName);

    try {
        const result = await provider.render(screenshotData, { width, height, type: format });
        return new Response(result.data as ArrayBuffer, {
            status: 200,
            headers: {
                'Content-Type': result.contentType,
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
            }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
});

export default {
    async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
        return router.handle(request, env, context);
    }
};
