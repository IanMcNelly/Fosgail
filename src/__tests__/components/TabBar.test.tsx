import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TabBar from '../../components/TabBar';
import { MarkdownFile } from '../../types';

describe('TabBar component', () => {
  const mockFiles: MarkdownFile[] = [
    {
      id: 'file-1',
      name: 'test1.md',
      content: '# Test 1',
      wordCount: 2,
      charCount: 8,
      updatedAt: 123456789,
      folder: '',
      filePath: '/workspace/test1.md',
      isDirty: false,
      isLoaded: true
    },
    {
      id: 'file-2',
      name: 'test2.md',
      content: '# Test 2',
      wordCount: 2,
      charCount: 8,
      updatedAt: 123456790,
      folder: '',
      filePath: '/workspace/test2.md',
      isDirty: true,
      isLoaded: true
    }
  ];

  const themeInfo = {
    appBg: 'bg-white',
    isDark: false,
    borderClass: 'border-gray-200',
    activeFileBg: 'bg-gray-100',
  };

  it('renders tabs for recentlyViewedIds', () => {
    render(
      <TabBar
        files={mockFiles}
        recentlyViewedIds={['file-1', 'file-2']}
        activeFileId="file-1"
        onSelectFile={vi.fn()}
        onCloseTab={vi.fn()}
        themeInfo={themeInfo}
      />
    );
    
    expect(screen.getByText('test1.md')).toBeInTheDocument();
    expect(screen.getByText('test2.md')).toBeInTheDocument();
  });

  it('does not render anything if recentlyViewedIds is empty', () => {
    const { container } = render(
      <TabBar
        files={mockFiles}
        recentlyViewedIds={[]}
        activeFileId={null}
        onSelectFile={vi.fn()}
        onCloseTab={vi.fn()}
        themeInfo={themeInfo}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('calls onSelectFile when a tab is clicked', () => {
    const onSelectFileMock = vi.fn();
    render(
      <TabBar
        files={mockFiles}
        recentlyViewedIds={['file-1', 'file-2']}
        activeFileId="file-1"
        onSelectFile={onSelectFileMock}
        onCloseTab={vi.fn()}
        themeInfo={themeInfo}
      />
    );
    
    fireEvent.click(screen.getByText('test2.md'));
    expect(onSelectFileMock).toHaveBeenCalledWith('file-2');
  });
});
