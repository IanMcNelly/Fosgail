### 1. Performance & State
- **Target:** `src/components/MarkdownOutput.tsx`
- **The Issue:** The `MarkdownOutput` component receives `syncScrollPercent` as a prop. Every time the user scrolls in the split editor, this prop updates, causing the entire component to re-render. Because `<ReactMarkdown>` is not memoized, this forces the app to re-parse the entire Markdown AST and re-render the DOM on every single scroll tick, leading to severe frame drops and input lag.
- **The Fix:** Extract the expensive `<ReactMarkdown>` tree into a separate `React.memo` component so it only re-renders when the `content` or `components` actually change, ignoring scroll updates.
```tsx
// Extract and memoize the expensive Markdown rendering
const MemoizedMarkdown = React.memo(({ content, components }: { content: string, components: any }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {content}
  </ReactMarkdown>
));

// Update the render method in MarkdownOutput
return (
  <div
    id="compiled-markdown-viewport"
    ref={viewportRef}
    onScroll={handleScroll}
    className={\`w-full h-full overflow-y-auto \${syncScrollPercent !== null ? 'hide-scrollbar' : ''}\`}
  >
    <div className="markdown-body min-h-full w-full max-w-none px-6 py-6 md:px-12 md:py-10 transition-all duration-300">
      <MemoizedMarkdown content={content} components={components} />
    </div>
  </div>
);
```
- **Impact/Effort:** High Impact / Low Effort

### 2. Tauri & IPC
- **Target:** `src/App.tsx` (`handleOpenWorkspace`)
- **The Issue:** When opening a workspace folder, the React frontend recursively loops over directories and eagerly calls `readTextFile()` for every single Markdown file. This creates an "N+1 IPC problem" (making hundreds of blocking IPC calls) and eagerly loads the entire contents of all workspace files into memory simultaneously. This can cause the app to hang or crash on large workspaces.
- **The Fix:** Defer reading the file content until the file is actively selected. Initialize the workspace state with empty content skeletons, and lazily load content when requested.
```typescript
// In App.tsx: handleOpenWorkspace directory scan loop
} else if (entry.name && entry.name.toLowerCase().endsWith('.md')) {
  const absoluteFilePath = normalizePath(\`\${dirPath}/\${entry.name}\`);
  // FIX: Push file skeleton without eagerly calling readTextFile(absoluteFilePath)
  newFiles.push({
    id: \`file-\${Date.now()}-\${Math.floor(Math.random() * 10000)}\`,
    name: entry.name,
    content: '', // Lazily load this later when the user clicks the file
    wordCount: 0,
    charCount: 0,
    updatedAt: Date.now(),
    folder: relativePath,
    filePath: absoluteFilePath,
    isDirty: false,
    isLoaded: false, // New flag indicating content hasn't been fetched via IPC yet
  });
}

// In App.tsx: when a user selects a file
const onSelectFile = async (id: string) => {
  const file = files.find(f => f.id === id);
  if (file && !file.isLoaded && file.filePath) {
    const content = await readTextFile(file.filePath);
    const counts = calculateWordCharCount(content);
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content, wordCount: counts.wordCount, charCount: counts.charCount, isLoaded: true } : f));
  }
  setActiveFileId(id);
};
```
- **Impact/Effort:** High Impact / Medium Effort

### 3. UX & Accessibility
- **Target:** `src/components/CommandPalette.tsx`
- **The Issue:** The Command Palette results list lacks necessary ARIA attributes for screen readers and does not implement a focus trap. When users navigate with arrow keys, assistive technologies don't announce the selected item. Also, users can tab out of the modal.
- **The Fix:** Add `role="listbox"` to the results container, `role="option"` with `aria-selected` to the result rows, and `aria-activedescendant` to the input.
```tsx
// 1. Add roles and aria-activedescendant to the input
<input
  ref={inputRef}
  type="text"
  role="combobox"
  aria-expanded="true"
  aria-controls="command-palette-results"
  aria-activedescendant={results.length > 0 ? \`result-item-\${selectedIndex}\` : undefined}
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  /* ... existing props ... */
/>

// 2. Add role="listbox" to the results container and role="option" to items
<div ref={listRef} className="space-y-0.5" role="listbox" id="command-palette-results">
  {results.map((item, idx) => {
    const isSelected = idx === selectedIndex;
    return (
      <div key={idx} role="presentation">
        {/* ... section headers ... */}
        <div
          id={\`result-item-\${idx}\`}
          role="option"
          aria-selected={isSelected}
          onClick={() => handleSelect(item)}
          className={\`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all \${
            isSelected ? 'bg-accent text-white' : 'hover:bg-neutral-100'
          }\`}
        >
          {/* ... row contents ... */}
        </div>
      </div>
    );
  })}
</div>
```
- **Impact/Effort:** Medium Impact / Low Effort