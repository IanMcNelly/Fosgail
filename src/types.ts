/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  wordCount: number;
  charCount: number;
  updatedAt: number;
  isExample?: boolean;
  folder?: string;
  /** Absolute path on disk — null for in-memory drafts that haven't been saved yet */
  filePath: string | null;
  /** True when in-memory content differs from what's on disk (or if it's a new draft) */
  isDirty?: boolean;
}

export interface CSSTheme {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  isCustom?: boolean;
  // CSS rules associated with this theme
  cssRules: string;
}

export interface EditorSettings {
  themeId: string;
  fontSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  editorMode: 'split' | 'edit' | 'preview';
  autoSave: boolean;
}
