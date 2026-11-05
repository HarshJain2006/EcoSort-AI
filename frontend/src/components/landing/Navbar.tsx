import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from '../ui/Icons';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16">
      {/* Logo */}
      <div className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
        <span className="font-heading italic text-2xl text-white">E</span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-1">
        {['About', 'How It Works', 'Technology', 'Impact'].map(link => (
          <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">{link}</a>
        ))}
        <button
          onClick={() => navigate('/scanner')}
          className="liquid-glass-strong rounded-full px-4 py-2 text-sm font-medium text-white font-body flex items-center gap-1.5 hover:bg-white/10 transition-colors"
        >
          AI Scanner <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Spacer */}
      <div className="h-12 w-12" />
    </nav>
  );
}
