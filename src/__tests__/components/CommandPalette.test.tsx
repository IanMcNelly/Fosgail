import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandPalette, { AppCommand } from '../../components/CommandPalette';
import type { MarkdownFile } from '../../types';

// Helpers
function makeFile(overrides: Partial<MarkdownFile> = {}): MarkdownFile {
  return {
    id: `file-${Math.random().toString(36).slice(2)}`,
    name: 'untitled.md',
    content: '# Title\n\nSome content here.',
    wordCount: 5,
    charCount: 30,
    updatedAt: Date.now(),
    filePath: null,
    isDirty: false,
    folder: '',
    ...overrides,
  };
}

function makeCommand(overrides: Partial<AppCommand> = {}): AppCommand {
  return {
    id: 'test-cmd',
    label: 'Test Command',
    icon: 'Zap',
    action: vi.fn(),
    ...overrides,
  };
}

const darkTheme = { isDark: true, borderClass: 'border-white/10' };

interface RenderOpts {
  files?: MarkdownFile[];
  recentlyViewedIds?: string[];
  commands?: AppCommand[];
  onSelectFile?: (id: string) => void;
  onClose?: () => void;
}

function renderPalette({
  files = [],
  recentlyViewedIds = [],
  commands = [],
  onSelectFile = vi.fn(),
  onClose = vi.fn(),
}: RenderOpts = {}) {
  const utils = render(
    <CommandPalette
      files={files}
      recentlyViewedIds={recentlyViewedIds}
      commands={commands}
      themeInfo={darkTheme}
      onSelectFile={onSelectFile}
      onClose={onClose}
    />
  );
  const input = screen.getByRole('combobox');
  return { ...utils, input, onSelectFile, onClose };
}

// -------------------------------------------------------
// Initial render
// -------------------------------------------------------
describe('CommandPalette — initial render', () => {
  it('renders the search input', () => {
    const { input } = renderPalette();
    expect(input).toBeInTheDocument();
  });

  it('shows FILE mode badge by default', () => {
    renderPalette();
    expect(screen.getByText('FILE')).toBeInTheDocument();
  });

  it('shows a file count in the hint area when files are loaded', () => {
    const files = [makeFile(), makeFile()];
    renderPalette({ files });
    // The hint text contains "2 files"
    expect(screen.getByText((text) => text.includes('2 files'))).toBeInTheDocument();
  });

  it('shows "No results found" when files list is empty', () => {
    renderPalette({ files: [] });
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });
});

// -------------------------------------------------------
// File mode search
// -------------------------------------------------------
describe('CommandPalette — file mode search', () => {
  const files = [
    makeFile({ id: 'a', name: 'Getting Started.md', content: 'Welcome to Fosgail!' }),
    makeFile({ id: 'b', name: 'Architecture Notes.md', content: 'The app uses Zustand.' }),
    makeFile({ id: 'c', name: 'Changelog.md', content: 'Version 1.0 released.' }),
  ];

  it('shows all files with no search query', () => {
    renderPalette({ files });
    expect(screen.getByText('Getting Started.md')).toBeInTheDocument();
    expect(screen.getByText('Architecture Notes.md')).toBeInTheDocument();
    expect(screen.getByText('Changelog.md')).toBeInTheDocument();
  });

  it('filters files by name', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ files });
    await user.type(input, 'arch');
    expect(screen.getByText('Architecture Notes.md')).toBeInTheDocument();
    expect(screen.queryByText('Getting Started.md')).not.toBeInTheDocument();
  });

  it('finds files by content when name does not match', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ files });
    await user.type(input, 'Zustand');
    expect(screen.getByText('Architecture Notes.md')).toBeInTheDocument();
    // Content match badge
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows "no results" when nothing matches', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ files });
    await user.type(input, 'xyznotfound999');
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it('shows result count after searching', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ files });
    await user.type(input, 'notes');
    // The hint says "1 result"
    expect(screen.getByText((text) => text.includes('1 result'))).toBeInTheDocument();
  });
});

