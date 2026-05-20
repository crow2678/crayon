// Per-character color gradient. chalk doesn't ship this — gradient-string
// is the customary sibling package. Bringing it into core means one less
// dependency for users who want a gradient.

import { colorLevel } from './support.js';
import { fgFromRgb, hexToRgb } from './colors.js';

type RGB = [number, number, number];

function lerp(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function interpolate(stops: readonly RGB[], pos: number): RGB {
  if (pos <= 0) return stops[0]!;
  if (pos >= 1) return stops[stops.length - 1]!;
  const segments = stops.length - 1;
  const segSize = 1 / segments;
  const seg = Math.min(Math.floor(pos / segSize), segments - 1);
  const t = (pos - seg * segSize) / segSize;
  return lerp(stops[seg]!, stops[seg + 1]!, t);
}

/**
 * Build a per-character RGB gradient styler.
 *
 * @example
 *   gradient(['#ff0000', '#00ff00', '#0000ff'])('rainbow text')
 *
 * Auto-downgrades through the same level logic as `c.rgb()` — at level 2 it
 * emits 256-color codes; at level 1, basic 16; at level 0, the input is
 * returned unchanged.
 */
export function gradient(stops: readonly string[]): (text: string) => string {
  if (stops.length < 2) {
    throw new TypeError(
      'gradient() requires at least 2 color stops; got ' + stops.length,
    );
  }
  const rgbStops: RGB[] = stops.map(hexToRgb);

  return (text: string) => {
    if (colorLevel === 0) return text;
    const chars = [...text]; // code-point safe for emoji / surrogate pairs
    if (chars.length === 0) return text;

    let out = '';
    let lastR = -1, lastG = -1, lastB = -1;

    for (let i = 0; i < chars.length; i++) {
      const pos = chars.length === 1 ? 0 : i / (chars.length - 1);
      const [r, g, b] = interpolate(rgbStops, pos);
      // Only emit a new SGR when the color changed from the previous char.
      if (r !== lastR || g !== lastG || b !== lastB) {
        out += fgFromRgb(r, g, b);
        lastR = r; lastG = g; lastB = b;
      }
      out += chars[i];
    }
    return out + '\x1b[39m';
  };
}
