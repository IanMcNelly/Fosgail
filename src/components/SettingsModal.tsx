import React, { useState } from 'react';
import { CSSTheme } from '../types';
import { 
  Sun, Moon, Sparkles, Sliders, Type, AlignLeft, 
  Code2, Eye, Shield, Check, FileText, Columns, BookOpen
} from 'lucide-react';

interface SettingsModalProps {
  themes: CSSTheme[];
  activeThemeId: string;
  onSelectTheme: (id: string) => void;
  
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  
  wordWrap: boolean;
  onToggleWordWrap: () => void;

  isSyncScrollEnabled: boolean;
  onToggleSyncScroll: () => void;

  isAutoSaveEnabled: boolean;
  onToggleAutoSave: () => void;
  
  onShowThemeEditor: () => void;
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
}

export default function SettingsModal({
  themes,
  activeThemeId,
  onSelectTheme,
  fontSize,
  onFontSizeChange,
  wordWrap,
  onToggleWordWrap,
  isSyncScrollEnabled,
  onToggleSyncScroll,
  isAutoSaveEnabled,
  onToggleAutoSave,
  onShowThemeEditor,
  themeInfo,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'editor'>('themes');
  const [themeFilter, setThemeFilter] = useState<'all' | 'light' | 'dark'>('all');

  // Filter themes based on light / dark
  const filteredThemes = themes.filter((t) => {
    if (themeFilter === 'light') return !t.isDark;
    if (themeFilter === 'dark') return t.isDark;
    return true;
  });

  return (
    <div id="settings-menu-panel" className={`${themeInfo.appBg} ${themeInfo.text} h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-white/5`}>
      {/* Sidebar navigation for Settings Tabs */}
      <div className={`w-full md:w-48 shrink-0 p-4 space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible ${themeInfo.sidebarBg}`}>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-inherit opacity-90 shrink-0 hidden md:flex">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-accent text-white shadow-sm shadow-accent/20">
              <BookOpen size={15} />
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight inherit flex items-center gap-1">
                Fosgail
              </span>
              <span className="block text-[9px] font-medium opacity-70">
                Offline Markdown Suite
              </span>
            </div>
          </div>
          <kbd className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[9px] rounded font-mono inherit opacity-80">
            v1.0.0
          </kbd>
        </div>

        <button
          id="btn-settings-tab-themes"
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer w-full text-left transition-all ${
            activeTab === 'themes'
              ? 'bg-accent text-white shadow-sm shadow-accent/10'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
          }`}
        >
          <Sun size={14} />
          <span>Themes & Rendering</span>
        </button>

        <button
          id="btn-settings-tab-editor"
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer w-full text-left transition-all ${
            activeTab === 'editor'
              ? 'bg-accent text-white shadow-sm shadow-accent/10'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
          }`}
        >
          <Type size={14} />
          <span>Editor Configurations</span>
        </button>

        <div className={`hidden md:block pt-4 border-t mt-auto ${themeInfo.borderClass}`}>
          <div className={`p-3 rounded-lg ${themeInfo.cardBg}`}>
            <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Compiler Hint</span>
            <p className="text-[10px] leading-relaxed text-neutral-500">
              Select layouts compiled with high contrast colors for high utility readouts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Panel Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold inherit">
                CSS Viewport Themes
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Choose the visual style applied to rendered HTML markdown documents.
              </p>
            </div>

            {/* Light / Dark filters */}
            <div className="flex bg-neutral-100 dark:bg-black/30 p-1 rounded-lg w-max shrink-0 border border-neutral-200/40 dark:border-white/5">
              <button
                id="btn-settings-filter-all"
                type="button"
                onClick={() => setThemeFilter('all')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  themeFilter === 'all'
                    ? 'bg-white dark:bg-zinc-800 text-neutral-800 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                }`}
              >
                All Themes ({themes.length})
              </button>
              <button
                id="btn-settings-filter-light"
                type="button"
                onClick={() => setThemeFilter('light')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  themeFilter === 'light'
                    ? 'bg-white dark:bg-zinc-800 text-neutral-800 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                }`}
              >
                Light
              </button>
              <button
                id="btn-settings-filter-dark"
                type="button"
                onClick={() => setThemeFilter('dark')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  themeFilter === 'dark'
                    ? 'bg-white dark:bg-zinc-800 text-neutral-800 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                }`}
              >
                Dark
              </button>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredThemes.map((theme) => {
                const isSelected = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    id={`settings-theme-item-${theme.id}`}
                    type="button"
                    onClick={() => {
                      onSelectTheme(theme.id);
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-accent ring-2 ring-accent/10 bg-indigo-50/10'
                        : 'border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-zinc-900/30'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold inherit text-xs">
                        {theme.isDark ? (
                          <Moon size={12} className="text-accent" />
                        ) : (
                          <Sun size={12} className="text-amber-500" />
                        )}
                        <span>{theme.name}</span>
                      </div>
                      
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-accent text-white shadow-xs">
                          <Check size={10} />
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-neutral-500 mt-1.5 leading-normal max-w-[240px]">
                      {theme.description || 'Custom compiled rendering schema.'}
                    </p>

                    <div className="flex items-center gap-1.5 mt-3">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        theme.isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {theme.isDark ? 'Dark Mode' : 'Light Mode'}
                      </span>
                      {theme.isCustom && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 flex items-center gap-0.5">
                          <Sparkles size={8} />
                          Custom
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Theme Director Link */}
            <div className="pt-2">
              <div className="p-4 bg-indigo-50/10 rounded-xl border border-accent/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-accent flex items-center gap-1">
                    <Code2 size={13} /> Custom Theme CSS Compiler
                  </h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5 max-w-md">
                    Target exact HTML elements tags (.markdown-body code, blockquotes, headings) and compile your own CSS rendering script!
                  </p>
                </div>
                <button
                  id="btn-settings-to-compiler"
                  type="button"
                  onClick={onShowThemeEditor}
                  className="px-3 py-1.5 text-[11px] font-semibold text-white bg-accent hover:bg-accent rounded-lg cursor-pointer shrink-0 transition-colors shadow-xs hover:shadow-accent/15"
                >
                  Open Themes Compiler
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold inherit">
                Writers Workspace Configurations
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Personalize how typing files feels inside the markdown source editor.
              </p>
            </div>

            {/* Editor font sizing option card */}
            <div className={`p-4 rounded-xl space-y-3 ${themeInfo.cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold inherit flex items-center gap-1.5">
                    <Type size={13} className="text-accent" />
                    Source Editor Font Size
                  </h4>
                  <p className="text-[10px] text-neutral-500">
                    Adjust text scaling size for comfortable writing.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-accent/10 text-accent rounded">
                  {fontSize}px
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="btn-settings-font-decrease"
                  disabled={fontSize <= 10}
                  onClick={() => onFontSizeChange(Math.max(fontSize - 1, 10))}
                  className="px-2.5 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-40 cursor-pointer"
                >
                  A-
                </button>
                <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute inset-y-0 left-0 bg-accent" 
                    style={{ width: `${((fontSize - 10) / 14) * 100}%` }}
                  />
                </div>
                <button
                  type="button"
                  id="btn-settings-font-increase"
                  disabled={fontSize >= 24}
                  onClick={() => onFontSizeChange(Math.min(fontSize + 1, 24))}
                  className="px-2.5 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-40 cursor-pointer"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Line wrap preferences toggle card */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${themeInfo.cardBg}`}>
              <div>
                <h4 className="text-xs font-bold inherit flex items-center gap-1.5">
                  <AlignLeft size={13} className="text-accent" />
                  Word wrap content
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Wrap lengthy string lines to fit neatly within boundaries.
                </p>
              </div>

              <button
                id="btn-settings-toggle-word-wrap"
                type="button"
                onClick={onToggleWordWrap}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  wordWrap ? 'bg-accent' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    wordWrap ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sync scroll toggle */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${themeInfo.cardBg}`}>
              <div>
                <h4 className="text-xs font-bold inherit flex items-center gap-1.5">
                  <Columns size={13} className="text-accent" />
                  Synchronized Scrolling
                </h4>
                <p className="text-[10px] text-neutral-500">
                  In Split mode, the preview mirrors the editor's scroll position.
                </p>
              </div>
              <button
                id="btn-settings-toggle-sync-scroll"
                type="button"
                onClick={onToggleSyncScroll}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSyncScrollEnabled ? 'bg-accent' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isSyncScrollEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto-save toggle */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${themeInfo.cardBg}`}>
              <div>
                <h4 className="text-xs font-bold inherit flex items-center gap-1.5">
                  <Shield size={13} className="text-accent" />
                  Auto-Save to Disk
                </h4>
                <p className="text-[10px] text-neutral-500 max-w-[260px]">
                  Automatically write changes to disk after 1.5s of inactivity. Only applies to files with a known disk path.
                </p>
              </div>
              <button
                id="btn-settings-toggle-auto-save"
                type="button"
                onClick={onToggleAutoSave}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAutoSaveEnabled ? 'bg-accent' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isAutoSaveEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Simulated Live typing preview of the editor styling */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                Live Font Style Preview
              </span>
              <div 
                className="w-full p-4 font-mono leading-normal bg-neutral-950 text-emerald-400 border border-neutral-800 rounded-xl max-h-[120px] overflow-hidden"
                style={{ fontSize: `${fontSize}px` }}
              >
                # Draft Title <br />
                - [x] Fast markdown tree renderer <br />
                - [ ] Clean compiled code modules <br />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
