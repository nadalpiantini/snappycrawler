// Simple script to generate basic icons for Snappy extension
const fs = require('fs');
const path = require('path');

// Simple PNG generator - creates a 500x500 PNG with "📸" text
function generateIcon(size, filename) {
  // For now, we'll create a simple SVG and save it
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#8B5CF6"/>
  <text x="50%" y="50%" font-size="${size * 0.6}" text-anchor="middle" dy=".3em" fill="white">📸</text>
</svg>`;

  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
}

const iconsDir = path.join(__dirname, '../extension/icons');

// Generate icons
generateIcon(16, path.join(iconsDir, 'icon16.svg'));
generateIcon(48, path.join(iconsDir, 'icon48.svg'));
generateIcon(128, path.join(iconsDir, 'icon128.svg'));

console.log('Icons generated successfully!');
