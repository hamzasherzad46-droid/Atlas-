/**
 * Everything that touches the Firebase SDK. This module is a separate chunk, loaded only when the
 * student opens Account or is already signed in, so the app's first load does not carry Firebase.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { connectFirestoreEmulator, deleteDoc, doc, getFirestore, runTransaction, type Firestore } from 'firebase/firestore/lite'
import type { FirebaseSettings } from './config'

export interface AccountUser {
  uid: string
  email: string
  /** How they sign in: 'password' (email) or 'google.com'. */
  provider: string
}

let app: FirebaseApp | null = null
let auth: Auth
let db: Firestore

export function start(settings: FirebaseSettings) {
  if (app) return
  app = initializeApp({ apiKey: settings.apiKey, authDomain: settings.authDomain, projectId: settings.projectId, appId: settings.appId })
  auth = getAuth(app)
  db = getFirestore(app)
  if (settings.emulator) {
    connectAuthEmulator(auth, settings.emulator.auth, { disableWarnings: true })
    connectFirestoreEmulator(db, settings.emulator.firestore.host, settings.emulator.firestore.port)
  }
}

const toUser = (u: User): AccountUser => ({ uid: u.uid, email: u.email ?? '', provider: u.providerData[0]?.providerId ?? 'password' })

export function watchUser(cb: (user: AccountUser | null) => void): () => void {
  return onAuthStateChanged(auth, (u) => cb(u ? toUser(u) : null))
}

export async function signInEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function createAccount(email: string, password: string) {
  await createUserWithEmailAndPassword(auth, email, password)
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function signInGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider())
}

export async function signOutUser() {
  await signOut(auth)
}

/**
 * Read the account's document, combine it with this device inside a transaction (so two devices
 * syncing at once can't overwrite each other) and write the result, unless `combine` returns null
 * (nothing changed). `combine` may run more than once.
 */
export async function syncDoc(uid: string, combine: (remote: unknown) => object | null): Promise<void> {
  const ref = doc(db, 'users', uid)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const next = combine(snap.exists() ? snap.data() : null)
    if (next) tx.set(ref, next)
  })
}

/** Confirm who it is just before deleting: password for email accounts, the Google window otherwise. */
export async function confirmIdentity(password?: string) {
  const user = auth.currentUser
  if (!user) throw Object.assign(new Error('Not signed in'), { code: 'auth/no-current-user' })
  if (password !== undefined) await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? '', password))
  else await reauthenticateWithPopup(user, new GoogleAuthProvider())
}

/** Erase the account's saved progress, then the account itself. */
export async function deleteAccount() {
  const user = auth.currentUser
  if (!user) throw Object.assign(new Error('Not signed in'), { code: 'auth/no-current-user' })
  await deleteDoc(doc(db, 'users', user.uid))
  await deleteUser(user)
}
