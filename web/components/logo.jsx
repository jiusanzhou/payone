import settings from "../config/settings"

const Logo = ({
    link="/",
    img="/assets/img/payone-logo.svg",
    title="PayOne" }) => {
    return <a className="flex items-center" href={link}>
        <img className="w-8 h-8 rounded mr-2" src={img} />
        <strong className={`bg-clip-text text-transparent ${settings.gradient}`}>{title}</strong>
    </a>
}

export default Logo