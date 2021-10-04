import settings from "../config/settings"


const getItem = (code) => {
    return fetch(`${settings.endpoint||''}/api/s/${code}?type=json`)
        .then((r) => r.json())
}

const createItem = (code, data) => {
    return fetch(`${settings.endpoint}/api/s/${code}`, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json'}
    })
    .then((r) => r.json())
}

export default {
    getItem,
    createItem,
}