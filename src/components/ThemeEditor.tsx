/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CSSTheme } from '../types';
import { Plus, Trash2, Eye, FileText, Code2, AlertCircle } from 'lucide-react';

interface ThemeEditorProps {
  customThemes: CSSTheme[];
  activeThemeId: string;
  onSaveTheme: (theme: CSSTheme) => void;
  onDeleteTheme: (id: string) => void;
  onSelectTheme: (id: string) => void;
}

const CSS_SNIPPETS = [
  {
    label: '✨ Headers (H1, H2)',
    code: `.markdown-body h1 {
  font-family: inherit;
  color: #ff6b6b;
  border-bottom: 2px dashed #ff6b6b;
  font-size: 2.25rem;
  padding-bottom: 0.4rem;
}
.markdown-body h2 {
  color: #fca311;
  border-bottom: 1px solid #e5e5e5;
}`,
  },
  {
    label: '💬 Blockquotes',
    code: `.markdown-body blockquote {
  border-left: 6px solid #4ea8de;
  background-color: rgba(78, 168, 222, 0.1);
  padding: 12px 20px;
  border-radius: 4px;
  font-style: italic;
  font-size: 1.05rem;
}`,
  },
  {
    label: '⚙️ Preformatted Code',
    code: `.markdown-body pre {
  background-color: #1e1e24;
  border: 1px solid #4cc9f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 18px;
}
.markdown-body pre code {
  font-family: "JetBrains Mono", monospace;
  color: #f72585;
}`,
  },
  {
    label: '📊 Tables',
    code: `.markdown-body table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 2px solid #6b7280;
  border-radius: 6px;
  overflow: hidden;
}
.markdown-body th {
  background-color: #374151;
  color: #ffffff;
  font-weight: bold;
}
.markdown-body tr:nth-child(even) {
  background-color: rgba(107, 114, 128, 0.1);
}`,
  },
  {
    label: '📜 Custom Typography',
    code: `.markdown-body {
  font-family: "Georgia", serif;
  font-size: 18px;
  line-height: 1.8;
  letter-spacing: 0.01em;
  text-align: justify;
}`,
  }
];

