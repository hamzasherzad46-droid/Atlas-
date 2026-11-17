import { describe, expect, it } from 'vitest'
import { en } from '../i18n/en'
import { useSettings } from '../state/settings'
import { errorKey } from './account'
import { firebaseSettings } from './config'

describe('Firebase config', () => {
  it('without the variables there are no accounts', () => {
    expect(firebaseSettings({})).toBeNull()
    expect(firebaseSettings({ VITE_FIREBASE_API_KEY: 'k', VITE_FIREBASE_PROJECT_ID: 'p' })).toBeNull()
  })

  it('reads a complete config', () => {
    const s = firebaseSettings({ VITE_FIREBASE_API_KEY: 'k', VITE_FIREBASE_AUTH_DOMAIN: 'p.firebaseapp.com', VITE_FIREBASE_PROJECT_ID: 'p', VITE_FIREBASE_APP_ID: 'a' })
    expect(s).toEqual({ apiKey: 'k', authDomain: 'p.firebaseapp.com', projectId: 'p', appId: 'a', emulator: null })
  })

  it('emulator mode needs no real project', () => {
    const s = firebaseSettings({ VITE_FIREBASE_EMULATOR: 'true' })
    expect(s?.projectId).toBe('demo-atlas')
    expect(s?.emulator?.auth).toBe('http://127.0.0.1:9099')
  })
})

describe('sign-in errors', () => {
  it('turn Firebase codes into plain messages that exist', () => {
    const codes = ['auth/invalid-email', 'auth/invalid-credential', 'auth/email-already-in-use', 'auth/weak-password', 'auth/too-many-requests', 'auth/network-request-failed', 'auth/popup-blocked', 'auth/requires-recent-login', 'auth/unauthorized-domain', 'something-new']
    for (const code of codes) {
      const key = errorKey({ code })
      expect(key, code).not.toBeNull()
      expect(en[key!], code).toBeTruthy()
    }
  })

  it('say nothing when the student closes the Google window', () => {
    expect(errorKey({ code: 'auth/popup-closed-by-user' })).toBeNull()
  })
})

describe('synced settings', () => {
  it('record when course, daily goal or name change, and not for other settings', () => {
    useSettings.setState({ profileChangedAt: 0, track: 'nursing' })
    useSettings.getState().set({ sound: false })
    expect(useSettings.getState().profileChangedAt).toBe(0)
    useSettings.getState().set({ track: 'nursing' })
    expect(useSettings.getState().profileChangedAt).toBe(0)
    useSettings.getState().set({ track: 'medicine' })
    expect(useSettings.getState().profileChangedAt).toBeGreaterThan(0)
  })
})
