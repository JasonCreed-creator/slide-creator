import { create } from 'zustand';
import type { Project, ScreenSpec, ScreenLayout, KeyVisual, Slide, TemplateData, SlideTemplate, BackgroundEffect } from '@/types';
import { DEFAULT_SCREEN, DEFAULT_LAYOUT, DEFAULT_KEY_VISUAL } from '@/presets/defaults';
import { createSlideFromTemplate } from '@/presets/templateDefaults';

export type EditorStep = 'screen' | 'layout' | 'keyvisual' | 'slides' | 'preview';

interface SavedProjectMeta {
  id: string;
  name: string;
  updatedAt: string;
}

interface ProjectState {
  project: Project;
  activeSlideId: string | null;
  editorStep: EditorStep;
  savedProjects: SavedProjectMeta[];

  setScreen: (screen: ScreenSpec) => void;
  setLayout: (layout: ScreenLayout) => void;
  setKeyVisual: (kv: KeyVisual) => void;
  setProjectName: (name: string) => void;
  setBackgroundEffect: (effect: BackgroundEffect) => void;

  addSlideFromTemplate: (template: SlideTemplate) => void;
  updateSlide: (id: string, patch: Partial<Slide>) => void;
  updateSlideData: (id: string, dataPatch: Partial<TemplateData>) => void;
  removeSlide: (id: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  duplicateSlide: (id: string) => void;
  setActiveSlide: (id: string | null) => void;

  setEditorStep: (step: EditorStep) => void;
  resetProject: () => void;

  saveProject: () => void;
  loadProject: (id: string) => void;
  deleteSavedProject: (id: string) => void;
  refreshSavedProjects: () => void;
  exportProjectJson: () => string;
  importProjectJson: (json: string) => void;
}

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
    backgroundEffect: 'starfield',
  };
}

function getSavedProjectsList(): SavedProjectMeta[] {
  try {
    const index = localStorage.getItem(STORAGE_KEY + '-index');
    return index ? JSON.parse(index) : [];
  } catch { return []; }
}

function updateSavedProjectsList(list: SavedProjectMeta[]) {
  localStorage.setItem(STORAGE_KEY + '-index', JSON.stringify(list));
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: createDefaultProject(),
  activeSlideId: null,
  editorStep: 'screen',
  savedProjects: getSavedProjectsList(),

  setScreen: (screen) =>
    set((s) => ({ project: { ...s.project, screen, updatedAt: new Date().toISOString() } })),

  setLayout: (layout) =>
    set((s) => ({ project: { ...s.project, layout, updatedAt: new Date().toISOString() } })),

  setKeyVisual: (kv) =>
    set((s) => ({ project: { ...s.project, keyVisual: kv, updatedAt: new Date().toISOString() } })),

  setProjectName: (name) =>
    set((s) => ({ project: { ...s.project, name, updatedAt: new Date().toISOString() } })),

  setBackgroundEffect: (effect) =>
    set((s) => ({ project: { ...s.project, backgroundEffect: effect, updatedAt: new Date().toISOString() } })),

  addSlideFromTemplate: (template) =>
    set((s) => {
      const slide = createSlideFromTemplate(template, s.project.slides.length);
      return {
        project: {
          ...s.project,
          slides: [...s.project.slides, slide],
          updatedAt: new Date().toISOString(),
        },
        activeSlideId: slide.id,
      };
    }),

  updateSlide: (id, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) => (sl.id === id ? { ...sl, ...patch } : sl)),
        updatedAt: new Date().toISOString(),
      },
    })),

  updateSlideData: (id, dataPatch) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === id ? { ...sl, data: { ...sl.data, ...dataPatch } } : sl,
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeSlide: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.filter((sl) => sl.id !== id),
        updatedAt: new Date().toISOString(),
      },
      activeSlideId: s.activeSlideId === id ? null : s.activeSlideId,
    })),

  reorderSlides: (fromIndex, toIndex) =>
    set((s) => {
      const slides = [...s.project.slides];
      const [moved] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, moved);
      return {
        project: {
          ...s.project,
          slides: slides.map((sl, i) => ({ ...sl, order: i })),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  duplicateSlide: (id) =>
    set((s) => {
      const source = s.project.slides.find((sl) => sl.id === id);
      if (!source) return s;
      const newSlide: Slide = {
        ...source,
        id: crypto.randomUUID(),
        label: source.label + ' (복사)',
        order: s.project.slides.length,
        data: { ...source.data },
      };
      if (newSlide.data.metrics) newSlide.data.metrics = [...newSlide.data.metrics];
      if (newSlide.data.cards) newSlide.data.cards = newSlide.data.cards.map((c) => ({ ...c }));
      return {
        project: {
          ...s.project,
          slides: [...s.project.slides, newSlide],
          updatedAt: new Date().toISOString(),
        },
        activeSlideId: newSlide.id,
      };
    }),

  setActiveSlide: (id) => set({ activeSlideId: id }),
  setEditorStep: (step) => set({ editorStep: step }),

  resetProject: () =>
    set({ project: createDefaultProject(), activeSlideId: null, editorStep: 'screen' }),

  saveProject: () => {
    const { project } = get();
    localStorage.setItem(STORAGE_KEY + '-' + project.id, JSON.stringify(project));
    const list = getSavedProjectsList();
    const existing = list.findIndex((p) => p.id === project.id);
    const meta: SavedProjectMeta = { id: project.id, name: project.name, updatedAt: project.updatedAt };
    if (existing >= 0) list[existing] = meta;
    else list.push(meta);
    updateSavedProjectsList(list);
    set({ savedProjects: list });
  },

  loadProject: (id) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY + '-' + id);
      if (data) {
        set({ project: JSON.parse(data), activeSlideId: null, editorStep: 'screen' });
      }
    } catch { /* ignore */ }
  },

  deleteSavedProject: (id) => {
    localStorage.removeItem(STORAGE_KEY + '-' + id);
    const list = getSavedProjectsList().filter((p) => p.id !== id);
    updateSavedProjectsList(list);
    set({ savedProjects: list });
  },

  refreshSavedProjects: () => set({ savedProjects: getSavedProjectsList() }),

  exportProjectJson: () => JSON.stringify(get().project, null, 2),

  importProjectJson: (json) => {
    try {
      const project: Project = JSON.parse(json);
      project.id = crypto.randomUUID();
      set({ project, activeSlideId: null, editorStep: 'screen' });
    } catch { /* ignore */ }
  },
}));
