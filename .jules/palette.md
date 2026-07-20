## 2024-11-20 - Adding ARIA labels to tree-view action buttons
**Learning:** Icon-only buttons used for confirm/cancel operations or tree-node actions (add, delete) within complex components (like a FileTree) lack context for screen readers.
**Action:** Always ensure that any action buttons in nested structures (especially hover overlays or inline confirm/cancel states) have explicit and descriptive `aria-label` attributes to ensure they are accessible.

## 2026-07-11 - Identifying accessibility gaps via fragile RTL test queries
**Learning:** Fragile RTL test queries (e.g., `getByRole('button', { name: '' })` or querying by `querySelector('svg')`) are often a strong signal that a component lacks proper accessibility attributes like `aria-label`.
**Action:** When updating tests or reviewing codebase, search for tests that struggle to select elements semantically and use those as opportunities to add proper accessible names to the underlying components.

## 2024-07-12 - Adding ARIA labels to structural app-level buttons
**Learning:** Global UI controls like sidebar toggles, modal close buttons, and search inputs are critical for basic app navigation but frequently miss accessible names since they rely heavily on universally recognized icons (like hamburger menus or X marks).
**Action:** Audit main structural layouts (App.tsx, Navigation, Sidebars) specifically for icon-only action buttons and standalone inputs.

## 2024-03-24 - Adding ARIA labels to structural panel buttons
**Learning:** Buttons within structural panels (like a Sidebar footer) that rely on a combination of icon and text for visual users can still benefit from explicit `aria-label` attributes to ensure screen readers announce their purpose clearly, especially when the text content contains ampersands or could be ambiguous.
**Action:** When updating structural UI components, ensure that buttons opening modals or settings panels have explicit `aria-label` attributes for better accessibility.

## 2024-11-20 - Dynamic ARIA labels for tabs
**Learning:** Icon-only close buttons in tabbed interfaces are often overlooked for accessibility because the surrounding tab text provides visual context, but screen readers require specific accessible names for these buttons to differentiate them from one another.
**Action:** When creating or updating tabbed navigation elements with dismissable tabs, ensure that the close buttons have dynamic `aria-label` attributes (e.g., `"Close tab ${fileName}"`) to make them contextually meaningful.
## 2024-07-23 - Adding ARIA labels to transient icon-only buttons
**Learning:** Transient UI elements like floating search overlays, inline toolbars, and dynamic layout controls (e.g. tabs) are frequently implemented quickly without semantic accessibility compared to static structural UI. These frequently use icon-only buttons without `aria-label` or `title` properties.
**Action:** When working on new dynamic, absolute positioned panels or tabs, deliberately verify that all icon-only buttons have descriptive `aria-label`s and `title` attributes for sighted users needing tooltips.
