import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const ComingSoonPage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden text-white flex items-center justify-center px-4">
      {/* Glow Spotlights */}
      <div className="absolute top-0 left-[25%] w-80 h-80 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-blue-500/10 rounded-full blur-[120px] z-0"></div>

      {/* Content Card */}
      <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-md px-8 py-12 rounded-2xl max-w-xl text-center shadow-[0_0_25px_rgba(255,255,255,0.06)]">
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-300 to-pink-400 bg-clip-text text-transparent">
          Page Coming Soon
        </h1>
        <p className="text-gray-300 mb-8 text-lg">
          We're working hard to bring this section to life. Stay tuned for exciting updates and features.
        </p>

        <Button 
          as={Link}
          to="/"
          size="lg"
          variant="primary"
          className="mx-auto"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};

export default ComingSoonPage;
