const fs = require('fs');
const html = fs.readFileSync('public/host.html', 'utf8');

const ids = [
  'mobile-btn-main-action',
  'mobile-btn-tv-toggle',
  'mobile-btn-quick-deaths',
  'mobile-btn-quick-restart',
  'mobile-hdr-night',
  'mobile-hdr-timer',
  'mobile-hdr-alive',
  'mobile-hdr-dead',
  'mobile-tab-roster-count',
  'mobile-players-count',
  'mobile-rooms-list',
  'mobile-roster-list',
  'mobile-players-tab-section',
  'mobile-tools-tab-section',
  'btn-m-tool-pyro',
  'btn-m-tool-deaths',
  'btn-m-tool-qr',
  'btn-m-tool-manual',
  'btn-m-tool-restart-night',
  'btn-m-tool-new-round',
  'btn-m-tool-reset-all',
  'btn-m-tool-sound',
  'btn-m-tool-fullscreen',
  'btn-mobile-add-manual',
  'mobile-roster-search'
];

let missing = 0;
for (const id of ids) {
  if (!html.includes(`id="${id}"`)) {
    console.error('MISSING ID:', id);
    missing++;
  }
}
if (missing === 0) {
  console.log(`SUCCESS: All ${ids.length} mobile IDs exist in host.html!`);
} else {
  console.error(`${missing} IDs missing!`);
  process.exit(1);
}
