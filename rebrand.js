/**
 * ENLIGHTEN.MINT.CAFE — Global Rebrand Script
 * 
 * Updates all references across the codebase to the new identity.
 * Run with: node rebrand.js
 */

const fs = require('fs');
const path = require('path');

const NEW_NAME = "ENLIGHTEN.MINT.CAFE";
const OLD_NAMES = [
  "ENLIGHTEN.MINT.CAFE",
  "ENLIGHTEN.MINT.CAFE", 
  "ENLIGHTEN.MINT.CAFE", 
  "ENLIGHTEN.MINT.CAFE",
  "The ENLIGHTEN.MINT.CAFE",
  "ENLIGHTEN.MINT.CAFE",
  "ENLIGHTEN.MINT.CAFE"
];

// Directories to ignore (to prevent breaking dependencies)
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '__pycache__'];

// File extensions to process
const VALID_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md', '.py', '.env'];

// Files to skip (sensitive configs)
const SKIP_FILES = ['package-lock.json', 'yarn.lock'];

let filesChanged = 0;
let totalReplacements = 0;

function rebrand(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    try {
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        if (!IGNORE_DIRS.includes(file)) {
          rebrand(filePath);
        }
      } else {
        // Check if file should be processed
        const ext = path.extname(file).toLowerCase();
        if (!VALID_EXTENSIONS.includes(ext) || SKIP_FILES.includes(file)) {
          return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanged = false;
        let replacementCount = 0;

        OLD_NAMES.forEach(oldName => {
          if (content.includes(oldName)) {
            const regex = new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = content.match(regex);
            if (matches) {
              replacementCount += matches.length;
              content = content.replace(regex, NEW_NAME);
              hasChanged = true;
            }
          }
        });

        if (hasChanged) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Rebranded: ${filePath} (${replacementCount} replacements)`);
          filesChanged++;
          totalReplacements += replacementCount;
        }
      }
    } catch (err) {
      console.error(`⚠️ Error processing ${filePath}:`, err.message);
    }
  });
}

console.log(`\n🚀 Initiating Global Rebrand to ${NEW_NAME}...\n`);
console.log(`📋 Searching for: ${OLD_NAMES.join(', ')}\n`);

rebrand('./');

console.log(`\n✨ ════════════════════════════════════════════════════════════`);
console.log(`✨ System-wide identity updated to ENLIGHTEN.MINT.CAFE`);
console.log(`✨ Files modified: ${filesChanged}`);
console.log(`✨ Total replacements: ${totalReplacements}`);
console.log(`✨ ════════════════════════════════════════════════════════════\n`);
