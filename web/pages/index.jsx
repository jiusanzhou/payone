import Section from "../components/section";
import Link from "../components/link";
import settings from "../config/settings";
import ColorBg from "../components/color-bg";
import Hero from "../views/hero";

const Home = () => {
  return <div className="w-full flex flex-col items-center">
    <Section className=""
      title={<p className="text-center font-extrabold text-4xl">
          简单地 <br /> 生成
          <span className={`bg-clip-text text-transparent ${settings.gradient}`}>多合一</span>
          的收款码</p>}
      action={<Link href="/editor" className={`${settings.action} ${settings.gradient} text-white`}>立即生成 ✨</Link>}
      description="轻松生成收款码页面">
      {/* place hodler */}
      <Hero />
    </Section>
    <Section position="left" className=""
      title="简单易用"
      leading="⚡"
      description="多个平台收款码，轻轻松松使用合而为一">
      {/* <ColorBg /> */}
      <img src="/assets/img/hero-translate.svg" />
    </Section>
    <Section position="right" className=""
      title="多个平台"
      leading="🎉"
      description="支持支付宝、微信、QQ等多个收款平台">
      {/* <ColorBg color="blue" /> */}
      <img src="/assets/img/hero-boombox.svg" />
    </Section>
    <Section position="left" className=""
      title="定制文案"
      leading="🌈"
      description="设置二维码页面及其主体的文案">
      {/* <ColorBg color="red" /> */}
      <img src="/assets/img/hero-online-learing.svg" />
    </Section>
    <Section position="right" className=""
      title="完全免费"
      leading="💸"
      description="无需注册、登录，即可享有唯一收款码">
      {/* <ColorBg color="red" /> */}
      <img src="/assets/img/hero-ecology.svg" />
    </Section>
    <Section position="left" className=""
      title="云端托管"
      leading="☁️"
      description="无需开发和托管，立即享有自己的收款页面">
      {/* <ColorBg color="green" /> */}
      <img src="/assets/img/hero-bussinessman-keynote.svg" />
    </Section>
    <Section className=""
      title="立刻使用"
      action={<Link href="/editor" className={`${settings.action} ${settings.gradient} text-white`}>立即生成 ✨</Link>}
      description="马上就可拥有自己的收款落地页">
      <img src="/assets/img/hero-starup.svg" />
    </Section>
    <a className="text-gray-400 text-sm p-2" href="https://www.streamlinehq.com">Free illustrations by Streamline</a>
  </div>
}

export default Home;