import { describe, it, expect } from 'vitest';
import {
  rgbToAnsi16,
  rgbToAnsi256,
  ansi256ToRgb,
  hexToRgb,
} from '../src/colors.js';

describe('color conversions', () => {
  it('hexToRgb handles short and long forms', () => {
    expect(hexToRgb('#f00')).toEqual([255, 0, 0]);
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('ff8800')).toEqual([255, 136, 0]);
  });

  it('rgbToAnsi16 picks plausible basic colors', () => {
    expect(rgbToAnsi16(0, 0, 0)).toBe(30); // black
    expect(rgbToAnsi16(255, 0, 0)).toBe(91); // bright red
    expect(rgbToAnsi16(0, 255, 0)).toBe(92); // bright green
    expect(rgbToAnsi16(255, 255, 255)).toBe(97); // bright white
  });

  it('rgbToAnsi256 produces values in [16, 255]', () => {
    expect(rgbToAnsi256(255, 0, 0)).toBeGreaterThanOrEqual(16);
    expect(rgbToAnsi256(255, 0, 0)).toBeLessThanOrEqual(255);
    expect(rgbToAnsi256(0, 0, 0)).toBe(16);
    expect(rgbToAnsi256(255, 255, 255)).toBe(231);
  });

  it('rgbToAnsi256 uses grayscale ramp for equal channels', () => {
    expect(rgbToAnsi256(128, 128, 128)).toBeGreaterThanOrEqual(232);
    expect(rgbToAnsi256(128, 128, 128)).toBeLessThanOrEqual(255);
  });

  it('ansi256ToRgb round-trips through the cube reasonably', () => {
    const rgb = ansi256ToRgb(196);
    expect(rgb[0]).toBeGreaterThan(200); // red-dominant
    expect(rgb[1]).toBeLessThan(50);
    expect(rgb[2]).toBeLessThan(50);
  });

  it('ansi256ToRgb handles all valid indices without throwing', () => {
    for (let i = 0; i < 256; i++) {
      const [r, g, b] = ansi256ToRgb(i);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(255);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    }
  });
});
