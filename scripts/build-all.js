#!/usr/bin/env node
// build:all — minifies all .js files from sections/ and utils/ into dist/
// preserving folder structure and filenames as *.min.js

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const DIRS = ['sections', 'utils'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function findJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findJsFiles(full);
    if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
      return [full];
    }
    return [];
  });
}

let built = 0;

for (const dir of DIRS) {
  const srcDir = path.join(ROOT, dir);
  const files = findJsFiles(srcDir);

  for (const file of files) {
    const rel = path.relative(srcDir, file);                          // e.g. sectionHero.js
    const outName = rel.replace(/\.js$/, '.min.js');                  // sectionHero.min.js
    const outPath = path.join(ROOT, 'dist', dir, outName);
    ensureDir(path.dirname(outPath));

    const cmd = `npx terser "${file}" --compress passes=3,ecma=2015 --mangle -o "${outPath}"`;
    console.log(`  building: ${dir}/${rel} → dist/${dir}/${outName}`);
    execSync(cmd, { stdio: 'inherit' });
    built++;
  }
}

console.log(`\n✅ build:all complete — ${built} file(s) minified into dist/`);
