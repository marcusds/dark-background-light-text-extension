#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Cross-platform file operations
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach((file) => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function removeRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const zipName = 'source.zip';
const tempDir = 'temp-build';

console.log('Building submission zip...');

removeRecursive(tempDir);
if (fs.existsSync(zipName)) {
  fs.unlinkSync(zipName);
}

fs.mkdirSync(tempDir);

const filesToInclude = [
  // Source code
  'src/',
  'ui/',
  'test/',
  'icons/',

  // Build configuration
  'package.json',
  'package-lock.json',
  'rollup.config.mjs',
  'tsconfig.json',
  'vitest.config.ts',

  // Linting and formatting
  'eslint.config.mjs',
  '.prettierrc.yaml',

  // Documentation and setup
  'README.md',
  'LICENSE',
  'manifest.json',

  // Git configuration (optional but helpful)
  '.gitignore',
  '.gitattributes',

  // GitHub workflows (shows build process)
  '.github/',

  // Husky hooks
  '.husky/',
];

// Copy files to temp directory
filesToInclude.forEach((item) => {
  if (fs.existsSync(item)) {
    const targetPath = path.join(tempDir, item);
    copyRecursive(item, targetPath);
    console.log(`✓ Copied ${item}`);
  } else {
    console.log(`⚠ Skipped ${item} (not found)`);
  }
});

// Create a build instruction file for AMO reviewers
const buildInstructions = `# Build Instructions for Review

This Firefox extension uses Node.js and npm for building.

## Prerequisites
- Node.js
- npm

## Build Steps
1. Install dependencies:
   npm install

2. Build the extension:
   npm run build

3. The built extension files will be in the dist/ directory

## Development Scripts
- \`npm run build\` - Build production version
- \`npm run watch\` - Build and watch for changes
- \`npm run test\` - Run tests
- \`npm run lint\` - Run linting
- \`npm run typecheck\` - Run TypeScript checks

The extension is written in TypeScript and uses Rollup for bundling.
`;

fs.writeFileSync(
  path.join(tempDir, 'BUILD_INSTRUCTIONS.md'),
  buildInstructions,
);
console.log('✓ Created BUILD_INSTRUCTIONS.md');

// Create the zip file
console.log(`Creating ${zipName}...`);
execSync(`cd ${tempDir} && bestzip ../${zipName} *`, {
  stdio: 'inherit',
  shell: true,
});

// Clean up temp directory
removeRecursive(tempDir);

console.log(`✅ Created ${zipName} for submission`);
console.log(
  `File size: ${(fs.statSync(zipName).size / 1024 / 1024).toFixed(2)} MB`,
);
