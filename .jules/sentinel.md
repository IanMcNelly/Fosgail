## 2025-03-08 - [CRITICAL] Fix Cross-Site Scripting (XSS) via dynamically rendered inputs
**Vulnerability:** The application was vulnerable to Cross-Site Scripting (XSS) through malicious code block injection in markdown files. Specifically, `innerHTML` and `dangerouslySetInnerHTML` were being used without sanitization in `src/App.tsx`, `src/components/MarkdownOutput.tsx`, and `src/components/MermaidBlock.tsx`.
**Learning:** React's `dangerouslySetInnerHTML` must not be used with untrusted input unless it's sanitized. Similarly, using `innerHTML` on a style tag can lead to a sandbox escape via `</style><script>alert(1)</script>`. Using libraries like PrismJS or Mermaid for rendering can still generate exploitable structures if provided malicious input.
**Prevention:**
1. Ensure `textContent` is used instead of `innerHTML` when directly rendering styles into `<style>` tags to prevent style tag escapes.
2. Use a robust sanitization library like `DOMPurify` to sanitize HTML output returned by third-party renderers (like Mermaid or Prism) before applying it to the DOM using `dangerouslySetInnerHTML`.
