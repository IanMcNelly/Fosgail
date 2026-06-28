import { StateStorage } from 'zustand/middleware';
import { readTextFile, writeTextFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';

export const tauriStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const hasConfigDir = await exists('', { baseDir: BaseDirectory.AppConfig });
      if (!hasConfigDir) {
        await mkdir('', { baseDir: BaseDirectory.AppConfig, recursive: true });
      }
      const hasFile = await exists(`${name}.json`, { baseDir: BaseDirectory.AppConfig });
      if (hasFile) {
        return await readTextFile(`${name}.json`, { baseDir: BaseDirectory.AppConfig });
      }
      return null;
    } catch (e) {
      console.error('tauriStorage getItem error:', e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const hasConfigDir = await exists('', { baseDir: BaseDirectory.AppConfig });
      if (!hasConfigDir) {
        await mkdir('', { baseDir: BaseDirectory.AppConfig, recursive: true });
      }
      await writeTextFile(`${name}.json`, value, { baseDir: BaseDirectory.AppConfig });
    } catch (e) {
      console.error('tauriStorage setItem error:', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    // Optional implementation if needed
  },
};
