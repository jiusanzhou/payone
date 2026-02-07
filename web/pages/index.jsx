import Link from "../components/link";
import channels from "../../channels.json";

const Home = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            多合一
          </span>
          收款码
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-lg mx-auto">
          一个二维码，自动识别支付宝、微信、QQ，<br className="hidden md:block" />
          无需注册，免费使用
        </p>
        <Link
          href="/editor"
          className="inline-block px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90 transition-opacity"
        >
          立即创建
        </Link>
      </div>

      <div className="flex justify-center gap-8 mb-16">
        {channels.filter(c => !c.disable).map(({ name, logo, title, color }) => (
          <div key={name} className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
              style={{ backgroundColor: `${color}15` }}
            >
              <img src={logo} alt={title} className="w-10 h-10" />
            </div>
            <span className="text-sm text-gray-500">{title}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full mb-16">
        <Feature icon="⚡" title="即时生成" desc="粘贴二维码，一键生成专属链接" />
        <Feature icon="☁️" title="云端托管" desc="无需服务器，永久免费托管" />
        <Feature icon="📱" title="自动识别" desc="扫码自动跳转对应支付App" />
      </div>

      <div className="text-center">
        <p className="text-gray-400 mb-4">看看效果</p>
        <Link
          href="/s/zoe"
          className="text-purple-500 hover:text-purple-600 font-medium"
        >
          /s/zoe →
        </Link>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, desc }) => (
  <div className="text-center p-6">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </div>
);

export default Home;
