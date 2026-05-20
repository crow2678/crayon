import { styled } from './styled.js';
import type { StyleName } from './styles.js';

type ThemeValue = StyleName | readonly StyleName[];
type ThemeSpec = Record<string, ThemeValue>;

export function theme<T extends ThemeSpec>(
  spec: T,
): { [K in keyof T]: (s: string) => string } {
  const out = {} as { [K in keyof T]: (s: string) => string };
  // Use Object.keys (own + enumerable) so inherited props from a custom
  // prototype don't quietly become theme entries.
  for (const key of Object.keys(spec) as (keyof T)[]) {
    const v = spec[key];
    out[key] = Array.isArray(v)
      ? styled(...(v as StyleName[]))
      : styled(v as StyleName);
  }
  return out;
}
