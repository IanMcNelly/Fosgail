/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Bold, Italic, Link, List, CheckSquare, 
  Code, Table, Heading1, ZoomIn, ZoomOut, Save,
  ChevronRight, Search, X, ArrowDown, ArrowUp
} from 'lucide-react';

interface EditorAreaProps {
  value: string;
  onChange: (val: string) => void;
  fileName: string;
  onRename: (newName: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onSaveFile: () => void;
  wordWrap: boolean;
  onToggleWordWrap: () => void;
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
  folders: string[];
  activeFileFolder: string;
  onMoveFile: (folderPath: string) => void;
  isSyncScrollEnabled: boolean;
  /** When set, sync scroll to this percentage */
  syncScrollPercent: number | null;
  /** Fires with scroll percentage (0–1) when sync scroll is active */
  onSyncScroll: (pct: number) => void;
}

export default function EditorArea({
  value,
  onChange,
  fileName,
  onRename,
  fontSize,
  onFontSizeChange,
  onSaveFile,
  wordWrap,
  onToggleWordWrap,
  themeInfo,
  folders,
  activeFileFolder,
  onMoveFile,
  isSyncScrollEnabled,
  syncScrollPercent,
  onSyncScroll,
}: EditorAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isSyncingRef = useRef(false);

  // Global search shortcut
  useEffect(() => {
    const handleSearchShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => document.getElementById('editor-search-input')?.focus(), 50);
      }
    };
    document.addEventListener('keydown', handleSearchShortcut);
    return () => document.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  const handleFindNext = (direction: 'next' | 'prev' = 'next') => {
    if (!textareaRef.current || !searchQuery) return;
    const text = textareaRef.current.value;
    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    
    const currentPos = direction === 'next' ? textareaRef.current.selectionEnd : textareaRef.current.selectionStart - 1;
    let nextIndex = -1;

    if (direction === 'next') {
      nextIndex = lowerText.indexOf(lowerQuery, currentPos);
      if (nextIndex === -1) nextIndex = lowerText.indexOf(lowerQuery, 0); // loop
    } else {
      nextIndex = lowerText.lastIndexOf(lowerQuery, currentPos);
      if (nextIndex === -1) nextIndex = lowerText.lastIndexOf(lowerQuery, lowerText.length); // loop
    }
    
    if (nextIndex !== -1) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(nextIndex, nextIndex + searchQuery.length);
    }
  };

  const [localFileName, setLocalFileName] = useState(fileName);

  useEffect(() => {
    setLocalFileName(fileName);
  }, [fileName]);

  // Synchronize scrolling between code textarea and line numbers gutter,
  // and emit scroll percentage for split-screen sync
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    if (isSyncScrollEnabled && textareaRef.current) {
      const el = textareaRef.current;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        onSyncScroll(el.scrollTop / maxScroll);
      }
    }
  };

  useEffect(() => {
    if (syncScrollPercent === null) return;
    const el = textareaRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) return;
    
    const currentPercent = el.scrollTop / maxScroll;
    if (Math.abs(currentPercent - syncScrollPercent) > 0.01) {
      isSyncingRef.current = true;
      el.scrollTop = syncScrollPercent * maxScroll;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = el.scrollTop;
      }
    }
  }, [syncScrollPercent]);

  // Generate line numbers Array
  // ⚡ Bolt Optimization: Calculate line count iteratively to avoid large string splitting
  // which causes heavy garbage collection pauses on large files during rapid typing.
  const lineCount = useMemo(() => {
    let count = 1;
    for (let i = 0; i < value.length; i++) {
      if (value.charCodeAt(i) === 10) { // 10 is the ASCII code for '\n'
        count++;
      }
    }
    return count;
  }, [value]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);
  }, [lineCount]);

  // Helper formatting injectors
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Traps keyboard tab clicks
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      if (start === end && !e.shiftKey) {
        // Insert 2 spaces at cursor
        const newValue = text.substring(0, start) + '  ' + text.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        }, 0);
      } else {
        // Multi-line indent / un-indent
        let lineStart = start;
        while (lineStart > 0 && text[lineStart - 1] !== '\n') {
          lineStart--;
        }
        
        const prefix = text.substring(0, lineStart);
        const selectedLinesText = text.substring(lineStart, end);
        const suffix = text.substring(end);
        
        let newSelectionEnd = end;
        let newSelectionStart = start;
        
        const lines = selectedLinesText.split('\n');
        const modifiedLines = lines.map((line, idx) => {
          if (e.shiftKey) {
            // Un-indent (remove up to 2 leading spaces)
            if (line.startsWith('  ')) {
              newSelectionEnd -= 2;
              if (idx === 0 && newSelectionStart > lineStart) newSelectionStart = Math.max(lineStart, newSelectionStart - 2);
              return line.substring(2);
            } else if (line.startsWith(' ') || line.startsWith('\t')) {
              newSelectionEnd -= 1;
              if (idx === 0 && newSelectionStart > lineStart) newSelectionStart = Math.max(lineStart, newSelectionStart - 1);
              return line.substring(1);
            }
            return line;
          } else {
            // Indent
            newSelectionEnd += 2;
            if (idx === 0 && newSelectionStart > lineStart) newSelectionStart += 2;
            return '  ' + line;
          }
        });
        
        const modifiedText = modifiedLines.join('\n');
        const newValue = prefix + modifiedText + suffix;
        onChange(newValue);
        
        setTimeout(() => {
          textarea.setSelectionRange(
            e.shiftKey && start === end ? newSelectionStart : (start === end ? start : newSelectionStart),
            newSelectionEnd
          );
        }, 0);
      }
      return;
    }

      // If escape is pressed and search is open, close it
      if (e.key === 'Escape' && showSearch) {
        e.preventDefault();
        setShowSearch(false);
        textarea.focus();
        return;
      }

      // Auto close delimiters: brackets, asterisks, etc.
    const pairs: Record<string, string> = {
      '[': ']',
      '{': '}',
      '(': ')',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (pairs[e.key] !== undefined) {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const char = e.key;
      const closingChar = pairs[char];

      const selectedText = text.substring(start, end);
      const newValue = text.substring(0, start) + char + selectedText + closingChar + text.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
      }, 0);
    }
  };

  const handleBlurRename = () => {
    const trimmed = localFileName.trim();
    if (!trimmed) {
      setLocalFileName(fileName); // Revert if empty
      return;
    }
    const hasValidExt = /\.(md|mdx|txt|markdown)$/i.test(trimmed);
    const finalName = hasValidExt ? trimmed : `${trimmed}.md`;
    if (finalName !== fileName) {
      // Delegate duplicate check to App.tsx — if rejected, the prop won't update
      // and the useEffect below will reset localFileName on next render
      onRename(finalName);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300 ${themeInfo.editorBg}`} id="workspace-markdown-editor">
      {/* Editor Sub header action row */}
      <div className={`px-3 py-1.5 border-b ${themeInfo.borderClass} ${themeInfo.headerBg} flex items-center justify-between shrink-0 select-none`}>
        {/* Name input */}
        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          <input
            id="input-editor-filename"
            type="text"
            value={localFileName}
            onChange={(e) => setLocalFileName(e.target.value)}
            onBlur={handleBlurRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            className={`text-xs font-semibold px-2 py-1 max-w-[160px] md:max-w-[240px] border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-neutral-800 dark:text-neutral-200 truncate ${
              themeInfo.isDark ? 'bg-black/30 border-white/5' : 'bg-neutral-100 border-neutral-200/50'
            }`}
            title="Click to rename document"
          />

          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline select-none">Folder:</span>
          <select
            id="select-editor-category"
            value={activeFileFolder}
            onChange={(e) => onMoveFile(e.target.value)}
            className={`text-[10.5px] font-semibold px-2 py-1 max-w-[130px] rounded-md border focus:outline-none cursor-pointer ${
              themeInfo.isDark ? 'bg-black/40 border-white/5 text-accent' : 'bg-neutral-100/50 border-neutral-200 text-neutral-700'
            }`}
            title="Categorize this document into a folder"
          >
            <option value="">📁 Root Folder</option>
            {folders.map(f => (
              <option key={f} value={f}>
                📁 {f}
              </option>
            ))}
          </select>
        </div>

        {/* Toolbar formatting buttons */}
        <div className={`flex items-center gap-0.5 md:gap-1.5 overflow-x-auto px-2 border-r ${themeInfo.borderClass} mr-2 md:mr-3`}>
          <button
            type="button"
            id="editor-format-h1"
            onClick={() => insertMarkdown('# ', '\n')}
            className="p-1 rounded text-neutral-500 hover:text-[#c084fc] hover:bg-white/5 transition-colors cursor-pointer"
            title="Header h1"
            aria-label="Header h1"
          >
            <Heading1 size={14} />
          </button>
          <button
            type="button"
            id="editor-format-bold"
            onClick={() => insertMarkdown('**', '**')}
            className="p-1 rounded text-neutral-500 hover:text-[#c084fc] hover:bg-white/5 transition-colors cursor-pointer"
            title="Bold text"
            aria-label="Bold text"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            id="editor-format-italic"
            onClick={() => insertMarkdown('*', '*')}
            className="p-1 rounded text-neutral-500 hover:text-[#c084fc] hover:bg-white/5 transition-colors cursor-pointer"
            title="Italic text"
            aria-label="Italic text"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            id="editor-format-code"
            onClick={() => insertMarkdown('`', '`')}
            className="p-1 rounded text-neutral-500 hover:text-[#c084fc] hover:bg-white/5 transition-colors cursor-pointer"
            title="Inline code"
            aria-label="Inline code"
          >
            <Code size={14} />
          </button>
          <button
            type="button"
            id="editor-format-link"
            onClick={() => insertMarkdown('[', '](https://)')}
            className="p-1 rounded text-neutral-500 hover:text-[#c084fc] hover:bg-white/5 transition-colors cursor-pointer"
            title="Hyperlink"
            aria-label="Hyperlink"
          >
            <Link size={14} />
          </button>
          <button
            type="button"
            id="editor-format-bullet"
            onClick={() => insertMarkdown('* ', '\n')}
            className="p-1 rounded text-neutral-500 hover:text-[#c084fc] hover:bg-white/5 transition-colors cursor-pointer"
            title="Bullet list"
            aria-label="Bullet list"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            id="editor-format-tasks"
            onClick={() => insertMarkdown('- [ ] ', '\n')}
            className="p-1 rounded text-neutral-500 hover:text-[#c084fc] hover:bg-white/5 transition-colors cursor-pointer"
            title="Task checklist list"
            aria-label="Task checklist list"
          >
            <CheckSquare size={14} />
          </button>
          <button
            type="button"
            id="editor-format-table"
            onClick={() => insertMarkdown('\n| Header | Value |\n| :--- | :--- |\n| Col 1 | Content 1 |\n| Col 2 | Content 2 |\n')}
            className="p-1 rounded text-neutral-500 hover:text-[#c084fc] hover:bg-white/5 transition-colors cursor-pointer"
            title="Table block template"
            aria-label="Table block template"
          >
            <Table size={14} />
          </button>
        </div>

        {/* Font resize controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="btn-font-zoom-out"
            onClick={() => onFontSizeChange(Math.max(fontSize - 1, 10))}
            className="p-1 rounded text-neutral-500 hover:bg-white/5 transition-colors disabled:opacity-40 cursor-pointer"
            title="Decrease Editor size"
            aria-label="Decrease Editor size"
            disabled={fontSize <= 10}
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[10px] font-mono font-semibold text-neutral-400 w-7 text-center">
            {fontSize}px
          </span>
          <button
            type="button"
            id="btn-font-zoom-in"
            onClick={() => onFontSizeChange(Math.min(fontSize + 1, 24))}
            className="p-1 rounded text-neutral-500 hover:bg-white/5 transition-colors disabled:opacity-40 cursor-pointer"
            title="Increase Editor size"
            aria-label="Increase Editor size"
            disabled={fontSize >= 24}
          >
            <ZoomIn size={13} />
          </button>

          {/* Wordwrap toggle */}
          <button
            type="button"
            id="btn-editor-wrap"
            onClick={onToggleWordWrap}
            className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
              wordWrap
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : themeInfo.isDark 
                  ? 'bg-black/30 border-white/5 text-neutral-400' 
                  : 'bg-neutral-100 border-neutral-300 text-neutral-500'
            }`}
          >
            Wrap
          </button>

          {/* Quick save button */}
          <button
            type="button"
            id="btn-quick-download"
            onClick={onSaveFile}
            className="ml-2 flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded bg-[accent] hover:bg-[accent] text-white transition-colors cursor-pointer shadow-sm"
          >
            <Save size={11} />
            <span>Save</span>
          </button>
        </div>
      </div>


      {/* Editor inputs container split */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Line Numbers column gutter */}
        {!wordWrap && (
          <div
            ref={lineNumbersRef}
            className={`w-12 text-right pr-3 py-6 md:py-8 select-none overflow-hidden font-mono text-xs leading-normal ${themeInfo.gutterBg}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {lineNumbers.map((lineNum) => (
              <div key={lineNum} className="h-[1.5em] leading-[1.5em]">
                {lineNum}
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          id="editor-textarea-canvas"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={`flex-1 h-full px-6 py-6 md:px-10 md:py-8 bg-transparent border-0 outline-none focus:ring-0 font-mono leading-normal resize-none overflow-y-auto ${
            wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
          } ${themeInfo.isDark ? 'text-neutral-200' : 'text-neutral-800'}`}
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.6em', fontFamily: 'var(--font-mono)' }}
          placeholder="Start typing markdown syntax here..."
        />

        {/* Find Panel Floating */}
        {showSearch && (
          <div className={`absolute top-4 right-8 z-10 flex items-center gap-2 p-1.5 rounded-lg shadow-lg border ${themeInfo.isDark ? 'bg-[#18181b] border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
            <Search size={14} className="ml-1 text-neutral-400" />
            <input
              id="editor-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFindNext(e.shiftKey ? 'prev' : 'next');
                if (e.key === 'Escape') {
                  setShowSearch(false);
                  textareaRef.current?.focus();
                }
              }}
              placeholder="Find in file..."
              className="bg-transparent border-none outline-none text-[11px] w-40 focus:ring-0"
            />
            <div className="flex items-center border-l border-neutral-200 dark:border-white/10 pl-1">
              <button onClick={() => handleFindNext('prev')} aria-label="Previous match" title="Previous match" className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer text-neutral-400">
                <ArrowUp size={14} />
              </button>
              <button onClick={() => handleFindNext('next')} aria-label="Next match" title="Next match" className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer text-neutral-400">
                <ArrowDown size={14} />
              </button>
              <button onClick={() => {
                setShowSearch(false);
                textareaRef.current?.focus();
              }} aria-label="Close search" title="Close search" className="p-1 rounded hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer text-neutral-400 ml-1">
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
