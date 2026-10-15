import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(publicDir, 'assets');

async function downloadFile(url, destPath, headers = {}) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`Downloading: ${url} -> ${path.relative(rootDir, destPath)}`);
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
  console.log(`Saved: ${destPath} (${buffer.length} bytes)`);
  return buffer;
}

async function main() {
  console.log('=== Localizing All External Assets for 100% Offline Capability ===\n');

  // 1. Download Tailwind CSS
  const tailwindPath = path.join(assetsDir, 'tailwind.js');
  await downloadFile('https://cdn.tailwindcss.com', tailwindPath);

  // 2. Download FontAwesome CSS and Webfonts
  const faCssPath = path.join(assetsDir, 'fontawesome', 'css', 'all.min.css');
  await downloadFile('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', faCssPath);

  const faFontFiles = [
    'fa-solid-900.woff2',
    'fa-solid-900.ttf',
    'fa-regular-400.woff2',
    'fa-regular-400.ttf',
    'fa-brands-400.woff2',
    'fa-brands-400.ttf',
    'fa-v4compatibility.woff2',
    'fa-v4compatibility.ttf'
  ];

  for (const font of faFontFiles) {
    const fontUrl = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/${font}`;
    const fontDest = path.join(assetsDir, 'fontawesome', 'webfonts', font);
    try {
      await downloadFile(fontUrl, fontDest);
    } catch (err) {
      console.warn(`Warning downloading font ${font}:`, err.message);
    }
  }

  // 3. Download Google Font Inter & font files
  console.log('\n--- Fetching Inter Font CSS ---');
  const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
  // Use modern browser User-Agent so Google returns woff2 files
  const chromeUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  const gFontsRes = await fetch(googleFontsUrl, {
    headers: { 'User-Agent': chromeUa }
  });
  if (!gFontsRes.ok) {
    throw new Error(`Failed to fetch Google Fonts: ${gFontsRes.status}`);
  }
  let interCss = await gFontsRes.text();

  // Extract all font URLs
  const fontUrlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  let match;
  const urlsToDownload = new Set();
  while ((match = fontUrlRegex.exec(interCss)) !== null) {
    urlsToDownload.add(match[1]);
  }

  console.log(`Found ${urlsToDownload.size} Inter font files in CSS. Downloading...`);
  const fontsDestDir = path.join(assetsDir, 'fonts', 'files');
  if (!fs.existsSync(fontsDestDir)) {
    fs.mkdirSync(fontsDestDir, { recursive: true });
  }

  let index = 0;
  for (const fontUrl of urlsToDownload) {
    index++;
    const ext = path.extname(new URL(fontUrl).pathname) || '.woff2';
    const localFileName = `inter-${index}${ext}`;
    const localFilePath = path.join(fontsDestDir, localFileName);
    await downloadFile(fontUrl, localFilePath);

    // Replace in CSS with relative path
    interCss = interCss.replaceAll(fontUrl, `./files/${localFileName}`);
  }

  const interCssPath = path.join(assetsDir, 'fonts', 'inter.css');
  fs.writeFileSync(interCssPath, interCss, 'utf8');
  console.log(`Saved localized Inter CSS at: ${interCssPath}`);

  // 4. Download Favicons for local offline display
  console.log('\n--- Downloading favicons for local display ---');
  const favicons = [
    { name: 'chrome-webstore.png', url: 'https://ssl.gstatic.com/chrome/webstore/images/icon_48px.png' },
    { name: 'google.ico', url: 'https://www.gstatic.com/images/branding/searchlogo/ico/favicon.ico' },
    { name: 'youtube.ico', url: 'https://www.youtube.com/s/desktop/e6aecce7/img/favicon.ico' },
    { name: 'chess.ico', url: 'https://www.chess.com/bundles/web/favicons/favicon.46041f2d.ico' },
    { name: 'pw.ico', url: 'https://www.pw.live/study-v2/pw.ico' },
    { name: 'gemini.png', url: 'https://www.gstatic.com/lamda/images/gemini_sparkle_4g_512_lt_f94943af3be039176192d.png' }
  ];

  for (const fav of favicons) {
    const favDest = path.join(assetsDir, 'favicons', fav.name);
    try {
      await downloadFile(fav.url, favDest);
    } catch (e) {
      console.warn(`Could not download favicon ${fav.name}:`, e.message);
    }
  }

  console.log('\n=== All assets localized successfully! ===');
}

main().catch(err => {
  console.error('Fatal error localizing assets:', err);
  process.exit(1);
});
