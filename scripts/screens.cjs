#!/usr/bin/env node
/**
 * Screenshots of the main screens at 390 × 844 (device scale 2), in dark and light, for design review.
 *   npm run dev; node scripts/screens.cjs <out-dir> [http://localhost:5173/]
 */
const { chromium } = require('playwright')
const fs = require('fs')

const OUT = process.argv[2] || 'screens'
const URL = process.argv[3] || 'http://localhost:5173/'

/** Wait for the 3D model: its loading line goes once it is set up; the first frame follows. */
async function modelShown(p) {
  await p.waitForTimeout(500)
  await p.locator('.model-loading').first().waitFor({ state: 'detached', timeout: 30000 }).catch(() => {})
  await p.waitForTimeout(3500)
}

const settings = (theme, onboarded) => ({
  state: { theme, track: 'nursing', lang: 'en', name: '', sound: false, dailyGoal: 20, answerTimer: 0, onboarded, lastSession: null, profileChangedAt: 0 },
  version: 3,
})

async function typeQuiz(p) {
  await p.getByRole('button', { name: 'End session' }).waitFor()
  while (!(await p.getByText(/Session complete|Quiz complete|finished/i).first().isVisible().catch(() => false))) {
    const word = p.locator('.answer').first()
    if (!(await word.isVisible().catch(() => false))) break
    const answer = await word.evaluate((el) => [...el.children].map((c) => (c.classList.contains('answer-space') ? ' ' : c.classList.contains('caret-end') ? '' : c.textContent)).join(''))
    const before = await p.locator('.screen-bar-title').first().textContent()
    await p.keyboard.type(answer, { delay: 5 })
    await p.waitForFunction((prev) => !document.querySelector('.answer') || document.querySelector('.screen-bar-title')?.textContent !== prev, before, { timeout: 15000 }).catch(() => {})
  }
}

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const theme of ['dark', 'light']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: theme })
    const p = await ctx.newPage()
    const shot = async (name) => {
      await p.waitForTimeout(700)
      await p.screenshot({ path: `${OUT}/${name}-${theme}.png` })
    }
    const fresh = async (onboarded) => {
      await p.goto(URL)
      await p.evaluate((s) => {
        localStorage.clear()
        localStorage.setItem('atlas:settings:v1', JSON.stringify(s))
      }, settings(theme, onboarded))
      await p.goto(URL)
    }
    const tab = (name) => p.locator('nav').getByRole('button', { name, exact: true }).click()

    await fresh(false)
    await shot('01-onboarding')

    await fresh(true)
    await p.getByText('Your course', { exact: true }).waitFor()
    await shot('02-today')

    await tab('All content')
    await shot('03-atlas')

    await p.getByRole('button', { name: /^Bones of the body/ }).first().click()
    await shot('04-module')

    await fresh(true)
    await p.getByRole('button', { name: /^Start spelling quiz/ }).click()
    await modelShown(p)
    await shot('05-quiz')
    await typeQuiz(p)
    await p.waitForTimeout(1200)
    await shot('06-results')

    await fresh(true)
    await p.getByRole('button', { name: /^Flashcards Injection/ }).first().click()
    await modelShown(p)
    await shot('07-flashcards')

    await fresh(true)
    await p.getByRole('button', { name: /^Mock exam/ }).first().click()
    await p.getByRole('button', { name: /^Start the mock/ }).click()
    await shot('08-mock')

    await fresh(true)
    await tab('Settings')
    await shot('09-settings')
    await ctx.close()
  }
  await browser.close()
  console.log('saved to', OUT)
})()
