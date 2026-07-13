## 2024-11-20 - Adding ARIA labels to tree-view action buttons
**Learning:** Icon-only buttons used for confirm/cancel operations or tree-node actions (add, delete) within complex components (like a FileTree) lack context for screen readers.
**Action:** Always ensure that any action buttons in nested structures (especially hover overlays or inline confirm/cancel states) have explicit and descriptive `aria-label` attributes to ensure they are accessible.

## 2026-07-11 - Identifying accessibility gaps via fragile RTL test queries
**Learning:** Fragile RTL test queries (e.g., `getByRole('button', { name: '' })` or querying by `querySelector('svg')`) are often a strong signal that a component lacks proper accessibility attributes like `aria-label`.
**Action:** When updating tests or reviewing codebase, search for tests that struggle to select elements semantically and use those as opportunities to add proper accessible names to the underlying components.

## 2024-07-12 - Adding ARIA labels to structural app-level buttons
**Learning:** Global UI controls like sidebar toggles, modal close buttons, and search inputs are critical for basic app navigation but frequently miss accessible names since they rely heavily on universally recognized icons (like hamburger menus or X marks).
**Action:** Audit main structural layouts (App.tsx, Navigation, Sidebars) specifically for icon-only action buttons and standalone inputs.
