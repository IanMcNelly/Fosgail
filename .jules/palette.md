## 2024-11-20 - Adding ARIA labels to tree-view action buttons
**Learning:** Icon-only buttons used for confirm/cancel operations or tree-node actions (add, delete) within complex components (like a FileTree) lack context for screen readers.
**Action:** Always ensure that any action buttons in nested structures (especially hover overlays or inline confirm/cancel states) have explicit and descriptive `aria-label` attributes to ensure they are accessible.

## 2026-07-11 - Identifying accessibility gaps via fragile RTL test queries
**Learning:** Fragile RTL test queries (e.g., `getByRole('button', { name: '' })` or querying by `querySelector('svg')`) are often a strong signal that a component lacks proper accessibility attributes like `aria-label`.
**Action:** When updating tests or reviewing codebase, search for tests that struggle to select elements semantically and use those as opportunities to add proper accessible names to the underlying components.
