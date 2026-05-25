import type { ScreenSpec, ScreenLayout, KeyVisual } from '@/types';

export const DEFAULT_SCREEN: ScreenSpec = {
  id: 'default-16x4',
  name: '기본 대형 스크린 (16m x 4m)',
  widthMm: 16000,
  heightMm: 4000,
  widthPx: 7680,
  heightPx: 1920,
  aspectRatio: '4:1',
};

export const SCREEN_PRESETS: ScreenSpec[] = [
  DEFAULT_SCREEN,
  {
    id: 'wide-12x3',
    name: '와이드 스크린 (12m x 3m)',
    widthMm: 12000,
    heightMm: 3000,
    widthPx: 5760,
    heightPx: 1440,
    aspectRatio: '4:1',
  },
  {
    id: 'ultra-16x3',
    name: '울트라 와이드 (16m x 3m)',
    widthMm: 16000,
    heightMm: 3000,
    widthPx: 7680,
    heightPx: 1440,
    aspectRatio: '16:3',
  },
  {
    id: 'tall-12x5',
    name: '톨 스크린 (12m x 5m)',
    widthMm: 12000,
    heightMm: 5000,
    widthPx: 5760,
    heightPx: 2400,
    aspectRatio: '12:5',
  },
  {
    id: 'standard-16x9',
    name: '표준 16:9 (일반 프로젝터)',
    widthMm: 4000,
    heightMm: 2250,
    widthPx: 1920,
    heightPx: 1080,
    aspectRatio: '16:9',
  },
];

