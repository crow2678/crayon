// Color-level detection. Returns:
//   0 = no color
//   1 = basic 16 colors
//   2 = 256 colors
//   3 = truecolor (16M)
//
// Fixes chalk #624 by parsing FORCE_COLOR values 0, 1, 2, 3 correctly
// instead of only honoring 0 and 3.

type Stream = { isTTY?: boolean };

const env: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env ? process.env : {};

export function detectColorLevel(stream?: Stream): 0 | 1 | 2 | 3 {
  // Explicit opt-out: https://no-color.org
  if ('NO_COLOR' in env) return 0;

  // Explicit opt-in via FORCE_COLOR — supports all four levels.
  const fc = env.FORCE_COLOR;
  if (fc !== undefined) {
    if (fc === '0' || fc === 'false') return 0;
    if (fc === '1' || fc === 'true' || fc === '') return 1;
    if (fc === '2') return 2;
    if (fc === '3') return 3;
    return 1;
  }

  // Non-Node environment (browser, edge) — no ANSI by default.
  if (typeof process === 'undefined' || !process.stdout) return 0;

  // Piped / redirected output — no color unless forced above.
  if (stream && stream.isTTY === false) return 0;

  const term = env.TERM;
  const colorterm = env.COLORTERM;

  if (term === 'dumb') return 0;
  if (colorterm === 'truecolor' || colorterm === '24bit') return 3;
  if (term === 'xterm-kitty' || term === 'xterm-ghostty') return 3;
  if (term && /-256(color)?$/.test(term)) return 2;

  if (env.CI) return 1;
  if (
    term &&
    /^(screen|xterm|vt100|vt220|rxvt|color|ansi|cygwin|linux)/i.test(term)
  ) {
    return 1;
  }

  return 1;
}

export const colorLevel = detectColorLevel(
  typeof process !== 'undefined' ? process.stdout : undefined,
);
