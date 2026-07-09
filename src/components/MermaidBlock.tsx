/**
 * MermaidBlock — lazy-loaded Mermaid diagram renderer.
 * This file is only imported when a mermaid code block is detected,
 * keeping it completely out of the initial bundle.
 */

import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

interface MermaidBlockProps {
  code: string;
}

let mermaidInitialized = false;

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const mermaid = (await import('mermaid')).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
              primaryColor: '#7c3aed',
              primaryTextColor: '#e2e8f0',
              primaryBorderColor: '#6d28d9',
              lineColor: '#94a3b8',
              background: '#0f0f13',
              mainBkg: '#1a1a24',
              nodeBorder: '#6d28d9',
              clusterBkg: '#111118',
              titleColor: '#e2e8f0',
              edgeLabelBackground: '#1a1a24',
            },
            flowchart: { curve: 'basis' },
          });
          mermaidInitialized = true;
        }

        // Generate a unique id for this block
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);

        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to render diagram');
          setSvg(null);
        }
      }
    };

    render();

    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400 text-xs font-mono">
        <div className="font-bold mb-1">Mermaid Error</div>
        <div className="opacity-80">{error}</div>
        <pre className="mt-2 text-[10px] opacity-60 whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 p-6 rounded-xl border border-neutral-700/30 bg-neutral-900/20 flex items-center justify-center">
        <div className="text-xs text-neutral-500 animate-pulse">Rendering diagram...</div>
      </div>
    );
  }

  // SECURE: Sanitize Mermaid SVG output before rendering to prevent XSS
  const sanitizedSvg = DOMPurify.sanitize(svg);

  return (
    <div
      ref={containerRef}
      className="my-4 p-4 rounded-xl border border-neutral-700/30 bg-neutral-900/20 overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
    />
  );
}
