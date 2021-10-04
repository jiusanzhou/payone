import settings from "../config/settings";
import Link from "./link";

const Footer = ({ powered = false }) => {
  return <footer className="text-sm flex items-center justify-center w-full h-12 border-t">    
    {powered?<p className="flex items-center justify-center">Powered by
      <Link href="/" className={`font-bold ml-1 bg-clip-text text-transparent ${settings.gradient}`}>PayOne</Link>
    </p>
    :<p className="flex items-center justify-center">Made with
      <span role="image" aria-label="love" className="text-xs mx-1">❤️</span>
      by
      <Link href="https://zoe.im" className={`font-bold ml-1 bg-clip-text text-transparent ${settings.gradient}`}>Zoe</Link>
    </p>}
  </footer>
}

export default Footer