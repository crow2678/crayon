import { stripAnsi } from './strip.js';

/**
 * Count the visible characters in a string, ignoring ANSI escape sequences.
 *
 * Uses code-point iteration (`[...str]`) so surrogate pairs and combining
 * characters past the BMP count as one. This is the right answer for the
 * common case of measuring padded columns in styled CLI output.
 *
 * Caveat: this does *not* account for terminal-cell width — CJK ideographs,
 * many emoji, and combining marks render wider or narrower than one cell.
 * For true terminal-column width, a width-table library is still needed.
 *
 * @example
 *   visibleLength('\x1b[31mhi\x1b[39m')  // → 2
 *   visibleLength('🎨 done')             // → 6  (emoji = 1 code point)
 */
export function visibleLength(str: string): number {
  return [...stripAnsi(str)].length;
}
