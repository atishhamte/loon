const fs = require('fs');
const path = require('path');

// Rename .js files to .mjs in dist-esm directory
function renameFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renameFiles(filePath);
    } else if (file.endsWith('.js')) {
      const newPath = filePath.replace(/\.js$/, '.mjs');
      fs.renameSync(filePath, newPath);
    }
  });
}

// Copy dist-esm to dist with .mjs extension
const distEsmDir = path.join(__dirname, '..', 'dist-esm');
const distDir = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distEsmDir)) {
  renameFiles(distEsmDir);

  // Copy .mjs files to dist directory
  const files = fs.readdirSync(distEsmDir);
  files.forEach(file => {
    if (file.endsWith('.mjs')) {
      fs.copyFileSync(
        path.join(distEsmDir, file),
        path.join(distDir, file)
      );
    }
  });

  console.log('ESM files renamed and copied successfully');
}
