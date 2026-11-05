import type { ClassificationLabel } from '../../types';

interface EnvironmentalWarningProps {
  classification: ClassificationLabel;
  detectedMaterial: string;
}

export default function EnvironmentalWarning({ classification, detectedMaterial }: EnvironmentalWarningProps) {
  const material = detectedMaterial.toLowerCase();
  const isPlastic = material.includes('plastic') || material.includes('bottle') || material.includes('bag') || material.includes('thermocol') || material.includes('styrofoam');
  const isBiodegradable = classification === 'Biodegradable' || classification === 'Biodegradable + Recyclable';
  const isRecyclable = classification === 'Non-biodegradable + Recyclable' || classification === 'Biodegradable + Recyclable';
  const isNonRecyclable = classification === 'Non-biodegradable + Non-recyclable';

  if (isBiodegradable) {
    return (
      <div className="rounded-3xl p-6" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🌍</span>
          <h3 className="font-heading italic text-lg text-green-400">Environmental Benefit</h3>
        </div>
        <p className="font-body text-sm text-white/70 leading-relaxed mb-3">Great news! This waste is biodegradable, meaning it will naturally decompose through the action of microorganisms. By composting it, you can convert it into nutrient-rich manure that improves soil health.</p>
        {isRecyclable && (
          <p className="font-body text-sm text-blue-400/80 mb-3">♻️ <strong className="text-blue-400">Recyclable too:</strong> This material can also be recycled. Prefer recycling over landfill to conserve fibres and reduce energy use.</p>
        )}
        <p className="font-body text-sm text-green-400/80">🌱 Tip: Combine with brown materials (dry leaves, cardboard) for the best compost quality. Keep it moist and aerated.</p>
      </div>
    );
  }

  if (isPlastic || isNonRecyclable) {
    return (
      <div className="rounded-3xl p-6" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-heading italic text-lg text-red-400">Environmental Caution</h3>
        </div>
        <div className="space-y-3 mb-5">
          {isPlastic && (
            <>
              <p className="font-body text-sm text-white/70 leading-relaxed">🐠 <strong className="text-white/90">Marine life harm:</strong> Plastic waste often ends up in rivers and oceans, where it breaks into microplastics that fish and marine animals ingest, contaminating the food chain.</p>
              <p className="font-body text-sm text-white/70 leading-relaxed">🔥 <strong className="text-white/90">Never burn plastic:</strong> Burning plastic releases toxic dioxins, furans, and carcinogenic chemicals into the air, causing serious respiratory harm.</p>
              <p className="font-body text-sm text-white/70 leading-relaxed">🌍 <strong className="text-white/90">Long-lasting pollution:</strong> Single-use plastics take 400–1000 years to decompose, persisting in soil and water for generations.</p>
            </>
          )}
          <p className="font-body text-sm text-white/70 leading-relaxed">🚯 <strong className="text-white/90">Avoid littering:</strong> Always use authorised waste collection. Improper disposal contaminates groundwater and soil.</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
          <p className="font-body text-sm font-medium text-green-400 mb-3">♻️ Recommended Alternatives:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[{ icon: '🫙', label: 'Steel Bottle' }, { icon: '🧴', label: 'Glass Container' }, { icon: '👜', label: 'Cloth Bag' }, { icon: '🍱', label: 'Reusable Box' }].map(alt => (
              <div key={alt.label} className="liquid-glass rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{alt.icon}</div>
                <div className="font-body text-xs text-white/70">{alt.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isRecyclable) {
    return (
      <div className="rounded-3xl p-6" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">♻️</span>
          <h3 className="font-heading italic text-lg text-blue-400">Recycling Matters</h3>
        </div>
        <p className="font-body text-sm text-white/70 leading-relaxed mb-3">Although this material does not biodegrade naturally, recycling it conserves raw materials, reduces energy consumption, and prevents it from entering landfills or oceans.</p>
        <p className="font-body text-sm text-blue-400/80">💡 Tip: Clean and dry the material before placing it in a recycling bin. Contaminated recyclables often end up in landfill.</p>
      </div>
    );
  }

  return null;
}
