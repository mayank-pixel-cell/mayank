/**
 * sync-android-web.js
 * Synchronizes the complete pro22.html application, icons, and assets into Capacitor www/ and android assets.
 */
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const pro22Path = path.join(rootDir, 'pro22.html');
const wwwDir = path.join(rootDir, 'www');
const androidPublicDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');

console.log('[Sync] Preparing www/ from pro22.html...');

// 1. Ensure directories exist
fs.mkdirSync(wwwDir, { recursive: true });
fs.mkdirSync(path.join(wwwDir, 'assets'), { recursive: true });
fs.mkdirSync(path.join(wwwDir, 'icons'), { recursive: true });

// 2. Copy pro22.html as index.html in www/
fs.copyFileSync(pro22Path, path.join(wwwDir, 'index.html'));
console.log('[Sync] Copied pro22.html -> www/index.html (' + fs.statSync(pro22Path).size + ' bytes)');

// 3. Helper to copy folder recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(path.join(rootDir, 'assets'), path.join(wwwDir, 'assets'));
copyDir(path.join(rootDir, 'icons'), path.join(wwwDir, 'icons'));
if (fs.existsSync(path.join(rootDir, 'manifest.json'))) {
  fs.copyFileSync(path.join(rootDir, 'manifest.json'), path.join(wwwDir, 'manifest.json'));
}
console.log('[Sync] Assets, icons, and manifest copied to www/');

// 4. Sync into android/app/src/main/assets/public/ if android exists
if (fs.existsSync(path.join(rootDir, 'android'))) {
  fs.mkdirSync(androidPublicDir, { recursive: true });
  copyDir(wwwDir, androidPublicDir);
  console.log('[Sync] Mirrored www/ to android/app/src/main/assets/public/');

  // Copy capacitor.config.json to android/app/src/main/assets/
  const capConfig = path.join(rootDir, 'capacitor.config.json');
  if (fs.existsSync(capConfig)) {
    const androidAssets = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets');
    fs.mkdirSync(androidAssets, { recursive: true });
    fs.copyFileSync(capConfig, path.join(androidAssets, 'capacitor.config.json'));
  }
}

console.log('[Sync] Android web bundle synchronization complete!');
