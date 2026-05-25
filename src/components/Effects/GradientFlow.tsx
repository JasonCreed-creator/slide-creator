import type { GradientFlowConfig } from '@/types';

export function GradientFlow({ config }: { config: GradientFlowConfig }) {
  const { colors, speed, angle } = config;
  const colorStops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(', ');

  return (
    <div
      className="gradient-flow"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `linear-gradient(${angle}deg, ${colorStops})`,
        backgroundSize: '400% 400%',
        animation: `gradient-shift ${speed}s ease infinite`,
        opacity: 0.4,
      }}
    >
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