export const DEFAULT_LAYOUT: ScreenLayout = {
  id: 'single',
  name: '단일 영역',
  zones: [
    {
      id: 'main',
      label: '메인',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
  ],
};

export const LAYOUT_PRESETS: ScreenLayout[] = [
  DEFAULT_LAYOUT,
  {
    id: 'two-column',
    name: '2분할 (좌/우)',
    zones: [
      { id: 'left', label: '좌측', x: 0, y: 0, width: 50, height: 100 },
      { id: 'right', label: '우측', x: 50, y: 0, width: 50, height: 100 },
    ],
  },
  {
    id: 'three-column',
    name: '3분할',
    zones: [
      { id: 'left', label: '좌측', x: 0, y: 0, width: 33.33, height: 100 },
      { id: 'center', label: '중앙', x: 33.33, y: 0, width: 33.34, height: 100 },
      { id: 'right', label: '우측', x: 66.67, y: 0, width: 33.33, height: 100 },
    ],
  },
  {
    id: 'center-focus',
    name: '중앙 집중',
    zones: [
      { id: 'left-wing', label: '좌측 날개', x: 0, y: 0, width: 20, height: 100 },
      { id: 'center', label: '중앙', x: 20, y: 0, width: 60, height: 100 },
      { id: 'right-wing', label: '우측 날개', x: 80, y: 0, width: 20, height: 100 },
    ],
  },
  {
    id: 'grid-2x2',
    name: '4분할 그리드',
    zones: [
      { id: 'top-left', label: '좌상', x: 0, y: 0, width: 50, height: 50 },
      { id: 'top-right', label: '우상', x: 50, y: 0, width: 50, height: 50 },
      { id: 'bottom-left', label: '좌하', x: 0, y: 50, width: 50, height: 50 },
      { id: 'bottom-right', label: '우하', x: 50, y: 50, width: 50, height: 50 },
    ],
  },
];

export const DEFAULT_KEY_VISUAL: KeyVisual = {
  id: 'default',
  name: '기본 테마',
  backgroundColor: '#0a0a1a',
  primaryColor: '#ffffff',
  secondaryColor: '#a0a0b0',
  accentColor: '#4f8cff',
  fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  backgroundEffect: { type: 'none' },
};

export const KEY_VISUAL_PRESETS: KeyVisual[] = [
  DEFAULT_KEY_VISUAL,
  {
    id: 'tech-blue',
    name: '테크 블루',
    backgroundColor: '#020c1b',
    gradientCss: 'linear-gradient(135deg, #020c1b 0%, #0a192f 50%, #112240 100%)',
    primaryColor: '#ccd6f6',
    secondaryColor: '#8892b0',
    accentColor: '#64ffda',
    fontFamily: "'Pretendard', monospace",
    backgroundEffect: {
      type: 'particles',
      particles: {
        count: 40,
        color: 'rgba(100, 255, 218, 0.3)',
        minSize: 1,
        maxSize: 2,
        speed: 0.3,
        connected: true,
        shape: 'circle',
      },
    },
  },
  {
    id: 'warm-corporate',
    name: '웜 코퍼레이트',
    backgroundColor: '#1a1a2e',
    gradientCss: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    primaryColor: '#eaeaea',
    secondaryColor: '#b0b0b0',
    accentColor: '#e94560',
    fontFamily: "'Pretendard', sans-serif",
    backgroundEffect: {
      type: 'gradient-flow',
      gradientFlow: {
        colors: ['#e94560', '#0f3460', '#16213e', '#e94560'],
        speed: 10,
        angle: 135,
      },
    },
  },
  {
    id: 'nature-green',
    name: '네이처 그린',
    backgroundColor: '#0b1a0b',
    gradientCss: 'linear-gradient(135deg, #0b1a0b 0%, #1a2f1a 50%, #2d4a2d 100%)',
    primaryColor: '#e8f5e9',
    secondaryColor: '#a5d6a7',
    accentColor: '#66bb6a',
    fontFamily: "'Pretendard', sans-serif",
    backgroundEffect: {
      type: 'aurora',
      aurora: {
        colors: ['#66bb6a', '#26a69a', '#00897b'],
        speed: 5,
        intensity: 0.5,
      },
    },
  },
  {
    id: 'cosmic-purple',
    name: '코스믹 퍼플',
    backgroundColor: '#0d0221',
    gradientCss: 'radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0d0221 50%, #070111 100%)',
    primaryColor: '#f0e6ff',
    secondaryColor: '#b794f4',
    accentColor: '#a855f7',
    fontFamily: "'Pretendard', sans-serif",
    backgroundEffect: {
      type: 'starfield',
      starfield: {
        density: 120,
        speed: 0.2,
        color: '#e9d5ff',
      },
    },
  },
  {
    id: 'neon-cyber',
    name: '네온 사이버',
    backgroundColor: '#0a0a0a',
    gradientCss: 'linear-gradient(180deg, #0a0a0a 0%, #0d0d1a 100%)',
    primaryColor: '#00ff88',
    secondaryColor: '#00ccff',
    accentColor: '#ff0080',
    fontFamily: "'Pretendard', monospace",
    backgroundEffect: {
      type: 'geometric',
      geometric: {
        shape: 'circuit',
        color: 'rgba(0, 255, 136, 0.08)',
        opacity: 0.6,
        size: 60,
      },
    },
  },
  {
    id: 'sunset-warm',
    name: '선셋 웜',
    backgroundColor: '#1a0a00',
    gradientCss: 'linear-gradient(135deg, #1a0a00 0%, #2d1400 30%, #3d1a00 60%, #1a0a00 100%)',
    primaryColor: '#fff3e0',
    secondaryColor: '#ffcc80',
    accentColor: '#ff6d00',
    fontFamily: "'Pretendard', sans-serif",
    backgroundEffect: {
      type: 'gradient-flow',
      gradientFlow: {
        colors: ['#ff6d00', '#ff9100', '#ffab00', '#ff6d00'],
        speed: 12,
        angle: 45,
      },
    },
  },
  {
    id: 'ocean-deep',
    name: '딥 오션',
    backgroundColor: '#001220',
    gradientCss: 'radial-gradient(ellipse at 50% 100%, #002040 0%, #001220 60%, #000810 100%)',
    primaryColor: '#e0f7fa',
    secondaryColor: '#80deea',
    accentColor: '#00bcd4',
    fontFamily: "'Pretendard', sans-serif",
    backgroundEffect: {
      type: 'aurora',
      aurora: {
        colors: ['#00bcd4', '#0097a7', '#006064'],
        speed: 6,
        intensity: 0.4,
      },
    },
  },
];
