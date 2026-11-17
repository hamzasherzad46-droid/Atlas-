import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { errorKey, sendPasswordReset, signInWithEmail, signInWithGoogle, useAccount } from '../account/account'
import { deleteAccountSynced } from '../account/sync'
import { GoogleButton } from '../components/GoogleButton'
import { ArrowIcon } from '../components/Icons'
import { ScreenBar } from '../components/ScreenBar'
import { useT, type MessageKey } from '../i18n'
import { goBack } from '../state/nav'
import { useSettings } from '../state/settings'
import { useToasts } from '../state/toast'

type Message = { key: MessageKey; vars?: Record<string, string>; bad?: boolean } | null

/** Sign in (Google or email), create an account, reset a password, or delete the account. */
export function AccountScreen({ mode }: { mode: 'signin' | 'delete' }) {
  const t = useT()
  // Portalled so it sits above onboarding on first run, as well as above the tabs.
  return createPortal(
    <div className="overlay account-screen" role="dialog" aria-label={t(mode === 'delete' ? 'account.deleteTitle' : 'account.title')}>
      <main className="page">
        <ScreenBar title={t('account.title')} />
        {mode === 'delete' ? <DeleteAccount /> : <SignIn />}
      </main>
    </div>,
    document.body,
  )
}

function useBusy() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<Message>(null)
  /** Run an account action, turning its errors into a message; returns whether it succeeded. */
  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setMessage(null)
    try {
      await action()
      return true
    } catch (e) {
      const key = errorKey(e)
      if (key) setMessage({ key, bad: true })
      return false
    } finally {
      setBusy(false)
    }
  }
  return { busy, message, setMessage, run }
}

function Feedback({ message }: { message: Message }) {
  const t = useT()
  return (
    <p className={`small account-msg${message?.bad ? ' bad' : ''}`} aria-live="polite">
      {message ? t(message.key, message.vars) : ''}
    </p>
  )
}

function SignIn() {
  const t = useT()
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, message, setMessage, run } = useBusy()

  // Signing in from onboarding finishes onboarding: the account brings the course with it.
  const done = () => {
    useSettings.getState().set({ onboarded: true })
    goBack()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (await run(() => signInWithEmail(email, password, creating))) done()
  }

  const forgot = async () => {
    if (!email.trim()) return setMessage({ key: 'account.needEmail', bad: true })
    if (await run(() => sendPasswordReset(email))) setMessage({ key: 'account.resetSent', vars: { email: email.trim() } })
  }

  return (
    <>
      <div className="titleblock">
        <h1 className="display">{t(creating ? 'account.createTitle' : 'account.signInTitle')}</h1>
        <p className="lede">{t('account.lede')}</p>
      </div>

      <GoogleButton disabled={busy} onClick={async () => (await run(signInWithGoogle)) && done()} />

      <form className="account-form" onSubmit={(e) => void submit(e)}>
        <p className="label account-or">{t('account.orEmail')}</p>
        <label className="small account-field-label" htmlFor="account-email">
          {t('account.email')}
        </label>
        <input
          id="account-email"
          className="field"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="small account-field-label" htmlFor="account-password">
          {t('account.password')}
        </label>
        <input
          id="account-password"
          className="field"
          type="password"
          autoComplete={creating ? 'new-password' : 'current-password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="go account-submit" disabled={busy}>
          {t(creating ? 'account.create' : 'account.signIn')}
          <ArrowIcon />
        </button>
      </form>

      <Feedback message={message} />

      <div className="account-links">
        <button
          type="button"
          className="textlink"
          onClick={() => {
            setCreating((c) => !c)
            setMessage(null)
          }}
        >
          {t(creating ? 'account.toSignIn' : 'account.toCreate')}
        </button>
        {!creating && (
          <button type="button" className="textlink" disabled={busy} onClick={() => void forgot()}>
            {t('account.forgot')}
          </button>
        )}
      </div>

      <p className="tiny account-privacy">{t('account.privacy')}</p>
    </>
  )
}

function DeleteAccount() {
  const t = useT()
  const user = useAccount((s) => s.user)
  const push = useToasts((s) => s.push)
  const [password, setPassword] = useState('')
  const { busy, message, run } = useBusy()
  const withPassword = user?.provider === 'password'

  const confirm = async (e: FormEvent) => {
    e.preventDefault()
    if (await run(() => deleteAccountSynced(withPassword ? password : undefined))) {
      push({ kind: 'info', title: t('account.deleted') })
      goBack()
    }
  }

  return (
    <>
      <div className="titleblock">
        <h1 className="display">{t('account.deleteTitle')}</h1>
        <p className="lede">{t('account.deleteText')}</p>
        {user && <p className="small mono account-email">{user.email}</p>}
      </div>
      <form className="account-form" onSubmit={(e) => void confirm(e)}>
        {withPassword ? (
          <>
            <label className="small account-field-label" htmlFor="account-delete-password">
              {t('account.deletePassword')}
            </label>
            <input
              id="account-delete-password"
              className="field"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        ) : (
          <p className="small">{t('account.deleteGoogle')}</p>
        )}
        <button type="submit" className="go quiet account-delete" disabled={busy}>
          {t('account.deleteGo')}
        </button>
      </form>
      <Feedback message={message} />
    </>
  )
}
