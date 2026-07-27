import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarkdownOutput from '../../components/MarkdownOutput';
import { CSSTheme } from '../../types';

const mockTheme: CSSTheme = { id: 'light', name: 'Light', description: '', isDark: false, cssRules: '' };

// Mock dependencies
vi.mock('mermaid', () => ({
  default: { initialize: vi.fn(), run: vi.fn() }
}));

describe('MarkdownOutput XSS tests', () => {
  it('prevents javascript: URIs with spaces in links', () => {
    const maliciousMd = '[Click me](javascript:alert("XSS"))\n\n[Click me 2](  javascript:alert("XSS"))\n\n[Click me 3](java\x00script:alert(1))';
    render(
      <MarkdownOutput
        content={maliciousMd}
        theme={mockTheme}
        syncScrollPercent={null}
      />
    );
    // react-markdown filters javascript: completely, so href="" is okay too
    const links = document.querySelectorAll('a');
    expect(links[0].getAttribute('href')).toBe('');
    expect(links[1].getAttribute('href')).toBe('');
    expect(links[2].getAttribute('href')).toBe('');
  });

  it('prevents javascript: URIs in images', () => {
    const maliciousMd = '![XSS](javascript:alert("XSS"))\n\n![XSS 2](  javascript:alert("XSS"))';
    render(
      <MarkdownOutput
        content={maliciousMd}
        theme={mockTheme}
        syncScrollPercent={null}
      />
    );
    const imgs = document.querySelectorAll('img');
    // react-markdown sets src to empty string or doesn't render it based on strictness
    if(imgs.length > 0) {
        expect(imgs[0].getAttribute('src') || '').not.toContain('javascript');
        if(imgs.length > 1) {
            expect(imgs[1].getAttribute('src') || '').not.toContain('javascript');
        }
    }
  });
});
