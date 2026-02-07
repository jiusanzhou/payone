import settings from '../config/settings'

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void
        dataLayer: unknown[]
    }
}

export const pageview = (url: string): void => {
    if (!settings.GA_TRACKING_ID || !window.gtag) return
    window.gtag('config', settings.GA_TRACKING_ID, {
        page_path: url,
    })
}

interface EventParams {
    action: string
    category: string
    label: string
    value: number
}

export const event = ({ action, category, label, value }: EventParams): void => {
    if (!settings.GA_TRACKING_ID || !window.gtag) return
    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    })
}
