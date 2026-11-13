import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const pro22Path = path.join(rootDir, 'pro22.html');
const docsIndex = path.join(rootDir, 'docs', 'index.html');

console.log('[Sync-HTML] Synchronizing pro22.html to docs/index.html...');

fs.mkdirSync(path.join(rootDir, 'docs'), { recursive: true });
fs.copyFileSync(pro22Path, docsIndex);

const optionalCopies = [
  'privacy-policy.html',
  'terms-and-conditions.html',
  'terms-and-services.html',
  'terms-of-service.html',
  'site page.html'
];

for (const f of optionalCopies) {
  const src = path.join(rootDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(rootDir, 'docs', f));
  }
}

console.log('[Sync-HTML] Successfully synced pro22.html -> docs/index.html (' + fs.statSync(docsIndex).size + ' bytes)');
