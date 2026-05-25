import { create } from 'zustand';
import type { Project, ScreenSpec, ScreenLayout, KeyVisual, Slide, OverlayObject } from '@/types';
import { getDefaultTemplateData } from '@/types';
import { DEFAULT_SCREEN, DEFAULT_LAYOUT, DEFAULT_KEY_VISUAL } from '@/presets/defaults';

interface ProjectState {
  project: Project;
  activeSlideId: string | null;
  editorStep: EditorStep;

  setScreen: (screen: ScreenSpec) => void;
  setLayout: (layout: ScreenLayout) => void;
  setKeyVisual: (kv: KeyVisual) => void;
  addSlide: (slide: Slide) => void;
  updateSlide: (id: string, patch: Partial<Slide>) => void;
  removeSlide: (id: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  duplicateSlide: (id: string) => void;
  addOverlay: (slideId: string, overlay: OverlayObject) => void;
  updateOverlay: (slideId: string, overlayId: string, patch: Partial<OverlayObject>) => void;
  removeOverlay: (slideId: string, overlayId: string) => void;
  setActiveSlide: (id: string | null) => void;
  setEditorStep: (step: EditorStep) => void;
  setProjectName: (name: string) => void;
  resetProject: () => void;
}

export type EditorStep = 'screen' | 'layout' | 'keyvisual' | 'slides' | 'preview';

function createDefaultProject(): Project {
  const firstSlide: Slide = {
    id: crypto.randomUUID(),
    order: 0,
    label: '슬라이드 1',
    template: 'title',
    templateData: getDefaultTemplateData('title'),
    overlays: [],
    transition: 'fade',
    contentAnimation: 'fade-up',
    duration: 5000,
    backgroundColor: '__theme__',
    backgroundEffect: { type: 'none' },
  };

  return {
    id: crypto.randomUUID(),
    name: '새 프로젝트',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    screen: DEFAULT_SCREEN,
    layout: DEFAULT_LAYOUT,
    keyVisual: DEFAULT_KEY_VISUAL,
    slides: [firstSlide],
  };
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: createDefaultProject(),
  activeSlideId: null,
  editorStep: 'screen',

  setScreen: (screen) =>
    set((state) => ({
      project: { ...state.project, screen, updatedAt: new Date().toISOString() },
    })),

  setLayout: (layout) =>
    set((state) => ({
      project: { ...state.project, layout, updatedAt: new Date().toISOString() },
    })),

  setKeyVisual: (kv) =>
    set((state) => ({
      project: { ...state.project, keyVisual: kv, updatedAt: new Date().toISOString() },
    })),

  addSlide: (slide) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: [...state.project.slides, slide],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateSlide: (id, patch) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: state.project.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeSlide: (id) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: state.project.slides.filter((s) => s.id !== id),
        updatedAt: new Date().toISOString(),
      },
      activeSlideId: state.activeSlideId === id ? null : state.activeSlideId,
    })),

  reorderSlides: (fromIndex, toIndex) =>
    set((state) => {
      const slides = [...state.project.slides];
      const [moved] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, moved);
      return {
        project: {
          ...state.project,
          slides: slides.map((s, i) => ({ ...s, order: i })),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  duplicateSlide: (id) =>
    set((state) => {
      const original = state.project.slides.find((s) => s.id === id);
      if (!original) return state;
      const newSlide: Slide = {
        ...original,
        id: crypto.randomUUID(),
        order: state.project.slides.length,
        label: `${original.label} (복사)`,
        templateData: { ...original.templateData },
        overlays: original.overlays.map((o) => ({ ...o, id: crypto.randomUUID() })),
      };
      return {
        project: {
          ...state.project,
          slides: [...state.project.slides, newSlide],
          updatedAt: new Date().toISOString(),
        },
        activeSlideId: newSlide.id,
      };
    }),

  addOverlay: (slideId, overlay) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: state.project.slides.map((s) =>
          s.id === slideId ? { ...s, overlays: [...s.overlays, overlay] } : s,
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  updateOverlay: (slideId, overlayId, patch) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: state.project.slides.map((s) =>
          s.id === slideId
            ? { ...s, overlays: s.overlays.map((o) => (o.id === overlayId ? { ...o, ...patch } : o)) }
            : s,
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeOverlay: (slideId, overlayId) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: state.project.slides.map((s) =>
          s.id === slideId
            ? { ...s, overlays: s.overlays.filter((o) => o.id !== overlayId) }
            : s,
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  setActiveSlide: (id) => set({ activeSlideId: id }),

  setEditorStep: (step) => set({ editorStep: step }),

  setProjectName: (name) =>
    set((state) => ({
      project: { ...state.project, name, updatedAt: new Date().toISOString() },
    })),

  resetProject: () =>
    set({
      project: createDefaultProject(),
      activeSlideId: null,
      editorStep: 'screen',
    }),
}));
