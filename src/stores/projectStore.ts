import { create } from 'zustand';
import type { Project, ScreenSpec, ScreenLayout, KeyVisual, Slide } from '@/types';
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
  setActiveSlide: (id: string | null) => void;
  setEditorStep: (step: EditorStep) => void;
  resetProject: () => void;
}

export type EditorStep = 'screen' | 'layout' | 'keyvisual' | 'slides' | 'preview';

function createDefaultProject(): Project {
  return {
    id: crypto.randomUUID(),
    name: '새 프로젝트',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    screen: DEFAULT_SCREEN,
    layout: DEFAULT_LAYOUT,
    keyVisual: DEFAULT_KEY_VISUAL,
    slides: [],
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

  setActiveSlide: (id) => set({ activeSlideId: id }),

  setEditorStep: (step) => set({ editorStep: step }),

  resetProject: () =>
    set({
      project: createDefaultProject(),
      activeSlideId: null,
      editorStep: 'screen',
    }),
}));
