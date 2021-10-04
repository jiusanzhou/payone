import React, { useState } from "react";
import Switcher from "./switcher";

const _renders = {
    switcher: {
        ele: Switcher,
    },
    default: {
        ele: 'input',
        valuetransformer: (v) => v.target.value,
        className: "bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
    }
}

const Input = ({ onChange, disable, validator, info, className, alignRight, type, label, id, required, ...props }) => {
    const r = _renders[type]||_renders.default;
    const [error, setError] = useState(null);
    return <div className={`md:flex md:items-center ${className}`}>
        {label&&<div className="md:w-1/3">
            <label className={`block text-gray-500 font-semibold text-left ${alignRight?'md:text-right':null} mb-1 md:mb-0 pr-4`} htmlFor={id}>
                {label} {required&&<span className="text-red-400">*</span>}
            </label>
        </div>}
        <div className={`${label?'md:w-2/3':'w-full'}`}>
            {React.createElement((_renders[type]||_renders.default).ele, {
                ...r, ele: null, valuetransformer: null,
                id, ...props, disable,
                onBlur: () => {
                    if (validator) {
                        const x = validator(props.value);
                        setError(x);
                    }
                },
                onChange: (v) => {
                    setError(null);
                    if (!onChange) return;
                    onChange(r.valuetransformer?r.valuetransformer(v):v)
                },
            })}
            {(error||info)&&<p className="mt-2 px-4 text-left text-red-400">{error||info}</p>}
        </div>
    </div>
}

export default Input