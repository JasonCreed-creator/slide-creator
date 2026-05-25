import { create } from 'zustand';
import type { Project, ScreenSpec, ScreenLayout, KeyVisual, Slide, OverlayObject } from '@/types';
import { createSlide } from '@/types';
import type { SlideTemplate } from '@/types';
import { DEFAULT_SCREEN, DEFAULT_LAYOUT, DEFAULT_KEY_VISUAL } from '@/presets/defaults';

export type EditorStep = 'screen' | 'layout' | 'keyvisual' | 'slides' | 'preview';

const STORAGE_KEY = 'slide-creator-projects';

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

function loadSavedIndex(): { id: string; name: string; updatedAt: string }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + '-index');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveIndex(index: { id: string; name: string; updatedAt: string }[]) {
  localStorage.setItem(STORAGE_KEY + '-index', JSON.stringify(index));
}

interface ProjectState {
  project: Project;
  activeSlideId: string | null;
  editorStep: EditorStep;
  savedProjects: { id: string; name: string; updatedAt: string }[];
  backgroundEffect: string;

  setScreen: (screen: ScreenSpec) => void;
  setLayout: (layout: ScreenLayout) => void;
  setKeyVisual: (kv: KeyVisual) => void;
  setProjectName: (name: string) => void;
  setBackgroundEffect: (effect: string) => void;

  addSlideFromTemplate: (template: SlideTemplate) => void;
  addSlide: (slide: Slide) => void;
  updateSlide: (id: string, patch: Partial<Slide>) => void;
  updateSlideData: (id: string, data: Record<string, unknown>) => void;
  removeSlide: (id: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  duplicateSlide: (id: string) => void;

  addOverlay: (slideId: string, overlay: OverlayObject) => void;
  updateOverlay: (slideId: string, overlayId: string, patch: Partial<OverlayObject>) => void;
  removeOverlay: (slideId: string, overlayId: string) => void;

  setActiveSlide: (id: string | null) => void;
  setEditorStep: (step: EditorStep) => void;

  saveProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  newProject: () => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: createDefaultProject(),
  activeSlideId: null,
  editorStep: 'screen',
  savedProjects: loadSavedIndex(),
  backgroundEffect: 'starfield',

  setScreen: (screen) =>
    set((s) => ({ project: { ...s.project, screen, updatedAt: new Date().toISOString() } })),

  setLayout: (layout) =>
    set((s) => ({ project: { ...s.project, layout, updatedAt: new Date().toISOString() } })),

  setKeyVisual: (kv) =>
    set((s) => ({ project: { ...s.project, keyVisual: kv, updatedAt: new Date().toISOString() } })),

  setProjectName: (name) =>
    set((s) => ({ project: { ...s.project, name, updatedAt: new Date().toISOString() } })),

  setBackgroundEffect: (effect) => set({ backgroundEffect: effect }),

  addSlideFromTemplate: (template) =>
    set((s) => {
      const slide = createSlide(template, s.project.slides.length);
      return {
        project: { ...s.project, slides: [...s.project.slides, slide], updatedAt: new Date().toISOString() },
        activeSlideId: slide.id,
      };
    }),

  addSlide: (slide) =>
    set((s) => ({
      project: { ...s.project, slides: [...s.project.slides, slide], updatedAt: new Date().toISOString() },
    })),

  updateSlide: (id, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) => (sl.id === id ? { ...sl, ...patch } : sl)),
        updatedAt: new Date().toISOString(),
      },
    })),

  updateSlideData: (id, data) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) => (sl.id === id ? { ...sl, data } : sl)),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeSlide: (id) =>
    set((s) => ({
      project: { ...s.project, slides: s.project.slides.filter((sl) => sl.id !== id), updatedAt: new Date().toISOString() },
      activeSlideId: s.activeSlideId === id ? null : s.activeSlideId,
    })),

  reorderSlides: (from, to) =>
    set((s) => {
      const slides = [...s.project.slides];
      const [moved] = slides.splice(from, 1);
      slides.splice(to, 0, moved);
      return { project: { ...s.project, slides: slides.map((sl, i) => ({ ...sl, order: i })), updatedAt: new Date().toISOString() } };
    }),

  duplicateSlide: (id) =>
    set((s) => {
      const orig = s.project.slides.find((sl) => sl.id === id);
      if (!orig) return s;
      const dup: Slide = {
        ...orig, id: crypto.randomUUID(), order: s.project.slides.length,
        label: `${orig.label} (복사)`, data: { ...orig.data },
        overlays: orig.overlays.map((o) => ({ ...o, id: crypto.randomUUID() })),
      };
      return {
        project: { ...s.project, slides: [...s.project.slides, dup], updatedAt: new Date().toISOString() },
        activeSlideId: dup.id,
      };
    }),

  addOverlay: (slideId, overlay) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId ? { ...sl, overlays: [...sl.overlays, overlay] } : sl,
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  updateOverlay: (slideId, overlayId, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? { ...sl, overlays: sl.overlays.map((o) => (o.id === overlayId ? { ...o, ...patch } : o)) }
            : sl,
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeOverlay: (slideId, overlayId) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId ? { ...sl, overlays: sl.overlays.filter((o) => o.id !== overlayId) } : sl,
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  setActiveSlide: (id) => set({ activeSlideId: id }),
  setEditorStep: (step) => set({ editorStep: step }),

  saveProject: () => {
    const { project } = get();
    localStorage.setItem(STORAGE_KEY + '-' + project.id, JSON.stringify(project));
    const index = loadSavedIndex();
    const entry = { id: project.id, name: project.name, updatedAt: project.updatedAt };
    const updated = index.filter((i) => i.id !== project.id);
    updated.unshift(entry);
    saveIndex(updated);
    set({ savedProjects: updated });
  },

  loadProject: (id) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + '-' + id);
      if (raw) {
        const project = JSON.parse(raw) as Project;
        set({ project, activeSlideId: null, editorStep: 'slides' });
      }
    } catch { /* ignore */ }
  },

  deleteProject: (id) => {
    localStorage.removeItem(STORAGE_KEY + '-' + id);
    const index = loadSavedIndex().filter((i) => i.id !== id);
    saveIndex(index);
    set({ savedProjects: index });
  },

  newProject: () => {
    set({ project: createDefaultProject(), activeSlideId: null, editorStep: 'screen' });
  },

  resetProject: () => {
    set({ project: createDefaultProject(), activeSlideId: null, editorStep: 'screen' });
  },
}));
