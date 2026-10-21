const fs = require('fs');
const html = fs.readFileSync('public/host.html', 'utf8');
const lines = html.split('\n');

let currentModal = null;
let modalStartLine = 0;
let modalContentStart = 0;
let modalContentDepth = 0;
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const modalMatch = line.match(/<div\s+id="([^"]+)"\s+class="(modal-overlay|morning-deaths-overlay|celebration-overlay)/);
  if (modalMatch) {
    currentModal = modalMatch[1];
    modalStartLine = i + 1;
    depth = 0;
    modalContentStart = 0;
    console.log(`\n=== MODAL [${currentModal}] starts line ${modalStartLine} ===`);
  }

  if (currentModal) {
    const opens = (line.match(/<div(\s|>|$)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;

    for (let c = 0; c < opens; c++) {
      depth++;
      if (line.includes('modal-content') || line.includes('morning-deaths-box') || line.includes('celebration-box')) {
        modalContentStart = i + 1;
        modalContentDepth = depth;
        console.log(`  modal-content entered at depth ${modalContentDepth} on line ${i + 1}`);
      }
    }

    for (let c = 0; c < closes; c++) {
      if (depth === modalContentDepth && modalContentStart > 0) {
        console.log(`  modal-content CLOSED at line ${i + 1}`);
        modalContentStart = 0;
      }
      depth--;
      if (depth === 0) {
        console.log(`=== MODAL [${currentModal}] ENDS at line ${i + 1} ===`);
        currentModal = null;
        break;
      }
    }
  }
}
