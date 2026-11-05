import { useNavigate } from 'react-router-dom';

export default function ScannerNavbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 liquid-glass-strong border-b border-white/5">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="liquid-glass h-9 w-9 rounded-full flex items-center justify-center">
          <span className="font-heading italic text-lg text-white">E</span>
        </div>
        <span className="font-body font-medium text-white/90 text-sm">EcoSort AI</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="liquid-glass rounded-full px-3 py-1 text-xs font-body text-green-400">● Live</span>
        <button onClick={() => navigate('/')} className="font-body text-sm text-white/70 hover:text-white transition-colors px-3 py-1">← Back to Home</button>
      </div>
    </nav>
  );
}
