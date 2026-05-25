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

export interface Slide {
  id: string;
  order: number;
  label: string;
  contents: SlideContent[];
  transition: TransitionType;
  duration: number;
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
  | 'dissolve';
