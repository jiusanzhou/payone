declare global {
    var process: { env: Record<string, string | undefined> };
}

globalThis.process = globalThis.process || { env: {} };

export {};
