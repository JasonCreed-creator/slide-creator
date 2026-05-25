import type { BackgroundEffect } from '@/types';
import { ParticleCanvas } from './ParticleCanvas';
import { AuroraEffect } from './AuroraEffect';
import { StarfieldCanvas } from './StarfieldCanvas';
import { GeometricPattern } from './GeometricPattern';
import { GradientFlow } from './GradientFlow';

export function BackgroundRenderer({ effect }: { effect?: BackgroundEffect }) {
  if (!effect || effect.type === 'none') return null;

  switch (effect.type) {
    case 'particles':
      return effect.particles ? <ParticleCanvas config={effect.particles} /> : null;
    case 'aurora':
      return effect.aurora ? <AuroraEffect config={effect.aurora} /> : null;
    case 'starfield':
      return effect.starfield ? <StarfieldCanvas config={effect.starfield} /> : null;
    case 'geometric':
      return effect.geometric ? <GeometricPattern config={effect.geometric} /> : null;
    case 'gradient-flow':
      return effect.gradientFlow ? <GradientFlow config={effect.gradientFlow} /> : null;
    default:
      return null;
  }
}
