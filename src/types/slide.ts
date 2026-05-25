export type ContentType = 'text' | 'image' | 'shape';

export interface TextProps {
  text: string;
  fontSize: number;
  fontWeight: number;
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

export interface ImageProps {
  src: string;
  objectFit: 'cover' | 'contain' | 'fill';
}

export interface ShapeProps {
  shapeType: 'rectangle' | 'circle' | 'line';
  fill: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
}

export type ContentProps = TextProps | ImageProps | ShapeProps;

export interface SlideContent {
  id: string;
  type: ContentType;
  zoneId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  props: ContentProps;
}

export interface Slide {
  id: string;
  order: number;
  label: string;
  contents: SlideContent[];
  transition: TransitionType;
  duration: number;
  backgroundColor?: string;
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
