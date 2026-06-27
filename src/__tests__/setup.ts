/// <reference types="vitest/globals" />
/**
 * Vitest global test setup.
 * Runs before every test file.
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// -------------------------------------------------------
// jsdom polyfills
// -------------------------------------------------------
// scrollIntoView is not implemented in jsdom
Element.prototype.scrollIntoView = vi.fn();
// scrollTo is not implemented in jsdom
window.scrollTo = vi.fn() as any;

// -------------------------------------------------------
// Mock Tauri APIs — they don't exist in jsdom
// -------------------------------------------------------
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    close: vi.fn(),
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
  }),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  readDir: vi.fn(),
}));

// -------------------------------------------------------
// Mock motion/react — prevents animation-related test noise
// -------------------------------------------------------
vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();
  const React = await import('react');
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) =>
          // Return a plain element wrapper that ignores animation props
          ({ children, ...props }: any) => {
            const { initial, animate, exit, transition, whileHover, ...rest } = props;
            return React.createElement(tag, rest, children);
          },
      }
    ),
    AnimatePresence: ({ children }: any) => children,
  };
});

// -------------------------------------------------------
// Mock mermaid — avoid heavy library in unit tests
// -------------------------------------------------------
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mermaid-svg"></svg>' }),
  },
}));

// -------------------------------------------------------
// Silence console.warn in tests (Prism language warnings etc.)
// -------------------------------------------------------
beforeAll(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
