import { create } from 'zustand';
import type { Project, ScreenSpec, ScreenLayout, KeyVisual, Slide, SlideContent } from '@/types';
import { DEFAULT_SCREEN, DEFAULT_LAYOUT, DEFAULT_KEY_VISUAL } from '@/presets/defaults';

export type EditorStep = 'screen' | 'layout' | 'keyvisual' | 'slides' | 'preview';

interface SavedProjectMeta {
  id: string;
  name: string;
  updatedAt: string;
}

interface ProjectState {
  project: Project;
  activeSlideId: string | null;
  selectedContentId: string | null;
  editorStep: EditorStep;
  savedProjects: SavedProjectMeta[];

  setScreen: (screen: ScreenSpec) => void;
  setLayout: (layout: ScreenLayout) => void;
  setKeyVisual: (kv: KeyVisual) => void;
  setProjectName: (name: string) => void;

  addSlide: (slide: Slide) => void;
  updateSlide: (id: string, patch: Partial<Slide>) => void;
  removeSlide: (id: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  duplicateSlide: (id: string) => void;
  setActiveSlide: (id: string | null) => void;

  addContent: (slideId: string, content: SlideContent) => void;
  updateContent: (slideId: string, contentId: string, patch: Partial<SlideContent>) => void;
  removeContent: (slideId: string, contentId: string) => void;
  setSelectedContent: (id: string | null) => void;

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
  };
}

function getSavedProjectsList(): SavedProjectMeta[] {
  try {
    const index = localStorage.getItem(STORAGE_KEY + '-index');
    return index ? JSON.parse(index) : [];
  } catch {
    return [];
  }
}

function updateSavedProjectsList(list: SavedProjectMeta[]) {
  localStorage.setItem(STORAGE_KEY + '-index', JSON.stringify(list));
}

function updateSlideContents(
  slides: Slide[],
  slideId: string,
  updater: (contents: SlideContent[]) => SlideContent[],
): Slide[] {
  return slides.map((s) =>
    s.id === slideId ? { ...s, contents: updater(s.contents) } : s,
  );
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: createDefaultProject(),
  activeSlideId: null,
  selectedContentId: null,
  editorStep: 'screen',
  savedProjects: getSavedProjectsList(),

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

  setProjectName: (name) =>
    set((state) => ({
      project: { ...state.project, name, updatedAt: new Date().toISOString() },
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
      selectedContentId: null,
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
      const source = state.project.slides.find((s) => s.id === id);
      if (!source) return state;
      const newSlide: Slide = {
        ...source,
        id: crypto.randomUUID(),
        label: source.label + ' (복사)',
        order: state.project.slides.length,
        contents: source.contents.map((c) => ({ ...c, id: crypto.randomUUID() })),
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

  setActiveSlide: (id) => set({ activeSlideId: id, selectedContentId: null }),

  addContent: (slideId, content) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: updateSlideContents(state.project.slides, slideId, (contents) => [
          ...contents,
          content,
        ]),
        updatedAt: new Date().toISOString(),
      },
      selectedContentId: content.id,
    })),

  updateContent: (slideId, contentId, patch) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: updateSlideContents(state.project.slides, slideId, (contents) =>
          contents.map((c) => (c.id === contentId ? { ...c, ...patch } : c)),
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeContent: (slideId, contentId) =>
    set((state) => ({
      project: {
        ...state.project,
        slides: updateSlideContents(state.project.slides, slideId, (contents) =>
          contents.filter((c) => c.id !== contentId),
        ),
        updatedAt: new Date().toISOString(),
      },
      selectedContentId: state.selectedContentId === contentId ? null : state.selectedContentId,
    })),

  setSelectedContent: (id) => set({ selectedContentId: id }),

  setEditorStep: (step) => set({ editorStep: step }),

  resetProject: () =>
    set({
      project: createDefaultProject(),
      activeSlideId: null,
      selectedContentId: null,
      editorStep: 'screen',
    }),

  saveProject: () => {
    const { project } = get();
    localStorage.setItem(STORAGE_KEY + '-' + project.id, JSON.stringify(project));
    const list = getSavedProjectsList();
    const existing = list.findIndex((p) => p.id === project.id);
    const meta: SavedProjectMeta = {
      id: project.id,
      name: project.name,
      updatedAt: project.updatedAt,
    };
    if (existing >= 0) {
      list[existing] = meta;
    } else {
      list.push(meta);
    }
    updateSavedProjectsList(list);
    set({ savedProjects: list });
  },

  loadProject: (id) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY + '-' + id);
      if (data) {
        const project: Project = JSON.parse(data);
        set({
          project,
          activeSlideId: null,
          selectedContentId: null,
          editorStep: 'screen',
        });
      }
    } catch { /* ignore */ }
  },

  deleteSavedProject: (id) => {
    localStorage.removeItem(STORAGE_KEY + '-' + id);
    const list = getSavedProjectsList().filter((p) => p.id !== id);
    updateSavedProjectsList(list);
    set({ savedProjects: list });
  },

  refreshSavedProjects: () => {
    set({ savedProjects: getSavedProjectsList() });
  },

  exportProjectJson: () => {
    return JSON.stringify(get().project, null, 2);
  },

  importProjectJson: (json) => {
    try {
      const project: Project = JSON.parse(json);
      project.id = crypto.randomUUID();
      set({
        project,
        activeSlideId: null,
        selectedContentId: null,
        editorStep: 'screen',
      });
    } catch { /* ignore */ }
  },
}));
