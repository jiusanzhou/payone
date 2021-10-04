
const Switcher = ({ className, label, id, value, onChange, ...props }) => {
    return <label htmlFor={id} className={`w-min flex items-center cursor-pointer ${className}`}>
        <div className="relative">
            <input id={id} className="sr-only" type="checkbox" value={value}
                onChange={() => onChange(!value)} {...props} />
            <div className="block bg-gray-200 w-10 h-6 rounded-full"></div>
            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
        </div>
        {label && <div className="ml-3 text-gray-700 font-medium">{label}</div>}
    </label>
}

export default Switcher;