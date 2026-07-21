/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef, DragEvent } from 'react';
import { 
  Menu, Eye, Code, Columns, 
  HelpCircle, Settings, X, ChevronRight,
  Plus, Save, FileCode,
  Maximize2, Minimize2, List, Circle
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { open, save, ask } from '@tauri-apps/plugin-dialog';
import { readDir, readTextFile, writeTextFile, mkdir, remove, rename } from '@tauri-apps/plugin-fs';

// Import our modular models & components
import { MarkdownFile, CSSTheme } from './types';
import { BUILTIN_THEMES, GENERAL_THEMES_INFO } from './themes';
import { INITIAL_FILES } from './samples';
import { useAppStore } from './store/useAppStore';
import { normalizePath, calculateWordCharCount, throttle, navigateHistory, pushToHistory } from './utils';
import Sidebar from './components/Sidebar';
import EditorArea from './components/EditorArea';
import MarkdownOutput from './components/MarkdownOutput';
import TabBar from './components/TabBar';
import ThemeEditor from './components/ThemeEditor';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import SettingsModal from './components/SettingsModal';
import CommandPalette from './components/CommandPalette';
import OutlinePanel from './components/OutlinePanel';


export default function App() {
  // --------------------------------------------------
  // 1. STATE INITIALIZATION (Zustand)
  // --------------------------------------------------
  const {
    files, setFiles,
    activeFileId, setActiveFileId,
    customThemes, setCustomThemes,
    activeThemeId, setActiveThemeId,
    isSidebarOpen, setIsSidebarOpen,
    isZenMode, setIsZenMode,
    editorFontSize, setEditorFontSize,
    wordWrap, setWordWrap,
    editorMode, setEditorMode,
    activeModal, setActiveModal,
    recentlyViewedIds, setRecentlyViewedIds,
    folders, setFolders,
    workspacePath, setWorkspacePath,
    isSyncScrollEnabled, setIsSyncScrollEnabled,
    isOutlinePanelOpen, setIsOutlinePanelOpen,
    isAutoSaveEnabled, setIsAutoSaveEnabled,
  } = useAppStore();

  // File drag & drop active marker
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  // Synchronized scroll percentage (0–1)
  const [syncScrollPercent, setSyncScrollPercent] = useState(0);

  // Navigation stack & pointer for forward/back history
  const [navHistory, setNavHistory] = useState<string[]>(activeFileId ? [activeFileId] : []);
  const [navIndex, setNavIndex] = useState<number>(activeFileId ? 0 : -1);
  const navHistoryRef = useRef(navHistory);
  navHistoryRef.current = navHistory;
  const navIndexRef = useRef(navIndex);
  navIndexRef.current = navIndex;

  // ⚡ Bolt Optimization: Throttle the scroll sync state update to prevent the entire
  // app (Sidebar, Editor, Preview) from re-rendering synchronously on every scroll frame.
  const handleSyncScroll = useMemo(() => throttle((pct: number) => {
    setSyncScrollPercent(pct);
  }, 50), []);

  // Active Theme details computed
  const combinedThemes = useMemo(() => {
    return [...BUILTIN_THEMES, ...customThemes];
  }, [customThemes]);

  const activeTheme = useMemo(() => {
    return combinedThemes.find((t) => t.id === activeThemeId) || BUILTIN_THEMES[0];
  }, [combinedThemes, activeThemeId]);

  const activeMarkdownFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || null;
  }, [files, activeFileId]);

  // General theme information mapping (background coloring for App layouts)
  const themeInfo = useMemo(() => {
    if (GENERAL_THEMES_INFO[activeThemeId]) {
      return GENERAL_THEMES_INFO[activeThemeId];
    }
    return activeTheme.isDark 
      ? GENERAL_THEMES_INFO['default-custom-dark'] 
      : GENERAL_THEMES_INFO['default-custom-light'];
  }, [activeTheme, activeThemeId]);

  // Synchronize Tailwind's dark mode class with the active theme
  useEffect(() => {
    if (themeInfo.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeInfo.isDark]);

  // Dynamically inject the active CSS theme's rules into the document head
  useEffect(() => {
    let styleTag = document.getElementById('markdown-viewer-active-theme-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'markdown-viewer-active-theme-style';
      document.head.appendChild(styleTag);
    }
    // SECURE: Use textContent instead of innerHTML to prevent XSS breakout
    // e.g. escaping the style tag via </style><script>...</script>
    styleTag.textContent = activeTheme.cssRules;
  }, [activeTheme]);

  // --------------------------------------------------
  // 2. SAVE STATUS & DIRTY TRACKING
  // --------------------------------------------------
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [scanErrors, setScanErrors] = useState<string[]>([]);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Write file to disk if it has a known filePath
  const writeToDisk = useCallback(async (file: MarkdownFile) => {
    if (!file.filePath) return false;
    try {
      setSaveStatus('saving');
      await writeTextFile(file.filePath, file.content);
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isDirty: false } : f))
      );
      setSaveStatus('saved');
      return true;
    } catch (e: any) {
      alert(`Save error: ${e.message || e}`);
      console.error('Failed to write file to disk:', e);
      setSaveStatus('saved');
      return false;
    }
  }, [setFiles]);

  // Auto-save effect — only runs if autoSave is enabled AND the file has a disk path
  useEffect(() => {
    if (!isAutoSaveEnabled || !activeMarkdownFile?.filePath || !activeMarkdownFile.isDirty) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      writeToDisk(activeMarkdownFile);
    }, 1500); // 1.5s debounce for auto-save

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [activeMarkdownFile?.content, isAutoSaveEnabled, writeToDisk]);

  // --------------------------------------------------
  // 3. DESKTOP KEYBOARD HOTKEYS & EVENTS
  // --------------------------------------------------
  useEffect(() => {
    let unlistenClose: () => void;
    const setupCloseListener = async () => {
      try {
        const appWindow = getCurrentWindow();
        unlistenClose = await appWindow.onCloseRequested(async (event) => {
          const currentFiles = useAppStore.getState().files;
          const dirtyFiles = currentFiles.filter(f => f.isDirty);
          
          if (dirtyFiles.length > 0) {
            event.preventDefault(); // Stop closing
            
            const confirm = await ask(`You have ${dirtyFiles.length} unsaved draft(s). Are you sure you want to exit? Unsaved changes will be kept in memory but might be lost if you open a new workspace later.`, { title: 'Unsaved Changes', kind: 'warning' });
            if (confirm) {
              appWindow.destroy();
            }
          }
        });
      } catch (e) {
        console.error('Failed to setup close listener', e);
      }
    };
    setupCloseListener();

    return () => {
      if (unlistenClose) unlistenClose();
    };
  }, []);

  useEffect(() => {
    let unlistenDrop: () => void;
    const setupDropListener = async () => {
      try {
        unlistenDrop = await listen<{ paths: string[] }>('tauri://drop', async (event) => {
          setIsDraggingFile(false);
          const { paths } = event.payload;
          if (paths && paths.length > 0) {
            for (const rawPath of paths) {
              const absolutePath = normalizePath(rawPath);
              try {
                const content = await readTextFile(absolutePath);
                const counts = calculateWordCharCount(content);
                const fileName = absolutePath.split('/').pop() || 'Unknown';
                
                const importedFile: MarkdownFile = {
                  id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: fileName,
                  content: content,
                  wordCount: counts.wordCount,
                  charCount: counts.charCount,
                  updatedAt: Date.now(),
                  folder: '', // Opened outside workspace
                  filePath: absolutePath, // Retain absolute path
                  isDirty: false,
                };
                
                setFiles((prev) => {
                  const filtered = prev.filter(f => f.filePath !== absolutePath);
                  return [importedFile, ...filtered];
                });
                setActiveFileId(importedFile.id);
                setEditorMode('split');
              } catch (e) {
                console.error('Failed to read dropped file', e);
              }
            }
          }
        });
      } catch (e) {
        console.error('Failed to setup drop listener', e);
      }
    };
    setupDropListener();

    return () => {
      if (unlistenDrop) unlistenDrop();
    };
  }, []);

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape') {
        if (isCmdOrCtrl) {
          setIsZenMode((p) => !p);
        } else {
          setIsZenMode(false);
          setIsOutlinePanelOpen(false);
        }
      }

      if (isCmdOrCtrl) {
        switch (e.key.toLowerCase()) {
          case 's': // Cmd+S = Explicit Save to Disk
            e.preventDefault();
            handleSaveFile();
            break;
          case 'n': // Cmd+N = Create new draft
            e.preventDefault();
            handleCreateNewFile();
            break;
          case 'b': // Cmd+B = Toggle Sidebar
            e.preventDefault();
            setIsSidebarOpen((p) => !p);
            break;
          case 'k': // Cmd+K = Command Palette
            e.preventDefault();
            setActiveModal((prev) => (prev === 'command-palette' ? null : 'command-palette'));
            break;
          case 't': // Cmd+T = Quick file switcher (within Command Palette)
            e.preventDefault();
            setActiveModal((prev) => (prev === 'command-palette' ? null : 'command-palette'));
            break;
          case 'm': // Cmd+M = Cycle layout modes
            e.preventDefault();
            setEditorMode((current) => {
              if (current === 'split') return 'preview';
              if (current === 'preview') return 'edit';
              return 'split';
            });
            break;
          case 'o': // Cmd+O = Open Workspace folder
            e.preventDefault();
            handleOpenWorkspace();
            break;
          case 'i': // Cmd+I = Toggle outline panel
            e.preventDefault();
            setIsOutlinePanelOpen((p) => !p);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [activeMarkdownFile, files, activeThemeId, isZenMode]);

  const handleSelectFile = useCallback(async (id: string, isNavigatingHistory = false) => {
    setActiveFileId(id);
    if (!isNavigatingHistory) {
      const { newHistory, newIndex } = pushToHistory(navHistoryRef.current, navIndexRef.current, id);
      setNavHistory(newHistory);
      setNavIndex(newIndex);
    }
    const file = files.find(f => f.id === id);
    if (file && !file.isLoaded && file.filePath) {
      try {
        const content = await readTextFile(file.filePath);
        const counts = calculateWordCharCount(content);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, content, wordCount: counts.wordCount, charCount: counts.charCount, isLoaded: true } : f));
      } catch (err: any) {
        console.error(`Failed to load file content for ${file.name}:`, err);
        alert(`Failed to load file: ${err.message || err}`);
      }
    }
  }, [files, setFiles, setActiveFileId]);

  // Global mouse navigation (forward/back buttons)
  useEffect(() => {
    const handleMouseNav = (e: MouseEvent) => {
      // button 3 is Back, button 4 is Forward
      if (e.button === 3) {
        e.preventDefault();
        const { newIndex, targetId } = navigateHistory(navHistoryRef.current, navIndexRef.current, 'back');
        if (targetId) {
          setNavIndex(newIndex);
          handleSelectFile(targetId, true);
        }
      } else if (e.button === 4) {
        e.preventDefault();
        const { newIndex, targetId } = navigateHistory(navHistoryRef.current, navIndexRef.current, 'forward');
        if (targetId) {
          setNavIndex(newIndex);
          handleSelectFile(targetId, true);
        }
      }
    };
    window.addEventListener('mouseup', handleMouseNav);
    return () => window.removeEventListener('mouseup', handleMouseNav);
  }, [handleSelectFile]);

  // Helper toggle dark to light themes
  const toggleThemeBrightnesses = () => {
    if (activeTheme.isDark) {
      const lightTheme = combinedThemes.find((t) => !t.isDark);
      if (lightTheme) setActiveThemeId(lightTheme.id);
    } else {
      const darkTheme = combinedThemes.find((t) => t.isDark);
      if (darkTheme) setActiveThemeId(darkTheme.id);
    }
  };

  // --------------------------------------------------
  // 4. ACTION CONTROLLERS & EVENT HANDLERS
  // --------------------------------------------------

  // Calculate text counts — imported from utils.ts
  // Create new draft with optional folder path
  const handleCreateNewFile = async (folderPath?: string) => {
    const counts = calculateWordCharCount('# Untitled Document\n\nStart writing here...');
    const filename = `Draft_${Date.now().toString().slice(-4)}.md`;
    let filePath: string | null = null;
    let isDirty = true;
    
    if (workspacePath) {
      filePath = normalizePath(`${workspacePath}/${folderPath ? folderPath + '/' : ''}${filename}`);
      try {
        await writeTextFile(filePath, '# Untitled Document\n\nStart writing here...');
        isDirty = false;
      } catch (e) {
        console.error('Failed to create file on disk', e);
        filePath = null;
      }
    }

    const newFile: MarkdownFile = {
      id: `file-${Date.now()}`,
      name: filename,
      content: `# Untitled Document\n\nStart writing here.`,
      wordCount: counts.wordCount,
      charCount: counts.charCount,
      updatedAt: Date.now(),
      folder: folderPath || '',
      filePath,
      isDirty,
    };
    setFiles((prev) => [newFile, ...prev]);
    setActiveFileId(newFile.id);
    setRecentlyViewedIds((prev) => [newFile.id, ...prev]);
    setEditorMode('split');
  };

  // Add a new registered directory
  const handleAddFolder = async (folderPath: string) => {
    // SECURE: Prevent directory traversal outside the workspace
    if (folderPath.includes('..') || folderPath.startsWith('/') || folderPath.startsWith('\\')) {
      alert("Invalid folder path.");
      return;
    }

    if (workspacePath) {
      try {
        await mkdir(normalizePath(`${workspacePath}/${folderPath}`), { recursive: true });
      } catch (e) {
        console.error('Failed to create folder on disk', e);
      }
    }
    setFolders((prev) => {
      if (prev.includes(folderPath)) return prev;
      return [...prev, folderPath];
    });
  };

  // Remove a folder and delete its contents from the in-memory store
  const handleRemoveFolder = async (folderPath: string) => {
    // SECURE: Prevent directory traversal to delete unintended folders
    if (folderPath.includes('..') || folderPath.startsWith('/') || folderPath.startsWith('\\')) {
      alert("Invalid folder path.");
      return;
    }

    if (workspacePath) {
      try {
        const confirm = await ask(`Are you sure you want to permanently delete the folder "${folderPath}" and all its contents? This cannot be undone.`, { title: 'Confirm Deletion', kind: 'warning' });
        if (!confirm) return;
        await remove(normalizePath(`${workspacePath}/${folderPath}`), { recursive: true });
      } catch (e) {
        console.error('Failed to remove folder on disk', e);
        alert(`Failed to delete folder: ${e}`);
        return; // Don't remove from UI if it failed
      }
    }

    // Compute what the new active file should be before mutating
    const currentFiles = useAppStore.getState().files;
    const currentActiveId = useAppStore.getState().activeFileId;

    const filtered = currentFiles.filter((file) => {
      const fileFolder = file.folder || '';
      return fileFolder !== folderPath && !fileFolder.startsWith(folderPath + '/');
    });

    // Determine new active ID if the current file is being removed
    let newActiveId = currentActiveId;
    if (currentActiveId) {
      const currentFile = currentFiles.find((f) => f.id === currentActiveId);
      if (currentFile) {
        const cf = currentFile.folder || '';
        if (cf === folderPath || cf.startsWith(folderPath + '/')) {
          newActiveId = filtered.length > 0 ? filtered[0].id : null;
        }
      }
    }

    setFolders((prev) => prev.filter((f) => f !== folderPath && !f.startsWith(folderPath + '/')));
    setFiles(filtered);
    setRecentlyViewedIds((prev) => prev.filter((id) => filtered.some((f) => f.id === id)));
    if (newActiveId !== currentActiveId) {
      setActiveFileId(newActiveId);
    }
  };

  // Move a document into another folder directory
  const handleMoveFileFolder = async (fileId: string, folderPath: string) => {
    // SECURE: Prevent path traversal when moving files
    if (folderPath.includes('..') || folderPath.startsWith('/') || folderPath.startsWith('\\')) {
      alert("Invalid folder path.");
      return;
    }

    const fileToMove = useAppStore.getState().files.find(f => f.id === fileId);
    if (!fileToMove) return;

    let newFilePath = fileToMove.filePath;
    if (workspacePath && fileToMove.filePath) {
      newFilePath = normalizePath(`${workspacePath}/${folderPath ? folderPath + '/' : ''}${fileToMove.name}`);
      try {
        await rename(fileToMove.filePath, newFilePath);
      } catch (e) {
        console.error('Failed to move file on disk', e);
        alert(`Failed to move file: ${e}`);
        return;
      }
    }

    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, folder: folderPath, filePath: newFilePath } : f))
    );
  };

  // Explicit save to disk (Cmd+S)
  const handleSaveFile = async () => {
    if (!activeMarkdownFile) return;

    if (activeMarkdownFile.filePath) {
      // In-place write for workspace files
      await writeToDisk(activeMarkdownFile);
    } else {
      // Save-As dialog for drafts without a disk path
      try {
        const filePath = await save({
          filters: [{ name: 'Markdown', extensions: ['md'] }],
          defaultPath: activeMarkdownFile.name
        });
        if (filePath) {
          const normalizedPath = normalizePath(filePath);
          await writeTextFile(normalizedPath, activeMarkdownFile.content);
          // Now associate the disk path with this file
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeMarkdownFile.id
                ? { ...f, filePath: normalizedPath, isDirty: false, name: normalizedPath.split('/').pop() || f.name }
                : f
            )
          );
          setSaveStatus('saved');
        }
      } catch (e: any) {
        alert(`Save As error: ${e.message || e}`);
        console.error('Save As failed:', e);
      }
    }
  };

  // Delete a file from local collections and disk
  const handleDeleteFile = async (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(null);
    }
    setRecentlyViewedIds(prev => prev.filter(vid => vid !== id));
    if (workspacePath) {
      const file = files.find(f => f.id === id);
      if (file && file.filePath) {
        try {
          await remove(file.filePath);
        } catch (e) {
          console.error("Failed to delete from disk", e);
        }
      }
    }
  };

  const handleCloseTab = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentRecentlyViewed = useAppStore.getState().recentlyViewedIds;
    const remaining = currentRecentlyViewed.filter(vid => vid !== id);
    setRecentlyViewedIds(remaining);
    if (useAppStore.getState().activeFileId === id) {
      setActiveFileId(remaining.length > 0 ? remaining[0] : null);
    }
  }, [setRecentlyViewedIds, setActiveFileId]);

  // Internal link navigation
  const handleNavigate = useCallback((href: string) => {
    if (!activeMarkdownFile) return;

    const resolvePath = (baseFolder: string, link: string) => {
      if (link.startsWith('/')) link = link.slice(1);
      if (link.startsWith('./')) link = link.slice(2);
      
      const baseParts = baseFolder ? baseFolder.split('/').filter(Boolean) : [];
      const linkParts = link.split('/');
      
      for (const part of linkParts) {
        if (part === '..') {
          baseParts.pop();
        } else if (part !== '.' && part !== '') {
          baseParts.push(part);
        }
      }
      return baseParts.join('/');
    };

    const linkPath = resolvePath(activeMarkdownFile.folder || '', href);
    const linkFileName = linkPath.split('/').pop() || '';
    const linkFolder = linkPath.substring(0, linkPath.lastIndexOf('/')) || '';
    
    // Find matching file
    const exactMatch = files.find(f => (f.folder || '') === linkFolder && f.name === linkFileName);
    if (exactMatch) {
      handleSelectFile(exactMatch.id);
    } else {
      const nameMatch = files.find(f => f.name === linkFileName);
      if (nameMatch) {
        handleSelectFile(nameMatch.id);
      }
    }
  }, [activeMarkdownFile, files, handleSelectFile]);

  // Handle active file content change
  const handleEditorContentChange = useCallback((newValue: string) => {
    if (!activeFileId) return;
    const counts = calculateWordCharCount(newValue);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? {
              ...f,
              content: newValue,
              wordCount: counts.wordCount,
              charCount: counts.charCount,
              updatedAt: Date.now(),
              isDirty: true,
            }
          : f
      )
    );
  }, [activeFileId, setFiles]);

  // Rename the active file (with duplicate check)
  const handleRenameActiveFile = async (newName: string) => {
    // SECURE: Prevent path traversal to rename files outside current directory
    if (newName.includes('/') || newName.includes('\\') || newName.includes('..')) {
      alert("Invalid file name.");
      return;
    }

    if (!activeFileId) return;
    const currentFile = files.find((f) => f.id === activeFileId);
    if (!currentFile) return;

    // Check for duplicates in the same folder
    const duplicate = files.find(
      (f) => f.id !== activeFileId && f.folder === currentFile.folder && f.name === newName
    );
    if (duplicate) {
      console.warn(`A file named "${newName}" already exists in this folder.`);
      return; // Silently reject — EditorArea will reset to old name via prop
    }

    let newFilePath = currentFile.filePath;
    if (currentFile.filePath) {
      const folderPath = currentFile.filePath.substring(0, currentFile.filePath.lastIndexOf('/'));
      newFilePath = `${folderPath}/${newName}`;
      try {
        await rename(currentFile.filePath, newFilePath);
      } catch (e) {
        console.error('Failed to rename file on disk', e);
        alert(`Failed to rename file: ${e}`);
        return;
      }
    }

    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, name: newName, isDirty: true, filePath: newFilePath } : f))
    );
  };


  // --------------------------------------------------
  // 5. WORKSPACE IMPORTING
  // --------------------------------------------------
  const handleOpenWorkspace = async () => {
    const dirtyFiles = useAppStore.getState().files.filter(f => f.isDirty);
    if (dirtyFiles.length > 0) {
      const confirm = await ask(`You have ${dirtyFiles.length} unsaved draft(s). Opening a new workspace will close the current files. Do you want to continue and discard unsaved changes?`, { title: 'Unsaved Changes', kind: 'warning' });
      if (!confirm) return;
    }

    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected && typeof selected === 'string') {
        const workspaceRoot = normalizePath(selected);
        setWorkspacePath(workspaceRoot);
        const newFiles: MarkdownFile[] = [];
        const newFolders: Set<string> = new Set();
        const errors: string[] = [];
        const scanDirectory = async (dirPath: string, relativePath: string) => {
            try {
              const entries = await readDir(dirPath);
              for (const entry of entries) {
                if (entry.name && (entry.name === '.git' || entry.name === 'node_modules' || entry.name.startsWith('.'))) {
                  continue;
                }
                if (entry.isDirectory) {
                  const newRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name!;
                  newFolders.add(newRelPath);
                  await scanDirectory(normalizePath(`${dirPath}/${entry.name}`), newRelPath);
                } else if (entry.name && (entry.name.toLowerCase().endsWith('.md') || entry.name.toLowerCase().endsWith('.txt') || entry.name.toLowerCase().endsWith('.mdx') || entry.name.toLowerCase().endsWith('.markdown'))) {
                  const absoluteFilePath = normalizePath(`${dirPath}/${entry.name}`);
                  newFiles.push({
                    id: `file-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                    name: entry.name,
                    content: '', // Lazily load this later when the user clicks the file
                    wordCount: 0,
                    charCount: 0,
                    updatedAt: Date.now(),
                    folder: relativePath,
                    filePath: absoluteFilePath,
                    isDirty: false,
                    isLoaded: false, // New flag indicating content hasn't been fetched via IPC yet
                  });
                }
              }
            } catch (err: any) {
              errors.push(`Dir error (${dirPath}): ${err.message || err}`);
              console.error('Failed to read dir', err);
            }
          };

        await scanDirectory(workspaceRoot, '');

        if (newFiles.length > 0) {
          setFiles(newFiles);
          setActiveFileId(newFiles[0].id);
          setRecentlyViewedIds([newFiles[0].id]);
        } else {
          setFiles([]);
          setActiveFileId(null);
          setRecentlyViewedIds([]);
        }
        setFolders(Array.from(newFolders));
        setScanErrors(errors);
        setEditorMode('split');
      }
    } catch (e) {
      console.error('Workspace open failed:', e);
    }
  };

  const handleRefreshWorkspace = async () => {
    if (!workspacePath) return;
    
    const dirtyFiles = useAppStore.getState().files.filter(f => f.isDirty);
    if (dirtyFiles.length > 0) {
      const confirm = await ask(`You have ${dirtyFiles.length} unsaved draft(s). Refreshing will discard unsaved changes. Do you want to continue?`, { title: 'Unsaved Changes', kind: 'warning' });
      if (!confirm) return;
    }

    try {
      const newFiles: MarkdownFile[] = [];
      const newFolders: Set<string> = new Set();
      const errors: string[] = [];
      
      const scanDirectory = async (dirPath: string, relativePath: string) => {
        try {
          const entries = await readDir(dirPath);
          for (const entry of entries) {
            if (entry.name && (entry.name === '.git' || entry.name === 'node_modules' || entry.name.startsWith('.'))) {
              continue;
            }
            if (entry.isDirectory) {
              const newRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name!;
              newFolders.add(newRelPath);
              await scanDirectory(normalizePath(`${dirPath}/${entry.name}`), newRelPath);
            } else if (entry.name && (entry.name.toLowerCase().endsWith('.md') || entry.name.toLowerCase().endsWith('.txt') || entry.name.toLowerCase().endsWith('.mdx') || entry.name.toLowerCase().endsWith('.markdown'))) {
              const absoluteFilePath = normalizePath(`${dirPath}/${entry.name}`);
              newFiles.push({
                id: `file-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                name: entry.name,
                content: '',
                wordCount: 0,
                charCount: 0,
                updatedAt: Date.now(),
                folder: relativePath,
                filePath: absoluteFilePath,
                isDirty: false,
                isLoaded: false,
              });
            }
          }
        } catch (err: any) {
          errors.push(`Dir error (${dirPath}): ${err.message || err}`);
          console.error('Failed to read dir', err);
        }
      };

      await scanDirectory(workspacePath, '');

      if (newFiles.length > 0) {
        setFiles(newFiles);
        // Keep active file if it still exists
        const currentActive = useAppStore.getState().activeFileId;
        const oldFiles = useAppStore.getState().files;
        const oldActiveFile = oldFiles.find(f => f.id === currentActive);
        
        const stillExists = oldActiveFile ? newFiles.find(f => f.name === oldActiveFile.name && f.folder === oldActiveFile.folder) : null;
        if (stillExists) setActiveFileId(stillExists.id);
        else setActiveFileId(newFiles[0].id);
      } else {
        setFiles([]);
        setActiveFileId(null);
      }
      setFolders(Array.from(newFolders));
      setScanErrors(errors);
    } catch (e) {
      console.error('Workspace refresh failed:', e);
    }
  };

  // Drag & Drop handlers
  const handleGlobalDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleGlobalDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleGlobalDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  // --------------------------------------------------
  // 6. PDF EXPORT
  // --------------------------------------------------
  const handleExportPDF = () => {
    const prevMode = editorMode;
    // Ensure preview is visible for printing
    if (editorMode === 'edit') setEditorMode('preview');
    setTimeout(() => {
      window.print();
      // Restore mode after print dialog closes
      setTimeout(() => setEditorMode(prevMode), 500);
    }, 150);
  };

  // --------------------------------------------------
  // 7. DYNAMIC CUSTOM THEME UTILITIES
  // --------------------------------------------------
  const handleSaveCustomTheme = (theme: CSSTheme) => {
    setCustomThemes((prev) => {
      const exists = prev.some((t) => t.id === theme.id);
      if (exists) {
        return prev.map((t) => (t.id === theme.id ? theme : t));
      }
      return [...prev, theme];
    });
  };

  const handleDeleteCustomTheme = (id: string) => {
    setCustomThemes((prev) => prev.filter((t) => t.id !== id));
    if (activeThemeId === id) {
      setActiveThemeId('github-dark');
    }
  };

  // Estimate approximate document size in KB
  const activeFileSizeKB = useMemo(() => {
    if (!activeMarkdownFile) return '0.00';
    const bytes = new Blob([activeMarkdownFile.content]).size;
    return (bytes / 1024).toFixed(2);
  }, [activeMarkdownFile]);

  // --------------------------------------------------
  // 8. COMMAND PALETTE COMMANDS REGISTRY
  // --------------------------------------------------
  const commands = useMemo(() => [
    { id: 'new-file', label: 'New Draft File', icon: 'Plus', shortcut: 'Cmd+N', action: () => handleCreateNewFile() },
    { id: 'open-workspace', label: 'Open Workspace Folder', icon: 'Upload', shortcut: 'Cmd+O', action: handleOpenWorkspace },
    { id: 'save-file', label: 'Save File to Disk', icon: 'Save', shortcut: 'Cmd+S', action: handleSaveFile },
    { id: 'toggle-sidebar', label: 'Toggle File Sidebar', icon: 'Menu', shortcut: 'Cmd+B', action: () => setIsSidebarOpen((p) => !p) },
    { id: 'toggle-zen', label: 'Toggle Zen Mode', icon: 'Maximize2', shortcut: '', action: () => setIsZenMode((p) => !p) },
    { id: 'toggle-outline', label: 'Toggle Document Outline', icon: 'List', shortcut: 'Cmd+I', action: () => setIsOutlinePanelOpen((p) => !p) },
    { id: 'toggle-sync-scroll', label: `${isSyncScrollEnabled ? 'Disable' : 'Enable'} Sync Scroll`, icon: 'Columns', shortcut: '', action: () => setIsSyncScrollEnabled((p) => !p) },
    { id: 'toggle-theme', label: 'Toggle Dark / Light Theme', icon: 'Sun', shortcut: '', action: toggleThemeBrightnesses },
    { id: 'open-settings', label: 'Open Settings & Themes', icon: 'Settings', shortcut: '', action: () => setActiveModal('settings') },
    { id: 'mode-split', label: 'Set Split Screen Mode', icon: 'Columns', shortcut: '', action: () => setEditorMode('split') },
    { id: 'mode-edit', label: 'Set Edit Only Mode', icon: 'Code', shortcut: '', action: () => setEditorMode('edit') },
    { id: 'mode-preview', label: 'Set Preview Only Mode', icon: 'Eye', shortcut: '', action: () => setEditorMode('preview') },
  ], [isSyncScrollEnabled, activeMarkdownFile]);

  return (
    <div
      id="desktop-applet-frame"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
      className={`h-screen w-screen flex flex-col font-sans transition-colors duration-300 overflow-hidden ${themeInfo.appBg} ${themeInfo.text}`}
    >
      {/* Dynamic Theme CSS */}
      {/* Drag Over Overlay */}
      <AnimatePresence>
        {isDraggingFile && (
          <motion.div
            id="drag-dropzone-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-accent/60 backdrop-blur-md flex flex-col items-center justify-center p-6 border-4 border-dashed border-accent m-4 rounded-2xl"
          >
            <div className="p-4 bg-accent/80 rounded-full text-accent mb-4 shadow-lg animate-bounce">
              <Plus size={36} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Drop to Import
            </h1>
            <p className="text-sm text-accent max-w-sm text-center font-medium">
              Release your .md or .txt file to open it instantly.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------- 
          Title Bar
          -------------------------------------------------- */}
      {!isZenMode && (
        <header
          id="app-title-bar-header"
          className={`h-11 px-4 border-b shrink-0 flex items-center justify-between select-none transition-colors duration-300 ${themeInfo.headerBg} ${themeInfo.borderClass}`}
          data-tauri-drag-region
        >
          {/* Left — Breadcrumb */}
          <div className="flex items-center gap-3">
            <motion.button
              id="btn-sidebar-toggle-trigger"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors ${!isSidebarOpen ? 'text-accent' : 'text-neutral-400'}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              type="button"
              aria-label="Toggle sidebar"
            >
              <Menu size={16} />
            </motion.button>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              <span className="cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors" onClick={handleOpenWorkspace}>Fosgail</span>
              <ChevronRight size={10} />
              {activeMarkdownFile && activeMarkdownFile.folder && (
                <>
                  {activeMarkdownFile.folder.split('/').filter(Boolean).map((part, index) => (
                    <span key={index} className="flex items-center gap-1.5">
                      <span className="text-neutral-600 dark:text-neutral-300">{part}</span>
                      <ChevronRight size={10} />
                    </span>
                  ))}
                </>
              )}
              <span className="text-neutral-900 dark:text-white font-mono tracking-tight flex items-center gap-1.5">
                {activeMarkdownFile ? activeMarkdownFile.name : 'Welcome'}
                {activeMarkdownFile && activeMarkdownFile.isDirty && (
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-0.5" />
                )}
              </span>
            </div>
          </div>

          {/* Center — Mode toggles */}
          <div className="flex bg-neutral-200/60 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <motion.button
              id="btn-mode-edit-only"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setEditorMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                editorMode === 'edit'
                  ? 'bg-white dark:bg-neutral-800 text-accent dark:text-accent shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
              title="Raw code editor mode"
            >
              <Code size={13} />
              <span className="hidden md:inline">Write</span>
            </motion.button>
            <motion.button
              id="btn-mode-split-screen"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setEditorMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                editorMode === 'split'
                  ? 'bg-white dark:bg-neutral-800 text-accent dark:text-accent shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
              title="Split view (Cmd+M)"
            >
              <Columns size={13} />
              <span className="hidden md:inline">Split</span>
            </motion.button>
            <motion.button
              id="btn-mode-preview-only"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setEditorMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-white dark:bg-neutral-800 text-accent dark:text-accent shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
              title="Distraction free reading (Cmd+M)"
            >
              <Eye size={13} />
              <span className="hidden md:inline">Preview</span>
            </motion.button>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              id="btn-toggle-outline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-1.5 rounded-md transition-colors ${isOutlinePanelOpen ? 'bg-accent text-accent dark:bg-accent/20 dark:text-accent' : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}
              onClick={() => setIsOutlinePanelOpen(!isOutlinePanelOpen)}
              title="Document Outline"
              type="button"
            >
              <List size={16} />
            </motion.button>
            <motion.button
              id="btn-toggle-zen"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-1.5 rounded-md transition-colors text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800`}
              onClick={() => setIsZenMode(true)}
              title="Enter Zen Mode (Cmd+Esc)"
              type="button"
            >
              <Maximize2 size={16} />
            </motion.button>
          </div>
        </header>
      )}

      {/* -------------------------------------------------- 
          Main Workspace
          -------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative select-text" id="desktop-applet-body">
        {/* Left Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && !isZenMode && (
            <motion.div
              key="sidebar"
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="shrink-0 h-full"
            >
              <Sidebar
                files={files}
                activeFileId={activeFileId}
                isSidebarOpen={true}
                onSelectFile={handleSelectFile}
                onNewFile={handleCreateNewFile}
                onDeleteFile={handleDeleteFile}
                folders={folders}
                onAddFolder={handleAddFolder}
                onRemoveFolder={handleRemoveFolder}
                onShowShortcuts={() => setActiveModal('shortcuts')}
                onShowSettings={() => setActiveModal('settings')}
                onImportFile={handleOpenWorkspace}
                themeInfo={themeInfo}
                scanErrors={scanErrors}
                onRefreshWorkspace={handleRefreshWorkspace}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Tab Bar */}
          {!isZenMode && (
            <TabBar
              files={files}
              recentlyViewedIds={recentlyViewedIds}
              activeFileId={activeFileId}
              onSelectFile={handleSelectFile}
              onCloseTab={handleCloseTab}
              themeInfo={themeInfo}
            />
          )}

          {/* Editor + Preview Pane */}
          <div className={`flex-1 flex divide-x ${themeInfo.isDark ? 'divide-white/5' : 'divide-neutral-200'} min-w-0 overflow-hidden relative`}>
            {activeMarkdownFile ? (
            <>
              {/* Write Mode */}
              {(editorMode === 'edit' || editorMode === 'split') && (
                <div className="flex-1 min-w-[300px] h-full flex flex-col overflow-hidden">
                  <EditorArea
                    value={activeMarkdownFile.content}
                    onChange={handleEditorContentChange}
                    fileName={activeMarkdownFile.name}
                    onRename={handleRenameActiveFile}
                    fontSize={editorFontSize}
                    onFontSizeChange={(size) => setEditorFontSize(size)}
                    onSaveFile={handleSaveFile}
                    wordWrap={wordWrap}
                    onToggleWordWrap={() => setWordWrap((w) => !w)}
                    themeInfo={themeInfo}
                    folders={folders}
                    activeFileFolder={activeMarkdownFile.folder || ''}
                    onMoveFile={(folderPath) => handleMoveFileFolder(activeMarkdownFile.id, folderPath)}
                    isSyncScrollEnabled={isSyncScrollEnabled}
                    syncScrollPercent={isSyncScrollEnabled && editorMode === 'split' ? syncScrollPercent : null}
                    onSyncScroll={handleSyncScroll}
                  />
                </div>
              )}

              {/* Preview Mode */}
              {(editorMode === 'preview' || editorMode === 'split') && (
                <div className={`flex-1 min-w-[300px] h-full flex flex-col overflow-hidden relative ${themeInfo.isDark ? 'bg-[#111113]' : 'bg-white'}`}>
                  <MarkdownOutput
                    content={activeMarkdownFile.content}
                    theme={activeTheme}
                    syncScrollPercent={isSyncScrollEnabled && editorMode === 'split' ? syncScrollPercent : null}
                    onSyncScroll={isSyncScrollEnabled && editorMode === 'split' ? handleSyncScroll : undefined}
                    onNavigate={handleNavigate}
                  />
                  {/* Floating Outline Panel */}
                  <AnimatePresence>
                    {isOutlinePanelOpen && (
                      <OutlinePanel
                        content={activeMarkdownFile.content}
                        themeInfo={themeInfo}
                        onClose={() => setIsOutlinePanelOpen(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
            ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div id="no-active-docs-prompt" className="p-5 bg-accent/10 text-accent rounded-2xl border border-accent/20 mb-5 shadow-inner">
                  <FileCode size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-base font-bold tracking-tight text-neutral-800 dark:text-neutral-200 mb-1">
                  No document open
                </h2>
                <p className="text-xs text-neutral-500 max-w-xs mt-1 mb-6 leading-relaxed">
                  Open a workspace folder to browse your markdown files, or create a new draft to start writing.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    id="btn-workspace-blank-create"
                    type="button"
                    onClick={() => handleCreateNewFile()}
                    className="px-4 py-2 font-semibold text-xs text-white rounded-lg bg-accent hover:bg-accent cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    New Draft
                  </button>
                  <button
                    id="btn-workspace-open"
                    type="button"
                    onClick={handleOpenWorkspace}
                    className="px-4 py-2 font-semibold text-xs text-neutral-700 dark:text-neutral-300 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer active:scale-95 transition-all"
                  >
                    Open Workspace
                  </button>
                </div>

                {/* Workspace stats */}
                {files.length > 0 && (
                  <div className="mt-8 flex items-center gap-4 text-[11px] text-neutral-400 font-mono">
                    <span>{files.length} files loaded</span>
                    <span>•</span>
                    <span>{files.reduce((a, f) => a + f.wordCount, 0).toLocaleString()} total words</span>
                  </div>
                )}
              </motion.div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- 
          Modal System
          -------------------------------------------------- */}
      <AnimatePresence>
        {activeModal !== null && (
          <div
            id="applet-modal-backdrop"
            className="absolute inset-0 z-40 bg-neutral-900/60 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              id={`modal-${activeModal}-container`}
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl rounded-2xl shadow-2xl bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
              style={{ maxHeight: 'calc(100vh - 48px)' }}
            >
              {/* Modal Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-zinc-900/40 border-neutral-200 dark:border-neutral-800/80">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                  {activeModal === 'shortcuts' && 'Help & Key Bindings'}
                  {activeModal === 'command-palette' && 'Command Palette'}
                  {activeModal === 'theme-editor' && (
                    <button
                      onClick={() => setActiveModal('settings')}
                      className="text-accent hover:text-accent font-bold hover:underline cursor-pointer mr-2 flex items-center transition-colors"
                      type="button"
                    >
                      ← Back to Settings
                    </button>
                  )}
                  {activeModal === 'theme-editor' && 'Custom Theme Compiler'}
                  {activeModal === 'settings' && 'App Settings & Themes'}
                </div>
                <button
                  id="btn-close-active-modal"
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer transition-colors"
                  aria-label="Close modal"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950/70">
                {activeModal === 'shortcuts' && <KeyboardShortcuts />}
                {activeModal === 'command-palette' && (
                  <CommandPalette
                    files={files}
                    recentlyViewedIds={recentlyViewedIds}
                    commands={commands}
                    themeInfo={themeInfo}
                    onSelectFile={(id) => { handleSelectFile(id); setActiveModal(null); }}
                    onClose={() => setActiveModal(null)}
                  />
                )}
                {activeModal === 'theme-editor' && (
                  <ThemeEditor
                    customThemes={customThemes}
                    activeThemeId={activeThemeId}
                    onSaveTheme={handleSaveCustomTheme}
                    onDeleteTheme={handleDeleteCustomTheme}
                    onSelectTheme={setActiveThemeId}
                  />
                )}
                {activeModal === 'settings' && (
                  <SettingsModal
                    themes={combinedThemes}
                    activeThemeId={activeThemeId}
                    onSelectTheme={setActiveThemeId}
                    fontSize={editorFontSize}
                    onFontSizeChange={(size) => setEditorFontSize(size)}
                    wordWrap={wordWrap}
                    onToggleWordWrap={() => setWordWrap((w) => !w)}
                    onShowThemeEditor={() => setActiveModal('theme-editor')}
                    themeInfo={themeInfo}
                    isSyncScrollEnabled={isSyncScrollEnabled}
                    onToggleSyncScroll={() => setIsSyncScrollEnabled((p) => !p)}
                    isAutoSaveEnabled={isAutoSaveEnabled}
                    onToggleAutoSave={() => setIsAutoSaveEnabled((p) => !p)}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------- 
          Status Bar
          -------------------------------------------------- */}
      {!isZenMode && (
        <footer
          id="applet-status-bar"
          className={`h-7 px-4 border-t select-none shrink-0 text-[10px] font-mono flex items-center justify-between transition-colors duration-300 ${themeInfo.footerBg} ${themeInfo.borderClass} text-neutral-500`}
        >
          <div className="flex items-center gap-2.5 sm:gap-4 overflow-hidden">
            {/* Workspace path or app name */}
            <div className="flex items-center gap-1.5 font-semibold shrink-0 text-neutral-400 dark:text-neutral-500 truncate max-w-[200px]" title={workspacePath || 'No workspace'}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span className="truncate">{workspacePath ? workspacePath.split('/').pop() : 'Fosgail'}</span>
            </div>
            <span>•</span>
            {/* Save status */}
            {saveStatus === 'saving' ? (
              <div className="flex items-center gap-1.5 text-amber-500 font-bold animate-pulse shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>SAVING...</span>
              </div>
            ) : (
              <div className={`flex items-center gap-1.5 shrink-0 font-semibold ${activeMarkdownFile?.isDirty ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeMarkdownFile?.isDirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span>{activeMarkdownFile?.isDirty ? 'UNSAVED' : 'SAVED'}</span>
              </div>
            )}
            <span>•</span>
            <span className="font-semibold uppercase text-neutral-400 shrink-0 hidden sm:inline">
              {editorMode === 'split' ? 'Split' : editorMode === 'edit' ? 'Write' : 'Preview'}
            </span>
          </div>

          {activeMarkdownFile ? (
            <div className="flex items-center gap-4">
              <span>Size: <strong>{activeFileSizeKB} KB</strong></span>
              <span>•</span>
              <span>Words: <strong>{activeMarkdownFile.wordCount.toLocaleString()}</strong></span>
              <span>•</span>
              <span className="hidden sm:inline">Theme: <strong>{activeTheme.name}</strong></span>
            </div>
          ) : (
            <span>{files.length > 0 ? `${files.length} files in workspace` : 'No documents loaded'}</span>
          )}
        </footer>
      )}

      {/* Zen Mode exit button */}
      {isZenMode && (
        <button
          id="btn-exit-zen-floating"
          type="button"
          onClick={() => setIsZenMode(false)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 bg-white/95 dark:bg-zinc-900/95 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Exit Zen Mode (Escape)"
        >
          <Minimize2 size={12} className="text-accent" />
          <span>Exit Zen</span>
          <kbd className="px-1 py-0.5 ml-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[9px] rounded font-mono text-neutral-400">
            Esc
          </kbd>
        </button>
      )}
    </div>
  );
}
