## 2024-05-24 - Extracted CodeBlock component with memoization
**Learning:** Extracting complex pieces of the UI (such as Prism highlighted code blocks) into isolated `React.memo` components prevents unnecessary global re-renders. Moving isolated state like `isCopied` directly into the newly extracted component reduces overhead when updating an individual node.
**Action:** When working on generic list/document rendering, look for heavy rendering nodes that can be independently memoized and extract state logic directly into them.
