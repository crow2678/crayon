// RGB → ANSI conversions for color-level downgrade.
// chalk does this internally so the same `hex('#ff8800')` call renders on a
// 16-color terminal, a 256-color one, and a truecolor one. We need parity.

import { colorLevel } from './support.js';

const CUBE = [0, 95, 135, 175, 215, 255] as const;

// Clamp numeric channel inputs to [0, 255]. Non-finite values fall back to 0.
// Prevents malformed SGR output for callers that pass out-of-range numbers
// (e.g. `c.rgb(300, -50, NaN)`).
function clamp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const x = Math.round(n);
  return x < 0 ? 0 : x > 255 ? 255 : x;
}

// Approximate RGB values for the standard 16 ANSI colors (xterm defaults).
// Used to map an ansi256 index back to RGB when downgrading further to 16.
const ANSI16_RGB: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 0], [205, 0, 0], [0, 205, 0], [205, 205, 0],
  [0, 0, 238], [205, 0, 205], [0, 205, 205], [229, 229, 229],
  [127, 127, 127], [255, 0, 0], [0, 255, 0], [255, 255, 0],
  [92, 92, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255],
];

export function rgbToAnsi256(r: number, g: number, b: number): number {
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round(((r - 8) / 247) * 24) + 232;
  }
  return (
    16 +
    36 * Math.round((r / 255) * 5) +
    6 * Math.round((g / 255) * 5) +
    Math.round((b / 255) * 5)
  );
}

// Classic ansi-styles algorithm: brightness-thresholded 3-bit RGB.
export function rgbToAnsi16(r: number, g: number, b: number): number {
  const value = Math.max(r, g, b);
  if (value < 75) return 30; // black
  const ansi =
    30 +
    ((Math.round(b / 255) << 2) |
      (Math.round(g / 255) << 1) |
      Math.round(r / 255));
  return value >= 200 ? ansi + 60 : ansi;
}

export function ansi256ToRgb(n: number): [number, number, number] {
  if (n < 16) return [...(ANSI16_RGB[n] ?? [0, 0, 0])] as [number, number, number];
  if (n >= 232) {
    const v = 8 + (n - 232) * 10;
    return [v, v, v];
  }
  const i = n - 16;
  return [
    CUBE[Math.floor(i / 36)] ?? 0,
    CUBE[Math.floor((i % 36) / 6)] ?? 0,
    CUBE[i % 6] ?? 0,
  ];
}

export function fgFromRgb(
  r: number,
  g: number,
  b: number,
  level: 0 | 1 | 2 | 3 = colorLevel,
): string {
  if (level === 0) return '';
  r = clamp(r); g = clamp(g); b = clamp(b);
  if (level === 1) return `\x1b[${rgbToAnsi16(r, g, b)}m`;
  if (level === 2) return `\x1b[38;5;${rgbToAnsi256(r, g, b)}m`;
  return `\x1b[38;2;${r};${g};${b}m`;
}

export function bgFromRgb(
  r: number,
  g: number,
  b: number,
  level: 0 | 1 | 2 | 3 = colorLevel,
): string {
  if (level === 0) return '';
  r = clamp(r); g = clamp(g); b = clamp(b);
  if (level === 1) return `\x1b[${rgbToAnsi16(r, g, b) + 10}m`;
  if (level === 2) return `\x1b[48;5;${rgbToAnsi256(r, g, b)}m`;
  return `\x1b[48;2;${r};${g};${b}m`;
}

export function fgFromAnsi256(
  n: number,
  level: 0 | 1 | 2 | 3 = colorLevel,
): string {
  if (level === 0) return '';
  n = clamp(n);
  if (level === 1) {
    const [r, g, b] = ansi256ToRgb(n);
    return `\x1b[${rgbToAnsi16(r, g, b)}m`;
  }
  return `\x1b[38;5;${n}m`;
}

export function bgFromAnsi256(
  n: number,
  level: 0 | 1 | 2 | 3 = colorLevel,
): string {
  if (level === 0) return '';
  n = clamp(n);
  if (level === 1) {
    const [r, g, b] = ansi256ToRgb(n);
    return `\x1b[${rgbToAnsi16(r, g, b) + 10}m`;
  }
  return `\x1b[48;5;${n}m`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, '').trim();
  if (!/^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) {
    throw new TypeError(
      `Invalid hex color: ${JSON.stringify(hex)} — expected '#rgb' or '#rrggbb'`,
    );
  }
  const v =
    h.length === 3
      ? h.split('').map((x) => x + x).join('')
      : h;
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}
