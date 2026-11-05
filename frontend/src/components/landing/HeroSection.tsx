import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import FadingVideo from '../ui/FadingVideo';
import BlurText from '../ui/BlurText';
import { ArrowUpRight, Play, ClockIcon, GlobeIcon, LeafIcon } from '../ui/Icons';

export default function HeroSection() {
  const navigate = useNavigate();

  const heroVideo = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4';

  const fadeBlur = {
    initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-black text-white pt-24 pb-12 px-6 md:px-12">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <FadingVideo
          src={heroVideo}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 75%, #000 100%)',
          }}
        />
      </div>

      {/* Navbar rendered inside Hero */}
      <Navbar />

      {/* Main Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto my-auto py-12">
        {/* Badge */}
        <motion.div
          {...fadeBlur}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="liquid-glass rounded-full px-5 py-2 flex items-center gap-2.5 mb-8 border border-white/10"
        >
          <span className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
          <span className="font-body text-xs md:text-sm font-medium text-white/90 tracking-wide">
            Powered by ExecuTorch · Edge AI · Raspberry Pi
          </span>
        </motion.div>

        {/* Animated Staggered Headline */}
        <div className="mb-6 max-w-4xl">
          <BlurText
            text="Sort Smarter. Waste Less. Protect the Planet."
            className="font-heading italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[0.98]"
            delay={0.2}
          />
        </div>

        {/* Subtext */}
        <motion.p
          {...fadeBlur}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-body font-light text-base sm:text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-10"
        >
          Upload or capture an image of waste. Our edge AI running on Raspberry Pi
          instantly classifies it and shows you exactly how to dispose of it responsibly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...fadeBlur}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <button
            onClick={() => navigate('/scanner')}
            className="group relative rounded-full px-8 py-4 flex items-center gap-3 font-body font-medium text-black text-base shadow-[0_0_40px_rgba(34,197,94,0.35)] hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            <span>Start Scanning</span>
            <div className="bg-black/10 rounded-full p-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight size={18} className="text-black" />
            </div>
          </button>

          <a
            href="#how-it-works"
            className="liquid-glass-strong rounded-full px-7 py-4 flex items-center gap-2.5 font-body font-medium text-white/90 text-base hover:text-white hover:bg-white/10 transition-all border border-white/10"
          >
            <Play size={14} className="text-green-400" />
            <span>See How It Works</span>
          </a>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          {...fadeBlur}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl"
        >
          <div className="liquid-glass rounded-2xl p-5 border border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <ClockIcon size={18} />
              <span className="font-heading italic text-3xl md:text-4xl text-white">&lt; 3 Seconds</span>
            </div>
            <span className="font-body text-xs text-white/50 tracking-wide uppercase">AI Classification Speed</span>
          </div>

          <div className="liquid-glass rounded-2xl p-5 border border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <LeafIcon size={18} />
              <span className="font-heading italic text-3xl md:text-4xl text-white">4 Categories</span>
            </div>
            <span className="font-body text-xs text-white/50 tracking-wide uppercase">Waste Classification Types</span>
          </div>

          <div className="liquid-glass rounded-2xl p-5 border border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <GlobeIcon size={18} />
              <span className="font-heading italic text-3xl md:text-4xl text-white">100% Edge</span>
            </div>
            <span className="font-body text-xs text-white/50 tracking-wide uppercase">Raspberry Pi Inference</span>
          </div>
        </motion.div>
      </div>

      {/* Trust Bar at Bottom */}
      <motion.div
        {...fadeBlur}
        transition={{ duration: 0.8, delay: 0.85 }}
        className="relative z-10 w-full max-w-4xl mx-auto pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm font-body text-white/60"
      >
        <span className="text-white/40 uppercase tracking-widest text-xs">Categories:</span>
        <span className="flex items-center gap-1.5"><span className="text-green-400">●</span> Biodegradable</span>
        <span className="text-white/20">·</span>
        <span className="flex items-center gap-1.5"><span className="text-blue-400">●</span> Recyclable</span>
        <span className="text-white/20">·</span>
        <span className="flex items-center gap-1.5"><span className="text-red-400">●</span> Non-recyclable</span>
        <span className="text-white/20">·</span>
        <span className="flex items-center gap-1.5"><span className="text-gray-400">●</span> No Waste Detected</span>
      </motion.div>
    </section>
  );
}
