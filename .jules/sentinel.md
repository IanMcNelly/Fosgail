## 2025-03-08 - [CRITICAL] Fix Cross-Site Scripting (XSS) via dynamically rendered inputs
**Vulnerability:** The application was vulnerable to Cross-Site Scripting (XSS) through malicious code block injection in markdown files. Specifically, `innerHTML` and `dangerouslySetInnerHTML` were being used without sanitization in `src/App.tsx`, `src/components/MarkdownOutput.tsx`, and `src/components/MermaidBlock.tsx`.
**Learning:** React's `dangerouslySetInnerHTML` must not be used with untrusted input unless it's sanitized. Similarly, using `innerHTML` on a style tag can lead to a sandbox escape via `</style><script>alert(1)</script>`. Using libraries like PrismJS or Mermaid for rendering can still generate exploitable structures if provided malicious input.
**Prevention:**
1. Ensure `textContent` is used instead of `innerHTML` when directly rendering styles into `<style>` tags to prevent style tag escapes.
2. Use a robust sanitization library like `DOMPurify` to sanitize HTML output returned by third-party renderers (like Mermaid or Prism) before applying it to the DOM using `dangerouslySetInnerHTML`.

## 2025-02-28 - [Tauri CSP Enhancement]
**Vulnerability:** The `src-tauri/tauri.conf.json` had `"csp": null`, disabling the Content Security Policy for the Tauri frontend entirely.
**Learning:** By disabling CSP, the application relies solely on HTML sanitization (like DOMPurify) and React's escaping to prevent XSS. A single mistake could lead to untrusted script execution. In desktop apps like Tauri, XSS can lead to RCE because the frontend has IPC access to the system.
**Prevention:** Always define a strict CSP for Tauri applications. Ensure `"csp"` is configured securely instead of being disabled, restricting scripts and resources to `'self'` and explicitly needed origins (e.g., `ipc:`).
## 2025-03-08 - [High] Fix XSS Vulnerability via Malicious Markdown Links
**Vulnerability:** React-Markdown and standard Markdown rendering doesn't prevent rendering of `javascript:`, `data:`, or `vbscript:` protocols in `href` links by default. Malicious markdown files could include XSS payloads executed when users click on a link.
**Learning:** React-Markdown components and `<a>` renderers need explicit `href` sanitization. DOMPurify is used to sanitize HTML tags and SVG in other components, but `<a>` properties were not verified.
**Prevention:** Always validate `href` attributes in `<a>` tags before passing them down in React components rendering user-generated or parsed content. Use protocol allowlisting or explicitly deny list malicious protocols such as `javascript:`, `vbscript:`, and `data:`.

## 2024-05-18 - Path Traversal in File Operations
**Vulnerability:** Found missing path sanitization in file and folder operations (`handleRenameActiveFile`, `handleAddFolder`, `handleRemoveFolder`, `handleMoveFileFolder`), which allowed users to input strings containing `..` to traverse directories, potentially deleting or moving sensitive files outside the workspace.
**Learning:** These operations accepted raw path inputs derived directly from user input (like renaming a file in EditorArea) and concatenated them directly into Tauri's filesystem APIs without validation. Tauri `plugin-fs` executes actions relative to the `workspacePath` but blindly appending `..` overrides directory confinement.
**Prevention:** Always validate all raw user-supplied strings that will construct filesystem paths. Deny file names containing `/`, `\`, or `..`, and block folder manipulation paths containing `..` and starting with `/` or `\`.
## 2024-05-18 - [Path Traversal in URL handling]
**Vulnerability:** Found `href` sanitization to prevent javascript: but might have path traversal.
**Learning:** `App.tsx` has `handleNavigate` which uses `href` for resolving paths `resolvePath(activeMarkdownFile.folder || '', href);`
**Prevention:**
## 2024-05-18 - [XSS Bypass in Link URL Sanitization]
**Vulnerability:** The sanitization in `MarkdownOutput.tsx` checks `lowerHref.startsWith('javascript:')` but does not trim whitespace first, allowing bypass via ` href=" javascript:alert(1)"`.
**Learning:** Checking URL schemes requires `trim()` before `startsWith()`, or using URL parsing, because leading whitespaces or control characters can bypass naive string-prefix checks while still being executed by browsers.
**Prevention:** Always `trim()` URLs before validating schemes, or use robust URL parsing mechanisms.
## 2024-05-18 - [XSS Bypass Test Mismatch & Artifact Cleanup]
**Learning:** React Markdown's `defaultUrlTransform` strips the URL completely (returning empty string) when it detects a `javascript:` scheme. Our custom component attempts to set it to `'about:blank'`, but the parent renderer takes precedence.
**Action:** When adding security code to a library-rendered component (like `react-markdown`), ensure your tests align with what the library actually produces, and always delete temporary scripts like `fix_test.js` before submitting.
**Prevention:** Avoid writing test logic relying on React Markdown rendering links to 'about:blank' when resolving malicious urls as it completely strips them down.
