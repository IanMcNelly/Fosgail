# Changelog

All notable changes to Fosgail are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

## [1.4.0] - Unreleased

### Added
- Support for additional file extensions including `.txt` and `.mmd` (Mermaid)

### Fixed
- App close failure, forward/back navigation regressions, and workspace loading regressions

## [1.3.3] - 2026-07-21

### Added
- Tab-based navigation for managing multiple open files
- Autosave functionality and dirty file indicators
- File search and filtering directly inside the sidebar
- Extensive unit testing for `TabBar`, navigation history, and utility functions

### Fixed
- **[Security]** Content Security Policy (CSP) implementation
- **[Security]** XSS vulnerability in Markdown parsing, Mermaid rendering, and markdown links
- **[Security]** Path traversal vulnerability in file and folder operations

### Changed
- **[A11y]** Added ARIA labels and titles across core UI controls (TabBar, OutlinePanel, FileTree, Settings toggles, Editor toolbar)
- **[Performance]** Optimized `calculateWordCharCount` to O(n) for better performance
- **[Performance]** Optimized scroll sync performance using throttle
- **[Performance]** Optimized line counting rendering
- **[Performance]** Prevented unnecessary DOM remounts in Markdown output and extracted `CopyButton` to prevent full re-renders

## [1.2.0] - 2026-06-28

### Added
- Added screenshots to documentation

### Fixed
- Fixed image filename case for Mermaid Diagrams
- Implemented Tauri file system persistence and resolved editor bugs

## [1.1.0] - 2026-06-27

### Changed
- Bumped Node.js requirement to version 24

## [1.0.0] - 2026-06-27

### Added
- Command Palette (`Cmd+K`) — unified file search + command dispatch
- Document Outline panel — floating Typora-style heading navigator (`Cmd+I`)
- Synchronized Scrolling — editor and preview scroll in lockstep
- Mermaid.js diagram support — lazy-loaded, zero bundle cost unless used
- Export to PDF — native OS print-to-PDF dialog
- Explicit `Cmd+S` save-to-disk with dirty indicator (`●`) in title bar
- Auto-save setting (optional, 1.5s debounce, disk-path files only)
- Full CI/CD pipeline (GitHub Actions) with cross-platform Tauri builds
- 106 automated tests (Vitest + React Testing Library)

### Fixed
- Illegal `useMemo` inside `ReactMarkdown` code renderer — runtime crash on code blocks
- `Cmd+O` keyboard shortcut targeting a removed DOM element (silently no-op'd)
- Missing `filePath` field on `MarkdownFile` — auto-save was impossible
- Windows path separator bug in workspace scanner (`\` vs `/`)
- Stale closure in `handleRemoveFolder` causing wrong file to become active
- File rename allowed duplicate names in the same folder
- FileTree defaulting to hardcoded sample folder names (real workspaces started collapsed)
- `QuickSearchModal` search results not memoized — rebuilt on every keystroke
- Status bar "DATABASE READY" label (confusing for a file editor)

### Changed
- Rebranded from "Markdown Viewer" to **Fosgail** throughout the UI
- Accent color shifted from emerald → violet/indigo across all chrome elements
- Sidebar now slides in/out with a spring animation (`AnimatePresence`)
- Modal backdrop upgraded to `backdrop-blur-xl` with spring-physics transitions
- Markdown preview padded with `max-w-3xl mx-auto px-8 py-8` for readable line width
- Keyboard shortcuts updated: `Cmd+K` palette, `Cmd+T` file switcher, `Cmd+I` outline
- Tauri window minimum size set to 900×560; default 1200×760

---

## [0.1.0] - 2026-06-01

### Added
- Initial Tauri v2 desktop application shell
- React 19 + Vite frontend with Tailwind CSS 4
- Zustand centralized state management
- Live split-screen markdown preview with PrismJS syntax highlighting
- Multi-file workspace support via `@tauri-apps/plugin-fs`
- Native folder picker via `@tauri-apps/plugin-dialog`
- Drag-and-drop `.md` file import
- Multiple built-in CSS themes (Elegant Dark, GitHub, Nord, Dracula, Solarized)
- Custom CSS theme compiler
- Zen Mode (distraction-free fullscreen)
- Word count, character count, file size in status bar
- Keyboard shortcuts modal

[Unreleased]: https://github.com/IanMcNelly/markdown-viewer/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/IanMcNelly/markdown-viewer/compare/v1.3.3...v1.4.0
[1.3.3]: https://github.com/IanMcNelly/markdown-viewer/compare/v1.2.0...v1.3.3
[1.2.0]: https://github.com/IanMcNelly/markdown-viewer/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/IanMcNelly/markdown-viewer/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/IanMcNelly/markdown-viewer/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/IanMcNelly/markdown-viewer/releases/tag/v0.1.0
