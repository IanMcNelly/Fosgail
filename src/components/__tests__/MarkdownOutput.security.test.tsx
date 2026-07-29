import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarkdownOutput from '../MarkdownOutput';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import { CSSTheme } from '../../types';

vi.mock('mermaid', () => ({ default: { initialize: vi.fn(), run: vi.fn() } }));

const dummyTheme: CSSTheme = {
  id: 'github-dark',
  name: 'GitHub Dark',
  description: 'Test theme',
  isDark: true,
  cssRules: ''
};

describe('MarkdownOutput Security', () => {
  it('prevents XSS with control characters in links', () => {
    // We use <\x08javascript:...> to force react-markdown to parse it as a link instead of text
    // The \x08 is a backspace control character which can bypass naive .trim() checks
    const content = `[Link](<\x08javascript:alert(1)>)`;
    // We test the component directly to verify its prop forwarding and custom renderers
    const { container } = render(<MarkdownOutput content={content} theme={dummyTheme} syncScrollPercent={null} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href') || '').not.toMatch(/javascript:/i);
  });

  it('prevents XSS with control characters in images', () => {
    const content = `![Image](<\x08javascript:alert(1)>)`;
    const { container } = render(<MarkdownOutput content={content} theme={dummyTheme} syncScrollPercent={null} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src') || '').not.toMatch(/javascript:/i);
  });
});
