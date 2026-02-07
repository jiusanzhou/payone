import Link from 'next/link'
import { ReactNode, AnchorHTMLAttributes } from 'react'

interface MLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href?: string
    children?: ReactNode
}

const MLink = ({ href = '/', children, ...props }: MLinkProps) => {
    const isExternal = href.startsWith('http')
    return isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
        </a>
    ) : (
        <Link href={href} {...props}>
            {children}
        </Link>
    )
}

export default MLink
