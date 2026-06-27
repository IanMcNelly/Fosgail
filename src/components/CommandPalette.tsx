/**
 * CommandPalette — unified Cmd+K spotlight.
 * Two modes:
 *   - File mode (default): fuzzy search by name + content
 *   - Command mode (prefix ">"): trigger app actions
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { MarkdownFile } from '../types';
import {
  Search, FileText, ChevronRight, CornerDownLeft,
  Terminal, Zap, Clock
} from 'lucide-react';

export interface AppCommand {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

interface FileResult {
  type: 'file';
  file: MarkdownFile;
  matchType: 'title' | 'content' | 'recent';
  snippet?: string;
}

interface CommandResult {
  type: 'command';
  command: AppCommand;
}

type Result = FileResult | CommandResult;

interface CommandPaletteProps {
  files: MarkdownFile[];
  recentlyViewedIds: string[];
  commands: AppCommand[];
  themeInfo: {
    isDark: boolean;
    borderClass: string;
  };
  onSelectFile: (id: string) => void;
  onClose: () => void;
}

export default function CommandPalette({
  files,
  recentlyViewedIds,
  commands,
  themeInfo,
  onSelectFile,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Determine mode from query prefix
  const isCommandMode = query.startsWith('>');
  const searchTerm = isCommandMode ? query.slice(1).trim().toLowerCase() : query.trim().toLowerCase();

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Compute results
  const results = useMemo<Result[]>(() => {
    if (isCommandMode) {
      // Command mode
      return commands
        .filter((cmd) => !searchTerm || cmd.label.toLowerCase().includes(searchTerm))
        .map((cmd) => ({ type: 'command' as const, command: cmd }));
    }

    if (!searchTerm) {
      // Show recently viewed files first, then the rest
      const recentFiles = recentlyViewedIds
        .map((id) => files.find((f) => f.id === id))
        .filter(Boolean) as MarkdownFile[];
      const otherFiles = files.filter((f) => !recentlyViewedIds.includes(f.id));
      return [
        ...recentFiles.map((f) => ({ type: 'file' as const, file: f, matchType: 'recent' as const })),
        ...otherFiles.map((f) => ({ type: 'file' as const, file: f, matchType: 'title' as const })),
      ];
    }

    // File search — name first, then content
    const nameMatches: FileResult[] = [];
    const contentMatches: FileResult[] = [];

    for (const f of files) {
      if (f.name.toLowerCase().includes(searchTerm)) {
        nameMatches.push({ type: 'file', file: f, matchType: 'title' });
        continue;
      }
      const idx = f.content.toLowerCase().indexOf(searchTerm);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(f.content.length, idx + searchTerm.length + 50);
        let snippet = f.content.substring(start, end).replace(/\n/g, ' ');
        if (start > 0) snippet = '…' + snippet;
        if (end < f.content.length) snippet += '…';
        contentMatches.push({ type: 'file', file: f, matchType: 'content', snippet });
      }
    }

    return [...nameMatches, ...contentMatches];
  }, [query, files, commands, recentlyViewedIds, isCommandMode, searchTerm]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[selectedIndex];
      if (!item) return;
      if (item.type === 'file') {
        onSelectFile(item.file.id);
      } else {
        item.command.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleSelect = (item: Result) => {
    if (item.type === 'file') {
      onSelectFile(item.file.id);
    } else {
      item.command.action();
      onClose();
    }
  };

  return (
    <div className="flex flex-col" style={{ maxHeight: '520px' }}>
      {/* Search Input */}
      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
            {isCommandMode ? <Terminal size={15} /> : <Search size={15} />}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isCommandMode ? 'Type a command...' : 'Search files, or type > for commands'}
            className={`w-full pl-9 pr-12 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 border transition-all ${
              themeInfo.isDark
                ? 'bg-white/5 border-white/10 text-neutral-100 placeholder-neutral-600'
                : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'
            }`}
          />
          {/* Mode hint badge */}
          <div className="absolute inset-y-0 right-3 flex items-center">
            {isCommandMode ? (
              <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 uppercase tracking-wide">
                CMD
              </span>
            ) : (
              <span className="text-[9px] font-bold text-neutral-400 bg-neutral-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wide">
                FILE
              </span>
            )}
          </div>
        </div>

        {/* Mode hint */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500">
          <span>
            {isCommandMode
              ? `${results.length} command${results.length !== 1 ? 's' : ''}`
              : searchTerm
              ? `${results.length} result${results.length !== 1 ? 's' : ''}`
              : `${files.length} files — type to search`}
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-[9px] font-mono">↑↓</kbd>
            <span>navigate</span>
            <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-[9px] font-mono">↵</kbd>
            <span>open</span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className={`h-px mx-4 mb-2 ${themeInfo.isDark ? 'bg-white/6' : 'bg-neutral-200'}`} />

      {/* Results list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 min-h-0">
        {results.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-400">
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium">No results found</div>
            <div className="text-xs mt-1 text-neutral-500">
              {isCommandMode ? 'Try a different command name' : 'Try a different keyword or type > to search commands'}
            </div>
          </div>
        ) : (
          <div ref={listRef} className="space-y-0.5">
            {/* Section headers */}
            {!isCommandMode && !searchTerm && recentlyViewedIds.length > 0 && (
              <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                <Clock size={9} />
                Recent
              </div>
            )}

            {results.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              // Section divider between recent and all files when no query
              const prevItem = results[idx - 1];
              const showAllSection =
                !isCommandMode &&
                !searchTerm &&
                idx > 0 &&
                prevItem?.type === 'file' &&
                prevItem.matchType === 'recent' &&
                item.type === 'file' &&
                item.matchType === 'title';

              return (
                <div key={idx}>
                  {showAllSection && (
                    <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5 mt-1">
                      <FileText size={9} />
                      All Files
                    </div>
                  )}

                  <div
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-accent text-white'
                        : themeInfo.isDark
                        ? 'hover:bg-white/6 text-neutral-300'
                        : 'hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {item.type === 'file' ? (
                      <FileResultRow result={item} isSelected={isSelected} themeInfo={themeInfo} />
                    ) : (
                      <CommandResultRow result={item} isSelected={isSelected} />
                    )}

                    {/* Enter hint */}
                    <div className={`shrink-0 ml-3 text-[9px] font-mono px-1.5 py-0.5 border rounded flex items-center gap-0.5 transition-opacity ${
                      isSelected
                        ? 'border-accent/40 text-accent opacity-100'
                        : 'border-neutral-300/30 text-neutral-400 opacity-0 group-hover:opacity-100'
                    }`}>
                      <CornerDownLeft size={8} />
                      <span>↵</span>
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

// Sub-component for a file result row
function FileResultRow({
  result,
  isSelected,
  themeInfo,
}: {
  result: FileResult;
  isSelected: boolean;
  themeInfo: { isDark: boolean };
}) {
  const { file, matchType, snippet } = result;

  return (
    <div className="flex items-center gap-2.5 min-w-0 flex-1">
      <div className={`p-1.5 rounded-lg shrink-0 ${
        isSelected
          ? 'bg-accent text-white'
          : themeInfo.isDark
          ? 'bg-neutral-900 text-accent'
          : 'bg-neutral-200 text-neutral-600'
      }`}>
        <FileText size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold leading-tight truncate">{file.name}</span>
          {matchType === 'recent' && (
            <span className={`text-[8px] font-mono font-bold uppercase px-1 py-0.5 rounded leading-none shrink-0 ${
              isSelected ? 'bg-accent text-accent' : 'bg-neutral-200/60 dark:bg-white/8 text-neutral-400'
            }`}>
              Recent
            </span>
          )}
          {matchType === 'content' && (
            <span className={`text-[8px] font-mono font-bold uppercase px-1 py-0.5 rounded leading-none shrink-0 ${
              isSelected ? 'bg-accent text-accent' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
              Content
            </span>
          )}
        </div>
        {matchType === 'content' && snippet && (
          <div className={`text-[10px] font-mono mt-1 p-1.5 rounded leading-normal truncate ${
            isSelected ? 'text-accent bg-accent/40' : themeInfo.isDark ? 'text-neutral-500 bg-black/30' : 'text-neutral-500 bg-neutral-100'
          }`}>
            {snippet}
          </div>
        )}
        {file.folder && (
          <div className={`text-[9px] font-mono mt-0.5 flex items-center gap-0.5 ${
            isSelected ? 'text-accent' : 'text-neutral-400'
          }`}>
            <span>{file.folder}</span>
            <ChevronRight size={8} />
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for a command result row
function CommandResultRow({
  result,
  isSelected,
}: {
  result: CommandResult;
  isSelected: boolean;
}) {
  const { command } = result;

  return (
    <div className="flex items-center gap-2.5 flex-1">
      <div className={`p-1.5 rounded-lg shrink-0 ${
        isSelected ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
      }`}>
        <Zap size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold">{command.label}</span>
      </div>
      {command.shortcut && (
        <kbd className={`shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded border ${
          isSelected
            ? 'bg-accent border-accent/40 text-accent'
            : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'
        }`}>
          {command.shortcut}
        </kbd>
      )}
    </div>
  );
}
