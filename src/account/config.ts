/**
 * Firebase web config, from build-time variables (VITE_FIREBASE_*). These values are public by design
 * (every Firebase web app ships them); they live in the environment so that a build without them
 * simply has no accounts: the Account section stays hidden and progress stays on the device.
 *
 * VITE_FIREBASE_EMULATOR=true talks to the local Firebase emulators instead (tests and development).
 */
export interface FirebaseSettings {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
  /** Local emulator hosts, when testing against `firebase emulators:start`. */
  emulator: { auth: string; firestore: { host: string; port: number } } | null
}

type Env = Record<string, string | boolean | undefined>

export function firebaseSettings(env: Env = import.meta.env as Env): FirebaseSettings | null {
  const str = (k: string) => (typeof env[k] === 'string' ? (env[k] as string).trim() : '')
  if (str('VITE_FIREBASE_EMULATOR') === 'true') {
    const projectId = str('VITE_FIREBASE_PROJECT_ID') || 'demo-atlas'
    return {
      apiKey: str('VITE_FIREBASE_API_KEY') || 'demo-key',
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      appId: str('VITE_FIREBASE_APP_ID') || 'demo-app',
      emulator: { auth: 'http://127.0.0.1:9099', firestore: { host: '127.0.0.1', port: 8080 } },
    }
  }
  const apiKey = str('VITE_FIREBASE_API_KEY')
  const authDomain = str('VITE_FIREBASE_AUTH_DOMAIN')
  const projectId = str('VITE_FIREBASE_PROJECT_ID')
  const appId = str('VITE_FIREBASE_APP_ID')
  if (!apiKey || !authDomain || !projectId || !appId) return null
  return { apiKey, authDomain, projectId, appId, emulator: null }
}
