/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { MarkdownFile } from '../types';
import { 
  FileText, Plus, Search, HelpCircle, Upload, Settings, BookOpen
} from 'lucide-react';
import FileTree from './FileTree';

interface SidebarProps {
  files: MarkdownFile[];
  activeFileId: string | null;
  isSidebarOpen: boolean;
  onSelectFile: (id: string) => void;
  onNewFile: (folder?: string) => void;
  onDeleteFile: (id: string) => void;
  onImportFile: () => void;
  themeInfo: {
    appBg: string;
    sidebarBg: string;
    cardBg: string;
    text: string;
    isDark: boolean;
    headerBg: string;
    footerBg: string;
    editorBg: string;
    borderClass: string;
    activeFileBg: string;
    gutterBg: string;
  };
  // Directory layout management props
  folders: string[];
  onAddFolder: (folderPath: string) => void;
  onRemoveFolder: (folderPath: string) => void;
  onShowShortcuts: () => void;
  onShowSettings: () => void;
  scanErrors?: string[];
  onRefreshWorkspace: () => void;
}

export default function Sidebar({
  files,
  activeFileId,
  isSidebarOpen,
  onSelectFile,
  onNewFile,
  onDeleteFile,
  onImportFile,
  themeInfo,
  folders,
  onAddFolder,
  onRemoveFolder,
  onShowShortcuts,
  onShowSettings,
  scanErrors,
  onRefreshWorkspace,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isSidebarOpen) return null; // kept for safety

  return (
    <div 
      id="desktop-sidebar-rail"
      className={`w-64 border-r overflow-y-auto shrink-0 flex flex-col h-full transition-all duration-300 ${themeInfo.sidebarBg}`}
    >



      {/* Search Input bar */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <label className="relative block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-neutral-400">
            <Search size={12} />
          </span>
          <input
            id="input-sidebar-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            aria-label="Search documents"
            className={`w-full pl-7 pr-3 py-1 border rounded-md text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 ${
              themeInfo.isDark ? 'bg-[#0F0F11] border-white/5' : 'bg-neutral-100/50 border-neutral-200'
            }`}
          />
        </label>
      </div>

      {/* Folders and Files Tree Navigation Pane */}
      <div className="flex-1 p-3 overflow-y-auto min-h-0 flex flex-col">
        <FileTree
          files={files}
          activeFileId={activeFileId}
          folders={folders}
          onSelectFile={onSelectFile}
          onNewFile={onNewFile}
          onDeleteFile={onDeleteFile}
          onAddFolder={onAddFolder}
          onRemoveFolder={onRemoveFolder}
          themeInfo={themeInfo}
          searchQuery={searchQuery}
          scanErrors={scanErrors}
          onRefreshWorkspace={onRefreshWorkspace}
        />
      </div>

      {/* Footer Settings & Help Panels */}
      <div className={`p-3 shrink-0 border-t ${themeInfo.isDark ? 'bg-[#18181B]' : 'bg-neutral-100/50'} ${themeInfo.borderClass} space-y-1 flex flex-col`}>
        <motion.button
          id="btn-sidebar-settings-panel"
          type="button"
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowSettings}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="App Settings and Themes"
        >
          <Settings size={13} className="text-pink-500" />
          <span className="font-semibold">App Settings & Themes</span>
        </motion.button>
        <motion.button
          id="btn-sidebar-short-panel"
          type="button"
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowShortcuts}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Keyboard Shortcuts"
        >
          <HelpCircle size={13} className="text-amber-500" />
          <span className="font-semibold">Keyboard Shortcuts</span>
        </motion.button>
      </div>
    </div>
  );
}
