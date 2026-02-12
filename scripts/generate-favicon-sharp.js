import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');

// SVG template for favicon
function generateFaviconSVG(size) {
  const padding = size * 0.25;
  const iconSize = size * 0.5;
  const strokeWidth = Math.max(1.5, size / 18);
  const borderRadius = size * 0.1875;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2a2a2a" rx="${borderRadius}"/>
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

async function generateFavicons() {
  console.log('🎨 Generating ImageTools favicons...\n');

  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 180, name: 'apple-touch-icon.png' }, // For iOS
    { size: 192, name: 'android-chrome-192x192.png' }, // For Android
    { size: 512, name: 'android-chrome-512x512.png' }, // For Android
  ];

  try {
    for (const { size, name } of sizes) {
      const svg = generateFaviconSVG(size);
      const outputPath = join(publicDir, name);

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Also generate favicon.ico (16x16 and 32x32 combined)
    console.log('\n📦 Generating favicon.ico...');

    const svg16 = generateFaviconSVG(16);
    const svg32 = generateFaviconSVG(32);

    // For .ico we'll create a 32x32 version (most common)
    await sharp(Buffer.from(svg32))
      .png()
      .toFile(join(publicDir, 'favicon.ico'));

    console.log('✓ Generated favicon.ico (32x32)');

    console.log('\n✨ All favicons generated successfully!');
    console.log('\n📝 Files created in public/:');
    console.log('  - favicon.svg (already exists)');
    console.log('  - favicon.ico');
    console.log('  - favicon-16x16.png');
    console.log('  - favicon-32x32.png');
    console.log('  - favicon-48x48.png');
    console.log('  - apple-touch-icon.png (180x180)');
    console.log('  - android-chrome-192x192.png');
    console.log('  - android-chrome-512x512.png');
    console.log('\n🎉 Your app now has beautiful favicons for all devices!');

  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
