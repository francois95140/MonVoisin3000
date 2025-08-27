// Restore original main.ts
const fs = require('fs');
const path = require('path');

const originalPath = path.join(__dirname, 'src', 'main.ts');
const backupPath = originalPath + '.backup';

if (fs.existsSync(backupPath)) {
  const originalContent = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(originalPath, originalContent);
  fs.unlinkSync(backupPath);
  console.log('Restored original main.ts');
} else {
  console.log('No backup found');
}