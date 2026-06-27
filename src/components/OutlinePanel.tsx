/**
 * OutlinePanel — floating document outline (Typora-style).
 * Shows h1/h2/h3 headings from the active document and allows
 * clicking to scroll the preview to that section.
 */

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { List, X } from 'lucide-react';
import { parseHeadings, ParsedHeading } from '../utils';


interface Heading extends ParsedHeading {}


interface OutlinePanelProps {
  content: string;
  themeInfo: {
    isDark: boolean;
    borderClass: string;
  };
  onClose: () => void;
}

function slugify(text: string): string {
  // kept here as a local reference — canonical version is in utils.ts
  return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

export default function OutlinePanel({ content, themeInfo, onClose }: OutlinePanelProps) {
  const headings = useMemo<Heading[]>(() => parseHeadings(content), [content]);


  const handleClickHeading = (slug: string) => {
    // Scroll the preview viewport to the matching heading element
    const targetEl = document.getElementById(`heading-${slug}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      key="outline-panel"
      initial={{ opacity: 0, x: 16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className={`absolute top-3 right-3 z-30 w-64 max-h-[70vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${
        themeInfo.isDark
          ? 'bg-zinc-950/95 border-white/10 backdrop-blur-xl'
          : 'bg-white/95 border-neutral-200 backdrop-blur-xl'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 border-b shrink-0 ${themeInfo.isDark ? 'border-white/8' : 'border-neutral-200/80'}`}>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          <List size={12} className="text-accent" />
          <span>Outline</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-white/8 transition-colors cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>

      {/* Heading list */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {headings.length === 0 ? (
          <div className="py-6 text-center text-[11px] text-neutral-400 italic px-3">
            No headings found. Add `#`, `##`, or `###` to your document.
          </div>
        ) : (
          <ul className="space-y-0.5">
            {headings.map((heading, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => handleClickHeading(heading.slug)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors group ${
                    themeInfo.isDark
                      ? 'hover:bg-white/6 text-neutral-300 hover:text-white'
                      : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                  }`}
                  style={{
                    paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
                  }}
                >
                  <span className={`flex items-center gap-1.5 leading-tight ${heading.level === 1 ? 'font-bold' : heading.level === 2 ? 'font-semibold' : 'font-medium'}`}>
                    <span className={`shrink-0 text-[9px] font-mono font-bold w-4 ${
                      heading.level === 1
                        ? 'text-accent'
                        : heading.level === 2
                        ? 'text-accent/70'
                        : 'text-accent/50'
                    }`}>
                      {'#'.repeat(heading.level)}
                    </span>
                    <span className="truncate">{heading.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer count */}
      {headings.length > 0 && (
        <div className={`px-3 py-1.5 border-t shrink-0 text-[9px] text-neutral-500 font-mono ${themeInfo.isDark ? 'border-white/8' : 'border-neutral-200/80'}`}>
          {headings.length} heading{headings.length !== 1 ? 's' : ''}
        </div>
      )}
    </motion.div>
  );
}
