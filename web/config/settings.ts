interface Settings {
    w: string
    gradient: string
    action: string
    basePath: string
    GA_TRACKING_ID: string | undefined
}

const settings: Settings = {
    w: "w-full md:w-3/4 lg:w-3/5 max-w-screen-lg",
    gradient: "bg-gradient-to-r from-green-400 to-blue-500 from-purple-400 to-red-500",
    action: "rounded text-bold text-md px-5 py-2",
    basePath: "/",
    GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_ID,
}

export default settings
