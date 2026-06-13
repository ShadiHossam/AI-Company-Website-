/**
 * Generates 1200×630 PNG OG images for all pages using sharp.
 * Run: node scripts/generate-og.cjs
 */

const sharp = require('../node_modules/sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '../public/assets');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 630;
const TEAL = '#00e3fd';
const NAVY = '#00253b';
const MID  = '#006875';

function makeSvg(title, subtitle, eyebrow) {
  // Escape XML
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const t = esc(title);
  const s = esc(subtitle);
  const e = esc(eyebrow);

  // Word-wrap title at ~38 chars
  const words = title.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 36) {
      if (cur) lines.push(esc(cur.trim()));
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(esc(cur));

  const titleY = lines.length === 1 ? 280 : 255;
  const titleLines = lines.map((l, i) =>
    `<text x="80" y="${titleY + i * 72}" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="white">${l}</text>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="#003b5c"/>
    </linearGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${TEAL}"/>
      <stop offset="100%" stop-color="#9cf0ff"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${MID}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${TEAL}" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="1100" cy="80" r="280" fill="url(#accent)"/>
  <circle cx="950" cy="550" r="180" fill="${TEAL}" fill-opacity="0.05"/>

  <!-- Top teal bar -->
  <rect x="0" y="0" width="${W}" height="6" fill="url(#teal)"/>

  <!-- Bottom gradient strip -->
  <rect x="0" y="${H - 80}" width="${W}" height="80" fill="${NAVY}" fill-opacity="0.6"/>

  <!-- Eyebrow -->
  <text x="80" y="120" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="${TEAL}" letter-spacing="2">${e}</text>

  <!-- Title lines -->
  ${titleLines}

  <!-- Subtitle -->
  <text x="80" y="${titleY + lines.length * 72 + 44}" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.60)" font-weight="400">${s}</text>

  <!-- Bottom: logo area -->
  <text x="80" y="${H - 28}" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="rgba(255,255,255,0.35)">AEGIS AI</text>
  <text x="${W - 80}" y="${H - 28}" font-family="Arial, sans-serif" font-size="20" fill="${TEAL}" text-anchor="end" font-weight="600">aegisai.ae</text>

  <!-- Divider line -->
  <line x1="80" y1="${H - 88}" x2="${W - 80}" y2="${H - 88}" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
</svg>`;
}

const pages = [
  {
    file: 'og-home.jpg',
    eyebrow: 'DUBAI AI COMPANY',
    title: 'Custom AI Systems + Team Training',
    subtitle: 'For SMEs in real estate, retail, hospitality & logistics',
  },
  {
    file: 'og-about.jpg',
    eyebrow: 'ABOUT AEGIS AI',
    title: 'We Build AI That Actually Works',
    subtitle: 'Dubai-based team. Bilingual. 100% refund guarantee.',
  },
  {
    file: 'og-custom-ai.jpg',
    eyebrow: 'CUSTOM AI DEVELOPMENT',
    title: 'AI Built for Your Business. Not a Template.',
    subtitle: '8–12 week delivery · UAE-compliant · AED 15k–80k',
  },
  {
    file: 'og-ai-training.jpg',
    eyebrow: 'AI TRAINING & WORKSHOPS',
    title: 'Your Team Is Your Biggest AI Asset.',
    subtitle: 'Hands-on workshops in Arabic & English · Dubai-based',
  },
  {
    file: 'og-ai-strategy.jpg',
    eyebrow: 'AI STRATEGY CONSULTING',
    title: 'Know Where AI Helps Before You Spend a Dirham.',
    subtitle: '2-week sprint · Full roadmap · Starting AED 8,000',
  },
  {
    file: 'og-services.jpg',
    eyebrow: 'AEGIS AI SERVICES',
    title: 'Three Services. One Mission: AI-Ready.',
    subtitle: 'Build · Train · Strategise — covered by our guarantee',
  },
  {
    file: 'og-blog.jpg',
    eyebrow: 'AI INSIGHTS FOR DUBAI BUSINESSES',
    title: 'Practical AI Guides for UAE SMEs',
    subtitle: 'Case studies, ROI guides, and implementation tips',
  },
  {
    file: 'og-products.jpg',
    eyebrow: 'AEGIS AI PRODUCTS',
    title: 'Ready-Made AI Products for UAE Businesses',
    subtitle: 'Faster to deploy · Lower cost · Same guarantee',
  },
  {
    file: 'og-results.jpg',
    eyebrow: 'CLIENT RESULTS',
    title: 'Real AI Results for Dubai Businesses',
    subtitle: 'Case studies across real estate, retail & hospitality',
  },
  {
    file: 'og-logistics.jpg',
    eyebrow: 'AI FOR LOGISTICS · DUBAI',
    title: 'Route Optimization & Fleet AI for UAE Logistics',
    subtitle: 'Cut delivery costs · Automate dispatch · Forecast demand',
  },
  {
    file: 'og-privacy.jpg',
    eyebrow: 'AEGIS AI',
    title: 'Privacy Policy',
    subtitle: 'UAE PDPL compliant · aegisai.ae',
  },
  {
    file: 'og-terms.jpg',
    eyebrow: 'AEGIS AI',
    title: 'Terms of Service',
    subtitle: 'aegisai.ae',
  },
  {
    file: 'og-contact.jpg',
    eyebrow: 'CONTACT AEGIS AI',
    title: 'Book a Free AI Strategy Call',
    subtitle: 'Dubai-based · Responds within 4 hours · Arabic & English',
  },
];

async function run() {
  for (const p of pages) {
    const svg = makeSvg(p.title, p.subtitle, p.eyebrow);
    const outPath = path.join(OUT, p.file);
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(outPath);
    console.log('✓', p.file);
  }
  console.log('\nAll OG images generated in public/assets/');
}

run().catch(err => { console.error(err); process.exit(1); });
