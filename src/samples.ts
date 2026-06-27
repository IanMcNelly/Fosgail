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

An **offline-first**, ultra-snappy markdown viewer and editor designed to streamline your development and documentation workflow. Whether you're reviewing AI-generated launch plans, reading technical tickets, or auditing documentation files, this application represents the exact distraction-free utility you need.

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

1. **Download this repository** as a standard Vite + SPA project.
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
    id: 'example-ticket',
    name: 'PROJ-942_AI_Auth_Spec.md',
    content: `# Ticket: PROJ-942 — Firebase authentication & database security layout

**Status:** \`IN_REVIEW\`  
**Assignee:** \`Dev team / Gemini-3.5\`  
**Tags:** \`Security\`, \`Backend\`, \`Sprint-12\`

---

## 📝 Specifications Scope

We need to implement a full-stack authorization sequence for dynamic client registration. This ticket specifies the Firestore path parameters and baseline rules.

### ✔️ Checklist items
- [x] Configure Firebase initialization hook in SPA root.
- [x] Define security rule block for \`/users/{userId}\` documents.
- [ ] Implement multi-tenant lookup filter.
- [ ] Conduct automated fuzzing over database tokens.

## 📊 Database Document Schema Layout

The registry paths rely on the following model blueprint definition:

| Column | Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| **id** | \`string\` | No | Unique generated UUID. |
| **displayName** | \`string\` | Yes | Custom profile string representation. |
| **accessRole** | \`enum\` | No | Auth permissions check: \`ADMIN\`, \`COLLEGIATE\`, \`READ_ONLY\`. |
| **createdAt** | \`timestamp\` | No | Epoch creation registration marker. |

## 💡 Engineering Blockquote Guideline

> "Authentication endpoints must always act conservatively. When the security policy changes, ensure all rules are fully loaded before allowing high-throughput database modifications."

Use the companion code showcase tab to audit active rule validation blocks. Custom css themes might render table cells and blockquotes beautifully!
`,
    wordCount: 161,
    charCount: 1320,
    updatedAt: Date.now() - 3600000, // 1 hour ago
    isExample: true,
    folder: 'Docs/Tickets',
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
