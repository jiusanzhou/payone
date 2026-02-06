import Link from 'next/link';

const mLink = ({ href="/", ...props }) => {
    const isExternal = href.startsWith('http')
    return isExternal ?
        <a href={href} target="_blank" rel="noopener noreferrer" {...props} /> :
        <Link href={href} {...props} />
}

export default mLink
