import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { en } from '../i18n/en'

const source = (f: string) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8')

describe('study-aid notice', () => {
  it('has the agreed wording', () => {
    expect(en['common.studyAid']).toBe('Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy.')
  })

  it('is shown on onboarding, Settings and Credits', () => {
    for (const f of ['../screens/OnboardingScreen.tsx', '../screens/YouScreen.tsx', '../screens/CreditsScreen.tsx']) expect(source(f), f).toContain('<StudyAidNotice />')
  })
})
