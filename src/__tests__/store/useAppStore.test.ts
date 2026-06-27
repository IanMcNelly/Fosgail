import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAppStore } from '../../store/useAppStore';
import type { MarkdownFile } from '../../types';

// Helper to create a minimal MarkdownFile for tests
function makeFile(overrides: Partial<MarkdownFile> = {}): MarkdownFile {
  return {
    id: `file-${Math.random().toString(36).slice(2)}`,
    name: 'test.md',
    content: '# Test',
    wordCount: 2,
    charCount: 6,
    updatedAt: Date.now(),
    filePath: null,
    isDirty: false,
    ...overrides,
  };
}

// Reset Zustand store state between tests by replacing it with INITIAL_FILES
beforeEach(() => {
  act(() => {
    useAppStore.setState({
      files: [],
      activeFileId: null,
      recentlyViewedIds: [],
      folders: [],
      workspacePath: null,
      isSyncScrollEnabled: true,
      isOutlinePanelOpen: false,
      isAutoSaveEnabled: false,
      activeModal: null,
      isSidebarOpen: true,
      isZenMode: false,
      editorMode: 'split',
      editorFontSize: 14,
      wordWrap: true,
      activeThemeId: 'elegant-dark',
      customThemes: [],
    });
  });
});

// -------------------------------------------------------
// File management
// -------------------------------------------------------
describe('useAppStore — file management', () => {
  it('starts with an empty files array after reset', () => {
    const { result } = renderHook(() => useAppStore());
    expect(result.current.files).toHaveLength(0);
  });

  it('setFiles replaces the file list', () => {
    const { result } = renderHook(() => useAppStore());
    const file = makeFile({ name: 'hello.md' });

    act(() => { result.current.setFiles([file]); });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].name).toBe('hello.md');
  });

  it('setFiles accepts a functional updater', () => {
    const { result } = renderHook(() => useAppStore());
    const a = makeFile({ name: 'a.md' });
    const b = makeFile({ name: 'b.md' });

    act(() => { result.current.setFiles([a]); });
    act(() => { result.current.setFiles((prev) => [...prev, b]); });

    expect(result.current.files).toHaveLength(2);
  });
});

// -------------------------------------------------------
// Active file selection & recently viewed tracking
// -------------------------------------------------------
describe('useAppStore — active file & recently viewed', () => {
  it('setActiveFileId updates activeFileId', () => {
    const { result } = renderHook(() => useAppStore());
    const file = makeFile({ id: 'abc-123' });
    act(() => { result.current.setFiles([file]); });

    act(() => { result.current.setActiveFileId('abc-123'); });

    expect(result.current.activeFileId).toBe('abc-123');
  });

  it('setActiveFileId prepends to recentlyViewedIds', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => { result.current.setActiveFileId('file-a'); });
    act(() => { result.current.setActiveFileId('file-b'); });
    act(() => { result.current.setActiveFileId('file-c'); });

    expect(result.current.recentlyViewedIds[0]).toBe('file-c');
    expect(result.current.recentlyViewedIds[1]).toBe('file-b');
  });

  it('does not duplicate IDs in recentlyViewedIds', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => { result.current.setActiveFileId('file-a'); });
    act(() => { result.current.setActiveFileId('file-b'); });
    act(() => { result.current.setActiveFileId('file-a'); }); // re-open a

    const ids = result.current.recentlyViewedIds;
    const count = ids.filter((id) => id === 'file-a').length;
    expect(count).toBe(1);
    expect(ids[0]).toBe('file-a'); // most recent first
  });

  it('caps recentlyViewedIds at 10 entries', () => {
    const { result } = renderHook(() => useAppStore());

    for (let i = 0; i < 15; i++) {
      act(() => { result.current.setActiveFileId(`file-${i}`); });
    }

    expect(result.current.recentlyViewedIds.length).toBeLessThanOrEqual(10);
  });

  it('setActiveFileId(null) clears the active file', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setActiveFileId('some-file'); });
    act(() => { result.current.setActiveFileId(null); });
    expect(result.current.activeFileId).toBeNull();
  });
});

// -------------------------------------------------------
// Editor mode, sidebar, zen mode
// -------------------------------------------------------
describe('useAppStore — UI toggles', () => {
  it('setEditorMode updates the mode', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setEditorMode('preview'); });
    expect(result.current.editorMode).toBe('preview');
  });

  it('setEditorMode accepts functional updater', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setEditorMode('split'); });
    act(() => { result.current.setEditorMode((prev) => prev === 'split' ? 'preview' : 'edit'); });
    expect(result.current.editorMode).toBe('preview');
  });

  it('setIsSidebarOpen toggles boolean', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setIsSidebarOpen(false); });
    expect(result.current.isSidebarOpen).toBe(false);
    act(() => { result.current.setIsSidebarOpen((p) => !p); });
    expect(result.current.isSidebarOpen).toBe(true);
  });

  it('setIsZenMode works correctly', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setIsZenMode(true); });
    expect(result.current.isZenMode).toBe(true);
  });

  it('setActiveModal sets and clears modal', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setActiveModal('shortcuts'); });
    expect(result.current.activeModal).toBe('shortcuts');
    act(() => { result.current.setActiveModal(null); });
    expect(result.current.activeModal).toBeNull();
  });
});

// -------------------------------------------------------
// Feature flags
// -------------------------------------------------------
describe('useAppStore — feature flags', () => {
  it('isSyncScrollEnabled defaults to true', () => {
    const { result } = renderHook(() => useAppStore());
    expect(result.current.isSyncScrollEnabled).toBe(true);
  });

  it('setIsSyncScrollEnabled toggles sync scroll', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setIsSyncScrollEnabled(false); });
    expect(result.current.isSyncScrollEnabled).toBe(false);
  });

  it('isOutlinePanelOpen defaults to false', () => {
    const { result } = renderHook(() => useAppStore());
    expect(result.current.isOutlinePanelOpen).toBe(false);
  });

  it('setIsOutlinePanelOpen opens and closes panel', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setIsOutlinePanelOpen(true); });
    expect(result.current.isOutlinePanelOpen).toBe(true);
    act(() => { result.current.setIsOutlinePanelOpen((p) => !p); });
    expect(result.current.isOutlinePanelOpen).toBe(false);
  });

  it('isAutoSaveEnabled defaults to false', () => {
    const { result } = renderHook(() => useAppStore());
    expect(result.current.isAutoSaveEnabled).toBe(false);
  });
});

// -------------------------------------------------------
// Workspace
// -------------------------------------------------------
describe('useAppStore — workspace', () => {
  it('setWorkspacePath updates workspacePath', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setWorkspacePath('/home/user/my-docs'); });
    expect(result.current.workspacePath).toBe('/home/user/my-docs');
  });

  it('setFolders replaces folder list', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setFolders(['Docs', 'Notes']); });
    expect(result.current.folders).toEqual(['Docs', 'Notes']);
  });

  it('setFolders accepts functional updater', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => { result.current.setFolders(['Docs']); });
    act(() => { result.current.setFolders((prev) => [...prev, 'Notes']); });
    expect(result.current.folders).toContain('Notes');
    expect(result.current.folders).toHaveLength(2);
  });
});
