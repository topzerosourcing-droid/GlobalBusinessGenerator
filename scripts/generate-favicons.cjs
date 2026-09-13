const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Master SVG design for Global Business Generator
// 512x512 canvas
// Theme:
// - Global business: Spherical globe with coordinate meridians
// - AI-powered business planning: Brilliant 4-point AI spark at apex
// - Growth and opportunity: Dynamic ascending growth trajectory and arrow
// High contrast, bold geometric silhouette that remains legible at 16x16 and 32x32.
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <!-- Globe Ring Gradient (Indigo to Cyan) -->
    <linearGradient id="globeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <!-- Growth Trajectory Gradient (Emerald to Mint/Cyan) -->
    <linearGradient id="growthGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>

    <!-- Subtle Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Squircle Rounded Base Plate (High-end SaaS icon style) -->
  <rect 
    x="24" 
    y="24" 
    width="464" 
    height="464" 
    rx="108" 
    ry="108" 
    fill="url(#bgGrad)" 
    stroke="#1e293b" 
    stroke-width="8" 
  />

  <!-- Subtle grid accent inside tile -->
  <circle cx="236" cy="276" r="148" fill="#0f172a" fill-opacity="0.6" />

  <!-- === 1. GLOBAL BUSINESS (Globe Meridians & Sphere) === -->
  <!-- Outer Globe Ring -->
  <circle 
    cx="236" 
    cy="276" 
    r="140" 
    fill="none" 
    stroke="url(#globeGrad)" 
    stroke-width="26" 
  />

  <!-- Vertical Meridian (Elliptical Longitude) -->
  <ellipse 
    cx="236" 
    cy="276" 
    rx="68" 
    ry="140" 
    fill="none" 
    stroke="#818cf8" 
    stroke-width="20" 
    stroke-opacity="0.85"
  />

  <!-- Central Longitude Axis -->
  <line 
    x1="236" 
    y1="136" 
    x2="236" 
    y2="416" 
    stroke="#38bdf8" 
    stroke-width="18" 
    stroke-linecap="round"
    stroke-opacity="0.75"
  />

  <!-- Horizontal Latitude Arc -->
  <path 
    d="M 104 276 Q 236 324 368 276" 
    fill="none" 
    stroke="#818cf8" 
    stroke-width="20" 
    stroke-linecap="round"
    stroke-opacity="0.8"
  />

  <!-- === 2. GROWTH & OPPORTUNITY (Ascending Surge Curve & Arrow) === -->
  <!-- Dynamic Growth Swath -->
  <path 
    d="M 110 390 C 160 360 220 290 350 170" 
    fill="none" 
    stroke="url(#growthGrad)" 
    stroke-width="32" 
    stroke-linecap="round" 
  />

  <!-- Growth Arrowhead (Facing top-right) -->
  <polygon 
    points="340,132 404,136 384,196 360,172" 
    fill="url(#growthGrad)" 
    stroke="#10b981" 
    stroke-width="4" 
    stroke-linejoin="round"
  />

  <!-- === 3. AI-POWERED BUSINESS PLANNING (Brilliant 4-Point AI Spark) === -->
  <!-- Spark at apex (X: 400, Y: 112) -->
  <g transform="translate(396, 116)" filter="url(#glow)">
    <!-- 4-point AI Star/Sparkle -->
    <path 
      d="M 0,-44 Q 0,0 44,0 Q 0,0 0,44 Q 0,0 -44,0 Q 0,0 0,-44 Z" 
      fill="#ffffff" 
    />
    <!-- Spark Center Core -->
    <circle cx="0" cy="0" r="10" fill="#38bdf8" />
  </g>

  <!-- Secondary subtle AI micro-spark -->
  <g transform="translate(136, 172) scale(0.48)">
    <path 
      d="M 0,-36 Q 0,0 36,0 Q 0,0 0,36 Q 0,0 -36,0 Q 0,0 0,-36 Z" 
      fill="#38bdf8" 
    />
  </g>
</svg>`;

async function generateFavicons() {
  console.log('Generating Global Business Generator custom favicons...');

  // 1. Save favicon.svg in public directory
  const svgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('Saved favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate required PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  for (const item of sizes) {
    const outPath = path.join(publicDir, item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`Saved ${item.name} (${item.size}x${item.size})`);
  }

  // Generate 64x64 for multi-resolution ICO
  const tmp64 = path.join('/tmp', 'favicon-64.png');
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(tmp64);

  // 3. Generate favicon.ico containing 16x16, 32x32, 48x48, 64x64
  const icoPath = path.join(publicDir, 'favicon.ico');
  const p16 = path.join(publicDir, 'favicon-16x16.png');
  const p32 = path.join(publicDir, 'favicon-32x32.png');
  const p48 = path.join(publicDir, 'favicon-48x48.png');

  try {
    execSync(`convert "${p16}" "${p32}" "${p48}" "${tmp64}" "${icoPath}"`);
    console.log('Saved multi-resolution favicon.ico (16, 32, 48, 64)');
  } catch (err) {
    console.error('Failed to convert ICO:', err);
  }

  // 4. Also generate site.webmanifest for PWA / Mobile Discoverability
  const manifest = {
    name: 'Global Business Generator',
    short_name: 'GBG',
    description: 'Turn your business idea into a professional 34-section business plan.',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#0f172a',
    background_color: '#0b0f19',
    display: 'standalone'
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Saved site.webmanifest');
  console.log('All favicons successfully generated!');
}

generateFavicons().catch(err => {
  console.error('Fatal error generating favicons:', err);
  process.exit(1);
});
