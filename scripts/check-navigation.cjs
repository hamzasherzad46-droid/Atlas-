#!/usr/bin/env node
/**
 * Proves the click paths in NAVIGATION.md on a phone-sized screen (390 × 844):
 *   - every screen type opens from Today in the listed number of taps (typing in search not counted);
 *   - the way back (in-app Back or Close, and the browser's back) returns to the screen before;
 *   - every control on each screen has a name for screen readers and a touch target of at least
 *     44 × 44 px (measured by hit-testing, so enlarged tap areas count).
 *
 * Needs a running app and Playwright (not a project dependency):
 *   npm run dev              # in one terminal
 *   node scripts/check-navigation.cjs [http://localhost:5173/]
 * Exits 1 if any check fails.
 */
const { chromium } = require('playwright')

const URL = process.argv[2] || 'http://localhost:5173/'
/** ONLY=<regex> runs just the paths whose screen name matches (for debugging). */
const ONLY = process.env.ONLY
const STATE = { theme: 'dark', track: 'nursing', lang: 'en', name: '', sound: false, dailyGoal: 20, answerTimer: 0, onboarded: true, lastSession: null }
/** A seeded mistake so "Fix mistakes" is available (ids from content/muscles.json). */
const PROGRESS_WITH_MISTAKE = {
  state: {
    records: { deltoid: { attempts: 1, correct: 0, errors: 3, lastSeen: 0, lastOutcome: 'failed', box: 0, dueAt: 0 } },
    cards: {},
    days: {},
    assessments: [],
    xp: 0,
    claimed: {},
  },
  version: 2,
}

/** Today's own markers. */
const onToday = (p) => p.getByText('Your course', { exact: true }).isVisible()

/** Each path: the taps from Today ([role, name, label shown in the table]), what proves we arrived, and how to get back. */
const PATHS = [
  { screen: 'Search', taps: [['button', 'Search']], expect: ['label', 'Search Atlas'], back: 'Back' },
  { screen: 'Change course', taps: [['button', /^Change course$/]], expect: ['heading', 'Change course'], back: 'Back' },
  { screen: 'Continue / start (spelling quiz)', taps: [['button', /^Start spelling quiz/]], expect: ['button', 'End session'], back: 'End session' },
  { screen: 'Flashcards due', taps: [['button', /^Flashcards due/]], expect: ['button', 'End flashcards'], back: 'End flashcards' },
  { screen: 'Fix mistakes', seedMistake: true, taps: [['button', /^Fix mistakes/]], expect: ['button', 'End session'], back: 'End session' },
  { screen: 'Explore in 3D', taps: [['button', /^Explore in 3D/]], expect: ['text', 'Drag to turn'], back: 'Back' },
  { screen: 'Flashcards', taps: [['button', /^Flashcards Injection/, 'Flashcards']], expect: ['button', 'End flashcards'], back: 'End flashcards' },
  { screen: 'The body in 3D', taps: [['button', /^The body in 3D/]], expect: ['heading', 'The body in 3D'], back: 'Back' },
  { screen: 'Plate (course plate)', taps: [['button', /^The aorta and the venae cavae/]], expect: ['text', 'Test yourself'], back: 'Back' },
  { screen: 'Spelling quiz', taps: [['button', /^Spelling quiz/]], expect: ['button', 'End session'], back: 'End session' },
  { screen: 'Multiple choice', taps: [['button', /^Multiple choice/]], expect: ['button', 'End session'], back: 'End session' },
  { screen: 'Identify on the model', taps: [['button', /^Identify on the model/]], expect: ['button', 'End session'], back: 'End session' },
  { screen: 'Timed exam', taps: [['button', /^Timed exam/]], expect: ['button', 'End session'], back: 'End session' },
  { screen: 'Mock exam (setup)', taps: [['button', /^Mock exam/]], expect: ['text', 'Questions from'], back: 'Back' },
  { screen: 'Mock exam (questions)', taps: [['button', /^Mock exam/], ['button', /^Start the mock/, 'Start the mock exam']], expect: ['button', 'Leave the mock exam'], back: 'Leave the mock exam', confirm: true, backTo: 'Mock exam (setup)' },
  { screen: 'Course module page', taps: [['button', /^Pulse points/]], expect: ['text', 'These settings apply to the three tests below.'], back: 'Back' },
  { screen: 'Topic (course topic)', taps: [['button', /^Vascular Access Anatomy/]], expect: ['text', 'Key points'], back: 'Back' },
  { screen: 'All content', taps: [['button', /^All content/]], expect: ['heading', 'All content'], back: null },
  { screen: 'Any module page', taps: [['tab', 'All content'], ['button', /^Kidneys and urinary tract/]], expect: ['text', 'These settings apply to the three tests below.'], back: 'Back', backTo: 'All content' },
  { screen: 'Any plate', taps: [['tab', 'All content'], ['button', /^A molar tooth in section/]], expect: ['text', 'Test yourself'], back: 'Back', backTo: 'All content' },
  { screen: 'The other body’s reproductive module', taps: [['button', /^Reproductive organs/], ['button', 'Female']], expect: ['heading', 'Female reproductive organs'], back: 'Back' },
  { screen: 'Progress', taps: [['tab', 'Progress']], expect: ['heading', 'Progress'], back: null },
  { screen: 'Settings', taps: [['tab', 'Settings']], expect: ['heading', 'Settings'], back: null },
  { screen: 'About and credits', taps: [['tab', 'Settings'], ['button', /^About and credits/]], expect: ['text', '3D model credits'], back: 'Back', backTo: 'Settings' },
]

