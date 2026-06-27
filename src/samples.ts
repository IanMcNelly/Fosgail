/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarkdownFile } from './types';

export const INITIAL_FILES: MarkdownFile[] = [
  {
    id: 'welcome-guide',
    name: 'Welcome & Feature Tour.md',
    content: `# Welcome to Markdown Viewer! 🚀

An **offline**, ultra-snappy markdown viewer and editor designed to streamline your documentation workflow. Whether you're reviewing technical guides or auditing documentation files, this application represents the exact distraction-free utility you need.

---

## 🎨 Core Application Highlights

### 1. High-Fidelity Theming
This app includes multiple prebuilt CSS themes, including:
* **GitHub Light / Dark**: Standard layouts optimized for technical reviews.
* **Nord Minimal**: Ice cold, high contrast styling.
* **Dracula**: Atmospheric purple theme for late-night audits.
* **Solarized Warm**: Eye-safe bookish cream colors.
* **Retro Terminal**: Amber phosphor screen monospace terminal aesthetic.

### 2. Custom CSS Theme Engine
Want to customize exactly how your headers, blockquotes, code, and tables render? 
Click **"Themes" -> "Custom Theme"** to write your own CSS. Every single selector compiles live and is saved locally!

### 3. Desktop Application Grade Layout
Styled with simulated window controls or sleek responsive panels. It fits perfectly into a desktop layout:
* Word count, letter count, approximate size, and line calculations.
* Quick sidebar access to draft local snippets and files.
* Drag-and-drop or open file support. No servers required!

---

## ⌨️ Desktop Keyboard Shortcuts

Accelerate your workflow with these convenient hotkeys:

| Command | Shortcut | Description |
| :--- | :--- | :--- |
| **New File** | \`Ctrl + N\` / \`Cmd + N\` | Create a fresh markdown file |
| **Save File** | \`Ctrl + S\` / \`Cmd + S\` | Download draft markdown file to disk |
| **Toggle Mode** | \`Ctrl + E\` / \`Cmd + E\` | Cycle through split ➜ preview ➜ edit modes |
| **Toggle Sidebar** | \`Ctrl + B\` / \`Cmd + B\` | Open or cover the companion file rail |
| **Toggle Theme** | \`Ctrl + T\` / \`Cmd + T\` | Toggle between dark and light modes |

---

## 🏗️ Exporting for Native Desktop

This layout was designed with desktop packaging (such as **Electron** or **Tauri**) in mind. 
To run this application as a native OSX or Windows application in your local system:

1. **Download this repository** as a standard Vite project.
2. Run \`npm i\` followed by:
   * **For Tauri**: \`npm run tauri init && npm run tauri dev\`
   * **For Electron**: Integrate electron-builder and point it to the \`dist/\` static bundle.
3. The offline assets and client-side styling fully guarantee 100% operational integrity on launch without any server side-car requirements.

Enjoy a minimalist reading experience! Feel free to create new files or edit right on this view.
`,
    wordCount: 395,
    charCount: 2680,
    updatedAt: Date.now() - 3600000 * 2, // 2 hours ago
    isExample: true,
    folder: 'Docs/Guides',
    filePath: null,
  },
  {
    id: 'example-guide',
    name: 'Markdown Tips.md',
    content: `# Markdown Formatting Tips

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents. 

---

## 📝 Text Formatting

You can easily format text to emphasize important information:
- **Bold text** is created using double asterisks: \`**text**\`
- *Italic text* is created using single asterisks: \`*text*\`
- ~~Strikethrough~~ is created using double tildes: \`~~text~~\`

## 📊 Working with Lists

### Unordered Lists
- Apples
- Oranges
- Bananas

### Task Lists
- [x] Write documentation
- [ ] Review formatting
- [ ] Publish guide

## 💡 Pro Tip

> "The best documentation is written with the reader's perspective in mind. Keep it clear, concise, and structured."

Try experimenting with different themes to see how blockquotes and tables render!
`,
    wordCount: 104,
    charCount: 755,
    updatedAt: Date.now() - 3600000, // 1 hour ago
    isExample: true,
    folder: 'Docs/Guides',
    filePath: null,
  },
  {
    id: 'code-showcase',
    name: 'Syntax Highlight Showcase.md',
    content: `# Code Snippets & Language Showcase

This file demonstrates high-fidelity code rendering that uses PrismJS to provide syntax highlighting across multiple programming languages.

## ☕ TypeScript Example (React Hook)

Here is a simple interactive state hook that handles dragging active layouts or importing local assets:

\`\`\`typescript
import { useState, useEffect } from 'react';

export function useFileDropper(onDrop: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer?.files?.length) {
        onDrop(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onDrop]);

  return isDragging;
}
\`\`\`

## 🐍 Python Snippet (Quick Sorting)

Markdown blocks rendered using matching stylesheets style language tokens cleanly:

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
# Output: [1, 1, 2, 3, 6, 8, 10]
\`\`\`

## 🎨 CSS Styling Variables

Here is a raw template snippet demonstrating CSS variable layout and class-scoping structures:

\`\`\`css
/* Custom CSS Variables style sheets */
@theme {
  --color-brand-primary: #10b981;
  --color-brand-muted: #1e2e26;
  --font-display: "Space Grotesk", sans-serif;
}

.custom-markdown-override h1 {
  font-family: var(--font-display);
  color: var(--color-brand-primary);
  letter-spacing: -0.02em;
}
\`\`\`
`,
    wordCount: 227,
    charCount: 1819,
    updatedAt: Date.now(),
    isExample: true,
    folder: 'Docs/Playground',
    filePath: null,
  }
];
