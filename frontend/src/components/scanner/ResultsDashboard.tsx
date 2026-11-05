import { motion } from 'framer-motion';
import type { PredictionResult } from '../../types';
import EnvironmentalWarning from './EnvironmentalWarning';
import RecyclingMascot from './RecyclingMascot';
import { LeafIcon, RecycleIcon, CheckIcon } from '../ui/Icons';

interface ResultsDashboardProps {
  result: PredictionResult;
  previewUrl: string | null;
  onReset: () => void;
}

function ClassificationConfig(classification: string) {
  switch (classification) {
    case 'Biodegradable':
      return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', label: 'BIODEGRADABLE', emoji: '🌱' };
    case 'Biodegradable + Recyclable':
      return { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)', label: 'BIODEGRADABLE · RECYCLABLE', emoji: '♻️' };
    case 'Non-biodegradable + Non-recyclable':
      return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'NON-BIODEGRADABLE · NON-RECYCLABLE', emoji: '⛔' };
    case 'Non-biodegradable + Recyclable':
      return { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', label: 'NON-BIODEGRADABLE · RECYCLABLE', emoji: '♻️' };
case 'Conditional':
  return {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    label: 'CONDITIONAL',
    emoji: '⚖️'
  };    
case 'Unable to Classify':
      return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: 'LOW CONFIDENCE – REVIEW NEEDED', emoji: '🔎' };
    case 'No Waste Detected':
      return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', label: 'NO WASTE DETECTED', emoji: '❓' };
    default:
      return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', label: classification.toUpperCase(), emoji: '❓' };
  }
}

export default function ResultsDashboard({ result, previewUrl, onReset }: ResultsDashboardProps) {
  const cfg = ClassificationConfig(result.classification);
  const isNoWaste = result.classification === 'No Waste Detected';
  const isUnable = result.classification === 'Unable to Classify';
  const isLowConfidence = result.confidence < 0.30 && !isNoWaste && !isUnable;

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Dev mode banner */}
      {result.dev_mode && (
        <motion.div {...fadeUp} className="rounded-2xl px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-body font-medium text-orange-400 text-sm">Development Mode – Raspberry Pi Not Connected</p>
            <p className="font-body text-xs text-orange-400/70">Results are from local MobileNetV3 model. Connect your Raspberry Pi for ExecuTorch inference.</p>
          </div>
        </motion.div>
      )}

      {/* Low confidence banner — shown when confidence is low but category IS identified */}
      {isLowConfidence && !isUnable && (
        <motion.div {...fadeUp} className="rounded-2xl px-5 py-3 flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <span className="text-lg">📊</span>
          <p className="font-body text-xs text-amber-400/80">
            <strong className="text-amber-400">Low confidence ({Math.round(result.confidence * 100)}%)</strong> — The model detected this material but with limited certainty. Upload a clearer, well-lit image for a more confident result.
          </p>
        </motion.div>
      )}

      {/* Main classification card */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-3xl overflow-hidden" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Image */}
            {previewUrl && (
              <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ width: '160px', height: '160px' }}>
                <img src={previewUrl} alt="Analysed waste" className="w-full h-full object-cover" />
              </div>
            )}
            {/* Classification info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{cfg.emoji}</span>
                <span className="font-body text-xs font-medium uppercase tracking-widest" style={{ color: cfg.color }}>Classification Result</span>
              </div>
              <h2 className="font-heading italic text-3xl md:text-4xl text-white mb-1" style={{ color: cfg.color }}>{cfg.label}</h2>
              <p className="font-body text-sm text-white/60 mb-4">{result.detected_material}</p>

              {/* Badges */}
              
