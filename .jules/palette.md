## 2024-11-20 - Adding ARIA labels to tree-view action buttons
**Learning:** Icon-only buttons used for confirm/cancel operations or tree-node actions (add, delete) within complex components (like a FileTree) lack context for screen readers.
**Action:** Always ensure that any action buttons in nested structures (especially hover overlays or inline confirm/cancel states) have explicit and descriptive `aria-label` attributes to ensure they are accessible.
