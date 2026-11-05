import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FadingVideo from '../ui/FadingVideo';
import { ImageIcon, MovieIcon, LightbulbIcon, ArrowUpRight } from '../ui/Icons';

export default function CapabilitiesSection() {
  const navigate = useNavigate();

  const sectionVideo = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4';

  const cards = [
    {
      step: '01',
      title: 'Upload',
      icon: <ImageIcon size={28} className="text-green-400" />,
      tags: ['Drag & Drop', 'Camera Capture', 'Browse Files', 'JPG/PNG/WEBP'],
      body: 'Upload any waste image from your device or capture it live using your camera. Supports drag & drop and multiple image formats.',
      glowColor: 'rgba(34,197,94,0.15)',
    },
    {
      step: '02',
      title: 'Analyse',
      icon: <MovieIcon size={28} className="text-emerald-400" />,
      tags: ['MobileNetV3', 'ExecuTorch', 'Raspberry Pi', 'Edge AI'],
      body: 'Your image is sent to a MobileNetV3 model running locally on Raspberry Pi via ExecuTorch. No cloud. No internet required. Real inference.',
      glowColor: 'rgba(16,185,129,0.15)',
    },
    {
      step: '03',
      title: 'Discover',
      icon: <LightbulbIcon size={28} className="text-teal-400" />,
      tags: ['Biodegradable', 'Recyclable', 'Non-recyclable', 'Guidance'],
      body: 'Get instant classification with confidence scores, biodegradability info, and actionable recommendations for responsible disposal.',
      glowColor: 'rgba(20,184,166,0.15)',
    },
  ];

  const fadeBlur = {
    initial: { filter: 'blur(10px)', opacity: 0, y: 30 },
    whileInView: { filter: 'blur(0px)', opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.8, ease: 'easeOut' },
  };

  return (
    <section id="how-it-works" className="relative min-h-screen py-24 px-6 md:px-12 bg-black text-white overflow-hidden flex flex-col justify-center">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <FadingVideo
          src={sectionVideo}
          className="w-full h-full object-cover opacity-60"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.92) 80%, #000 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <motion.div {...fadeBlur} className="text-center md:text-left mb-16 max-w-2xl">
          <span className="font-body text-xs md:text-sm font-semibold tracking-widest text-green-400 uppercase mb-3 block">
            // How It Works
          </span>
          <h2 className="font-heading italic text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[0.95] whitespace-pre-line">
            Edge AI,{'\n'}end to end
          </h2>
          <p className="font-body text-white/60 text-base md:text-lg mt-4 max-w-xl">
            A frictionless pipeline built for speed, environmental sustainability, and local intelligence on the edge.
          </p>
        </motion.div>

        {/* Capability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ filter: 'blur(10px)', opacity: 0, y: 30 }}
              whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
              className="liquid-glass-strong rounded-3xl p-8 flex flex-col justify-between relative group hover:border-white/30 transition-all duration-300 border border-white/10"
              style={{
                boxShadow: `0 10px 40px -10px ${card.glowColor}`,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="liquid-glass h-14 w-14 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <span className="font-heading italic text-2xl text-white/30 font-light">
                    {card.step}
                  </span>
                </div>

                <h3 className="font-heading italic text-3xl text-white mb-3">
                  {card.title}
                </h3>

                <p className="font-body text-sm text-white/70 leading-relaxed mb-6 font-light">
                  {card.body}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                {card.tags.map(tag => (
                  <span
                    key={tag}
                    className="liquid-glass text-[11px] font-body text-white/70 px-2.5 py-1 rounded-full border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <motion.div
          {...fadeBlur}
          className="liquid-glass rounded-3xl p-8 md:p-12 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="font-heading italic text-3xl md:text-4xl text-white mb-2">
              Ready to classify your waste?
            </h3>
            <p className="font-body text-sm md:text-base text-white/60">
              Try the live scanner now. Real-time inference running on your local device.
            </p>
          </div>
          <button
            onClick={() => navigate('/scanner')}
            className="flex-shrink-0 rounded-full px-8 py-4 font-body font-medium text-black text-sm md:text-base flex items-center gap-2.5 shadow-[0_0_30px_rgba(34,197,94,0.35)] hover:shadow-[0_0_45px_rgba(34,197,94,0.5)] hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            <span>Launch AI Scanner</span>
            <ArrowUpRight size={18} className="text-black" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
