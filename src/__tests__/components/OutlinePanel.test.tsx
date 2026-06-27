import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OutlinePanel from '../../components/OutlinePanel';

const darkTheme = { isDark: true, borderClass: 'border-white/10' };
const lightTheme = { isDark: false, borderClass: 'border-neutral-200' };

const sampleContent = `
# Introduction

Some body text.

## Getting Started

### Installation

#### This is h4 (ignored)

## Configuration

### Advanced Options
`.trim();

function renderPanel(content = sampleContent, theme = darkTheme, onClose = vi.fn()) {
  return render(
    <OutlinePanel content={content} themeInfo={theme} onClose={onClose} />
  );
}

describe('OutlinePanel', () => {
  it('renders the Outline title', () => {
    renderPanel();
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('renders the correct number of headings (h1–h3 only)', () => {
    renderPanel();
    // # Introduction, ## Getting Started, ### Installation, ## Configuration, ### Advanced Options = 5
    const buttons = screen.getAllByRole('button', { name: /Introduction|Getting Started|Installation|Configuration|Advanced Options/i });
    expect(buttons).toHaveLength(5);
  });

  it('shows h4 headings as excluded', () => {
    renderPanel();
    expect(screen.queryByText('This is h4 (ignored)')).not.toBeInTheDocument();
  });

  it('shows the heading count in the footer', () => {
    renderPanel();
    expect(screen.getByText(/5 headings/i)).toBeInTheDocument();
  });

  it('shows singular "heading" for a single heading', () => {
    renderPanel('# Only One');
    expect(screen.getByText(/1 heading$/i)).toBeInTheDocument();
  });

  it('shows an empty state message when no headings exist', () => {
    renderPanel('Just some plain text without any headings.');
    expect(screen.getByText(/no headings found/i)).toBeInTheDocument();
  });

  it('does not show the footer count when there are no headings', () => {
    renderPanel('Plain text only.');
    // The footer shows e.g. "3 headings" — should not be present with no headings
    expect(screen.queryByText(/^\d+ heading/)).not.toBeInTheDocument();
  });

  it('renders # markers for h1 headings', () => {
    renderPanel('# My Title');
    // The # marker span
    expect(screen.getAllByText('#').length).toBeGreaterThan(0);
  });

  it('renders ## markers for h2 headings', () => {
    renderPanel('## Section');
    expect(screen.getAllByText('##').length).toBeGreaterThan(0);
  });

  it('calls onClose when the X button is clicked', () => {
    const onClose = vi.fn();
    render(<OutlinePanel content={sampleContent} themeInfo={darkTheme} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: '' })); // X button has no text
    // Find the close button by its location in the header
    const buttons = screen.getAllByRole('button');
    // Close button is last in the header
    const closeBtn = buttons.find(b => b.querySelector('svg')); // SVG-only button
    if (closeBtn) fireEvent.click(closeBtn);
    // onClose should have been called
    expect(onClose).toHaveBeenCalled();
  });

  it('strips bold/italic/code from heading text', () => {
    renderPanel('## **Bold** and `code` heading');
    // Should display "Bold and code heading" not "**Bold** and `code` heading"
    expect(screen.getByText('Bold and code heading')).toBeInTheDocument();
  });

  it('applies light theme classes when isDark=false', () => {
    const { container } = renderPanel(sampleContent, lightTheme);
    // The root element should have light bg class
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toMatch(/bg-white/);
  });

  it('applies dark theme classes when isDark=true', () => {
    const { container } = renderPanel(sampleContent, darkTheme);
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toMatch(/bg-zinc-950/);
  });

  it('scrollIntoView is called when a heading is clicked', () => {
    renderPanel('# My Section');
    // Set up a fake DOM element with the expected id
    const fakeEl = document.createElement('h1');
    fakeEl.id = 'heading-my-section';
    fakeEl.scrollIntoView = vi.fn();
    document.body.appendChild(fakeEl);

    const btn = screen.getByText('My Section');
    fireEvent.click(btn);
    expect(fakeEl.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    document.body.removeChild(fakeEl);
  });
});
