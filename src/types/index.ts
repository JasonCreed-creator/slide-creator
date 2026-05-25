export type { ScreenSpec, ScreenZone, ScreenLayout } from './screen';
export type {
  ContentType, SlideContent, Slide, TransitionType,
  SlideTemplate, OverlayObject, TemplateData,
  TitleTemplateData, ComparisonTemplateData, ContentTemplateData,
  QuoteTemplateData, StatsTemplateData, ImageFullTemplateData,
} from './slide';
export { TEMPLATE_LABELS, getDefaultTemplateData } from './slide';
export type { KeyVisual } from './keyvisual';
export type { Project } from './project';
export type {
  BackgroundEffect,
  BackgroundEffectType,
  ParticleConfig,
  GradientFlowConfig,
  GeometricConfig,
  AuroraConfig,
  StarfieldConfig,
  ContentAnimationType,
} from './effects';
export { DEFAULT_BACKGROUND_EFFECT, BACKGROUND_EFFECT_PRESETS } from './effects';