// -------------------------------------------------------
// Recently viewed ordering
// -------------------------------------------------------
describe('CommandPalette — recently viewed', () => {
  const files = [
    makeFile({ id: 'alpha', name: 'alpha.md' }),
    makeFile({ id: 'beta', name: 'beta.md' }),
    makeFile({ id: 'gamma', name: 'gamma.md' }),
  ];

  it('shows recent files with a "Recent" badge', () => {
    renderPalette({ files, recentlyViewedIds: ['alpha'] });
    // Both the section header and the badge say "Recent"
    const recentLabels = screen.getAllByText('Recent');
    expect(recentLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('lists recent files before non-recent files when no query', () => {
    renderPalette({ files, recentlyViewedIds: ['gamma'] });
    const allFileNames = screen
      .getAllByText(/\.md$/)
      .map((el) => el.textContent ?? '');
    const gammaIdx = allFileNames.findIndex((n) => n.includes('gamma'));
    const alphaIdx = allFileNames.findIndex((n) => n.includes('alpha'));
    expect(gammaIdx).toBeLessThan(alphaIdx);
  });
});

// -------------------------------------------------------
// Command mode (> prefix)
// -------------------------------------------------------
describe('CommandPalette — command mode', () => {
  const commands = [
    makeCommand({ id: 'zen', label: 'Toggle Zen Mode', action: vi.fn() }),
    makeCommand({ id: 'pdf', label: 'Export to PDF', action: vi.fn() }),
    makeCommand({ id: 'save', label: 'Save File to Disk', shortcut: 'Cmd+S', action: vi.fn() }),
  ];

  it('switches to command mode when > is typed', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ commands });
    await user.type(input, '>');
    expect(screen.getByText('CMD')).toBeInTheDocument();
  });

  it('shows all commands in command mode with no additional query', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ commands });
    await user.type(input, '>');
    expect(screen.getByText('Toggle Zen Mode')).toBeInTheDocument();
    expect(screen.getByText('Export to PDF')).toBeInTheDocument();
  });

  it('filters commands by label', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ commands });
    await user.type(input, '> zen');
    expect(screen.getByText('Toggle Zen Mode')).toBeInTheDocument();
    expect(screen.queryByText('Export to PDF')).not.toBeInTheDocument();
  });

  it('renders keyboard shortcut for commands that have one', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ commands });
    await user.type(input, '>');
    expect(screen.getByText('Cmd+S')).toBeInTheDocument();
  });

  it('shows command count in mode hint', async () => {
    const user = userEvent.setup();
    const { input } = renderPalette({ commands });
    await user.type(input, '>');
    expect(screen.getByText((text) => text.includes('3 commands'))).toBeInTheDocument();
  });

  it('calls command action when item is clicked in command mode', async () => {
    const actionFn = vi.fn();
    const cmd = makeCommand({ label: 'Do Action', action: actionFn });
    renderPalette({ commands: [cmd] });
    const user = userEvent.setup();
    const input = screen.getByRole('combobox');
    await user.type(input, '>');
    // Click the row containing "Do Action"
    const label = screen.getByText('Do Action');
    // Walk up to the clickable parent
    fireEvent.click(label.closest('[class*="cursor-pointer"]') || label);
    expect(actionFn).toHaveBeenCalled();
  });
});

// -------------------------------------------------------
// Keyboard navigation
// -------------------------------------------------------
describe('CommandPalette — keyboard navigation', () => {
  const files = [
    makeFile({ id: 'x1', name: 'alpha.md' }),
    makeFile({ id: 'x2', name: 'beta.md' }),
    makeFile({ id: 'x3', name: 'gamma.md' }),
  ];

  it('calls onSelectFile with correct id when Enter is pressed on first result', () => {
    const onSelectFile = vi.fn();
    renderPalette({ files, onSelectFile });
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelectFile).toHaveBeenCalledWith('x1');
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    renderPalette({ files, onClose });
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('ArrowDown moves selection to second item, Enter selects it', () => {
    const onSelectFile = vi.fn();
    renderPalette({ files, onSelectFile });
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelectFile).toHaveBeenCalledWith('x2');
  });

  it('ArrowUp from first item wraps to last item', () => {
    const onSelectFile = vi.fn();
    renderPalette({ files, onSelectFile });
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelectFile).toHaveBeenCalledWith('x3');
  });

  it('calls onSelectFile when a file row is clicked', () => {
    const onSelectFile = vi.fn();
    renderPalette({ files, onSelectFile });
    // Click on the text of the first file — walks to its clickable ancestor
    const label = screen.getByText('alpha.md');
    fireEvent.click(label.closest('[class*="cursor-pointer"]') || label);
    expect(onSelectFile).toHaveBeenCalledWith('x1');
  });
});
