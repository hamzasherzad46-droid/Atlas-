#!/usr/bin/env node
/**
 * Every brand image, drawn from public/icons/icon.svg (the seal) and the bundled fonts:
 *   app icons (192, 512, maskable 512, Apple touch 180), a 32 px PNG favicon (these carry no text),
 *   iOS launch screens for current iPhones, and the 1200 x 630 share image (public/share.jpg).
 * The share image's engraving comes from scripts/engravings.py. Run after changing the seal:
 *   python3 scripts/engravings.py && node scripts/brand-assets.cjs
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const pub = (...p) => path.join(ROOT, 'public', ...p)
const dataUrl = (file, type) => `data:${type};base64,${fs.readFileSync(file).toString('base64')}`

const SEAL = dataUrl(pub('icons', 'icon.svg'), 'image/svg+xml')
const TYPEFACE = dataUrl(path.join(ROOT, 'node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2'), 'font/woff2')
const ENGRAVING = dataUrl(path.join(__dirname, 'brand', 'share-engraving.jpg'), 'image/jpeg')

// The house colours (src/styles/global.css): obsidian, aged ivory, antique brass, dimmed parchment.
const C = { obsidian: '#171614', ivory: '#e8ddc5', brass: '#a88a54', paper: '#c9bb9c' }

/** iPhones in portrait: CSS width and height, and pixel ratio. */
const IPHONES = [
  [440, 956, 3], // 16 Pro Max
  [402, 874, 3], // 16 Pro
  [430, 932, 3], // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [428, 926, 3], // 12 Pro Max, 13 Pro Max, 14 Plus
  [390, 844, 3], // 12, 12 Pro, 13, 13 Pro, 14
  [375, 812, 3], // X, XS, 11 Pro, 12 mini, 13 mini
  [414, 896, 3], // XS Max, 11 Pro Max
  [414, 896, 2], // XR, 11
  [375, 667, 2], // 8, SE (2nd and 3rd generation)
]

// The app's one typeface (src/styles/global.css --font).
const FONT = `@font-face { font-family: 'Hanken Grotesk'; src: url(${TYPEFACE}) format('woff2'); font-weight: 100 900; }`

async function shoot(browser, html, width, height, out, scale = 1) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(150)
  await page.screenshot(out.endsWith('.jpg') ? { path: out, type: 'jpeg', quality: 86 } : { path: out })
  await page.close()
  console.log(`${path.relative(ROOT, out)}  ${Math.round(fs.statSync(out).size / 1024)} KB`)
}

const iconHtml = (size, pad = 0) =>
  `<body style="margin:0;background:${C.obsidian}"><img src="${SEAL}" style="display:block;width:${size - 2 * pad}px;height:${size - 2 * pad}px;margin:${pad}px"></body>`

const splashHtml = (w, h) => {
  const seal = Math.round(Math.min(w, h) * 0.3)
  return `<style>${FONT} body { margin:0; width:${w}px; height:${h}px; background:${C.obsidian}; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:${Math.round(seal * 0.16)}px; }
    .w { font-family:'Hanken Grotesk'; font-weight:600; font-size:${Math.round(seal * 0.17)}px; letter-spacing:0.2em; margin-right:-0.2em; color:${C.ivory}; }</style>
    <body><img src="${SEAL}" width="${seal}" height="${seal}" style="margin-top:-${Math.round(seal * 0.25)}px"><div class="w">ATLAS</div></body>`
}

const shareHtml = `<style>${FONT}
  body { margin:0; width:1200px; height:630px; background:${C.obsidian}; display:grid; grid-template-columns: 1fr 520px; font-family:'Hanken Grotesk'; }
  .text { padding:72px 64px 64px 72px; display:flex; flex-direction:column; }
  .mark { display:flex; align-items:center; gap:22px; color:${C.ivory}; font-size:34px; font-weight:600; letter-spacing:0.2em; padding-bottom:28px; border-bottom:1px solid ${C.brass}99; }
  .line { margin-top:auto; color:${C.ivory}; font-size:46px; line-height:1.1; font-weight:600; letter-spacing:-0.02em; }
  .plate { background:${C.paper}; isolation:isolate; }
  .plate img { display:block; width:520px; height:630px; object-fit:cover; mix-blend-mode:multiply; }
</style>
<body>
  <div class="text">
    <div class="mark"><img src="${SEAL}" width="56" height="56">ATLAS</div>
    <div class="line">Learn anatomy in 3D by typing the names of structures.</div>
  </div>
  <div class="plate"><img src="${ENGRAVING}"></div>
</body>`

;(async () => {
  const browser = await chromium.launch()
  await shoot(browser, iconHtml(512), 512, 512, pub('icons', 'icon-512.png'))
  await shoot(browser, iconHtml(192), 192, 192, pub('icons', 'icon-192.png'))
  // Maskable: the seal kept inside the central safe circle (80 %), on obsidian to the edges.
  await shoot(browser, iconHtml(512, 40), 512, 512, pub('icons', 'icon-maskable-512.png'))
  await shoot(browser, iconHtml(180), 180, 180, pub('icons', 'apple-touch-icon.png'))
  await shoot(browser, iconHtml(32), 32, 32, pub('icons', 'favicon-32.png'))

  fs.mkdirSync(pub('splash'), { recursive: true })
  const links = []
  for (const [w, h, r] of IPHONES) {
    const name = `splash-${w * r}x${h * r}.png`
    await shoot(browser, splashHtml(w, h), w, h, pub('splash', name), r)
    links.push(
      `<link rel="apple-touch-startup-image" href="/splash/${name}" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)" />`,
    )
  }
  await shoot(browser, shareHtml, 1200, 630, pub('share.jpg'))
  await browser.close()
  console.log('\nLaunch screen links (index.html):\n' + links.join('\n'))
})()
