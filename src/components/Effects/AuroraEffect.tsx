import type { AuroraConfig } from '@/types';

export function AuroraEffect({ config }: { config: AuroraConfig }) {
  const { colors, speed, intensity } = config;
  const dur = `${speed * 3}s`;

  return (
    <div
      className="aurora-container"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {colors.map((color, i) => (
        <div
          key={i}
          className="aurora-blob"
          style={{
            position: 'absolute',
            width: '60%',
            height: '120%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${color}${Math.round(intensity * 40).toString(16).padStart(2, '0')}, transparent 70%)`,
            left: `${(i / colors.length) * 60 + 10}%`,
            top: '-20%',
            filter: 'blur(60px)',
            animation: `aurora-drift-${i} ${dur} ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`
        ${colors
          .map(
            (_, i) => `
          @keyframes aurora-drift-${i} {
            0% { transform: translateX(${-20 + i * 10}%) translateY(0%) rotate(${i * 30}deg); }
            33% { transform: translateX(${10 - i * 5}%) translateY(${-10 + i * 5}%) rotate(${120 + i * 30}deg); }
            66% { transform: translateX(${-15 + i * 8}%) translateY(${5 - i * 3}%) rotate(${240 + i * 30}deg); }
            100% { transform: translateX(${20 - i * 10}%) translateY(${-5 + i * 2}%) rotate(${360 + i * 30}deg); }
          }
        `,
          )
          .join('\n')}
      `}</style>
    </div>
  );
}