const SEARCH_PATHS = [
  { query: 'femur', result: /^Femur/, expect: ['text', 'Passes body weight from the hip'], screen: 'Explore, on the femur' },
  { query: 'esophagus', result: /^Oesophagus/, expect: ['heading', 'Oesophagus'], screen: 'Explore, on the oesophagus' },
  { query: 'catheterization', result: /^Urinary tract and catheterisation/, expect: ['text', 'These settings apply to the three tests below.'], screen: 'Module page' },
  { query: 'cranial nerves', result: /^Cranial Nerves/, expect: ['text', 'Key points'], screen: 'Topic page' },
  { query: 'axilla', result: /^The axilla/, expect: ['text', 'Test yourself'], screen: 'Plate page' },
  { query: 'lymphatics', result: /^Lymphatics Mock exam/, expect: ['text', 'This topic'], screen: 'Mock exam on one topic' },
]

function locate(p, [kind, name]) {
  if (kind === 'tab') return p.locator('nav').getByRole('button', { name, exact: true })
  if (kind === 'text') return p.getByText(name, { exact: false }).first()
  if (kind === 'label') return p.getByLabel(name, { exact: true })
  return p.getByRole(kind, { name, exact: typeof name === 'string' }).first()
}

async function fresh(p, opts = {}) {
  await p.goto(URL)
  await p.evaluate(
    async ([state, progress]) => {
      localStorage.clear()
      // A Firebase session from an earlier path (builds with accounts) lives in IndexedDB.
      await new Promise((done) => {
        const req = indexedDB.deleteDatabase('firebaseLocalStorageDb')
        req.onsuccess = req.onerror = req.onblocked = () => done()
      })
      localStorage.setItem('atlas:settings:v1', JSON.stringify({ state, version: 3 }))
      if (progress) localStorage.setItem('atlas:progress:v1', JSON.stringify(progress))
    },
    [STATE, opts.seedMistake ? PROGRESS_WITH_MISTAKE : null],
  )
  await p.goto(URL)
  await p.getByText('Your course', { exact: true }).waitFor()
}

/**
 * Controls that are too small to tap or have no name, on the whole screen: it scrolls through every
 * scrolling area and hit-tests each control, so enlarged tap areas count and covered ones don't.
 */
