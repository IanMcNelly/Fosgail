/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { MarkdownFile } from '../types';
import { Search, FileText, ChevronRight, CornerDownLeft, Sparkles } from 'lucide-react';

interface QuickSearchModalProps {
  files: MarkdownFile[];
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

interface MatchResult {
  file: MarkdownFile;
  matchType: 'title' | 'content';
  snippet?: string;
}

export default function QuickSearchModal({
  files,
  themeInfo,
  onSelectFile,
  onClose,
}: QuickSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Search results incorporating both filename matches and internal contents
  const searchResults: MatchResult[] = [];

  if (searchQuery.trim() === '') {
    // Return all files initially
    files.forEach(f => {
      searchResults.push({ file: f, matchType: 'title' });
    });
  } else {
    const query = searchQuery.toLowerCase().trim();
    files.forEach(f => {
      const nameMatch = f.name.toLowerCase().includes(query);
      if (nameMatch) {
        searchResults.push({ file: f, matchType: 'title' });
      } else {
        // Search content snippet
        const contentIndex = f.content.toLowerCase().indexOf(query);
        if (contentIndex !== -1) {
          // Extract snippet
          const start = Math.max(0, contentIndex - 30);
          const end = Math.min(f.content.length, contentIndex + query.length + 40);
          let snippet = f.content.substring(start, end).replace(/\n/g, ' ');
          if (start > 0) snippet = '...' + snippet;
          if (end < f.content.length) snippet = snippet + '...';

          searchResults.push({
            file: f,
            matchType: 'content',
            snippet,
          });
        }
      }
    });
  }

  // Handle auto-bounds
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
      setSelectedIndex(prev => (prev + 1) % Math.max(searchResults.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % Math.max(searchResults.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        onSelectFile(searchResults[selectedIndex].file.id);
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
          <span className="text-[10px] font-bold text-emerald-500 font-mono tracking-wider uppercase flex items-center gap-1">
            <Sparkles size={10} />
            Quick Open File (Cmd+P)
          </span>
          <span className="text-[9px] text-neutral-400 font-mono">
            Searches document names and contents
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
            placeholder="Search by file title or markdown content..."
            className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 ${
              themeInfo.isDark ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-neutral-200'
            }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {searchResults.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400 italic">
            No matching documents found. Try creating a draft folder or changing keywords!
          </div>
        ) : (
          <div ref={listRef} className="space-y-1">
            {searchResults.map((result, idx) => {
              const isSelected = idx === selectedIndex;
              const { file, matchType, snippet } = result;

              return (
                <div
                  key={`${file.id}-${idx}`}
                  onClick={() => {
                    onSelectFile(file.id);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : themeInfo.isDark
                      ? 'hover:bg-neutral-800/80 text-neutral-300'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`p-1.5 rounded shrink-0 ${
                      isSelected 
                        ? 'bg-emerald-700 text-white' 
                        : themeInfo.isDark 
                        ? 'bg-neutral-900 text-emerald-400' 
                        : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      <FileText size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold leading-tight truncate">
                          {file.name}
                        </span>
                        {matchType === 'content' && (
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded leading-none shrink-0 ${
                            isSelected 
                              ? 'bg-emerald-800 text-white' 
                              : 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            Content Match
                          </span>
                        )}
                        {matchType === 'title' && searchQuery.trim() !== '' && (
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded leading-none shrink-0 ${
                            isSelected 
                              ? 'bg-emerald-800 text-white' 
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}>
                            Title Match
                          </span>
                        )}
                      </div>
                      
                      {matchType === 'content' && snippet && (
                        <div className={`text-[10px] font-mono mt-1 break-all p-1.5 rounded leading-normal ${
                          isSelected 
                            ? 'bg-emerald-805 text-emerald-100' 
                            : themeInfo.isDark 
                            ? 'bg-black/35 text-neutral-400' 
                            : 'bg-neutral-150 text-neutral-500'
                        }`}>
                          {snippet}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side folder path breadcrumbs */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {file.folder ? (
                      <div className={`text-[10px] font-mono flex items-center gap-0.5 ${
                        isSelected ? 'text-emerald-100/80' : 'text-neutral-400'
                      }`}>
                        <span>{file.folder}</span>
                        <ChevronRight size={10} />
                      </div>
                    ) : (
                      <span className={`text-[9.5px] font-mono italic ${
                        isSelected ? 'text-emerald-200' : 'text-neutral-500'
                      }`}>
                        Root
                      </span>
                    )}

                    <div className={`text-[10px] font-mono px-2 py-0.5 border rounded-md transition-colors flex items-center gap-0.5 shrink-0 ${
                      isSelected 
                        ? 'bg-emerald-700/80 text-emerald-100 border-emerald-500/30' 
                        : 'text-neutral-400 border-neutral-300/20 group-hover:flex hidden'
                    }`}>
                      <CornerDownLeft size={8} />
                      <span>Enter</span>
                    </div>
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
