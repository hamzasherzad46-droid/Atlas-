#!/usr/bin/env node
/**
 * Every brand image, drawn from the app's own 3D models and its bundled typeface:
 *   public/icons/icon.svg — the mark: the body's outline seen from the front (traced from
 *     public/models/body-skin.glb) as a white hairline inside a reticle, with the heading index in
 *     the accent, on black;
 *   the app icons (192, 512, maskable 512, Apple touch 180) and a 32 px PNG favicon, from icon.svg;
 *   iOS launch screens for current iPhones (the mark and the wordmark on black);
 *   the 1200 x 630 share image (public/share.jpg): the wordmark and one line, beside the body as a
 *     point cloud, as on Today.
 * Needs Playwright (with its Chromium) and the models in public/models:
 *   node scripts/brand-assets.cjs
 */
const { chromium } = require('playwright')
const fs = require('fs')
const http = require('http')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const pub = (...p) => path.join(ROOT, 'public', ...p)
const dataUrl = (file, type) => `data:${type};base64,${fs.readFileSync(file).toString('base64')}`

const TYPEFACE = dataUrl(path.join(ROOT, 'node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2'), 'font/woff2')

// The house colours (src/styles/global.css, dark theme): black, white, the secondary grey and the accent.
const C = { bg: '#000000', fg: '#ffffff', fg2: '#9a9a9a', line: 'rgba(255,255,255,0.25)', accent: '#8fb8ff' }

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

/** A static server for the project folder, so the drawing page can load three.js, the Draco decoder and the models. */
function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.json': 'application/json' }
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404)
      return res.end()
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)))
}

/**
 * The mark (512 × 512): a reticle (a circle and four ticks, the top one in the accent, like the
 * heading tape's index) around the figure's outline. Strokes are thick enough to hold at 32 px.
 */
function markSvg(points) {
  const R = 214
  const S = 372 // the traced square's side: the figure is 96 % of it, so it stands inside the circle
  const o = 256 - S / 2
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${(o + x * S).toFixed(1)},${(o + y * S).toFixed(1)}`).join('') + 'Z'
  const tick = (a, colour) => {
    const r = (a * Math.PI) / 180
    const [x1, y1, x2, y2] = [256 + Math.sin(r) * (R + 6), 256 - Math.cos(r) * (R + 6), 256 + Math.sin(r) * (R + 30), 256 - Math.cos(r) * (R + 30)]
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${colour}"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Atlas: the body's outline seen from the front (traced from public/models/body-skin.glb by scripts/brand-assets.cjs) inside a reticle. -->
  <rect width="512" height="512" fill="${C.bg}"/>
  <g fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="256" cy="256" r="${R}" stroke="${C.line}"/>
    ${tick(0, C.accent)}${tick(90, C.fg2)}${tick(180, C.fg2)}${tick(270, C.fg2)}
    <path d="${d}" stroke="${C.fg}"/>
  </g>
</svg>
`
}

async function shoot(browser, html, width, height, out, scale = 1) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(150)
  await page.screenshot(out.endsWith('.jpg') ? { path: out, type: 'jpeg', quality: 88 } : { path: out })
  await page.close()
  console.log(`${path.relative(ROOT, out)}  ${Math.round(fs.statSync(out).size / 1024)} KB`)
}

;(async () => {
  const server = await serve()
  const base = `http://127.0.0.1:${server.address().port}`
  // Software WebGL, so this runs on a machine without a GPU.
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

  const draw = await browser.newPage({ viewport: { width: 1200, height: 800 } })
  await draw.goto(`${base}/scripts/brand/figure.html`)
  await draw.waitForFunction(() => window.ready)
  const { points, raw } = await draw.evaluate(() => window.outline('body-skin.glb'))
  console.log(`outline: ${raw} boundary pixels, ${points.length} points after simplifying`)
  const cloud = await draw.evaluate(() => window.cloud(560, 630))
  await draw.close()

  const svg = markSvg(points)
  fs.writeFileSync(pub('icons', 'icon.svg'), svg)
  console.log(`public/icons/icon.svg  ${Math.round(svg.length / 1024)} KB`)
  const MARK = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

  const iconHtml = (size, pad = 0) =>
    `<body style="margin:0;background:${C.bg}"><img src="${MARK}" style="display:block;width:${size - 2 * pad}px;height:${size - 2 * pad}px;margin:${pad}px"></body>`
  await shoot(browser, iconHtml(512), 512, 512, pub('icons', 'icon-512.png'))
  await shoot(browser, iconHtml(192), 192, 192, pub('icons', 'icon-192.png'))
  // Maskable: the mark kept inside the central safe circle (80 %), black to the edges.
  await shoot(browser, iconHtml(512, 40), 512, 512, pub('icons', 'icon-maskable-512.png'))
  await shoot(browser, iconHtml(180), 180, 180, pub('icons', 'apple-touch-icon.png'))
  await shoot(browser, iconHtml(32), 32, 32, pub('icons', 'favicon-32.png'))

  const splashHtml = (w, h) => {
    const mark = Math.round(Math.min(w, h) * 0.34)
    return `<style>${FONT} body { margin:0; width:${w}px; height:${h}px; background:${C.bg}; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:${Math.round(mark * 0.12)}px; }
      .w { font-family:'Hanken Grotesk'; font-weight:500; font-size:${Math.round(mark * 0.12)}px; letter-spacing:0.24em; margin-right:-0.24em; color:${C.fg}; }</style>
      <body><img src="${MARK}" width="${mark}" height="${mark}" style="margin-top:-${Math.round(mark * 0.2)}px"><div class="w">ATLAS</div></body>`
  }
  fs.mkdirSync(pub('splash'), { recursive: true })
  const links = []
  for (const [w, h, r] of IPHONES) {
    const name = `splash-${w * r}x${h * r}.png`
    await shoot(browser, splashHtml(w, h), w, h, pub('splash', name), r)
    links.push(
      `<link rel="apple-touch-startup-image" href="/splash/${name}" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)" />`,
    )
  }

  const shareHtml = `<style>${FONT}
    body { margin:0; width:1200px; height:630px; background:${C.bg}; display:grid; grid-template-columns: 1fr 560px; font-family:'Hanken Grotesk'; color:${C.fg}; }
    .text { padding:64px 56px 64px 72px; display:flex; flex-direction:column; border-right:1px solid ${C.line}; }
    .mark { display:flex; align-items:center; gap:20px; font-size:26px; font-weight:500; letter-spacing:0.24em; padding-bottom:28px; border-bottom:1px solid ${C.line}; }
    .line { margin-top:auto; font-size:52px; line-height:1.1; font-weight:300; letter-spacing:-0.02em; }
    .sub { margin-top:20px; font-size:24px; line-height:1.4; color:${C.fg2}; }
    .body img { display:block; width:560px; height:630px; }
  </style>
  <body>
    <div class="text">
      <div class="mark"><img src="${MARK}" width="52" height="52">ATLAS</div>
      <div class="line">Learn anatomy in 3D by typing the names of structures.</div>
      <div class="sub">For nursing and medical students.</div>
    </div>
    <div class="body"><img src="${cloud}"></div>
  </body>`
  await shoot(browser, shareHtml, 1200, 630, pub('share.jpg'))

  await browser.close()
  server.close()
  console.log('\nLaunch screen links (index.html):\n' + links.join('\n'))
})()
