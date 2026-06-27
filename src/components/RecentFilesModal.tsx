/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { MarkdownFile } from '../types';
import { FileText, Clock, Search, Folder, ChevronRight, X } from 'lucide-react';

interface RecentFilesModalProps {
  files: MarkdownFile[];
  recentlyViewedIds: string[];
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
  onSelectFile: (id: string) => void;
  onClose: () => void;
}

export default function RecentFilesModal({
  files,
  recentlyViewedIds,
  themeInfo,
  onSelectFile,
  onClose,
}: RecentFilesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter recentlyViewedIds to ensure they still exist in current files list
  const recentFiles = recentlyViewedIds
    .map(id => files.find(f => f.id === id))
    .filter((f): f is MarkdownFile => !!f);

  // If there are no recent files but there are general files, fallback to some files
  const fallbackFiles = recentFiles.length > 0 ? recentFiles : files.slice(0, 8);

  // Filter based on search query
  const filteredFiles = fallbackFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.folder || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ensure selected index is within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle focus
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(filteredFiles.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredFiles.length) % Math.max(filteredFiles.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFiles[selectedIndex]) {
        onSelectFile(filteredFiles[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="p-4 flex flex-col h-full max-h-[480px]">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-accent font-mono tracking-wider uppercase">
            RubyMine Recent Files (Cmd+E)
          </span>
          <span className="text-[9px] text-neutral-400 font-mono">
            Use ↑↓ to select, Enter to open
          </span>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
            <Search size={14} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type file name or folder to filter..."
            className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-accent text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 ${
              themeInfo.isDark ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-neutral-200'
            }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400 italic">
            No matching recent files found.
          </div>
        ) : (
          <div ref={listRef} className="space-y-1">
            {filteredFiles.map((file, idx) => {
              const isSelected = idx === selectedIndex;
              const formattedDate = new Date(file.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    onSelectFile(file.id);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-accent text-white'
                      : themeInfo.isDark
                      ? 'hover:bg-neutral-800/80 text-neutral-300'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded ${
                      isSelected 
                        ? 'bg-accent text-white' 
                        : themeInfo.isDark 
                        ? 'bg-neutral-900 text-accent' 
                        : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      <FileText size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold leading-tight truncate">
                          {file.name}
                        </span>
                        {file.folder && (
                          <span className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium ${
                            isSelected 
                              ? 'bg-accent text-accent' 
                              : themeInfo.isDark 
                              ? 'bg-zinc-900 text-neutral-400' 
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            <Folder size={9} />
                            {file.folder}
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] leading-tight mt-0.5 flex items-center gap-1.5 ${
                        isSelected ? 'text-accent' : 'text-neutral-500'
                      }`}>
                        <Clock size={10} />
                        <span>Opened {formattedDate}</span>
                        <span>•</span>
                        <span>{Math.max(1, Math.round(file.content.length / 1024))} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className={`text-[10px] font-mono shrink-0 px-2 py-0.5 border rounded-md transition-colors ${
                    isSelected 
                      ? 'bg-accent/80 text-accent border-accent/30' 
                      : 'text-neutral-400 border-neutral-300/20 group-hover:block hidden'
                  }`}>
                    Enter
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
