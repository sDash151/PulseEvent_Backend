import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = () => {
  console.log('🧱 Layout rendered')

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden">
      
      {/* Enhanced Ambient Glows with Better Positioning */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-amber-400/8 rounded-full blur-[140px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-500/6 rounded-full blur-[120px] -z-10 animate-pulse-slow animation-delay-1000" />
      <div className="absolute bottom-10 left-[10%] w-[350px] h-[350px] bg-blue-500/6 rounded-full blur-[110px] -z-10 animate-pulse-slow animation-delay-2000" />
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-purple-500/4 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute top-1/4 left-0 w-[250px] h-[250px] bg-emerald-500/4 rounded-full blur-[90px] -z-10 animate-pulse-slow animation-delay-1000" />

      {/* Fixed Header with Proper Z-index */}
      <Header />

      {/* Main Content with Proper Top Spacing to Avoid Header Overlap */}
      <main className="flex-grow z-10 pt-20 sm:pt-24 md:pt-28">
        {/* Universal Container for All Pages */}
        <div className="min-h-[calc(100vh-7rem)] sm:min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-9rem)]">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Layout
