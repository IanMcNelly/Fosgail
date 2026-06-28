import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MarkdownFile, CSSTheme } from '../types';
import { INITIAL_FILES } from '../samples';
import { tauriStorage } from './tauriStorage';

export type EditorMode = 'split' | 'edit' | 'preview';
export type ModalType = null | 'shortcuts' | 'theme-editor' | 'settings' | 'recent-files' | 'command-palette';

interface AppState {
  files: MarkdownFile[];
  activeFileId: string | null;
  customThemes: CSSTheme[];
  activeThemeId: string;
  isSidebarOpen: boolean;
  isZenMode: boolean;
  editorFontSize: number;
  wordWrap: boolean;
  editorMode: EditorMode;
  activeModal: ModalType;
  recentlyViewedIds: string[];
  folders: string[];
  workspacePath: string | null;

  // Feature flags stored in settings
  isSyncScrollEnabled: boolean;
  isOutlinePanelOpen: boolean;
  isAutoSaveEnabled: boolean;

  // Actions
  setFiles: (files: MarkdownFile[] | ((prev: MarkdownFile[]) => MarkdownFile[])) => void;
  setActiveFileId: (id: string | null) => void;
  setCustomThemes: (themes: CSSTheme[] | ((prev: CSSTheme[]) => CSSTheme[])) => void;
  setActiveThemeId: (id: string) => void;
  setIsSidebarOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  setIsZenMode: (isZen: boolean | ((prev: boolean) => boolean)) => void;
  setEditorFontSize: (size: number) => void;
  setWordWrap: (wrap: boolean | ((prev: boolean) => boolean)) => void;
  setEditorMode: (mode: EditorMode | ((prev: EditorMode) => EditorMode)) => void;
  setActiveModal: (modal: ModalType | ((prev: ModalType) => ModalType)) => void;
  setRecentlyViewedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  setFolders: (folders: string[] | ((prev: string[]) => string[])) => void;
  setWorkspacePath: (path: string | null) => void;
  setIsSyncScrollEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsOutlinePanelOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsAutoSaveEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
}

// Helper to handle function updates or value updates
const applyUpdate = <T,>(update: T | ((prev: T) => T), prev: T): T => {
  return typeof update === 'function' ? (update as any)(prev) : update;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      files: INITIAL_FILES,
      activeFileId: INITIAL_FILES.length > 0 ? INITIAL_FILES[0].id : null,
      customThemes: [],
      activeThemeId: 'elegant-dark',
      isSidebarOpen: true,
      isZenMode: false,
      editorFontSize: 14,
      wordWrap: true,
      editorMode: 'split',
      activeModal: null,
      recentlyViewedIds: [],
      folders: ['Docs', 'Docs/Guides', 'Docs/Tickets', 'Docs/Playground'],
      workspacePath: null,

      // Feature flags
      isSyncScrollEnabled: true,
      isOutlinePanelOpen: false,
      isAutoSaveEnabled: false,

      setFiles: (update) => set({ files: applyUpdate(update, get().files) }),
      setActiveFileId: (id) => {
        const prevActive = get().activeFileId;
        set({ activeFileId: id });
        if (id && id !== prevActive) {
          // Track recently viewed
          const filtered = get().recentlyViewedIds.filter((rid) => rid !== id);
          set({ recentlyViewedIds: [id, ...filtered].slice(0, 10) });
        }
      },
      setCustomThemes: (update) => set({ customThemes: applyUpdate(update, get().customThemes) }),
      setActiveThemeId: (id) => set({ activeThemeId: id }),
      setIsSidebarOpen: (update) => set({ isSidebarOpen: applyUpdate(update, get().isSidebarOpen) }),
      setIsZenMode: (update) => set({ isZenMode: applyUpdate(update, get().isZenMode) }),
      setEditorFontSize: (size) => set({ editorFontSize: size }),
      setWordWrap: (update) => set({ wordWrap: applyUpdate(update, get().wordWrap) }),
      setEditorMode: (update) => set({ editorMode: applyUpdate(update, get().editorMode) }),
      setActiveModal: (update) => set({ activeModal: applyUpdate(update, get().activeModal) }),
      setRecentlyViewedIds: (update) => set({ recentlyViewedIds: applyUpdate(update, get().recentlyViewedIds) }),
      setFolders: (update) => set({ folders: applyUpdate(update, get().folders) }),
      setWorkspacePath: (path) => set({ workspacePath: path }),
      setIsSyncScrollEnabled: (update) => set({ isSyncScrollEnabled: applyUpdate(update, get().isSyncScrollEnabled) }),
      setIsOutlinePanelOpen: (update) => set({ isOutlinePanelOpen: applyUpdate(update, get().isOutlinePanelOpen) }),
      setIsAutoSaveEnabled: (update) => set({ isAutoSaveEnabled: applyUpdate(update, get().isAutoSaveEnabled) }),
    }),
    {
      name: 'fosgail-storage',
      storage: createJSONStorage(() => tauriStorage),
      // We don't want to persist transient state like activeModal
      partialize: (state) => ({
        files: state.files,
        activeFileId: state.activeFileId,
        customThemes: state.customThemes,
        activeThemeId: state.activeThemeId,
        isSidebarOpen: state.isSidebarOpen,
        editorFontSize: state.editorFontSize,
        wordWrap: state.wordWrap,
        editorMode: state.editorMode,
        recentlyViewedIds: state.recentlyViewedIds,
        folders: state.folders,
        workspacePath: state.workspacePath,
        isSyncScrollEnabled: state.isSyncScrollEnabled,
        isAutoSaveEnabled: state.isAutoSaveEnabled,
      }),
    }
  )
);
