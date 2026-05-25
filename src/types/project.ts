import type { ScreenSpec, ScreenLayout } from './screen';
import type { Slide } from './slide';
import type { KeyVisual } from './keyvisual';

export type BackgroundEffect = 'starfield' | 'particles' | 'gradient-wave' | 'bokeh' | 'grid' | 'none';

export const BG_EFFECT_LABELS: Record<BackgroundEffect, string> = {
  starfield: '스타필드 (워프)',
  particles: '파티클 (부유)',
  'gradient-wave': '그라디언트 웨이브',
  bokeh: '보케 (빛 방울)',
  grid: '그리드 라인',
  none: '없음',
};

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  screen: ScreenSpec;
  layout: ScreenLayout;
  keyVisual: KeyVisual;
  slides: Slide[];
  backgroundEffect: BackgroundEffect;
}
