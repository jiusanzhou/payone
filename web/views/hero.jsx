

const Hero = () => {
    const img = "https://www.magicpattern.design/_next/image?url=%2Fstatic%2Fimages%2Feditor-preview.jpg&w=1080&q=75"
    return <div className="flex justify-center items-end mt-20 rounded-3xl bg-black relative"
      style={{
        width: "48rem",
        background: '#011440',
        backgroundImage: 'radial-gradient(#ffffff33 1px, #011440 1px)',
        backgroundSize: '20px 20px',
      }}>
          <div className="w-3/4" style={{transform: 'perspective(600px) rotateX(20deg) translateY(-3px)'}}>
            <img src={img} />
          </div>
      </div>
}

export default Hero