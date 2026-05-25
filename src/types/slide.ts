import type { ContentAnimationType } from './effects';

export type SlideTemplate =
  | 'title' | 'section-cover' | 'content' | 'two-column' | 'comparison'
  | 'metrics' | 'quote' | 'image-text' | 'cards' | 'timeline'
  | 'big-number' | 'stats' | 'video' | 'outro' | 'blank';

export const TEMPLATE_LABELS: Record<SlideTemplate, string> = {
  title: '타이틀',
  'section-cover': '섹션 커버',
  content: '콘텐츠',
  'two-column': '2단 레이아웃',
  comparison: '비교',
  metrics: '지표',
  quote: '인용',
  'image-text': '이미지+텍스트',
  cards: '카드 그리드',
  timeline: '타임라인/프로세스',
  'big-number': '빅 넘버',
  stats: '통계',
  video: '비디오',
  outro: '아웃트로',
  blank: '빈 슬라이드',
};

export const TEMPLATE_ICONS: Record<SlideTemplate, string> = {
  title: '▣', 'section-cover': '◫', content: '☰', 'two-column': '⫼',
  comparison: '⇔', metrics: '◔', quote: '❝', 'image-text': '◧',
  cards: '▦', timeline: '→', 'big-number': '#', stats: '▥',
  video: '▶', outro: '◎', blank: '☐',
};

export interface OverlayObject {
  id: string;
  type: 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  animation: string;
  animDelay: number;
  content: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor: string;
  borderRadius: number;
  opacity: number;
}

export interface Slide {
  id: string;
  order: number;
  label: string;
  template: SlideTemplate;
  data: Record<string, unknown>;
  overlays: OverlayObject[];
  transition: TransitionType;
  duration: number;
  entryAnimation: ContentAnimationType;
  backgroundColor: string;
  backgroundEffect: string;
}

export type TransitionType =
  | 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
  | 'zoom-in' | 'zoom-out' | 'dissolve' | 'cube' | 'flip-x' | 'flip-y'
  | 'morph' | 'glitch' | 'wipe-left' | 'wipe-right' | 'iris';

export type ContentType = 'text' | 'image' | 'video' | 'shape' | 'timer' | 'logo';

export interface SlideContent {
  id: string;
  type: ContentType;
  zoneId: string;
  x: number; y: number; width: number; height: number;
  props: Record<string, unknown>;
  style: React.CSSProperties;
}

export function getDefaultTemplateData(template: SlideTemplate): Record<string, unknown> {
  switch (template) {
    case 'title':
      return { tag: 'KEYNOTE', title: '발표 제목을 입력하세요', subtitle: '부제목 또는 발표자 정보' };
    case 'section-cover':
      return { number: '01', title: 'Section Title', subtitle: 'SECTION DESCRIPTION' };
    case 'content':
      return { tag: 'TOPIC', title: '슬라이드 제목', body: '본문 내용을 입력하세요. 핵심 메시지를 전달합니다.' };
    case 'two-column':
      return { tag: 'COMPARE', title: '두 가지 관점', leftTitle: '첫 번째', leftBody: '왼쪽 영역의 내용을 입력하세요.', rightTitle: '두 번째', rightBody: '오른쪽 영역의 내용을 입력하세요.' };
    case 'comparison':
      return { tag: 'VS', title: 'A/B 비교', leftLabel: 'OPTION A', leftContent: '옵션 A의 설명', leftMetricValue: '12%', leftMetricLabel: '전환율', rightLabel: 'OPTION B', rightContent: '옵션 B의 설명', rightMetricValue: '28%', rightMetricLabel: '전환율', winner: 'right' };
    case 'metrics':
      return { tag: 'RESULTS', title: '핵심 지표', metrics: [{ value: '320%', label: 'ROI 증가' }, { value: '1.2M', label: '신규 사용자' }, { value: '99.9%', label: '가동률' }] };
    case 'quote':
      return { tag: 'INSIGHT', quote: '인용할 문장을 입력하세요', attribution: '— 출처' };
    case 'image-text':
      return { tag: 'CASE STUDY', title: '사례 소개', body: '이미지와 함께 설명할 내용을 입력하세요.', imageUrl: '', imagePosition: 'left' };
    case 'cards':
      return { tag: 'OVERVIEW', title: '핵심 포인트', cards: [{ title: '포인트 1', body: '설명을 입력하세요', highlight: false }, { title: '포인트 2', body: '설명을 입력하세요', highlight: true }, { title: '포인트 3', body: '설명을 입력하세요', highlight: false }] };
    case 'timeline':
      return { tag: 'PROCESS', title: '프로세스 단계', steps: [{ stage: 'STEP 01', title: '리서치', detail: '타겟 고객 분석', metric: '2주', highlight: false }, { stage: 'STEP 02', title: '전략 수립', detail: '핵심 메시지 도출', metric: '1주', highlight: true }, { stage: 'STEP 03', title: '실행', detail: '캠페인 런칭', metric: '4주', highlight: false }, { stage: 'STEP 04', title: '성과 분석', detail: 'KPI 리뷰', metric: '1주', highlight: false }] };
    case 'big-number':
      return { tag: 'KEY INSIGHT', number: '320%', title: '핵심 숫자가 말하는 것', body: '이 숫자의 의미와 맥락을 설명합니다.' };
    case 'stats':
      return { tag: 'PERFORMANCE', title: '성과 분석', metrics: [{ value: '1,247', label: '총 리드' }, { value: '28.5%', label: '전환율' }, { value: '₩4.2M', label: '매출' }], body: '전년 대비 현저한 성장세를 보이고 있으며, 특히 전환율이 크게 개선되었습니다.' };
    case 'video':
      return { tag: 'DEMO', title: '데모 영상', videoUrl: '', body: '영상 URL을 입력하세요 (MP4)' };
    case 'outro':
      return { title: 'Thank You', subtitle: '질문이 있으시면 말씀해주세요', contactInfo: 'name@company.com', logoUrl: '' };
    case 'blank':
      return {};
  }
}

export function createSlide(template: SlideTemplate, order: number): Slide {
  return {
    id: crypto.randomUUID(),
    order,
    label: `슬라이드 ${order + 1}`,
    template,
    data: getDefaultTemplateData(template),
    overlays: [],
    transition: 'fade',
    duration: 5000,
    entryAnimation: 'fade-up',
    backgroundColor: '',
    backgroundEffect: '',
  };
}
