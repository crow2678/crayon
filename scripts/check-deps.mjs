// Hard gate: crayon must have zero runtime dependencies. Forever.
import { readFile } from 'node:fs/promises';

const pkg = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);

const deps = Object.keys(pkg.dependencies || {});
const peers = Object.keys(pkg.peerDependencies || {});

if (deps.length > 0 || peers.length > 0) {
  console.error('FAIL: crayon must have zero runtime dependencies.');
  if (deps.length) console.error(`  dependencies:     ${deps.join(', ')}`);
  if (peers.length) console.error(`  peerDependencies: ${peers.join(', ')}`);
  process.exit(1);
}

console.log('OK: zero runtime dependencies.');
