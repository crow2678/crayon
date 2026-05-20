# crayon

> Terminal styling done right — zero dependencies, every modern runtime, features chalk leaves to side packages.

[![npm](https://img.shields.io/npm/v/@paresh2678/crayon.svg)](https://www.npmjs.com/package/@paresh2678/crayon)
[![bundle](https://img.shields.io/bundlephobia/minzip/@paresh2678/crayon.svg?label=gzip)](https://bundlephobia.com/package/@paresh2678/crayon)
[![CI](https://github.com/crow2678/crayon/actions/workflows/ci.yml/badge.svg)](https://github.com/crow2678/crayon/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

```sh
npm install @paresh2678/crayon
```

```js
import { c, styled, link, theme } from '@paresh2678/crayon';

console.log(c.red.bold('error:'), 'something broke');

const err = styled('red', 'bold');           // pre-built fast path
console.log(err('hot loop stays fast'));

console.log(link('docs', 'https://example.com/docs')); // clickable OSC 8 link

const t = theme({ error: ['red', 'bold'], ok: 'green', muted: 'gray' });
console.log(t.error('nope'), t.ok('yep'), t.muted('fyi'));
```

## Why crayon

| | crayon | chalk |
|---|---|---|
| Runtime dependencies | **0** | 0 |
| Bundle (gzip)        | ~2.6 KB | ~2.1 KB |
| Curly / dotted / dashed underlines | ✓ | – |
| Overline modifier      | ✓ | – |
| OSC 8 hyperlinks       | ✓ built in | needs `terminal-link` |
| Gradients              | ✓ `gradient()` | needs `gradient-string` |
| `stripAnsi()` helper   | ✓ | needs `strip-ansi` |
| Typed `theme()`        | ✓ | – |
| `FORCE_COLOR` levels   | 0, 1, 2, 3 | 0 and 3 only ([#624](https://github.com/chalk/chalk/issues/624)) |
| Pre-built fast path    | `styled(...)` | – |
| Browser / Deno / Bun / Edge | ✓ | Node only |

crayon isn't *smaller* or universally *faster* than chalk — it's competitive on both. The reason to switch is the feature set and the runtime story. If you only need basic colors, [`picocolors`](https://github.com/alexeyraspopov/picocolors) is still the right pick.

## API

### Chainable (chalk-compatible shape)

```js
import { c } from '@paresh2678/crayon';
// or: import { crayon as c } from '@paresh2678/crayon';

c.red('x');
c.red.bold.underline('x');
c.bgBlue.white('x');
c.hex('#ff8800')('x');
c.rgb(255, 136, 0)('x');
c.ansi256(208)('x');
```

### Functional (fast path)

```js
import { styled } from '@paresh2678/crayon';

const err = styled('red', 'bold');
err('boom');                                // ~1.5× chalk in micro-bench
```

### Hyperlinks (OSC 8)

```js
import { link } from '@paresh2678/crayon';

console.log(link('open docs', 'https://example.com'));
// Falls back to "open docs (https://example.com)" when color is disabled.
```

### Typed themes

```js
import { theme } from '@paresh2678/crayon';

const t = theme({
  error: ['red', 'bold'],
  warn:  'yellow',
  ok:    ['green', 'bold'],
});

t.error('nope');
```

### Gradients

```js
import { gradient } from '@paresh2678/crayon';

console.log(gradient(['#ff0000', '#00ff00', '#0000ff'])('rainbow text'));
console.log(gradient(['#ff8800', '#ff0088'])('orange to pink'));
```

Per-character RGB interpolation across the stops. Auto-downgrades to ansi256
on level-2 terminals and 16-color on level-1. chalk has no built-in
equivalent — users reach for `gradient-string`.

### Strip ANSI

```js
import { stripAnsi } from '@paresh2678/crayon';

stripAnsi('\x1b[31mhi\x1b[39m');  // → 'hi'
```

Useful for writing styled output to log files, measuring visible string
length, or string comparisons in tests. Covers CSI, OSC 8 hyperlinks, and
sub-parameter SGRs (curly underlines).

### Visible length

```js
import { visibleLength } from '@paresh2678/crayon';

visibleLength('\x1b[31mhi\x1b[39m');     // → 2
visibleLength('🎨 done');                 // → 6
```

Code-point count after stripping ANSI. Use it to pad styled strings for
column alignment. Caveat: doesn't compute terminal-cell width for CJK or
wide-emoji — for that, reach for `string-width`.

### Themes with a default

```js
import { theme } from '@paresh2678/crayon';

const log = theme(
  { info: 'cyan', warn: 'yellow', error: ['red', 'bold'] },
  { default: 'gray' },
);

log.error('boom');     // bold red
log['unknown']('hm');  // gray (fallback)
```

The default option means dynamic keys (e.g. unknown log levels) get a sane
styler instead of `undefined`.

### Color-level detection

```js
import { colorLevel, detectColorLevel } from '@paresh2678/crayon';

// 0 = none, 1 = 16 colors, 2 = 256, 3 = truecolor
console.log(colorLevel);
```

Detection precedence (highest first):

1. `NO_COLOR` env or `--no-color` CLI flag → `0`
2. `--color[=N]` CLI flag (`16`, `256`, `16m` / `truecolor`)
3. `FORCE_COLOR` env (`0`, `1`, `2`, `3`)
4. Terminal-emulator signals: `WT_SESSION` (Windows Terminal), `TERM_PROGRAM=iTerm.app | vscode | ghostty | Apple_Terminal`, `COLORTERM=truecolor`, kitty, Ghostty
5. CI signals: `GITHUB_ACTIONS` / `GITLAB_CI` / `BUILDKITE` → truecolor; other `CI` → basic
6. `TERM` heuristics and default

### Per-instance level — `Crayon({ level })`

For dual-output (terminal + log file), forcing a level for testing, or any
case where the module-wide singleton isn't enough:

```js
import { Crayon } from '@paresh2678/crayon';
import fs from 'node:fs';

const colored = Crayon();              // detected level
const plain   = Crayon({ level: 0 }); // forced no-color
const cube256 = Crayon({ level: 2 }); // forced 256-color downgrade

console.log(colored.red.bold('error'));                 // bold red on stdout
fs.writeFileSync('app.log', plain.red.bold('error'));   // plain text in file
```

Instances are cached per level — calling `Crayon({ level: 2 })` twice returns the same object.

## Compatibility

| Runtime | Supported |
|---|---|
| Node.js | ≥ 22 |
| Bun     | latest |
| Deno    | latest |
| Browser | yes (no-op when no ANSI) |
| Edge    | yes |

## Performance

```sh
npm run bench
```

Micro-bench (Node 24, FORCE_COLOR=3) on a typical run:

```
chalk      red.bold(x)        ~8M  ops/sec   1.00×
crayon     c.red.bold         ~9M  ops/sec   1.04×
crayon     pre-built styled  ~12M  ops/sec   1.4–1.8×
```

CI enforces a **4 KB gzip budget** for the core bundle.

## Known limitations

- **`colorLevel` is captured once at module load.** Mutating `process.env.NO_COLOR` or `FORCE_COLOR` after `import` has no effect on already-built styled output. Set env vars before launching Node, or call `detectColorLevel()` to re-read.
- **Bold + dim cannot be cleanly nested.** SGR code `\x1b[22m` closes both bold and dim, so `c.dim('a' + c.bold('b') + 'c')` renders `c` as bold+dim instead of dim only. ANSI limitation; chalk has the same behavior.
- **`rgbToAnsi16` is an approximation.** Midtone grays (e.g. `rgb(128, 128, 128)`) map to "white" rather than "gray" — the classic 3-bit-RGB algorithm has no dedicated gray slot. For true gray on 16-color terminals, use `c.gray` directly.

## Visual demos

```sh
npm run demo            # single-page showcase
npm run web             # local server: crayon vs chalk side-by-side
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The non-negotiables:

1. No runtime dependencies, ever.
2. No regressions on the bundle-size budget.
3. No regressions on the bench suite.

## Credits

crayon stands on the shoulders of:

- [**chalk**](https://github.com/chalk/chalk) and [**ansi-styles**](https://github.com/chalk/ansi-styles) by Sindre Sorhus & Josh Junon — the reference implementations and a decade of accumulated terminal wisdom.
- [**picocolors**](https://github.com/alexeyraspopov/picocolors) by Alexey Raspopov — proof that this can be done in 2 KB.
- The terminal authors and the [no-color.org](https://no-color.org) and [OSC 8](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda) conventions.

If you only need plain colors with the smallest possible footprint, use picocolors. If you need a mature, battle-tested library with a decade of edge-case fixes, use chalk. crayon is for projects that want the feature set without bolting on a half-dozen sibling packages.

## License

[MIT](./LICENSE)
