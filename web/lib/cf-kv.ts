/**
 * RestKVNamespace - 用 Cloudflare REST API 实现 KVNamespace 接口
 * 
 * 不依赖 worker binding，可在 Vercel Node.js runtime 直接使用。
 * 
 * Required env:
 *   CF_ACCOUNT_ID
 *   CF_API_TOKEN  (with Workers KV Storage:Edit permission)
 *   CF_KV_NAMESPACE_ID
 */

import type { KVNamespace } from './store'

const API_BASE = 'https://api.cloudflare.com/client/v4'

export interface RestKVConfig {
    accountId: string
    apiToken: string
    namespaceId: string
}

export class RestKVNamespace implements KVNamespace {
    private readonly baseUrl: string
    private readonly headers: Record<string, string>

    constructor(cfg: RestKVConfig) {
        if (!cfg.accountId || !cfg.apiToken || !cfg.namespaceId) {
            throw new Error('RestKVNamespace requires accountId, apiToken, and namespaceId')
        }
        this.baseUrl = `${API_BASE}/accounts/${cfg.accountId}/storage/kv/namespaces/${cfg.namespaceId}`
        this.headers = {
            Authorization: `Bearer ${cfg.apiToken}`,
        }
    }

    async get(key: string): Promise<string | null> {
        const res = await fetch(`${this.baseUrl}/values/${encodeURIComponent(key)}`, {
            headers: this.headers,
        })
        if (res.status === 404) return null
        if (!res.ok) {
            // CF returns 404 for missing keys, but also a 200 JSON error envelope sometimes
            const body = await res.text()
            try {
                const j = JSON.parse(body)
                if (j && j.errors?.[0]?.code === 10009) return null  // key not found
            } catch {}
            throw new Error(`KV get failed (${res.status}): ${body}`)
        }
        return await res.text()
    }

    async put(key: string, value: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/values/${encodeURIComponent(key)}`, {
            method: 'PUT',
            headers: { ...this.headers, 'Content-Type': 'text/plain' },
            body: value,
        })
        if (!res.ok) {
            const body = await res.text()
            throw new Error(`KV put failed (${res.status}): ${body}`)
        }
    }

    async delete(key: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/values/${encodeURIComponent(key)}`, {
            method: 'DELETE',
            headers: this.headers,
        })
        if (!res.ok && res.status !== 404) {
            const body = await res.text()
            throw new Error(`KV delete failed (${res.status}): ${body}`)
        }
    }

    async list(options: { prefix?: string } = {}): Promise<{ keys: { name: string }[] }> {
        const all: { name: string }[] = []
        let cursor = ''
        while (true) {
            const params = new URLSearchParams({ limit: '1000' })
            if (options.prefix) params.set('prefix', options.prefix)
            if (cursor) params.set('cursor', cursor)
            const res = await fetch(`${this.baseUrl}/keys?${params}`, { headers: this.headers })
            if (!res.ok) {
                const body = await res.text()
                throw new Error(`KV list failed (${res.status}): ${body}`)
            }
            const data = await res.json() as {
                result: { name: string }[]
                result_info?: { cursor?: string }
            }
            all.push(...data.result)
            cursor = data.result_info?.cursor || ''
            if (!cursor) break
        }
        return { keys: all }
    }
}

export function createRestKVFromEnv(): RestKVNamespace {
    return new RestKVNamespace({
        accountId: process.env.CF_ACCOUNT_ID || '',
        apiToken: process.env.CF_API_TOKEN || '',
        namespaceId: process.env.CF_KV_NAMESPACE_ID || '',
    })
}
