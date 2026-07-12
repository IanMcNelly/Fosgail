## 2024-05-19 - Optimize `calculateWordCharCount`
**Learning:** Using `String.split(/\s+/)` to calculate word counts in JavaScript/TypeScript is very slow for large documents as it allocates a large array and uses regular expressions. However, when writing a single-pass loop, be careful of `code <= 32` ASCII whitespace checks, as they will miss Unicode whitespaces (like `\u00A0` NBSP).
**Action:** Replace `split` with a single pass loop using `.charCodeAt(i)` to count word boundaries. Use a fast path for ASCII whitespaces (`code <= 32`) and a fallback to regex (`/\s/.test(char)`) for Unicode characters (`code >= 160`) to maintain correctness while remaining extremely fast.
## 2025-03-09 - Extracted CopyButton in MarkdownOutput to prevent full re-renders
**Learning:** The Markdown component used a single `copiedCodeId` state in the parent, meaning clicking "Copy" triggered a re-render of the entire expensive markdown view.
**Action:** Extract small interactive UI elements inside memoized or expensive lists/renderers into their own local state components to isolate updates.
## 2024-05-18 - Avoid array allocation on every keystroke
**Learning:** Using `value.split('\n').length` inside a React component's render function (like EditorArea) forces the engine to allocate an array containing every line of the document on every single keystroke. This causes excessive memory allocation and triggers frequent garbage collection, creating typing latency in large documents.
**Action:** Use an iterative approach to count character occurrences (e.g. iterating over the string and checking `charCodeAt`) combined with `useMemo` so that derived arrays (like `lineNumbers`) are only reallocated when the document value actually changes.
