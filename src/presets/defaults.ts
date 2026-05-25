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
  },
  {
    id: 'orange-black',
    name: '오렌지 블랙',
    backgroundColor: '#0f0800',
    gradientCss: 'linear-gradient(135deg, #0f0800 0%, #1a0e00 50%, #261400 100%)',
    primaryColor: '#fff0e0',
    secondaryColor: '#c0a080',
    accentColor: '#ff6a00',
    fontFamily: "'Pretendard', sans-serif",
  },
  {
    id: 'midnight-purple',
    name: '미드나잇 퍼플',
    backgroundColor: '#0d0015',
    gradientCss: 'linear-gradient(135deg, #0d0015 0%, #1a0030 50%, #2d0050 100%)',
    primaryColor: '#e8d5ff',
    secondaryColor: '#a080c0',
    accentColor: '#b44aff',
    fontFamily: "'Pretendard', sans-serif",
  },
  {
    id: 'clean-white',
    name: '클린 화이트',
    backgroundColor: '#ffffff',
    gradientCss: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    primaryColor: '#1a1a1a',
    secondaryColor: '#666666',
    accentColor: '#2563eb',
    fontFamily: "'Pretendard', sans-serif",
  },
  {
    id: 'warm-cream',
    name: '웜 크림',
    backgroundColor: '#faf5ef',
    gradientCss: 'linear-gradient(135deg, #faf5ef 0%, #f0e8dc 100%)',
    primaryColor: '#2c1810',
    secondaryColor: '#7a5c47',
    accentColor: '#d4651a',
    fontFamily: "'Pretendard', sans-serif",
  },
  {
    id: 'light-blue',
    name: '라이트 블루',
    backgroundColor: '#f0f7ff',
    gradientCss: 'linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)',
    primaryColor: '#0f1b2d',
    secondaryColor: '#4a6480',
    accentColor: '#0066cc',
    fontFamily: "'Pretendard', sans-serif",
  },
  {
    id: 'corporate-gray',
    name: '코퍼레이트 그레이',
    backgroundColor: '#f2f2f2',
    gradientCss: 'linear-gradient(135deg, #f2f2f2 0%, #e6e6e6 100%)',
    primaryColor: '#1a1a1a',
    secondaryColor: '#555555',
    accentColor: '#0a8f5c',
    fontFamily: "'Pretendard', sans-serif",
  },
];
