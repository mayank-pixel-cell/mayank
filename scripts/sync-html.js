import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const pro22Path = path.join(rootDir, 'pro22.html');
const pro222Path = path.join(rootDir, 'pro22_2.html');
const serverSyncPath = path.join(rootDir, 'src', 'modules', 'serverSyncEngine.js');
const lbPath = path.join(rootDir, 'src', 'modules', 'leaderboardGroups.js');

let pro22Html = fs.readFileSync(pro22Path, 'utf-8');
const serverSyncJs = fs.readFileSync(serverSyncPath, 'utf-8');
const lbJs = fs.readFileSync(lbPath, 'utf-8');

// Find marker
const lbMarker = '// === ARC LEADERBOARD & GROUPS ENGINE ===';
const faqMarker = '// === ARC FAQ ENGINE ===';

const startIdx = pro22Html.indexOf(lbMarker);
const endIdx = pro22Html.indexOf(faqMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found! startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const combinedNewBlock = `// ============================================================================
// ARC EXTERNAL SERVER SYNC ENGINE & LEADERBOARD/GROUPS HYBRID ENGINE
// ============================================================================

${serverSyncJs}

${lbJs}

`;

pro22Html = pro22Html.slice(0, startIdx) + combinedNewBlock + pro22Html.slice(endIdx);

fs.writeFileSync(pro22Path, pro22Html, 'utf-8');
console.log('Successfully updated pro22.html');

fs.writeFileSync(pro222Path, pro22Html, 'utf-8');
console.log('Successfully created/updated pro22_2.html');