{/* Badges */}
<div className="flex flex-wrap gap-3">
  <div
    className="rounded-full px-4 py-1.5 flex items-center gap-2"
    style={{
      background:
        result.biodegradable === 'biodegradable'
          ? 'rgba(34,197,94,0.15)'
          : result.biodegradable === 'conditional'
          ? 'rgba(245,158,11,0.15)'
          : 'rgba(239,68,68,0.15)',
      border: `1px solid ${
        result.biodegradable === 'biodegradable'
          ? 'rgba(34,197,94,0.3)'
          : result.biodegradable === 'conditional'
          ? 'rgba(245,158,11,0.3)'
          : 'rgba(239,68,68,0.3)'
      }`,
    }}
  >
    <LeafIcon
      size={14}
      className={
        result.biodegradable === 'biodegradable'
          ? 'text-green-400'
          : result.biodegradable === 'conditional'
          ? 'text-yellow-400'
          : 'text-red-400'
      }
    />
    <span
      className="font-body text-xs font-medium"
      style={{
        color:
          result.biodegradable === 'biodegradable'
            ? '#4ade80'
            : result.biodegradable === 'conditional'
            ? '#facc15'
            : '#f87171',
      }}
    >
      Biodegradable: {
        result.biodegradable === 'biodegradable'
          ? 'YES'
          : result.biodegradable === 'non-biodegradable'
          ? 'NO'
          : 'CONDITIONAL'
      }
    </span>
  </div>

  <div
    className="rounded-full px-4 py-1.5 flex items-center gap-2"
    style={{
      background:
        result.recyclable === 'yes'
          ? 'rgba(59,130,246,0.15)'
          : result.recyclable === 'conditional'
          ? 'rgba(245,158,11,0.15)'
          : 'rgba(239,68,68,0.15)',
      border: `1px solid ${
        result.recyclable === 'yes'
          ? 'rgba(59,130,246,0.3)'
          : result.recyclable === 'conditional'
          ? 'rgba(245,158,11,0.3)'
          : 'rgba(239,68,68,0.3)'
      }`,
    }}
  >
    <RecycleIcon
      size={14}
      className={
        result.recyclable === 'yes'
          ? 'text-blue-400'
          : result.recyclable === 'conditional'
          ? 'text-yellow-400'
          : 'text-red-400'
      }
    />
    <span
      className="font-body text-xs font-medium"
      style={{
        color:
          result.recyclable === 'yes'
            ? '#60a5fa'
            : result.recyclable === 'conditional'
            ? '#facc15'
            : '#f87171',
      }}
    >
      Recyclable: {
        result.recyclable === 'yes'
          ? 'YES'
          : result.recyclable === 'no'
          ? 'NO'
          : 'CONDITIONAL'
      }
    </span>
  </div>
