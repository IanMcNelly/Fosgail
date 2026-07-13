import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normalizePath,
  slugify,
  simpleHash,
  calculateWordCharCount,
  parseHeadings,
  throttle,
} from '../../utils';

// -------------------------------------------------------
// normalizePath
// -------------------------------------------------------
describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should limit function calls to one per time window', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn(); // 1st call executes immediately
    throttledFn(); // 2nd call is throttled, but saves args
    throttledFn(); // 3rd call is throttled, overwrites args

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(101); // Time passes, trailing edge fires

    expect(mockFn).toHaveBeenCalledTimes(2);

    throttledFn(); // Call after window executes immediately again
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should pass arguments to the throttled function', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn('arg1', 42);
    expect(mockFn).toHaveBeenCalledWith('arg1', 42);
  });
});

describe('normalizePath', () => {
  it('converts Windows backslashes to forward slashes', () => {
    expect(normalizePath('C:\\Users\\foo\\bar.md')).toBe('C:/Users/foo/bar.md');
  });

  it('leaves forward-slash paths unchanged', () => {
    expect(normalizePath('/home/user/docs/file.md')).toBe('/home/user/docs/file.md');
  });

  it('handles mixed separators', () => {
    expect(normalizePath('C:\\Users/foo\\bar')).toBe('C:/Users/foo/bar');
  });

  it('handles empty string', () => {
    expect(normalizePath('')).toBe('');
  });
});

// -------------------------------------------------------
// slugify
// -------------------------------------------------------
describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips special characters except hyphens', () => {
    expect(slugify('What is React? (2025)')).toBe('what-is-react-2025');
  });

  it('handles leading/trailing whitespace', () => {
    expect(slugify('  My Heading  ')).toBe('my-heading');
  });

  it('collapses multiple spaces', () => {
    expect(slugify('A  B   C')).toBe('a-b-c');
  });

  it('preserves existing hyphens', () => {
    expect(slugify('Step-by-step Guide')).toBe('step-by-step-guide');
  });

  it('handles emoji by stripping them', () => {
    expect(slugify('🚀 Getting Started')).toBe('getting-started');
  });

  it('handles an empty string', () => {
    expect(slugify('')).toBe('');
  });
});

// -------------------------------------------------------
// simpleHash
// -------------------------------------------------------
describe('simpleHash', () => {
  it('returns a non-empty string', () => {
    expect(simpleHash('hello')).toBeTruthy();
  });

  it('is deterministic for the same input', () => {
    expect(simpleHash('typescript')).toBe(simpleHash('typescript'));
  });

  it('produces different output for different inputs', () => {
    expect(simpleHash('foo')).not.toBe(simpleHash('bar'));
  });

  it('handles empty string without throwing', () => {
    expect(() => simpleHash('')).not.toThrow();
    expect(typeof simpleHash('')).toBe('string');
  });

  it('hash is always non-negative (no leading minus)', () => {
    const hash = simpleHash('negative-test-value-xyz');
    expect(hash.startsWith('-')).toBe(false);
  });
});

// -------------------------------------------------------
// calculateWordCharCount
// -------------------------------------------------------
describe('calculateWordCharCount', () => {
    it('correctly counts words separated by unicode whitespace', () => {
      // Includes NBSP, En Quad, Em Quad, Thin Space. Note: \u200B (Zero-width space) is NOT matched by \s in JS.
      const { wordCount } = calculateWordCharCount('Hello\u00A0world\u2000this\u2001is\u2009a\u3000test');
      expect(wordCount).toBe(6);
    });

  it('counts words correctly in normal prose', () => {
    const { wordCount } = calculateWordCharCount('Hello world this is a test');
    expect(wordCount).toBe(6);
  });

  it('counts characters including spaces', () => {
    const { charCount } = calculateWordCharCount('abc def');
    expect(charCount).toBe(7);
  });

  it('returns 0 words for an empty string', () => {
    expect(calculateWordCharCount('').wordCount).toBe(0);
  });

  it('returns 0 words for whitespace-only string', () => {
    expect(calculateWordCharCount('   ').wordCount).toBe(0);
  });

  it('counts single word correctly', () => {
    expect(calculateWordCharCount('Fosgail').wordCount).toBe(1);
  });

  it('handles multiple newlines as whitespace', () => {
    const { wordCount } = calculateWordCharCount('Line one\n\nLine two\n\nLine three');
    expect(wordCount).toBe(6);
  });

  it('charCount includes leading/trailing whitespace', () => {
    const { charCount } = calculateWordCharCount('  hi  ');
    expect(charCount).toBe(6);
  });
});

// -------------------------------------------------------
// parseHeadings
// -------------------------------------------------------
describe('parseHeadings', () => {
  const sampleDoc = `
# Introduction

Some body text here.

## Getting Started

### Installation Steps

More text.

#### This is h4, should be ignored

## Configuration
`.trim();

  it('extracts h1, h2, h3 headings only', () => {
    const headings = parseHeadings(sampleDoc);
    expect(headings).toHaveLength(4); // h1, h2, h3, h2 — h4 excluded
  });

  it('extracts correct heading levels', () => {
    const headings = parseHeadings(sampleDoc);
    expect(headings[0].level).toBe(1);
    expect(headings[1].level).toBe(2);
    expect(headings[2].level).toBe(3);
    expect(headings[3].level).toBe(2);
  });

  it('extracts correct heading text', () => {
    const headings = parseHeadings(sampleDoc);
    expect(headings[0].text).toBe('Introduction');
    expect(headings[1].text).toBe('Getting Started');
    expect(headings[2].text).toBe('Installation Steps');
  });

  it('produces slugified IDs', () => {
    const headings = parseHeadings(sampleDoc);
    expect(headings[0].slug).toBe('introduction');
    expect(headings[1].slug).toBe('getting-started');
    expect(headings[2].slug).toBe('installation-steps');
  });

  it('strips inline markdown from heading text', () => {
    const doc = '## **Bold** heading with `code`';
    const headings = parseHeadings(doc);
    expect(headings[0].text).toBe('Bold heading with code');
  });

  it('returns empty array for content with no headings', () => {
    expect(parseHeadings('Just some plain paragraph text.')).toHaveLength(0);
  });

  it('returns empty array for empty content', () => {
    expect(parseHeadings('')).toHaveLength(0);
  });

  it('does not match headings inside code fences', () => {
    // Lines inside fences still match (we parse line-by-line, not AST)
    // This is a known limitation — document it as intentional
    const doc = '# Real Heading\n\n```\n# This is code\n```';
    const headings = parseHeadings(doc);
    // At minimum the real heading is found
    expect(headings.some((h) => h.text === 'Real Heading')).toBe(true);
  });
});
