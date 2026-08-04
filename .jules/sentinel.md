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
## 2024-07-16 - [XSS Bypass via Whitespace in URL Scheme Validation]
**Vulnerability:** The URL scheme validation in `src/components/MarkdownOutput.tsx` for markdown links was vulnerable to bypass. It checked `safeHref.toLowerCase().startsWith('javascript:')` without trimming leading whitespace. An attacker could use `[Click me]( javascript:alert(1))` (with leading space) which bypasses the check but is still executed by the browser when clicked.
**Learning:** Browsers ignore leading whitespaces in `href` attributes, allowing spaces before malicious schemes like `javascript:` or `data:`. `.startsWith()` checks will fail to catch these if the input string is not trimmed first.
**Prevention:** Always `trim()` user input before performing validation against prefixes or specific schemes like `javascript:`, `vbscript:`, and `data:`.

## 2025-03-08 - [High] Fix XSS Vulnerability via Malicious Image Sources
**Vulnerability:** React-Markdown components and image renderers do not inherently sanitize the `src` attributes of images. A malicious user could inject `javascript:` or `vbscript:` payloads into an image `src`, causing XSS execution when the image is rendered or interacted with.
**Learning:** Similar to links (`<a>`), `<img src="...">` must have protocol validation. Relying only on DOMPurify elsewhere doesn't cover dynamic attribute generation in React properties.
**Prevention:** Always validate `src` attributes in `<img>` tags before passing them to the React component tree. Apply an allow-list or deny-list for `javascript:`, `vbscript:`, and unsafe `data:` protocols.
## 2024-05-18 - Path Traversal in File Rename
**Vulnerability:** The `handleRenameActiveFile` function in `src/App.tsx` did not strictly sanitize new file names before using them in `rename` calls, potentially allowing an attacker to overwrite arbitrary files via directory traversal sequences (like `../`).
**Learning:** Checking for `.includes('..')` is often insufficient for file name sanitization, as clever encoding or combination with other vulnerabilities might bypass simple substring checks.
**Prevention:** Use a rigorous replacement strategy or strict allowlisting for filenames (e.g. `newName.replace(/[\/\\]/g, '-').replace(/\.\./g, '').replace(/[?%*:|"<>\0]/g, '')`) or reject any filename containing illegal characters outright instead of depending on simple substring validation.
