import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Simulate a browser / edge-runtime where `process` is not defined.
// All public APIs must (a) not crash on import, and (b) degrade to plain
// strings since there's no terminal to receive ANSI codes.

describe('browser-like environment (process undefined)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('process', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('module loads without process and reports colorLevel 0', async () => {
    const mod = await import('../src/index.js');
    expect(mod.colorLevel).toBe(0);
  });

  it('chainable returns input unchanged', async () => {
    const { c } = await import('../src/index.js');
    expect(c.red('hi')).toBe('hi');
    expect(c.red.bold.underline('hi')).toBe('hi');
    expect(c.hex('#ff8800')('hi')).toBe('hi');
    expect(c.rgb(255, 0, 0)('hi')).toBe('hi');
  });

  it('styled() returns input unchanged', async () => {
    const { styled } = await import('../src/index.js');
    expect(styled('red', 'bold')('hi')).toBe('hi');
  });

  it('link() falls back to plain-text format', async () => {
    const { link } = await import('../src/index.js');
    expect(link('docs', 'https://example.com')).toBe('docs (https://example.com)');
  });

  it('theme() returns identity functions', async () => {
    const { theme } = await import('../src/index.js');
    const t = theme({ error: ['red', 'bold'], ok: 'green' });
    expect(t.error('hi')).toBe('hi');
    expect(t.ok('hi')).toBe('hi');
  });

  it('gradient() returns input unchanged', async () => {
    const { gradient } = await import('../src/index.js');
    expect(gradient(['#ff0000', '#0000ff'])('Hello')).toBe('Hello');
  });

  it('stripAnsi() still works (no process dependency)', async () => {
    const { stripAnsi } = await import('../src/index.js');
    expect(stripAnsi('\x1b[31mhi\x1b[39m')).toBe('hi');
  });

  it('Crayon({ level: 3 }) emits codes regardless of environment', async () => {
    // Forcing level: 3 should still emit codes — useful for browser tools that
    // render ANSI themselves (xterm.js, ansi-to-html, etc.).
    const { Crayon } = await import('../src/index.js');
    const forced = Crayon({ level: 3 });
    expect(forced.red('hi')).toContain('\x1b[31m');
  });
});
