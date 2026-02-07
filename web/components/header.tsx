import { ReactNode } from 'react'
import settings from '../config/settings'
import Logo from './logo'
import Link from './link'

interface Action {
    className?: string
    title: string
    href: string
}

interface HeaderProps {
    actions?: Action[]
}

const Header = ({ actions = [] }: HeaderProps) => {
    return (
        <div className="w-full flex justify-center">
            <header className={`${settings.w} flex justify-between items-center h-16 px-2`}>
                <Logo />
                <div className="">
                    {actions.map(({ className, title, ...action }, idx) => (
                        <Link key={idx} {...action} className={`${settings.action} ${className} ml-2`}>
                            {title}
                        </Link>
                    ))}
                </div>
            </header>
        </div>
    )
}

export default Header
