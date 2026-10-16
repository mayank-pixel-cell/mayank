import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.resolve(__dirname, '..', 'src-tauri', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// CRC32 implementation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePng(width, height) {
  // Generate RGBA buffer: Sleek dark cyan / purple gradient badge with glowing circle
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inside circular app badge
        const t = (x + y) / (width + height);
        // Gradient from Deep Navy (0x0D, 0x13, 0x22) to Cyan / Purple accent
        const r = Math.round(13 + t * 40);
        const g = Math.round(19 + t * 180);
        const b = Math.round(34 + t * 220);
        
        // Arc glowing ring feature
        const ringDist = Math.abs(dist - radius * 0.7);
        if (ringDist < width * 0.08) {
          // Glow Cyan #00F0FF
          const intensity = 1 - (ringDist / (width * 0.08));
          rawData[offset++] = Math.round(0 * intensity + r * (1 - intensity));
          rawData[offset++] = Math.round(240 * intensity + g * (1 - intensity));
          rawData[offset++] = Math.round(255 * intensity + b * (1 - intensity));
          rawData[offset++] = 255;
        } else {
          rawData[offset++] = r;
          rawData[offset++] = g;
          rawData[offset++] = b;
          rawData[offset++] = 255;
        }
      } else if (dist <= radius + 2) {
        // Anti-aliased boundary
        const alpha = Math.round(255 * Math.max(0, 1 - (dist - radius) / 2));
        rawData[offset++] = 0;
        rawData[offset++] = 240;
        rawData[offset++] = 255;
        rawData[offset++] = alpha;
      } else {
        // Transparent outer
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk (compressed data)
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function makeIco(pngBuffers) {
  // ICO header: 6 bytes
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Image type: 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  let offset = 6 + count * 16;
  const entries = [];

  for (const { width, height, buf } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry[0] = width >= 256 ? 0 : width;
    entry[1] = height >= 256 ? 0 : height;
    entry[2] = 0; // Color count
    entry[3] = 0; // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buf.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset
    entries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buf)]);
}

console.log('Generating Arc Tracker application icons...');

const png32 = makePng(32, 32);
const png128 = makePng(128, 128);
const png256 = makePng(256, 256);
const png512 = makePng(512, 512);

fs.writeFileSync(path.join(iconsDir, '32x32.png'), png32);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), png128);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), png256);
fs.writeFileSync(path.join(iconsDir, 'icon.png'), png512);

const icoBuf = makeIco([
  { width: 32, height: 32, buf: png32 },
  { width: 128, height: 128, buf: png128 },
  { width: 256, height: 256, buf: png256 }
]);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuf);
// Duplicate icon.png to icon.icns placeholder
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), png512);

// Copy icons and apple-touch-icon to public/icons and public/
const publicDir = path.resolve(__dirname, '..', 'public');
const publicIconsDir = path.join(publicDir, 'icons');
if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}
fs.writeFileSync(path.join(publicIconsDir, '32x32.png'), png32);
fs.writeFileSync(path.join(publicIconsDir, '128x128.png'), png128);
fs.writeFileSync(path.join(publicIconsDir, '128x128@2x.png'), png256);
fs.writeFileSync(path.join(publicIconsDir, 'icon.png'), png512);
fs.writeFileSync(path.join(publicIconsDir, 'apple-touch-icon.png'), png256);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png256);

console.log('All icons generated in src-tauri/icons/ and public/ successfully!');
