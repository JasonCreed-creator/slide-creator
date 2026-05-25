export type BackgroundEffectType = 'none' | 'particles' | 'gradient-flow' | 'geometric' | 'aurora' | 'starfield';

export interface ParticleConfig {
  count: number;
  color: string;
  minSize: number;
  maxSize: number;
  speed: number;
  connected: boolean;
  shape: 'circle' | 'square' | 'triangle' | 'star';
}

export interface GradientFlowConfig {
  colors: string[];
  speed: number;
  angle: number;
}

export interface GeometricConfig {
  shape: 'grid' | 'dots' | 'hexagon' | 'circuit';
  color: string;
  opacity: number;
  size: number;
}

export interface AuroraConfig {
  colors: string[];
  speed: number;
  intensity: number;
}

export interface StarfieldConfig {
  density: number;
  speed: number;
  color: string;
}

export interface BackgroundEffect {
  type: BackgroundEffectType;
  particles?: ParticleConfig;
  gradientFlow?: GradientFlowConfig;
  geometric?: GeometricConfig;
  aurora?: AuroraConfig;
  starfield?: StarfieldConfig;
}

export type ContentAnimationType =
  | 'none'
  | 'fade-up'
  | 'fade-down'
  | 'scale-pop'
  | 'typewriter'
  | 'blur-in'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'bounce-in'
  | 'rotate-in'
  | 'glitch';

export const DEFAULT_BACKGROUND_EFFECT: BackgroundEffect = {
  type: 'none',
};

export const BACKGROUND_EFFECT_PRESETS: { label: string; value: BackgroundEffect }[] = [
  { label: '없음', value: { type: 'none' } },
  {
    label: '파티클',
    value: {
      type: 'particles',
      particles: {
        count: 50,
        color: 'rgba(255,255,255,0.3)',
        minSize: 1,
        maxSize: 3,
        speed: 0.5,
        connected: true,
        shape: 'circle',
      },
    },
  },
  {
    label: '그라디언트 흐름',
    value: {
      type: 'gradient-flow',
      gradientFlow: {
        colors: ['#4f8cff', '#a855f7', '#ec4899', '#4f8cff'],
        speed: 8,
        angle: 45,
      },
    },
  },
  {
    label: '기하학 패턴',
    value: {
      type: 'geometric',
      geometric: {
        shape: 'grid',
        color: 'rgba(255,255,255,0.05)',
        opacity: 0.5,
        size: 40,
      },
    },
  },
  {
    label: '오로라',
    value: {
      type: 'aurora',
      aurora: {
        colors: ['#4f8cff', '#a855f7', '#06b6d4'],
        speed: 4,
        intensity: 0.6,
      },
    },
  },
  {
    label: '별빛',
    value: {
      type: 'starfield',
      starfield: {
        density: 100,
        speed: 0.3,
        color: '#ffffff',
      },
    },
  },
];
