/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState, useRef, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';

// Import necessary languages for syntax highlighting
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

import { CSSTheme } from '../types';
import { slugify, simpleHash } from '../utils';

// Lazy-load Mermaid renderer — zero cost unless a mermaid block exists
const MermaidBlock = lazy(() => import('./MermaidBlock'));

// Extract and memoize the expensive Markdown rendering
const MemoizedMarkdown = React.memo(({ content, components }: { content: string, components: any }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {content}
  </ReactMarkdown>
));

interface MarkdownOutputProps {
  content: string;
  theme: CSSTheme;
  /** When set, scroll the preview to this percentage (0–1). Null = uncontrolled. */
  syncScrollPercent: number | null;
  /** Callback to send scroll percentage back for bidirectional sync */
  onSyncScroll?: (pct: number) => void;
  /** Callback to navigate to internal markdown links */
  onNavigate?: (href: string) => void;
}

const CodeBlock = React.memo(({ language, value, blockId }: { language: string, value: string, blockId: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  let highlighted = value;
  try {
    const prismLang = Prism.languages[language] || Prism.languages.markup;
    highlighted = Prism.highlight(value, prismLang, language);
  } catch (err) {
    console.warn('Prism failed to highlight language:', language, err);
  }

  return (
    <div className="relative group/code-block my-4 rounded-xl overflow-hidden border border-neutral-200/60 dark:border-neutral-700/40 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200/50 dark:border-neutral-700/30 bg-neutral-100/70 dark:bg-neutral-900/40">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
          {language}
        </span>
        <button
          type="button"
          id={`btn-copy-code-${blockId}`}
          onClick={handleCopy}
          className="px-2 py-0.5 text-[10px] font-semibold rounded-md cursor-pointer transition-all bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
        >
          {isCopied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className={`language-${language} !my-0 !rounded-none !rounded-b-xl`}>
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
});

export default function MarkdownOutput({ content, theme, syncScrollPercent, onSyncScroll, onNavigate }: MarkdownOutputProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  // Detect mermaid usage — only import the library if needed
  const hasMermaid = useMemo(() => content.includes('```mermaid'), [content]);


  // Apply synchronized scroll from the editor
  useEffect(() => {
    if (syncScrollPercent === null) return;
    const el = viewportRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) return;
    
    // Check if the current scroll position is roughly the same to avoid echo
    const currentPercent = el.scrollTop / maxScroll;
    if (Math.abs(currentPercent - syncScrollPercent) > 0.01) {
      isSyncingRef.current = true;
      el.scrollTop = syncScrollPercent * maxScroll;
    }
  }, [syncScrollPercent]);

  const handleScroll = () => {
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    if (!onSyncScroll) return;
    const el = viewportRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      onSyncScroll(el.scrollTop / maxScroll);
    }
  };

  // Define custom renderers for react-markdown
  // IMPORTANT: useMemo and hooks cannot be called inside these renderer callbacks.
  // We use simpleHash() to derive stable IDs without hooks.
  
  // Helper to extract raw text from React node children
  const extractTextContent = (node: any): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractTextContent).join('');
    if (node && node.props && node.props.children) return extractTextContent(node.props.children);
    return '';
  };

  const components = useMemo(() => {
    return {
      code({ node, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        const isBlock = !!match;
        const value = String(children).replace(/\n$/, '');

        if (isBlock && match) {
          const language = match[1];

          // Handle mermaid diagrams — lazy-loaded
          if (language === 'mermaid' && hasMermaid) {
            return (
              <Suspense fallback={<div className="p-4 text-xs text-neutral-400 italic">Rendering diagram...</div>}>
                <MermaidBlock code={value} />
              </Suspense>
            );
          }

          // Standard code block with Prism highlighting
          // Compute a stable block ID from content — no hook calls here
          const blockId = simpleHash(value + language);

          return <CodeBlock language={language} value={value} blockId={blockId} />;
        }

        // Inline code
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },

      // Headings with stable slug IDs so the Outline Panel can scroll to them
      h1({ children, ...props }: any) {
        const text = extractTextContent(children);
        return <h1 id={`heading-${slugify(text)}`} {...props}>{children}</h1>;
      },
      h2({ children, ...props }: any) {
        const text = extractTextContent(children);
        return <h2 id={`heading-${slugify(text)}`} {...props}>{children}</h2>;
      },
      h3({ children, ...props }: any) {
        const text = extractTextContent(children);
        return <h3 id={`heading-${slugify(text)}`} {...props}>{children}</h3>;
      },

      // Open links in external browser or internal navigation
      a({ node, href, children, ...props }: any) {
        if (href && !href.startsWith('http') && href.endsWith('.md')) {
          return (
            <a
              href={href}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate(href);
              }}
              className="cursor-pointer"
              {...props}
            >
              {children}
            </a>
          );
        }
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        );
      },

      // Styled task list checkboxes
      input({ node, ...props }: any) {
        if (props.type === 'checkbox') {
          return (
            <input
              type="checkbox"
              readOnly
              checked={props.checked}
              id={`task-checkbox-${simpleHash(String(props.checked))}`}
              className="mr-2 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 text-accent accent-accent cursor-default focus:ring-0"
              style={{ verticalAlign: 'middle', position: 'relative', top: '-1px' }}
            />
          );
        }
        return <input {...props} />;
      },
    };
  }, [hasMermaid, onNavigate]);

  return (
    <div
      id="compiled-markdown-viewport"
      ref={viewportRef}
      onScroll={handleScroll}
      className={`w-full h-full overflow-y-auto ${syncScrollPercent !== null ? 'hide-scrollbar' : ''}`}
    >
      <div className="markdown-body min-h-full w-full max-w-none px-6 py-6 md:px-12 md:py-10 transition-all duration-300">
        <MemoizedMarkdown content={content} components={components} />
      </div>
    </div>
  );
}
