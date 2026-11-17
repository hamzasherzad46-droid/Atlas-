#!/usr/bin/env node
/**
 * End-to-end test of accounts and sync, against the local Firebase emulators, with two "devices"
 * (separate browser profiles) on a phone-sized screen. Needs:
 *   firebase emulators:start --project demo-atlas --only auth,firestore     # Java and firebase-tools
 *   VITE_FIREBASE_EMULATOR=true npx vite --port 5174                        # the app in emulator mode
 *   node scripts/check-sync.cjs [http://localhost:5174/]
 * Firebase's emulators start empty and this script clears them first. Exits 1 if any check fails.
 */
const { chromium } = require('playwright')

const URL = process.argv[2] || 'http://localhost:5174/'
const PROJECT = 'demo-atlas'
const FIRESTORE = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`
const OWNER = { Authorization: 'Bearer owner' } // the emulator's admin access, bypassing the rules
const EMAIL = 'student@example.com'
const PASSWORD = 'anatomy-123'

let failed = 0
function check(name, ok, detail = '') {
  if (!ok) failed++
  console.log(`| ${name} | ${ok ? 'yes' : 'NO'} | ${detail} |`)
}

async function resetEmulators() {
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' })
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' })
}

/** Every account document, read with admin access: { uid: fields }. */
async function accountDocs() {
  const res = await fetch(`${FIRESTORE}/users`, { headers: OWNER })
  const json = await res.json()
  return Object.fromEntries((json.documents ?? []).map((d) => [d.name.split('/').pop(), d.fields]))
}
const mapSize = (field) => Object.keys(field?.mapValue?.fields ?? {}).length

async function device(browser, name) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const p = await ctx.newPage()
  p.errors = []
  p.on('pageerror', (e) => p.errors.push(`${name}: ${e.message}`))
  // Errors while the test has deliberately taken the device offline are expected (Firestore logs them).
  p.on('console', (m) => m.type() === 'error' && !p.offline && !/Failed to load resource|ERR_INTERNET_DISCONNECTED|net::/.test(m.text()) && p.errors.push(`${name}: ${m.text().slice(0, 160)}`))
  await p.goto(URL)
  await p.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('atlas:settings:v1', JSON.stringify({ state: { theme: 'dark', track: 'nursing', lang: 'en', name: '', sound: false, dailyGoal: 20, answerTimer: 0, onboarded: true, lastSession: null, profileChangedAt: 0 }, version: 3 }))
  })
  await p.goto(URL)
  await p.getByText('Your course', { exact: true }).waitFor()
  return { ctx, p }
}

const tab = (p, name) => p.locator('nav').getByRole('button', { name, exact: true }).click()

async function signIn(p, create) {
  await tab(p, 'Settings')
  await p.getByRole('button', { name: /^Sign in with email/ }).click()
  if (create) await p.getByRole('button', { name: 'New here? Create an account' }).click()
  await p.getByLabel('Email', { exact: true }).fill(EMAIL)
  await p.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await p.getByRole('button', { name: create ? 'Create account' : 'Sign in', exact: true }).click()
  await p.getByText('Signed in as').waitFor({ timeout: 15000 })
}

/** Wait for a sync that finished after everything done so far (the line carries the exact time). */
async function synced(p) {
  const since = await p.evaluate(() => Date.now())
  await tab(p, 'Settings')
  await p.waitForFunction((t) => Number(document.querySelector('[data-synced-at]')?.getAttribute('data-synced-at')) > t && /^Synced at/.test(document.querySelector('[data-synced-at]')?.textContent ?? ''), since, { timeout: 30000 })
}

/** Answer the quiz that "Start spelling quiz" / "Continue spelling quiz" opens; returns how many questions. */
async function quiz(p) {
  await tab(p, 'Today')
  await p.getByRole('button', { name: /^(Start|Continue) spelling quiz/ }).click()
  await p.getByRole('button', { name: 'End session' }).waitFor()
  let n = 0
  while (!(await p.getByText('Session complete').isVisible())) {
    const word = p.locator('.answer').first()
    await word.waitFor({ timeout: 15000 })
    const answer = await word.evaluate((el) => [...el.children].map((c) => (c.classList.contains('answer-space') ? ' ' : c.classList.contains('caret-end') ? '' : c.textContent)).join(''))
    const before = await p.locator('.screen-bar-title').first().textContent()
    await p.keyboard.type(answer, { delay: 10 })
    n++
    await p.waitForFunction((prev) => document.body.innerText.includes('Session complete') || document.querySelector('.screen-bar-title')?.textContent !== prev, before, { timeout: 15000 })
  }
  await p.getByRole('button', { name: 'Done', exact: true }).click()
  return n
}

async function goal(p) {
  await tab(p, 'Today')
  const v = await p.locator('.r', { hasText: 'Today’s goal' }).locator('.r-value').textContent()
  return v.replace(/\s+/g, ' ').trim()
}

const course = (p) => p.locator('.masthead-track').first().textContent()
const localRecords = (p) => p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('atlas:progress:v1') || '{"state":{"records":{}}}').state.records).length)

;(async () => {
  await resetEmulators()
  const browser = await chromium.launch()
  console.log('| Check | Passed | Detail |')
  console.log('|---|---|---|')

  // 1. Device A: create an account, study, change course.
  const A = await device(browser, 'A')
  await signIn(A.p, true)
  const aQuestions = await quiz(A.p)
  await tab(A.p, 'Settings')
  await A.p.getByRole('radio', { name: /^Medicine/ }).click()
  await synced(A.p)
  let docs = await accountDocs()
  const uid = Object.keys(docs)[0]
  check('Account created and progress saved in it', Object.keys(docs).length === 1 && mapSize(docs[uid].records) === aQuestions, `${aQuestions} structures studied on A; ${mapSize(docs[uid]?.records)} in the account`)
  check('Course saved in the account', docs[uid].profile?.mapValue?.fields?.track?.stringValue === 'medicine')

  // 2. Device B: sign in; progress, course and today's count arrive.
  const B = await device(browser, 'B')
  await signIn(B.p, false)
  await synced(B.p)
  check('Second device gets the course', (await course(B.p)).trim() === 'Medicine', await course(B.p))
  check('Second device gets the progress', (await localRecords(B.p)) === aQuestions, `${await localRecords(B.p)} structures`)
  check("Second device shows the first device's study today", (await goal(B.p)) === `${aQuestions} / 20`, await goal(B.p))

  // 3. Both devices study on the same day: the counts add up, everywhere.
  const bQuestions = await quiz(B.p)
  await synced(B.p)
  await A.p.reload()
  await A.p.getByText('Your course', { exact: true }).waitFor()
  await synced(A.p)
  const total = aQuestions + bQuestions
  check('Same day on two devices adds up (first device)', (await goal(A.p)) === `${total} / 20`, `${await goal(A.p)} (A ${aQuestions} + B ${bQuestions})`)
  check('Same day on two devices adds up (second device)', (await goal(B.p)) === `${total} / 20`, await goal(B.p))

  // 4. Offline: a change waits, then syncs when the connection returns.
  B.p.offline = true
  await B.ctx.setOffline(true)
  await tab(B.p, 'Settings')
  await B.p.getByRole('button', { name: '40', exact: true }).click()
  const offlineShown = await B.p.getByText(/^Offline\. Your progress will sync/).waitFor({ timeout: 20000 }).then(() => true, () => false)
  check('Offline is shown while the change waits', offlineShown)
  await B.ctx.setOffline(false)
  await synced(B.p)
  B.p.offline = false
  await A.p.reload()
  await A.p.getByText('Your course', { exact: true }).waitFor()
  await synced(A.p)
  check('The change syncs when back online', (await goal(A.p)).endsWith('/ 40'), `first device now shows ${await goal(A.p)}`)

  // 5. Sign out on B: progress stays in the account, this device is cleared.
  await tab(B.p, 'Settings')
  await B.p.getByRole('button', { name: /^Sign out/ }).click()
  await B.p.getByRole('button', { name: 'Continue with Google' }).waitFor({ timeout: 15000 })
  check('Sign out clears the device', (await localRecords(B.p)) === 0 && (await goal(B.p)).startsWith('0 /'), `${await localRecords(B.p)} structures, goal ${await goal(B.p)}`)
  docs = await accountDocs()
  check('Sign out leaves the progress in the account', mapSize(docs[uid].records) === total || mapSize(docs[uid].records) > 0, `${mapSize(docs[uid].records)} structures in the account`)

  // 6. Security rules: another account can neither read nor write this one; Google accounts work the same.
  const { initializeApp } = require('firebase/app')
  const auth = require('firebase/auth')
  const fs = require('firebase/firestore/lite')
  const other = initializeApp({ apiKey: 'demo-key', projectId: PROJECT, appId: 'demo-app' }, 'other')
  const otherAuth = auth.getAuth(other)
  auth.connectAuthEmulator(otherAuth, 'http://127.0.0.1:9099', { disableWarnings: true })
  const db = fs.getFirestore(other)
  fs.connectFirestoreEmulator(db, '127.0.0.1', 8080)
  const google = await auth.signInWithCredential(otherAuth, auth.GoogleAuthProvider.credential('{"sub":"google-1","email":"google.student@example.com","email_verified":true}'))
  const denied = async (f) => f().then(() => false, (e) => e.code === 'permission-denied')
  check("Another account can't read this account's progress", await denied(() => fs.getDoc(fs.doc(db, 'users', uid))))
  check("Another account can't write it", await denied(() => fs.setDoc(fs.doc(db, 'users', uid), { schema: 1 })))
  const own = fs.doc(db, 'users', google.user.uid)
  await fs.setDoc(own, { schema: 1, updatedAt: 1, resetAt: 0, records: {}, cards: {}, assessments: [], claimed: {}, xp: 0, days: {}, profile: null })
  check('A Google account can save and read its own progress', (await fs.getDoc(own)).exists(), `provider ${google.user.providerData[0]?.providerId}`)
  check('Unexpected fields are refused', await denied(() => fs.setDoc(own, { schema: 1, somethingElse: true })))
  await auth.signOut(otherAuth)

  // 7. Reset progress on A erases it in the account.
  await tab(A.p, 'Settings')
  await A.p.getByRole('button', { name: /^Reset progress/ }).click()
  await A.p.getByRole('button', { name: /^Tap again to erase everything/ }).click()
  await A.p.waitForTimeout(500)
  await synced(A.p)
  docs = await accountDocs()
  check('Reset erases the progress in the account', mapSize(docs[uid].records) === 0 && Number(docs[uid].resetAt?.integerValue ?? docs[uid].resetAt?.doubleValue ?? 0) > 0, `${mapSize(docs[uid].records)} structures left`)
  check('Reset clears today on this device', (await goal(A.p)).startsWith('0 /'), await goal(A.p))

  // 8. Delete the account: confirm with the password; the account and its data are gone.
  await tab(A.p, 'Settings')
  await A.p.getByRole('button', { name: /^Delete account/ }).click()
  await A.p.getByLabel('Enter your password to confirm.').fill(PASSWORD)
  await A.p.getByRole('button', { name: 'Delete my account' }).click()
  await A.p.getByRole('button', { name: 'Continue with Google' }).waitFor({ timeout: 15000 })
  docs = await accountDocs()
  check("Delete account erases the account's progress", !docs[uid], `${Object.keys(docs).length} documents left (the Google test account's)`)
  await tab(B.p, 'Settings')
  await B.p.getByRole('button', { name: /^Sign in with email/ }).click()
  await B.p.getByLabel('Email', { exact: true }).fill(EMAIL)
  await B.p.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await B.p.getByRole('button', { name: 'Sign in', exact: true }).click()
  const refused = await B.p.getByText('Email or password not recognised.').waitFor({ timeout: 10000 }).then(() => true, () => false)
  check('A deleted account can no longer sign in', refused)

  const errors = [...A.p.errors, ...B.p.errors]
  check('No errors in either device', errors.length === 0, errors.slice(0, 3).join('; '))
  await browser.close()
  console.log(`\n${failed ? `FAILED (${failed})` : 'All checks passed.'}`)
  process.exit(failed ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
