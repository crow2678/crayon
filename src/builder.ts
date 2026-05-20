import { styles, type StyleName } from './styles.js';
import { colorLevel } from './support.js';
import {
  fgFromRgb,
  bgFromRgb,
  fgFromAnsi256,
  bgFromAnsi256,
  hexToRgb,
} from './colors.js';

type StyleFn = ((str: string) => string) & {
  readonly [K in StyleName]: StyleFn;
} & {
  rgb: (r: number, g: number, b: number) => StyleFn;
  hex: (hex: string) => StyleFn;
  bgRgb: (r: number, g: number, b: number) => StyleFn;
  bgHex: (hex: string) => StyleFn;
  ansi256: (n: number) => StyleFn;
  bgAnsi256: (n: number) => StyleFn;
};

interface BuilderState {
  _opens: readonly string[];
  _closes: readonly string[];
}

const proto: Record<string, unknown> = Object.create(Function.prototype);

const ESC = '\x1b';

function make(opens: readonly string[], closes: readonly string[]): StyleFn {
  const open = opens.join('');
  // Trailing reset emits innermost close first, so the visual stack unwinds
  // in the right order.
  const close =
    closes.length > 0 ? closes.slice().reverse().join('') : '';

  const fn = ((str: string) => {
    if (colorLevel === 0) return str;
    // Nesting fix: if the input already contains escape sequences from inner
    // styled calls, rewrite each layer's close back to its open so the outer
    // color survives the inner reset.
    if (str.indexOf(ESC) !== -1 && closes.length > 0) {
      for (let i = 0; i < closes.length; i++) {
        const closeCode = closes[i];
        const openCode = opens[i];
        if (closeCode && openCode) {
          str = str.split(closeCode).join(openCode);
        }
      }
    }
    return open + str + close;
  }) as unknown as StyleFn & BuilderState;

  Object.defineProperty(fn, '_opens', { value: opens });
  Object.defineProperty(fn, '_closes', { value: closes });
  Object.setPrototypeOf(fn, proto);
  return fn;
}

for (const name of Object.keys(styles) as StyleName[]) {
  const [o, cl] = styles[name];
  const oc = `${ESC}[${o}m`;
  const cc = `${ESC}[${cl}m`;
  Object.defineProperty(proto, name, {
    get(this: BuilderState) {
      const child = make(
        [...this._opens, oc],
        [...this._closes, cc],
      );
      // Cache as non-enumerable so chaining stays free of property leakage.
      Object.defineProperty(this, name, { value: child });
      return child;
    },
    configurable: true,
  });
}

const CLOSE_FG = `${ESC}[39m`;
const CLOSE_BG = `${ESC}[49m`;

// Define numeric-input methods as non-enumerable so they don't leak via
// `for...in` over a builder (the static color getters above are already
// non-enumerable by virtue of using `Object.defineProperty`).
function defineMethod(name: string, value: (...args: never[]) => StyleFn): void {
  Object.defineProperty(proto, name, { value });
}

defineMethod('rgb', function (this: BuilderState, r: number, g: number, b: number) {
  return make([...this._opens, fgFromRgb(r, g, b)], [...this._closes, CLOSE_FG]);
} as never);
defineMethod('hex', function (this: BuilderState, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return make([...this._opens, fgFromRgb(r, g, b)], [...this._closes, CLOSE_FG]);
} as never);
defineMethod('bgRgb', function (this: BuilderState, r: number, g: number, b: number) {
  return make([...this._opens, bgFromRgb(r, g, b)], [...this._closes, CLOSE_BG]);
} as never);
defineMethod('bgHex', function (this: BuilderState, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return make([...this._opens, bgFromRgb(r, g, b)], [...this._closes, CLOSE_BG]);
} as never);
defineMethod('ansi256', function (this: BuilderState, n: number) {
  return make([...this._opens, fgFromAnsi256(n)], [...this._closes, CLOSE_FG]);
} as never);
defineMethod('bgAnsi256', function (this: BuilderState, n: number) {
  return make([...this._opens, bgFromAnsi256(n)], [...this._closes, CLOSE_BG]);
} as never);

export const c: StyleFn = make([], []);
export const crayon = c;
