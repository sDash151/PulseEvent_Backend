import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = () => {
  console.log('🧱 Layout rendered')

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-10 left-[10%] w-[240px] h-[240px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <Header />

      <main className="flex-grow z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout
