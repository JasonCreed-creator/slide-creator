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
  | 'blank';

export type EntryAnimation = 'none' | 'fadeUp' | 'fadeIn' | 'scaleIn';

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
  cards?: CardItem[];
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
  entryAnimation: EntryAnimation;
}

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
  'blank': '자유 편집',
};
