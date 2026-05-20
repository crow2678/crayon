import { describe, it, expect } from 'vitest';
import { theme, visibleLength, stripAnsi, c } from '../src/index.js';

describe('theme() default fallback', () => {
  it('returns the default styler for missing keys', () => {
    const t = theme({ info: 'cyan' }, { default: 'gray' });
    expect(typeof t.info).toBe('function');
    expect(typeof t['unknown']).toBe('function');
    // The "unknown" styler should behave like styled('gray').
    expect(stripAnsi(t['unknown']!('x'))).toBe('x');
  });

  it('uses spec entries when present (default does not override)', () => {
    const t = theme({ info: 'cyan' }, { default: 'gray' });
    const infoOut = t.info('x');
    const unknownOut = t['unknown']!('x');
    // Both contain 'x', but the ANSI prefix should differ.
    expect(stripAnsi(infoOut)).toBe('x');
    expect(stripAnsi(unknownOut)).toBe('x');
    // If colors are emitted, the codes should differ between entries.
    if (infoOut !== 'x') {
      expect(infoOut).not.toBe(unknownOut);
    }
  });

  it('without default option, missing keys are undefined', () => {
    const t = theme({ info: 'cyan' });
    expect(t['info']).toBeDefined();
    expect((t as Record<string, unknown>)['unknown']).toBeUndefined();
  });

  it('accepts array default like a regular theme value', () => {
    const t = theme({ ok: 'green' }, { default: ['red', 'bold'] });
    expect(typeof t['anything']).toBe('function');
    expect(stripAnsi(t['anything']!('x'))).toBe('x');
  });

  it('`in` operator returns true for any key when default is set', () => {
    const t = theme({ info: 'cyan' }, { default: 'gray' });
    expect('info' in t).toBe(true);
    expect('unknown' in t).toBe(true);
  });

  it('does not affect symbol access', () => {
    const t = theme({ info: 'cyan' }, { default: 'gray' });
    expect((t as Record<symbol, unknown>)[Symbol.iterator]).toBeUndefined();
  });
});

describe('visibleLength()', () => {
  it('returns 0 for empty string', () => {
    expect(visibleLength('')).toBe(0);
  });

  it('returns the code-point count for plain text', () => {
    expect(visibleLength('hello')).toBe(5);
    expect(visibleLength('a b c')).toBe(5);
  });

  it('ignores SGR escape codes', () => {
    expect(visibleLength('\x1b[31mhello\x1b[39m')).toBe(5);
    expect(visibleLength(c.red.bold('hi'))).toBe(2);
  });

  it('ignores OSC 8 hyperlink framing', () => {
    expect(
      visibleLength('\x1b]8;;https://example.com\x1b\\click\x1b]8;;\x1b\\'),
    ).toBe(5);
  });

  it('counts code points, not UTF-16 units (emoji = 1)', () => {
    // 🎨 is a single code point (U+1F3A8) — JS .length would report 2.
    expect('🎨'.length).toBe(2);
    expect(visibleLength('🎨')).toBe(1);
    expect(visibleLength('🎨 done')).toBe(6);
  });

  it('works on gradient output', () => {
    // gradient emits one SGR per character but visible content matches input.
    // We don't import gradient here to avoid coupling; build by hand:
    const synthetic =
      '\x1b[38;2;255;0;0mH\x1b[38;2;0;255;0mi\x1b[39m';
    expect(visibleLength(synthetic)).toBe(2);
  });
});
