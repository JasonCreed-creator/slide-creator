import type { GeometricConfig } from '@/types';

export function GeometricPattern({ config }: { config: GeometricConfig }) {
  const { shape, color, opacity, size } = config;

  if (shape === 'dots') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity,
          backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        }}
      />
    );
  }

  if (shape === 'grid') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity,
          backgroundImage: `
            linear-gradient(${color} 1px, transparent 1px),
            linear-gradient(90deg, ${color} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
        }}
      />
    );
  }

  if (shape === 'hexagon') {
    const svgHex = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 1.73}">
        <polygon points="${size},0 ${size * 2},${size * 0.433} ${size * 2},${size * 1.3} ${size},${size * 1.73} 0,${size * 1.3} 0,${size * 0.433}"
          fill="none" stroke="${color}" stroke-width="0.5"/>
      </svg>
    `;
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity,
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svgHex)}")`,
          backgroundSize: `${size * 2}px ${size * 1.73}px`,
        }}
      />
    );
  }

  // circuit pattern
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="circuit" x="0" y="0" width={size * 2} height={size * 2} patternUnits="userSpaceOnUse">
            <path
              d={`M 0 ${size} H ${size * 0.4} V ${size * 0.4} H ${size} V 0 M ${size} ${size * 2} V ${size * 1.2} H ${size * 1.6} V ${size * 0.8} H ${size * 2}`}
              fill="none"
              stroke={color}
              strokeWidth="0.5"
            />
            <circle cx={size * 0.4} cy={size * 0.4} r="2" fill={color} />
            <circle cx={size} cy={size * 1.2} r="2" fill={color} />
            <circle cx={size * 1.6} cy={size * 0.8} r="1.5" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  );
}
