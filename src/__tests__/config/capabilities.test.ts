import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Tauri Capabilities & Security Config', () => {
  it('capabilities include core:window:allow-destroy', () => {
    const filePath = path.resolve(process.cwd(), 'src-tauri/capabilities/default.json');
    const caps = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(caps.permissions).toContain('core:window:allow-destroy');
  });

  it('CSP connect-src includes https://ipc.localhost for Windows WebView2', () => {
    const filePath = path.resolve(process.cwd(), 'src-tauri/tauri.conf.json');
    const conf = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const csp: string = conf.app.security.csp;
    expect(csp).toContain('https://ipc.localhost');
  });

  it('CSP connect-src includes http://ipc.localhost for cross-platform compat', () => {
    const filePath = path.resolve(process.cwd(), 'src-tauri/tauri.conf.json');
    const conf = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const csp: string = conf.app.security.csp;
    expect(csp).toContain('http://ipc.localhost');
  });
});
