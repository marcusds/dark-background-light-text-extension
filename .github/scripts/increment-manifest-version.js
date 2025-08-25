// This script increments the patch version in manifest.json by 1
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', '..', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

let [major, minor, patch] = manifest.version.split('.').map(Number);
patch += 1;
manifest.version = `${major}.${minor}.${patch}`;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Version bumped to ${manifest.version}`);