</div>
</div>


            {/* Confidence & timing */}
            <div className="flex flex-row md:flex-col gap-4 md:gap-3 flex-shrink-0">
              <div className="liquid-glass rounded-2xl p-4 text-center min-w-[100px]">
                <div className="font-heading italic text-3xl" style={{ color: cfg.color }}>{Math.round(result.confidence * 100)}%</div>
                <div className="font-body text-xs text-white/50 mt-1">Confidence</div>
              </div>
              <div className="liquid-glass rounded-2xl p-4 text-center min-w-[100px]">
                <div className="font-heading italic text-2xl text-white">{result.inference_time_ms}ms</div>
                <div className="font-body text-xs text-white/50 mt-1">Inference Time</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Model info */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="liquid-glass rounded-2xl px-5 py-3 flex items-center justify-between">
        <span className="font-body text-xs text-white/40">Model: {result.model}</span>
        <span className="font-body text-xs text-white/40">Device: {result.device}</span>
      </motion.div>

      {/* No waste detected */}
      {isNoWaste ? (
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="liquid-glass rounded-3xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <RecyclingMascot size={110} />
          </div>
          <h3 className="font-heading italic text-2xl text-white mb-3">No Waste Detected</h3>
          <p className="font-body text-sm text-white/60 max-w-md mx-auto mb-6">We could not identify any relevant waste material in this image. Please upload or capture a clear image of a waste item.</p>
          <button onClick={onReset} className="rounded-full px-6 py-3 font-body font-medium text-sm text-black cursor-pointer hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>Try Again</button>
        </motion.div>
      ) : isUnable ? (
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="rounded-3xl p-8 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div className="flex justify-center mb-4">
            <RecyclingMascot size={100} />
          </div>
          <h3 className="font-heading italic text-2xl text-white mb-3">Image Not Clear Enough</h3>
          <p className="font-body text-sm text-white/60 max-w-md mx-auto mb-4">{result.reason}</p>
          <ul className="text-left space-y-2 max-w-sm mx-auto mb-6">
            {result.recommendations?.map((r, i) => (
              <li key={i} className="font-body text-xs text-amber-400/80 flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">•</span>{r}
              </li>
            ))}
          </ul>
          <button onClick={onReset} className="rounded-full px-6 py-3 font-body font-medium text-sm text-black cursor-pointer hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Try Again with Better Image</button>
        </motion.div>
      ) : (
        <>
          {/* Why this classification */}
          {result.reason && (
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="liquid-glass rounded-3xl p-6 md:p-8">
              <h3 className="font-heading italic text-xl text-white mb-4">Why This Classification?</h3>
              <p className="font-body text-sm text-white/70 leading-relaxed">{result.reason}</p>
            </motion.div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="rounded-3xl p-6 md:p-8" style={{ background: `${cfg.bg}`, border: `1px solid ${cfg.border}` }}>
              <h3 className="font-heading italic text-xl text-white mb-4">Recommended Action</h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cfg.color }}>
                      <CheckIcon size={12} className="text-black" />
                    </div>
                    <span className="font-body text-sm text-white/80 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Environmental impact */}
          {result.environmental_impact?.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="rounded-3xl p-6 md:p-8" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <h3 className="font-heading italic text-xl text-white mb-4">Environmental Impact</h3>
              <ul className="space-y-3">
                {result.environmental_impact.map((impact, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">⚠</span>
                    <span className="font-body text-sm text-white/70 leading-relaxed">{impact}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Composting guide */}
          {result.composting_guide && result.composting_guide.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.55 }} className="rounded-3xl p-6 md:p-8" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <h3 className="font-heading italic text-xl text-white mb-4">🌱 Composting Guide</h3>
              <ol className="space-y-3">
                {result.composting_guide.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-heading italic text-green-400 text-lg flex-shrink-0">{i + 1}.</span>
                    <span className="font-body text-sm text-white/70 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* Recycling guide */}
          {result.recycling_guide && result.recycling_guide.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.55 }} className="rounded-3xl p-6 md:p-8" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <h3 className="font-heading italic text-xl text-white mb-4">♻️ Recycling Guide</h3>
              <ol className="space-y-3">
                {result.recycling_guide.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-heading italic text-blue-400 text-lg flex-shrink-0">{i + 1}.</span>
                    <span className="font-body text-sm text-white/70 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* Disposal guide (if non-recyclable) */}
          {result.disposal_guide && result.disposal_guide.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.55 }} className="rounded-3xl p-6 md:p-8" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <h3 className="font-heading italic text-xl text-white mb-4">🗑️ Disposal Guide</h3>
              <ol className="space-y-3">
                {result.disposal_guide.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-heading italic text-red-400 text-lg flex-shrink-0">{i + 1}.</span>
                    <span className="font-body text-sm text-white/70 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* Environmental warning */}
          <motion.div {...fadeUp} transition={{ delay: 0.6 }}>
            <EnvironmentalWarning classification={result.classification} detectedMaterial={result.detected_material} />
          </motion.div>
        </>
      )}

      {/* Try Again */}
      <motion.div {...fadeUp} transition={{ delay: 0.7 }} className="text-center pb-8">
        <button
          onClick={onReset}
          className="liquid-glass-strong rounded-full px-8 py-3 font-body font-medium text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          ↩ Analyse Another Waste Item
        </button>
      </motion.div>
    </motion.div>
  );
}
