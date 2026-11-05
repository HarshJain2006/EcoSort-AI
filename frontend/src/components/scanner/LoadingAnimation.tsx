import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RecyclingMascot from './RecyclingMascot';

const STEPS = [
  { text: 'Analysing your image...', icon: '🔍' },
  { text: 'Identifying waste materials...', icon: '🧪' },
  { text: 'Checking biodegradability and recyclability...', icon: '♻️' },
  { text: 'Preparing environmental recommendations...', icon: '🌱' },
];

export default function LoadingAnimation() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(s => (s < STEPS.length - 1 ? s + 1 : s));
    }, 700);
    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + 1.2, 95));
    }, 50);
    return () => { clearInterval(stepInterval); clearInterval(progInterval); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl mx-auto text-center py-12"
    >
      {/* Mascot character instead of bare spinner */}
      <div className="relative mx-auto mb-8 flex flex-col items-center">
        {/* Spinning ring around mascot */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 rounded-full"
            style={{ border: '2px solid transparent', borderTopColor: '#22c55e', borderRightColor: '#22c55e' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-2 rounded-full"
            style={{ border: '1px solid transparent', borderTopColor: '#4ade80', borderLeftColor: '#4ade80' }}
          />
          <RecyclingMascot size={110} />
        </div>
      </div>

      {/* Step text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="font-heading italic text-xl text-white mb-2"
        >
          {STEPS[step].text}
        </motion.p>
      </AnimatePresence>
      <p className="font-body text-sm text-white/40 mb-8">Powered by ExecuTorch · Raspberry Pi Edge AI</p>

      {/* Steps list */}
      <div className="flex flex-col gap-2 text-left max-w-sm mx-auto mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= step ? 'opacity-100' : 'opacity-20'}`}>
            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${i < step ? 'bg-green-500' : i === step ? 'bg-green-500/50 animate-pulse' : 'bg-white/10'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`font-body text-sm ${i === step ? 'text-white' : i < step ? 'text-green-400' : 'text-white/40'}`}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)', width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <p className="font-body text-xs text-white/30 mt-2">{Math.round(progress)}% complete</p>
    </motion.div>
  );
}

