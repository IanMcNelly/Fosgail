/**
 * Pure utility functions shared across the app.
 * Extracted here so they can be imported and unit-tested without
 * pulling in React or Tauri dependencies.
 */

/** Normalize path separators to forward slashes (cross-platform) */
export const normalizePath = (p: string) => p.replace(/\\/g, '/').replace(/\/+/g, '/');

/** Slugify a heading text to produce a stable HTML id */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Stable code block key based on a lightweight content hash */
export function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

/** Count words and characters in a markdown string */
export function calculateWordCharCount(text: string): { wordCount: number; charCount: number } {
  const cleanText = text.trim();
  const wordCount = cleanText === '' ? 0 : cleanText.split(/\s+/).length;
  const charCount = text.length;
  return { wordCount, charCount };
}

/** Extract h1/h2/h3 headings from markdown content */
export interface ParsedHeading {
  level: 1 | 2 | 3;
  text: string;
  slug: string;
}

export function parseHeadings(content: string): ParsedHeading[] {
  const lines = content.split('\n');
  const result: ParsedHeading[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length as 1 | 2 | 3;
      const text = match[2].replace(/[*_`~]/g, '').trim();
      result.push({ level, text, slug: slugify(text) });
    }
  }
  return result;
}
