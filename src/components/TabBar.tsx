import React, { useRef } from 'react';
import { X, FileText } from 'lucide-react';
import { MarkdownFile } from '../types';

interface TabBarProps {
  files: MarkdownFile[];
  recentlyViewedIds: string[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  themeInfo: {
    appBg: string;
    isDark: boolean;
    borderClass: string;
    activeFileBg: string;
  };
}

export default function TabBar({
  files,
  recentlyViewedIds,
  activeFileId,
  onSelectFile,
  onCloseTab,
  themeInfo,
}: TabBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  // Only show tabs if there are files in recently viewed
  if (recentlyViewedIds.length === 0) return null;

  return (
    <div 
      className={`flex items-center overflow-x-auto no-scrollbar border-b shrink-0 ${
        themeInfo.isDark ? 'bg-[#111113] border-white/5' : 'bg-neutral-100 border-neutral-200'
      }`}
      onWheel={handleWheel}
      ref={scrollContainerRef}
    >
      {recentlyViewedIds.map((id) => {
        const file = files.find((f) => f.id === id);
        if (!file) return null;
        
        const isActive = id === activeFileId;
        
        return (
          <div
            key={id}
            onClick={() => onSelectFile(id)}
            className={`group relative flex items-center gap-2 px-3 py-1.5 border-r cursor-pointer min-w-[120px] max-w-[200px] transition-colors select-none ${
              themeInfo.isDark ? 'border-white/5' : 'border-neutral-200'
            } ${
              isActive 
                ? themeInfo.isDark ? 'bg-[#18181b]' : 'bg-white'
                : themeInfo.isDark ? 'hover:bg-white/5 text-neutral-400' : 'hover:bg-neutral-50 text-neutral-500'
            }`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div className="absolute top-0 left-0 w-full h-[2px] bg-accent" />
            )}
            
            <FileText size={12} className={isActive ? 'text-accent shrink-0' : 'text-neutral-400 shrink-0'} />
            
            <span className={`text-[11px] truncate flex-1 font-medium ${isActive ? (themeInfo.isDark ? 'text-neutral-200' : 'text-neutral-800') : ''}`}>
              {file.name}
            </span>
            
            {file.isDirty && !isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
            )}
            
            <button
              onClick={(e) => onCloseTab(id, e)}
              aria-label={`Close ${file.name} tab`}
              title="Close tab"
              className={`p-0.5 rounded transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 shrink-0`}
              aria-label={`Close tab ${file.name}`}
            >
              <X size={10} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
