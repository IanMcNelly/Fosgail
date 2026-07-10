## 2025-03-09 - Extracted CopyButton in MarkdownOutput to prevent full re-renders
**Learning:** The Markdown component used a single `copiedCodeId` state in the parent, meaning clicking "Copy" triggered a re-render of the entire expensive markdown view.
**Action:** Extract small interactive UI elements inside memoized or expensive lists/renderers into their own local state components to isolate updates.
