// Color-level detection.
//
//   0 = no color
//   1 = basic 16 colors
//   2 = 256 colors
//   3 = truecolor (16M)
//
// Precedence (highest first):
//   1. NO_COLOR env or --no-color CLI       → 0 (universal opt-out)
//   2. --color[=N] CLI                      → explicit per-invocation level
//   3. FORCE_COLOR env                      → explicit opt-in (0-3)
//   4. Browser / edge / non-Node            → 0
//   5. Piped stdout (isTTY === false)       → 0
//   6. Known terminal emulators             → 3 / 2 / 1
//   7. CI environments                      → 3 (truecolor CIs) / 1
//   8. TERM heuristics                      → 1
//   9. Default                              → 1

type Stream = { isTTY?: boolean };

const env: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env ? process.env : {};

function parseColorArgs(): 0 | 1 | 2 | 3 | undefined {
  const argv =
    typeof process !== 'undefined' && Array.isArray(process.argv)
      ? process.argv
      : [];
  for (const arg of argv) {
    if (arg === '--no-color' || arg === '--color=false') return 0;
    if (arg === '--color' || arg === '--color=true') return 1;
    if (arg === '--color=16') return 1;
    if (arg === '--color=256') return 2;
    if (
      arg === '--color=16m' ||
      arg === '--color=full' ||
      arg === '--color=truecolor'
    ) {
      return 3;
    }
  }
  return undefined;
}

export function detectColorLevel(stream?: Stream): 0 | 1 | 2 | 3 {
  // (1) NO_COLOR — universal opt-out: https://no-color.org
  if ('NO_COLOR' in env) return 0;

  // (2) CLI flag — explicit per-invocation request.
  const fromArgs = parseColorArgs();
  if (fromArgs !== undefined) return fromArgs;

  // (3) FORCE_COLOR — explicit opt-in (all four levels honored).
  const fc = env.FORCE_COLOR;
  if (fc !== undefined) {
    if (fc === '0' || fc === 'false') return 0;
    if (fc === '1' || fc === 'true' || fc === '') return 1;
    if (fc === '2') return 2;
    if (fc === '3') return 3;
    return 1;
  }

  // (4) Non-Node environment.
  if (typeof process === 'undefined' || !process.stdout) return 0;

  // (5) Piped / redirected output.
  if (stream && stream.isTTY === false) return 0;

  const term = env.TERM;
  const colorterm = env.COLORTERM;
  const termProgram = env.TERM_PROGRAM;

  if (term === 'dumb') return 0;

  // (6a) Truecolor — explicit terminal-emulator-set signals.
  if (colorterm === 'truecolor' || colorterm === '24bit') return 3;
  if (env.WT_SESSION) return 3;                  // Windows Terminal
  if (termProgram === 'iTerm.app') return 3;     // iTerm2 (2.9+)
  if (termProgram === 'vscode') return 3;        // VS Code integrated
  if (termProgram === 'ghostty') return 3;       // Ghostty
  if (term === 'xterm-kitty' || term === 'xterm-ghostty') return 3;

  // (6b) 256-color signals.
  if (termProgram === 'Apple_Terminal') return 2; // Terminal.app caps at 256
  if (term && /-256(color)?$/.test(term)) return 2;

  // (7) CI environments — modern CIs with HTML log viewers render truecolor.
  if (env.CI) {
    if (env.GITHUB_ACTIONS || env.GITLAB_CI || env.BUILDKITE) return 3;
    return 1;
  }

  // (8) Legacy Windows shells.
  if (env.ConEmuANSI === 'ON') return 1;

  // (9) Common TERM patterns.
  if (
    term &&
    /^(screen|xterm|vt100|vt220|rxvt|color|ansi|cygwin|linux)/i.test(term)
  ) {
    return 1;
  }

  // (10) Default — assume basic color works.
  return 1;
}

export const colorLevel = detectColorLevel(
  typeof process !== 'undefined' ? process.stdout : undefined,
);
