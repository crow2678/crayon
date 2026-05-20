import { describe, it, expect, vi } from 'vitest';
import {
  c,
  crayon,
  styled,
  link,
  theme,
  colorLevel,
  detectColorLevel,
} from '../src/index.js';

const hasColor = colorLevel > 0;

describe('crayon', () => {
  it('exposes a valid color level', () => {
    expect([0, 1, 2, 3]).toContain(colorLevel);
  });

  it('exposes a crayon alias of c', () => {
    expect(crayon).toBe(c);
  });

  it('does not leak internal state on builders', () => {
    expect(Object.keys(c.red)).toEqual([]);
    expect(Object.keys(c)).toEqual([]);
  });

  it('does not leak prototype methods via for...in', () => {
    // Touch a few chains to materialise instance caches, then enumerate.
    void c.red.bold;
    void c.green.italic;
    const keys: string[] = [];
    // eslint-disable-next-line guard-for-in
    for (const k in c) keys.push(k);
    expect(keys).toEqual([]);
  });

  it('detectColorLevel respects NO_COLOR', () => {
    const prev = process.env.NO_COLOR;
    process.env.NO_COLOR = '1';
    expect(detectColorLevel()).toBe(0);
    if (prev === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = prev;
  });

  it('detectColorLevel parses FORCE_COLOR levels 0-3 correctly (fixes chalk #624)', () => {
    const prev = { NO: process.env.NO_COLOR, FC: process.env.FORCE_COLOR };
    delete process.env.NO_COLOR;
    for (const [val, expected] of [
      ['0', 0],
      ['1', 1],
      ['2', 2],
      ['3', 3],
    ] as const) {
      process.env.FORCE_COLOR = val;
      expect(detectColorLevel()).toBe(expected);
    }
    if (prev.FC === undefined) delete process.env.FORCE_COLOR;
    else process.env.FORCE_COLOR = prev.FC;
    if (prev.NO !== undefined) process.env.NO_COLOR = prev.NO;
  });

  it.skipIf(!hasColor)('wraps a string with ANSI codes', () => {
    const r = c.red('hi');
    expect(r).toContain('hi');
    expect(r).toContain('\x1b[31m');
    expect(r).toContain('\x1b[39m');
  });

  it.skipIf(!hasColor)('chains styles', () => {
    const r = c.red.bold('hi');
    expect(r).toContain('hi');
    expect(r).toContain('\x1b[31m');
    expect(r).toContain('\x1b[1m');
  });

  it.skipIf(!hasColor)('caches chained accessors', () => {
    expect(c.red.bold).toBe(c.red.bold);
  });

  it.skipIf(!hasColor)('supports rgb / hex / ansi256 with level-aware emission', () => {
    const rgb = c.rgb(255, 0, 0)('x');
    expect(rgb).toContain('x');
    expect(rgb).toContain('\x1b[39m');
    expect(rgb).toMatch(/\x1b\[(?:9?[0-9]+|38(?:;\d+)+)m/);

    expect(c.hex('#f00')('x')).toBe(c.hex('#ff0000')('x'));
    expect(c.bgRgb(0, 0, 255)('x')).toContain('\x1b[49m');
    expect(c.ansi256(196)('x')).toContain('x');
  });

  it.skipIf(!hasColor)('clamps out-of-range rgb to [0, 255]', () => {
    const out = c.rgb(300, -50, 999)('x');
    // At any color level, the emitted code must be a valid SGR. At truecolor
    // we can additionally assert the clamped channel values.
    expect(out).not.toMatch(/-\d+/); // no negative numbers in the SGR
    expect(out).not.toMatch(/;[3-9]\d\d/); // no >=300 values
  });

  it.skipIf(!hasColor)('clamps out-of-range ansi256 to [0, 255]', () => {
    const out = c.ansi256(500)('x');
    expect(out).not.toMatch(/;500m/);
  });

  it.skipIf(!hasColor)('treats NaN rgb channels as 0', () => {
    const out = c.rgb(Number.NaN, 0, 0)('x');
    expect(out).not.toContain('NaN');
  });

  it('rejects invalid hex', () => {
    expect(() => c.hex('zzz')).toThrow(/Invalid hex/);
    expect(() => c.hex('#gg0000')).toThrow(/Invalid hex/);
    expect(() => c.hex('')).toThrow(/Invalid hex/);
    expect(() => c.hex('#1234')).toThrow(/Invalid hex/);
  });

  it.skipIf(!hasColor)('supports squiggly underline (chalk #604)', () => {
    expect(c.underlineCurly('x')).toContain('\x1b[4:3m');
  });

  it.skipIf(!hasColor)('functional API styles a string', () => {
    const err = styled('red', 'bold');
    expect(err('boom')).toContain('boom');
    expect(err('boom')).toContain('\x1b[31m');
  });

  describe('nesting', () => {
    it.skipIf(!hasColor)('restores outer color after inner fg reset', () => {
      const r = c.red('a' + c.blue('b') + 'c');
      // The inner blue's \x1b[39m must have been rewritten to red's open.
      expect(r).not.toContain('\x1b[39mc'); // no orphan reset before 'c'
      // After 'b' there should be a red re-application before 'c'.
      const bIdx = r.indexOf('b');
      const cIdx = r.indexOf('c', bIdx);
      expect(r.slice(bIdx, cIdx)).toContain('\x1b[31m');
    });

    it.skipIf(!hasColor)('handles same-style nesting cleanly', () => {
      const r = c.red('a' + c.red('b') + 'c');
      expect(r.startsWith('\x1b[31m')).toBe(true);
      expect(r.endsWith('\x1b[39m')).toBe(true);
      // Exactly one terminating reset — no orphan in the middle.
      const closes = r.split('\x1b[39m').length - 1;
      expect(closes).toBe(1);
    });

    it.skipIf(!hasColor)('functional styled() also restores after nested reset', () => {
      const err = styled('red', 'bold');
      const r = err('a' + c.blue('b') + 'c');
      expect(r).not.toContain('\x1b[39mc');
    });
  });

  describe('link', () => {
    it('emits OSC 8 when color is enabled', () => {
      if (!hasColor) return;
      const out = link('docs', 'https://example.com');
      expect(out).toContain('\x1b]8;;https://example.com');
      expect(out).toContain('docs');
    });

    it('falls back to "label (url)" when color is disabled', async () => {
      vi.stubEnv('NO_COLOR', '1');
      vi.resetModules();
      const { link: link0 } = await import('../src/link.js');
      expect(link0('docs', 'https://example.com')).toBe(
        'docs (https://example.com)',
      );
      vi.unstubAllEnvs();
      vi.resetModules();
    });

    it('strips control characters from url and label', () => {
      const out = link('do\x1bcs\x07', 'https://x.com/\x1b\\OSC9;9;evil');
      // No control characters in the body apart from the OSC 8 framing.
      // The framing itself is fixed prefix/suffix; the payload between
      // should be ESC/BEL-free.
      expect(out).not.toContain('\x07');
      // ESC only allowed as part of OSC 8 framing (\x1b] and \x1b\\). Strip
      // those framing tokens and assert no other ESC remains.
      const stripped = out
        .replaceAll('\x1b]8;;', '')
        .replaceAll('\x1b\\', '');
      expect(stripped).not.toContain('\x1b');
    });
  });

  it('builds typed themes', () => {
    const t = theme({ error: 'red', ok: ['green', 'bold'] });
    expect(typeof t.error).toBe('function');
    expect(typeof t.ok).toBe('function');
    expect(t.error('x')).toContain('x');
    expect(t.ok('y')).toContain('y');
  });

  it('theme ignores inherited properties from a custom prototype', () => {
    const base = { inherited: 'red' as const };
    const spec = Object.create(base);
    spec.ok = 'green';
    const t = theme(spec);
    expect(Object.keys(t)).toEqual(['ok']);
  });
});
