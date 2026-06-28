import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tauriStorage } from '../../store/tauriStorage';
import { readTextFile, writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  exists: vi.fn(),
  mkdir: vi.fn(),
}));

describe('tauriStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('setItem writes to AppConfig directory', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    await tauriStorage.setItem('test-key', 'test-value');
    expect(writeTextFile).toHaveBeenCalledWith('test-key.json', 'test-value', expect.any(Object));
  });

  it('setItem creates AppConfig directory if it does not exist', async () => {
    vi.mocked(exists).mockResolvedValue(false);
    await tauriStorage.setItem('test-key', 'test-value');
    expect(mkdir).toHaveBeenCalled();
    expect(writeTextFile).toHaveBeenCalledWith('test-key.json', 'test-value', expect.any(Object));
  });

  it('getItem reads from AppConfig directory', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue('test-value');
    const result = await tauriStorage.getItem('test-key');
    expect(readTextFile).toHaveBeenCalledWith('test-key.json', expect.any(Object));
    expect(result).toBe('test-value');
  });

  it('getItem returns null if config dir or file does not exist', async () => {
    vi.mocked(exists).mockResolvedValue(false);
    const result = await tauriStorage.getItem('test-key');
    expect(result).toBeNull();
  });
});
