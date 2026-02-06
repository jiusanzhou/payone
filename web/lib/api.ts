import { PaymentData } from "./store";

export interface GetItemResponse {
    key?: string;
    channel?: string;
    url?: string;
    channels?: PaymentData;
    error?: string;
}

export interface CreateItemResponse {
    key: string;
    data: PaymentData;
    success: boolean;
    backend?: string;
    error?: string;
}

const getItem = (code: string): Promise<GetItemResponse> => {
    return fetch(`/api/s/${code}?type=json`)
        .then((r) => r.json() as Promise<GetItemResponse>);
};

const createItem = (code: string, data: PaymentData): Promise<CreateItemResponse> => {
    return fetch(`/api/s/${code}`, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then((r) => r.json() as Promise<CreateItemResponse>);
};

export default {
    getItem,
    createItem,
};
