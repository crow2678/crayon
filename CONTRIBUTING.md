# Contributing to crayon

Thanks for your interest. crayon has a small surface and stays small on purpose.

## Dev setup

```sh
git clone https://github.com/crow2678/crayon.git
cd crayon
npm install
npm test
```

Useful scripts:

| Command                | What it does                              |
|------------------------|-------------------------------------------|
| `npm test`             | Runs the vitest suite once                |
| `npm run test:watch`   | Runs vitest in watch mode                 |
| `npm run typecheck`    | `tsc --noEmit`                            |
| `npm run build`        | Builds dist (ESM + CJS + `.d.ts`)         |
| `npm run bench`        | Runs the benchmark against chalk / pc / kleur |
| `npm run size`         | Checks the gzipped bundle size budget     |
| `npm run check:deps`   | Fails if any runtime dependency is added  |

## Non-negotiables

These rules exist because every "small util" dependency is a future left-pad,
and every kilobyte in the core bundle is a tax on every consumer.

1. **No runtime dependencies.** `dependencies` and `peerDependencies` must
   stay empty. If you need a util that's <200 LOC, inline it. If it's larger,
   it probably doesn't belong in core — propose a sibling package.
2. **No bundle-size regression.** The gzipped ESM bundle must stay under the
   budget in `scripts/size.mjs`.
3. **No bench regression.** If your change touches the hot path, include
   before/after `npm run bench` numbers in the PR.
4. **No new modifiers/colors without standard SGR backing.** If a terminal
   doesn't widely support it, it doesn't ship in core.
5. **Tree-shakable.** New features go in named exports, not on the default
   chainable.

## Where things go

- **Core capability** (colors, modifiers, basic styling) → `src/`
- **Big extras** (gradients, animation, terminal images, ink adapters) →
  separate sibling packages under the same org. Never in core.

## Filing issues

- **Bug?** Use the bug template — include `TERM`, `COLORTERM`, terminal,
  Node version, crayon version.
- **Feature?** Use the feature template — show the use case and the API
  shape. We're conservative about additions to the chainable API.

## Code style

- TypeScript, strict mode.
- No comments that just restate code.
- Prefer named exports over re-exports.
