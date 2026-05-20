# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] — 2026-05-19

### Added
- **`gradient()`** — per-character RGB color interpolation. Multi-stop linear
  gradients. Auto-downgrades through the existing level logic. The chalk-less
  feature (chalk users reach for `gradient-string`; crayon ships it).
- **`stripAnsi()`** — strip ANSI escape sequences. Covers CSI, OSC 8
  (BEL and ST terminators), and SGR sub-parameters (`4:3` curly underline).
- **Browser / edge-runtime test suite** — backs the "universal" claim with
  real assertions that the module loads, all APIs degrade to identity
  functions, and `Crayon({ level: 3 })` still emits codes for consumers
  rendering ANSI in the browser (xterm.js, ansi-to-html).

### Changed
- `examples/showcase.ts` swaps the manual HSL rainbow for `gradient()` and
  adds a stripAnsi demo section.

## [0.2.0] — 2026-05-19

### Added
- **`Crayon({ level })` factory** — per-instance color level override.
  Enables dual-output (terminal + log file), testing without env-var
  gymnastics, and forced level downgrade.
- **CLI flag parsing**: `--no-color`, `--color`, `--color=16`,
  `--color=256`, `--color=16m` / `--color=truecolor`.
- **Expanded terminal detection**: Windows Terminal (`WT_SESSION`),
  iTerm2, VS Code, Ghostty, Apple Terminal, ConEmu (legacy).
- **Upgraded CI level detection**: GitHub Actions, GitLab CI, and
  Buildkite now report truecolor (3) instead of basic (1).
- Exported types: `ColorLevel`, `CrayonOptions`, `StyleFn`.

### Changed
- **Minimum Node version: 22** (was 20). Node 20 LTS ended April 2026.
- CI matrix updated to test against Node 22 and 24.
- `publint` check added to CI on every push.

## [0.1.0] — 2026-05-19

### Added
- Initial release: chainable + functional APIs, OSC 8 hyperlinks, themes,
  squiggly/dotted/dashed underline variants, `FORCE_COLOR` levels 0–3,
  truecolor / 256-color / hex / rgb support, dual ESM+CJS build, zero
  runtime dependencies.