export default function ThemeEditor({
  customThemes,
  activeThemeId,
  onSaveTheme,
  onDeleteTheme,
  onSelectTheme,
}: ThemeEditorProps) {
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(
    customThemes.length > 0 ? customThemes[0].id : null
  );

  const [themeName, setThemeName] = useState('');
  const [themeDesc, setThemeDesc] = useState('');
  const [themeIsDark, setThemeIsDark] = useState(true);
  const [cssCode, setCssCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load selected custom theme into editor
  const handleLoadTheme = (theme: CSSTheme) => {
    setSelectedCustomId(theme.id);
    setThemeName(theme.name);
    setThemeDesc(theme.description);
    setThemeIsDark(theme.isDark);
    setCssCode(theme.cssRules);
    setErrorMessage('');
    setSuccessMsg('');
    onSelectTheme(theme.id);
  };

  // Set default values for a brand new theme
  const handleInitNewTheme = () => {
    const newId = `custom-theme-${Date.now()}`;
    setSelectedCustomId(newId);
    setThemeName('My Custom Theme');
    setThemeDesc('A custom tailored reader style.');
    setThemeIsDark(true);
    setCssCode(`/* Custom CSS Theme Override rules */
.markdown-body {
  color: #e2e8f0;
  background-color: #0f172a;
  font-family: system-ui, sans-serif;
  line-height: 1.7;
  padding: 2.5rem;
}
.markdown-body h1 {
  color: #38bdf8;
  font-size: 2.1em;
  border-bottom: 1px solid #334155;
  padding-bottom: 0.3em;
  margin-top: 1.25em;
}
.markdown-body a {
  color: #38bdf8;
  text-decoration: underline;
}
.markdown-body blockquote {
  border-left: 4px solid #38bdf8;
  background-color: #1e293b;
  padding: 8px 16px;
  color: #94a3b8;
  font-style: italic;
  margin: 1.5rem 0;
}`);
    setErrorMessage('');
    setSuccessMsg('');
  };

  // Auto-load if customThemes changes or if we have none loaded yet
  if (!selectedCustomId && customThemes.length > 0) {
    handleLoadTheme(customThemes[0]);
  }

  const handleSave = () => {
    if (!themeName.trim()) {
      setErrorMessage('Theme name is required.');
      return;
    }
    if (!cssCode.trim()) {
      setErrorMessage('CSS code rules cannot be empty.');
      return;
    }

    const themePayload: CSSTheme = {
      id: selectedCustomId || `custom-theme-${Date.now()}`,
      name: themeName,
      description: themeDesc || 'A personalized custom template.',
      isDark: themeIsDark,
      isCustom: true,
      cssRules: cssCode,
    };

    onSaveTheme(themePayload);
    setSuccessMsg('Theme compiled & updated successfully!');
    setErrorMessage('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTheme(id);
    if (selectedCustomId === id) {
      const remaining = customThemes.filter((t) => t.id !== id);
      if (remaining.length > 0) {
        handleLoadTheme(remaining[0]);
      } else {
        setSelectedCustomId(null);
        setThemeName('');
        setThemeDesc('');
        setCssCode('');
      }
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    setCssCode((prev) => prev + '\n\n' + snippet);
  };

  return (
    <div className="flex flex-col h-full bg-inherit" id="theme-editor-canvas">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">
            Custom Style Director
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Add rules to instantly compile styles for all HTML parsing blocks.
          </p>
        </div>
        <button
          type="button"
          id="btn-new-custom-theme"
          onClick={handleInitNewTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all hover:shadow shadow-emerald-900/10 active:scale-95"
        >
          <Plus size={14} />
          Create Theme
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
        {/* Left list panel */}
        <div className="w-full md:w-56 shrink-0 p-3 overflow-y-auto bg-neutral-50/55 dark:bg-neutral-900/10 flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
            Custom Collections
          </span>
          {customThemes.length === 0 ? (
            <div className="text-center py-6 px-2 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
              <AlertCircle size={20} className="mx-auto text-neutral-400 mb-2 animate-pulse" />
              <p className="text-[11px] text-neutral-500">No custom styles recorded yet.</p>
              <button
                type="button"
                id="btn-create-theme-empty"
                onClick={handleInitNewTheme}
                className="mt-2 text-[11px] text-emerald-500 hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {customThemes.map((theme) => {
                const isActive = theme.id === selectedCustomId;
                const isPreviewing = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    id={`custom-theme-item-${theme.id}`}
                    type="button"
                    onClick={() => handleLoadTheme(theme)}
                    className={`group text-left px-3 py-2 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-neutral-100 dark:bg-neutral-800/80 font-medium text-neutral-800 dark:text-neutral-200 shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100/50 dark:text-neutral-400 dark:hover:bg-neutral-800/30'
                    }`}
                  >
                    <div className="truncate flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          theme.isDark ? 'bg-accent' : 'bg-amber-400'
                        }`}
                      />
                      <span className="truncate">{theme.name}</span>
                      {isPreviewing && (
                        <span className="text-[9px] px-1 bg-teal-500/10 text-teal-500 rounded border border-teal-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    <button
                      id={`btn-delete-theme-${theme.id}`}
                      type="button"
                      onClick={(e) => handleDelete(theme.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-opacity p-0.5 rounded cursor-pointer"
                      title="Delete Theme"
                    >
                      <Trash2 size={13} />
                    </button>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Snippets */}
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              Quick Code Helpers
            </span>
            <div className="flex flex-col gap-1.5">
              {CSS_SNIPPETS.map((snip, index) => (
                <button
                  key={index}
                  id={`css-snippet-item-${index}`}
                  type="button"
                  disabled={!selectedCustomId}
                  onClick={() => handleInsertSnippet(snip.code)}
                  className="text-left w-full px-2.5 py-1.5 text-[10px] bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 rounded cursor-pointer transition-colors border border-neutral-200/50 dark:border-neutral-700/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {snip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right workspace details */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-white dark:bg-zinc-950/20">
          {!selectedCustomId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <Eye size={32} className="text-neutral-300 dark:text-neutral-700 mb-2" />
              <p className="text-xs">Select or bootstrap a custom theme to edit it here.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              {/* Form entries row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    Theme Design Name
                  </label>
                  <input
                    type="text"
                    id="input-theme-name"
                    value={themeName}
                    onChange={(e) => {
                      setThemeName(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter name (e.g. Cobalt Serenity)"
                    className="w-full px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    Typography Brightness Basis
                  </label>
                  <div className="flex items-center gap-4 py-1">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input
                        type="radio"
                        id="radio-dark-mode"
                        checked={themeIsDark}
                        onChange={() => setThemeIsDark(true)}
                        className="accent-emerald-500"
                      />
                      <span>Dark Mode (Glowing text)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input
                        type="radio"
                        id="radio-light-mode"
                        checked={!themeIsDark}
                        onChange={() => setThemeIsDark(false)}
                        className="accent-emerald-500"
                      />
                      <span>Light Mode (Parchment rules)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Short Description
                </label>
                <input
                  type="text"
                  id="input-theme-desc"
                  value={themeDesc}
                  onChange={(e) => setThemeDesc(e.target.value)}
                  placeholder="Enter a brief theme description..."
                  className="w-full px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Code editor */}
              <div className="flex-1 flex flex-col space-y-1 min-h-[220px]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Code2 size={12} /> Customize CSS Rules (scoped under .markdown-body)
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    Injects into global style scope
                  </span>
                </div>
                <textarea
                  id="textarea-theme-css"
                  value={cssCode}
                  onChange={(e) => {
                    setCssCode(e.target.value);
                    setErrorMessage('');
                  }}
                  spellCheck={false}
                  placeholder="/* Customize your CSS overrides here. Scoped under `.markdown-body` class */"
                  className="flex-1 w-full p-3 font-mono text-xs bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-normal resize-none"
                />
              </div>

              {/* Status and button controls */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="text-xs">
                  {errorMessage && (
                    <span className="text-rose-500 font-medium flex items-center gap-1">
                      ⚠️ {errorMessage}
                    </span>
                  )}
                  {successMsg && (
                    <span className="text-emerald-500 font-medium flex items-center gap-1">
                      ✓ {successMsg}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-apply-theme"
                    onClick={() => {
                      handleSave();
                      onSelectTheme(selectedCustomId);
                    }}
                    className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    <FileText size={13} />
                    Apply Instant Styles
                  </button>
                  <button
                    type="button"
                    id="btn-save-theme"
                    onClick={handleSave}
                    className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
