## 2024-05-19 - Optimize `calculateWordCharCount`
**Learning:** Using `String.split(/\s+/)` to calculate word counts in JavaScript/TypeScript is very slow for large documents as it allocates a large array and uses regular expressions. However, when writing a single-pass loop, be careful of `code <= 32` ASCII whitespace checks, as they will miss Unicode whitespaces (like `\u00A0` NBSP).
**Action:** Replace `split` with a single pass loop using `.charCodeAt(i)` to count word boundaries. Use a fast path for ASCII whitespaces (`code <= 32`) and a fallback to regex (`/\s/.test(char)`) for Unicode characters (`code >= 160`) to maintain correctness while remaining extremely fast.
## 2025-03-09 - Extracted CopyButton in MarkdownOutput to prevent full re-renders
**Learning:** The Markdown component used a single `copiedCodeId` state in the parent, meaning clicking "Copy" triggered a re-render of the entire expensive markdown view.
**Action:** Extract small interactive UI elements inside memoized or expensive lists/renderers into their own local state components to isolate updates.
## 2025-03-05 - Throttle Scroll-Bound State Updates to Prevent Root Re-renders

**Learning:** This codebase places the scroll synchronization state (`syncScrollPercent`) in the root component (`App.tsx`) to share it between `<EditorArea>` and `<MarkdownOutput>`. While functionally correct, updating this state synchronously on every `onScroll` event causes the entire React component tree (including the heavy `Sidebar` and `FileTree`) to re-render dozens of times per second during scrolling. This is a severe performance bottleneck specific to this architecture where heavy components share state high up in the tree.

**Action:** Always throttle high-frequency DOM events (like scroll or resize) when they update React state, especially if that state lives near the root of the component tree. I implemented a generic `throttle` function in `utils.ts` and wrapped the `setSyncScrollPercent` setter with a 50ms throttle using `useMemo` in `App.tsx`.
