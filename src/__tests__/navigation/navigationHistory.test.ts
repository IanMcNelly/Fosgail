import { describe, it, expect } from 'vitest';
import { navigateHistory, pushToHistory } from '../../utils';

describe('navigationHistory utilities', () => {
  it('navigateBack decrements index and returns the correct file ID', () => {
    const history = ['file-a', 'file-b', 'file-c'];
    const result = navigateHistory(history, 2, 'back');
    expect(result.newIndex).toBe(1);
    expect(result.targetId).toBe('file-b');
  });

  it('navigateForward increments index and returns the correct file ID', () => {
    const history = ['file-a', 'file-b', 'file-c'];
    const result = navigateHistory(history, 1, 'forward');
    expect(result.newIndex).toBe(2);
    expect(result.targetId).toBe('file-c');
  });

  it('navigateBack does nothing when already at start of history', () => {
    const history = ['file-a', 'file-b'];
    const result = navigateHistory(history, 0, 'back');
    expect(result.newIndex).toBe(0);
    expect(result.targetId).toBeNull();
  });

  it('navigateForward does nothing when already at end of history', () => {
    const history = ['file-a', 'file-b'];
    const result = navigateHistory(history, 1, 'forward');
    expect(result.newIndex).toBe(1);
    expect(result.targetId).toBeNull();
  });

  it('pushToHistory appends a new file ID and updates pointer', () => {
    const history = ['file-a', 'file-b'];
    const { newHistory, newIndex } = pushToHistory(history, 1, 'file-c');
    expect(newHistory).toEqual(['file-a', 'file-b', 'file-c']);
    expect(newIndex).toBe(2);
  });

  it('pushToHistory while mid-history truncates forward stack', () => {
    const history = ['file-a', 'file-b', 'file-c'];
    const { newHistory, newIndex } = pushToHistory(history, 1, 'file-d');
    expect(newHistory).toEqual(['file-a', 'file-b', 'file-d']);
    expect(newIndex).toBe(2);
  });

  it('pushToHistory ignores re-selecting the current active file', () => {
    const history = ['file-a', 'file-b'];
    const { newHistory, newIndex } = pushToHistory(history, 1, 'file-b');
    expect(newHistory).toEqual(['file-a', 'file-b']);
    expect(newIndex).toBe(1);
  });
});
