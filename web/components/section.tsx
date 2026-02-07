import { ReactNode } from 'react'
import settings from '../config/settings'

type Position = 'center' | 'left' | 'right'

interface PositionStyles {
    wrapper: string
    text: string
    titleContainer: string
    leading: string
    title: string
    description: string
    main: string
    action?: string
}

const _positions: Record<Position, PositionStyles> = {
    center: {
        wrapper: '',
        text: '',
        titleContainer: '',
        leading: '',
        title: '',
        description: '',
        main: 'justify-center mt-5 md:mt-10',
    },
    left: {
        wrapper: 'md:flex-row md:justify-between',
        text: 'md:text-left',
        titleContainer: 'md:justify-start',
        leading: '',
        title: '',
        description: '',
        main: 'justify-center md:justify-end mt-10 md:mt-0 md:ml-4',
    },
    right: {
        wrapper: 'md:flex-row-reverse md:justify-between',
        text: 'md:text-left',
        titleContainer: 'md:justify-start',
        leading: '',
        title: '',
        description: '',
        main: 'justify-center md:justify-start mt-10 md:mt-0 md:mr-4',
    },
}

interface SectionProps {
    full?: boolean
    title?: ReactNode
    leading?: ReactNode
    description?: ReactNode
    action?: ReactNode
    position?: Position
    className?: string
    children?: ReactNode
    [key: string]: unknown
}

const Section = ({
    full,
    title,
    leading,
    description,
    action,
    position = 'center',
    className,
    children,
    ...props
}: SectionProps) => {
    const _p = _positions[position]
    return (
        <div
            {...props}
            className={`${full ? 'w-full' : settings.w} relative my-0 md:my-10 py-10 md:py-10 px-4 md:px-0 flex flex-col items-center text-center ${_p.wrapper} ${className}`}
        >
            <div className={`text-center ${_p.text}`}>
                <div className={`flex justify-center font-bold text-3xl ${_p.titleContainer}`}>
                    {leading && <div className={`mr-2 ${_p.leading}`}>{leading}</div>}
                    <h3 className={`${_p.title}`}>{title}</h3>
                </div>
                <div className={`mt-4 text-gray-500 ${_p.description}`}>{description}</div>
                {action && <div className={`mt-4 ${_p.action || ''}`}>{action}</div>}
            </div>
            <div className={`flex w-full ${_p.main}`}>{children}</div>
        </div>
    )
}

export default Section