async function audit(p) {
  return p.evaluate(() => {
    const out = []
    const seen = new Set()
    const scrollers = [document.scrollingElement, ...document.querySelectorAll('*')].filter((x) => {
      if (!x || x === document.body) return false
      if (x !== document.scrollingElement && !/(auto|scroll)/.test(getComputedStyle(x).overflowY)) return false
      return x.scrollHeight > x.clientHeight + 4 && x.getClientRects().length
    })
    const positions = scrollers.flatMap((sc) => {
      const steps = []
      for (let y = 0; y <= sc.scrollHeight - sc.clientHeight + 1; y += Math.max(200, sc.clientHeight * 0.7)) steps.push([sc, y])
      steps.push([sc, sc.scrollHeight])
      return steps
    })
    const saved = scrollers.map((sc) => sc.scrollTop)
    for (const [sc, y] of positions.length ? positions : [[null, 0]]) {
      if (sc) sc.scrollTop = y
      check()
    }
    scrollers.forEach((sc, i) => (sc.scrollTop = saved[i]))
    return out

    function check() {
    const els = [...document.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="switch"], [role="radio"]')]
    for (const el of els) {
      const r = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      if (!r.width || !r.height || style.visibility === 'hidden' || el.closest('[hidden]')) continue
      if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue
      // Development-only tool, not in the built app.
      if (el.classList.contains('dev-copy')) continue
      // Covered by a full-screen view or sheet: not on screen for the student.
      const top = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1))
      if (top && !(el === top || el.contains(top) || top.contains(el))) continue
      const label =
        el.getAttribute('aria-label') ||
        (el.getAttribute('aria-labelledby') && document.getElementById(el.getAttribute('aria-labelledby'))?.textContent) ||
        (el.id && document.querySelector(`label[for="${el.id}"]`)?.textContent) ||
        el.textContent ||
        el.getAttribute('title') ||
        ''
      const name = label.trim().replace(/\s+/g, ' ')
      const id = `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} “${name.slice(0, 30)}”`
      if (!name && !seen.has('name ' + id)) {
        seen.add('name ' + id)
        out.push(`no accessible name: ${id}`)
      }
      // Documented exceptions (NAVIGATION.md): the typing keyboard (ten keys across a 390 px screen) and
      // the numbered marks on plates and models, which sit 24 px apart and each have a full-size row in
      // the key below that does the same thing.
      if (el.classList.contains('kb-key') || el.classList.contains('plate-tag') || el.classList.contains('plate-mark')) continue
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const hits = (x, y) => {
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return true // off screen: can't test, don't fail
        const h = document.elementFromPoint(x, y)
        return !!h && (el === h || el.contains(h))
      }
      const w = r.width >= 44 || (hits(cx - 21.5, cy) && hits(cx + 21.5, cy))
      const h = r.height >= 44 || (hits(cx, cy - 21.5) && hits(cx, cy + 21.5))
      if ((!w || !h) && !seen.has(id)) {
        seen.add(id)
        out.push(`target ${Math.round(r.width)}×${Math.round(r.height)}: ${id}`)
      }
    }
    }
  })
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('dialog', (d) => void d.accept())
  let failed = 0
  const problems = new Map()
  const note = (screen, list) => list.length && problems.set(screen, [...new Set([...(problems.get(screen) ?? []), ...list])])

  console.log('| Screen | Taps from Today | Path | Arrives | Back returns |')
  console.log('|---|---|---|---|---|')
  note('Today', await (async () => (await fresh(p), audit(p)))())
  for (const path of PATHS.filter((x) => !ONLY || new RegExp(ONLY).test(x.screen))) {
    await fresh(p, path)
    let arrived = false
    let backOk = path.back === null ? 'n/a (tab)' : false
    try {
      for (const tap of path.taps) {
        const el = locate(p, tap)
        await el.scrollIntoViewIfNeeded()
        await el.click()
        await p.waitForTimeout(350)
      }
      await locate(p, path.expect).waitFor({ timeout: 8000 })
      arrived = true
      await p.waitForTimeout(400)
      note(path.screen, await audit(p))
      if (path.back) {
        await p.getByRole('button', { name: path.back, exact: true }).first().click()
        await p.waitForTimeout(500)
        if (path.backTo === 'Mock exam (setup)') backOk = await p.getByText('Questions from').first().isVisible()
        else if (path.backTo === 'All content') backOk = await p.getByRole('heading', { name: 'All content' }).isVisible()
        else if (path.backTo === 'Settings') backOk = await p.getByRole('heading', { name: 'Settings' }).isVisible()
        else backOk = await onToday(p)
      }
    } catch (e) {
      errors.push(`${path.screen}: ${e.message.split('\n')[0]}`)
    }
    const ok = arrived && backOk !== false && path.taps.length <= 2
    if (!ok) failed++
    const route = path.taps.map(([kind, n, shown]) => `${kind === 'tab' ? 'tab ' : ''}“${shown ?? (n instanceof RegExp ? n.source.replace(/^\^|\$$/g, '') : n)}”`).join(' → ')
    console.log(`| ${path.screen} | ${path.taps.length} | ${route} | ${arrived ? 'yes' : 'NO'} | ${backOk === true ? 'yes' : backOk || 'NO'} |`)
  }

  console.log('\n| Search for | Opens | Taps (plus typing) | Arrives | Back returns to results |')
  console.log('|---|---|---|---|---|')
  for (const s of SEARCH_PATHS.filter((x) => !ONLY || new RegExp(ONLY).test(x.screen))) {
    await fresh(p)
    let arrived = false
    let backOk = false
    try {
      await p.getByRole('button', { name: 'Search', exact: true }).click()
      await p.keyboard.type(s.query)
      await p.waitForTimeout(600)
      note('Search results', await audit(p))
      await p.getByRole('button', { name: s.result }).first().click()
      await locate(p, s.expect).waitFor({ timeout: 10000 })
      arrived = true
      await p.waitForTimeout(400)
      note(s.screen, await audit(p))
      await p.goBack() // the browser's back, as the phone's back gesture does
      await p.waitForTimeout(500)
      backOk = (await p.locator('#search-q').inputValue()) === s.query
    } catch (e) {
      errors.push(`search ${s.query}: ${e.message.split('\n')[0]}`)
    }
    if (!arrived || !backOk) failed++
    console.log(`| “${s.query}” | ${s.screen} | 2 | ${arrived ? 'yes' : 'NO'} | ${backOk ? 'yes (browser back)' : 'NO'} |`)
  }

  // First run: the onboarding screen.
  if (!ONLY) {
    await p.goto(URL)
    await p.evaluate(() => localStorage.clear())
    await p.goto(URL)
    await p.getByRole('heading', { name: 'What are you studying?' }).waitFor()
    note('Onboarding', await audit(p))
  }

  // A reload reopens the screen that was open, with its way back; the browser keeps the old entries,
  // so Back (the app's and the browser's) must still work on the first press.
  if (!ONLY) {
    let reopened = false
    let ok = false
    let interrupted = false
    try {
      await fresh(p)
      await p.getByRole('button', { name: /^Pulse points/ }).first().click()
      await p.getByText('These settings apply to the three tests below.').waitFor()
      await p.reload()
      await p.getByText('These settings apply to the three tests below.').waitFor()
      reopened = true
      await p.getByRole('button', { name: 'Back', exact: true }).first().click()
      await p.getByText('Your course', { exact: true }).waitFor()
      await p.getByRole('button', { name: /^The aorta and the venae cavae/ }).first().click()
      await p.getByText('Test yourself').first().waitFor()
      await p.goBack()
      await p.waitForTimeout(500)
      ok = await onToday(p)
      // A quiz interrupted by a reload reopens the screen it was started from, with Resume.
      await p.getByRole('button', { name: /^Start spelling quiz/ }).first().click()
      await p.getByRole('button', { name: 'End session' }).waitFor()
      await p.reload()
      await p.getByText('Your course', { exact: true }).waitFor()
      interrupted = await p.getByRole('button', { name: /^Resume/ }).first().isVisible()
    } catch (e) {
      errors.push(`after reload: ${e.message.split('\n')[0]}`)
    }
    if (!reopened || !ok || !interrupted) failed++
    console.log(`\nA reload reopens the open screen: ${reopened ? 'yes' : 'NO'}`)
    console.log(`Back on the first press after a reload: ${ok ? 'yes' : 'NO'}`)
    console.log(`An interrupted quiz reopens where it was started, with Resume: ${interrupted ? 'yes' : 'NO'}`)
  }

  // Builds with accounts (Firebase configured, e.g. the emulators): the account screens.
  await fresh(p)
  await p.locator('nav').getByRole('button', { name: 'Settings', exact: true }).click()
  const accounts = await p.getByRole('button', { name: 'Continue with Google' }).isVisible()
  if (!accounts) console.log('\nAccounts: not in this build (no Firebase config), so no account screens to check.')
  else if (!ONLY) {
    console.log('\n| Account screen | Taps from Today | Path | Arrives | Back returns |')
    console.log('|---|---|---|---|---|')
    note('Settings (signed out)', await audit(p))
    let arrived = false
    let backOk = false
    try {
      await p.getByRole('button', { name: /^Sign in with email/ }).click()
      await p.getByRole('heading', { name: 'Sign in' }).waitFor()
      arrived = true
      note('Sign in', await audit(p))
      await p.getByRole('button', { name: 'Back', exact: true }).first().click()
      backOk = await p.getByRole('heading', { name: 'Settings' }).isVisible()
    } catch (e) {
      errors.push(`sign in: ${e.message.split('\n')[0]}`)
    }
    if (!arrived || !backOk) failed++
    console.log(`| Sign in with email | 2 | tab “Settings” → “Sign in with email” | ${arrived ? 'yes' : 'NO'} | ${backOk ? 'yes' : 'NO'} |`)

    arrived = false
    backOk = false
    try {
      await p.getByRole('button', { name: /^Sign in with email/ }).click()
      await p.getByRole('button', { name: 'New here? Create an account' }).click()
      await p.getByLabel('Email', { exact: true }).fill(`nav-${Date.now()}@example.com`)
      await p.getByLabel('Password', { exact: true }).fill('anatomy-123')
      await p.getByRole('button', { name: 'Create account', exact: true }).click()
      await p.getByText('Signed in as').waitFor({ timeout: 15000 })
      note('Settings (signed in)', await audit(p))
      await p.getByRole('button', { name: /^Delete account/ }).click()
      await p.getByRole('heading', { name: 'Delete your account' }).waitFor()
      arrived = true
      note('Delete account', await audit(p))
      await p.getByRole('button', { name: 'Back', exact: true }).first().click()
      backOk = await p.getByText('Signed in as').isVisible()
      await p.getByRole('button', { name: /^Sign out/ }).click()
      await p.getByRole('button', { name: 'Continue with Google' }).waitFor({ timeout: 15000 })
    } catch (e) {
      errors.push(`delete account: ${e.message.split('\n')[0]}`)
    }
    if (!arrived || !backOk) failed++
    console.log(`| Delete account (signed in) | 2 | tab “Settings” → “Delete account” | ${arrived ? 'yes' : 'NO'} | ${backOk ? 'yes' : 'NO'} |`)
  }

  console.log('\nControls without a name or smaller than 44 × 44 px:')
  if (!problems.size) console.log('none')
  for (const [screen, list] of problems) {
    failed += list.length
    console.log(`- ${screen}:`)
    for (const x of list) console.log(`  - ${x}`)
  }
  if (errors.length) {
    console.log('\nErrors:')
    for (const e of errors) console.log(`- ${e}`)
    failed += errors.length
  }
  console.log(`\n${failed ? `FAILED (${failed})` : 'All checks passed.'}`)
  await browser.close()
  process.exit(failed ? 1 : 0)
})()
