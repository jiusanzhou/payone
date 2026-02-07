import settings from '../config/settings'
import Link from './link'

interface FooterProps {
    powered?: boolean
    transparent?: boolean
}

const Footer = ({ powered = false, transparent = false }: FooterProps) => {
    const baseClass = transparent
        ? 'text-sm flex items-center justify-center w-full h-12 text-gray-400'
        : 'text-sm flex items-center justify-center w-full h-12 border-t'

    const linkClass = `font-bold ml-1 bg-clip-text text-transparent ${settings.gradient}`

    return (
        <footer className={baseClass}>
            {powered ? (
                <p className="flex items-center justify-center">
                    Powered by
                    <Link href="/" className={linkClass}>
                        PayOne
                    </Link>
                </p>
            ) : (
                <p className="flex items-center justify-center">
                    Made with
                    <span role="img" aria-label="love" className="text-xs mx-1">
                        ❤️
                    </span>
                    by
                    <Link href="https://zoe.im" className={linkClass}>
                        Zoe
                    </Link>
                </p>
            )}
        </footer>
    )
}

export default Footer
