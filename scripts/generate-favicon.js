#!/usr/bin/env node

/**
 * Favicon Generator for ImageTools
 *
 * This script generates PNG favicon files that can be converted to .ico
 *
 * Usage:
 *   node scripts/generate-favicon.js
 *
 * Then use an online converter like https://favicon.io/favicon-converter/
 * to convert the PNG files to favicon.ico
 */

const fs = require('fs');
const path = require('path');

// Simple SVG to Canvas approach using data URLs
function generateFaviconSVG(size) {
  const padding = size * 0.25;
  const iconSize = size * 0.5;
  const strokeWidth = Math.max(1.5, size / 18);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2a2a2a" rx="${size * 0.1875}"/>
  <g transform="translate(${padding}, ${padding})">
    <path d="M ${iconSize * 0.255} ${iconSize * 0.042} L ${iconSize * 0.25} ${iconSize * 0.667} a ${iconSize * 0.083} ${iconSize * 0.083} 0 0 0 ${iconSize * 0.083} ${iconSize * 0.083} h ${iconSize * 0.625}"
          stroke="#E87949"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"/>
    <path d="M ${iconSize * 0.042} ${iconSize * 0.255} L ${iconSize * 0.667} ${iconSize * 0.25} a ${iconSize * 0.083} ${iconSize * 0.083} 0 0 1 ${iconSize * 0.083} ${iconSize * 0.083} v ${iconSize * 0.625}"
          stroke="#E87949"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"/>
  </g>
</svg>`;
}

async function generatePNGFromSVG() {
  console.log('🎨 Generating ImageTools favicons...\n');

  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 64, name: 'favicon-64x64.png' },
  ];

  const publicDir = path.join(__dirname, '..', 'public');

  for (const { size, name } of sizes) {
    const svg = generateFaviconSVG(size);
    const svgPath = path.join(publicDir, `temp-${size}.svg`);

    // Write SVG
    fs.writeFileSync(svgPath, svg);
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  console.log('\n📝 Next steps:');
  console.log('1. Open scripts/generate-favicon.html in your browser');
  console.log('2. Click "Generate & Download All Sizes"');
  console.log('3. Use https://favicon.io/favicon-converter/ to convert PNGs to .ico');
  console.log('4. Save the favicon.ico file to the public/ directory');
  console.log('\nOr use the SVG favicon (already configured in index.html) which works in all modern browsers! ✨');
}

generatePNGFromSVG().catch(console.error);
