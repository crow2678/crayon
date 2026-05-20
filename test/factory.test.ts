import { describe, it, expect } from 'vitest';
import { Crayon, c, colorLevel } from '../src/index.js';

describe('Crayon factory', () => {
  it('Crayon({ level: 0 }) returns input unchanged', () => {
    const plain = Crayon({ level: 0 });
    expect(plain.red('hi')).toBe('hi');
    expect(plain.red.bold('hi')).toBe('hi');
    expect(plain.hex('#ff8800')('hi')).toBe('hi');
    expect(plain.rgb(255, 0, 0)('hi')).toBe('hi');
    expect(plain.ansi256(208)('hi')).toBe('hi');
  });

  it('Crayon({ level: 1 }) emits basic 16-color codes for rgb', () => {
    const c1 = Crayon({ level: 1 });
    const out = c1.rgb(255, 0, 0)('x');
    expect(out).toContain('x');
    expect(out).toMatch(/\x1b\[(?:3[0-7]|9[0-7])m/); // basic fg range
    expect(out).not.toContain('\x1b[38;5;'); // no 256-color
    expect(out).not.toContain('\x1b[38;2;'); // no truecolor
  });

  it('Crayon({ level: 2 }) downgrades rgb to ansi256', () => {
    const c2 = Crayon({ level: 2 });
    const out = c2.rgb(255, 0, 0)('x');
    expect(out).toContain('\x1b[38;5;');
    expect(out).not.toContain('\x1b[38;2;');
  });

  it('Crayon({ level: 3 }) emits full truecolor for rgb/hex', () => {
    const c3 = Crayon({ level: 3 });
    expect(c3.rgb(255, 0, 0)('x')).toContain('\x1b[38;2;255;0;0m');
    expect(c3.hex('#ff8800')('x')).toContain('\x1b[38;2;255;136;0m');
  });

  it('Crayon() with no args uses detected colorLevel', () => {
    const detected = Crayon();
    expect(detected.red('x')).toBe(c.red('x'));
  });

  it('instances are cached per level', () => {
    expect(Crayon({ level: 2 })).toBe(Crayon({ level: 2 }));
    expect(Crayon({ level: 0 })).toBe(Crayon({ level: 0 }));
    expect(Crayon({ level: 0 })).not.toBe(Crayon({ level: 1 }));
  });

  it('Crayon() with no opts returns the same as c at detected level', () => {
    expect(Crayon()).toBe(c);
  });

  it('supports the dual-output use case', () => {
    const colored = Crayon({ level: 3 });
    const plain = Crayon({ level: 0 });
    const msg = 'error: bad input';
    expect(colored.red.bold(msg)).toContain('\x1b[31m');
    expect(plain.red.bold(msg)).toBe(msg);
  });

  it('chained styles work on factory instances', () => {
    const c3 = Crayon({ level: 3 });
    const out = c3.red.bold.underline('x');
    expect(out).toContain('\x1b[31m');
    expect(out).toContain('\x1b[1m');
    expect(out).toContain('\x1b[4m');
  });

  it('factory instances handle nesting correctly', () => {
    const c3 = Crayon({ level: 3 });
    const out = c3.red('a' + c3.blue('b') + 'c');
    // outer red should be re-asserted after inner blue close
    const bIdx = out.indexOf('b');
    const cIdx = out.indexOf('c', bIdx);
    expect(out.slice(bIdx, cIdx)).toContain('\x1b[31m');
  });

  it('uses detected level as fallback when level is undefined', () => {
    const x = Crayon({ level: undefined });
    expect(x).toBe(Crayon());
  });
});
