import React, { useState, ChangeEvent } from 'react'
import Switcher from './switcher'

type InputType = 'switcher' | 'default'

interface RenderConfig {
    ele: React.ElementType
    valuetransformer?: (v: ChangeEvent<HTMLInputElement>) => string
    className?: string
}

const _renders: Record<string, RenderConfig> = {
    switcher: {
        ele: Switcher,
    },
    default: {
        ele: 'input',
        valuetransformer: (v: ChangeEvent<HTMLInputElement>) => v.target.value,
        className:
            'bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500',
    },
}

interface InputProps {
    onChange?: (value: unknown) => void
    disable?: boolean
    validator?: (value: unknown) => string | null
    info?: string
    className?: string
    alignRight?: boolean
    type?: InputType
    label?: string
    id?: string
    required?: boolean
    value?: unknown
    [key: string]: unknown
}

const Input = ({
    onChange,
    disable,
    validator,
    info,
    className,
    alignRight,
    type,
    label,
    id,
    required,
    ...props
}: InputProps) => {
    const r = _renders[type || 'default'] || _renders.default
    const [error, setError] = useState<string | null>(null)

    return (
        <div className={`md:flex md:items-center ${className}`}>
            {label && (
                <div className="md:w-1/3">
                    <label
                        className={`block text-gray-500 font-semibold text-left ${alignRight ? 'md:text-right' : ''} mb-1 md:mb-0 pr-4`}
                        htmlFor={id}
                    >
                        {label} {required && <span className="text-red-400">*</span>}
                    </label>
                </div>
            )}
            <div className={`${label ? 'md:w-2/3' : 'w-full'}`}>
            {React.createElement(r.ele, {
                ...r,
                ele: undefined,
                valuetransformer: undefined,
                id,
                ...props,
                disable,
                onBlur: () => {
                    if (validator) {
                        const x = validator(props.value)
                        setError(x)
                    }
                },
                onChange: (v: unknown) => {
                    setError(null)
                    if (!onChange) return
                    onChange(r.valuetransformer ? r.valuetransformer(v as ChangeEvent<HTMLInputElement>) : v)
                },
            } as Record<string, unknown>)}
                {(error || info) && <p className="mt-2 px-4 text-left text-red-400">{error || info}</p>}
            </div>
        </div>
    )
}

export default Input
