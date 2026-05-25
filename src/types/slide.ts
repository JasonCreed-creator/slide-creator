export type SlideTemplate =
  | 'title'
  | 'section-cover'
  | 'content'
  | 'two-column'
  | 'comparison'
  | 'metrics'
  | 'quote'
  | 'image-text'
  | 'cards'
  | 'timeline'
  | 'big-number'
  | 'stats'
  | 'video'
  | 'outro'
  | 'blank';

export type EntryAnimation = 'none' | 'fadeUp' | 'fadeIn' | 'scaleIn';

export type ElementAnimation = 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scaleIn' | 'bounceIn' | 'typewriter' | 'none';

export const ELEMENT_ANIM_LABELS: Record<ElementAnimation, string> = {
  fadeUp: '아래에서 위로',
  fadeIn: '페이드 인',
  fadeLeft: '왼쪽에서',
  fadeRight: '오른쪽에서',
  scaleIn: '스케일 인',
  bounceIn: '바운스',
  typewriter: '타이프라이터',
  none: '없음 (즉시)',
};

export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'dissolve';

export interface MetricItem {
  value: string;
  label: string;
}

export interface CardItem {
  title: string;
  body: string;
  highlight?: boolean;
}

export interface TimelineStep {
  stage: string;
  title: string;
  detail: string;
  metric?: string;
  highlight?: boolean;
}

export type ContinuousEffect = 'none' | 'float' | 'float-slow' | 'pulse' | 'glow' | 'shimmer' | 'rotate' | 'breathe';

export const CONTINUOUS_EFFECT_LABELS: Record<ContinuousEffect, string> = {
  none: '없음',
  float: '떠다니기',
  'float-slow': '느린 부유',
  pulse: '펄스',
  glow: '글로우',
  shimmer: '쉬머',
  rotate: '회전',
  breathe: '호흡',
};

export interface OverlayElement {
  id: string;
  type: 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  animation: ElementAnimation;
  animDelay: number;
  continuousEffect?: ContinuousEffect;
  content: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number;
}

export interface TemplateData {
  tag?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  number?: string;
  leftTitle?: string;
  leftBody?: string;
  rightTitle?: string;
  rightBody?: string;
  leftLabel?: string;
  leftContent?: string;
  leftMetricValue?: string;
  leftMetricLabel?: string;
  rightLabel?: string;
  rightContent?: string;
  rightMetricValue?: string;
  rightMetricLabel?: string;
  winner?: 'left' | 'right' | 'none';
  metrics?: MetricItem[];
  quote?: string;
  attribution?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  imageSplit?: number;
  cards?: CardItem[];
  steps?: TimelineStep[];
  videoUrl?: string;
  logoUrl?: string;
  contactInfo?: string;
  overlays?: OverlayElement[];
}

export interface Slide {
  id: string;
  order: number;
  label: string;
  template: SlideTemplate;
  data: TemplateData;
  transition: TransitionType;
  duration: number;
  backgroundColor?: string;
  backgroundEffect?: BackgroundEffectType;
  backgroundVideo?: string;
  entryAnimation: EntryAnimation;
}

export type BackgroundEffectType = 'starfield' | 'particles' | 'gradient-wave' | 'bokeh' | 'grid' | 'none';

export const BG_EFFECT_SLIDE_LABELS: Record<BackgroundEffectType, string> = {
  starfield: '스타필드',
  particles: '파티클',
  'gradient-wave': '웨이브',
  bokeh: '보케',
  grid: '그리드',
  none: '없음',
};

export const TEMPLATE_LABELS: Record<SlideTemplate, string> = {
  'title': '타이틀',
  'section-cover': '섹션 커버',
  'content': '콘텐츠',
  'two-column': '2단 레이아웃',
  'comparison': '비교',
  'metrics': '지표/숫자',
  'quote': '인용',
  'image-text': '이미지+텍스트',
  'cards': '카드 그리드',
  'timeline': '타임라인/프로세스',
  'big-number': '큰 숫자+텍스트',
  'stats': '통계 카드',
  'video': '비디오 임베드',
  'outro': '엔딩/감사',
  'blank': '자유 편집',
};
