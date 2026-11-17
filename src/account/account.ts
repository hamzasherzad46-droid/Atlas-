import { create } from 'zustand'
import type { MessageKey } from '../i18n'
import { appStorage, STORAGE_KEYS } from '../lib/storage'
import { useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { firebaseSettings } from './config'
import type { AccountUser } from './firebase'

/**
 * Accounts (Firebase email and Google sign-in). Signing in is optional; with no Firebase config in the
 * build the status is 'unavailable' and nothing about accounts is shown. The Firebase SDK is loaded
 * only when needed (`loadFirebase`).
 */
export type AccountStatus = 'unavailable' | 'loading' | 'signedOut' | 'signedIn'
/** 'pending': a change is waiting to be sent (in a few seconds). */
export type SyncState = 'idle' | 'pending' | 'syncing' | 'offline' | 'error'

interface AccountState {
  status: AccountStatus
  user: AccountUser | null
  sync: SyncState
  lastSyncedAt: number | null
}

export const settings = firebaseSettings()

export const useAccount = create<AccountState>()(() => ({
  status: settings ? 'signedOut' : 'unavailable',
  user: null,
  sync: 'idle',
  lastSyncedAt: null,
}))

/** What this device remembers about syncing (kept in local storage, never synced). */
export interface DeviceRecord {
  signedIn: boolean
  /** Identifies this device's daily activity in the account; renewed at every sign-out. */
  deviceId: string
  /** The latest "Reset progress" this device has seen (0: none). */
  resetAt: number
  lastSyncedAt: number | null
  /** A reset made while offline, still to be sent. */
  pendingReset: boolean
}

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

export function deviceRecord(): DeviceRecord {
  const raw = appStorage.getItem(STORAGE_KEYS.account)
  const saved = typeof raw === 'string' ? (JSON.parse(raw) as Partial<DeviceRecord>) : {}
  const record: DeviceRecord = { signedIn: false, deviceId: '', resetAt: 0, lastSyncedAt: null, pendingReset: false, ...saved }
  if (!record.deviceId) {
    record.deviceId = newId()
    appStorage.setItem(STORAGE_KEYS.account, JSON.stringify(record))
  }
  return record
}

export function saveDevice(patch: Partial<DeviceRecord>) {
  appStorage.setItem(STORAGE_KEYS.account, JSON.stringify({ ...deviceRecord(), ...patch }))
}

type FirebaseModule = typeof import('./firebase')
let loading: Promise<FirebaseModule> | null = null

/** Load the Firebase chunk once and start following the signed-in user. */
export function loadFirebase(): Promise<FirebaseModule> {
  if (!settings) return Promise.reject(Object.assign(new Error('Accounts are not set up in this build'), { code: 'auth/configuration-not-found' }))
  loading ??= import('./firebase').then((m) => {
    m.start(settings)
    m.watchUser((user) => {
      useAccount.setState(user ? { status: 'signedIn', user } : { status: 'signedOut', user: null })
      saveDevice({ signedIn: !!user })
    })
    return m
  })
  return loading
}

/** At start-up: if this device was signed in, load Firebase to restore the session (and sync). */
export function initAccount() {
  if (!settings) return
  const device = deviceRecord()
  useAccount.setState({ lastSyncedAt: device.lastSyncedAt })
  if (device.signedIn) {
    useAccount.setState({ status: 'loading' })
    loadFirebase().catch(() => useAccount.setState({ status: 'signedOut' }))
  }
}

export async function signInWithEmail(email: string, password: string, createAccount: boolean) {
  const m = await loadFirebase()
  if (createAccount) await m.createAccount(email.trim(), password)
  else await m.signInEmail(email.trim(), password)
}

export async function signInWithGoogle() {
  const m = await loadFirebase()
  await m.signInGoogle()
}

export async function sendPasswordReset(email: string) {
  const m = await loadFirebase()
  await m.resetPassword(email.trim())
}

/** Forget everything on this device: progress, name and sync state. The account keeps its copy. */
export function clearDevice() {
  useProgress.getState().reset()
  useSettings.setState({ name: '', profileChangedAt: 0 })
  saveDevice({ signedIn: false, deviceId: newId(), resetAt: 0, lastSyncedAt: null, pendingReset: false })
  useAccount.setState({ lastSyncedAt: null, sync: 'idle' })
}

/** Sign out and clear this device (the progress stays in the account). */
export async function signOutAndClear() {
  const m = await loadFirebase()
  await m.signOutUser()
  useAccount.setState({ status: 'signedOut', user: null })
  clearDevice()
}

/** Confirm who it is (password, or the Google window), then erase the account and this device. */
export async function deleteAccountAndClear(password?: string) {
  const m = await loadFirebase()
  await m.confirmIdentity(password)
  await m.deleteAccount()
  useAccount.setState({ status: 'signedOut', user: null })
  clearDevice()
}

/** A Firebase error as a message a student can act on; null when there is nothing to say (they closed the window). */
export function errorKey(e: unknown): MessageKey | null {
  const code = (e as { code?: string } | null)?.code ?? ''
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null
    case 'auth/invalid-email':
      return 'account.err.email'
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'account.err.credentials'
    case 'auth/missing-password':
      return 'account.err.missingPassword'
    case 'auth/email-already-in-use':
      return 'account.err.inUse'
    case 'auth/weak-password':
      return 'account.err.weak'
    case 'auth/too-many-requests':
      return 'account.err.tooMany'
    case 'auth/network-request-failed':
    case 'unavailable':
      return 'account.err.offline'
    case 'auth/popup-blocked':
      return 'account.err.popup'
    case 'auth/requires-recent-login':
    case 'auth/user-mismatch':
      return 'account.err.recent'
    case 'auth/operation-not-allowed':
    case 'auth/unauthorized-domain':
    case 'auth/configuration-not-found':
    case 'auth/invalid-api-key':
      return 'account.err.setup'
    default:
      return 'account.err.unknown'
  }
}
