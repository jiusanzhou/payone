import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

interface ToastParams {
    message: string
    type: ToastType
    duration: number
}

let toastHandler: ((params: ToastParams) => void) | null = null

export function showToast(message: string, type: ToastType = 'success', duration: number = 2500): void {
    if (toastHandler) {
        toastHandler({ message, type, duration })
    }
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([])

    useEffect(() => {
        toastHandler = ({ message, type, duration }: ToastParams) => {
            const id = Date.now()
            setToasts((prev) => [...prev, { id, message, type }])
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            }, duration)
        }
        return () => {
            toastHandler = null
        }
    }, [])

    if (toasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(({ id, message, type }) => (
                <div
                    key={id}
                    className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm animate-fade-in ${
                        type === 'success'
                            ? 'bg-green-500'
                            : type === 'error'
                            ? 'bg-red-500'
                            : type === 'info'
                            ? 'bg-blue-500'
                            : 'bg-gray-700'
                    }`}
                >
                    {message}
                </div>
            ))}
        </div>
    )
}
