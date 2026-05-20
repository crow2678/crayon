import { colorLevel } from './support.js';

// OSC 8 hyperlink. Falls back to "label (url)" when ANSI is off so the URL is
// still readable on terminals that don't recognize the escape.
const OSC = '\x1b]';
const ST = '\x1b\\';

// Strip control characters from URL and label. ESC (\x1b) and BEL (\x07) can
// terminate the OSC 8 sequence early and let trailing payload escape into
// addressable terminal commands — a real injection vector when URLs come from
// untrusted input.
function stripControl(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\x00-\x1f\x7f]/g, '');
}

export function link(label: string, url: string): string {
  const safeLabel = stripControl(label);
  const safeUrl = stripControl(url);
  if (colorLevel === 0) return `${safeLabel} (${safeUrl})`;
  return `${OSC}8;;${safeUrl}${ST}${safeLabel}${OSC}8;;${ST}`;
}
