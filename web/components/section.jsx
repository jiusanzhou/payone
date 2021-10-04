import settings from "../config/settings";

const _positions = {
    center: {
        wrapper: "",
        text: "",
            titleContainer: "",
                leading: "",
                title: "",
            description: "",
        main: "justify-center mt-5 md:mt-10",
    },
    left: {
        wrapper: "md:flex-row md:justify-between",
        text: "md:text-left",
            titleContainer: "md:justify-start",
                leading: "",
                title: "",
            description: "",
        main: "justify-center md:justify-end mt-10 md:mt-0 md:ml-4",
    },
    right: {
        wrapper: "md:flex-row-reverse md:justify-between",
        text: "md:text-left",
            titleContainer: "md:justify-start",
                leading: "",
                title: "",
            description: "",
        main: "justify-center md:justify-start mt-10 md:mt-0 md:mr-4",
    },
}

const Section = ({
    full,
    title, leading, description, action,
    position="center", className,
    children }) => {
    const _p = _positions[position];
    return <div className={`${full?"w-full":settings.w} relative my-0 md:my-10 py-10 md:py-10 px-4 md:px-0 flex flex-col items-center text-center ${_p.wrapper} ${className}`}>
        {/* text */}
        <div className={`text-center ${_p.text}`}>
            {/* title */}
            <div className={`flex justify-center font-bold text-3xl ${_p.titleContainer}`}>
                {/* leading */}
                {leading&&<div className={`mr-2 ${_p.leading}`}>{leading}</div>}
                {/* title */}
                <h3 className={`${_p.title}`}>{title}</h3>
            </div>
            {/* description */}
            <div className={`mt-4 text-gray-500 ${_p.description}`}>{description}</div>
            {/* action */}
            {action&&<div className={`mt-4 ${_p.action}`}>{action}</div>}
        </div>
        {/* main */}
        <div className={`flex w-full ${_p.main}`}>
            {children}
        </div>
    </div>
}

export default Section