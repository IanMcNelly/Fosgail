/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Keyboard, HelpCircle } from 'lucide-react';

interface ShortcutRow {
  keys: string[];
  action: string;
  description: string;
}

const SHORTCUTS_DATA: ShortcutRow[] = [
  {
    keys: ['Ctrl', 'N'],
    action: 'New Draft File',
    description: 'Creates a fresh in-memory markdown draft.',
  },
  {
    keys: ['Ctrl', 'O'],
    action: 'Open Workspace Folder',
    description: 'Opens a native folder picker to load a workspace of .md files.',
  },
  {
    keys: ['Ctrl', 'S'],
    action: 'Save File to Disk',
    description: 'Saves the active file to its disk location. Opens Save-As for new drafts.',
  },
  {
    keys: ['Ctrl', 'K'],
    action: 'Command Palette',
    description: 'Spotlight-style launcher. Search files or type > to trigger app commands.',
  },
  {
    keys: ['Ctrl', 'T'],
    action: 'File Switcher',
    description: 'Opens the Command Palette pre-focused on file search.',
  },
  {
    keys: ['Ctrl', 'I'],
    action: 'Toggle Document Outline',
    description: 'Shows/hides the floating heading outline panel over the preview.',
  },
  {
    keys: ['Ctrl', 'M'],
    action: 'Cycle Editor Views',
    description: 'Cycles: Split Screen ➜ Preview ➜ Write.',
  },
  {
    keys: ['Ctrl', 'B'],
    action: 'Toggle Sidebar',
    description: 'Collapses or expands the left file navigation rail.',
  },
  {
    keys: ['Esc'],
    action: 'Exit Zen / Close Panel',
    description: 'Exits Zen Mode or closes the floating Outline panel.',
  },
];

export default function KeyboardShortcuts() {
  const isMac = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac');

  return (
    <div className="p-4" id="keyboard-shortut-guide">
      <div className="flex items-center gap-2 mb-3">
        <Keyboard className="text-emerald-500 animate-pulse" size={18} />
        <h2 className="text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">
          Native Shortcut Accelerator
        </h2>
      </div>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-4 leading-normal">
        These keys are active inside this browser viewer and map automatically to <kbd className="px-1 bg-neutral-100 dark:bg-neutral-800 text-[9px] rounded font-mono">⌘ Cmd</kbd> on macOS systems or <kbd className="px-1 bg-neutral-100 dark:bg-neutral-800 text-[9px] rounded font-mono">Ctrl</kbd> on Windows and Linux machines.
      </p>

      <div className="flex flex-col gap-3">
        {SHORTCUTS_DATA.map((short, index) => (
          <div
            key={index}
            id={`shortcut-item-${index}`}
            className="flex items-start justify-between py-1.5 border-b border-dashed border-neutral-100 dark:border-neutral-800 last:border-b-0"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                {short.action}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-none">
                {short.description}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-4 font-mono text-[10px]">
              {short.keys.map((key, keyIdx) => {
                const visualKey = key === 'Ctrl' && isMac ? '⌘' : key;
                return (
                  <span key={keyIdx} className="flex items-center">
                    <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/30 text-neutral-600 dark:text-neutral-300 font-medium whitespace-nowrap">
                      {visualKey}
                    </kbd>
                    {keyIdx < short.keys.length - 1 && <span className="text-neutral-400 px-0.5">+</span>}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50 flex gap-2">
        <HelpCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal">
          <strong>Tip:</strong> If dragging-and-dropping file plans, you can drop any <code className="text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-800 px-0.5 rounded">.md</code>, <code className="text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-800 px-0.5 rounded">.txt</code>, or <code className="text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-800 px-0.5 rounded">.json</code> block directly over any target area of this screen to instantly inspect its compiled formatting!
        </span>
      </div>
    </div>
  );
}
