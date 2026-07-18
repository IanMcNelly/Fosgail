import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MarkdownOutput from '../../components/MarkdownOutput';
import type { CSSTheme } from '../../types';

// Minimal dark theme for tests
const testTheme: CSSTheme = {
  id: 'test-dark',
  name: 'Test Dark',
  description: 'Test theme',
  isDark: true,
  cssRules: '',
};

function renderOutput(content: string, syncScrollPercent: number | null = null) {
  return render(
    <MarkdownOutput content={content} theme={testTheme} syncScrollPercent={syncScrollPercent} />
  );
}

// -------------------------------------------------------
// Basic markdown rendering
// -------------------------------------------------------
describe('MarkdownOutput — basic rendering', () => {
  it('renders a paragraph of text', () => {
    renderOutput('Hello, world!');
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('renders a strong/bold element', () => {
    renderOutput('This is **bold** text');
    const bold = document.querySelector('strong');
    expect(bold).toBeInTheDocument();
    expect(bold?.textContent).toBe('bold');
  });

  it('renders a blockquote', () => {
    renderOutput('> This is a quote');
    expect(document.querySelector('blockquote')).toBeInTheDocument();
  });

  it('renders an unordered list', () => {
    renderOutput('- Item one\n- Item two\n- Item three');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders a table', () => {
    const table = `
| Col A | Col B |
|-------|-------|
| a1    | b1    |
| a2    | b2    |
`.trim();
    renderOutput(table);
    expect(document.querySelector('table')).toBeInTheDocument();
    expect(screen.getByText('Col A')).toBeInTheDocument();
  });
});

// -------------------------------------------------------
// Heading ID generation (regression: the useMemo fix)
// -------------------------------------------------------
describe('MarkdownOutput — heading IDs', () => {
  it('adds a slugified id to h1', () => {
    renderOutput('# My Main Title');
    const h1 = document.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.id).toBe('heading-my-main-title');
  });

  it('adds a slugified id to h2', () => {
    renderOutput('## Getting Started');
    const h2 = document.querySelector('h2');
    expect(h2?.id).toBe('heading-getting-started');
  });

  it('adds a slugified id to h3', () => {
    renderOutput('### Sub Section');
    const h3 = document.querySelector('h3');
    expect(h3?.id).toBe('heading-sub-section');
  });

  it('handles heading with special chars in slug', () => {
    renderOutput('## What is React? (2025)');
    const h2 = document.querySelector('h2');
    expect(h2?.id).toBe('heading-what-is-react-2025');
  });
});

// -------------------------------------------------------
// Code blocks (regression: no useMemo inside renderers)
// -------------------------------------------------------
describe('MarkdownOutput — code blocks', () => {
  it('renders a fenced code block without crashing', () => {
    expect(() => {
      renderOutput('```typescript\nconst x: number = 42;\n```');
    }).not.toThrow();
  });

  it('renders the language badge for a code block', async () => {
    renderOutput('```python\nprint("hello")\n```');
    await waitFor(() => {
      expect(screen.getByText('python')).toBeInTheDocument();
    });
  });

  it('renders a Copy button for each code block', async () => {
    renderOutput('```js\nconsole.log("hi");\n```');
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  it('shows "✓ Copied" after clicking the Copy button', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    renderOutput('```bash\necho hello\n```');
    await waitFor(() => {
      const btn = screen.getByText('Copy');
      fireEvent.click(btn);
    });

    await waitFor(() => {
      expect(screen.getByText('✓ Copied')).toBeInTheDocument();
    });
  });

  it('renders inline code without wrapping it in a block', () => {
    renderOutput('Use the `useState` hook');
    const code = document.querySelector('code:not(pre code)');
    expect(code?.textContent).toBe('useState');
  });

  it('renders multiple code blocks independently', () => {
    renderOutput('```ts\nconst a = 1;\n```\n\n```py\nprint(b)\n```');
    const badges = screen.getAllByText(/^(ts|py)$/);
    expect(badges).toHaveLength(2);
  });
});

// -------------------------------------------------------
// GFM task lists
// -------------------------------------------------------
describe('MarkdownOutput — GFM task lists', () => {
  it('renders checked and unchecked checkboxes', () => {
    renderOutput('- [x] Done\n- [ ] Not done');
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });
});

// -------------------------------------------------------
// Links
// -------------------------------------------------------
describe('MarkdownOutput — links', () => {
  it('renders links with target=_blank', () => {
    renderOutput('[Fosgail](https://example.com)');
    const link = screen.getByText('Fosgail');
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
    expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});



describe('MarkdownOutput - Security', () => {
  it('should block javascript: links even with leading spaces', () => {
    const { container } = render(<MarkdownOutput content="[Malicious]( javascript:alert('xss'))" theme={{ id: 'test', name: 'Test', description: '', isDark: false, cssRules: '' }} syncScrollPercent={null} />);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '');
  });

  it('should block data: links even with leading spaces', () => {
    const { container } = render(<MarkdownOutput content="[Malicious](\x00data:text/html,<script>alert(1)</script>)" theme={{ id: 'test', name: 'Test', description: '', isDark: false, cssRules: '' }} syncScrollPercent={null} />);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '');
  });
});
