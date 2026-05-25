import type { BackgroundEffect, ContentAnimationType } from './effects';

export type SlideTemplate = 'title' | 'comparison' | 'content' | 'quote' | 'stats' | 'image-full' | 'blank';

export interface OverlayObject {
  id: string;
  type: 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: Record<string, string>;
}

export interface TitleTemplateData {
  tag: string;
  title: string;
  subtitle: string;
}

export interface ComparisonTemplateData {
  tag: string;
  title: string;
  aLabel: string;
  bLabel: string;
  aContent: string;
  bContent: string;
  aMetricValue: string;
  aMetricLabel: string;
  bMetricValue: string;
  bMetricLabel: string;
  winner: 'A' | 'B' | 'none';
}

export interface ContentTemplateData {
  tag: string;
  title: string;
  body: string;
}

export interface QuoteTemplateData {
  quote: string;
  author: string;
  source: string;
}

export interface StatsTemplateData {
  tag: string;
  title: string;
  items: { value: string; label: string }[];
}

export interface ImageFullTemplateData {
  tag: string;
  title: string;
  imageUrl: string;
  caption: string;
}

export type TemplateData =
  | TitleTemplateData
  | ComparisonTemplateData
  | ContentTemplateData
  | QuoteTemplateData
  | StatsTemplateData
  | ImageFullTemplateData
  | Record<string, never>;

export interface Slide {
  id: string;
  order: number;
  label: string;
  template: SlideTemplate;
  templateData: Record<string, unknown>;
  overlays: OverlayObject[];
  transition: TransitionType;
  contentAnimation: ContentAnimationType;
  duration: number;
  backgroundColor: string;
  backgroundEffect: BackgroundEffect;
}

export type ContentType = 'text' | 'image' | 'video' | 'shape' | 'timer' | 'logo';

export interface SlideContent {
  id: string;
  type: ContentType;
  zoneId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, unknown>;
  style: React.CSSProperties;
}

export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'dissolve'
  | 'cube'
  | 'flip-x'
  | 'flip-y'
  | 'morph'
  | 'glitch'
  | 'wipe-left'
  | 'wipe-right'
  | 'iris';

export const TEMPLATE_LABELS: Record<SlideTemplate, string> = {
  title: '타이틀',
  comparison: '비교',
  content: '콘텐츠',
  quote: '인용구',
  stats: '통계',
  'image-full': '이미지',
  blank: '빈 슬라이드',
};

export function getDefaultTemplateData(template: SlideTemplate): Record<string, unknown> {
  switch (template) {
    case 'title':
      return { tag: 'KEYNOTE', title: '발표 제목을 입력하세요', subtitle: '부제목 또는 발표자 정보' };
    case 'comparison':
      return {
        tag: 'VS', title: 'A/B 비교', aLabel: 'OPTION A', bLabel: 'OPTION B',
        aContent: '옵션 A의 설명', bContent: '옵션 B의 설명',
        aMetricValue: '12%', aMetricLabel: '전환율',
        bMetricValue: '28%', bMetricLabel: '전환율',
        winner: 'B',
      };
    case 'content':
      return { tag: '', title: '섹션 제목', body: '본문 내용을 입력하세요.\n\n**굵은 텍스트**로 강조할 수 있습니다.' };
    case 'quote':
      return { quote: '인용구를 입력하세요', author: '발화자', source: '' };
    case 'stats':
      return {
        tag: 'DATA', title: '핵심 지표',
        items: [
          { value: '99.9%', label: '가동률' },
          { value: '2.5M', label: '사용자' },
          { value: '150ms', label: '응답시간' },
        ],
      };
    case 'image-full':
      return { tag: '', title: '', imageUrl: '', caption: '' };
    case 'blank':
      return {};
  }
}
