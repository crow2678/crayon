// Bundle size budget. Fails CI if the gzipped ESM bundle exceeds the budget.
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const BUDGET_GZIP = 4096; // bytes — picocolors-class size

const code = await readFile(new URL('../dist/index.js', import.meta.url));
const raw = code.length;
const gz = gzipSync(code).length;

console.log(
  `Bundle: ${raw}B raw, ${gz}B gzip (budget: ${BUDGET_GZIP}B gzip)`,
);

if (gz > BUDGET_GZIP) {
  console.error(`FAIL: gzipped size ${gz}B exceeds budget ${BUDGET_GZIP}B`);
  process.exit(1);
}
