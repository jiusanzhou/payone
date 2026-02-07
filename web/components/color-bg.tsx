import { ReactNode } from 'react'

interface ColorBgProps {
    size?: string
    color?: string
    children?: ReactNode
}

const ColorBg = ({ size = '20rem', color = 'rgba(76, 0, 255, 1)', children }: ColorBgProps) => {
    return (
        <div className="flex relative place-content-center" style={{ minWidth: size, minHeight: size }}>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: size,
                    height: size,
                    filter: 'blur(80px)',
                    background: `radial-gradient(circle at 50% 50%, ${color}, #ffffff00)`,
                    opacity: '.7',
                }}
            />
            <div className="place-self-center">{children}</div>
        </div>
    )
}

export default ColorBg
