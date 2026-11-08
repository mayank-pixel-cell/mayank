import fs from 'fs';

const html = fs.readFileSync('pro22.html', 'utf8');
const settingsView = fs.readFileSync('src/views/settingsView.js', 'utf8');

console.log('--- Checking pro22.html settings-arrow-btn ---');
const btnRegex = /<button[^>]*class="[^"]*settings-arrow-btn[^"]*"[^>]*>/g;
let match;
while ((match = btnRegex.exec(html)) !== null) {
  const btnTag = match[0];
  const hasStop = btnTag.includes('stopPropagation');
  console.log(`[pro22.html] stopPropagation: ${hasStop} | ${btnTag.slice(0, 120)}...`);
}

console.log('\n--- Checking src/views/settingsView.js settings-arrow-btn ---');
while ((match = btnRegex.exec(settingsView)) !== null) {
  const btnTag = match[0];
  const hasStop = btnTag.includes('stopPropagation');
  console.log(`[settingsView.js] stopPropagation: ${hasStop} | ${btnTag.slice(0, 120)}...`);
}
