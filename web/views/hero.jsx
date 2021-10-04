import Logo from "../components/logo"

const Hero = () => {
    return <div className="flex justify-center items-end mt-20 rounded-3xl bg-black relative"
      style={{
        width: "48rem",
        background: '#011440',
        backgroundImage: 'radial-gradient(#ffffff33 1px, #011440 1px)',
        backgroundSize: '20px 20px',
      }}>
          <div className="w-3/4" style={{transform: 'perspective(600px) rotateX(20deg) translateY(-3px)'}}>
            <div className="h-96 flex justify-between">
              <div className="flex flex-col justify-around">
                <div className="bg-gray-200 w-10 h-10 rounded" />
                <div className="bg-gray-200 w-10 h-10 rounded" />
                <div className="bg-gray-200 w-10 h-10 rounded" />
              </div>
              <div className="flex flex-col justify-around">
                <div className="bg-purple-400 w-10 h-10 rounded">
                
                </div>
              </div>
            </div>
          </div>
      </div>
}

export default Hero